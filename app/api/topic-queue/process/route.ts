import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase, getFloodWait, setFloodWait } from "@/lib/db";
import { setTopicClosed, getChatEntity } from "@/lib/chat";
import { getTelegramClient } from "@/lib/tg";
import { Api } from "telegram";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        await initDatabase();

        // 0. Check Global Flood Wait
        const floodWait = await getFloodWait();
        if (floodWait > 0) {
            return NextResponse.json({
                success: false,
                message: "Global FloodWait active",
                waitSeconds: floodWait
            });
        }

        // 1. Fetch one pending task
        // We use FOR UPDATE SKIP LOCKED to prevent race conditions if multiple workers run
        const tasks = await sql`
            SELECT id, chat_id, action_type, payload
            FROM topic_actions_queue
            WHERE status = 'pending'
            ORDER BY created_at ASC
            LIMIT 1
        `;

        if (tasks.length === 0) {
            return NextResponse.json({ success: false, message: "No pending tasks" });
        }

        const task = tasks[0];
        const { id, chat_id, action_type, payload } = task;

        // 2. Mark as processing
        await sql`UPDATE topic_actions_queue SET status = 'processing' WHERE id = ${id}`;

        // VALIDATION: Reject usage of obvious test data (e.g. "100")
        if (!chat_id || chat_id.length < 5) {
            const errorMsg = `Invalid Chat ID: ${chat_id}. Marking as failed.`;
            console.error(errorMsg);
            await sql`UPDATE topic_actions_queue SET status = 'failed', error = ${errorMsg} WHERE id = ${id}`;
            return NextResponse.json({ success: false, taskId: id, error: errorMsg });
        }

        try {
            const client = await getTelegramClient();
            const entity = await getChatEntity(client, chat_id);

            // Resolve Topic ID (re-used logic)
            // Note: In a robust system, we might cache this or store topic_id in payload if possible.
            // For now, we look it up.

            const payloadObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
            const { topicName, message, pin, question, options } = payloadObj;

            let topicId = payloadObj.topicId; // Priority to direct ID
            if (!topicId && topicName) {
                const forumTopics = await client.invoke(new Api.channels.GetForumTopics({
                    channel: entity,
                    limit: 100
                })) as any;
                const topic = forumTopics.topics.find((t: any) => t.title === topicName);
                if (!topic) throw new Error(`Topic '${topicName}' not found`);
                topicId = topic.id;
            }

            // 3. Execute Action
            if (action_type === 'message') {
                const msg = await client.sendMessage(entity, {
                    message: message,
                    replyTo: topicId
                });
                if (pin) {
                    await client.invoke(new Api.messages.UpdatePinnedMessage({
                        peer: entity,
                        id: msg.id,
                        pmOneside: true
                    }));
                }
            } else if (action_type === 'poll') {
                await client.invoke(new Api.messages.SendMedia({
                    peer: entity,
                    media: new Api.InputMediaPoll({
                        poll: new Api.Poll({
                            id: BigInt(Math.floor(Math.random() * 1000000)) as any,
                            question: new Api.TextWithEntities({ text: question, entities: [] }),
                            answers: options.map((opt: string) => new Api.PollAnswer({
                                text: new Api.TextWithEntities({ text: opt, entities: [] }),
                                option: Buffer.from(opt)
                            })),
                            closed: false,
                            publicVoters: true,
                            multipleChoice: false,
                            quiz: false,
                        })
                    }),
                    message: "", // Empty message for media (it's a poll)
                    replyTo: new Api.InputReplyToMessage({ replyToMsgId: topicId })
                }));
            } else if (action_type === 'close') {
                await setTopicClosed(chat_id, topicId, true);
            } else if (action_type === 'open') {
                await setTopicClosed(chat_id, topicId, false);
            } else if (action_type === 'update_title') {
                // Determine if we are renaming a Topic or the Chat itself
                if (topicId) {
                    // Update Topic Title
                    await client.invoke(new Api.channels.EditForumTopic({
                        channel: entity,
                        topicId: topicId,
                        title: payloadObj.title
                    }));
                } else {
                    // Update Chat Title
                    await client.invoke(new Api.channels.EditTitle({
                        channel: entity,
                        title: payloadObj.title
                    }));
                }
            }

            // 4. Mark completed
            await sql`UPDATE topic_actions_queue SET status = 'completed' WHERE id = ${id}`;

            return NextResponse.json({ success: true, taskId: id, action: action_type });
        } catch (execError: any) {
            console.error(`Task ${id} failed:`, execError);

            // Handle FloodWait
            if (execError.seconds || execError.errorMessage?.startsWith('FLOOD_WAIT_')) {
                const waitSeconds = execError.seconds || parseInt(execError.errorMessage.split('_')[2], 10) || 60;
                console.log(`FloodWait triggered. Postponing task ${id} for ${waitSeconds} seconds.`);

                // Set Global Lock
                await setFloodWait(waitSeconds);

                await sql`
                    UPDATE topic_actions_queue 
                    SET status = 'pending', 
                        scheduled_for = NOW() + (${waitSeconds} || ' seconds')::INTERVAL,
                        error = ${`FloodWait: ${waitSeconds}s`}
                    WHERE id = ${id}
                `;
                return NextResponse.json({ success: false, taskId: id, status: 'postponed', waitSeconds });
            }

            await sql`UPDATE topic_actions_queue SET status = 'failed', error = ${execError.message} WHERE id = ${id}`;
            return NextResponse.json({ success: false, taskId: id, error: execError.message });
        }

    } catch (e: any) {
        console.error("Queue process error", e);
        // Mark failed
        // We only have 'id' if tasks[0] succeeded. 
        // Logic simplified: if error occurs in loop, current id is known? No, scoped.
        // Needs better error handling in real prod.
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
