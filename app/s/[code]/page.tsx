import { sql } from '@/lib/db';
export const dynamic = "force-dynamic";

export default async function ShortLinkPage({ params }: { params: { code: string } }) {
    const tStart = Date.now();

    // ULTRA-FAST: Direct DB query without any initialization
    const result = await sql`
        SELECT target_url, district, sticker_title 
        FROM short_links 
        WHERE code = ${params.code}
        LIMIT 1
    `;

    const tQuery = Date.now();
    const link = result.length > 0 ? result[0] : null;

    console.log(`[ShortLink] Code: ${params.code}, Query: ${tQuery - tStart}ms, Found: ${!!link}`);

    if (!link) {
        // 404 - QR code not found
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">404</h1>
                    <p className="text-slate-400">QR-код не найден</p>
                </div>
            </div>
        );
    }

    if (!link.target_url) {
        // No URL configured - show "coming soon" message
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Скоро здесь будет чат!</h1>
                <p className="text-slate-400 max-w-sm">
                    Мы работаем над подключением вашего района.<br />
                    Попробуйте позже.
                </p>
            </div>
        );
    }

    // Add deep linking for Telegram
    let finalUrl = link.target_url;
    if ((finalUrl.includes('t.me') || finalUrl.includes('telegram.me')) &&
        !finalUrl.includes('joinchat') &&
        !finalUrl.includes('+') &&
        !finalUrl.includes('start=')) {
        const separator = finalUrl.includes('?') ? '&' : '?';
        finalUrl += `${separator}start=${params.code}`;
    }

    // INSTANT REDIRECT - no blocking operations!
    return (
        <html>
            <head>
                <meta httpEquiv="refresh" content={`0;url=${finalUrl}`} />
                <script dangerouslySetInnerHTML={{
                    __html: `
                        // GTM tracking (fire-and-forget)
                        window.dataLayer = window.dataLayer || [];
                        window.dataLayer.push({
                            'event': 'scan_qr',
                            'utm_source': '${link.district || 'qr'}',
                            'utm_campaign': '${link.sticker_title || 'default'}',
                            'utm_medium': 'qr',
                            'code': '${params.code}'
                        });
                        
                        // Async click increment (non-blocking)
                        fetch('/api/track-click', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ code: '${params.code}' }),
                            keepalive: true
                        }).catch(() => {});
                        
                        // INSTANT redirect
                        window.location.href = '${finalUrl}';
                    `
                }} />
            </head>
            <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: '#0f172a'
                }}>
                    <p style={{ color: '#94a3b8' }}>Переход...</p>
                </div>
            </body>
        </html>
    );
}
