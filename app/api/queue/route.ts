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

    await initDatabase();

    const now = new Date();
    try {
        for (let i = 0; i < batch.length; i++) {
            const item = batch[i];
            // Spasmodic scheduling: base interval + some randomness
            const offsetMs = (i * intervalMinutes * 60 * 1000) + (Math.random() * 5 * 60 * 1000);
            const scheduledAt = new Date(now.getTime() + offsetMs);

            await sql`
                INSERT INTO chat_creation_queue (title, district, scheduled_at, status)
                VALUES (${item.title}, ${item.district || null}, ${scheduledAt}, 'pending')
            `;
        }

        return NextResponse.json({ success: true, count: batch.length });
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
