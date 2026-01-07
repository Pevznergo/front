import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
    try {
        const prizes = await sql`
      SELECT * FROM prizes 
      WHERE is_active = TRUE 
      ORDER BY probability DESC
    `

        return NextResponse.json({
            success: true,
            prizes: prizes
        })
    } catch (error: any) {
        console.error('Fetch prizes error:', error)
        return NextResponse.json({ error: 'Failed to fetch prizes' }, { status: 500 })
    }
}
