import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sql } from '@/lib/db'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    // Проверка существования таблицы
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    const { email, password } = await request.json()

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Поиск пользователя
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = users[0]

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

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
    console.error('Login error:', error)
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
