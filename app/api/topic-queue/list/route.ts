import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        await initDatabase();

        const searchParams = req.nextUrl.searchParams;
        const showCompleted = searchParams.get('show_completed') === 'true';

        let tasks;
        if (showCompleted) {
            tasks = await sql`
                SELECT id, type, payload, status, error, scheduled_at, created_at
                FROM unified_queue
                WHERE status != 'completed' 
                   OR (status = 'completed' AND created_at > NOW() - INTERVAL '24 HOURS')
                ORDER BY created_at DESC
                LIMIT 100
            `;
        } else {
            tasks = await sql`
                SELECT id, type, payload, status, error, scheduled_at, created_at
                FROM unified_queue
                WHERE status != 'completed'
                ORDER BY created_at DESC
                LIMIT 100
            `;
        }

        const formattedTasks = tasks.map(t => ({
            unique_id: `task-${t.id}`,
            id: t.id,
            chat_id: t.payload?.chat_id || 'N/A', // Helper to show chat ID if present
            action_type: t.type === 'create_chat' ? `CREATE: ${t.payload?.title}` : t.type,
            status: t.status,
            error: t.error,
            scheduled_for: t.scheduled_at,
            created_at: t.created_at,
            source: 'unified', // Simplified source
            payload: t.payload
        }));

        return NextResponse.json({ tasks: formattedTasks }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
