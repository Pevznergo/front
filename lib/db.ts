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

    // Short Links table (New)
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS short_links (
        id SERIAL PRIMARY KEY,
        code VARCHAR(10) UNIQUE NOT NULL,
        target_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Link Schema Updates
    try {
      await sqlConnection`ALTER TABLE short_links ADD COLUMN IF NOT EXISTS tg_chat_id VARCHAR(100)`;
      await sqlConnection`ALTER TABLE short_links ADD COLUMN IF NOT EXISTS clicks_count INTEGER DEFAULT 0`;
      await sqlConnection`ALTER TABLE short_links ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0`;
      await sqlConnection`ALTER TABLE short_links ADD COLUMN IF NOT EXISTS last_count_update TIMESTAMP`;
      await sqlConnection`ALTER TABLE short_links ALTER COLUMN target_url DROP NOT NULL`;
      await sqlConnection`ALTER TABLE short_links ADD COLUMN IF NOT EXISTS district VARCHAR(255)`;
      await sqlConnection`ALTER TABLE short_links ADD COLUMN IF NOT EXISTS marketplace_topic_id INTEGER`;
      await sqlConnection`ALTER TABLE short_links ADD COLUMN IF NOT EXISTS reviewer_name VARCHAR(255)`;
      await sqlConnection`ALTER TABLE short_links ADD COLUMN IF NOT EXISTS org_url TEXT`;
      await sqlConnection`ALTER TABLE short_links ADD COLUMN IF NOT EXISTS contacts TEXT`;
      await sqlConnection`ALTER TABLE short_links ADD COLUMN IF NOT EXISTS email_status VARCHAR(50) DEFAULT 'pending'`;
      await sqlConnection`ALTER TABLE short_links ADD COLUMN IF NOT EXISTS smartlead_lead_id VARCHAR(100)`;
      await sqlConnection`ALTER TABLE short_links ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'не распечатан'`;
      await sqlConnection`ALTER TABLE short_links ADD COLUMN IF NOT EXISTS is_stuck BOOLEAN DEFAULT FALSE`;
    } catch (e) {
      console.warn("Schema update warning (short_links cols):", e);
    }

    // Chat Creation Queue (New)
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS chat_creation_queue (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        district VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        error TEXT,
        scheduled_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ecosystems table (New)
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS ecosystems (
        id SERIAL PRIMARY KEY,
        tg_chat_id VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        district VARCHAR(255),
        invite_link TEXT,
        marketplace_topic_id INTEGER,
        admin_topic_id INTEGER,
        member_count INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'не подключен'
      )
    `;

    // Migration: Add status column if not exists
    try {
      await sqlConnection`ALTER TABLE ecosystems ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'не подключен'`;
    } catch (e) { }

    // Migration: Populate ecosystems from short_links if empty
    const existingEcosystems = await sqlConnection`SELECT id FROM ecosystems LIMIT 1`;
    if (existingEcosystems.length === 0) {
      await sqlConnection`
        INSERT INTO ecosystems (tg_chat_id, title, district, marketplace_topic_id, member_count, created_at)
        SELECT DISTINCT ON (tg_chat_id) tg_chat_id, reviewer_name, district, marketplace_topic_id, member_count, created_at
        FROM short_links
        WHERE tg_chat_id IS NOT NULL
      `;
    }

    // Market Ads table (New)
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS market_ads (
        id SERIAL PRIMARY KEY,
        chat_id VARCHAR(100) NOT NULL,
        topic_id INTEGER,
        message_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        sender_username VARCHAR(255),
        sender_id VARCHAR(100),
        district VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chat_id, message_id)
      )
    `;

    // Invite Stats table (New)
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS invite_stats (
        id SERIAL PRIMARY KEY,
        chat_id VARCHAR(100) NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        user_name VARCHAR(255),
        invite_count INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chat_id, user_id)
      )
    `;

    // Topic Actions Queue (New)
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS topic_actions_queue (
        id SERIAL PRIMARY KEY,
        chat_id VARCHAR(100) NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        payload JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        error TEXT,
        scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}
