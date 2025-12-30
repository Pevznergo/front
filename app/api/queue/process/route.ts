import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";
import { createEcosystem } from "@/lib/chat";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    // Basic protection (can be secret key or admin session)
    const secret = req.headers.get("X-Secret-Key") || req.nextUrl.searchParams.get("secret");
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.email === "pevznergo@gmail.com";

    if (!isAdmin && process.env.APP_SECRET_KEY && secret !== process.env.APP_SECRET_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDatabase();

    const force = req.nextUrl.searchParams.get("force") === "true";

    try {
        // 1. Find the oldest pending task
        // If force is true, we ignore scheduled_at
        const now = new Date();
        let pendingTasks: any[];

        if (force) {
            pendingTasks = await sql`
                SELECT * FROM chat_creation_queue 
                WHERE status = 'pending' 
                ORDER BY scheduled_at ASC 
                LIMIT 1
            `;
        } else {
            pendingTasks = await sql`
                SELECT * FROM chat_creation_queue 
                WHERE status = 'pending' 
                AND scheduled_at <= ${now} 
                ORDER BY scheduled_at ASC 
                LIMIT 1
            `;
        }

        if (pendingTasks.length === 0) {
            return NextResponse.json({ message: "No pending tasks due" });
        }

        const task = pendingTasks[0];

        // 2. Mark as processing
        await sql`UPDATE chat_creation_queue SET status = 'processing' WHERE id = ${task.id}`;

        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const host = req.headers.get("host");
        const baseUrl = `${protocol}://${host}`;
        const triggerNext = () => {
            const secretParam = secret ? `?secret=${secret}` : "";
            fetch(`${baseUrl}/api/queue/process${secretParam}`).catch(e => console.error("Self-trigger error:", e));
        };

        try {
            // 2.5 Just-in-time duplication check
            const alreadyExists = await sql`SELECT id FROM short_links WHERE reviewer_name = ${task.title}`;
            if (alreadyExists.length > 0) {
                await sql`UPDATE chat_creation_queue SET status = 'completed', error = 'Already exists in short_links' WHERE id = ${task.id}`;
                triggerNext(); // Check for next task since this one was skipped
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

            triggerNext(); // Successfully finished one, check if more are due

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
