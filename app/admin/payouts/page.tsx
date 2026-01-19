import { sql } from '@/lib/db'
import { CheckCircle, XCircle, Clock, Wallet } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function PayoutsPage() {
    // Fetch withdrawals
    const withdrawals = await sql`
        SELECT w.*, u.name as user_name, u."telegramId"
        FROM withdrawals w
        LEFT JOIN "User" u ON w.user_id = u."telegramId"
        ORDER BY 
            CASE WHEN w.status = 'pending' THEN 0 ELSE 1 END,
            w.created_at DESC
    `

    async function markAsPaid(formData: FormData) {
        'use server'
        const id = formData.get('id')
        if (id) {
            await sql`UPDATE withdrawals SET status = 'completed' WHERE id = ${id.toString()}`
            revalidatePath('/admin/payouts')
            revalidatePath('/admin') // Update sidebar badge count ideally
        }
    }

    async function reject(formData: FormData) {
        'use server'
        const id = formData.get('id')
        const userId = formData.get('userId')
        const amount = formData.get('amount')

        if (id && userId && amount) {
            // Refund balance
            await sql`UPDATE "User" SET balance = balance + ${parseInt(amount.toString())} WHERE "telegramId" = ${userId.toString()}`
            await sql`UPDATE withdrawals SET status = 'rejected' WHERE id = ${id.toString()}`
            revalidatePath('/admin/payouts')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Выплаты</h1>
                    <p className="text-gray-500 mt-1">Заявки на вывод средств от рефералов</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-gray-500" />
                    <span className="font-bold text-gray-900">
                        Total Pending: {withdrawals.filter(w => w.status === 'pending').reduce((acc, curr) => acc + parseInt(curr.amount), 0)} T
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {withdrawals.map((w) => (
                            <tr key={w.id} className={w.status === 'pending' ? 'bg-yellow-50/30' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            {w.user_name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">{w.user_name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">ID: {w.user_id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">{w.amount} Tokens</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${w.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            w.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {w.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {w.contact_info}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(w.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {w.status === 'pending' && (
                                        <div className="flex items-center justify-end gap-2">
                                            <form action={markAsPaid}>
                                                <input type="hidden" name="id" value={w.id} />
                                                <button type="submit" className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors" title="Mark Paid">
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                            </form>
                                            <form action={reject}>
                                                <input type="hidden" name="id" value={w.id} />
                                                <input type="hidden" name="userId" value={w.user_id} />
                                                <input type="hidden" name="amount" value={w.amount} />
                                                <button type="submit" className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Reject & Refund">
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {withdrawals.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No requests found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
