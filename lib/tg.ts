import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
const apiHash = process.env.TELEGRAM_API_HASH || "";
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || "");

let client: TelegramClient | null = null;

export async function getTelegramClient() {
    if (!client) {
        if (!apiId || !apiHash || !process.env.TELEGRAM_SESSION) {
            throw new Error("Missing Telegram configuration in .env");
        }

        client = new TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,
        });

        await client.connect();
    }

    return client;
}
