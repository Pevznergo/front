import Link from 'next/link'
import { LayoutDashboard, Users, Tag, LogOut } from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#F2F2F7] flex font-sans">
            {/* Sidebar (iPadOS style) */}
            <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200 flex flex-col fixed h-full z-20">
                <div className="p-6 pt-8">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Management
                    </div>
                    <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-900 group">
                        <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center text-white shadow-sm">
                            <LayoutDashboard className="w-4 h-4" />
                        </div>
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href="/admin/partners" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-900 group">
                        <div className="w-7 h-7 rounded-md bg-pink-500 flex items-center justify-center text-white shadow-sm">
                            <Users className="w-4 h-4" />
                        </div>
                        <span className="font-medium">Partners & Tariffs</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                    <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Exit to App</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-8 md:p-12 max-w-5xl mx-auto w-full">
                {children}
            </main>
        </div>
    )
}
