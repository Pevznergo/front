import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const tariffs = await sql`SELECT * FROM tariffs`
        return NextResponse.json(tariffs)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
