import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyTelegramWebAppData } from '@/lib/telegram-auth'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { initData } = body

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

        // 1. Deduct points
        // We use RETURNING to check if update was successful (i.e. user had enough points)
        const deduction = await sql`
      UPDATE app_users 
      SET points = points - 10,
          spins_count = spins_count + 1,
          last_visit = CURRENT_TIMESTAMP
      WHERE telegram_id = ${telegramId} AND points >= 10
      RETURNING points
    `

        if (deduction.length === 0) {
            return NextResponse.json({ error: 'Insufficient points' }, { status: 400 })
        }

        // 2. Select Prize
        const prizes = await sql`
      SELECT * FROM prizes WHERE is_active = TRUE
    `

        if (prizes.length === 0) {
            // Fallback checks
            return NextResponse.json({ error: 'No prizes configured' }, { status: 500 })
        }

        // Weighted Random
        const totalProbability = prizes.reduce((sum: number, p: any) => sum + parseFloat(p.probability), 0)
        let random = Math.random() * totalProbability
        let selectedPrize = prizes[prizes.length - 1] // Fallback

        for (const prize of prizes) {
            random -= parseFloat(prize.probability)
            if (random <= 0) {
                selectedPrize = prize
                break
            }
        }

        // 3. Award Prize
        let finalPoints = deduction[0].points
        let winMessage = `You won ${selectedPrize.name}`

        if (selectedPrize.type === 'points') {
            const pointsWon = parseInt(selectedPrize.value)
            if (!isNaN(pointsWon)) {
                const award = await sql`
            UPDATE app_users 
            SET points = points + ${pointsWon} 
            WHERE telegram_id = ${telegramId}
            RETURNING points
         `
                finalPoints = award[0].points
            }
        }

        // Optional: Log win to a history table (skipping for now based on requirements)

        return NextResponse.json({
            success: true,
            prize: selectedPrize,
            points: finalPoints
        })

    } catch (error: any) {
        console.error('Spin error:', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
