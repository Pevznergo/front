import { NextResponse } from 'next/server'
import { sql, initDatabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET: Fetch all partners
export async function GET() {
    try {
        await initDatabase()
        const partners = await sql`SELECT * FROM partners ORDER BY id DESC`
        return NextResponse.json(partners)
    } catch (error) {
        console.error('Error fetching partners:', error)
        return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 })
    }
}

// POST: Create a new partner
export async function POST(request: Request) {
    try {
        await initDatabase()
        const body = await request.json()
        const { name, age, bio, discount, logo, is_platform, is_partner } = body

        if (!name || !age || !bio || !logo) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Insert new partner
        const result = await sql`
            INSERT INTO partners (name, age, bio, discount, logo, is_platform, is_partner)
            VALUES (${name}, ${age}, ${bio}, ${discount || '0%'}, ${logo}, ${is_platform || false}, ${is_partner !== undefined ? is_partner : true})
            RETURNING *
        `

        return NextResponse.json(result[0])
    } catch (error) {
        console.error('Error creating partner:', error)
        return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 })
    }
}

// DELETE: Delete a partner
export async function DELETE(request: Request) {
    try {
        await initDatabase()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing partner ID' }, { status: 400 })
        }

        // Delete associated tariffs first (cascade should handle this, but good to be explicit or safe)
        // Our DB schema didn't specify ON DELETE CASCADE explicitly in the CREATE TABLE string I wrote earlier?
        // Wait, I used `REFERENCES partners(id)`. Default is NO ACTION.
        // So I must delete tariffs first.
        await sql`DELETE FROM tariffs WHERE partner_id = ${id}`

        const result = await sql`DELETE FROM partners WHERE id = ${id} RETURNING *`

        if (result.length === 0) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Partner deleted successfully' })
    } catch (error) {
        console.error('Error deleting partner:', error)
        return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 })
    }
}
