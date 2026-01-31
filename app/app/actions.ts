'use server'

import { sql } from '@/lib/db'
import { verifyTelegramWebAppData } from '@/lib/telegram-auth'
import { revalidatePath } from 'next/cache'

// --- Types ---
export type ClanMember = {
    id: string; // Displayed as string, but DB is Int
    name: string;
    role: string;
    isPro: boolean;
};

export type ClanData = {
    id: string;
    name: string;
    level: number;
    membersCount: number;
    proMembersCount: number;
    nextLevel: number;
    progress: number;
    nextLevelRequirements: string;
    inviteCode: string;
    isOwner: boolean;
    membersList: ClanMember[];
};

// --- Helpers ---

// Logic port from newchat
function calculateClanLevel(totalMembers: number, proMembers: number) {
    if (totalMembers >= 15 && proMembers >= 3) return 5;
    if (proMembers >= 2) return 4;
    if (totalMembers >= 10 && proMembers >= 1) return 3;
    if (totalMembers >= 2) return 2;
    return 1;
}

function getNextLevelRequirements(level: number, totalMembers: number, proMembers: number) {
    if (level >= 5) return "МАКС. УРОВЕНЬ";
    if (level === 4) return `Нужно еще ${Math.max(0, 15 - totalMembers)} чел. и ${Math.max(0, 3 - proMembers)} Pro`;
    if (level === 3) return `Нужно еще ${Math.max(0, 2 - proMembers)} Pro`;
    if (level === 2) return `Нужно еще ${Math.max(0, 10 - totalMembers)} чел. и 1 Pro`;
    if (level === 1) return `Нужно еще ${Math.max(0, 2 - totalMembers)} чел.`;
    return "";
}

function validateTelegramData(initData: string) {
    if (!initData) return { success: false, error: 'No data' };

    // Validate hash
    const isValid = verifyTelegramWebAppData(initData);
    if (!isValid) return { success: false, error: 'Invalid hash' };

    // Parse user
    try {
        const urlParams = new URLSearchParams(initData);
        const userStr = urlParams.get('user');
        if (!userStr) return { success: false, error: 'No user data' };

        const user = JSON.parse(userStr);
        if (!user.id) return { success: false, error: 'No user ID' };

        return { success: true, userId: user.id.toString(), username: user.username, firstName: user.first_name };
    } catch (e) {
        return { success: false, error: 'Parse error' };
    }
}

// --- Actions ---

export async function fetchClanData(initData: string) {
    const validation = validateTelegramData(initData);
    if (!validation.success) return { error: validation.error };

    const telegramId = validation.userId; // string, but matches varchar column in User potentially, or we cast.

    try {
        // 1. Get User (Integer ID)
        // Checks if user exists. If not, auto-create? 
        // Logic from `api/webapp/auth` suggests we create users there. 
        // But for safety, we just check here.
        const users = await sql`SELECT * FROM "User" WHERE "telegramId" = ${telegramId}`;
        let user = users[0];

        if (!user) {
            // Auto-create simplified for minimal friction if missing
            // (Though normally /start or Page Auth handles this)
            const newUser = await sql`
                INSERT INTO "User" ("telegramId", name, points)
                VALUES (${telegramId}, ${validation.username || validation.firstName || 'User'}, 0)
                RETURNING *
            `;
            user = newUser[0];
        }

        const userId = user.id; // INTEGER

        // 2. Check if User is in a Clan
        // We use the `clan_id` on the User table (added in migration)
        if (!user.clan_id) {
            return { inClan: false, inviteCode: null };
        }

        // 3. Fetch Clan Details
        const clans = await sql`SELECT * FROM clans WHERE id = ${user.clan_id}`;
        const clan = clans[0];

        if (!clan) {
            // Data inconsistency: User has clan_id but clan doesn't exist
            await sql`UPDATE "User" SET clan_id = NULL WHERE id = ${userId}`;
            return { inClan: false };
        }

        // 4. Get Members Counts and List
        // Count total
        const membersData = await sql`
            SELECT 
                u.id, u.name, u.points, u.has_paid, u.clan_role
            FROM "User" u
            WHERE u.clan_id = ${clan.id}
        `;

        const totalMembers = membersData.length;
        const proMembers = membersData.filter((m: any) => m.has_paid).length;

        // 5. Calculate Levels
        const level = calculateClanLevel(totalMembers, proMembers);
        const nextReq = getNextLevelRequirements(level, totalMembers, proMembers);

        // Update level in DB if changed (optional, but good for keeping sync)
        if (clan.level !== level) {
            await sql`UPDATE clans SET level = ${level} WHERE id = ${clan.id}`;
        }

        return {
            inClan: true,
            userRole: user.clan_role || 'member',
            clan: {
                id: clan.id.toString(),
                name: clan.name,
                level: level,
                membersCount: totalMembers,
                proMembersCount: proMembers,
                nextLevel: Math.min(5, level + 1),
                progress: level === 5 ? 100 : 50, // Simplified
                nextLevelRequirements: nextReq,
                inviteCode: clan.invite_code,
                isOwner: user.clan_role === 'owner',
                membersList: membersData.map((m: any) => ({
                    id: m.id.toString(),
                    name: m.name || 'Unknown',
                    role: m.clan_role || 'member',
                    isPro: !!m.has_paid
                }))
            }
        };

    } catch (e) {
        console.error('fetchClanData error:', e);
        return { error: 'Database error' };
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

        // Transaction-like logic (Postgres.js doesn't support strict transactions in `sql` tag easily without `begin`, assume optimistic)

        // 1. Create Clan
        const newClan = await sql`
            INSERT INTO clans (name, invite_code, owner_id)
            VALUES (${name}, ${inviteCode}, ${user.id})
            RETURNING id
        `;
        const clanId = newClan[0].id;

        // 2. Update User (Owner)
        await sql`
            UPDATE "User" 
            SET clan_id = ${clanId}, clan_role = 'owner'
            WHERE id = ${user.id}
        `;

        revalidatePath('/app');
        return { success: true, clan: { id: clanId } };

    } catch (e: any) {
        console.error('createClan error:', e);
        if (e.message?.includes('violates unique constraint') || e.code === '23505') {
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
        const user = users[0];
        if (!user) return { success: false, error: 'User not found' };
        if (user.clan_id) return { success: false, error: 'Already in a clan' };

        // Find Clan
        const clans = await sql`SELECT * FROM clans WHERE invite_code = ${code}`;
        const clan = clans[0];

        if (!clan) return { success: false, error: 'Clan not found' };

        // Check limits (Max 15)
        const membersFn = await sql`SELECT count(*) FROM "User" WHERE clan_id = ${clan.id}`;
        const memberCount = Number(membersFn[0].count);

        if (memberCount >= 15) {
            // Clan is full -> Auto-create new clan for user
            const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
            const newName = `My Clan ${randomSuffix}`;
            const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            // Create Clan
            const newClan = await sql`
                INSERT INTO clans (name, invite_code, owner_id)
                VALUES (${newName}, ${inviteCode}, ${user.id})
                RETURNING id
            `;
            const newClanId = newClan[0].id;

            // Assign User
            await sql`
                UPDATE "User"
                SET clan_id = ${newClanId}, clan_role = 'owner'
                WHERE id = ${user.id}
            `;

            revalidatePath('/app');
            // Special status for frontend handling
            return {
                success: true,
                status: 'clan_full_redirect',
                clanId: newClanId,
                message: 'Клан полон (макс 15). Мы создали для вас новый!'
            };
        }

        // Join
        await sql`
            UPDATE "User"
            SET clan_id = ${clan.id}, clan_role = 'member'
            WHERE id = ${user.id}
        `;

        revalidatePath('/app');
        return { success: true };

    } catch (e) {
        console.error('joinClan error:', e);
        return { success: false, error: 'Failed to join' };
    }
}

export async function kickMember(initData: string, targetUserId: string) {
    const validation = validateTelegramData(initData);
    if (!validation.success) return { success: false, error: validation.error };

    const telegramId = validation.userId;

    try {
        // 1. Get Requester (Owner)
        const users = await sql`SELECT * FROM "User" WHERE "telegramId" = ${telegramId}`;
        const owner = users[0];
        if (!owner) return { success: false, error: 'User not found' };

        // 2. Validate Ownership
        if (owner.clan_role !== 'owner' || !owner.clan_id) {
            return { success: false, error: 'No permission' };
        }

        // 3. Kick Target
        // Ensure target is in the SAME clan
        await sql`
            UPDATE "User"
            SET clan_id = NULL, clan_role = 'member'
            WHERE id = ${targetUserId} AND clan_id = ${owner.clan_id} AND id != ${owner.id}
        `;

        revalidatePath('/app');
        return { success: true };
    } catch (e) {
        console.error('kickMember error:', e);
        return { success: false, error: 'Failed to kick' };
    }
}

export async function updateClanName(initData: string, newName: string) {
    const validation = validateTelegramData(initData);
    if (!validation.success) return { success: false, error: validation.error };

    const telegramId = validation.userId;

    try {
        const users = await sql`SELECT * FROM "User" WHERE "telegramId" = ${telegramId}`;
        const user = users[0];
        if (!user) return { success: false, error: 'User not found' };

        if (!user.clan_id) return { success: false, error: 'No clan' };
        if (user.clan_role !== 'owner') return { success: false, error: 'Not owner' };

        await sql`UPDATE clans SET name = ${newName} WHERE id = ${user.clan_id}`;

        revalidatePath('/app');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Update failed' };
    }
}
