import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        await initDatabase();

        const searchParams = req.nextUrl.searchParams;
        const showCompleted = searchParams.get('show_completed') === 'true';

        // Fetch topic actions
        // If showCompleted is true, show all pending/failed/processing OR completed in last 24h
        // If showCompleted is false, show only pending/failed/processing
        const topicTasks = await sql`
            SELECT id, chat_id, action_type, status, error, scheduled_for, created_at, payload
            FROM topic_actions_queue
            ${showCompleted
                ? sql`WHERE status IN ('pending', 'processing', 'failed') OR (status = 'completed' AND created_at > NOW() - INTERVAL '24 HOURS')`
                : sql`WHERE status IN ('pending', 'processing', 'failed')`
            }
            ORDER BY created_at DESC
            LIMIT 100
        `;

        // Fetch chat creation tasks
        const createTasks = await sql`
            SELECT id, title, status, error, scheduled_at, created_at
            FROM chat_creation_queue
            ${showCompleted
                ? sql`WHERE status IN ('pending', 'processing', 'failed') OR (status = 'completed' AND created_at > NOW() - INTERVAL '24 HOURS')`
                : sql`WHERE status IN ('pending', 'processing', 'failed')`
            }
            ORDER BY created_at DESC
            LIMIT 100
        `;

        // Normalize and merge
        const unifiedTasks = [
            ...topicTasks.map(t => ({
                unique_id: `topic-${t.id}`,
                id: t.id,
                chat_id: t.chat_id,
                action_type: t.action_type,
                status: t.status,
                error: t.error,
                scheduled_for: t.scheduled_for,
                created_at: t.created_at,
                source: 'topic'
            })),
            ...createTasks.map(t => ({
                unique_id: `create-${t.id}`,
                id: t.id,
                chat_id: 'New Chat',
                action_type: `CREATE: ${t.title}`,
                status: t.status,
                error: t.error,
                scheduled_for: t.scheduled_at,
                created_at: t.created_at,
                source: 'create'
            }))
        ].sort((a, b) => {
            // Sort: Pending/Processing first, then new to old
            const scoreA = (a.status === 'pending' || a.status === 'processing') ? 0 : 1;
            const scoreB = (b.status === 'pending' || b.status === 'processing') ? 0 : 1;
            if (scoreA !== scoreB) return scoreA - scoreB;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }).slice(0, 50);

        return NextResponse.json({ tasks: unifiedTasks });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
