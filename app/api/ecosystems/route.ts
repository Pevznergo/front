import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sql, initDatabase } from "@/lib/db";
import { updateChatTitle } from "@/lib/chat";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const ALLOWED_EMAIL = "pevznergo@gmail.com";

    if (!session || session.user?.email !== ALLOWED_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDatabase();

    try {
        const ecosystems = await sql`
            SELECT * FROM ecosystems 
            ORDER BY created_at DESC
        `;
        return NextResponse.json({ items: ecosystems });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const ALLOWED_EMAIL = "pevznergo@gmail.com";

    if (!session || session.user?.email !== ALLOWED_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tgChatId, title, district } = await req.json();
    if (!tgChatId) return NextResponse.json({ error: "tgChatId is required" }, { status: 400 });

    try {
        await sql`
            UPDATE ecosystems 
            SET 
                title = COALESCE(${title}, title),
                district = COALESCE(${district}, district),
                last_updated = CURRENT_TIMESTAMP
            WHERE tg_chat_id = ${tgChatId}
        `;

        // Update Telegram Group Title
        if (title) {
            try {
                await updateChatTitle(tgChatId, title);
            } catch (tgError: any) {
                console.error("Failed to update Telegram chat title:", tgError);
                // We don't fail the request, but log it.
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const ALLOWED_EMAIL = "pevznergo@gmail.com";

    if (!session || session.user?.email !== ALLOWED_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tgChatId } = await req.json();
    if (!tgChatId) return NextResponse.json({ error: "tgChatId is required" }, { status: 400 });

    try {
        await sql`DELETE FROM ecosystems WHERE tg_chat_id = ${tgChatId}`;
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";
