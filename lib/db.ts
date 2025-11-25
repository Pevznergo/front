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
        logo VARCHAR(255) NOT NULL
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
        partner_id INTEGER REFERENCES partners(id),
        type VARCHAR(50) NOT NULL
      )
    `

    // Seed partners if empty
    const partnersCount = await sql`SELECT COUNT(*) as count FROM partners`
    if (partnersCount[0].count === '0') {
      await sql`
        INSERT INTO partners (name, role, age, bio, looking_for, discount, logo)
        VALUES 
        ('Canva', 'The Designer', 'Design Giant', 'I make your apps look stunning. Logos, assets, marketing materials - I handle it all. Pair me with Vibeflow to generate beautiful UIs instantly.', 'A creative partner.', '50% OFF', '/logos/canva.png'),
        ('n8n', 'The Automator', 'Workflow Wizard', 'I connect everything. 200+ integrations, complex logic, visual workflows. Pair me with Vibeflow to give your app a powerful backend brain.', 'Complex problems to solve.', '50% OFF', '/logos/n8n.png'),
        ('CapCut', 'The Editor', 'Viral Sensation', 'I make you go viral. Edit promo videos, add effects, and share your Vibeflow creation with the world.', 'Fame and fortune.', '50% OFF', '/logos/capcut.png')
      `
      console.log('Partners seeded successfully')
    }

    // Seed tariffs if empty
    const tariffsCount = await sql`SELECT COUNT(*) as count FROM tariffs`
    if (tariffsCount[0].count === '0') {
      // Get partner IDs
      const partners = await sql`SELECT id, name FROM partners`
      const canva = partners.find((p: any) => p.name === 'Canva')
      const n8n = partners.find((p: any) => p.name === 'n8n')
      const capcut = partners.find((p: any) => p.name === 'CapCut')

      // Platform Tariffs (Vibeflow)
      await sql`
        INSERT INTO tariffs (name, price, original_price, features, type)
        VALUES 
        ('Basic Plan', 19.00, 29.00, '["Basic Features", "Email Support"]', 'platform'),
        ('Pro Plan', 29.00, 49.00, '["Advanced Features", "Priority Support", "API Access"]', 'platform')
      `

      // Partner Tariffs
      if (canva) {
        await sql`
          INSERT INTO tariffs (name, price, original_price, features, partner_id, type)
          VALUES 
          ('Starter Plan', 10.00, 20.00, '["50 Templates", "Basic Assets"]', ${canva.id}, 'partner'),
          ('Premium Plan', 20.00, 40.00, '["Unlimited Templates", "Premium Assets", "Brand Kit"]', ${canva.id}, 'partner')
        `
      }

      if (n8n) {
        await sql`
          INSERT INTO tariffs (name, price, original_price, features, partner_id, type)
          VALUES 
          ('Starter Plan', 10.00, 20.00, '["5 Workflows", "100 Executions"]', ${n8n.id}, 'partner'),
          ('Premium Plan', 20.00, 40.00, '["Unlimited Workflows", "Unlimited Executions", "Webhook Support"]', ${n8n.id}, 'partner')
        `
      }

      if (capcut) {
        await sql`
          INSERT INTO tariffs (name, price, original_price, features, partner_id, type)
          VALUES 
          ('Starter Plan', 10.00, 20.00, '["1080p Export", "Basic Effects"]', ${capcut.id}, 'partner'),
          ('Premium Plan', 20.00, 40.00, '["4K Export", "Pro Effects", "Cloud Storage"]', ${capcut.id}, 'partner')
        `
      }

      console.log('Tariffs seeded successfully')
    }

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}
