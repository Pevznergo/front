import { sql } from '@/lib/db';
export const dynamic = "force-dynamic";

export default async function ReferralRedirectPage({ params }: { params: { code: string } }) {
    // 1. Direct DB query
    const result = await sql`
        SELECT target_url, district, sticker_title, id 
        FROM short_links 
        WHERE code = ${params.code}
        LIMIT 1
    `;

    const link = result.length > 0 ? result[0] : null;

    if (!link) {
        // 404
        return (
            <div className="min-h-screen flex items-center justify-center bg-black font-sans">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">404</h1>
                    <p className="text-gray-400">Ссылка не найдена</p>
                </div>
            </div>
        );
    }

    // Default target if missing (shouldn't happen for referrals)
    const finalUrl = link.target_url || '/';

    // INSTANT REDIRECT
    return (
        <html>
            <head>
                <meta httpEquiv="refresh" content={`0;url=${finalUrl}`} />
                <script dangerouslySetInnerHTML={{
                    __html: `
                        // Async tracking (non-blocking)
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
            <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui', backgroundColor: '#000' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    color: '#4b5563'
                }}>
                    <p>Переход в Telegram...</p>
                </div>
            </body>
        </html>
    );
}
