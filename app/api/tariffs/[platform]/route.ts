import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: { platform: string } }
) {
    try {
        const platformName = params.platform

        if (!platformName) {
            return NextResponse.json(
                { error: 'Platform data not found' },
                { status: 400 }
            )
        }

        // Fetch tariffs for the specific platform partner
        const tariffs = await sql`
            SELECT t.* 
            FROM tariffs t
            JOIN partners p ON t.partner_id = p.id
            WHERE LOWER(p.name) = LOWER(${platformName}) AND p.is_platform = TRUE
            ORDER BY t.price ASC
        `

        if (tariffs.length === 0) {
            return NextResponse.json(
                { error: 'Platform data not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(tariffs)
    } catch (error) {
        console.error('Error fetching platform tariffs:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tariffs' },
            { status: 500 }
        )
    }
}
