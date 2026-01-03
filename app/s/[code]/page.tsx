import { sql, initDatabase } from '@/lib/db';
import { redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';
export const dynamic = "force-dynamic";

// Cached data fetcher
const getCachedLink = async (code: string) => {
    await initDatabase();
    return unstable_cache(
        async () => {
            const result = await sql`
                SELECT id, target_url, tg_chat_id FROM short_links WHERE code = ${code}
`;
            return result.length > 0 ? result[0] : null;
        },
        [`link-${code}`], // Key parts
        {
            tags: [`link-${code}`], // Revalidation tags
            revalidate: 3600 // Auto-revalidate every hour just in case
        }
    )();
};

export default async function ShortLinkPage({ params }: { params: { code: string } }) {
    const link = await getCachedLink(params.code);

    // Legacy support: if uncached result was array, this handles single item logic
    const rows = link ? [link] : [];

    console.log(`[ShortLink] Code: ${params.code}, Found: ${rows.length}, Target: ${link?.target_url}`);

    if (link) {
        // Increment click count (best effort)
        try {
            await sql`
                UPDATE short_links 
                SET clicks_count = COALESCE(clicks_count, 0) + 1 
                WHERE code = ${params.code}
`;
        } catch (e) {
            console.error("Failed to increment clicks:", e);
        }

        // If target_url is missing, it's potentially an unlinked QR or a sync error
        if (!link.target_url) {
            // Lazy Repair: If tg_chat_id is present, try to recover the link from ecosystems
            if (link.tg_chat_id) {
                const eco = await sql`SELECT invite_link FROM ecosystems WHERE tg_chat_id = ${link.tg_chat_id} `;
                if (eco.length > 0 && eco[0].invite_link) {
                    const inviteLink = eco[0].invite_link;
                    // Repair the short_link record
                    await sql`UPDATE short_links SET target_url = ${inviteLink} WHERE id = ${link.id} `;
                    redirect(inviteLink);
                } else if (eco.length > 0) {
                    // Ecosystem exists but has no link. Try to generate one via Telegram API.
                    try {
                        const { getTelegramClient } = await import("@/lib/tg");
                        const { Api } = await import("telegram");

                        const client = await getTelegramClient();
                        // We need to resolve the peer. InputPeer? 
                        // To be safe, try to get entity or just use the ID if specific format.
                        // Usually for channels/supergroups we need a bit more, but let's try direct invocation if plausible.
                        // Better: attempt to fetch full channel or export invite.

                        // Note: exportChatInvite requires the bot to be admin with rights.
                        const result = await client.invoke(new Api.messages.ExportChatInvite({
                            peer: link.tg_chat_id,
                            legacyRevokePermanent: false,
                            // request_needed: false, // optional
                        })) as any;

                        if (result && result.link) {
                            const newLink = result.link;
                            // Save to DB
                            await sql`UPDATE ecosystems SET invite_link = ${newLink}, status = 'подключен' WHERE tg_chat_id = ${link.tg_chat_id} `;
                            await sql`UPDATE short_links SET target_url = ${newLink} WHERE id = ${link.id} `;
                            redirect(newLink);
                        }
                    } catch (tgErr) {
                        console.error("Failed to generate generic invite link:", tgErr);
                    }
                }
            }

            // Check for admin session to allow setup
            // Note: getServerSession is available in server components
            const { getServerSession } = await import("next-auth");
            const { authOptions } = await import("@/lib/auth");
            const session = await getServerSession(authOptions);

            if (session?.user?.email === "pevznergo@gmail.com") {
                redirect(`/setup/${params.code}`);
            }

            return (
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Это новая точка доступа</h1>
                    <p className="text-slate-400 max-w-sm">
                        Наши специалисты уже работают над этим районом. <br /> Скоро здесь появится чат вашего дома!
                    </p>
                </div>
            );
        }

        redirect(link.target_url);
    } else {
        // Link not found in DB
        // Check if admin is scanning a new QR code
        const { getServerSession } = await import("next-auth");
        // Try to import authOptions dynamically to avoid build issues if it's strict
        // But for now, we'll trust the existing pattern or use no-args if it works, 
        // OR better: import it properly if possible. 
        // Given previous code used no-args, we'll try that first, but standard is with authOptions.
        // Let's rely on the session wrapper if it exists or just generic getServerSession.
        const { authOptions } = await import("@/lib/auth");
        const session = await getServerSession(authOptions);

        if (session?.user?.email === "pevznergo@gmail.com") {
            // Auto-create the link
            try {
                await sql`
                    INSERT INTO short_links (code, status) 
                    VALUES (${params.code}, 'не распечатан') 
                    ON CONFLICT (code) DO NOTHING
    `;
                redirect(`/setup/${params.code}`);
            } catch (e) {
                console.error("Auto-create failed", e);
            }
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">404</h1>
                    <p className="text-slate-500">QR-код не найден в системе.</p>
                </div>
            </div>
        );
    }
}
