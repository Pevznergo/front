import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const district = searchParams.get("district");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        let ads;
        if (district) {
            ads = await sql`
                SELECT * FROM market_ads 
                WHERE district = ${district}
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
        } else {
            ads = await sql`
                SELECT * FROM market_ads 
                ORDER BY created_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
        }

        return NextResponse.json({
            success: true,
            ads: ads
        });
    } catch (error: any) {
        console.error("Fetch Ads Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
