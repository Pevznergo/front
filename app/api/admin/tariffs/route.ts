import { NextResponse } from 'next/server'
import { sql, initDatabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET: Fetch all tariffs
export async function GET() {
    try {
        await initDatabase()
        // Join with partners to get partner name for display
        const tariffs = await sql`
            SELECT t.*, p.name as partner_name 
            FROM tariffs t 
            LEFT JOIN partners p ON t.partner_id = p.id 
            ORDER BY t.id DESC
        `
        return NextResponse.json(tariffs)
    } catch (error) {
        console.error('Error fetching tariffs:', error)
        return NextResponse.json({ error: 'Failed to fetch tariffs' }, { status: 500 })
    }
}

// POST: Create a new tariff
export async function POST(request: Request) {
    try {
        await initDatabase()
        const body = await request.json()
        const { name, price, original_price, features, partner_id, type, billing_period } = body

        if (!name || !price || !features || !partner_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Determine type based on partner's is_platform flag
        const partner = await sql`SELECT is_platform FROM partners WHERE id = ${partner_id}`
        const derivedType = partner[0]?.is_platform ? 'platform' : 'partner'

        const result = await sql`
            INSERT INTO tariffs (name, price, original_price, features, partner_id, type, billing_period)
            VALUES (${name}, ${price}, ${original_price || null}, ${features}, ${partner_id}, ${derivedType}, ${billing_period || 'monthly'})
            RETURNING *
        `

        return NextResponse.json(result[0])
    } catch (error) {
        console.error('Error creating tariff:', error)
        return NextResponse.json({ error: 'Failed to create tariff' }, { status: 500 })
    }
}

// PUT: Update a tariff
export async function PUT(request: Request) {
    try {
        await initDatabase()
        const body = await request.json()
        const { id, name, price, original_price, features, billing_period } = body

        if (!id || !name || !price || !features) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const result = await sql`
            UPDATE tariffs 
            SET name = ${name}, 
                price = ${price}, 
                original_price = ${original_price || null}, 
                features = ${features}, 
                billing_period = ${billing_period || 'monthly'}
            WHERE id = ${id}
            RETURNING *
        `

        if (result.length === 0) {
            return NextResponse.json({ error: 'Tariff not found' }, { status: 404 })
        }

        return NextResponse.json(result[0])
    } catch (error) {
        console.error('Error updating tariff:', error)
        return NextResponse.json({ error: 'Failed to update tariff' }, { status: 500 })
    }
}

// DELETE: Delete a tariff
export async function DELETE(request: Request) {
    try {
        await initDatabase()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing tariff ID' }, { status: 400 })
        }

        const result = await sql`DELETE FROM tariffs WHERE id = ${id} RETURNING *`

        if (result.length === 0) {
            return NextResponse.json({ error: 'Tariff not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Tariff deleted successfully' })
    } catch (error) {
        console.error('Error deleting tariff:', error)
        return NextResponse.json({ error: 'Failed to delete tariff' }, { status: 500 })
    }
}
