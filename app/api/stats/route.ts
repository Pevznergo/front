import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sql, initDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const ALLOWED_EMAIL = "pevznergo@gmail.com";

    if (!session || session.user?.email !== ALLOWED_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDatabase();

    try {
        // 1. Chats over time (Daily)
        const chatsOverTime = await sql`
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM-DD') as date,
                COUNT(*) as count
            FROM ecosystems
            GROUP BY 1
            ORDER BY 1 ASC
        `;

        // 2. Key Metrics
        const totalChatsResult = await sql`SELECT COUNT(*) as count FROM ecosystems`;
        const totalQrResult = await sql`SELECT COUNT(*) as count FROM short_links`;

        // Sum of clicks from short_links (which includes QR codes)
        const totalClicksResult = await sql`SELECT SUM(clicks_count) as count FROM short_links`;

        // Sum of members from ecosystems
        const totalMembersResult = await sql`SELECT SUM(member_count) as count FROM ecosystems`;

        return NextResponse.json({
            timeline: chatsOverTime,
            summary: {
                totalChats: Number(totalChatsResult[0].count),
                totalQr: Number(totalQrResult[0].count),
                totalClicks: Number(totalClicksResult[0].count || 0),
                totalSubscribers: Number(totalMembersResult[0].count || 0)
            }
        });

    } catch (e: any) {
        console.error("Stats API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";
