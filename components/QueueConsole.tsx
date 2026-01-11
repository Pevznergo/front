"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Clock, CheckCircle2, ChevronRight, ChevronLeft, Eye, EyeOff, Play, Trash2 } from "lucide-react";

interface QueueTask {
    unique_id: string;
    id: number;
    chat_id: string;
    action_type: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    scheduled_for?: string;
    created_at: string;
    payload?: any;
    source?: 'topic' | 'create';
}

export default function QueueConsole() {
    const [tasks, setTasks] = useState<QueueTask[]>([]);
    const [isOpen, setIsOpen] = useState(true);
    const [showCompleted, setShowCompleted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [now, setNow] = useState(Date.now());

    const fetchQueue = async () => {
        try {
            // Add timestamp to prevent caching
            const res = await fetch(`/api/topic-queue/list?show_completed=${showCompleted}&t=${Date.now()}`, {
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                console.log("Queue Data:", data);
                if (data.tasks) {
                    setTasks(data.tasks);
                } else {
                    console.error("No tasks array in response:", data);
                }
            } else {
                console.error("Fetch failed:", res.status);
            }
        } catch (e: any) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(() => {
            fetchQueue();
            setNow(Date.now()); // Update timer
        }, 1000); // Update every second for countdown
        return () => clearInterval(interval);
    }, [showCompleted]);

    const handleProcess = async () => {
        setIsProcessing(true);
        try {
            await fetch("/api/queue/process?force=true");
            await fetch("/api/topic-queue/process");
            await fetchQueue();
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id: number, source: string) => {
        if (!confirm(`Удалить задачу #${id}?`)) return;
        try {
            console.log(`Deleting task ${id} from source ${source}`);
            const res = await fetch("/api/queue/delete-task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, source })
            });

            const data = await res.json();

            if (res.ok) {
                if (data.count === 0) {
                    const debugInfo = JSON.stringify(data.debug, null, 2);
                    alert(`Не удалено (count=0).\nДиагностика:\n${debugInfo}\n\nВозможно, задача в другой таблице или уже удалена.`);
                }
                // Optimistically remove from UI to handle cache delay
                setTasks(prev => prev.filter(t => !(t.id === id && (t.source || 'topic') === source)));
                fetchQueue();
            } else {
                alert(`Ошибка удаления: ${data.error || res.statusText}`);
            }
        } catch (e: any) {
            console.error(e);
            alert(`Ошибка сети: ${e.message}`);
        }
    };

    const getTimeRemaining = (scheduledDate: string) => {
        const diff = new Date(scheduledDate).getTime() - now;
        if (diff <= 0) return null;

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    };

    const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'processing').length;

    return (
        <div
            className={`fixed right-0 top-0 bottom-0 z-50 transition-all duration-300 transform bg-slate-950/90 backdrop-blur-md border-l border-white/10 flex flex-col ${isOpen ? 'w-96 translate-x-0' : 'w-12 translate-x-0' // Using minimal width for collapsed state instead of translating off-screen
                }`}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-indigo-600 rounded-l-lg flex items-center justify-center text-white shadow-lg hover:bg-indigo-500 transition-colors"
                title="Toggle Console"
            >
                {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Content when open */}
            {isOpen ? (
                <div className="flex flex-col h-full p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${pendingCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Queue Console</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500 font-mono">{pendingCount} Active</span>
                            <button
                                onClick={handleProcess}
                                disabled={isProcessing}
                                className={`text-slate-400 hover:text-green-400 transition-colors ${isProcessing ? 'animate-spin text-green-500' : ''}`}
                                title="Force Process Queues"
                            >
                                {isProcessing ? <Loader2 className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                            </button>
                            {tasks.some(t => t.status === 'failed') && (
                                <button
                                    onClick={async () => {
                                        if (!confirm("Удалить ВСЕ задачи со статусом Failed?")) return;
                                        try {
                                            const res = await fetch("/api/queue/clear-failed", { method: "POST" });
                                            const data = await res.json();
                                            if (res.ok) {
                                                alert(`Удалено ${data.count} ошибок.`);
                                                fetchQueue();
                                            } else {
                                                alert(data.error);
                                            }
                                        } catch (e: any) { alert(e.message) }
                                    }}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                    title="Clear All Failed Tasks"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                            <button
                                onClick={() => setShowCompleted(!showCompleted)}
                                className={`text-slate-400 hover:text-white transition-colors ${showCompleted ? 'text-indigo-400' : ''}`}
                                title={showCompleted ? "Hide Completed" : "Show Completed (24h)"}
                            >
                                {showCompleted ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {tasks.length === 0 ? (
                            <div className="text-center text-slate-500 text-xs py-10">
                                Очередь пуста
                            </div>
                        ) : (
                            tasks.map(task => {
                                const timeLeft = task.scheduled_for ? getTimeRemaining(task.scheduled_for) : null;
                                return (
                                    <div key={task.unique_id} className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs flex flex-col gap-2 group relative">
                                        <div className="flex items-center justify-between">
                                            <span className={`font-bold uppercase text-[10px] px-1.5 py-0.5 rounded ${task.status === 'processing' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                                                task.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                                    task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                        'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                {task.status}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] text-slate-500 font-mono">#{task.id}</span>
                                                <button
                                                    onClick={() => handleDelete(task.id, task.source || 'topic')}
                                                    className="opacity-100 p-1 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 rounded transition-all"
                                                    title="Удалить задачу"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="font-mono text-white/80 truncate">
                                            {task.action_type}
                                        </div>

                                        {task.error && (
                                            <div className="text-red-400 break-words bg-red-950/30 p-1 rounded border border-red-500/20 text-[9px]">
                                                {task.error}
                                            </div>
                                        )}

                                        {timeLeft && task.status === 'pending' && (
                                            <div className="flex items-center gap-1 text-amber-400 text-[10px] bg-amber-500/10 p-1 rounded">
                                                <Clock className="w-3 h-3" />
                                                Wait: {timeLeft}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            ) : (
                // Collapsed State Content (Indicators)
                <div className="flex flex-col items-center py-4 gap-4 h-full">
                    <div className="writing-mode-vertical text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap rotate-180">
                        Queue Console
                    </div>
                    {pendingCount > 0 && (
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-900 font-bold text-[10px] flex items-center justify-center">
                            {pendingCount}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Add to global css if valid for rotation
// .writing-mode-vertical { writing-mode: vertical-rl; }
