import { neon } from '@neondatabase/serverless'

// Helper to get safe SQL connection
const getSql = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined')
  }
  return neon(process.env.DATABASE_URL)
}

// Export a wrapper that initializes on first use
export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  const sqlConnection = getSql()
  return sqlConnection(strings, ...values)
}

// Инициализация таблицы пользователей и партнеров
export async function initDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL is not defined, skipping database initialization')
      return
    }

    const sqlConnection = getSql()

    // Users table
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Partners table
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS partners (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age VARCHAR(255) NOT NULL,
        bio TEXT NOT NULL,
        discount VARCHAR(255) NOT NULL,
        logo VARCHAR(255) NOT NULL,
        is_platform BOOLEAN DEFAULT FALSE,
        is_partner BOOLEAN DEFAULT TRUE
      )
    `

    // Tariffs table
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS tariffs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        features TEXT NOT NULL,
        partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        billing_period VARCHAR(20) DEFAULT 'monthly'
      )
    `

    // Reviews table
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        user_email VARCHAR(255)
      )
    `
    // Note: referencing by email is easier if user table IDs vary between auth methods, but linking by ID is better. 
    // Let's add user_id column and try to alter password.

    try {
      await sqlConnection`ALTER TABLE users ALTER COLUMN password DROP NOT NULL`
    } catch (e) {
      // Ignore if already nullable or other error (e.g. column doesn't exist yet on fresh init, which is handled by CREATE above if I change it there)
    }

    // Since CREATE TABLE IF NOT EXISTS doesn't update existing tables, we run ALTERs
    try {
      await sqlConnection`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_email VARCHAR(255)`
    } catch (e) { }

    // Analysis Requests table (New)
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS analysis_requests (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        source VARCHAR(50) NOT NULL,
        user_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}
