import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";
import { createEcosystem } from "@/lib/chat";

export async function GET(req: NextRequest) {
    // Basic protection (could use a secret key for production cron)
    const secret = req.headers.get("X-Secret-Key") || req.nextUrl.searchParams.get("secret");
    if (process.env.APP_SECRET_KEY && secret !== process.env.APP_SECRET_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDatabase();

    try {
        // 1. Find the oldest pending task that is due
        const now = new Date();
        const pendingTasks = await sql`
            SELECT * FROM chat_creation_queue 
            WHERE status = 'pending' 
            AND scheduled_at <= ${now} 
            ORDER BY scheduled_at ASC 
            LIMIT 1
        `;

        if (pendingTasks.length === 0) {
            return NextResponse.json({ message: "No pending tasks due" });
        }

        const task = pendingTasks[0];

        // 2. Mark as processing (to avoid concurrent issues, though single cron is safe)
        await sql`UPDATE chat_creation_queue SET status = 'processing' WHERE id = ${task.id}`;

        try {
            // 2.5 Just-in-time duplication check
            const alreadyExists = await sql`SELECT id FROM short_links WHERE reviewer_name = ${task.title}`;
            if (alreadyExists.length > 0) {
                await sql`UPDATE chat_creation_queue SET status = 'completed', error = 'Already exists in short_links' WHERE id = ${task.id}`;
                return NextResponse.json({
                    success: true,
                    message: "Skipped: already exists",
                    taskId: task.id
                });
            }

            // 3. Execute creation
            const result = await createEcosystem(task.title, task.district);

            // 4. Mark as completed
            await sql`
                UPDATE chat_creation_queue 
                SET status = 'completed', error = NULL 
                WHERE id = ${task.id}
            `;

            return NextResponse.json({
                success: true,
                taskId: task.id,
                chatId: result.chatId
            });

        } catch (error: any) {
            console.error(`Queue processing error for task ${task.id}:`, error);

            // 5. Mark as failed
            await sql`
                UPDATE chat_creation_queue 
                SET status = 'failed', error = ${error.message} 
                WHERE id = ${task.id}
            `;

            return NextResponse.json({
                success: false,
                taskId: task.id,
                error: error.message
            }, { status: 500 });
        }

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";
