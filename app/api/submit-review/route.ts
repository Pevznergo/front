
import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function POST(req: Request) {
    try {
        await initDatabase();
        const { content } = await req.json();

        if (!content || typeof content !== 'string') {
            return NextResponse.json(
                { error: 'Review content is required' },
                { status: 400 }
            );
        }

        // Insert into analysis_requests table
        await sql`
      INSERT INTO analysis_requests (content, source, user_email)
      VALUES (${content}, 'hero', NULL)
    `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error submitting review:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
