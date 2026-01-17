import { NextRequest, NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        await initDatabase();

        // Get analytics from User table (using telegramId which already exists)
        const totalUsers = await sql`SELECT COUNT(*) as count FROM "User"`;
        const activeUsers = await sql`SELECT COUNT(*) as count FROM "User" WHERE is_active = TRUE`;
        const paidUsers = await sql`SELECT COUNT(*) as count FROM "User" WHERE has_paid = TRUE`;

        // Group by UTM source
        const byUtmSource = await sql`
            SELECT 
                utm_source,
                COUNT(*) as total,
                SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN has_paid THEN 1 ELSE 0 END) as paid
            FROM "User"
            WHERE utm_source IS NOT NULL
            GROUP BY utm_source
            ORDER BY total DESC
        `;

        // Group by UTM campaign
        const byUtmCampaign = await sql`
            SELECT 
                utm_campaign,
                utm_source,
                COUNT(*) as total,
                SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN has_paid THEN 1 ELSE 0 END) as paid
            FROM "User"
            WHERE utm_campaign IS NOT NULL
            GROUP BY utm_campaign, utm_source
            ORDER BY total DESC
        `;

        // QR Code stats
        const qrStats = await sql`
            SELECT 
                code,
                district as utm_source,
                sticker_title as utm_campaign,
                clicks_count,
                member_count,
                status
            FROM short_links
            WHERE clicks_count > 0
            ORDER BY clicks_count DESC
            LIMIT 50
        `;

        // Telegram users stats
        const telegramUsers = await sql`SELECT COUNT(*) as count FROM "User" WHERE "telegramId" IS NOT NULL`;
        const avgPoints = await sql`SELECT AVG(points) as avg FROM "User" WHERE "telegramId" IS NOT NULL`;
        const totalSpins = await sql`SELECT SUM(spins_count) as total FROM "User" WHERE "telegramId" IS NOT NULL`;

        // UTM breakdown for Telegram users
        const telegramByUtmSource = await sql`
            SELECT 
                utm_source, 
                COUNT(*) as total, 
                AVG(points) as avg_points,
                SUM(spins_count) as total_spins
            FROM "User"
            WHERE "telegramId" IS NOT NULL AND utm_source IS NOT NULL
            GROUP BY utm_source
            ORDER BY total DESC
        `;

        const telegramByUtmCampaign = await sql`
            SELECT 
                utm_campaign,
                utm_source,
                COUNT(*) as total,
                AVG(points) as avg_points,
                SUM(spins_count) as total_spins
            FROM "User"
            WHERE "telegramId" IS NOT NULL AND utm_campaign IS NOT NULL
            GROUP BY utm_campaign, utm_source
            ORDER BY total DESC
        `;

        return NextResponse.json({
            summary: {
                total_users: parseInt(totalUsers[0]?.count || '0'),
                active_users: parseInt(activeUsers[0]?.count || '0'),
                paid_users: parseInt(paidUsers[0]?.count || '0')
            },
            telegram: {
                total_users: parseInt(telegramUsers[0]?.count || '0'),
                avg_points: parseFloat(avgPoints[0]?.avg || '0'),
                total_spins: parseInt(totalSpins[0]?.total || '0'),
                by_utm_source: telegramByUtmSource,
                by_utm_campaign: telegramByUtmCampaign
            },
            by_utm_source: byUtmSource,
            by_utm_campaign: byUtmCampaign,
            top_qr_codes: qrStats
        });
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";
