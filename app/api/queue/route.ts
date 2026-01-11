import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== "pevznergo@gmail.com") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { batch, intervalMinutes = 10 } = await req.json();

    if (!Array.isArray(batch) || batch.length === 0) {
        return NextResponse.json({ error: "Batch is empty" }, { status: 400 });
    }

    const now = new Date();
    let addedCount = 0;
    try {
        // Get the last scheduled time to determine start point
        const pendingTasks = await sql`SELECT MAX(scheduled_at) as t FROM chat_creation_queue WHERE status = 'pending'`;

        // Accumulator for scheduling
        // If there are pending tasks, start after the last one.
        // If queue is empty, start from NOW.
        let scheduleAccumulator: Date = pendingTasks[0]?.t ? new Date(pendingTasks[0].t) : new Date();

        // Safety: If last scheduled time is in the past (queue stalled?), reset to NOW to avoid burst
        if (scheduleAccumulator < now) {
            scheduleAccumulator = new Date();
        }

        const isQueueOriginallyEmpty = !pendingTasks[0]?.t;

        for (let i = 0; i < batch.length; i++) {
            const item = batch[i];
            const title = item.title.trim();

            const existingLinks = await sql`SELECT id FROM short_links WHERE reviewer_name = ${title}`;
            if (existingLinks.length > 0) continue;

            const existingQueue = await sql`SELECT id FROM chat_creation_queue WHERE title = ${title} AND status IN ('pending', 'processing', 'completed')`;
            if (existingQueue.length > 0) continue;

            // SCHEDULING LOGIC:
            // 1. If queue was empty AND this is the first item -> Schedule IMMEDIATELY (now)
            // 2. Otherwise -> Add random delay (3-10 minutes) to the accumulator

            if (isQueueOriginallyEmpty && addedCount === 0) {
                // First item of an empty queue: Immediate
                // Ensure a tiny delay (5s) just to let UI settle, or 0.
                scheduleAccumulator = new Date(now.getTime() + 2000);
            } else {
                // Random delay 3-10 minutes
                const delayMinutes = 3 + Math.floor(Math.random() * 8); // 3 to 10
                scheduleAccumulator = new Date(scheduleAccumulator.getTime() + delayMinutes * 60 * 1000);
            }

            await sql`
                INSERT INTO chat_creation_queue (title, district, scheduled_at, status, created_at)
                VALUES (${title}, ${item.district || null}, ${scheduleAccumulator}, 'pending', NOW())
            `;
            addedCount++;
        }

        // Trigger processing in the background (non-blocking)
        if (addedCount > 0) {
            // ... trigger logic ...
            const protocol = req.headers.get("x-forwarded-proto") || "http";
            const host = req.headers.get("host");
            const baseUrl = `${protocol}://${host}`;
            const secret = process.env.APP_SECRET_KEY || "";
            const secretParam = secret ? `?secret=${secret}` : "";

            fetch(`${baseUrl}/api/queue/process${secretParam}`).catch(e => console.error("Trigger error:", e));
        }

        return NextResponse.json({ success: true, count: addedCount, skipped: batch.length - addedCount });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== "pevznergo@gmail.com") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDatabase();

    try {
        const queue = await sql`
            SELECT * FROM chat_creation_queue 
            WHERE status != 'completed' 
            ORDER BY scheduled_at ASC
        `;

        const nextTask = await sql`
            SELECT title, scheduled_at FROM chat_creation_queue 
            WHERE status = 'pending' 
            ORDER BY scheduled_at ASC 
            LIMIT 1
        `;

        return NextResponse.json({
            items: queue,
            nextTask: nextTask[0] || null
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== "pevznergo@gmail.com") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, district, scheduledAt } = await req.json();

    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await initDatabase();

    try {
        await sql`
            UPDATE chat_creation_queue 
            SET 
                title = COALESCE(${title}, title),
                district = COALESCE(${district}, district),
                scheduled_at = COALESCE(${scheduledAt}, scheduled_at)
            WHERE id = ${id}
        `;
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== "pevznergo@gmail.com") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await initDatabase();

    try {
        await sql`DELETE FROM chat_creation_queue WHERE id = ${id}`;
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";
