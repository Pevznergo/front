
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { content } = await req.json();

        if (!content || typeof content !== 'string') {
            return NextResponse.json(
                { error: 'Task content is required' },
                { status: 400 }
            );
        }

        const userEmail = session?.user?.email || null;

        await sql`
      INSERT INTO analysis_requests (content, source, user_email)
      VALUES (${content}, 'dashboard', ${userEmail})
    `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error creating task:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
