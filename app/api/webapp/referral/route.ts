import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyTelegramWebAppData } from '@/lib/telegram-auth'

export const dynamic = 'force-dynamic'

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
            SELECT status, SUM(reward_amount) as amount 
            FROM referrals 
            WHERE referrer_id = ${telegramId}
            GROUP BY status
        `

        // Calculate split earnings
        let earnedPoints = 0;
        let earnedTokens = 0;
        let inviteCount = 0;

        // Get total count separately to be accurate
        const countResult = await sql`SELECT COUNT(*) as count FROM referrals WHERE referrer_id = ${telegramId}`
        inviteCount = parseInt(countResult[0].count || '0', 10);

        referrals.forEach(r => {
            const amt = parseInt(r.amount || '0', 10);
            if (r.status === 'registered') {
                earnedPoints += amt;
            } else if (r.status === 'pro_upgrade') {
                earnedTokens += amt; // Tokens for PRO
            } else if (r.status === 'completed') {
                // If we have other statuses
            }
        });

        // Define Bot Usernames
        const botUsername = process.env.BOT_USERNAME || 'Aporto_bot';
        const appName = 'app'; // Or 'webapp' depending on setup, usually 'app' for direct startapp

        // Construct Target URL (Telegram Deep Link)
        const targetUrl = `https://t.me/${botUsername}/${appName}?startapp=${referralCode}`;

        // Construct Short Link (aporto.tech/r/CODE)
        // We assume the host is aporto.tech or current host. 
        // For local dev it might be localhost:3000/r/...
        // But user specifically asked for "aporto.tech". Use relative or env var for base.
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aporto.tech';
        const referralLink = `${baseUrl}/r/${referralCode}`;

        // Sync to short_links table to enable redirect
        // We do this asynchronously or blocking? Blocking to ensure it works immediately.
        try {
            await sql`
                INSERT INTO short_links (code, target_url, district, sticker_title)
                VALUES (${referralCode}, ${targetUrl}, 'referral_system', 'user_referral')
                ON CONFLICT (code) DO UPDATE SET
                target_url = EXCLUDED.target_url -- Ensure target matches
            `
        } catch (e) {
            console.error("Failed to sync referral short link:", e);
        }

        return NextResponse.json({
            referralCode,
            referralLink, // Now returns https://aporto.tech/r/ref_XXXXX
            inviteCount,
            earnedPoints,
            earnedTokens,
            balance: parseInt(userData[0].balance || '0', 10) // Token balance
        })

    } catch (error: any) {
        console.error('Referral Stats error:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
