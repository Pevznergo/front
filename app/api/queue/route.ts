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
        // Check if there are any active tasks in the queue
        const activeTasks = await sql`SELECT id FROM chat_creation_queue WHERE status IN ('pending', 'processing')`;
        const isQueueEmpty = activeTasks.length === 0;

        for (let i = 0; i < batch.length; i++) {
            const item = batch[i];
            const title = item.title.trim();

            const existingLinks = await sql`SELECT id FROM short_links WHERE reviewer_name = ${title}`;
            if (existingLinks.length > 0) continue;

            const existingQueue = await sql`SELECT id FROM chat_creation_queue WHERE title = ${title} AND status IN ('pending', 'processing', 'completed')`;
            if (existingQueue.length > 0) continue;

            // If queue is empty, schedule the first added item immediately
            let scheduledAt: Date;
            if (isQueueEmpty && addedCount === 0) {
                scheduledAt = new Date(now.getTime() - 1000); // 1 second in the past to ensure it's due
            } else {
                const offsetMs = (addedCount * intervalMinutes * 60 * 1000) + (Math.random() * 5 * 60 * 1000);
                scheduledAt = new Date(now.getTime() + offsetMs);
            }

            await sql`
                INSERT INTO chat_creation_queue (title, district, scheduled_at, status)
                VALUES (${title}, ${item.district || null}, ${scheduledAt}, 'pending')
            `;
            addedCount++;
        }

        // Trigger processing in the background (non-blocking)
        if (addedCount > 0) {
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
        return NextResponse.json(queue);
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
