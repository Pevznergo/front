import { NextResponse } from 'next/server'
import { sql, initDatabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Ensure DB is initialized (tables created, seeded if empty)
        await initDatabase()

        const partners = await sql`SELECT * FROM partners WHERE is_partner = TRUE ORDER BY id ASC`

        // Fetch tariffs for each partner and calculate dynamic discount
        const partnersWithTariffs = await Promise.all(partners.map(async (partner) => {
            const tariffs = await sql`SELECT * FROM tariffs WHERE partner_id = ${partner.id} ORDER BY price ASC`

            // Calculate max discount
            let maxDiscount = 0
            tariffs.forEach((t: any) => {
                const price = Number(t.price)
                const originalPrice = Number(t.original_price)

                if (originalPrice && price && originalPrice > price) {
                    const discount = ((originalPrice - price) / originalPrice) * 100
                    if (discount > maxDiscount) maxDiscount = discount
                }
            })

            // Format discount string (e.g., "50% OFF")
            const discountString = maxDiscount > 0 ? `${Math.round(maxDiscount)}% OFF` : '0% OFF'

            return { ...partner, tariffs, discount: discountString }
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
