import { NextRequest, NextResponse } from "next/server";
import { getTelegramClient } from "@/lib/tg";
import { Api } from "telegram";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

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
        const client = await getTelegramClient();

        // 3. Create Supergroup
        const createResult = await client.invoke(
            new Api.channels.CreateChannel({
                title: title,
                about: `Автоматически созданная экосистема для ${title}${district ? ` (${district})` : ""}`,
                megagroup: true,
            })
        ) as any;

        const chats = createResult.chats || [];
        const chat = chats.find((c: any) => c.className === 'Channel' || c.className === 'Chat' || c.id);
        const channelId = chat?.id;

        if (!channelId) {
            console.error("CreateChannel result:", JSON.stringify(createResult, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value, 2));
            throw new Error("Failed to get channel ID from response");
        }

        // Need the full entity to work with it
        const channel = await client.getEntity(channelId);

        // 4. Toggle Forum Mode
        await client.invoke(
            new Api.channels.ToggleForum({
                channel: channel,
                enabled: true,
            })
        );

        /**
         * 5. Create Topics
         */

        // Topic 1: 🗣 Флудилка
        await client.invoke(
            new Api.channels.CreateForumTopic({
                channel: channel,
                title: "🗣 Флудилка",
            })
        );

        // Topic 2: 📢 Новости
        await client.invoke(
            new Api.channels.CreateForumTopic({
                channel: channel,
                title: "📢 Новости",
            })
        );

        // Topic 3: 🛒 БАРАХОЛКА (Capture ID)
        const marketTopicResult = await client.invoke(
            new Api.channels.CreateForumTopic({
                channel: channel,
                title: "🛒 БАРАХОЛКА",
            })
        ) as any;

        const marketplaceTopicId = marketTopicResult?.updates?.updates?.find((u: any) => u.className === 'UpdateNewForumTopic')?.topic?.id
            || marketTopicResult?.updates?.find((u: any) => u.className === 'UpdateNewForumTopic')?.topic?.id;

        // Log for debugging if ID capture fails
        if (!marketplaceTopicId) {
            console.log("Marketplace Topic ID not captured directly from result. Updates:", JSON.stringify(marketTopicResult.updates));
        }

        // Topic 4: 👋 Услуги
        await client.invoke(
            new Api.channels.CreateForumTopic({
                channel: channel,
                title: "🛠 Услуги",
            })
        );

        // 6. Generate Invite Link
        const inviteLinkResult = await client.invoke(
            new Api.messages.ExportChatInvite({
                peer: channel,
            })
        ) as any;

        const inviteLink = inviteLinkResult.link;

        // 7. Save to database with a unique short code
        // Simple random code generator
        const generateCode = () => {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let res = '';
            for (let i = 0; i < 6; i++) {
                res += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return res;
        };

        let shortCode = generateCode();
        // Check for collision (basic attempt)
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 5) {
            const existing = await sql`SELECT id FROM short_links WHERE code = ${shortCode}`;
            if (existing.length === 0) {
                isUnique = true;
            } else {
                shortCode = generateCode();
                attempts++;
            }
        }

        await sql`
            INSERT INTO short_links (code, target_url, tg_chat_id, district, marketplace_topic_id)
            VALUES (${shortCode}, ${inviteLink}, ${channelId.toString()}, ${district || null}, ${marketplaceTopicId || null})
        `;

        const shortUrl = `https://aporto.tech/r/${shortCode}`;

        return NextResponse.json({
            success: true,
            link: inviteLink,
            shortUrl: shortUrl,
            shortCode: shortCode,
            chatId: channelId.toString()
        });

    } catch (error: any) {
        console.error("Telegram Error:", error);

        // Handle Flood Wait
        if (error.errorMessage?.includes("FLOOD_WAIT")) {
            const seconds = error.errorMessage.match(/\d+/)?.[0] || "some";
            return NextResponse.json({
                error: `Telegram limits reached. Please wait ${seconds} seconds.`
            }, { status: 429 });
        }

        return NextResponse.json({
            error: error.message || "Failed to create ecosystem"
        }, { status: 500 });
    }
}
