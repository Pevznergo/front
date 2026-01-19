import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { initDatabase } from "@/lib/db";

// Task Definitions
const TASKS = [
    {
        id: 'sub_channel_news',
        title: 'Подпишись на канал',
        description: 'Новости и обновления Aporto',
        reward: 100,
        type: 'social',
        link: 'https://t.me/aporto_news', // Replace with actual channel
        icon: 'Megaphone'
    },
    {
        id: 'join_chat_community',
        title: 'Вступай в чат',
        description: 'Общение с сообществом',
        reward: 100,
        type: 'social',
        link: 'https://t.me/aporto_community', // Replace with actual chat
        icon: 'MessageCircle'
    },
    // Daily task is handled separately via specific logic/UI but can be listed here if needed
    // Profile tasks can also be checked dynamically
];

export async function GET(req: NextRequest) {
    try {
        await initDatabase();

        // Auth check via initData (simplified for now, ideally verify signature)
        const url = new URL(req.url);
        const userHeader = req.headers.get('X-Telegram-User'); // Or extract from initData search param

        // For MVP, we might expect user_id in searchParams if not using full auth middleware yet
        // But better to use the same logic as auth route. 
        // Let's assume the client sends userId in query for this MVP step or we rely on session if cookies work in WebApp (often they don't without setting SameSite=None)
        // Let's stick to reading from searchParams "userId" for simplicity if trusted source, 
        // OR better: rely on the fact that the WebApp sends user data.

        const userId = url.searchParams.get("userId"); // Telegram ID

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        // 1. Get completed tasks
        const completed = await sql`SELECT task_id FROM user_tasks WHERE user_id = ${userId}`;
        const completedIds = new Set(completed.map(row => row.task_id));

        // 2. Check Daily Streak Status
        const user = await sql`SELECT daily_streak, last_daily_claim FROM "User" WHERE "telegramId" = ${userId}`;
        let dailyStatus = {
            canClaim: true,
            currentStreak: 0,
            nextReward: 10,
            lastClaimDate: null
        };

        if (user.length > 0) {
            dailyStatus.currentStreak = user[0].daily_streak || 0;
            const lastClaim = user[0].last_daily_claim ? new Date(user[0].last_daily_claim) : null;

            if (lastClaim) {
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - lastClaim.getTime());
                const diffHours = diffTime / (1000 * 60 * 60);

                // If claimed less than 24h ago (simplified logic, ideally check calendar day)
                // Better logic: reset at midnight or just 24h window
                // Let's use simple 20h window to be friendly
                const isSameDay = now.toDateString() === lastClaim.toDateString();
                if (isSameDay) {
                    dailyStatus.canClaim = false;
                }
            }
            // Calc reward: (streak + 1) * 10, max 100? Or just 10, 20, 30...
            dailyStatus.nextReward = Math.min((dailyStatus.currentStreak + 1) * 10, 100);
        }

        // 3. Format response
        const tasksWithStatus = TASKS.map(task => ({
            ...task,
            isCompleted: completedIds.has(task.id),
        }));

        return NextResponse.json({
            tasks: tasksWithStatus,
            daily: dailyStatus
        });

    } catch (e: any) {
        console.error("Tasks API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await initDatabase();
        const body = await req.json();
        const { userId, taskId, SECRET_KEY } = body;

        // Basic security check (frontend should send a static secret or initData signature)
        // For now, we trust the client in this MVP loop

        if (!userId || !taskId) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // Handle Daily Claim Special Case
        if (taskId === 'daily_checkin') {
            const user = await sql`SELECT daily_streak, last_daily_claim, points FROM "User" WHERE "telegramId" = ${userId}`;
            if (user.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

            const lastClaim = user[0].last_daily_claim ? new Date(user[0].last_daily_claim) : null;
            const now = new Date();

            // Check valid claim
            if (lastClaim && now.toDateString() === lastClaim.toDateString()) {
                return NextResponse.json({ error: "Already claimed today" }, { status: 400 });
            }

            // Update Streak
            let newStreak = (user[0].daily_streak || 0) + 1;

            // Reset streak if missed a day (check if last claim was > 48h ago)
            if (lastClaim) {
                const diffTime = Math.abs(now.getTime() - lastClaim.getTime());
                const diffHours = diffTime / (1000 * 60 * 60);
                if (diffHours > 48) newStreak = 1;
            }

            const reward = Math.min(newStreak * 10, 100); // Max 100 per day

            // Update User
            await sql`
                UPDATE "User" 
                SET daily_streak = ${newStreak}, 
                    last_daily_claim = NOW(),
                    points = points + ${reward}
                WHERE "telegramId" = ${userId}
             `;

            return NextResponse.json({ success: true, reward, newStreak, message: "Daily reward claimed!" });
        }

        // Handle Standard Tasks
        const taskDef = TASKS.find(t => t.id === taskId);
        if (!taskDef) {
            return NextResponse.json({ error: "Invalid task" }, { status: 400 });
        }

        // Check availability
        const check = await sql`SELECT 1 FROM user_tasks WHERE user_id = ${userId} AND task_id = ${taskId}`;
        if (check.length > 0) {
            return NextResponse.json({ error: "Task already completed" }, { status: 400 });
        }

        // Complete Task
        await sql`
            INSERT INTO user_tasks (user_id, task_id) 
            VALUES (${userId}, ${taskId})
        `;

        // Award Points
        await sql`
            UPDATE "User" 
            SET points = points + ${taskDef.reward} 
            WHERE "telegramId" = ${userId}
        `;

        return NextResponse.json({ success: true, reward: taskDef.reward, message: "Task completed!" });

    } catch (e: any) {
        console.error("Tasks Complete Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
