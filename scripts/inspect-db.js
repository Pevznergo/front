const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not defined in .env');
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

console.log('Connected to DB Host:', new URL(process.env.DATABASE_URL).hostname);

async function inspect() {
    try {
        console.log('--- PARTNERS ---');
        const partners = await sql`SELECT id, name, is_platform, is_partner FROM partners ORDER BY id`;
        console.table(partners);

        console.log('\n--- TARIFFS ---');
        const tariffs = await sql`SELECT id, name, price, original_price, partner_id, type, billing_period FROM tariffs ORDER BY partner_id, id`;
        console.table(tariffs);

    } catch (error) {
        console.error('Database Error:', error);
    }
}

inspect();
