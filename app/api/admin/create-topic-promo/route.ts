import { NextRequest, NextResponse } from "next/server";
import { Bot, InlineKeyboard } from "grammy";

// Initialize bot for this specific One-Off action
// We don't use the webhook instance to avoid conflicts, just a fresh API caller
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = token ? new Bot(token) : null;

export async function POST(req: NextRequest) {
    if (!bot) {
        return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
    }

    try {
        const { chatId, topicName = "🎁 Колесо Фортуны" } = await req.json();

        if (!chatId) {
            return NextResponse.json({ error: "Missing chatId" }, { status: 400 });
        }

        // Normalize Chat ID: Ensure it starts with -100 for supergroups if it's a number-like string
        // If the user passed a positive number string like "3550262587", we prepend "-100"
        let targetChatId = chatId.toString();
        if (!targetChatId.startsWith("-") && /^\d+$/.test(targetChatId)) {
            targetChatId = "-100" + targetChatId;
        }

        // 1. Create Forum Topic
        let threadId: number;

        try {
            const topic = await bot.api.createForumTopic(targetChatId, topicName, {
                icon_custom_emoji_id: undefined // Optional: could pass a custom emoji id if known
            });
            threadId = topic.message_thread_id;
        } catch (e: any) {
            console.error("Failed to create topic:", e);
            // Return specific telegram error info if available
            const errorMsg = e.description || e.message || "Unknown error";
            return NextResponse.json({
                error: `Telegram Error: ${errorMsg}. (Ensure bot is Admin & Topics enabled). Target ID: ${targetChatId}`,
                details: e,
                chatId: targetChatId
            }, { status: 500 });
        }

        // 2. Prepare Keyboards
        // Primary: WebApp button (Best UX: opens in-chat)
        const keyboardWebApp = new InlineKeyboard().webApp("🎡 КРУТИТЬ КОЛЕСО", "https://aporto.tech/app");
        // Fallback: Deep Link (Safe: works everywhere, but opens via bot)
        // Adding ?startapp=promo parameter to hint 'auto-start' behavior
        const appLink = "https://t.me/aportomessage_bot/app?startapp=promo";
        const keyboardLink = new InlineKeyboard().url("🎡 КРУТИТЬ КОЛЕСО", appLink);

        // 3. Send Message with Fallback
        try {
            await bot.api.sendMessage(targetChatId, "🎰 **КОЛЕСО ФОРТУНЫ**\n\nНажми на кнопку ниже, чтобы испытать удачу и выиграть призы (iPhone, Ozon, WB).", {
                message_thread_id: threadId,
                reply_markup: keyboardWebApp,
                parse_mode: "Markdown",
            });
        } catch (sendError: any) {
            console.warn("WebApp button failed (likely BUTTON_TYPE_INVALID), falling back to Deep Link:", sendError.message);
            // Fallback to URL button
            await bot.api.sendMessage(targetChatId, "🎰 **КОЛЕСО ФОРТУНЫ**\n\nНажми на кнопку ниже, чтобы испытать удачу и выиграть призы (iPhone, Ozon, WB).", {
                message_thread_id: threadId,
                reply_markup: keyboardLink,
                parse_mode: "Markdown",
            });
        }

        return NextResponse.json({
            success: true,
            threadId,
            message: "Topic created and message sent"
        });

    } catch (error: any) {
        console.error("Promo action error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
