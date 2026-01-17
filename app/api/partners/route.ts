import { NextResponse } from 'next/server'
import { sql, initDatabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Check for DB config before attempting anything
        if (!process.env.POSTGRES_URL) {
            console.error('POSTGRES_URL is not defined')
            return NextResponse.json(
                { error: 'Database configuration missing' },
                { status: 500 }
            )
        }

        // Ensure DB is initialized (tables created, seeded if empty)
        await initDatabase()

        // Fetch all partners
        const partners = await sql`SELECT * FROM partners WHERE is_partner = TRUE ORDER BY id ASC`

        if (partners.length === 0) {
            return NextResponse.json([])
        }

        // Fetch all tariffs for these partners in one query
        const partnerIds = partners.map((p: any) => p.id)
        // Use a safe way to pass array to IN clause, or just fetch all tariffs if list is small
        // For simplicity and safety with neon/postgres driver, we can fetch all tariffs for these partners
        // Constructing a dynamic IN clause can be tricky with template literals, 
        // so we'll fetch all tariffs that belong to any partner and filter in memory if needed, 
        // or use a simple WHERE partner_id IN (...) if the driver supports array params well.
        // Given the scale, fetching all tariffs for active partners is safe.

        const tariffs = await sql`
            SELECT * FROM tariffs 
            WHERE partner_id = ANY(${partnerIds}) 
            ORDER BY price ASC
        `

        // Group tariffs by partner_id
        const tariffsByPartner: Record<number, any[]> = {}
        tariffs.forEach((t: any) => {
            if (!tariffsByPartner[t.partner_id]) {
                tariffsByPartner[t.partner_id] = []
            }
            tariffsByPartner[t.partner_id].push(t)
        })

        // Combine data and calculate discounts
        const partnersWithTariffs = partners.map((partner: any) => {
            const partnerTariffs = tariffsByPartner[partner.id] || []

            // Calculate max discount
            let maxDiscount = 0
            partnerTariffs.forEach((t: any) => {
                const price = Number(t.price)
                const originalPrice = Number(t.original_price)

                if (originalPrice && price && originalPrice > price) {
                    const discount = ((originalPrice - price) / originalPrice) * 100
                    if (discount > maxDiscount) maxDiscount = discount
                }
            })

            // Format discount string (e.g., "50% OFF")
            const discountString = maxDiscount > 0 ? `${Math.round(maxDiscount)}% OFF` : '0% OFF'

            return { ...partner, tariffs: partnerTariffs, discount: discountString }
        })

        return NextResponse.json(partnersWithTariffs)
    } catch (error) {
        console.error('Error fetching partners:', error)
        return NextResponse.json(
            { error: 'Failed to fetch partners', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
