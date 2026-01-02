import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sql, initDatabase } from "@/lib/db";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const ALLOWED_EMAIL = "pevznergo@gmail.com";

    if (!session || session.user?.email !== ALLOWED_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await initDatabase();
        const { chatIds, action, message, topicName, pin, closedAction } = await req.json(); // topicName is required

        if (!chatIds || !Array.isArray(chatIds) || chatIds.length === 0) {
            return NextResponse.json({ error: "No chat IDs provided" }, { status: 400 });
        }

        // Action type handling
        // We normalize the frontend "closedAction" to our queue action types
        // If message is present => 'message'
        // If closedAction is present => 'close' or 'open'

        const queueItems = [];

        for (const chatId of chatIds) {
            // Priority 1: Send Message
            if (message) {
                queueItems.push({
                    chat_id: chatId,
                    action_type: 'message',
                    payload: JSON.stringify({ message, topicName, pin }),
                    status: 'pending'
                });
            }

            // Priority 2: Close/Open
            if (closedAction) {
                queueItems.push({
                    chat_id: chatId,
                    action_type: closedAction === 'open' ? 'open' : 'close',
                    payload: JSON.stringify({ topicName }),
                    status: 'pending'
                });
            }
        }

        // Bulk Insert (or loop)
        for (const item of queueItems) {
            await sql`
                INSERT INTO topic_actions_queue (chat_id, action_type, payload, status)
                VALUES (${item.chat_id}, ${item.action_type}, ${item.payload}, ${item.status})
            `;
        }

        return NextResponse.json({ success: true, count: queueItems.length });

    } catch (e: any) {
        console.error("Queue add error", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
