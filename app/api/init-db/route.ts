import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    // Создание таблицы users если её нет
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Проверка существующих пользователей
    const users = await sql`SELECT COUNT(*) as count FROM users`
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      usersCount: users[0].count
    })
  } catch (error: any) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
