import * as dotenv from 'dotenv';
// Load environment variables (try .env.local first, then .env)
dotenv.config({ path: '.env.local' });
dotenv.config();

import { sql, initDatabase, getFloodWait, setFloodWait } from './lib/db';
import { createEcosystem, setTopicClosed, getChatEntity } from './lib/chat';
import { getTelegramClient } from './lib/tg';
import { Bot, InlineKeyboard } from 'grammy';
import { Api } from 'telegram';

// Log with timestamp
const log = (msg: string, ...args: any[]) => {
    console.log(`[${new Date().toISOString()}] ${msg}`, ...args);
};

const errorLog = (msg: string, ...args: any[]) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${msg}`, ...args);
};

async function processChatCreationQueue() {
    // 1. Find the oldest pending task
    const pendingTasks = await sql`
        SELECT * FROM chat_creation_queue 
        WHERE status = 'pending' 
        ORDER BY scheduled_at ASC 
        LIMIT 1
    `;

    if (pendingTasks.length === 0) return false;

    const task = pendingTasks[0];
    const now = new Date();
    const scheduledTime = new Date(task.scheduled_at);

    // Check if it's time to process
    if (scheduledTime > now) {
        // Not ready yet (scheduled for future or postponed)
        return false;
    }

    log(`Processing Chat Creation Task #${task.id}: ${task.title}`);

    try {
        await sql`UPDATE chat_creation_queue SET status = 'processing' WHERE id = ${task.id}`;

        const alreadyExists = await sql`SELECT id FROM short_links WHERE reviewer_name = ${task.title}`;
        if (alreadyExists.length > 0) {
            await sql`UPDATE chat_creation_queue SET status = 'completed', error = 'Already exists in short_links' WHERE id = ${task.id}`;
            log(`Task #${task.id} skipped (already exists)`);
            return true;
        }

        const result = await createEcosystem(task.title, task.district);

        await sql`
            UPDATE chat_creation_queue 
            SET status = 'completed', error = NULL 
            WHERE id = ${task.id}
        `;
        log(`Task #${task.id} completed. Chat ID: ${result.chatId}`);

        // ---------------------------------------------------------
        // AUTOMATION: Create "Wheel of Fortune" Topic & Message
        // ---------------------------------------------------------
        try {
            const token = process.env.TELEGRAM_BOT_TOKEN;
            if (token && result.chatId) {
                const bot = new Bot(token);
                const targetChatId = result.chatId.toString().startsWith("-") ? result.chatId.toString() : "-100" + result.chatId;

                // Wait 2s for rights propagation
                await new Promise(r => setTimeout(r, 2000));

                log(`Creating promo topic for ${targetChatId}...`);

                // A. Create Topic
                const topic = await bot.api.createForumTopic(targetChatId, "🎁 Колесо Фортуны");
                const threadId = topic.message_thread_id;

                // B. Send Button
                const appLink = "https://t.me/aportomessage_bot/app?startapp=promo";
                const keyboard = new InlineKeyboard().url("🎡 КРУТИТЬ КОЛЕСО", appLink);

                await bot.api.sendMessage(targetChatId, "🎰 **КРУТИ КОЛЕСО ФОРТУНЫ КАЖДЫЙ ДЕНЬ**\n\nНажми на кнопку ниже, чтобы испытать удачу и выиграть призы (iPhone, Ozon, WB, Dyson и другие).", {
                    message_thread_id: threadId,
                    reply_markup: keyboard,
                    parse_mode: "Markdown",
                });

                log(`Promo topic created: ${threadId}`);
            }
        } catch (botError: any) {
            errorLog(`Failed to automate promo topic:`, botError);
            // Do not fail the task
        }

        // Return true to indicate we did work (so we can check again immediately)
        return true;

    } catch (error: any) {
        errorLog(`Task #${task.id} failed:`, error);

        // Handle FloodWait
        if (error.seconds || error.errorMessage?.startsWith('FLOOD_WAIT_')) {
            const waitSeconds = error.seconds || parseInt(error.errorMessage.split('_')[2], 10) || 60;
            log(`FloodWait triggered. Postponing task ${task.id} for ${waitSeconds}s.`);

            await setFloodWait(waitSeconds);

            await sql`
                UPDATE chat_creation_queue 
                SET status = 'pending', 
                    scheduled_at = NOW() + (${waitSeconds} || ' seconds')::INTERVAL,
                    error = ${`FloodWait: ${waitSeconds}s`}
                WHERE id = ${task.id}
            `;
            return false; // Stop this cycle
        }

        await sql`
            UPDATE chat_creation_queue 
            SET status = 'failed', error = ${error.message} 
            WHERE id = ${task.id}
        `;
        return true; // Marked as failed, proceed
    }
}

async function processTopicActionsQueue() {
    // 1. Fetch one pending task
    const tasks = await sql`
        SELECT id, chat_id, action_type, payload
        FROM topic_actions_queue
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT 1
    `;

    if (tasks.length === 0) return false;

    const task = tasks[0];
    const { id, chat_id, action_type, payload } = task;

    log(`Processing Topic Action #${id}: ${action_type} for ${chat_id}`);

    try {
        await sql`UPDATE topic_actions_queue SET status = 'processing' WHERE id = ${id}`;

        const client = await getTelegramClient();
        if (!client) throw new Error("Could not initialize Telegram Client");

        const entity = await getChatEntity(client, chat_id);

        const payloadObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
        const { topicName, message, pin, question, options } = payloadObj;

        let topicId = payloadObj.topicId;
        if (!topicId && topicName) {
            const forumTopics = await client.invoke(new Api.channels.GetForumTopics({
                channel: entity,
                limit: 100
            })) as any;
            const topic = forumTopics.topics.find((t: any) => t.title === topicName);
            if (!topic) throw new Error(`Topic '${topicName}' not found`);
            topicId = topic.id;
        }

        // 3. Execute Action
        if (action_type === 'message') {
            const msg = await client.sendMessage(entity, {
                message: message,
                replyTo: topicId
            });
            if (pin) {
                await client.invoke(new Api.messages.UpdatePinnedMessage({
                    peer: entity,
                    id: msg.id,
                    pmOneside: true
                }));
            }
        } else if (action_type === 'poll') {
            await client.invoke(new Api.messages.SendMedia({
                peer: entity,
                media: new Api.InputMediaPoll({
                    poll: new Api.Poll({
                        id: BigInt(Math.floor(Math.random() * 1000000)) as any,
                        question: new Api.TextWithEntities({ text: question, entities: [] }),
                        answers: options.map((opt: string) => new Api.PollAnswer({
                            text: new Api.TextWithEntities({ text: opt, entities: [] }),
                            option: Buffer.from(opt)
                        })),
                        closed: false,
                        publicVoters: true,
                        multipleChoice: false,
                        quiz: false,
                    })
                }),
                message: "",
                replyTo: new Api.InputReplyToMessage({ replyToMsgId: topicId })
            }));
        } else if (action_type === 'close') {
            await setTopicClosed(chat_id, topicId, true);
        } else if (action_type === 'open') {
            await setTopicClosed(chat_id, topicId, false);
        } else if (action_type === 'update_title') {
            if (topicId) {
                await client.invoke(new Api.channels.EditForumTopic({
                    channel: entity,
                    topicId: topicId,
                    title: payloadObj.title
                }));
            } else {
                await client.invoke(new Api.channels.EditTitle({
                    channel: entity,
                    title: payloadObj.title
                }));
            }
        } else if (action_type === 'create_promo') {
            // Use Bot API for Keyboard logic (simpler/safer than GramJS for this)
            const token = process.env.TELEGRAM_BOT_TOKEN;
            if (!token) throw new Error("Bot token missing for create_promo");

            const bot = new Bot(token);
            // Ensure ID format for Bot API
            const targetChatId = chat_id.toString().startsWith("-") ? chat_id.toString() : "-100" + chat_id;

            log(`Executing create_promo for ${targetChatId}`);

            // 1. Create Topic
            const topic = await bot.api.createForumTopic(targetChatId, "🎁 Колесо Фортуны");
            const threadId = topic.message_thread_id;

            // 2. Send Message with Button
            const appLink = "https://t.me/aportomessage_bot/app?startapp=promo";
            const keyboard = new InlineKeyboard().url("🎡 КРУТИТЬ КОЛЕСО", appLink);

            await bot.api.sendMessage(targetChatId, "🎰 **КРУТИ КОЛЕСО ФОРТУНЫ КАЖДЫЙ ДЕНЬ**\n\nНажми на кнопку ниже, чтобы испытать удачу и выиграть призы (iPhone, Ozon, WB, Dyson и другие).", {
                message_thread_id: threadId,
                reply_markup: keyboard,
                parse_mode: "Markdown",
            });
        }

        await sql`UPDATE topic_actions_queue SET status = 'completed' WHERE id = ${id}`;
        log(`Action #${id} completed`);
        return true;

    } catch (execError: any) {
        errorLog(`Task ${id} failed:`, execError);

        // Handle FloodWait
        if (execError.seconds || execError.errorMessage?.startsWith('FLOOD_WAIT_')) {
            const waitSeconds = execError.seconds || parseInt(execError.errorMessage.split('_')[2], 10) || 60;
            log(`FloodWait triggered. Postponing task ${id} for ${waitSeconds}s.`);

            await setFloodWait(waitSeconds);

            await sql`
                UPDATE topic_actions_queue 
                SET status = 'pending', 
                    scheduled_for = NOW() + (${waitSeconds} || ' seconds')::INTERVAL,
                    error = ${`FloodWait: ${waitSeconds}s`}
                WHERE id = ${id}
            `;
            return false;
        }

        await sql`UPDATE topic_actions_queue SET status = 'failed', error = ${execError.message} WHERE id = ${id}`;
        return true; // Failed but processed
    }
}

async function main() {
    log("Starting Worker Process...");
    await initDatabase();
    log("Database initialized.");

    // Retrieve client once to ensure connection
    try {
        const client = await getTelegramClient();
        if (client) log("Telegram Client connected.");
    } catch (e) {
        errorLog("Failed to connect Telegram Client:", e);
        // We continue, maybe it's transient
    }

    while (true) {
        try {
            // 0. Check FloodWait
            const floodWait = await getFloodWait();
            if (floodWait > 0) {
                log(`Global FloodWait active. Sleeping for ${floodWait}s...`);
                await new Promise(r => setTimeout(r, floodWait * 1000));
                continue;
            }

            // 1. Process Chat Creation
            // We loop until no tasks to drain queue faster
            let processedChat = false;
            do {
                processedChat = await processChatCreationQueue();
                if (processedChat) await new Promise(r => setTimeout(r, 1000)); // 1s buffer between chats
            } while (processedChat);

            // 2. Process Topic Actions
            let processedAction = false;
            do {
                processedAction = await processTopicActionsQueue();
                if (processedAction) await new Promise(r => setTimeout(r, 500)); // 0.5s buffer
            } while (processedAction);

            // If nothing processed, sleep for a while
            if (!processedChat && !processedAction) {
                // log("Idle... sleeping 3s");
                await new Promise(r => setTimeout(r, 3000));
            }

        } catch (e) {
            errorLog("Main loop error:", e);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

main().catch(e => {
    errorLog("Fatal Worker Error:", e);
    process.exit(1);
});
