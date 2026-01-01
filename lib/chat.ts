import { getTelegramClient } from "@/lib/tg";
import { Api } from "telegram";
import { sql } from "@/lib/db";

export async function createEcosystem(title: string, district: string | null) {
    const client = await getTelegramClient();

    // 1. Create Supergroup
    const chatTitle = `Дом ${title}${district ? `, ${district}` : ""}`;
    const createResult = await client.invoke(
        new Api.channels.CreateChannel({
            title: chatTitle,
            about: `Официальный чат: ${chatTitle}. Присоединяйтесь к соседям!`,
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

    const adminTopicResult = await client.invoke(
        new Api.channels.CreateForumTopic({
            channel: channel,
            title: "‼️ ВЫБОР АДМИНА",
        })
    ) as any;

    const adminTopicId = adminTopicResult?.updates?.updates?.find((u: any) => u.className === 'UpdateNewForumTopic')?.topic?.id
        || adminTopicResult?.updates?.find((u: any) => u.className === 'UpdateNewForumTopic')?.topic?.id;

    if (adminTopicId) {
        await client.sendMessage(channel, {
            message: "Кто пригласит больше всех соседей в чат, тот станет Администратором! 🏆\n\nПриглашать можно в настройках группы (нажмите на название чата -> Добавить участников). \n\nМы отслеживаем количество приглашенных и объявим результат!",
            replyTo: adminTopicId
        });
    }

    // 4. Generate Invite Link
    const inviteLinkResult = await client.invoke(
        new Api.messages.ExportChatInvite({ peer: channel })
    ) as any;

    const inviteLink = inviteLinkResult.link;

    // 5. Save to database (Ecosystems table)
    await sql`
        INSERT INTO ecosystems (tg_chat_id, title, district, marketplace_topic_id, admin_topic_id, invite_link)
        VALUES (${channelId.toString()}, ${title}, ${district || null}, ${marketplaceTopicId || null}, ${adminTopicId || null}, ${inviteLink})
        ON CONFLICT (tg_chat_id) DO UPDATE SET
            title = EXCLUDED.title,
            district = EXCLUDED.district,
            invite_link = EXCLUDED.invite_link,
            marketplace_topic_id = EXCLUDED.marketplace_topic_id,
            admin_topic_id = EXCLUDED.admin_topic_id,
            last_updated = CURRENT_TIMESTAMP
    `;

    return {
        inviteLink,
        chatId: channelId.toString()
    };
}

export async function sendTopicMessage(chatId: string, topicId: number, message: string, pin: boolean = false) {
    const client = await getTelegramClient();
    const entity = await client.getEntity(chatId);

    const result = await client.sendMessage(entity, {
        message,
        replyTo: topicId
    });

    if (pin && result.id) {
        await client.invoke(new Api.messages.UpdatePinnedMessage({
            peer: entity,
            id: result.id
        }));
    }
    return result;
}

export async function setTopicClosed(chatId: string, topicId: number, closed: boolean) {
    const client = await getTelegramClient();
    const entity = await client.getEntity(chatId);

    await client.invoke(new Api.channels.EditForumTopic({
        channel: entity,
        topicId: topicId,
        closed: closed
    }));
}
