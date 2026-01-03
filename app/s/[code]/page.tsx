
import { sql, initDatabase } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function ShortLinkPage({ params }: { params: { code: string } }) {
    await initDatabase();

    // Fetch target URL
    const rows = await sql`
        SELECT target_url FROM short_links WHERE code = ${params.code}
    `;

    if (rows.length > 0) {
        const link = rows[0];

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
                const eco = await sql`SELECT invite_link FROM ecosystems WHERE tg_chat_id = ${link.tg_chat_id}`;
                if (eco.length > 0 && eco[0].invite_link) {
                    const inviteLink = eco[0].invite_link;
                    // Repair the short_link record for future speed
                    await sql`UPDATE short_links SET target_url = ${inviteLink} WHERE id = ${link.id}`;
                    redirect(inviteLink);
                }
            }

            // Check for admin session to allow setup
            // Note: getServerSession is available in server components
            const { getServerSession } = await import("next-auth");
            const session = await getServerSession();

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
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">404</h1>
                    <p className="text-slate-500">Link not found.</p>
                </div>
            </div>
        );
    }
}
