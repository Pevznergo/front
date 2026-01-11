import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
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
        const result = await sql`DELETE FROM unified_queue WHERE id = ${id} RETURNING id`;

        // Also try to clean up legacy just in case (optional, but good for transition)
        // await sql`DELETE FROM topic_actions_queue WHERE id = ${id}`;
        // await sql`DELETE FROM chat_creation_queue WHERE id = ${id}`;

        return NextResponse.json({
            success: true,
            count: result.length
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
