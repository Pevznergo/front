'use server';

import { sql, initDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function registerUser(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    try {
        await initDatabase();

        // Check if user exists
        const existingUser = await sql`SELECT * FROM "User" WHERE email = ${email}`;
        if (existingUser.length > 0) {
            return { error: 'User already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const name = email.split('@')[0]; // Default name

        await sql`
      INSERT INTO "User" (email, password, name)
      VALUES (${email}, ${hashedPassword}, ${name})
    `;

        return { success: true };
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Failed to create account' };
    }
}
