import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

export const sql = neon(process.env.DATABASE_URL)

// Инициализация таблицы пользователей и партнеров
export async function initDatabase() {
  try {
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Partners table
    await sql`
      CREATE TABLE IF NOT EXISTS partners (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        age VARCHAR(255) NOT NULL,
        bio TEXT NOT NULL,
        looking_for VARCHAR(255) NOT NULL,
        discount VARCHAR(255) NOT NULL,
        logo VARCHAR(255) NOT NULL,
        is_platform BOOLEAN DEFAULT FALSE,
        is_partner BOOLEAN DEFAULT TRUE
      )
    `

    // Tariffs table
    await sql`
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

    // ==========================================
    // SEEDING DISABLED - Use Admin Panel or Reseed button
    // ==========================================
    // Partners and tariffs are now managed via Admin Panel
    // To reset to default data, use the "Reset to Default Data" button in Admin

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}
