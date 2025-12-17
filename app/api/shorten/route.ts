
import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';
import { nanoid } from 'nanoid';

// Function to generate a short code (simple replacement for nanoid if needed, but nanoid is better)
function generateCode(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export async function POST(req: Request) {
    try {
        await initDatabase();
        const { target_url, reviewer_name, org_url, contacts } = await req.json();

        if (!target_url || typeof target_url !== 'string') {
            return NextResponse.json({ error: 'target_url is required' }, { status: 400 });
        }

        // Generate a 6-char code
        // We Retry loop to ensure uniqueness in case of collision (rare for 6 chars)
        let code = generateCode(6);
        let retries = 0;

        while (retries < 5) {
            try {
                await sql`
                  INSERT INTO short_links (code, target_url, reviewer_name, org_url, contacts)
                  VALUES (${code}, ${target_url}, ${reviewer_name || null}, ${org_url || null}, ${contacts || null})
                `;
                break; // Success
            } catch (e: any) {
                if (e.code === '23505') { // Unique violation
                    code = generateCode(6);
                    retries++;
                } else {
                    throw e;
                }
            }
        }

        if (retries >= 5) {
            return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
        }

        const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://aporto.tech'}/s/${code}`;
        return NextResponse.json({ shortUrl, code, target_url });

    } catch (error) {
        console.error('Shorten error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await initDatabase();
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await sql`DELETE FROM short_links WHERE id = ${id}`;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
