import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendTopicMessage, setTopicClosed } from "@/lib/chat";
import { sql } from "@/lib/db";
import { getTelegramClient } from "@/lib/tg";
import { Api } from "telegram";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const ALLOWED_EMAIL = "pevznergo@gmail.com";

    if (!session || session.user?.email !== ALLOWED_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatIds, topicName, message, pin, closedAction } = await req.json();

    if (!chatIds || !Array.isArray(chatIds) || chatIds.length === 0) {
        return NextResponse.json({ error: "No chat IDs provided" }, { status: 400 });
    }

    if (!topicName) {
        return NextResponse.json({ error: "Topic name is required" }, { status: 400 });
    }

    const results = [];
    const client = await getTelegramClient();

    for (const chatId of chatIds) {
        try {
            const entity = await client.getEntity(chatId);

            // 1. Resolve topic ID by name
            const forumTopics = await client.invoke(new Api.channels.GetForumTopics({
                channel: entity,
                limit: 100
            })) as any;

            const topic = forumTopics.topics.find((t: any) => t.title === topicName);

            if (!topic) {
                results.push({ chatId, success: false, error: "Topic not found" });
                continue;
            }

            const topicId = topic.id;

            // 2. Perform message action
            if (message) {
                await sendTopicMessage(chatId, topicId, message, pin);
            }

            // 3. Perform closed action
            // closedAction can be 'close', 'open', or undefined
            if (closedAction === 'close') {
                await setTopicClosed(chatId, topicId, true);
            } else if (closedAction === 'open') {
                await setTopicClosed(chatId, topicId, false);
            }

            results.push({ chatId, success: true });
        } catch (error: any) {
            console.error(`Error processing topic for chat ${chatId}:`, error);
            results.push({ chatId, success: false, error: error.message });
        }
    }

    return NextResponse.json({ success: true, results });
}
