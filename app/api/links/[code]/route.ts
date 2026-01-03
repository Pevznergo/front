import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";
import { getTelegramClient } from "@/lib/tg";
import { Api } from "telegram";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: { code: string } }
) {
    await initDatabase();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = params;

    try {
        const links = await sql`
            SELECT id, target_url, tg_chat_id, clicks_count, member_count, last_count_update, created_at 
            FROM short_links 
            WHERE code = ${code}
        `;

        if (links.length === 0) {
            return NextResponse.json({ error: "Link not found" }, { status: 404 });
        }

        const link = links[0];
        let memberCount = link.member_count || 0;

        // Check cache (30 minutes)
        const CACHE_DURATION_MS = 30 * 60 * 1000;
        const now = new Date();
        const lastUpdate = link.last_count_update ? new Date(link.last_count_update) : new Date(0);
        const isStale = now.getTime() - lastUpdate.getTime() > CACHE_DURATION_MS;

        if (link.tg_chat_id && isStale) {
            try {
                const client = await getTelegramClient();
                // Get full channel info to see participant count
                const fullChannel = await client.invoke(
                    new Api.channels.GetFullChannel({
                        channel: link.tg_chat_id,
                    })
                ) as any;
                memberCount = fullChannel.fullChat.participantsCount;

                // Update cache in DB
                await sql`
                    UPDATE short_links 
                    SET member_count = ${memberCount}, last_count_update = ${now} 
                    WHERE id = ${link.id}
                `;

                // Also update ecosystems table
                await sql`
                    UPDATE ecosystems 
                    SET member_count = ${memberCount}, last_updated = ${now}
                    WHERE tg_chat_id = ${link.tg_chat_id}
                `;
            } catch (tgError) {
                console.error("Error fetching Telegram member count:", tgError);
                // Don't fail the whole request if TG fetch fails, use cached value
            }
        }

        return NextResponse.json({
            code: code,
            targetUrl: link.target_url,
            clicks: link.clicks_count,
            memberCount: memberCount,
            lastUpdate: link.last_count_update,
            createdAt: link.created_at
        });

    } catch (error: any) {
        console.error("Link stats error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { code: string } }
) {
    await initDatabase();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = params;
    const body = await req.json();
    const { targetUrl, tgChatId, title, district, status, isStuck } = body;

    if (targetUrl === undefined && tgChatId === undefined && title === undefined && district === undefined && status === undefined && isStuck === undefined) {
        return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    try {
        if (targetUrl) {
            await sql`UPDATE short_links SET target_url = ${targetUrl} WHERE code = ${code}`;
        }
        if (tgChatId) {
            // Robustness: Fetch the official invite link from ecosystems table
            const eco = await sql`SELECT invite_link FROM ecosystems WHERE tg_chat_id = ${tgChatId}`;

            if (eco.length === 0 || !eco[0].invite_link) {
                return NextResponse.json({
                    error: "У этой группы нет ссылки-приглашения (invite_link). Создайте её вручную или обновите запись в БД."
                }, { status: 400 });
            }

            const officialUrl = eco[0].invite_link;

            await sql`UPDATE short_links SET tg_chat_id = ${tgChatId}, target_url = ${officialUrl}, status = 'подключен' WHERE code = ${code}`;
            // Also update ecosystem status
            await sql`UPDATE ecosystems SET status = 'подключен' WHERE tg_chat_id = ${tgChatId}`;
        }
        if (title) {
            await sql`UPDATE short_links SET reviewer_name = ${title} WHERE code = ${code}`;
        }
        if (district) {
            await sql`UPDATE short_links SET district = ${district} WHERE code = ${code}`;
        }
        if (status) {
            await sql`UPDATE short_links SET status = ${status} WHERE code = ${code}`;
        }
        if (isStuck !== undefined) {
            await sql`UPDATE short_links SET is_stuck = ${isStuck} WHERE code = ${code}`;
        }

        // Handle unlinking (explicit NULL) - if body contains fields as null
        if (body.tgChatId === null) {
            await sql`UPDATE short_links SET tg_chat_id = NULL, target_url = NULL, reviewer_name = NULL, member_count = 0, status = 'не подключен', is_stuck = FALSE WHERE code = ${code}`;
        }

        // Invalid cache for this link so redirections update immediately
        revalidateTag(`link-${code}`);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Link update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
