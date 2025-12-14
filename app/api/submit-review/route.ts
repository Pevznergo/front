
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { content } = await req.json();

        if (!content || typeof content !== 'string') {
            return NextResponse.json(
                { error: 'Review content is required' },
                { status: 400 }
            );
        }

        // Insert into reviews table
        await sql`
      INSERT INTO reviews (content, status)
      VALUES (${content}, 'pending')
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
