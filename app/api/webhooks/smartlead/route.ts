import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function POST(req: Request) {
    try {
        await initDatabase();
        const body = await req.json();

        // Smartlead webhook payload structure varies by event type
        // Common: { event_type: 'EMAIL_OPEN', data: { email_stats: { lead_email: '...' } } } or similar
        // Let's log first to be safe in dev.
        console.log("Smartlead Webhook:", body);

        const eventType = body.event_type || body.type; // 'EMAIL_SENT', 'EMAIL_OPEN', 'EMAIL_REPLY'
        const email = body.lead_email || body.data?.lead_email || body.data?.email_stats?.lead_email;

        if (!email) {
            return NextResponse.json({ message: 'No email found' }, { status: 200 });
        }

        let newStatus = '';
        if (eventType === 'EMAIL_SENT') newStatus = 'sent';
        if (eventType === 'EMAIL_OPEN') newStatus = 'opened';
        if (eventType === 'EMAIL_REPLY') newStatus = 'replied';

        if (newStatus) {
            // Update status where contacts contains this email
            // Using ILIKE for partial match in the contacts string
            await sql`
                UPDATE short_links 
                SET email_status = ${newStatus}
                WHERE contacts ILIKE ${'%' + email + '%'}
            `;
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error("Webhook failed", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
