'use server'

import { sql } from '@/lib/db'
import { verifyTelegramWebAppData } from '@/lib/telegram-auth'

// Validate Telegram Web App data
function validateTelegramData(initData: string): { success: true; userId: string; username?: string } | { success: false; error: string } {
    // Check if token exists to avoid the loose check in verifyTelegramWebAppData
    if (!process.env.TELEGRAM_BOT_TOKEN && !process.env.BOT_TOKEN) {
        console.error('TELEGRAM_BOT_TOKEN is not set');
        return { success: false, error: 'Configuration error' };
    }

    const isValid = verifyTelegramWebAppData(initData);
    if (!isValid) {
        return { success: false, error: 'Invalid hash' };
    }

    const urlParams = new URLSearchParams(initData);
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

// Helper to calculate level
function calculateClanLevel(totalMembers: number, proMembers: number) {
    if (totalMembers >= 15 && proMembers >= 3) return 5;
    if (proMembers >= 2) return 4;
    if (totalMembers >= 10 && proMembers >= 1) return 3;
    if (totalMembers >= 2) return 2;
    return 1;
}

export async function getUserClanInfo(initData: string) {
    const validation = validateTelegramData(initData);
    if (!validation.success) {
        return { hasClan: false, error: validation.error };
    }

    const telegramId = validation.userId;

    try {
        // 1. Get User
        // Note: casting telegramId to string just in case DB expects varchar
        const users = await sql`SELECT * FROM "User" WHERE "telegramId" = ${telegramId}`;
        let user = users[0];

        if (!user) {
            // Create user if not exists (Auto-registration)
            const newUser = await sql`
                INSERT INTO "User" ("telegramId", name, points)
                VALUES (${telegramId}, ${validation.username || 'User'}, 0)
                RETURNING *
            `;
            user = newUser[0];
        }

        if (!user.clan_id) {
            return { hasClan: false };
        }

        // 2. Get Clan
        const clans = await sql`SELECT * FROM clans WHERE id = ${user.clan_id}`;
        const clan = clans[0];

        if (!clan) {
            return { hasClan: false };
        }

        // 3. Get Members Counts
        const members = await sql`SELECT * FROM "User" WHERE clan_id = ${clan.id}`;
        const totalMembers = members.length;
        const proMembers = members.filter((m: any) => m.has_paid).length;

        // 4. Calculate Level
        const level = calculateClanLevel(totalMembers, proMembers);

        // Update level if changed
        if (level !== clan.level) {
            await sql`UPDATE clans SET level = ${level} WHERE id = ${clan.id}`;
            clan.level = level;
        }

        // 5. Build Response
        const membersList = members.map((m: any) => ({
            id: m.id.toString(),
            name: m.name,
            role: m.clan_role || 'member',
            isPro: !!m.has_paid
        })).sort((a: any, b: any) => {
            // Owners/Pros first
            if (a.role === 'owner') return -1;
            if (b.role === 'owner') return 1;
            if (a.isPro && !b.isPro) return -1;
            if (!a.isPro && b.isPro) return 1;
            return 0;
        });

        return {
            hasClan: true,
            clan: {
                id: clan.id,
                name: clan.name,
                level: clan.level,
                totalMembers,
                proMembers,
                inviteCode: clan.invite_code,
                membersList
            },
            userRole: user.clan_role
        };

    } catch (e: any) {
        console.error('getUserClanInfo error:', e);
        // Check for specific table missing error
        if (e.message?.includes('relation "clans" does not exist')) {
            return { hasClan: false, error: 'Нужно инициализировать базу данных: /api/init-db' };
        }
        return { hasClan: false, error: e.message || 'Database error' };
    }
}

export async function createClan(initData: string, name: string) {
    const validation = validateTelegramData(initData);
    if (!validation.success) return { success: false, error: validation.error };

    const telegramId = validation.userId;

    try {
        const users = await sql`SELECT * FROM "User" WHERE "telegramId" = ${telegramId}`;
        const user = users[0];

        if (!user) return { success: false, error: 'User not found' };
        if (user.clan_id) return { success: false, error: 'Already in a clan' };

        // Generate Code
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Create Clan
        const newClan = await sql`
            INSERT INTO clans (name, invite_code, owner_id)
            VALUES (${name}, ${inviteCode}, ${user.id})
            RETURNING *
        `;
        const clanId = newClan[0].id;

        // Update User
        await sql`
            UPDATE "User" 
            SET clan_id = ${clanId}, clan_role = 'owner'
            WHERE id = ${user.id}
        `;

        return { success: true, clanId };
    } catch (e: any) {
        console.error('createClan error:', e);
        if (e.message?.includes('unique constraint') || e.code === '23505') {
            return { success: false, error: 'Name already taken' };
        }
        return { success: false, error: 'Failed to create clan' };
    }
}

export async function joinClan(initData: string, code: string) {
    const validation = validateTelegramData(initData);
    if (!validation.success) return { success: false, error: validation.error };

    const telegramId = validation.userId;

    try {
        const users = await sql`SELECT * FROM "User" WHERE "telegramId" = ${telegramId}`;
        let user = users[0];

        if (!user) {
            // Create user if joining via link before start
            const newUser = await sql`
                INSERT INTO "User" ("telegramId", name, points)
                VALUES (${telegramId}, ${validation.username || 'User'}, 0)
                RETURNING *
            `;
            user = newUser[0];
        }

        if (user.clan_id) return { success: false, error: 'Already in a clan' };

        // Find Clan
        const clans = await sql`SELECT * FROM clans WHERE invite_code = ${code} OR invite_code = ${code.replace('CLAN-', '')}`;
        const clan = clans[0];

        if (!clan) return { success: false, error: 'Clan not found' };

        // Join
        await sql`
            UPDATE "User"
            SET clan_id = ${clan.id}, clan_role = 'member'
            WHERE id = ${user.id}
        `;

        return { success: true };

    } catch (e) {
        console.error('joinClan error:', e);
        return { success: false, error: 'Failed to join clan' };
    }
}

export async function updateClanName(initData: string, name: string) {
    const validation = validateTelegramData(initData);
    if (!validation.success) return { success: false, error: validation.error };

    const telegramId = validation.userId;

    try {
        const users = await sql`SELECT * FROM "User" WHERE "telegramId" = ${telegramId}`;
        const user = users[0];

        if (!user || user.clan_role !== 'owner') {
            return { success: false, error: 'Permission denied' };
        }

        await sql`UPDATE clans SET name = ${name} WHERE id = ${user.clan_id}`;
        return { success: true };
    } catch (e) {
        console.error('updateClanName error:', e);
        return { success: false, error: 'Failed to update name' };
    }
}

export async function leaveClan(initData: string) {
    const validation = validateTelegramData(initData);
    if (!validation.success) return { success: false, error: validation.error };

    const telegramId = validation.userId;

    try {
        const users = await sql`SELECT * FROM "User" WHERE "telegramId" = ${telegramId}`;
        const user = users[0];

        if (!user || !user.clan_id) return { success: false, error: 'Not in a clan' };

        if (user.clan_role === 'owner') {
            return { success: false, error: 'Owner cannot leave. Transfer ownership or delete clan.' };
        }

        await sql`
            UPDATE "User"
            SET clan_id = NULL, clan_role = 'member'
            WHERE id = ${user.id}
        `;
        return { success: true };
    } catch (e) {
        console.error('leaveClan error:', e);
        return { success: false, error: 'Failed to leave clan' };
    }
}
