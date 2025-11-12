import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !/.+@.+\..+/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email' }, { status: 400 })
    }

    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      return NextResponse.json({ error: 'DATABASE_URL is not configured' }, { status: 500 })
    }

    const sql = neon(connectionString)

    // Create table if not exists
    await sql/* sql */`
      create table if not exists waitlist (
        id bigserial primary key,
        email text unique not null,
        created_at timestamptz not null default now()
      )
    `

    await sql/* sql */`
      insert into waitlist (email) values (${email})
      on conflict (email) do nothing
    `

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save email' }, { status: 500 })
  }
}
