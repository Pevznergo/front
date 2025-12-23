import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import NextClient from "@/components/NextClient";

export default async function NextPage() {
    const session = await getServerSession(authOptions);

    // Strict email check
    const ALLOWED_EMAIL = "pevznergo@gmail.com";

    if (!session || session.user?.email !== ALLOWED_EMAIL) {
        // Redirect if not logged in or not the authorized user
        redirect('/login?callbackUrl=/next');
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center p-8 md:p-24 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-4xl text-center space-y-12">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs font-medium text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        Aporto Ecosystem MVP
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                        Next Stage
                    </h1>

                    <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
                        Автоматизация создания домовых чатов в Telegram. <br />
                        Добро пожаловать, <span className="text-white font-medium">{session.user?.name || 'Igor'}</span>.
                    </p>
                </div>

                <NextClient />

                <div className="pt-12 border-t border-white/5 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 uppercase tracking-widest">
                        <p>Authorized as {session.user?.email}</p>
                        <p>© 2025 Aporto Automation</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
