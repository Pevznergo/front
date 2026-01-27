'use server';

import { sql } from '@/lib/db';
import { createHmac } from 'node:crypto';

// Validate Telegram Web App data
function validateTelegramData(initData: string): { success: true; userId: string; username?: string } | { success: false; error: string } {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;

    if (!botToken) {
        console.error('TELEGRAM_BOT_TOKEN is not set');
        return { success: false, error: 'Configuration error' };
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
        return { success: false, error: 'No hash found' };
    }

    urlParams.delete('hash');

    const params = Array.from(urlParams.entries());
    params.sort((a, b) => a[0].localeCompare(b[0]));

    const dataCheckString = params.map(([key, value]) => `${key}=${value}`).join('\n');

    const secretKey = createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

    const calculatedHash = createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    if (calculatedHash !== hash) {
        return { success: false, error: 'Invalid hash' };
    }

    const userStr = urlParams.get('user');
    if (!userStr) {
        return { success: false, error: 'No user data' };
    }

    try {
        const user = JSON.parse(userStr);
        return {
            success: true,
            userId: user.id.toString(),
            username: user.username
        };
    } catch {
        return { success: false, error: 'Invalid user data format' };
    }
}

// Initialize Clan tables
export async function initClanTables() {
    try {
        // Clans table
        await sql`
      CREATE TABLE IF NOT EXISTS "Clan" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        invite_code VARCHAR(50) UNIQUE NOT NULL,
        level INTEGER DEFAULT 1 NOT NULL,
        owner_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

        // Add clan fields to User table
        await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS clan_id INTEGER REFERENCES "Clan"(id)`;
        await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS clan_role VARCHAR(50) DEFAULT 'member'`;

        console.log('Clan tables initialized');
    } catch (error) {
        console.error('Error initializing clan tables:', error);
    }
}

// Get user's clan info
export async function getUserClanInfo(initData: string) {
    try {
        const validation = validateTelegramData(initData);
        if (!validation.success) {
            throw new Error(validation.error);
        }
        const telegramId = validation.userId;

        const result = await sql`
      SELECT 
        u.clan_id,
        u.clan_role,
        c.name as clan_name,
        c.level as clan_level,
        c.invite_code,
        c.owner_id,
        (SELECT COUNT(*) FROM "User" WHERE clan_id = u.clan_id) as total_members,
        (SELECT COUNT(*) FROM "User" WHERE clan_id = u.clan_id AND has_paid = TRUE) as pro_members
      FROM "User" u
      LEFT JOIN "Clan" c ON u.clan_id = c.id
      WHERE u."telegramId" = ${telegramId}
      LIMIT 1
    `;

        if (result.length === 0) {
            return null;
        }

        const row = result[0];

        if (!row.clan_id) {
            return { hasClan: false };
        }

        return {
            hasClan: true,
            clan: {
                id: row.clan_id,
                name: row.clan_name,
                level: row.clan_level,
                inviteCode: row.invite_code,
                ownerId: row.owner_id,
                totalMembers: parseInt(row.total_members) || 0,
                proMembers: parseInt(row.pro_members) || 0,
            },
            userRole: row.clan_role,
        };
    } catch (error) {
        console.error('Error getting clan info:', error);
        throw new Error('Не удалось загрузить информацию о клане');
    }
}

// Create a new clan
export async function createClan(initData: string, clanName: string) {
    try {
        const validation = validateTelegramData(initData);
        if (!validation.success) {
            return { success: false, error: validation.error };
        }
        const telegramId = validation.userId;

        // Ensure user exists first
        let existingUser = await sql`
      SELECT id, clan_id FROM "User" WHERE "telegramId" = ${telegramId}
    `;

        // Create user if doesn't exist
        if (existingUser.length === 0) {
            await sql`
        INSERT INTO "User" ("telegramId", name, email)
        VALUES (${telegramId}, 'Telegram User', NULL)
      `;
            existingUser = await sql`
        SELECT id, clan_id FROM "User" WHERE "telegramId" = ${telegramId}
      `;
        }

        if (existingUser[0].clan_id) {
            throw new Error('Вы уже состоите в клане');
        }

        // Check name availability
        const existingClan = await sql`
      SELECT id FROM "Clan" WHERE name = ${clanName}
    `;

        if (existingClan.length > 0) {
            throw new Error('Клан с таким именем уже существует');
        }

        // Generate invite code
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create clan
        const newClan = await sql`
      INSERT INTO "Clan" (name, invite_code, owner_id)
      VALUES (${clanName}, ${inviteCode}, ${telegramId})
      RETURNING id
    `;

        const clanId = newClan[0].id;

        // Add user to clan as owner
        await sql`
      UPDATE "User" 
      SET clan_id = ${clanId}, clan_role = 'owner'
      WHERE "telegramId" = ${telegramId}
    `;

        return { success: true, inviteCode };
    } catch (error: any) {
        console.error('Error creating clan:', error);
        return { success: false, error: error.message || 'Не удалось создать клан' };
    }
}

// Join a clan by invite code
export async function joinClan(initData: string, inviteCode: string) {
    try {
        const validation = validateTelegramData(initData);
        if (!validation.success) {
            return { success: false, error: validation.error };
        }
        const telegramId = validation.userId;

        // Ensure user exists first
        let existingUser = await sql`
      SELECT id, clan_id FROM "User" WHERE "telegramId" = ${telegramId}
    `;

        // Create user if doesn't exist
        if (existingUser.length === 0) {
            await sql`
        INSERT INTO "User" ("telegramId", name, email)
        VALUES (${telegramId}, 'Telegram User', NULL)
      `;
            existingUser = await sql`
        SELECT id, clan_id FROM "User" WHERE "telegramId" = ${telegramId}
      `;
        }

        if (existingUser[0].clan_id) {
            throw new Error('Вы уже состоите в клане');
        }

        // Find clan by invite code
        const clan = await sql`
      SELECT id FROM "Clan" WHERE invite_code = ${inviteCode.toUpperCase()}
    `;

        if (clan.length === 0) {
            throw new Error('Клан не найден. Проверьте код приглашения');
        }

        const clanId = clan[0].id;

        // Add user to clan
        await sql`
      UPDATE "User" 
      SET clan_id = ${clanId}, clan_role = 'member'
      WHERE "telegramId" = ${telegramId}
    `;

        // Update clan level if needed
        await updateClanLevel(clanId);

        return { success: true };
    } catch (error: any) {
        console.error('Error joining clan:', error);
        return { success: false, error: error.message || 'Не удалось присоединиться к клану' };
    }
}

// Update clan name (admin only)
export async function updateClanName(initData: string, newName: string) {
    try {
        const validation = validateTelegramData(initData);
        if (!validation.success) {
            return { success: false, error: validation.error };
        }
        const telegramId = validation.userId;

        // Get user's clan and role
        const user = await sql`
      SELECT clan_id, clan_role FROM "User" WHERE "telegramId" = ${telegramId}
    `;

        if (user.length === 0 || !user[0].clan_id) {
            throw new Error('Вы не состоите в клане');
        }

        if (user[0].clan_role !== 'owner' && user[0].clan_role !== 'admin') {
            throw new Error('Только администратор может изменить название клана');
        }

        // Check name availability
        const existing = await sql`
      SELECT id FROM "Clan" WHERE name = ${newName} AND id != ${user[0].clan_id}
    `;

        if (existing.length > 0) {
            throw new Error('Клан с таким именем уже существует');
        }

        // Update name
        await sql`
      UPDATE "Clan" SET name = ${newName} WHERE id = ${user[0].clan_id}
    `;

        return { success: true };
    } catch (error: any) {
        console.error('Error updating clan name:', error);
        return { success: false, error: error.message || 'Не удалось изменить название' };
    }
}

// Leave clan
export async function leaveClan(initData: string) {
    try {
        const validation = validateTelegramData(initData);
        if (!validation.success) {
            return { success: false, error: validation.error };
        }
        const telegramId = validation.userId;

        const user = await sql`
      SELECT clan_id, clan_role FROM "User" WHERE "telegramId" = ${telegramId}
    `;

        if (user.length === 0 || !user[0].clan_id) {
            throw new Error('Вы не состоите в клане');
        }

        if (user[0].clan_role === 'owner') {
            throw new Error('Владелец не может покинуть клан');
        }

        const clanId = user[0].clan_id;

        // Remove user from clan
        await sql`
      UPDATE "User" 
      SET clan_id = NULL, clan_role = 'member'
      WHERE "telegramId" = ${telegramId}
    `;

        // Update clan level
        await updateClanLevel(clanId);

        return { success: true };
    } catch (error: any) {
        console.error('Error leaving clan:', error);
        return { success: false, error: error.message || 'Не удалось покинуть клан' };
    }
}

// Update clan level based on members
async function updateClanLevel(clanId: number) {
    try {
        const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE has_paid = TRUE) as pro
      FROM "User"
      WHERE clan_id = ${clanId}
    `;

        const total = parseInt(stats[0].total) || 0;
        const pro = parseInt(stats[0].pro) || 0;

        let newLevel = 1;
        if (total >= 2) newLevel = 2;
        if (total >= 10 && pro >= 1) newLevel = 3;
        if (pro >= 2) newLevel = 4;
        if (total >= 15 && pro >= 3) newLevel = 5;

        await sql`UPDATE "Clan" SET level = ${newLevel} WHERE id = ${clanId}`;
    } catch (error) {
        console.error('Error updating clan level:', error);
    }
}
