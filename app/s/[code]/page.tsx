
import { sql, initDatabase } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function ShortLinkPage({ params }: { params: { code: string } }) {
    await initDatabase();

    // Fetch target URL
    const rows = await sql`
        SELECT target_url FROM short_links WHERE code = ${params.code}
    `;

    if (rows.length > 0) {
        redirect(rows[0].target_url);
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
