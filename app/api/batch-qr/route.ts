import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Function to generate a short code
function generateCode(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export async function POST(req: NextRequest) {
    try {
        await initDatabase();

        // 1. Auth check
        const session = await getServerSession(authOptions);
        const ALLOWED_EMAIL = "pevznergo@gmail.com";
        if (!session || session.user?.email !== ALLOWED_EMAIL) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const count = 200;
        const generatedCodes: string[] = [];

        // We'll insert codes one by one to handle potential (though unlikely) collisions
        // For 200 items, this is acceptable for a management tool.

        let successCount = 0;
        let attempts = 0;
        const maxAttempts = count * 2; // Allow some retries for collisions

        while (successCount < count && attempts < maxAttempts) {
            attempts++;
            const code = generateCode(6);

            try {
                await sql`
                    INSERT INTO short_links (code, target_url)
                    VALUES (${code}, NULL)
                `;
                generatedCodes.push(code);
                successCount++;
            } catch (e: any) {
                // If unique check fails (code 23505 in Postgres), we just let it retry in the next loop iteration
                if (e.code !== '23505') {
                    throw e; // Some other error
                }
            }
        }

        if (successCount < count) {
            return NextResponse.json({
                success: false,
                error: `Generated only ${successCount} out of ${count} codes due to excessive collisions.`
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count: successCount,
            codes: generatedCodes
        });

    } catch (error: any) {
        console.error("Batch QR Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
