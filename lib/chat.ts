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
            about: `Чат жильцов дома ${title}${district ? `, ${district}` : ""}`,
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

    // 2.5 Set Default Permissions
    // Allow: Invite Users (inviteUsers: false)
    // Block: Change Info, Pin Messages (create topics)
    await client.invoke(
        new Api.messages.EditChatDefaultBannedRights({
            peer: channel,
            bannedRights: new Api.ChatBannedRights({
                untilDate: 0,
                viewMessages: false,
                sendMessages: false,
                sendMedia: false,
                sendStickers: false,
                sendGifs: false,
                sendGames: false,
                sendInline: false,
                embedLinks: false,
                sendPolls: false,
                changeInfo: true, // BANNED: Cannot change info (or create topics)
                inviteUsers: false, // ALLOWED: Can invite users
                pinMessages: true, // BANNED: Cannot pin
            }),
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
            message: "Чтобы участвовать в голосовании - отправьте + в этом чате.",
            replyTo: adminTopicId
        });
    }

    // 3.5 Invite Bots
    const bots = ['aportopost_bot', 'justaskmari_bot', 'aportomessage_bot', 'aportostats_bot'];
    for (const bot of bots) {
        try {
            await client.invoke(
                new Api.channels.InviteToChannel({
                    channel: channel,
                    users: [bot]
                })
            );
            console.log(`Invited bot ${bot} to chat`);
        } catch (e) {
            console.warn(`Failed to invite bot ${bot}:`, e);
        }
    }

    // 4. Generate Invite Link
    const inviteLinkResult = await client.invoke(
        new Api.messages.ExportChatInvite({ peer: channel })
    ) as any;

    const inviteLink = inviteLinkResult.link;

    // 5. Save to database (Ecosystems table)
    await sql`
        INSERT INTO ecosystems (tg_chat_id, title, district, marketplace_topic_id, admin_topic_id, invite_link, status)
        VALUES (${channelId.toString()}, ${title}, ${district || null}, ${marketplaceTopicId || null}, ${adminTopicId || null}, ${inviteLink}, 'не подключен')
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

// Helper to robustly resolve entity (handles session cache issues)
export async function getChatEntity(client: any, chatId: string) {
    try {
        // Try direct resolution first
        // If chatId is "naked" (no -100), GramJS might think it's a User.
        // If it's a channel, it usually needs to be found in cache or passed as PeerChannel.
        return await client.getEntity(chatId);
    } catch (e: any) {
        if (e.message && (e.message.includes("Could not find the input entity") || e.message.includes("PeerUser"))) {
            console.log(`[Telegram] Entity ${chatId} not found in cache, fetching dialogs...`);
            // Fetch dialogs to populate cache
            const dialogs = await client.getDialogs({ limit: 100 });

            // Try to find manually to be sure
            const found = dialogs.find((d: any) => {
                const id = d.entity?.id?.toString();
                // Match exact ID, or ID with/without -100 prefix
                return id === chatId ||
                    `-100${id}` === chatId ||
                    id === chatId.replace('-100', '');
            });

            if (found && found.entity) {
                console.log(`[Telegram] Found entity via dialogs: ${found.entity.title} (${found.entity.id})`);
                return found.entity;
            }
        }
        throw e;
    }
}

export async function sendTopicMessage(chatId: string, topicId: number, message: string, pin: boolean = false) {
    const client = await getTelegramClient();
    const entity = await getChatEntity(client, chatId);

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
    const entity = await getChatEntity(client, chatId);

    await client.invoke(new Api.channels.EditForumTopic({
        channel: entity,
        topicId: topicId,
        closed: closed
    }));
}

export async function updateChatTitle(chatId: string, title: string) {
    const client = await getTelegramClient();
    const entity = await getChatEntity(client, chatId);

    await client.invoke(
        new Api.channels.EditTitle({
            channel: entity,
            title: title
        })
    );
}
