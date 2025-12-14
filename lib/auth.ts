
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql, initDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: "136560219104-tieaa9h4tupbo07shb8l6idmto5t9hhk.apps.googleusercontent.com",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const users = await sql`SELECT * FROM users WHERE email = ${credentials.email}`;
                    const user = users[0];

                    if (user && user.password) {
                        const isValid = await bcrypt.compare(credentials.password, user.password);
                        if (isValid) {
                            return { id: user.id, name: user.name, email: user.email };
                        }
                    }
                    return null;
                } catch (e) {
                    console.error("Auth error:", e);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }: any) {
            if (account?.provider === 'google') {
                try {
                    const { email, name, image } = user;
                    // Ensure DB is initialized
                    await initDatabase();

                    // Check if user exists
                    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;

                    if (existingUser.length === 0) {
                        await sql`
               INSERT INTO users (email, name, password)
               VALUES (${email}, ${name}, NULL)
             `;
                    }
                    return true;
                } catch (error) {
                    console.error("CRITICAL DB ERROR during sign in:", error);
                    return true;
                }
            }
            return true;
        },
        async session({ session, token }: any) {
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login',
    }
};
