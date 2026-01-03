import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        await initDatabase();

        // Fetch tasks: pending/processing first, then completed/failed (limit 50)
        // We want to see active tasks + recent history
        const tasks = await sql`
            SELECT id, chat_id, action_type, status, error, scheduled_for, created_at, payload
            FROM topic_actions_queue
            ORDER BY 
                CASE WHEN status IN ('pending', 'processing') THEN 0 ELSE 1 END,
                created_at DESC
            LIMIT 50
        `;

        return NextResponse.json({ tasks });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
