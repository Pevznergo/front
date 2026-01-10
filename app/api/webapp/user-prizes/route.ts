import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyTelegramWebAppData } from '@/lib/telegram-auth'

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const initData = searchParams.get('initData')

        if (!initData) {
            return NextResponse.json({ error: 'No initData' }, { status: 400 })
        }

        if (!verifyTelegramWebAppData(initData)) {
            return NextResponse.json({ error: 'Invalid auth' }, { status: 403 })
        }

        const urlParams = new URLSearchParams(initData)
        const userJson = urlParams.get('user')
        if (!userJson) return NextResponse.json({ error: 'No user' }, { status: 400 })

        const user = JSON.parse(userJson)
        const telegramId = user.id

        // Fetch User Prizes with Details
        const userPrizes = await sql`
            SELECT 
                up.id as user_prize_id,
                up.won_at,
                up.expiry_at,
                up.promo_code,
                p.name,
                p.description,
                p.image_url,
                p.type,
                p.value
            FROM user_prizes up
            JOIN prizes p ON up.prize_id = p.id
            WHERE up.telegram_id = ${telegramId}
            ORDER BY up.won_at DESC
        `

        // Fetch "Active" Prizes (Can Win)
        const activePrizes = await sql`
            SELECT * FROM prizes 
            WHERE is_active = TRUE AND probability > 0
            ORDER BY probability ASC
        `

        return NextResponse.json({
            userPrizes,
            activePrizes
        })

    } catch (error: any) {
        console.error('User prizes error:', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
