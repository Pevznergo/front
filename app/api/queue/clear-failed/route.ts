import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== "pevznergo@gmail.com") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDatabase();

    try {
        const topicResult = await sql`DELETE FROM topic_actions_queue WHERE status = 'failed' RETURNING id`;
        const createResult = await sql`DELETE FROM chat_creation_queue WHERE status = 'failed' RETURNING id`;

        const count = topicResult.length + createResult.length;

        return NextResponse.json({ success: true, count, details: { topic: topicResult.length, create: createResult.length } });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
