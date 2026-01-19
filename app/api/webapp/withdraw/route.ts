import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyTelegramWebAppData } from '@/lib/telegram-auth'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { initData, amount, contactInfo } = body

        if (!initData) {
            return NextResponse.json({ error: 'No initData provided' }, { status: 400 })
        }

        const isValid = verifyTelegramWebAppData(initData)
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid initData' }, { status: 403 })
        }

        // Parse user from initData
        const urlParams = new URLSearchParams(initData)
        const userJson = urlParams.get('user')
        if (!userJson) return NextResponse.json({ error: 'User data not found' }, { status: 400 })

        const user = JSON.parse(userJson)
        const telegramId = user.id

        // Validate amount
        const withdrawAmount = parseInt(amount, 10);
        if (isNaN(withdrawAmount) || withdrawAmount < 2000) {
            return NextResponse.json({ error: 'Минимальная сумма вывода 2000 токенов' }, { status: 400 })
        }

        // Check user balance
        const userData = await sql`SELECT balance FROM "User" WHERE "telegramId" = ${telegramId}`
        if (userData.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const currentBalance = parseInt(userData[0].balance || '0', 10);

        if (currentBalance < withdrawAmount) {
            return NextResponse.json({ error: 'Недостаточно средств' }, { status: 400 })
        }

        // Perform Withdrawal Transaction
        // 1. Deduct balance
        await sql`
            UPDATE "User" 
            SET balance = balance - ${withdrawAmount}
            WHERE "telegramId" = ${telegramId}
        `

        // 2. Create Withdrawal Request
        await sql`
            INSERT INTO withdrawals (user_id, amount, status, contact_info, created_at)
            VALUES (${telegramId}, ${withdrawAmount}, 'pending', ${contactInfo}, CURRENT_TIMESTAMP)
        `

        return NextResponse.json({
            success: true,
            message: 'Заявка отправлена',
            newBalance: currentBalance - withdrawAmount
        })

    } catch (error: any) {
        console.error('Withdraw error:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
