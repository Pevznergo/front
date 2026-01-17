import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        await initDatabase();

        const { code, user_agent, ip } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Missing code' }, { status: 400 });
        }

        // Non-blocking: increment click count
        sql`
            UPDATE short_links 
            SET clicks_count = COALESCE(clicks_count, 0) + 1,
                last_count_update = CURRENT_TIMESTAMP
            WHERE code = ${code}
        `.catch(e => console.error("Failed to increment clicks:", e));

        // Optional: Send to GA Measurement Protocol (server-side backup)
        const MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID;
        const API_SECRET = process.env.GA_API_SECRET;

        if (MEASUREMENT_ID && API_SECRET) {
            // Get link details for event params
            const link = await sql`SELECT district, sticker_title, sticker_features, sticker_prizes FROM short_links WHERE code = ${code}`;

            if (link.length > 0) {
                const eventData = {
                    client_id: `${ip || 'unknown'}_${user_agent || 'unknown'}`,
                    events: [{
                        name: 'scan_qr',
                        params: {
                            utm_source: link[0].district || 'unknown',
                            utm_campaign: link[0].sticker_title || 'default',
                            utm_medium: 'qr',
                            code: code,
                            user_agent: user_agent,
                            ip: ip
                        }
                    }]
                };

                fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`, {
                    method: "POST",
                    body: JSON.stringify(eventData)
                }).catch(e => console.error("GA Event Error:", e));
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Track click error:", error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";
