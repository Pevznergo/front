import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Get DB connection info safely
        const dbUrl = process.env.POSTGRES_URL || ''
        let host = 'unknown'
        let database = 'unknown'

        try {
            const url = new URL(dbUrl)
            host = url.hostname
            database = url.pathname.replace('/', '')
        } catch (e) {
            // ignore invalid url
        }

        // Check if columns exist
        let columns = []
        try {
            const result = await sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'partners'
            `
            columns = result.map((r: any) => r.column_name)
        } catch (e) {
            console.error(e)
        }

        return NextResponse.json({
            status: 'ok',
            connected_to: {
                host,
                database
            },
            partners_table_columns: columns,
            has_is_partner: columns.includes('is_partner'),
            has_is_platform: columns.includes('is_platform')
        })
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to check DB',
            details: String(error)
        }, { status: 500 })
    }
}
