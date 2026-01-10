import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { validateTelegramWebAppData } from '@/lib/telegram'

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url)
        const initData = url.searchParams.get('initData')

        if (!initData) {
            return NextResponse.json({ error: 'No initData' }, { status: 400 })
        }

        const validation = validateTelegramWebAppData(initData)
        if (!validation.validatedInput) {
            return NextResponse.json({ error: 'Invalid initData' }, { status: 401 })
        }
        const user = validation.validatedInput.user
        if (!user) return NextResponse.json({ error: 'No user' }, { status: 400 })

        // 1. Fetch User Prizes (Only non-points usually shown in "My Prizes")
        // Points are just added to balance, usually people want to see Coupons/Items
        const userPrizes = await sql`
            SELECT up.*, p.name, p.description, p.type, p.value, p.image_url 
            FROM user_prizes up
            JOIN prizes p ON up.prize_id = p.id
            WHERE up.user_id = ${user.id}
            ORDER BY up.won_at DESC
        `

        // 2. Fetch All Available Prizes (for "Possible to win")
        const allPrizes = await sql`
            SELECT * FROM prizes WHERE is_active = TRUE ORDER BY probability ASC
        `

        return NextResponse.json({
            won: userPrizes,
            available: allPrizes
        })

    } catch (e) {
        console.error("Get Prizes error:", e)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
