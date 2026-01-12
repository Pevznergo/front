import { getTelegramClient } from "@/lib/tg";
import { Api } from "telegram";
import { sql } from "@/lib/db";

export async function createEcosystem(title: string, district: string | null) {
    const client = await getTelegramClient();

    // 0.5 Check for Duplicates
    await checkDuplicateEcosystem(title, district);

    // 1. Process Title
    let street = title;
    let house = "";

    if (title.includes(',')) {
        // Handle "Street, House" or "House, Street"
        const parts = title.split(',').map(p => p.trim());
        if (parts.length >= 2) {
            const part1 = parts[0];
            const part2 = parts[1];

            if (/^\d/.test(part1)) {
                house = part1;
                street = part2;
            } else {
                street = part1;
                house = part2;
            }
        }
    } else {
        // Try to handle "Street House" format (e.g. "Lenina 5")
        // Check if last part is a number
        const parts = title.split(' ');
        if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            if (/^\d/.test(lastPart)) {
                house = lastPart;
                street = parts.slice(0, -1).join(' ');
            }
        }
    }

    // 1. Create Supergroup
    // Format: 🏠 Соседи д. 59 | Сергея Акимова | Нижний Новгород
    const chatTitle = house
        ? `🏠 Соседи д. ${house} | ${street}${district ? ` | ${district}` : ""}`
        : `🏠 Соседи | ${street}${district ? ` | ${district}` : ""}`;

    const createResult = await client.invoke(
        new Api.channels.CreateChannel({
            title: chatTitle,
            about: house
                ? `Чат соседей дома ${house} по улице ${street}${district ? `, ${district}` : ""}`
                : `Чат соседей: ${street}${district ? `, ${district}` : ""}`,
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

    const servicesTopicResult = await client.invoke(new Api.channels.CreateForumTopic({ channel, title: "🛠 Услуги" })) as any;
    const servicesTopicId = servicesTopicResult?.updates?.updates?.find((u: any) => u.className === 'UpdateNewForumTopic')?.topic?.id
        || servicesTopicResult?.updates?.find((u: any) => u.className === 'UpdateNewForumTopic')?.topic?.id;

    if (servicesTopicId) {
        await client.invoke(new Api.channels.EditForumTopic({
            channel: channel,
            topicId: servicesTopicId,
            closed: true
        }));
    }

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
            message: "Чтобы стать кандидатом в голосовании за выбор Админа Чата, оставьте здесь любое сообщение.",
            replyTo: adminTopicId
        });
    }

    // 3.5 Invite Bots & Promote to Admin
    const bots = ['aportopost_bot', 'justaskmari_bot', 'aportomessage_bot', 'aportostats_bot'];

    // Bots that need Admin rights (to create topics, pin, etc.)
    const adminBots = ['aportopost_bot', 'aportomessage_bot'];

    for (const bot of bots) {
        try {
            await client.invoke(
                new Api.channels.InviteToChannel({
                    channel: channel,
                    users: [bot]
                })
            );
            console.log(`Invited bot ${bot} to chat`);

            if (adminBots.includes(bot)) {
                const botEntity = await client.getEntity(bot);
                await client.invoke(new Api.channels.EditAdmin({
                    channel: channel,
                    userId: botEntity,
                    adminRights: new Api.ChatAdminRights({
                        changeInfo: true,
                        postMessages: true,
                        editMessages: true,
                        deleteMessages: true,
                        banUsers: true,
                        inviteUsers: true,
                        pinMessages: true,
                        addAdmins: false,
                        anonymous: false,
                        manageCall: true,
                        other: true,
                        // @ts-ignore
                        manageTopics: true
                    }),
                    rank: "Bot Admin"
                }));
                console.log(`Promoted ${bot} to Admin`);
            } else if (bot === 'justaskmari_bot') {
                try {
                    const botEntity = await client.getEntity(bot);
                    await client.invoke(
                        new Api.channels.EditBanned({
                            channel: channel,
                            participant: botEntity,
                            bannedRights: new Api.ChatBannedRights({
                                untilDate: 0,
                                viewMessages: false,
                                sendMessages: true, // BANNED
                                sendMedia: true,
                                sendStickers: true,
                                sendGifs: true,
                                sendGames: true,
                                sendInline: true,
                                embedLinks: true,
                                sendPolls: true,
                                changeInfo: true,
                                inviteUsers: true,
                                pinMessages: true,
                            })
                        })
                    );
                    console.log('Restricted justaskmari_bot (read-only)');
                } catch (e) {
                    console.warn('Failed to restrict justaskmari_bot:', e);
                }
            }
        } catch (e) {
            console.warn(`Failed to invite/promote bot ${bot}:`, e);
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

    // 6. Schedule Post-Creation Tasks (Async)
    if (adminTopicId) {
        try {
            // Task 2: Admin Election Poll (Message removed as we send it immediately now)
            await sql`
                INSERT INTO unified_queue (type, payload, status, scheduled_at, created_at)
                VALUES (
                    'create_poll',
                    ${JSON.stringify({
                chat_id: channelId.toString(),
                topicId: adminTopicId,
                question: "Выбираем АДмина",
                options: ["Вариант 1", "Вариант 2"],
                pin: false
            })},
                    'pending',
                    NOW() + INTERVAL '1 MINUTE',
                    NOW()
                )
            `;
            console.log("Scheduled post-creation tasks for admin topic.");
        } catch (e) {
            console.error("Failed to schedule post-creation tasks:", e);
        }
    }

    // Fail-Safe: Ensure Services topic is closed
    // We call this helper to find and close "Services" topics.
    try {
        await blockMarketingTopics(channelId.toString());
    } catch (e) {
        console.error("Failed to Block Marketing Topics:", e);
    }

    // Task 3: Schedule "Wheel of Fortune" Promo (Visible in Queue Console)
    try {
        await sql`
            INSERT INTO unified_queue (type, payload, status, scheduled_at, created_at)
            VALUES (
                'create_promo',
                ${JSON.stringify({ chat_id: channelId.toString(), title: "🎁 Колесо Фортуны" })}, 
                'pending',
                NOW() + INTERVAL '5 SECONDS',
                NOW()
            )
        `;
        console.log("Scheduled create_promo task.");
    } catch (e) {
        console.error("Failed to schedule create_promo task:", e);
    }

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

export async function checkDuplicateEcosystem(title: string, district: string | null) {
    let street = title;
    let house = "";

    // Normalize incoming title
    if (title.includes(',')) {
        const parts = title.split(',').map(p => p.trim());
        if (parts.length >= 2) {
            if (/^\d/.test(parts[0])) {
                house = parts[0];
                street = parts[1];
            } else {
                street = parts[0];
                house = parts[1];
            }
        }
    } else {
        const parts = title.split(' ');
        if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            if (/^\d/.test(lastPart)) {
                house = lastPart;
                street = parts.slice(0, -1).join(' ');
            }
        }
    }

    // Prepare search patterns
    // We want to match existing titles that contain BOTH the street and the house
    // This is a fuzzy check because existing titles in DB might be formatted differently

    if (house && street) {
        // Use Regex to match House number strictly as a whole word (to avoid 2 matching 12)
        // \y matches word boundary in Postgres Regex
        const housePattern = '\\y' + house + '\\y';

        const existing = await sql`
            SELECT id, title FROM ecosystems 
            WHERE title ILIKE ${'%' + street + '%'} 
              AND title ~* ${housePattern}
              LIMIT 1
         `;

        if (existing.length > 0) {
            throw new Error(`Duplicate: Chat for "${existing[0].title}" already exists.`);
        }
    } else {
        // Fallback to exact title match
        const existing = await sql`
            SELECT id FROM ecosystems WHERE title = ${title} LIMIT 1
        `;
        if (existing.length > 0) {
            throw new Error(`Duplicate: Chat "${title}" already exists.`);
        }
    }
}

export async function pinTelegramTopic(chatId: string, topicId: number, pinned: boolean = true) {
    const client = await getTelegramClient();
    const entity = await getChatEntity(client, chatId);

    await client.invoke(new Api.channels.UpdatePinnedForumTopic({
        channel: entity,
        topicId: topicId,
        pinned: pinned
    }));
}

export async function ensureBotAdminRights(chatId: string, botUsername: string) {
    const client = await getTelegramClient();
    const entity = await getChatEntity(client, chatId);
    const botEntity = await client.getEntity(botUsername);

    console.log(`Ensuring admin rights for ${botUsername} in ${chatId}...`);

    await client.invoke(new Api.channels.EditAdmin({
        channel: entity,
        userId: botEntity,
        adminRights: new Api.ChatAdminRights({
            changeInfo: true,
            postMessages: true,
            editMessages: true,
            deleteMessages: true,
            banUsers: true,
            inviteUsers: true,
            pinMessages: true,
            addAdmins: false,
            anonymous: false,
            manageCall: true,
            other: true,
            // @ts-ignore
            manageTopics: true
        }),
        rank: "Bot Admin"
    }));
    console.log(`Promoted ${botUsername} to Admin (rights refreshed).`);
}

export async function blockMarketingTopics(chatId: string) {
    const client = await getTelegramClient();
    const entity = await getChatEntity(client, chatId);

    // 1. Get all topics
    // @ts-ignore
    const result = await client.invoke(new Api.channels.GetForumTopics({
        channel: entity,
        offsetDate: 0,
        offsetId: 0,
        offsetTopic: 0,
        limit: 100
    }));

    // @ts-ignore
    const topics = result.topics || [];
    console.log(`Found ${topics.length} topics in ${chatId}`);

    const targetNames = ["🛠 Услуги", "🎁 Колесо Фортуны"];

    for (const t of topics) {
        const topic = t as any;
        if (targetNames.includes(topic.title)) {
            console.log(`Closing topic: ${topic.title} (${topic.id})`);

            // Close the topic
            await client.invoke(new Api.channels.EditForumTopic({
                channel: entity,
                topicId: topic.id,
                closed: true
            }));

            // Also ensure it is pinned if it is Wheel of Fortune? 
            // The user asked to "Block messages", closing does exactly that for non-admins.
            // "Запрет на сообщения" = Close Topic.
        }
    }
}
