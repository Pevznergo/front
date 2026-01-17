import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !/.+@.+\..+/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email' }, { status: 400 })
    }

    // Create table if not exists (This should ideally be in initDatabase, but kept here for robustness)
    await sql`
      create table if not exists waitlist (
        id bigserial primary key,
        email text unique not null,
        created_at timestamptz not null default now()
      )
    `

    await sql`
      insert into waitlist (email) values (${email})
      on conflict (email) do nothing
    `

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Waitlist Error:', err)
    return NextResponse.json({ error: 'Failed to save email' }, { status: 500 })
  }
}
