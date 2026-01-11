import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== "pevznergo@gmail.com") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, source } = await req.json();

    if (!id || !source) {
        return NextResponse.json({ error: "ID and Source are required" }, { status: 400 });
    }

    await initDatabase();

    try {
        // Diagnostic: Check where this ID actually exists
        const existsInTopic = await sql`SELECT id FROM topic_actions_queue WHERE id = ${id}`;
        const existsInCreate = await sql`SELECT id FROM chat_creation_queue WHERE id = ${id}`;

        let result;
        if (source === 'topic') {
            result = await sql`DELETE FROM topic_actions_queue WHERE id = ${id} RETURNING id`;
        } else if (source === 'create') {
            result = await sql`DELETE FROM chat_creation_queue WHERE id = ${id} RETURNING id`;
        } else {
            return NextResponse.json({ error: "Invalid source" }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            count: result.length,
            debug: {
                requestedId: id,
                requestedSource: source,
                existsInTopic: existsInTopic.length > 0,
                existsInCreate: existsInCreate.length > 0
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
