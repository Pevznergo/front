
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { sql } from '@/lib/db';

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: "136560219104-tieaa9h4tupbo07shb8l6idmto5t9hhk.apps.googleusercontent.com",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "", // User needs to provide this
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                try {
                    const { email, name, image } = user;
                    // Upsert user
                    // We use ON CONFLICT to do nothing if exists, or update?
                    // Since we don't have constraints on name/image, maybe just ensure existence.
                    // Note: The users table might have 'password' column. We made it nullable.

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
                    console.error("Error saving user to DB:", error);
                    return false;
                }
            }
            return true;
        },
        async session({ session, token }) {
            // You could attach user ID here if needed
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login', // Error code passed in query string as ?error=
    }
});

export { handler as GET, handler as POST };
