import { sql, initDatabase } from '@/lib/db';
import { unstable_cache } from 'next/cache';
export const dynamic = "force-dynamic";

// Cached data fetcher
const getCachedLink = async (code: string) => {
    await initDatabase();
    return unstable_cache(
        async () => {
            const result = await sql`
                SELECT id, target_url, tg_chat_id, district, sticker_title, sticker_features, sticker_prizes FROM short_links WHERE code = ${code}
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
    const { headers } = await import("next/headers");
    const headersList = headers();
    const userAgent = headersList.get("user-agent") || "unknown";
    const ip = headersList.get("x-forwarded-for") || "unknown";

    // Legacy support: if uncached result was array, this handles single item logic
    const rows = link ? [link] : [];

    console.log(`[ShortLink] Code: ${params.code}, Found: ${rows.length}, Target: ${link?.target_url}`);

    if (link) {
        // --- ASYNC TRACKING (Non-blocking) ---
        // Fire-and-forget: increment click count
        sql`
            UPDATE short_links 
            SET clicks_count = COALESCE(clicks_count, 0) + 1 
            WHERE code = ${params.code}
        `.catch(e => console.error("Failed to increment clicks:", e));

        // If target_url is missing, it's potentially an unlinked QR or a sync error
        if (!link.target_url) {
            // Lazy Repair: If tg_chat_id is present, try to recover the link from ecosystems
            if (link.tg_chat_id) {
                const eco = await sql`SELECT invite_link FROM ecosystems WHERE tg_chat_id = ${link.tg_chat_id} `;
                if (eco.length > 0 && eco[0].invite_link) {
                    const inviteLink = eco[0].invite_link;
                    // Repair the short_link record
                    await sql`UPDATE short_links SET target_url = ${inviteLink} WHERE id = ${link.id} `;

                    // Return client-side redirect with GTM tracking
                    return (
                        <html>
                            <head>
                                <meta httpEquiv="refresh" content={`0;url=${inviteLink}`} />
                                <script dangerouslySetInnerHTML={{
                                    __html: `
                                        window.dataLayer = window.dataLayer || [];
                                        window.dataLayer.push({
                                            'event': 'scan_qr',
                                            'utm_source': '${link.district || 'unknown'}',
                                            'utm_campaign': '${link.sticker_title || 'default'}',
                                            'utm_medium': 'qr',
                                            'code': '${params.code}'
                                        });
                                        // Async tracking call
                                        fetch('/api/track-click', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                code: '${params.code}',
                                                user_agent: '${userAgent}',
                                                ip: '${ip}'
                                            })
                                        });
                                        window.location.href = '${inviteLink}';
                                    `
                                }} />
                            </head>
                            <body>Redirecting...</body>
                        </html>
                    );
                } else if (eco.length > 0) {
                    // Ecosystem exists but has no link. Try to generate one via Telegram API.
                    try {
                        const { getTelegramClient } = await import("@/lib/tg");
                        const { Api } = await import("telegram");

                        const client = await getTelegramClient();
                        const result = await client.invoke(new Api.messages.ExportChatInvite({
                            peer: link.tg_chat_id,
                            legacyRevokePermanent: false,
                        })) as any;

                        if (result && result.link) {
                            const newLink = result.link;
                            // Save to DB
                            await sql`UPDATE ecosystems SET invite_link = ${newLink}, status = 'подключен' WHERE tg_chat_id = ${link.tg_chat_id} `;
                            await sql`UPDATE short_links SET target_url = ${newLink} WHERE id = ${link.id} `;

                            // Return client-side redirect
                            return (
                                <html>
                                    <head>
                                        <meta httpEquiv="refresh" content={`0;url=${newLink}`} />
                                        <script dangerouslySetInnerHTML={{
                                            __html: `
                                                window.dataLayer = window.dataLayer || [];
                                                window.dataLayer.push({
                                                    'event': 'scan_qr',
                                                    'utm_source': '${link.district || 'unknown'}',
                                                    'utm_campaign': '${link.sticker_title || 'default'}',
                                                    'utm_medium': 'qr',
                                                    'code': '${params.code}'
                                                });
                                                fetch('/api/track-click', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        code: '${params.code}',
                                                        user_agent: '${userAgent}',
                                                        ip: '${ip}'
                                                    })
                                                });
                                                window.location.href = '${newLink}';
                                            `
                                        }} />
                                    </head>
                                    <body>Redirecting...</body>
                                </html>
                            );
                        }
                    } catch (tgErr) {
                        console.error("Failed to generate generic invite link:", tgErr);
                    }
                }
            }

            // Check for admin session to allow setup
            const { getServerSession } = await import("next-auth");
            const { authOptions } = await import("@/lib/auth");
            const session = await getServerSession(authOptions);

            if (session?.user?.email === "pevznergo@gmail.com") {
                // Return client-side redirect to setup
                return (
                    <html>
                        <head>
                            <meta httpEquiv="refresh" content={`0;url=/setup/${params.code}`} />
                        </head>
                        <body>Redirecting to setup...</body>
                    </html>
                );
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

        // --- DEEP LINKING START ---
        let finalUrl = link.target_url;
        if ((finalUrl.includes('t.me') || finalUrl.includes('telegram.me')) && !finalUrl.includes('joinchat') && !finalUrl.includes('+')) {
            const separator = finalUrl.includes('?') ? '&' : '?';
            if (!finalUrl.includes('start=')) {
                finalUrl += `${separator}start=${params.code}`;
            }
        }
        // --- DEEP LINKING END ---

        // Return instant client-side redirect with GTM tracking
        return (
            <html>
                <head>
                    <meta httpEquiv="refresh" content={`0;url=${finalUrl}`} />
                    <script dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            window.dataLayer.push({
                                'event': 'scan_qr',
                                'utm_source': '${link.district || 'unknown'}',
                                'utm_campaign': '${link.sticker_title || 'default'}',
                                'utm_medium': 'qr',
                                'code': '${params.code}',
                                'target': '${finalUrl}'
                            });
                            // Async tracking call (fire-and-forget)
                            fetch('/api/track-click', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    code: '${params.code}',
                                    user_agent: navigator.userAgent,
                                    ip: '${ip}'
                                }),
                                keepalive: true
                            }).catch(() => {});
                            // Immediate redirect
                            window.location.href = '${finalUrl}';
                        `
                    }} />
                </head>
                <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }}>
                        <p style={{ color: '#94a3b8' }}>Переход...</p>
                    </div>
                </body>
            </html>
        );
    } else {
        // Link not found in DB
        const { getServerSession } = await import("next-auth");
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
                return (
                    <html>
                        <head>
                            <meta httpEquiv="refresh" content={`0;url=/setup/${params.code}`} />
                        </head>
                        <body>Redirecting to setup...</body>
                    </html>
                );
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
