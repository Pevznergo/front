import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyTelegramWebAppData } from '@/lib/telegram-auth'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { initData } = body

        if (!initData) {
            return NextResponse.json({ error: 'No initData provided' }, { status: 400 })
        }

        const isValid = verifyTelegramWebAppData(initData)
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid initData' }, { status: 403 })
        }

        const urlParams = new URLSearchParams(initData)
        const userJson = urlParams.get('user')

        if (!userJson) {
            return NextResponse.json({ error: 'No user data found' }, { status: 400 })
        }

        const user = JSON.parse(userJson)
        const telegramId = user.id

        // Extract start_param for UTM tracking
        const startParam = urlParams.get('start_param') || null

        // Check if user exists
        const existingUser = await sql`SELECT * FROM "User" WHERE "telegramId" = ${telegramId} `

        if (existingUser.length === 0) {
            // Fetch UTM data from QR code if start_param is provided
            let utmSource = null
            let utmMedium = null
            let utmCampaign = null
            let utmContent = null
            let referrerId = null

            if (startParam) {
                // 1. Check if it's a QR Code (Short Link)
                const linkData = await sql`
                    SELECT district, sticker_title, sticker_features, sticker_prizes 
                    FROM short_links 
                    WHERE code = ${startParam}
                `

                if (linkData.length > 0) {
                    utmSource = linkData[0].district || null
                    utmMedium = 'qr'
                    utmCampaign = linkData[0].sticker_title || null
                    utmContent = linkData[0].sticker_features || linkData[0].sticker_prizes || null
                } else {
                    // 2. Check if it's a Referral Code
                    const referrer = await sql`SELECT "telegramId", name FROM "User" WHERE referral_code = ${startParam}`

                    if (referrer.length > 0) {
                        referrerId = referrer[0].telegramId
                        utmSource = 'referral_system'
                        utmMedium = 'user_invite'
                        utmCampaign = referrerId // storage of who invited in campaign for analytics

                        // Award 30 points to Referrer
                        await sql`
                            UPDATE "User" 
                            SET points = COALESCE(points, 0) + 30 
                            WHERE "telegramId" = ${referrerId}
                        `
                    }
                }
            }

            // Generate unique referral code for new user
            const newReferralCode = 'ref_' + Math.random().toString(36).substring(2, 10);

            // Generate email for Telegram user
            const email = `telegram-${telegramId}@telegram.bot`;

            // Create new user with 20 points (for spinning) and UTM data
            await sql`
                INSERT INTO "User"(
                    "telegramId", name, email, points,
                    utm_source, utm_medium, utm_campaign, utm_content, start_param,
                    referral_code,
                    created_at
                )
                VALUES(
                    ${telegramId},
                    ${user.first_name || 'Telegram User'},
                    ${email},
                    20,
                    ${utmSource},
                    ${utmMedium},
                    ${utmCampaign},
                    ${utmContent},
                    ${startParam},
                    ${newReferralCode},
                    CURRENT_TIMESTAMP
                )
            `

            // If invited by someone, record in referrals table
            if (referrerId) {
                try {
                    await sql`
                        INSERT INTO referrals (referrer_id, referred_id, status, reward_amount)
                        VALUES (${referrerId}, ${telegramId}, 'registered', 30)
                    `
                    // Optional: Notification logic could go here
                } catch (e) {
                    console.error("Failed to insert referral record:", e);
                }
            }

            return NextResponse.json({
                user: {
                    ...user,
                    points: 20,
                    balance: 0,
                    daily_streak: 0,
                    last_daily_claim: null,
                    created_at: new Date().toISOString(),
                    utm_source: utmSource,
                    utm_campaign: utmCampaign,
                    referral_code: newReferralCode
                },
                isNew: true,
                message: referrerId ? 'User created + 20 points. Referral bonus awarded.' : 'User created + 20 points'
            })
        } else {
            const currentUser = existingUser[0];
            let points = parseInt(currentUser.points || '0', 10);
            // Check spins_count (raw DB column) to see if user has ever played
            const spins = parseInt(currentUser.spins_count || '0', 10);

            let referralCode = currentUser.referral_code;

            // Generate referral code if missing for existing user
            if (!referralCode) {
                referralCode = 'ref_' + Math.random().toString(36).substring(2, 10);
                await sql`UPDATE "User" SET referral_code = ${referralCode} WHERE "telegramId" = ${telegramId}`;
            }

            // Grant welcome bonus ONLY if user has 0 points AND 0 spins (truly new to WebApp/Game)
            let bonusGranted = false;
            if (points === 0 && spins === 0) {
                points = 20;
                bonusGranted = true;
            }

            // Update last visit and points (if bonus granted)
            await sql`
                UPDATE "User"
                SET last_visit = CURRENT_TIMESTAMP,
                    name = ${user.first_name || 'Telegram User'},
                    points = ${points}
                WHERE "telegramId" = ${telegramId}
            `

            return NextResponse.json({
                user: { ...currentUser, points, referral_code: referralCode },
                isNew: false,
                message: bonusGranted ? 'Welcome bonus: +20 points' : 'Auth successful'
            })
        }

    } catch (error: any) {
        console.error('Auth error:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
