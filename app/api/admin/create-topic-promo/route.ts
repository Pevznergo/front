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

        // 1. Create Forum Topic
        let threadId: number;

        try {
            const topic = await bot.api.createForumTopic(chatId, topicName, {
                icon_custom_emoji_id: undefined // Optional: could pass a custom emoji id if known
            });
            threadId = topic.message_thread_id;
        } catch (e: any) {
            console.error("Failed to create topic:", e);
            // If topic creation fails (e.g. not a supergroup, or not enough rights), we might want to fail hard?
            // Or maybe fallback to general? No, usually explicitly requested.
            return NextResponse.json({ error: "Failed to create topic. Ensure bot is admin and group is a Supergroup with Topics enabled.", details: e.message }, { status: 500 });
        }

        // 2. Prepare Keyboard
        const keyboard = new InlineKeyboard().webApp("🎡 КРУТИТЬ КОЛЕСО", "https://aporto.tech/app");

        // 3. Send Message
        await bot.api.sendMessage(chatId, "🎰 **КОЛЕСО ФОРТУНЫ**\n\nНажми на кнопку ниже, чтобы испытать удачу и выиграть призы (iPhone, Ozon, WB).", {
            message_thread_id: threadId,
            reply_markup: keyboard,
            parse_mode: "Markdown",
        });

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
