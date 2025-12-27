import { getTelegramClient } from "@/lib/tg";
import { Api } from "telegram";
import { sql } from "@/lib/db";

export async function createEcosystem(title: string, district: string | null) {
    const client = await getTelegramClient();

    // 1. Create Supergroup
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
        throw new Error("Failed to get channel ID from response");
    }

    const channel = await client.getEntity(channelId);

    // 2. Toggle Forum Mode
    await client.invoke(
        new Api.channels.ToggleForum({
            channel: channel,
            enabled: true,
        })
    );

    // 3. Create Topics
    await client.invoke(new Api.channels.CreateForumTopic({ channel, title: "🗣 Флудилка" }));
    await client.invoke(new Api.channels.CreateForumTopic({ channel, title: "📢 Новости" }));

    const marketTopicResult = await client.invoke(
        new Api.channels.CreateForumTopic({
            channel: channel,
            title: "🛒 БАРАХОЛКА",
        })
    ) as any;

    const marketplaceTopicId = marketTopicResult?.updates?.updates?.find((u: any) => u.className === 'UpdateNewForumTopic')?.topic?.id
        || marketTopicResult?.updates?.find((u: any) => u.className === 'UpdateNewForumTopic')?.topic?.id;

    await client.invoke(new Api.channels.CreateForumTopic({ channel, title: "🛠 Услуги" }));

    // 4. Generate Invite Link
    const inviteLinkResult = await client.invoke(
        new Api.messages.ExportChatInvite({ peer: channel })
    ) as any;

    const inviteLink = inviteLinkResult.link;

    // 5. Generate Short Code
    const generateCode = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let res = '';
        for (let i = 0; i < 6; i++) {
            res += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return res;
    };

    let shortCode = generateCode();
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

    // 6. Save to database
    await sql`
        INSERT INTO short_links (code, target_url, tg_chat_id, district, marketplace_topic_id, reviewer_name, status)
        VALUES (${shortCode}, ${inviteLink}, ${channelId.toString()}, ${district || null}, ${marketplaceTopicId || null}, ${title}, 'подключен')
    `;

    return {
        inviteLink,
        shortCode,
        chatId: channelId.toString()
    };
}
