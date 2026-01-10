import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET: List all prizes
export async function GET(req: NextRequest) {
    try {
        const prizes = await sql`SELECT * FROM prizes ORDER BY id DESC`
        return NextResponse.json(prizes)
    } catch (e) {
        console.error("Admin Prizes GET Error:", e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST: Create a new prize
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, type, value, probability, quantity, image_url, description, is_active } = body

        // Basic validation
        if (!name || !type || !value) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const result = await sql`
            INSERT INTO prizes (name, type, value, probability, quantity, image_url, description, is_active)
            VALUES (${name}, ${type}, ${value}, ${probability || 0}, ${quantity || 0}, ${image_url || null}, ${description || null}, ${is_active ?? true})
            RETURNING *
        `
        return NextResponse.json(result[0])
    } catch (e) {
        console.error("Admin Prizes POST Error:", e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// PUT: Update an existing prize
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, name, type, value, probability, quantity, image_url, description, is_active } = body

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
        }

        const result = await sql`
            UPDATE prizes
            SET 
                name = ${name}, 
                type = ${type}, 
                value = ${value}, 
                probability = ${probability}, 
                quantity = ${quantity}, 
                image_url = ${image_url}, 
                description = ${description}, 
                is_active = ${is_active}
            WHERE id = ${id}
            RETURNING *
        `

        if (result.length === 0) {
            return NextResponse.json({ error: 'Prize not found' }, { status: 404 })
        }

        return NextResponse.json(result[0])
    } catch (e) {
        console.error("Admin Prizes PUT Error:", e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// DELETE: Delete a prize
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
        }

        await sql`DELETE FROM prizes WHERE id = ${id}`
        return NextResponse.json({ success: true })
    } catch (e) {
        console.error("Admin Prizes DELETE Error:", e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
