const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

if (!process.env.POSTGRES_URL) {
    console.error('Error: POSTGRES_URL is not defined in .env');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

const sql = async (strings, ...values) => {
    const text = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ''), '');
    const client = await pool.connect();
    try {
        const res = await client.query(text, values);
        return res.rows;
    } finally {
        client.release();
    }
}

console.log('Connected to DB Host:', new URL(process.env.POSTGRES_URL).hostname);

async function inspect() {
    try {
        console.log('--- USER TABLE SCHEMA ---');
        const userSchema = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'User'
            ORDER BY ordinal_position
        `;
        console.table(userSchema);

        console.log('\n--- USER TABLE DATA (first 5) ---');
        const users = await sql`SELECT id, email, name, telegram_id, points, utm_source, utm_campaign FROM "User" LIMIT 5`;
        console.table(users);

        console.log('\n--- APP_USERS TABLE (if exists) ---');
        const appUsersExists = await sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'app_users')`;
        if (appUsersExists[0].exists) {
            const appUsers = await sql`SELECT * FROM app_users LIMIT 5`;
            console.table(appUsers);
        } else {
            console.log('app_users table does not exist (expected after migration)');
        }

        await pool.end();
    } catch (error) {
        console.error('Database Error:', error);
        await pool.end();
    }
}

inspect();
