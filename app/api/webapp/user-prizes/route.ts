import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyTelegramWebAppData } from '@/lib/telegram-auth'

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const initData = searchParams.get('initData')

        // Fetch "Active" Prizes (Can Win) - PUBLIC INFO
        // Fetch ALL and filter in JS to avoid SQL type mismatches (bool vs int)
        const allPrizes = await sql`
            SELECT * FROM prizes 
            ORDER BY probability ASC
        `
        const activePrizes = allPrizes.filter((p: any) => p.is_active === true || p.is_active === 1 || p.is_active === 'true');
        // Removed "AND probability > 0" to show all active prizes even if prob is 0 (e.g. manual grant)
        // Or if you want to hide 0 prob items from "Can Win", keep it. The user said "not show prizes", maybe they put 0?
        // Let's keep it lenient: show all active.
        // Actually, the Wheel needs prob > 0 to spin? 
        // Let's stick to showing ALL active prizes in the "Can Win" list.
        // But for Wheel logic (processed in backend /spin), it uses prob.
        // Let's ensure the SQL is: SELECT * FROM prizes WHERE is_active = TRUE ORDER BY probability ASC

        let userPrizes: any[] = []

        // If Auth is valid, fetch User Prizes
        if (initData && verifyTelegramWebAppData(initData)) {
            const urlParams = new URLSearchParams(initData)
            const userJson = urlParams.get('user')
            if (userJson) {
                const user = JSON.parse(userJson)
                const telegramId = user.id

                userPrizes = await sql`
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
            }
        }

        return NextResponse.json({
            userPrizes,
            activePrizes
        })

    } catch (error: any) {
        console.error('User prizes error:', error)
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
    }
}
