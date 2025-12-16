import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

const SMARTLEAD_API_KEY = process.env.SMARTLEAD_API_KEY;
const SMARTLEAD_CAMPAIGN_ID = process.env.SMARTLEAD_CAMPAIGN_ID;

// Helper to extract email from string like "Email: foo@bar.com, Phone: ..."
function extractEmail(contactString: string): string | null {
    if (!contactString) return null;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = contactString.match(emailRegex);
    return match ? match[0] : null;
}

export async function POST(req: Request) {
    if (!SMARTLEAD_API_KEY || !SMARTLEAD_CAMPAIGN_ID) {
        return NextResponse.json({ error: 'Smartlead configuration missing' }, { status: 500 });
    }

    try {
        await initDatabase();
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing link ID' }, { status: 400 });
        }

        // Fetch link details
        const [link] = await sql`SELECT * FROM short_links WHERE id = ${id}`;

        if (!link) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        const email = extractEmail(link.contacts);
        if (!email) {
            return NextResponse.json({ error: 'No valid email found in contacts' }, { status: 400 });
        }

        // Smartlead payload
        // We set custom fields for the template usage
        const payload = {
            campaign_id: parseInt(SMARTLEAD_CAMPAIGN_ID) || SMARTLEAD_CAMPAIGN_ID,
            lead_list: [
                {
                    email: email,
                    first_name: link.reviewer_name || 'Business Owner',
                    custom_fields: {
                        reviewer_name: link.reviewer_name || 'the reviewer',
                        short_link: `https://aporto.tech/s/${link.code}`
                    }
                }
            ]
        };

        const res = await fetch(`https://server.smartlead.ai/api/v1/campaigns/${SMARTLEAD_CAMPAIGN_ID}/leads?api_key=${SMARTLEAD_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Smartlead API Error: ${errorText}`);
        }

        const data = await res.json();

        // Smartlead usually returns { ok: true, lead_ids: [...] } or just "Lead added"
        // We will assume queued.

        await sql`
            UPDATE short_links 
            SET email_status = 'bounced', -- Default to queued/sent. Wait.. 'queued' is better.
                smartlead_lead_id = 'queued' -- We might not get exact ID immediately in batch add.
            WHERE id = ${id}
        `;

        // Let's set it to 'queued'
        await sql`UPDATE short_links SET email_status = 'queued' WHERE id = ${id}`;


        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error("Sending failed", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
