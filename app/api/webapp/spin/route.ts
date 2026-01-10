import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyTelegramWebAppData } from '@/lib/telegram-auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
    try {
        const { initData } = await req.json()

        if (!initData) {
            return NextResponse.json({ error: 'No initData' }, { status: 400 })
        }

        const isValid = verifyTelegramWebAppData(initData)
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid initData' }, { status: 401 })
        }

        const urlParams = new URLSearchParams(initData)
        const userJson = urlParams.get('user')
        if (!userJson) {
            return NextResponse.json({ error: 'No user data' }, { status: 400 })
        }

        const user = JSON.parse(userJson)
        const telegramId = user.id

        // 1. Check Points
        const userRes = await sql`SELECT points FROM app_users WHERE telegram_id = ${telegramId}`
        if (userRes.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (userRes[0].points < 10) {
            return NextResponse.json({ error: 'Not enough points' }, { status: 400 })
        }

        // 2. Fetch Active Prizes
        const prizes = await sql`SELECT * FROM prizes WHERE is_active = TRUE`

        // 3. Random Selection (Weighted)
        const totalWeight = prizes.reduce((sum, p) => sum + parseFloat(p.probability), 0)
        let random = Math.random() * totalWeight
        let selectedPrize = prizes[0]

        for (const prize of prizes) {
            if (random < parseFloat(prize.probability)) {
                selectedPrize = prize
                break
            }
            random -= parseFloat(prize.probability)
        }

        // 4. Update DB Transaction-like
        // Deduct points
        await sql`UPDATE app_users SET points = points - 10, spins_count = spins_count + 1 WHERE telegram_id = ${telegramId}`

        let newPoints = userRes[0].points - 10

        // If prize is points, add them
        if (selectedPrize.type === 'points') {
            const pointsValue = parseInt(selectedPrize.value)
            await sql`UPDATE app_users SET points = points + ${pointsValue} WHERE telegram_id = ${telegramId}`
            newPoints += pointsValue
        } else {
            // Record physical/coupon prize
            await sql`
                INSERT INTO user_prizes (user_id, prize_id, status, expiry_date, code)
                VALUES (
                    ${telegramId}, 
                    ${selectedPrize.id}, 
                    'active', 
                    NOW() + INTERVAL '24 hours',
                    upper(substring(md5(random()::text), 1, 8)) -- Generate simple random code
                )
            `
        }

        return NextResponse.json({
            success: true,
            prize: selectedPrize,
            points: newPoints
        })

    } catch (e) {
        console.error("Spin error:", e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
