import { NextResponse } from 'next/server'
import { sql, initDatabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Ensure DB is initialized (tables created, seeded if empty)
        await initDatabase()

        const partners = await sql`SELECT * FROM partners ORDER BY id ASC`

        // Fetch tariffs for each partner
        const partnersWithTariffs = await Promise.all(partners.map(async (partner) => {
            const tariffs = await sql`SELECT * FROM tariffs WHERE partner_id = ${partner.id} ORDER BY price ASC`
            return { ...partner, tariffs }
        }))

        return NextResponse.json(partnersWithTariffs)
    } catch (error) {
        console.error('Error fetching partners:', error)
        return NextResponse.json(
            { error: 'Failed to fetch partners', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
