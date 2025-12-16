import { sql, initDatabase } from '@/lib/db';
import AdminClient from '@/components/AdminClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';

export default async function AdminPage() {
    // Protect route
    const session = await getServerSession(authOptions);
    // In real app: if (!session) redirect('/login');

    // Ensure DB is ready
    await initDatabase();

    let links: any[] = [];
    try {
        links = await sql`SELECT * FROM short_links ORDER BY created_at DESC`;
    } catch (e) {
        console.error("Failed to fetch links", e);
    }

    const serializedLinks = links.map(link => ({
        ...link,
        created_at: link.created_at?.toString() || new Date().toISOString(),
        email_status: link.email_status || 'pending',
        smartlead_lead_id: link.smartlead_lead_id || null
    }));

    return (
        <div className="min-h-screen bg-[#F2F2F7] p-8 font-sans">
            <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Admin Console</h1>
                <div className='bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold'>n8n Disconnected</div>
            </div>
            <AdminClient initialLinks={serializedLinks} />
        </div>
    );
}
