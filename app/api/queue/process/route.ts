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
        const now = new Date();

        // 1. Find the oldest pending task
        const pendingTasks = await sql`
            SELECT * FROM chat_creation_queue 
            WHERE status = 'pending' 
            ORDER BY scheduled_at ASC 
            LIMIT 1
        `;

        if (pendingTasks.length === 0) {
            return NextResponse.json({ message: "No pending tasks" });
        }

        const task = pendingTasks[0];
        const scheduledTime = new Date(task.scheduled_at);
        const diffMs = scheduledTime.getTime() - now.getTime();

        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const host = req.headers.get("host");
        const baseUrl = `${protocol}://${host}`;

        const triggerNext = (delayMs = 0) => {
            const secretParam = secret ? `&secret=${secret}` : "";
            // Use a cache-busting timestamp
            const url = `${baseUrl}/api/queue/process?t=${Date.now()}${secretParam}`;

            if (delayMs > 0) {
                console.log(`Scheduling next run in ${delayMs}ms`);
                setTimeout(() => {
                    fetch(url).catch(e => console.error("Self-trigger error:", e));
                }, delayMs);
            } else {
                fetch(url).catch(e => console.error("Self-trigger error:", e));
            }
        };

        // 2. Decide what to do based on timing
        if (!force && diffMs > 0) {
            if (diffMs < 15000) {
                // Short wait: server-side sleep
                await new Promise(resolve => setTimeout(resolve, diffMs));
            } else {
                // Long wait: return and wake up later
                triggerNext(diffMs + 1000);
                return NextResponse.json({
                    message: `Next task scheduled for later`,
                    nextTaskIn: Math.round(diffMs / 1000),
                    status: "waiting",
                    title: task.title
                });
            }
        }

        // 3. Process the task
        await sql`UPDATE chat_creation_queue SET status = 'processing' WHERE id = ${task.id}`;

        try {
            const alreadyExists = await sql`SELECT id FROM short_links WHERE reviewer_name = ${task.title}`;
            if (alreadyExists.length > 0) {
                await sql`UPDATE chat_creation_queue SET status = 'completed', error = 'Already exists in short_links' WHERE id = ${task.id}`;
                triggerNext(1000);
                return NextResponse.json({
                    success: true,
                    message: "Skipped: already exists",
                    taskId: task.id
                });
            }

            const result = await createEcosystem(task.title, task.district);

            await sql`
                UPDATE chat_creation_queue 
                SET status = 'completed', error = NULL 
                WHERE id = ${task.id}
            `;

            triggerNext(3000); // 3s pause before next

            return NextResponse.json({
                success: true,
                taskId: task.id,
                chatId: result.chatId
            });

        } catch (error: any) {
            console.error(`Queue processing error for task ${task.id}:`, error);
            await sql`
                UPDATE chat_creation_queue 
                SET status = 'failed', error = ${error.message} 
                WHERE id = ${task.id}
            `;
            triggerNext(10000); // 10s pause after error
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
