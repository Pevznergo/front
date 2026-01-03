import { NextRequest, NextResponse } from "next/server";
import { getTelegramClient } from "@/lib/tg";
import { Api } from "telegram";
import { sql, initDatabase, getFloodWait } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        await initDatabase();

        // 0. Check Global Flood Wait
        const floodWait = await getFloodWait();
        if (floodWait > 0) {
            return NextResponse.json({
                error: `Global FloodWait active for ${floodWait}s`,
                success: false
            }, { status: 429 });
        }

        const client = await getTelegramClient();

        // 1. Fetch all chats that have a marketplace topic
        const chats = await sql`
            SELECT tg_chat_id, marketplace_topic_id, district 
            FROM short_links 
            WHERE tg_chat_id IS NOT NULL 
            AND marketplace_topic_id IS NOT NULL
        `;

        let totalNewAds = 0;

        for (const chatInfo of chats) {
            const { tg_chat_id, marketplace_topic_id, district } = chatInfo;

            try {
                const channel = await client.getEntity(tg_chat_id);

                // 2. Fetch recent messages from the specific topic
                // In GramJS, we can use getMessages with replyTo filter
                const messages = await client.getMessages(channel, {
                    replyTo: marketplace_topic_id,
                    limit: 50,
                });

                for (const msg of messages) {
                    if (!msg.message || msg.message.trim() === "") continue;

                    // Only process original messages (not replies/pins unless they are ads)
                    // But usually everything in the marketplace topic is an ad.

                    const messageId = msg.id;
                    const content = msg.message;
                    const date = new Date(msg.date * 1000);

                    // 3. Extract sender info
                    let senderUsername = null;
                    let senderId = null;

                    if (msg.fromId && msg.fromId.className === 'PeerUser') {
                        senderId = msg.fromId.userId.toString();
                        try {
                            const sender = await client.getEntity(msg.fromId);
                            if (sender && 'username' in sender) {
                                senderUsername = sender.username;
                            }
                        } catch (e) {
                            console.warn(`Could not fetch sender entity for message ${messageId}:`, e);
                        }
                    }

                    // 4. Upsert into database
                    try {
                        await sql`
                            INSERT INTO market_ads (chat_id, topic_id, message_id, content, sender_username, sender_id, district, created_at)
                            VALUES (${tg_chat_id}, ${marketplace_topic_id}, ${messageId}, ${content}, ${senderUsername}, ${senderId}, ${district}, ${date})
                            ON CONFLICT (chat_id, message_id) DO NOTHING
                        `;
                        totalNewAds++;
                    } catch (dbErr) {
                        // Conflict handled by DO NOTHING, but log other errors
                    }
                }
            } catch (chatErr) {
                console.error(`Error syncing chat ${tg_chat_id}:`, chatErr);
            }
        }

        return NextResponse.json({
            success: true,
            synced_count: totalNewAds
        });

    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
