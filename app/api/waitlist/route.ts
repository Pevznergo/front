import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_fallback');

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // 1. Insert into database
    try {
      await sql`
                INSERT INTO waitlist (email)
                VALUES (${email})
            `;
    } catch (dbError: any) {
      // Postgres unique violation code is 23505
      if (dbError.code === '23505') {
        return NextResponse.json({ error: 'This email is already on the waitlist.' }, { status: 400 });
      }
      // Auto-init table if it doesn't exist yet (for dev convenience)
      if (dbError.message?.includes('relation "waitlist" does not exist')) {
        await sql`
                    CREATE TABLE IF NOT EXISTS waitlist (
                        id SERIAL PRIMARY KEY,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `;
        // Retry insertion
        await sql`
                    INSERT INTO waitlist (email)
                    VALUES (${email})
                `;
      } else {
        console.error("Database error during waitlist insert:", dbError);
        throw dbError;
      }
    }

    // 2. Send email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Aporto Early Access <onboarding@resend.dev>',
          to: email, // If using resend.dev test domain, this only works if 'email' is verified in Resend dashboard
          subject: 'Welcome to the Aporto Early Access Waitlist',
          html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a;">
                            <h2 style="color: #000;">You're on the list! 🚀</h2>
                            <p>Hi there,</p>
                            <p>Thank you for requesting early access to <strong>Aporto</strong>, the high-performance API Gateway for AI applications.</p>
                            <p>We are currently onboarding users in batches to ensure maximum stability and sub-millisecond latency. We will reach out to you at this email address as soon as your account is ready for activation.</p>
                            <br/>
                            <p>Best regards,</p>
                            <p><strong>The Aporto Team</strong></p>
                            <p><a href="https://aporto.tech" style="color: #2979ff;">aporto.tech</a></p>
                        </div>
                    `,
        });
      } catch (emailError) {
        console.error("Resend error:", emailError);
        // We don't fail the request if just the email fails, as they are saved in the DB
      }
    } else {
      console.warn("RESEND_API_KEY not found. Skipping email send to:", email);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Waitlist API Error:", error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
