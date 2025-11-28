import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Fetch tariffs for the platform partner (Vibeflow)
        const tariffs = await sql`
            SELECT t.* 
            FROM tariffs t
            JOIN partners p ON t.partner_id = p.id
            WHERE p.is_platform = TRUE
            ORDER BY t.price ASC
        `
        return NextResponse.json(tariffs)
    } catch (error) {
        console.error('Error fetching platform tariffs:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tariffs' },
            { status: 500 }
        )
    }
}
