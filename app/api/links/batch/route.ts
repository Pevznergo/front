import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sql, initDatabase } from "@/lib/db";

function generateCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initDatabase();

    try {
        const body = await req.json();
        const { count, targetUrl, title, features, prizes } = body;

        if (!count || count <= 0) {
            return NextResponse.json({ error: "Invalid count" }, { status: 400 });
        }

        const createdLinks = [];

        for (let i = 0; i < count; i++) {
            let code = generateCode();
            let isUnique = false;
            let attempts = 0;

            // Simple collision check (retry 3 times)
            while (!isUnique && attempts < 3) {
                const existing = await sql`SELECT id FROM short_links WHERE code = ${code}`;
                if (existing.length === 0) {
                    isUnique = true;
                } else {
                    code = generateCode();
                    attempts++;
                }
            }

            if (!isUnique) throw new Error("Failed to generate unique code");

            const result = await sql`
                INSERT INTO short_links (code, target_url, reviewer_name, status, sticker_title, sticker_features, sticker_prizes)
                VALUES (${code}, ${targetUrl || null}, ${title || 'Batch Generated'}, 'не распечатан', ${title || ''}, ${features || ''}, ${prizes || ''})
                RETURNING id, code, target_url, reviewer_name, status, created_at, clicks_count, member_count, is_stuck, sticker_title, sticker_features, sticker_prizes
            `;
            createdLinks.push(result[0]);
        }

        return NextResponse.json({ success: true, links: createdLinks });

    } catch (error: any) {
        console.error("Batch Creation Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
