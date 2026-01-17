import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyTelegramWebAppData } from '@/lib/telegram-auth'

// Rewards by day (0-6 index for 1-7 days)
const REWARDS = [10, 15, 15, 20, 20, 25, 25];

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { initData } = body

        if (!initData) return NextResponse.json({ error: 'No initData' }, { status: 400 })

        const isValid = verifyTelegramWebAppData(initData)
        if (!isValid) return NextResponse.json({ error: 'Invalid initData' }, { status: 403 })

        const urlParams = new URLSearchParams(initData)
        const userJson = urlParams.get('user')
        if (!userJson) return NextResponse.json({ error: 'No user data' }, { status: 400 })

        const user = JSON.parse(userJson)
        const telegramId = user.id

        // Get current user state
        const users = await sql`SELECT * FROM "User" WHERE "telegramId" = ${telegramId}`
        if (users.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const appUser = users[0]
        const now = new Date()
        const lastClaim = appUser.last_daily_claim ? new Date(appUser.last_daily_claim) : null

        // Check availability
        if (lastClaim) {
            const today = new Date().toDateString()
            const claimDay = lastClaim.toDateString()
            if (today === claimDay) {
                return NextResponse.json({ error: 'Already claimed today' }, { status: 400 })
            }
        }

        // Logic for streak
        let newStreak = (appUser.daily_streak || 0);

        if (lastClaim) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            // If last claim was NOT yesterday (and NOT today checked above), reset streak
            if (lastClaim.toDateString() !== yesterday.toDateString()) {
                // Streak broken
                newStreak = 1;
            } else {
                // Consecutive day
                newStreak += 1;
            }
        } else {
            // First time ever
            newStreak = 1;
        }

        // Cap streak at 7, or loop? usually loop or cap. 
        // User requirements: "account for each of 7 days, if missed reset to first".
        // Implies 1..7 cycle. If 8th day -> day 1? Or just max reward?
        // Let's loop for now: Day 8 is Day 1 reward? Or stay at Day 7?
        // Standard game logic: Cap at 7 usually means Day 7 reward repeats, OR loop.
        // Let's assume LOOP 1-7 based on array.
        // If previous streak was 7 -> next is 1.
        if (newStreak > 7) newStreak = 1;

        const rewardIndex = newStreak - 1;
        const rewardPoints = REWARDS[rewardIndex] || 10;

        // Transaction
        await sql`
            UPDATE "User" 
            SET points = points + ${rewardPoints},
                daily_streak = ${newStreak},
                last_daily_claim = CURRENT_TIMESTAMP
            WHERE "telegramId" = ${telegramId}
        `

        return NextResponse.json({
            success: true,
            points: appUser.points + rewardPoints,
            streak: newStreak,
            reward: rewardPoints
        })

    } catch (e: any) {
        console.error("Claim error", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
