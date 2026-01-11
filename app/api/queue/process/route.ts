import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase, getFloodWait, setFloodWait } from "@/lib/db";
import { createEcosystem } from "@/lib/chat";
import { Bot, InlineKeyboard } from "grammy";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    // Basic protection (can be secret key or admin session)
    const secret = req.headers.get("X-Secret-Key") || req.nextUrl.searchParams.get("secret");
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.email === "pevznergo@gmail.com";

    if (!isAdmin && process.env.APP_SECRET_KEY && secret !== process.env.APP_SECRET_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDatabase();

    // 0. Check Global Flood Wait
    const floodWait = await getFloodWait();
    if (floodWait > 0) {
        return NextResponse.json({
            message: `Global FloodWait active for ${floodWait}s`,
            nextTaskIn: floodWait,
            status: "waiting"
        });
    }

    const force = req.nextUrl.searchParams.get("force") === "true";

    try {
        const now = new Date();

        // 1. Find the oldest pending task
        const pendingTasks = await sql`
            SELECT * FROM unified_queue 
            WHERE status = 'pending' 
            ORDER BY scheduled_at ASC 
            LIMIT 1
        `;

        if (pendingTasks.length === 0) {
            return NextResponse.json({ message: "No pending tasks" });
        }

        const task = pendingTasks[0];
        const scheduledTime = new Date(task.scheduled_at);
        const diffMs = scheduledTime.getTime() - now.getTime();

        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const host = req.headers.get("host");
        const baseUrl = `${protocol}://${host}`;

        const triggerNext = (delayMs = 0) => {
            const secretParam = secret ? `&secret=${secret}` : "";
            // Use a cache-busting timestamp
            const url = `${baseUrl}/api/queue/process?t=${Date.now()}${secretParam}`;
            setTimeout(() => {
                fetch(url).catch(e => console.error("Self-trigger error:", e));
            }, delayMs > 0 ? delayMs : 0);
        };

        // 2. Decide timing
        if (!force && diffMs > 0) {
            if (diffMs < 15000) {
                // Short wait: server-side sleep
                await new Promise(resolve => setTimeout(resolve, diffMs));
            } else {
                // Long wait: return and wake up later
                triggerNext(diffMs + 1000);
                return NextResponse.json({
                    message: `Next task scheduled for later`,
                    nextTaskIn: Math.round(diffMs / 1000),
                    status: "waiting",
                    title: task.payload?.title || task.type
                });
            }
        }

        // 3. Process
        await sql`UPDATE unified_queue SET status = 'processing' WHERE id = ${task.id}`;

        try {
            const { type, payload } = task;

            let resultData: any = {};

            if (type === 'create_chat') {
                const { title, district } = payload;
                const alreadyExists = await sql`SELECT id FROM short_links WHERE reviewer_name = ${title}`;
                if (alreadyExists.length > 0) {
                    throw new Error("Already exists in short_links");
                }
                const res = await createEcosystem(title, district);
                resultData = { chatId: res.chatId };

            } else if (type === 'create_promo') {
                const { chat_id, title } = payload;
                const token = process.env.TELEGRAM_BOT_TOKEN;
                if (!token) throw new Error("Bot token missing");
                const bot = new Bot(token);
                // Handle both raw ID and -100 prefix
                const targetChatId = chat_id.toString().startsWith("-") ? chat_id.toString() : "-100" + chat_id;

                // Wait for rights propagation
                if (!force) await new Promise(r => setTimeout(r, 2000));

                const topic = await bot.api.createForumTopic(targetChatId, title);
                const appLink = "https://t.me/aportomessage_bot/app?startapp=promo";
                const keyboard = new InlineKeyboard().url("🎡 КРУТИТЬ КОЛЕСО", appLink);
                await bot.api.sendMessage(targetChatId, "🎰 **КОЛЕСО ФОРТУНЫ**\n\nНажми на кнопку ниже, чтобы испытать удачу и выиграть призы (iPhone, Ozon, WB).", {
                    message_thread_id: topic.message_thread_id,
                    reply_markup: keyboard,
                    parse_mode: "Markdown",
                });
                resultData = { threadId: topic.message_thread_id };

            } else if (['send_message', 'create_poll'].includes(type)) {
                // Minimal handling for essential task types to support "Run Now" even without worker.js
                // Note: Ideally worker.js handles this using GramJS for "user" actions. 
                // If we are here (API route), we probably don't have the User Client easily unless we rewrite getTelegramClient to be serverless-safe.
                // For now, we will mark these as PENDING-WORKER or just skip re-processing if worker handles them.
                // But since the user wants "Run Now", maybe we should try?
                // Let's assume the worker is the main processor for these.
                // We will simply return success = true (but no-op) so the queue advances? 
                // No, that would lose the task.
                // Let's just leave them as 'pending' if we can't process? No, we set status='processing'.
                // We must revert status to 'pending' if we can't handle it here.
                // So "Run Immediately" for these types will effectively do nothing if worker is dead.
                // But for 'create_chat' and 'create_promo' (Bot API), this route works.

                // Revert status to pending so worker can pick it up
                await sql`UPDATE unified_queue SET status = 'pending' WHERE id = ${task.id}`;
                return NextResponse.json({ message: "Task type requires worker process", type });
            }

            await sql`UPDATE unified_queue SET status = 'completed', error = NULL WHERE id = ${task.id}`;
            triggerNext(2000);

            return NextResponse.json({
                success: true,
                taskId: task.id,
                result: resultData
            });

        } catch (error: any) {
            console.error(`Queue processing error for task ${task.id}:`, error);

            // Turn FloodWait into a valid Date/Interval
            if (error.seconds || error.errorMessage?.startsWith('FLOOD_WAIT_')) {
                const waitSeconds = error.seconds || parseInt(error.errorMessage.split('_')[2], 10) || 60;
                await setFloodWait(waitSeconds);
                await sql`
                    UPDATE unified_queue 
                    SET status = 'pending', 
                        scheduled_at = NOW() + (${waitSeconds} || ' seconds')::INTERVAL,
                        error = ${`FloodWait: ${waitSeconds}s`}
                    WHERE id = ${task.id}
                `;
                triggerNext((waitSeconds * 1000) + 1000);
                return NextResponse.json({ success: false, status: 'postponed', waitSeconds });
            }

            // Handle Duplicates as "Completed with Warning" (Skipped)
            const isDuplicate = error.message && (
                error.message.includes("Duplicate") ||
                error.message.includes("Already exists")
            );

            if (isDuplicate) {
                await sql`UPDATE unified_queue SET status = 'completed', error = ${"Skipped: " + error.message} WHERE id = ${task.id}`;
                return NextResponse.json({ success: true, status: 'skipped', message: error.message });
            }

            await sql`UPDATE unified_queue SET status = 'failed', error = ${error.message} WHERE id = ${task.id}`;
            triggerNext(5000);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
