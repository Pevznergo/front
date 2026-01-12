import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.email === "pevznergo@gmail.com";

    const secret = req.headers.get("X-Secret-Key");
    if (!isAdmin && process.env.APP_SECRET_KEY && secret !== process.env.APP_SECRET_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await initDatabase();

        const ecosystems = await sql`
            SELECT tg_chat_id, title 
            FROM ecosystems 
            WHERE tg_chat_id IS NOT NULL 
        `;

        if (ecosystems.length === 0) {
            return NextResponse.json({ message: "No active ecosystems found" });
        }

        let addedCount = 0;
        const now = new Date();

        // Target settings
        const oldTopicName = "🛒 БАРАХОЛКА";
        const newTopicName = "🛒 Скидки и Промокоды"; // Normalized casing
        const messageText = "Промокод скидку 30% на канцелярию в Еноте, действует 24 часа, если кому то нужно, пишите в личку.";

        for (let i = 0; i < ecosystems.length; i++) {
            const eco = ecosystems[i];

            // Time staggering: 2 seconds per chat
            const delaySeconds = i * 2;

            // 1. Rename Topic
            await sql`
                INSERT INTO unified_queue (type, payload, status, scheduled_at)
                VALUES (
                    'rename_topic',
                    ${JSON.stringify({
                chat_id: eco.tg_chat_id,
                topicName: oldTopicName,
                newTitle: newTopicName
            })},
                    'pending',
                    NOW() + (${delaySeconds} || ' seconds')::INTERVAL
                )
            `;

            // 2. Send Message (1 second after rename)
            await sql`
                INSERT INTO unified_queue (type, payload, status, scheduled_at)
                VALUES (
                    'send_message',
                    ${JSON.stringify({
                chat_id: eco.tg_chat_id,
                topicName: newTopicName, // Send to the NEW name (as we just renamed it, but retrieval by name might need match)
                // Actually, if we use topicName logic in worker, it fetches topics. 
                // If rename happens first, the topic will have new name.
                // So targeting 'newTopicName' is safer if they run sequentially. 
                // But wait, if rename fails (e.g. topic not found), send_message to new name will also fail.
                // It is better to use topicName.
                message: messageText
            })},
                    'pending',
                    NOW() + (${delaySeconds + 1} || ' seconds')::INTERVAL
                )
            `;
            addedCount += 2;
        }

        return NextResponse.json({
            success: true,
            message: `Enqueued ${addedCount} tasks (Rename + Message) for ${ecosystems.length} chats.`,
            count: addedCount
        });

    } catch (error: any) {
        console.error("Campaign enqueue error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
