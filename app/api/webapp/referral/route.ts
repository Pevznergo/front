import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyTelegramWebAppData } from '@/lib/telegram-auth'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const initData = searchParams.get('initData')

        if (!initData) {
            return NextResponse.json({ error: 'No initData provided' }, { status: 400 })
        }

        const isValid = verifyTelegramWebAppData(initData)
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid initData' }, { status: 403 })
        }

        const urlParams = new URLSearchParams(initData)
        const userJson = urlParams.get('user')
        if (!userJson) return NextResponse.json({ error: 'User data not found' }, { status: 400 })

        const user = JSON.parse(userJson)
        const telegramId = user.id

        // Fetch User Referral Data
        const userData = await sql`
            SELECT referral_code, balance 
            FROM "User" 
            WHERE "telegramId" = ${telegramId}
        `

        if (userData.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        let referralCode = userData[0].referral_code;

        // Auto-generate if missing (failsafe)
        if (!referralCode) {
            referralCode = 'ref_' + Math.random().toString(36).substring(2, 10);
            await sql`UPDATE "User" SET referral_code = ${referralCode} WHERE "telegramId" = ${telegramId}`;
        }

        // Get Stats
        const referrals = await sql`
            SELECT COUNT(*) as count, SUM(reward_amount) as total_earned 
            FROM referrals 
            WHERE referrer_id = ${telegramId}
        `

        const inviteCount = parseInt(referrals[0].count || '0', 10);
        // Note: reward_amount in referrals is only points/tokens earned from that specific referral logic?
        // Actually, we track 'reward_amount' in referrals table. 
        // 30 points -> stored in reward_amount? Or is it points?
        // The plan said "reward_amount (INTEGER)".
        // In auth route we used: VALUES (..., 30). So yes.
        // But points are added to User.points. 
        // What about the 1000 tokens? They are added to User.balance.
        // We probably want to sum up earnings for display.

        // Let's assume reward_amount stores points initially. 
        // We might want to sum up separate "earned tokens" if we track them there.
        // For now, let's just return what we have.

        // Get total tokens earned from referrals
        // Since we don't have a separate "referral_earnings" column in User, 
        // we can query the withdrawals or just sum up from referrals table (if we update it on PRO payment).

        // For MVP:
        // Referral Code
        // Invite Link
        // Stats: Invites

        const botUsername = process.env.BOT_USERNAME || 'Aporto_bot'; // Replace with env var or constant
        const referralLink = `https://t.me/${botUsername}/app?startapp=${referralCode}`;

        return NextResponse.json({
            referralCode,
            referralLink,
            inviteCount,
            totalEarned: parseInt(referrals[0].total_earned || '0', 10), // This is sum of points (30) + potentially tokens if we track them here
            balance: parseInt(userData[0].balance || '0', 10) // Current wallet balance (tokens)
        })

    } catch (error: any) {
        console.error('Referral Stats error:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
