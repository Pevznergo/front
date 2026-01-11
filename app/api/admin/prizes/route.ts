import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const prizes = await sql`SELECT * FROM prizes ORDER BY id ASC`
        return NextResponse.json(prizes, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        })
    } catch (error) {
        console.error('Error fetching prizes:', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const name = formData.get('name') as string
        const type = formData.get('type') as string
        const value = formData.get('value') as string
        const probability = formData.get('probability') as string
        const description = formData.get('description') as string
        const quantity = formData.get('quantity') as string
        const file = formData.get('file') as File | null
        let image_url = formData.get('image_url') as string

        if (!name || !type || !value) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Handle File Upload
        if (file) {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Ensure directory exists
            const uploadDir = join(process.cwd(), 'public/uploads/prizes')
            await mkdir(uploadDir, { recursive: true })

            // Generate unique filename
            const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
            const filepath = join(uploadDir, filename)

            await writeFile(filepath, buffer)
            // Use Dynamic API Route
            image_url = `/api/uploads/prizes/${filename}`
        }

        const newPrize = await sql`
            INSERT INTO prizes (name, type, value, probability, image_url, description, quantity)
            VALUES (${name}, ${type}, ${value}, ${probability || 0}, ${image_url || ''}, ${description || ''}, ${quantity})
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
        const formData = await req.formData()
        const id = formData.get('id') as string
        const name = formData.get('name') as string
        const type = formData.get('type') as string
        const value = formData.get('value') as string
        const probability = formData.get('probability') as string
        const description = formData.get('description') as string
        const quantity = formData.get('quantity') as string
        const is_active = formData.get('is_active') === 'true'
        const file = formData.get('file') as File | null
        let image_url = formData.get('image_url') as string

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }

        // Handle File Upload
        if (file) {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Ensure directory exists
            const uploadDir = join(process.cwd(), 'public/uploads/prizes')
            await mkdir(uploadDir, { recursive: true })

            // Generate unique filename
            const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`
            const filepath = join(uploadDir, filename)

            await writeFile(filepath, buffer)
            // Use Dynamic API Route to serve image immediately without rebuild
            image_url = `/api/uploads/prizes/${filename}`
        }

        const updatedPrize = await sql`
            UPDATE prizes 
            SET name = ${name}, 
                type = ${type}, 
                value = ${value}, 
                probability = ${probability}, 
                image_url = ${image_url || null}, 
                description = ${description || null}, 
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
