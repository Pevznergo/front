"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    Loader2, Send, QrCode, Download, History as HistoryIcon,
    MessageSquare, ExternalLink, Trash2, Search,
    Link as LinkIcon, Link2Off, MapPin, Edit3, CheckCircle2,
    Clock, AlertCircle, List
} from "lucide-react";
import QRCode from "react-qr-code";
import QRCodeLib from "qrcode";

interface ShortLink {
    id: number;
    code: string;
    target_url: string;
    created_at: string;
    clicks_count?: number;
    member_count?: number;
    tg_chat_id?: string;
    reviewer_name?: string; // used as title for ecosystems
    district?: string;
    status?: string;
    is_stuck?: boolean;
}

interface QueueItem {
    id: number;
    title: string;
    district: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    scheduled_at: string;
    error?: string;
}

interface NextClientProps {
    initialLinks: ShortLink[];
}

export default function NextClient({ initialLinks }: NextClientProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<{ title: string, district: string }>();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ link: string; title: string } | null>(null);
    const [links, setLinks] = useState<ShortLink[]>(initialLinks);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'ecosystem' | 'qr_batch'>('ecosystem');
    const [batchLoading, setBatchLoading] = useState(false);
    const [batchResult, setBatchResult] = useState<{ count: number } | null>(null);
    const [editingTarget, setEditingTarget] = useState<{ id: number; value: string } | null>(null);
    const [editingGroup, setEditingGroup] = useState<{ id: number; tgChatId: string; title: string; district: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [refreshingId, setRefreshingId] = useState<number | null>(null);
    const [stuckFilter, setStuckFilter] = useState<'all' | 'stuck' | 'not_stuck'>('all');
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [batchInput, setBatchInput] = useState("");
    const [batchInterval, setBatchInterval] = useState(15);

    // Filter logic
    const filterLinks = (list: ShortLink[]) => {
        if (!searchTerm) return list;
        const low = searchTerm.toLowerCase();
        return list.filter(l =>
            l.code.toLowerCase().includes(low) ||
            (l.reviewer_name || "").toLowerCase().includes(low) ||
            (l.district || "").toLowerCase().includes(low) ||
            (l.target_url || "").toLowerCase().includes(low)
        );
    };

    const allLinks = filterLinks(links);

    const filterByStuck = (list: any[]) => {
        if (stuckFilter === 'all') return list;
        return list.filter(l => stuckFilter === 'stuck' ? l.is_stuck : !l.is_stuck);
    };

    // Grouping logic for Ecosystems
    const ecosystemMap: Record<string, {
        id: number;
        tg_chat_id: string;
        title: string;
        district: string;
        total_clicks: number;
        member_count: number;
        codes: string[];
    }> = {};

    links.forEach(l => {
        if (!l.tg_chat_id) return;
        const key = l.tg_chat_id;
        if (!ecosystemMap[key]) {
            ecosystemMap[key] = {
                id: l.id,
                tg_chat_id: l.tg_chat_id,
                title: l.reviewer_name || 'Без названия',
                district: l.district || '',
                total_clicks: 0,
                member_count: l.member_count || 0,
                codes: []
            };
        }
        ecosystemMap[key].total_clicks += (l.clicks_count || 0);
        ecosystemMap[key].codes.push(l.code);
        // Sync title/district if they differ within the same group (optional, we take first found)
    });

    const ecosystemLinks = filterLinks(Object.values(ecosystemMap).map(e => ({
        id: e.id,
        tg_chat_id: e.tg_chat_id,
        reviewer_name: e.title,
        district: e.district,
        clicks_count: e.total_clicks,
        member_count: e.member_count,
        code: e.codes.join(', '), // for searchability
        codes: e.codes,
        target_url: links.find(l => l.tg_chat_id === e.tg_chat_id)?.target_url || '',
        is_stuck: links.some(l => l.tg_chat_id === e.tg_chat_id && l.is_stuck),
        created_at: new Date().toISOString()
    } as any)) as any);

    const filteredEcosystems = filterByStuck(ecosystemLinks);

    const fetchQueue = async () => {
        try {
            const res = await fetch("/api/queue");
            if (res.ok) {
                const data = await res.json();
                setQueue(data);
            }
        } catch (e) {
            console.error("Failed to fetch queue", e);
        }
    };

    // We no longer use localStorage history since we have DB-backed initialLinks
    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const onSubmit = async (data: { title: string, district: string }) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/create-chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Secret-Key": process.env.NEXT_PUBLIC_APP_SECRET_KEY || "", // Using public env for MVP simplicity
                },
                body: JSON.stringify(data),
            });

            const resultData = await res.json();

            if (!res.ok) {
                throw new Error(resultData.error || "Failed to create chat");
            }

            const newItem: ShortLink = {
                id: resultData.chatId || Math.random().toString(36).substr(2, 9),
                code: resultData.shortCode,
                target_url: resultData.link,
                reviewer_name: data.title,
                district: data.district,
                created_at: new Date().toISOString(),
                clicks_count: 0,
                member_count: 0
            };

            setLinks([newItem, ...links]);
            setResult({ link: resultData.link, title: data.title });
            reset();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshStats = async (code: string, id: number) => {
        setRefreshingId(id);
        try {
            const res = await fetch(`/api/links/${code}`);
            const data = await res.json();
            if (res.ok) {
                setLinks(prev => prev.map(l => l.id === id ? {
                    ...l,
                    clicks_count: data.clicks,
                    member_count: data.memberCount
                } : l));
            }
        } catch (e) {
            console.error("Failed to refresh stats", e);
        } finally {
            setRefreshingId(null);
        }
    };

    const downloadQR = async (link: string, title: string) => {
        try {
            const dataUrl = await QRCodeLib.toDataURL(link, { width: 600, margin: 2 });
            const downloadLink = document.createElement("a");
            downloadLink.href = dataUrl;
            downloadLink.download = `QR_${title.replace(/\s+/g, "_")}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } catch (err) {
            console.error("Failed to generate QR for download", err);
        }
    };



    const handleAddToQueue = async () => {
        const lines = batchInput.split("\n").filter(l => l.trim());
        if (lines.length === 0) return;

        const batch = lines.map(line => {
            const [title, district] = line.split("|").map(s => s.trim());
            return { title: title || line.trim(), district: district || "" };
        });

        setBatchLoading(true);
        try {
            const res = await fetch("/api/queue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ batch, intervalMinutes: batchInterval })
            });

            if (!res.ok) throw new Error("Failed to add to queue");

            alert(`Добавлено в очередь: ${batch.length} чатов`);
            setBatchInput("");
            fetchQueue();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setBatchLoading(false);
        }
    };

    const handleBatchGenerate = async () => {
        if (!confirm("Сгенерировать 200 новых QR-кодов (коротких ссылок)?")) return;
        setBatchLoading(true);
        setBatchResult(null);
        try {
            const res = await fetch("/api/batch-qr", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate");
            setBatchResult({ count: data.count });

            // Refresh links from server or manually update
            const refreshRes = await fetch("/api/shorten/list"); // I'll need to create this or do it manually
            // Actually, I can just pretend we generated them and tell user to refresh, 
            // or I can fetch them. Let's assume there is a list endpoint or 
            // we just reload the page for now (simplest given we have initialLinks).
            // Actually, let's just push manually generated codes to the top of state if API returns them.
            if (data.codes) {
                const newLinks: ShortLink[] = data.codes.map((code: string) => ({
                    id: Math.random(), // Temporary ID for UI
                    code,
                    target_url: "",
                    created_at: new Date().toISOString()
                }));
                setLinks([...newLinks, ...links]);
            }

            alert(`Успешно создано ${data.count} кодов!`);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setBatchLoading(false);
        }
    };

    const handleUpdateTarget = async (code: string, id: number) => {
        if (!editingTarget) return;
        try {
            const res = await fetch(`/api/links/${code}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUrl: editingTarget.value })
            });
            if (!res.ok) throw new Error("Failed to update");
            setLinks(prev => prev.map(l => l.id === id ? { ...l, target_url: editingTarget.value } : l));
            setEditingTarget(null);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleUpdateGroup = async (code: string, id: number) => {
        if (!editingGroup) return;
        try {
            const res = await fetch(`/api/links/${code}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tgChatId: editingGroup.tgChatId || null,
                    title: editingGroup.title || null,
                    district: editingGroup.district || null
                })
            });
            if (!res.ok) throw new Error("Failed to update");

            setLinks(prev => prev.map(l => l.id === id ? {
                ...l,
                tg_chat_id: editingGroup.tgChatId,
                reviewer_name: editingGroup.title,
                district: editingGroup.district
            } : l));
            setEditingGroup(null);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleDisconnect = async (code: string, id: number) => {
        if (!confirm('Отвязать эту ссылку от группы?')) return;
        try {
            const res = await fetch(`/api/links/${code}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tgChatId: null })
            });
            if (!res.ok) throw new Error("Failed to disconnect");

            setLinks(prev => prev.map(l => l.id === id ? {
                ...l,
                tg_chat_id: undefined,
                reviewer_name: undefined,
                member_count: 0
            } : l));
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleToggleStuck = async (tgChatId: string, currentState: boolean) => {
        const newState = !currentState;
        try {
            // Find all links with this chat ID
            const affectedLinks = links.filter(l => l.tg_chat_id === tgChatId);
            await Promise.all(affectedLinks.map(l =>
                fetch(`/api/links/${l.code}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isStuck: newState })
                })
            ));

            setLinks(prev => prev.map(l => l.tg_chat_id === tgChatId ? { ...l, is_stuck: newState } : l));
        } catch (e: any) {
            alert('Ошибка при обновлении статуса');
        }
    };

    const handleUpdateStatus = async (code: string, id: number, newStatus: string) => {
        try {
            const res = await fetch(`/api/links/${code}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error("Failed to update status");
            setLinks(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleDeleteEcosystem = async (tgChatId: string, codes: string[]) => {
        if (!confirm('Отвязать все QR-коды от этой группы? Сами ссылки останутся.')) return;
        try {
            await Promise.all(codes.map(code =>
                fetch(`/api/links/${code}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tgChatId: null })
                })
            ));
            setLinks(prev => prev.map(l => l.tg_chat_id === tgChatId ? {
                ...l,
                tg_chat_id: undefined,
                reviewer_name: undefined,
                member_count: 0,
                status: 'не подключен'
            } : l));
        } catch (e: any) {
            alert('Ошибка при удалении экосистемы');
        }
    };

    const handleDeleteLink = async (id: number, code: string) => {
        if (!confirm('Вы уверены, что хотите удалить эту ссылку?')) return;
        try {
            const res = await fetch('/api/shorten', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                setLinks(prev => prev.filter(l => l.id !== id));
                if (result?.link.includes(`/s/${code}`)) {
                    setResult(null);
                }
            } else {
                alert('Ошибка при удалении');
            }
        } catch (e) {
            alert('Ошибка при удалении');
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text || '');
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="w-full max-w-6xl space-y-12">
            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                <div className="flex gap-4 p-1.5 bg-slate-900/50 border border-white/10 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('ecosystem')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'ecosystem'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Экосистемы
                    </button>
                    <button
                        onClick={() => setActiveTab('qr_batch')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'qr_batch'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <QrCode className="w-4 h-4" />
                        QR Генератор
                    </button>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Поиск по коду, адресу или району..."
                        className="w-full h-12 bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                    />
                </div>
            </div>

            {activeTab === 'ecosystem' ? (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Creation Form */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-xl font-semibold">Создание экосистемы</h2>
                                <p className="text-sm text-slate-400">Введите адрес дома для создания чата с топиками</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="relative">
                                <input
                                    {...register("title", { required: "Адрес дома обязателен" })}
                                    placeholder="Напр: ул. Пушкина, д. 10"
                                    className="w-full h-14 bg-slate-900/50 border border-white/10 rounded-2xl px-6 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                />
                                {errors.title && (
                                    <p className="text-red-400 text-xs mt-1 ml-2">{errors.title.message}</p>
                                )}
                            </div>

                            <div className="relative">
                                <input
                                    {...register("district")}
                                    placeholder="Район (напр: Хамовники)"
                                    className="w-full h-14 bg-slate-900/50 border border-white/10 rounded-2xl px-6 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-500/20"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        ⚡ Создать экосистему
                                    </>
                                )}
                            </button>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Result Block */}
                    {result && (
                        <div className="p-8 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="p-4 bg-white rounded-2xl">
                                    <QRCode value={result.link} size={180} />
                                </div>
                                <div className="flex-1 text-left space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Готово! 🚀</h3>
                                        <p className="text-slate-400">Чат "{result.title}" успешно создан.</p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <a
                                            href={result.link}
                                            target="_blank"
                                            className="px-6 h-12 bg-white text-slate-900 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-100 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Открыть чат
                                        </a>
                                        <button
                                            onClick={() => downloadQR(result.link, result.title)}
                                            className="px-6 h-12 bg-slate-800 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-700 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            Скачать QR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History Table */}
                    {ecosystemLinks.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <HistoryIcon className="w-4 h-4" />
                                    <h3 className="text-sm font-medium uppercase tracking-wider">История созданных чатов</h3>
                                </div>
                                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-tighter">
                                    <button
                                        onClick={() => setStuckFilter('all')}
                                        className={`px-3 py-1.5 rounded-lg transition-all ${stuckFilter === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Все
                                    </button>
                                    <button
                                        onClick={() => setStuckFilter('stuck')}
                                        className={`px-3 py-1.5 rounded-lg transition-all ${stuckFilter === 'stuck' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Оклеены
                                    </button>
                                    <button
                                        onClick={() => setStuckFilter('not_stuck')}
                                        className={`px-3 py-1.5 rounded-lg transition-all ${stuckFilter === 'not_stuck' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Не оклеены
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-slate-500">
                                            <th className="p-4 font-semibold">Группа / Район</th>
                                            <th className="p-4 font-semibold">Суммарная Статистика</th>
                                            <th className="p-4 font-semibold">Связанные QR</th>
                                            <th className="p-4 font-semibold text-right">Действие</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEcosystems.map((item: any) => (
                                            <tr key={item.tg_chat_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 group/title">
                                                            <div className="font-medium text-white">{item.reviewer_name}</div>
                                                            <button
                                                                onClick={() => setEditingGroup({
                                                                    id: item.id,
                                                                    tgChatId: item.tg_chat_id,
                                                                    title: item.reviewer_name,
                                                                    district: item.district
                                                                })}
                                                                className="opacity-0 group-hover/title:opacity-100 p-1 hover:bg-white/10 rounded transition-all text-slate-500"
                                                            >
                                                                <Edit3 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                                            <MapPin className="w-3 h-3" />
                                                            {item.district || 'Район не указан'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-4 items-center">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Всего кликов</span>
                                                            <span className="text-sm font-bold text-indigo-400">{item.clicks_count}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Участники</span>
                                                            <span className="text-sm font-bold text-purple-400">{item.member_count}</span>
                                                        </div>
                                                        <div className="flex flex-col px-2 border-l border-white/10 ml-2">
                                                            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Статус</span>
                                                            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">ПОДКЛЮЧЕН</span>
                                                        </div>
                                                        {item.is_stuck && (
                                                            <div className="flex flex-col px-2 border-l border-white/10 ml-2">
                                                                <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Физика</span>
                                                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">ОКЛЕЕН</span>
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={() => handleRefreshStats(item.codes[0], item.id)}
                                                            className={`p-1 hover:bg-white/10 rounded transition-all ${refreshingId === item.id ? 'animate-spin text-indigo-400' : 'text-slate-600'}`}
                                                        >
                                                            <HistoryIcon className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-2 max-w-[200px]">
                                                        {item.codes.map((code: string) => (
                                                            <button
                                                                key={code}
                                                                onClick={() => copyToClipboard(`${window.location.protocol}//${window.location.host}/s/${code}`, code)}
                                                                className="font-mono text-[9px] text-slate-400 bg-white/5 px-2 py-0.5 rounded hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
                                                            >
                                                                {code}
                                                                <ExternalLink className={`w-2.5 h-2.5 ${copiedId === code ? 'text-green-400' : 'opacity-30'}`} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2 text-slate-400">
                                                        <button
                                                            onClick={() => handleToggleStuck(item.tg_chat_id, !!item.is_stuck)}
                                                            className={`p-2.5 rounded-xl transition-all ${item.is_stuck ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-white/10 text-slate-400 hover:text-emerald-400'}`}
                                                            title={item.is_stuck ? "Отметить как НЕ оклеен" : "Отметить как ОКЛЕЕН"}
                                                        >
                                                            <CheckCircle2 className={`w-4.5 h-4.5 ${item.is_stuck ? 'fill-emerald-400/20' : ''}`} />
                                                        </button>
                                                        <a
                                                            href={links.find(l => l.tg_chat_id === item.tg_chat_id)?.target_url}
                                                            target="_blank"
                                                            className="p-2.5 hover:bg-white/10 rounded-xl text-indigo-400 transition-all"
                                                            title="Открыть группу"
                                                        >
                                                            <ExternalLink className="w-4.5 h-4.5" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDeleteEcosystem(item.tg_chat_id, item.codes)}
                                                            className="p-2.5 hover:bg-red-500/10 rounded-xl text-red-500/50 hover:text-red-500 transition-all"
                                                            title="Удалить экосистему"
                                                        >
                                                            <Trash2 className="w-4.5 h-4.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center space-y-8">
                        <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto">
                            <QrCode className="w-10 h-10 text-indigo-400" />
                        </div>

                        <div className="max-w-md mx-auto space-y-2">
                            <h2 className="text-2xl font-bold">Очередь создания чатов</h2>
                            <p className="text-slate-400 text-sm">Введите список чатов (Название | Район) по одному на строку.</p>
                        </div>

                        <div className="max-w-2xl mx-auto space-y-4">
                            <textarea
                                value={batchInput}
                                onChange={(e) => setBatchInput(e.target.value)}
                                placeholder="ЖК Риверсайд | Приморский&#10;ЖК Квартал | Центральный"
                                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            />

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold pl-2">Интервал:</span>
                                    {[10, 15, 20, 30].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setBatchInterval(m)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${batchInterval === m ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {m} мин
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleAddToQueue}
                                    disabled={batchLoading || !batchInput.trim()}
                                    className="h-12 px-8 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl"
                                >
                                    {batchLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Добавить в очередь ({batchInput.split('\n').filter(l => l.trim()).length})
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Current Queue Display */}
                        {queue.length > 0 && (
                            <div className="max-w-4xl mx-auto mt-12 space-y-4 text-left">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock className="w-4 h-4" />
                                        <h3 className="text-xs font-medium uppercase tracking-wider">Текущая очередь ({queue.filter(q => q.status === 'pending').length} ожидают)</h3>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    {queue.slice(0, 5).map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{item.title}</span>
                                                <span className="text-[10px] text-slate-500">{item.district}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col text-right">
                                                    <span className="text-[10px] text-slate-500 uppercase tracking-tighter">План</span>
                                                    <span className="text-xs font-mono text-indigo-400">
                                                        {new Date(item.scheduled_at).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${item.status === 'processing' ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' :
                                                    item.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-slate-500/20 text-slate-500'
                                                    }`}>
                                                    {item.status === 'pending' ? 'ОЖИДАЕТ' : item.status === 'processing' ? 'В РАБОТЕ' : 'ОШИБКА'}
                                                </span>
                                                {item.status === 'failed' && (
                                                    <div title={item.error}>
                                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {queue.length > 5 && (
                                        <div className="text-center text-[10px] text-slate-600 uppercase tracking-widest pt-2">
                                            И еще {queue.length - 5} чатов впереди...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center space-y-8">
                        <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto">
                            <QrCode className="w-10 h-10 text-indigo-400" />
                        </div>

                        <div className="max-w-md mx-auto space-y-2">
                            <h2 className="text-2xl font-bold">Массовая генерация QR</h2>
                            <p className="text-slate-400 text-sm">Создайте 200 уникальных QR-кодов одним кликом. Позже вы сможете назначить им ссылки ниже.</p>
                        </div>

                        <button
                            onClick={handleBatchGenerate}
                            disabled={batchLoading}
                            className="h-16 px-12 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl mx-auto text-lg"
                        >
                            {batchLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Сгенерировать 200 кодов
                                </>
                            )}
                        </button>

                        {batchResult && (
                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                                Готово! Создано {batchResult.count} ссылок.
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2 text-slate-400">
                                <QrCode className="w-4 h-4" />
                                <h3 className="text-sm font-medium uppercase tracking-wider">База всех ссылок</h3>
                            </div>
                            <div className="text-xs text-slate-500 uppercase tracking-widest">
                                Всего: {links.length}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-slate-500">
                                        <th className="p-4 font-semibold">Код</th>
                                        <th className="p-4 font-semibold">Группа / Привязка</th>
                                        <th className="p-4 font-semibold">Редирект</th>
                                        <th className="p-4 font-semibold text-right">Действие</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allLinks.map((link) => {
                                        const shortUrl = `${window.location.protocol}//${window.location.host}/s/${link.code}`;
                                        return (
                                            <tr key={link.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <button
                                                            onClick={() => copyToClipboard(shortUrl, `s-${link.id}`)}
                                                            className="text-white font-mono font-bold text-sm bg-white/5 px-2 py-1 rounded hover:bg-white/10 transition-colors flex items-center gap-2 w-fit"
                                                        >
                                                            {link.code}
                                                            <ExternalLink className={`w-3 h-3 ${copiedId === `s-${link.id}` ? 'text-green-400' : 'text-slate-500'}`} />
                                                        </button>

                                                        {/* Status Badge & Actions */}
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${link.status === 'подключен' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                                link.status === 'не подключен' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                                    link.status === 'распечатан' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                                        'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                                                                }`}>
                                                                {link.status || 'не распечатан'}
                                                            </span>

                                                            {(!link.status || link.status === 'не распечатан') && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(link.code, link.id, 'распечатан')}
                                                                    className="text-[9px] text-slate-600 hover:text-white transition-colors underline"
                                                                >
                                                                    Печать...
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="flex gap-2 text-[8px] text-slate-600 uppercase">
                                                            <span>{link.clicks_count || 0} clks</span>
                                                            <span>{link.member_count || 0} subs</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        {editingGroup?.id === link.id ? (
                                                            <div className="space-y-2 p-3 bg-slate-900/50 rounded-xl border border-indigo-500/30">
                                                                <input
                                                                    placeholder="Chat ID (напр: -100...)"
                                                                    value={editingGroup.tgChatId}
                                                                    onChange={(e) => setEditingGroup({ ...editingGroup, tgChatId: e.target.value })}
                                                                    className="w-full bg-slate-950 border border-white/5 rounded px-2 py-1.5 text-[11px] outline-none"
                                                                />
                                                                <input
                                                                    placeholder="Название группы"
                                                                    value={editingGroup.title}
                                                                    onChange={(e) => setEditingGroup({ ...editingGroup, title: e.target.value })}
                                                                    className="w-full bg-slate-950 border border-white/5 rounded px-2 py-1.5 text-[11px] outline-none"
                                                                />
                                                                <input
                                                                    placeholder="Район"
                                                                    value={editingGroup.district}
                                                                    onChange={(e) => setEditingGroup({ ...editingGroup, district: e.target.value })}
                                                                    className="w-full bg-slate-950 border border-white/5 rounded px-2 py-1.5 text-[11px] outline-none"
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => handleUpdateGroup(link.code, link.id)} className="flex-1 py-1 px-2 bg-indigo-600 text-white text-[10px] rounded font-bold">Safe</button>
                                                                    <button onClick={() => setEditingGroup(null)} className="py-1 px-3 bg-white/5 text-slate-500 text-[10px] rounded">Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col gap-0.5 max-w-[200px]">
                                                                {link.tg_chat_id ? (
                                                                    <>
                                                                        <div className="text-xs font-semibold text-white truncate">{link.reviewer_name || 'Связанный чат'}</div>
                                                                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                                                            <MapPin className="w-2.5 h-2.5" />
                                                                            {link.district || 'Без района'}
                                                                        </div>
                                                                        <button
                                                                            onClick={() => setEditingGroup({ id: link.id, tgChatId: link.tg_chat_id || '', title: link.reviewer_name || '', district: link.district || '' })}
                                                                            className="text-[9px] text-indigo-400 hover:text-indigo-300 transition-colors w-fit flex items-center gap-1 mt-1"
                                                                        >
                                                                            <Edit3 className="w-3 h-3" /> Редактировать привязку
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => setEditingGroup({ id: link.id, tgChatId: '', title: '', district: '' })}
                                                                        className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 text-[10px] font-bold hover:bg-indigo-500/20 transition-all flex items-center gap-1.5 w-fit"
                                                                    >
                                                                        <LinkIcon className="w-3 h-3" /> Привязать к группе
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-2">
                                                        {editingTarget?.id === link.id ? (
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={editingTarget.value}
                                                                    onChange={(e) => setEditingTarget({ ...editingTarget, value: e.target.value })}
                                                                    className="flex-1 bg-slate-900 border border-indigo-500/50 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    onClick={() => handleUpdateTarget(link.code, link.id)}
                                                                    className="px-3 py-1 bg-indigo-600 text-white text-xs rounded font-bold"
                                                                >
                                                                    Save
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 group/target">
                                                                <div className={`text-xs truncate max-w-[200px] ${link.target_url ? 'text-slate-400' : 'text-red-400 italic'}`}>
                                                                    {link.target_url || 'Target не задан'}
                                                                </div>
                                                                <button
                                                                    onClick={() => setEditingTarget({ id: link.id, value: link.target_url || '' })}
                                                                    className="opacity-0 group-hover/target:opacity-100 p-1 hover:bg-white/10 rounded text-slate-500 transition-all"
                                                                >
                                                                    <Edit3 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2 text-slate-500">
                                                        <button
                                                            onClick={() => downloadQR(shortUrl, `QR_${link.code}`)}
                                                            className="p-2.5 hover:bg-white/10 rounded-xl transition-all"
                                                            title="Скачать QR"
                                                        >
                                                            <QrCode className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteLink(link.id, link.code)}
                                                            className="p-2.5 hover:bg-red-500/10 rounded-xl hover:text-red-500 transition-all"
                                                            title="Удалить"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
