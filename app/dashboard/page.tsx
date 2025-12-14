
'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Plus, CheckCircle, Clock, Trash2, LogOut, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [isCreating, setIsCreating] = useState(false);
    const [newReview, setNewReview] = useState("");
    const [reviews, setReviews] = useState([
        { id: 1, content: "This store scammed me...", status: "pending", date: "Just now" },
        // We will fetch real data later, this is a mock for UI
    ]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReview.trim()) return;

        // TODO: Connect to real API
        // await fetch('/api/tasks/create', ...)

        setReviews([{ id: Date.now(), content: newReview, status: "pending", date: "Just now" }, ...reviews]);
        setNewReview("");
        setIsCreating(false);
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7]">
            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="font-bold text-xl text-slate-900 tracking-tight flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">R</span>
                            </div>
                            Aporto AI
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                {session?.user?.image && (
                                    <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full border border-slate-200" />
                                )}
                                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                                    {session?.user?.name || "User"}
                                </span>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Removal Tasks</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage and track your active disputes.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-[#007AFF] hover:bg-[#006ee6] text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Task
                    </button>
                </div>

                {/* Create Task Modal/Overlay (Inline for simplicity) */}
                {isCreating && (
                    <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative animate-in slide-in-from-top-4 fade-in duration-300">
                        <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Submit New Review</h3>
                        <form onSubmit={handleCreateTask}>
                            <textarea
                                value={newReview}
                                onChange={(e) => setNewReview(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 placeholder:text-slate-400 resize-none outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
                                rows={4}
                                placeholder="Paste the review link or content here..."
                                autoFocus
                            />
                            <div className="flex justify-end mt-4">
                                <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-black transition-all flex items-center gap-2">
                                    Start Analysis
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* User Feedback for No Tasks */}
                {reviews.length === 0 && !isCreating && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/60 border-dashed">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-semibold mb-2">No active tasks</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">Get started by creating a new removal task for our AI agent.</p>
                    </div>
                )}

                {/* Task List */}
                <div className="grid gap-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:border-blue-200 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${review.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-amber-50 text-amber-500'}`}>
                                    {review.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 line-clamp-1 max-w-md">"{review.content}"</h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                        <span>{review.date}</span>
                                        <span>•</span>
                                        <span className="capitalize">{review.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button className="bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}
