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

    console.log(`[ShortLink] Code: ${params.code}, Found: ${!!link}, Target: ${link?.target_url}`);

    if (link) {
        // --- INSTANT REDIRECT STRATEGY ---
        // If we have a target_url, redirect immediately
        // If not, redirect to a fallback/recovery page

        let finalUrl = link.target_url;

        if (finalUrl) {
            // Add deep linking parameter for Telegram bots
            if ((finalUrl.includes('t.me') || finalUrl.includes('telegram.me')) && !finalUrl.includes('joinchat') && !finalUrl.includes('+')) {
                const separator = finalUrl.includes('?') ? '&' : '?';
                if (!finalUrl.includes('start=')) {
                    finalUrl += `${separator}start=${params.code}`;
                }
            }

            // INSTANT REDIRECT with async tracking
            return (
                <html>
                    <head>
                        <meta httpEquiv="refresh" content={`0;url=${finalUrl}`} />
                        <script dangerouslySetInnerHTML={{
                            __html: `
                                // Fire GTM event (non-blocking)
                                window.dataLayer = window.dataLayer || [];
                                window.dataLayer.push({
                                    'event': 'scan_qr',
                                    'utm_source': '${link.district || 'unknown'}',
                                    'utm_campaign': '${link.sticker_title || 'default'}',
                                    'utm_medium': 'qr',
                                    'code': '${params.code}',
                                    'target': '${finalUrl}'
                                });
                                
                                // Async click tracking (fire-and-forget)
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
                                
                                // Immediate redirect (don't wait for tracking)
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
            // No target_url - redirect to recovery/setup page
            // This page will handle async operations (ecosystem lookup, Telegram API, etc.)
            return (
                <html>
                    <head>
                        <meta httpEquiv="refresh" content={`0;url=/setup/${params.code}`} />
                    </head>
                    <body>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a', fontFamily: 'system-ui' }}>
                            <p style={{ color: '#94a3b8' }}>Настройка...</p>
                        </div>
                    </body>
                </html>
            );
        }
    } else {
        // Link not found in DB - show error or auto-create for admin
        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import("@/lib/auth");
        const session = await getServerSession(authOptions);

        if (session?.user?.email === "pevznergo@gmail.com") {
            // Auto-create the link for admin
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
