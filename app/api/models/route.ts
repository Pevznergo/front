import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Select all models from the new table
        const models = await sql`SELECT * FROM models_new ORDER BY name ASC`;
        return NextResponse.json(models);
    } catch (error) {
        console.error("Failed to fetch models for API:", error);
        return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
    }
}
