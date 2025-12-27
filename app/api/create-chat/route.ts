import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createEcosystem } from "@/lib/chat";

export async function POST(req: NextRequest) {
    // 1. Auth check (NextAuth session)
    const session = await getServerSession(authOptions);
    const ALLOWED_EMAIL = "pevznergo@gmail.com";

    if (!session || session.user?.email !== ALLOWED_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Secret Key Check (Optional extra layer as requested)
    const secretKey = req.headers.get("X-Secret-Key");
    if (process.env.APP_SECRET_KEY && secretKey !== process.env.APP_SECRET_KEY) {
        return NextResponse.json({ error: "Invalid secret key" }, { status: 403 });
    }

    const { title, district } = await req.json();
    if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    try {
        const result = await createEcosystem(title, district);
        const shortUrl = `https://aporto.tech/r/${result.shortCode}`;

        return NextResponse.json({
            success: true,
            link: result.inviteLink,
            shortUrl: shortUrl,
            shortCode: result.shortCode,
            chatId: result.chatId
        });
    } catch (error: any) {
        console.error("Telegram Error:", error);

        if (error.errorMessage?.includes("FLOOD_WAIT")) {
            const seconds = error.errorMessage.match(/\d+/)?.[0] || "some";
            return NextResponse.json({
                error: `Telegram limits reached. Please wait ${seconds} seconds.`
            }, { status: 429 });
        }

        return NextResponse.json({ error: error.message || "Failed to create ecosystem" }, { status: 500 });
    }
}
