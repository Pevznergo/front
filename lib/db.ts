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

    // Flood Control table (New - Global Lock)
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS flood_control (
        key VARCHAR(50) PRIMARY KEY,
        expires_at TIMESTAMP NOT NULL
      )
    `;

    // Telegram Web App Users
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS app_users (
        telegram_id BIGINT PRIMARY KEY,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        username VARCHAR(255),
        points INTEGER DEFAULT 0,
        spins_count INTEGER DEFAULT 0,
        daily_streak INTEGER DEFAULT 0,
        last_daily_claim TIMESTAMP,
        last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Migration for existing users
    try {
      await sqlConnection`ALTER TABLE app_users ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0`;
      await sqlConnection`ALTER TABLE app_users ADD COLUMN IF NOT EXISTS last_daily_claim TIMESTAMP`;
    } catch (e) { }

    // Prizes table
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS prizes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL, -- 'points', 'coupon', 'physical'
        value VARCHAR(255), -- '50', '10%', 'iPhone'
        probability DECIMAL(5,2) DEFAULT 0, -- percentage 0-100
        image_url TEXT,
        quantity INTEGER, -- NULL = Unlimited
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Migration: Add quantity column if not exists
    try {
      await sqlConnection`ALTER TABLE prizes ADD COLUMN IF NOT EXISTS quantity INTEGER`;
    } catch (e) { }

    // Seed prizes if empty
    const existingPrizes = await sqlConnection`SELECT count(*) as count FROM prizes`;
    if (existingPrizes[0].count == 0) {
      await sqlConnection`
        INSERT INTO prizes (name, type, value, probability, description) VALUES
        ('5 Баллов', 'points', '5', 30.00, 'Утешительный приз'),
        ('10 Баллов', 'points', '10', 25.00, 'Вернули ставку'),
        ('20 Баллов', 'points', '20', 20.00, 'В плюсе!'),
        ('50 Баллов', 'points', '50', 10.00, 'Крупный выигрыш'),
        ('Сертификат OZON', 'coupon', 'ozon_500', 5.00, '500₽ на Ozon'),
        ('Сертификат WB', 'coupon', 'wb_1000', 3.00, '1000₽ на Wildberries'),
        ('VIP Статус', 'status', 'vip', 6.00, 'VIP на неделю'),
        ('iPhone 15', 'physical', 'iphone', 1.00, 'Главный приз!')
      `;
    }

    // User Prizes table (New)
    await sqlConnection`
      CREATE TABLE IF NOT EXISTS user_prizes (
        id SERIAL PRIMARY KEY,
        telegram_id BIGINT REFERENCES app_users(telegram_id),
        prize_id INTEGER REFERENCES prizes(id),
        won_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expiry_at TIMESTAMP,
        promo_code VARCHAR(255),
        is_used BOOLEAN DEFAULT FALSE
      )
    `;

    // Migration: Add missing columns to user_prizes
    try {
      await sqlConnection`ALTER TABLE user_prizes ADD COLUMN IF NOT EXISTS telegram_id BIGINT`;
      await sqlConnection`ALTER TABLE user_prizes ADD COLUMN IF NOT EXISTS prize_id INTEGER`;
      await sqlConnection`ALTER TABLE user_prizes ADD COLUMN IF NOT EXISTS won_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
      await sqlConnection`ALTER TABLE user_prizes ADD COLUMN IF NOT EXISTS expiry_at TIMESTAMP`;
      await sqlConnection`ALTER TABLE user_prizes ADD COLUMN IF NOT EXISTS promo_code VARCHAR(255)`;
      await sqlConnection`ALTER TABLE user_prizes ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT FALSE`;

      // Ensure constraints exist (Postgres doesn't support IF NOT EXISTS for constraints easily in one line, 
      // so we assume if column exists, FK might need manual check, but usually adding columns is the main issue)
    } catch (e) {
      console.warn('Migration warning for user_prizes:', e)
    }

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

// Flood Wait Helpers
export async function getFloodWait(): Promise<number> {
  const result = await sql`SELECT expires_at FROM flood_control WHERE key = 'telegram_global'`;
  if (result.length === 0) return 0;

  const now = new Date();
  const expires = new Date(result[0].expires_at);

  if (expires > now) {
    return Math.ceil((expires.getTime() - now.getTime()) / 1000);
  }
  return 0;
}

export async function setFloodWait(seconds: number) {
  // Add small buffer (1s) to be safe
  const bufferSeconds = seconds + 1;
  await sql`
        INSERT INTO flood_control (key, expires_at)
        VALUES ('telegram_global', NOW() + (${bufferSeconds} || ' seconds')::INTERVAL)
        ON CONFLICT (key) DO UPDATE SET
            expires_at = EXCLUDED.expires_at
    `;
}
