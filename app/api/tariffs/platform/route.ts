import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const tariffs = await sql`SELECT * FROM tariffs WHERE type = 'platform' ORDER BY price ASC`
        return NextResponse.json(tariffs)
    } catch (error) {
        console.error('Error fetching platform tariffs:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tariffs' },
            { status: 500 }
        )
    }
}
