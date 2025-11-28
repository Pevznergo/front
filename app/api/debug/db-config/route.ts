import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const dbUrl = process.env.DATABASE_URL || 'NOT_SET'
        const url = new URL(dbUrl)

        return NextResponse.json({
            host: url.hostname,
            database: url.pathname.substring(1),
            user: url.username,
            maskedUrl: dbUrl.replace(/:[^:@]+@/, ':***@') // Mask password
        })
    } catch (error) {
        return NextResponse.json({
            error: 'Invalid DATABASE_URL',
            dbUrl: process.env.DATABASE_URL
        }, { status: 500 })
    }
}
