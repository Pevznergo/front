import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyTelegramWebAppData } from '@/lib/telegram-auth'

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const initData = searchParams.get('initData')

        // Fetch "Active" Prizes (Can Win) - PUBLIC INFO
        // Fetch ALL and filter in JS to avoid SQL type mismatches (bool vs int)
        // DEBUG: Fetch ALL prizes to see what's in DB
        const allPrizesDebug = await sql`SELECT * FROM prizes ORDER BY id DESC`

        // Fetch "Active" Prizes (Can Win) - PUBLIC INFO
        // SQL Filter is usually more reliable if schema is correct
        const activePrizes = await sql`
            SELECT * FROM prizes 
            WHERE is_active = TRUE 
            ORDER BY probability ASC
        `

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
            activePrizes,
            debugTotalCount: allPrizesDebug.length,
            debugAllPrizes: allPrizesDebug // Exposed for checking
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        })

    } catch (error: any) {
        console.error('User prizes error:', error)
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
    }
}
