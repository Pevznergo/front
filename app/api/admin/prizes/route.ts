import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const prizes = await sql`SELECT * FROM prizes ORDER BY id ASC`
        return NextResponse.json(prizes)
    } catch (error) {
        console.error('Error fetching prizes:', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, type, value, probability, image_url, description, quantity } = body

        if (!name || !type || !value) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const newPrize = await sql`
            INSERT INTO prizes (name, type, value, probability, image_url, description, quantity)
            VALUES (${name}, ${type}, ${value}, ${probability || 0}, ${image_url}, ${description}, ${quantity})
            RETURNING *
        `

        return NextResponse.json(newPrize[0])
    } catch (error) {
        console.error('Error creating prize:', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { id, name, type, value, probability, image_url, description, quantity, is_active } = body

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }

        const updatedPrize = await sql`
            UPDATE prizes 
            SET name = ${name}, 
                type = ${type}, 
                value = ${value}, 
                probability = ${probability}, 
                image_url = ${image_url}, 
                description = ${description}, 
                quantity = ${quantity},
                is_active = ${is_active}
            WHERE id = ${id}
            RETURNING *
        `

        return NextResponse.json(updatedPrize[0])
    } catch (error) {
        console.error('Error updating prize:', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }

        // Hard delete for now, or soft delete if preferred. Let's do hard delete to clean up.
        await sql`DELETE FROM prizes WHERE id = ${id}`

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting prize:', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
