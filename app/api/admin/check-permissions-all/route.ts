import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    // Basic auth check - verify if this is needed or if public access with secret key is preferred 
    // adapting to existing patterns in the codebase
    const isAdmin = session?.user?.email === "pevznergo@gmail.com";

    // Allow if admin or if secret key provided (for flexibility/manual triggers)
    const secret = req.headers.get("X-Secret-Key");
    if (!isAdmin && process.env.APP_SECRET_KEY && secret !== process.env.APP_SECRET_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await initDatabase();

        // 1. Fetch all ecosystems with valid chat IDs
        const ecosystems = await sql`
            SELECT tg_chat_id, title 
            FROM ecosystems 
            WHERE tg_chat_id IS NOT NULL 
            AND status != 'архив' -- Skip archived if applicable, otherwise remove this
        `;

        if (ecosystems.length === 0) {
            return NextResponse.json({ message: "No active ecosystems found" });
        }

        // 2. Enqueue tasks
        let addedCount = 0;
        // Start scheduling from now, spaced by 2 seconds
        const startTime = new Date();

        for (let i = 0; i < ecosystems.length; i++) {
            const eco = ecosystems[i];
            const delaySeconds = i * 2; // 2 seconds spacing

            await sql`
                INSERT INTO unified_queue (type, payload, status, scheduled_at)
                VALUES (
                    'update_chat_permissions',
                    ${JSON.stringify({ chat_id: eco.tg_chat_id, title: eco.title })},
                    'pending',
                    NOW() + (${delaySeconds} || ' seconds')::INTERVAL
                )
            `;
            addedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Enqueued ${addedCount} permission check tasks`,
            count: addedCount
        });

    } catch (error: any) {
        console.error("Bulk enqueue error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
