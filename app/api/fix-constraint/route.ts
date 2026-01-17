import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// TEMPORARY endpoint to drop obsolete constraint
// DELETE THIS FILE after running once

export async function POST(req: Request) {
    try {
        console.log('🔍 Checking for obsolete constraint...');

        // Check if constraint exists
        const checkResult = await sql`
      SELECT constraint_name, table_name 
      FROM information_schema.table_constraints 
      WHERE constraint_name = 'user_prizes_telegram_id_fkey'
    `;

        const exists = checkResult.length > 0;

        if (!exists) {
            return NextResponse.json({
                success: true,
                message: 'Constraint already removed or does not exist',
                existed: false
            });
        }

        console.log('🗑️  Dropping constraint:', checkResult[0].constraint_name);

        // Drop the constraint
        await sql`
      ALTER TABLE user_prizes DROP CONSTRAINT IF EXISTS user_prizes_telegram_id_fkey
    `;

        console.log('✅ Successfully dropped obsolete foreign key constraint');

        // Verify it's gone
        const verifyResult = await sql`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE constraint_name = 'user_prizes_telegram_id_fkey'
    `;

        const stillExists = verifyResult.length > 0;

        return NextResponse.json({
            success: true,
            message: 'Constraint dropped successfully',
            existed: true,
            verified: !stillExists
        });

    } catch (error: any) {
        console.error('❌ Error dropping constraint:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
