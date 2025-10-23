import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sql } from '@/lib/db'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    // Инициализация таблицы если её нет
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    const { email, password, name } = await request.json()

    // Валидация
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Проверка существующего пользователя
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создание пользователя
    const result = await sql`
      INSERT INTO users (email, name, password)
      VALUES (${email}, ${name}, ${hashedPassword})
      RETURNING id, email, name, created_at
    `

    const user = result[0]

    // Создание JWT токена
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        hint: 'Check if DATABASE_URL is set in .env.local'
      },
      { status: 500 }
    )
  }
}
