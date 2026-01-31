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

    // Bot logic - Invite tracking
    bot.on("message:new_chat_members", async (ctx) => {
        const chatId = ctx.chat.id.toString();
        const inviter = ctx.from;
        const newMembers = ctx.message.new_chat_members;

        if (!inviter || !newMembers) return;

        // Don't count if someone joined by themselves (though this event usually implies being added)
        // If they join via link, they are the 'from' and also in 'new_chat_members'.
        // We want to track ADDITIONS, so if inviter is in newMembers, it's a self-join.
        const isSelfJoin = newMembers.some(m => m.id === inviter.id);
        if (isSelfJoin) return;

        try {
            await initDatabase();
            const inviterId = inviter.id.toString();
            const inviterName = inviter.username ? `@${inviter.username}` : `${inviter.first_name || ""} ${inviter.last_name || ""}`.trim() || "User";

            await sql`
                INSERT INTO invite_stats (chat_id, user_id, user_name, invite_count)
                VALUES (${chatId}, ${inviterId}, ${inviterName}, ${newMembers.length})
                ON CONFLICT (chat_id, user_id) 
                DO UPDATE SET 
                    invite_count = invite_stats.invite_count + EXCLUDED.invite_count,
                    user_name = EXCLUDED.user_name,
                    updated_at = CURRENT_TIMESTAMP
            `;
            // Delete the "User joined" message
            try { await ctx.deleteMessage(); } catch (e) { }

            // Update Ecosystem Member Count (+N)
            try {
                // Ensure count doesn't go below 0 (though adding shouldn't cause that)
                await sql`
                    UPDATE ecosystems 
                    SET member_count = COALESCE(member_count, 0) + ${newMembers.length}, 
                        last_updated = CURRENT_TIMESTAMP
                    WHERE tg_chat_id = ${chatId}
                `;
            } catch (e) { console.error("Failed to update join count:", e); }

        } catch (e) {
            console.error("Invite tracking error:", e);
        }
    });

    // Auto-delete other service messages
    const serviceEvents = [
        "message:pinned_message",
        "message:forum_topic_created",
        "message:forum_topic_closed",
        "message:forum_topic_reopened",
        "message:video_chat_started",
        "message:video_chat_ended",
        "message:video_chat_scheduled"
    ];

    // Handle Left Members (Decrement count + Delete message)
    bot.on("message:left_chat_member", async (ctx) => {
        const chatId = ctx.chat.id.toString();
        try {
            await initDatabase();
            await sql`
                UPDATE ecosystems 
                SET member_count = GREATEST(COALESCE(member_count, 0) - 1, 0),
                    last_updated = CURRENT_TIMESTAMP
                WHERE tg_chat_id = ${chatId}
            `;
            await ctx.deleteMessage();
        } catch (e) {
            console.error("Left member error:", e);
        }
    });

    // @ts-ignore
    bot.on(serviceEvents, async (ctx) => {
        try {
            await ctx.deleteMessage();
        } catch (e) {
            // ignore (bot might not be admin or message already deleted)
        }
    });

    // Bot logic - Forwarding
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
