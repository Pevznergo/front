'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateAll() {
    try {
        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('Revalidation error:', error)
        return { success: false, error: 'Failed to revalidate' }
    }
}
