const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

if (!process.env.POSTGRES_URL) {
    console.error('Error: POSTGRES_URL is not defined in .env');
    process.exit(1);
}

const sql = neon(process.env.POSTGRES_URL);

async function migrate() {
    try {
        console.log('Starting migration...');
        console.log('Connected to DB Host:', new URL(process.env.POSTGRES_URL).hostname);

        // Check if columns exist
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'partners'
        `;

        const columnNames = columns.map(c => c.column_name);
        console.log('Current columns:', columnNames);

        // Add is_platform if missing
        if (!columnNames.includes('is_platform')) {
            console.log('Adding is_platform column...');
            await sql`ALTER TABLE partners ADD COLUMN is_platform BOOLEAN DEFAULT FALSE`;
            console.log('is_platform added.');
        } else {
            console.log('is_platform already exists.');
        }

        // Add is_partner if missing
        if (!columnNames.includes('is_partner')) {
            console.log('Adding is_partner column...');
            await sql`ALTER TABLE partners ADD COLUMN is_partner BOOLEAN DEFAULT TRUE`;
            console.log('is_partner added.');
        } else {
            console.log('is_partner already exists.');
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
