import { NextRequest, NextResponse } from "next/server";
import { Bot, webhookCallback } from "grammy";
import { sql, initDatabase } from "@/lib/db";

// Use environment variables for sensitive info
let bot: Bot | null = null;

function getBot() {
    if (bot) return bot;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return null;

    bot = new Bot(token);

    // Bot logic
    bot.on("message", async (ctx) => {
        const topicId = ctx.message.message_thread_id;
        const chatId = ctx.chat.id.toString();
        const gatewayChannelId = process.env.MARKET_FORWARD_CHANNEL_ID;

        if (!topicId) return;

        try {
            await initDatabase();

            const links = await sql`
                SELECT district 
                FROM short_links 
                WHERE (tg_chat_id = ${chatId} OR tg_chat_id = ${chatId.replace('-100', '')})
                AND marketplace_topic_id = ${topicId}
                LIMIT 1
            `;

            if (links.length > 0) {
                const district = links[0].district || "Район не указан";
                const text = ctx.message.text || ctx.message.caption || "";
                const username = ctx.from?.username ? `@${ctx.from.username}` : "скрыт";

                const forwardText = `${text}\n\n---\n📍 ${district}\n👤 Для связи: ${username}`;

                if (gatewayChannelId && bot) {
                    await bot.api.sendMessage(gatewayChannelId, forwardText);
                }
            }
        } catch (e) {
            console.error("Bot forwarding error:", e);
        }
    });

    return bot;
}

// Next.js Route Handler
export async function POST(req: NextRequest) {
    const instance = getBot();
    if (!instance) {
        return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
    }
    return webhookCallback(instance, "std/http")(req);
}
export const dynamic = "force-dynamic";
