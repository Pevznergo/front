import { NextRequest, NextResponse } from "next/server";
import { sql, initDatabase } from "@/lib/db";

// Force dynamic to ensure we don't cache webhook responses
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { event, object } = body;

        // 1. Basic Validation
        if (!event || !object) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // 2. Handle Payment Succeeded
        if (event === "payment.succeeded") {
            const { metadata, status, paid } = object;

            // Double check status just in case
            if (status !== "succeeded" || !paid) {
                console.warn("Payment event received but status not succeeded:", object.id);
                return NextResponse.json({ status: "ignored" });
            }

            const userId = metadata?.userId; // Telegram ID

            if (!userId) {
                console.error("Payment succeeded but no userId in metadata:", object.id);
                return NextResponse.json({ status: "ignored_no_user" });
            }

            console.log(`Processing successful payment for user: ${userId}`);

            await initDatabase();

            // 3. Update User Status (Pro Upgrade)
            await sql`
                UPDATE "User" 
                SET has_paid = TRUE 
                WHERE "telegramId" = ${userId}
            `;

            // 3.5 Save Subscription (if tariff info is present)
            const tariffSlug = metadata?.tariff_slug;
            const paymentMethodId = object.payment_method?.id;

            if (tariffSlug && paymentMethodId) {
                console.log(`Saving subscription for user ${userId}, tariff ${tariffSlug}`);

                // Get internal User ID
                const userRes = await sql`SELECT id FROM "User" WHERE "telegramId" = ${userId}`;
                const internalUserId = userRes[0]?.id;

                if (internalUserId) {
                    // Get Tariff Duration
                    const tariffRes = await sql`SELECT "duration_days" FROM "Tariff" WHERE slug = ${tariffSlug}`;
                    const durationDays = tariffRes[0]?.duration_days || 30;

                    // Calculate End Date
                    const endDate = new Date();
                    endDate.setDate(endDate.getDate() + durationDays);

                    // Insert Subscription
                    await sql`
                        INSERT INTO "Subscription" ("userId", "tariff_slug", "payment_method_id", "end_date", "status", "auto_renew")
                        VALUES (${internalUserId}, ${tariffSlug}, ${paymentMethodId}, ${endDate}, 'active', true)
                    `;
                }
            }

            // 4. Referral Reward Logic
            // Check if this user was referred by someone and hasn't triggered a reward yet
            const referralRecord = await sql`
                SELECT referrer_id, status 
                FROM referrals 
                WHERE referred_id = ${userId}
            `;

            if (referralRecord.length > 0) {
                const { referrer_id, status } = referralRecord[0];

                // Only award if not already upgraded (prevent double reward on duplicate webhooks)
                if (status !== 'pro_upgraded') {
                    console.log(`Awarding referral bonus to referrer ${referrer_id} for user ${userId}`);

                    // Award 1000 tokens (balance) to referrer
                    // Note: balance is varchar in schema, ideally should be int. 
                    // Casting to int for calculation and back to string if needed, or relying on PG implicit cast if column allows.
                    // Schema says: balance varchar(255) default "0". 
                    // Let's use SQL casting to be safe.

                    await sql`
                        UPDATE "User"
                        SET balance = (COALESCE(balance::INTEGER, 0) + 1000)::VARCHAR
                        WHERE "telegramId" = ${referrer_id}
                    `;

                    // Update referral status
                    await sql`
                        UPDATE referrals 
                        SET status = 'pro_upgraded', 
                            reward_amount = COALESCE(reward_amount, 0) + 1000
                        WHERE referred_id = ${userId}
                    `;
                } else {
                    console.log(`Referral already upgraded for user ${userId}, skipping reward.`);
                }
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (e: any) {
        console.error("Payment Webhook Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
