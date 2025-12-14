
'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Paperclip, ArrowUp } from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardWidgets from '@/components/DashboardWidgets';
import RecommendedActions from '@/components/RecommendedActions';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [taskInput, setTaskInput] = useState("");

    // Get current time greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-slate-900">
            <DashboardSidebar />

            <main className="flex-1 md:ml-72 bg-[#FDFDFD] min-h-screen p-6 md:p-12 lg:p-20 overflow-y-auto">
                <div className="max-w-4xl mx-auto">

                    {/* Header / Date */}
                    <div className="flex items-center gap-2 mb-8 text-sm font-medium text-slate-400">
                        <span>☀</span>
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: 'numeric' })}</span>
                    </div>

                    {/* Greeting */}
                    <div className="mb-12">
                        <h1 className="text-5xl font-serif text-slate-900 mb-2">
                            Hi, <span className="italic font-normal">{session?.user?.name?.split(' ')[0] || 'Friend'}</span>
                        </h1>
                        <h2 className="text-5xl font-normal text-slate-400 font-serif">
                            How can I help you today?
                        </h2>
                    </div>

                    {/* Main Input */}
                    <div className="relative group">
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 hover:border-slate-200 transition-colors p-2 flex flex-col min-h-[140px] relative focus-within:ring-4 focus-within:ring-slate-50 focus-within:border-slate-300">
                            <textarea
                                value={taskInput}
                                onChange={(e) => setTaskInput(e.target.value)}
                                placeholder="Give Aporto a task to work on..."
                                className="w-full bg-transparent resize-none outline-none p-4 text-lg placeholder:text-slate-300 text-slate-800 font-medium h-full min-h-[100px]"
                            />

                            <div className="flex items-center justify-between px-4 pb-2 mt-auto">
                                <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <button
                                    disabled={!taskInput.trim()}
                                    className="p-2 bg-slate-100 hover:bg-slate-900 text-slate-400 hover:text-white rounded-full transition-all disabled:opacity-50 disabled:hover:bg-slate-100 disabled:hover:text-slate-400"
                                >
                                    <ArrowUp className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Widgets & Actions */}
                    <DashboardWidgets />
                    <RecommendedActions />

                </div>
            </main>
        </div>
    );
}
