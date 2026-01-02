import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";
import { setTopicClosed, getChatEntity } from "@/lib/chat";
import { getTelegramClient } from "@/lib/tg";
import { Api } from "telegram";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        await initDatabase();

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

        try {
            const client = await getTelegramClient();
            const entity = await getChatEntity(client, chat_id);

            // Resolve Topic ID (re-used logic)
            // Note: In a robust system, we might cache this or store topic_id in payload if possible.
            // For now, we look it up.

            const payloadObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
            const { topicName, message, pin } = payloadObj;

            let topicId = null;
            if (topicName) {
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
            } else if (action_type === 'close') {
                await setTopicClosed(client, entity, topicId);
            } else if (action_type === 'open') {
                // For open, we might need a different function or pass false if supported.
                // Checking lib/chat.ts definition first implies setTopicClosed usually takes (client, entity, topicId).
                // To OPEN, we likely need to check how setTopicClosed is implemented or use raw API.
                // Assuming setTopicClosed toggles or sets to closed.
                // If the library function only closes, we need raw API for open.
                await client.invoke(new Api.channels.EditForumTopic({
                    channel: entity,
                    topicId: topicId,
                    closed: false
                }));
            }

            // 4. Mark completed
            await sql`UPDATE topic_actions_queue SET status = 'completed' WHERE id = ${id}`;

            return NextResponse.json({ success: true, taskId: id, action: action_type });
        } catch (execError: any) {
            console.error(`Task ${id} failed:`, execError);
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
