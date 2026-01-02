import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    if (!session || session.user?.email !== "pevznergo@gmail.com") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDatabase();

    try {
        // Fetch all links that have a tg_chat_id (ecosystems)
        // Fetch all ecosystems to allow linking
        const groups = await sql`
            SELECT id, tg_chat_id, title, district, invite_link as target_url
            FROM ecosystems
            ORDER BY created_at DESC
        `;
        return NextResponse.json(groups);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
