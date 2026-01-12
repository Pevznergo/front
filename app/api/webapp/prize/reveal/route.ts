import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { user_prize_id } = await req.json();

        if (!user_prize_id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        await initDatabase();

        // Check if already revealed?
        // We just update revealed_at if it's null
        await sql`
            UPDATE user_prizes 
            SET revealed_at = COALESCE(revealed_at, CURRENT_TIMESTAMP)
            WHERE id = ${user_prize_id}
        `;

        return NextResponse.json({ success: true, revealed_at: new Date() });

    } catch (e: any) {
        console.error("Reveal error:", e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
