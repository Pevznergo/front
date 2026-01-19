import Link from 'next/link'
import { LayoutDashboard, Users, Tag, LogOut } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#F2F2F7] flex font-sans">
            {/* Sidebar (iPadOS style) */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 ml-72 p-8 md:p-12 max-w-5xl mx-auto w-full">
                {children}
            </main>
        </div>
    )
}
