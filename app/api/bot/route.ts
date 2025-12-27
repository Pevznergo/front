import { NextRequest, NextResponse } from "next/server";
import { Bot, webhookCallback } from "grammy";
import { sql, initDatabase } from "@/lib/db";

// Use environment variables for sensitive info
const token = process.env.TELEGRAM_BOT_TOKEN;
const gatewayChannelId = process.env.MARKET_FORWARD_CHANNEL_ID;

if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is not defined");
}

const bot = new Bot(token || "");

// Bot logic
bot.on("message", async (ctx) => {
    // We only care about messages in specific topics
    const topicId = ctx.message.message_thread_id;
    const chatId = ctx.chat.id.toString();

    if (!topicId) return;

    try {
        await initDatabase();

        // Find if this chat/topic is a registered marketplace
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

            // Format the message for the gateway channel
            const forwardText = `${text}\n\n---\n📍 ${district}\n👤 Для связи: ${username}`;

            if (gatewayChannelId) {
                await bot.api.sendMessage(gatewayChannelId, forwardText);
            }
        }
    } catch (e) {
        console.error("Bot forwarding error:", e);
    }
});

// Next.js Route Handler
export const POST = webhookCallback(bot, "std/http");
export const dynamic = "force-dynamic";
