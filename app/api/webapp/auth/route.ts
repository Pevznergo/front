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

        // Check if user exists
        const existingUser = await sql`SELECT * FROM app_users WHERE telegram_id = ${telegramId} `

        if (existingUser.length === 0) {
            // Create new user with 20 points
            await sql`
        INSERT INTO app_users(telegram_id, first_name, last_name, username, points)
VALUES(
    ${telegramId},
    ${user.first_name || ''},
    ${user.last_name || ''},
    ${user.username || ''},
    20
)
    `
            return NextResponse.json({
                user: { ...user, points: 20 },
                isNew: true,
                message: 'User created users + 20 points'
            })
        } else {
            // Update last visit
            await sql`
        UPDATE app_users 
        SET last_visit = CURRENT_TIMESTAMP,
    first_name = ${user.first_name || ''},
last_name = ${user.last_name || ''},
username = ${user.username || ''}
        WHERE telegram_id = ${telegramId}
`
            return NextResponse.json({
                user: existingUser[0],
                isNew: false
            })
        }

    } catch (error: any) {
        console.error('Auth error:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
