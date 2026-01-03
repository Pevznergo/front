"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    Loader2, Send, QrCode, Download, History as HistoryIcon,
    MessageSquare, ExternalLink, Trash2, Search,
    Link as LinkIcon, Link2Off, MapPin, Edit3, CheckCircle2,
    Clock,
    CheckSquare,
    X,
    ChevronLeft, ChevronRight,
    AlertCircle, List, Map as MapIcon, Globe, Printer, Play,
    Clipboard as ClipboardIcon
} from "lucide-react";
import QRCode from "react-qr-code";
import QRCodeLib from "qrcode";
import dynamic from "next/dynamic";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const MapScout = dynamic(() => import("./MapScout"), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-white/5 animate-pulse rounded-3xl flex items-center justify-center font-bold text-slate-500 uppercase tracking-tighter">Загрузка карты...</div>
});

const QueueConsole = dynamic(() => import("./QueueConsole"), { ssr: false });

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

interface Ecosystem {
    id: number;
    tg_chat_id: string;
    title: string;
    district: string;
    invite_link: string;
    marketplace_topic_id?: number;
    admin_topic_id?: number;
    member_count: number;
    last_updated: string;
    created_at: string;
    status?: string;
}

interface QueueItem {
    id: number;
    title: string;
    district: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    scheduled_at: string;
    error?: string;
}



interface StatisticsTabProps {
    // No props needed as it fetches its own data
}

function StatisticsTab() {
    const [data, setData] = useState<{
        timeline: { date: string, count: number }[],
        summary: { totalChats: number, totalQr: number, totalClicks: number, totalSubscribers: number }
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load stats", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Всего чатов</div>
                    <div className="text-3xl font-bold text-white">{data.summary.totalChats}</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">QR Кодов</div>
                    <div className="text-3xl font-bold text-indigo-400">{data.summary.totalQr}</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Всего кликов</div>
                    <div className="text-3xl font-bold text-emerald-400">{data.summary.totalClicks}</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Подписчиков</div>
                    <div className="text-3xl font-bold text-purple-400">{data.summary.totalSubscribers}</div>
                </div>
            </div>

            {/* Charts */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-white">Динамика создания чатов</h3>
                    <p className="text-slate-500 text-xs">Количество новых экосистем по дням</p>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.timeline}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="date"
                                stroke="rgba(255,255,255,0.3)"
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                tickFormatter={(str) => {
                                    const date = new Date(str);
                                    return `${date.getDate()}.${date.getMonth() + 1}`;
                                }}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.3)"
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#6366f1"
                                fillOpacity={1}
                                fill="url(#colorCount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

interface NextClientProps {
    initialLinks: ShortLink[];
    initialEcosystems: Ecosystem[];
}

export default function NextClient({ initialLinks, initialEcosystems }: NextClientProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<{ title: string, district: string }>();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ link: string; title: string } | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [links, setLinks] = useState<ShortLink[]>(initialLinks);
    const [ecosystems, setEcosystems] = useState<Ecosystem[]>(initialEcosystems);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'ecosystem' | 'qr_batch' | 'map' | 'stats'>('ecosystem');
    const [batchLoading, setBatchLoading] = useState(false);
    const [batchResult, setBatchResult] = useState<{ count: number } | null>(null);
    const [editingTarget, setEditingTarget] = useState<{ id: number; value: string } | null>(null);
    const [editingGroup, setEditingGroup] = useState<{ id?: number; tgChatId: string; title: string; district: string } | null>(null);
    const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
    const [showTopicModal, setShowTopicModal] = useState(false);
    const [topicActionData, setTopicActionData] = useState({
        topicName: "📢 Новости",
        message: "",
        pin: true,
        closedAction: undefined as 'close' | 'open' | undefined
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [refreshingId, setRefreshingId] = useState<number | null>(null);
    const [stuckFilter, setStuckFilter] = useState<'all' | 'stuck' | 'not_stuck'>('all');
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [batchInput, setBatchInput] = useState("");
    const [batchInterval, setBatchInterval] = useState(15);
    const [scoutedAddresses, setScoutedAddresses] = useState<any[]>([]);
    const [editingQueueItem, setEditingQueueItem] = useState<QueueItem | null>(null);
    const [nextTask, setNextTask] = useState<{ title: string, scheduled_at: string } | null>(null);
    const [countdown, setCountdown] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'активен' | 'распечатан' | 'приклеен' | 'не распечатан' | 'не подключен' | 'подключен' | 'архив'>('all');
    const [groupSearchTerm, setGroupSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [topicActionProgress, setTopicActionProgress] = useState<{ current: number, total: number } | null>(null);
    const ITEMS_PER_PAGE = 20;

    // Filter logic
    const filterLinks = (list: ShortLink[]) => {
        let filtered = list;

        // 1. Text search (code, title, district, url)
        if (searchTerm) {
            const low = searchTerm.toLowerCase();
            filtered = filtered.filter(l =>
                l.code.toLowerCase().includes(low) ||
                (l.reviewer_name || "").toLowerCase().includes(low) ||
                (l.district || "").toLowerCase().includes(low) ||
                (l.target_url || "").toLowerCase().includes(low)
            );
        }

        // 2. Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(l => l.status === statusFilter);
        }

        // 3. Group Search (filter by ecosystem title)
        if (groupSearchTerm) {
            const lowGroup = groupSearchTerm.toLowerCase();
            filtered = filtered.filter(l => (l.reviewer_name || "").toLowerCase().includes(lowGroup));
        }

        return filtered;
    };

    const filterByStuck = (list: any[]) => {
        let filtered = list;
        if (stuckFilter !== 'all') {
            filtered = filtered.filter(l => stuckFilter === 'stuck' ? l.is_stuck : !l.is_stuck);
        }
        return filtered;
    };

    const filteredAllLinks = filterByStuck(filterLinks(links));
    const totalQrPages = Math.ceil(filteredAllLinks.length / ITEMS_PER_PAGE);
    const paginatedLinks = filteredAllLinks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, stuckFilter, statusFilter, groupSearchTerm]);

    const handleToggleGroupSelect = (tgChatId: string) => {
        setSelectedGroupIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tgChatId)) {
                newSet.delete(tgChatId);
            } else {
                newSet.add(tgChatId);
            }
            return newSet;
        });
    };

    const handleSelectAllGroups = () => {
        if (selectedGroupIds.size === paginatedEcosystems.length) {
            setSelectedGroupIds(new Set());
        } else {
            setSelectedGroupIds(new Set(paginatedEcosystems.map(e => e.tg_chat_id)));
        }
    };

    const handleBatchTopicAction = async () => {
        if (selectedGroupIds.size === 0) return;
        setBatchLoading(true);
        try {
            const res = await fetch("/api/topic-queue/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatIds: Array.from(selectedGroupIds),
                    ...topicActionData
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to enqueue");

            alert(`Добавлено ${data.count} задач в очередь. Запустите обработчик или настройте Cron.`);
            setSelectedGroupIds(new Set());
        } catch (e: any) {
            alert("Ошибка при добавлении в очередь: " + e.message);
        } finally {
            setBatchLoading(false);
        }
    };

    const handleProcessTopicQueue = async () => {
        setBatchLoading(true);
        try {
            // Process loop 
            // We loop until no pending tasks or stopped
            let processing = true;
            let processedCount = 0;

            while (processing) {
                const res = await fetch("/api/topic-queue/process");
                const data = await res.json();

                if (!res.ok || !data.success) {
                    if (data.message === "No pending tasks") {
                        alert("Очередь пуста или все задачи выполнены.");
                    } else {
                        console.error("Task failed:", data.error);
                    }
                    processing = false;
                    break;
                }

                processedCount++;
                // Update UI feedback if needed (using topicActionProgress state perhaps)
                setTopicActionProgress({ current: processedCount, total: 999 }); // optimizing since we don't know total easily without extra call

                // Delay 30-60s
                const delay = Math.floor(Math.random() * 30000) + 30000;
                await new Promise(r => setTimeout(r, delay));
            }
        } catch (e: any) {
            console.error(e);
            alert("Ошибка обработчика");
        } finally {
            setBatchLoading(false);
            setTopicActionProgress(null);
        }
    };
    // Ecosystem rendering logic
    const ecosystemTableData = ecosystems.map(eco => {
        const associatedLinks = links.filter(l => l.tg_chat_id === eco.tg_chat_id);
        const codes = associatedLinks.map(l => l.code);
        const totalClicks = associatedLinks.reduce((sum, l) => sum + (l.clicks_count || 0), 0);

        return {
            ...eco,
            codes,
            total_clicks: totalClicks,
            // For searchability by code:
            code: codes.join(', ')
        };
    });

    const filterEcosystems = (list: any[]) => {
        let filtered = list;

        // Global Search
        if (searchTerm) {
            const low = searchTerm.toLowerCase();
            filtered = filtered.filter(e =>
                e.title.toLowerCase().includes(low) ||
                (e.district || "").toLowerCase().includes(low) ||
                e.codes.some((c: string) => c.toLowerCase().includes(low))
            );
        }

        // Specific Group Search
        if (groupSearchTerm) {
            const low = groupSearchTerm.toLowerCase();
            filtered = filtered.filter(e =>
                e.title.toLowerCase().includes(low) ||
                (e.district || "").toLowerCase().includes(low) ||
                e.codes.some((c: string) => c.toLowerCase().includes(low))
            );
        }

        return filtered;
    };

    const filteredEcosystems = filterByStuck(filterEcosystems(ecosystemTableData));
    const totalPages = Math.ceil(filteredEcosystems.length / ITEMS_PER_PAGE);
    const paginatedEcosystems = filteredEcosystems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const fetchQueue = async () => {
        try {
            const res = await fetch("/api/queue");
            if (res.ok) {
                const data = await res.json();
                if (data.items) {
                    setQueue(data.items);
                    setNextTask(data.nextTask);
                } else {
                    setQueue(data); // Fallback for old API if any
                }
            }
        } catch (e) {
            console.error("Failed to fetch queue", e);
        }
    };

    // Countdown logic
    useEffect(() => {
        if (!nextTask) {
            setCountdown(null);
            return;
        }

        const timer = setInterval(() => {
            const now = new Date();
            const scheduled = new Date(nextTask.scheduled_at);
            const diffMs = scheduled.getTime() - now.getTime();

            if (diffMs <= 0) {
                setCountdown("в обработке...");
                // Fetch queue to see if it moved
                fetchQueue();
                clearInterval(timer);
            } else {
                const totalSeconds = Math.floor(diffMs / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [nextTask]);

    // We no longer use localStorage history since we have DB-backed initialLinks
    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const onSubmit = async (data: { title: string, district: string }) => {
        setLoading(true);
        setError(null);

        // Duplicate check
        const normalizedTitle = data.title.toLowerCase().trim();
        const isDuplicate = ecosystems.some(e => e.title.toLowerCase().trim() === normalizedTitle) ||
            queue.some(q => q.title.toLowerCase().trim() === normalizedTitle && q.status !== 'failed');

        if (isDuplicate) {
            setError("Чат с таким адресом уже существует или находится в очереди.");
            setLoading(false);
            return;
        }
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

            const newEco: Ecosystem = {
                id: resultData.id || 0, // Server should return ID
                tg_chat_id: resultData.chatId,
                title: data.title,
                district: data.district,
                invite_link: resultData.link,
                member_count: 0,
                last_updated: new Date().toISOString(),
                created_at: new Date().toISOString(),
                status: 'не подключен'
            };

            setEcosystems([newEco, ...ecosystems]);
            setResult({ link: resultData.link, title: data.title });
            reset();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEcosystem = async (tgChatId: string, codes: string[]) => {
        if (!confirm(`Удалить экосистему и все связанные ссылки (${codes.length})?`)) return;

        try {
            const res = await fetch('/api/ecosystems', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tgChatId })
            });

            if (res.ok) {
                setEcosystems(prev => prev.filter(e => e.tg_chat_id !== tgChatId));
                // Optionally delete linked short links too, but the API presently only deletes the ecosystem.
                // The user might want to keep the short links but unlink them.
                // For now, just remove from state.
                setLinks(prev => prev.map(l => l.tg_chat_id === tgChatId ? { ...l, tg_chat_id: undefined } : l));
            }
        } catch (e) {
            alert('Ошибка при удалении');
        }
    };

    const handleUpdateEcosystem = async (tgChatId: string) => {
        if (!editingGroup) return;
        try {
            const res = await fetch('/api/ecosystems', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tgChatId,
                    title: editingGroup.title,
                    district: editingGroup.district
                })
            });
            if (res.ok) {
                setEcosystems(prev => prev.map(e => e.tg_chat_id === tgChatId ? {
                    ...e,
                    title: editingGroup.title,
                    district: editingGroup.district
                } : e));
                setEditingGroup(null);
            }
        } catch (e) {
            alert('Ошибка при обновлении');
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

    const handleToggleSelect = (id: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.size === links.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(links.map(l => l.id)));
        }
    };

    const handlePrintSelected = async () => {
        if (selectedIds.size === 0) {
            alert("Выберите QR-коды для печати.");
            return;
        }

        const selectedLinksToPrint = links.filter(link => selectedIds.has(link.id));

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Не удалось открыть окно печати. Разрешите всплывающие окна.");
            return;
        }

        // Chunk into pages of 24 (3 cols * 8 rows)
        const PAGESIZE = 24;
        const pages = [];
        for (let i = 0; i < selectedLinksToPrint.length; i += PAGESIZE) {
            pages.push(selectedLinksToPrint.slice(i, i + PAGESIZE));
        }

        let fullHtml = '';
        for (const pageItems of pages) {
            let stickersHtml = '';
            for (const link of pageItems) {
                const shortUrl = `${window.location.protocol}//${window.location.host}/s/${link.code}`;
                try {
                    const qrData = await QRCodeLib.toDataURL(shortUrl, {
                        width: 200,
                        margin: 2,
                        color: { dark: '#000000', light: '#ffffff' }
                    });

                    stickersHtml += `
                        <div class="sticker">
                            <div class="sticker-inner">
                                <div class="qr-box">
                                    <img src="${qrData}" alt="QR" />
                                </div>
                                <div class="content-box">
                                    <h1 class="main-title">
                                        <svg class="tg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                                        </svg>
                                        Чат нашего дома
                                    </h1>
                                    <ul class="features">
                                        <li>Без УК</li>
                                        <li>Барахолка района</li>
                                        <li>Скидки района</li>
                                    </ul>
                                    <div class="cta">
                                        <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                            <line x1="19" y1="12" x2="5" y2="12"></line>
                                            <polyline points="12 19 5 12 12 5"></polyline>
                                        </svg>
                                        <span>Сканируй QR-код</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } catch (err) {
                    console.error(`Failed to generate QR for ${link.code}`, err);
                }
            }
            fullHtml += `<div class="page">${stickersHtml}</div>`;
        }

        // Update statuses after printing
        for (const link of selectedLinksToPrint) {
            handleUpdateStatus(link.code, link.id, 'распечатан');
        }
        setSelectedIds(new Set());

        printWindow.document.write(`
            <html>
            <head>
                <title>Печать наклеек A4 (70x37mm)</title>
                <style>
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        background: white;
                        color: black;
                        -webkit-print-color-adjust: exact;
                    }
                    .page {
                        width: 210mm;
                        height: 297mm;
                        display: grid;
                        grid-template-columns: repeat(3, 70mm);
                        grid-template-rows: repeat(8, 37.125mm); /* 297/8 = 37.125 */
                        position: relative;
                        overflow: hidden;
                        page-break-after: always;
                    }
                    .sticker {
                        box-sizing: border-box;
                        width: 70mm;
                        height: 37mm;
                        padding: 4mm 2mm;
                        overflow: hidden;
                    }
                    .sticker-inner {
                        display: flex;
                        gap: 2mm;
                        height: 100%;
                        align-items: center;
                    }
                    .qr-box {
                        width: 25mm;
                        flex-shrink: 0;
                    }
                    .qr-box img {
                        width: 100%;
                        height: auto;
                        display: block;
                    }
                    .content-box {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        text-align: left;
                    }
                    .main-title {
                        margin: 0;
                        padding: 0;
                        font-size: 11.5px;
                        font-weight: 800;
                        line-height: 1;
                        text-transform: uppercase;
                        margin-bottom: 2mm;
                        white-space: nowrap;
                        display: flex;
                        align-items: center;
                        gap: 1.5mm;
                    }
                    .tg-icon {
                        width: 4mm;
                        height: 4mm;
                        flex-shrink: 0;
                    }
                    .features {
                        margin: 0;
                        padding: 0;
                        list-style: none;
                        font-size: 11px;
                        line-height: 1.2;
                        font-weight: 600;
                        color: #333;
                        margin-bottom: 2mm;
                    }
                    .cta {
                        display: flex;
                        align-items: center;
                        gap: 1.5mm;
                        font-size: 9px;
                        font-weight: 900;
                        text-transform: uppercase;
                        color: #000;
                        background: #f0f0f0;
                        padding: 1mm 2mm;
                        border-radius: 1mm;
                        width: fit-content;
                    }
                    .arrow {
                        width: 3.5mm;
                        height: 3.5mm;
                    }
                    .code-label {
                        margin-top: 1mm;
                        font-family: monospace;
                        font-size: 8px;
                        color: #666;
                        text-transform: uppercase;
                    }
                    @media print {
                        .no-print { display: none; }
                        .sticker { border: none; }
                    }
                </style>
            </head>
            <body>
                ${fullHtml}
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                            // window.close(); // Optional: user may want to re-print
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
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

    const handlePushScoutedToQueue = async () => {
        if (scoutedAddresses.length === 0) return;
        setBatchLoading(true);

        const normalizedExisting = new Set([
            ...links.map(l => l.reviewer_name?.toLowerCase().trim()),
            ...queue.filter(q => q.status !== 'failed').map(q => q.title.toLowerCase().trim())
        ]);

        const filteredScouted = scoutedAddresses.filter(a => {
            const title = `${a.street}, ${a.house}`.toLowerCase().trim();
            return !normalizedExisting.has(title);
        });

        if (filteredScouted.length === 0) {
            alert("Все выбранные адреса уже существуют в базе или очереди.");
            setBatchLoading(false);
            return;
        }

        if (filteredScouted.length < scoutedAddresses.length) {
            if (!confirm(`Будет добавлено ${filteredScouted.length} новых адресов. ${(scoutedAddresses.length - filteredScouted.length)} дубликатов будут пропущены. Продолжить?`)) {
                setBatchLoading(false);
                return;
            }
        }

        try {
            const now = new Date();
            const items = filteredScouted.map((addr, idx) => ({
                title: `${addr.street}, ${addr.house}`,
                district: addr.district || "",
                scheduled_at: new Date(now.getTime() + (idx + 1) * 60000).toISOString()
            }));

            const res = await fetch("/api/queue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ batch: items })
            });

            if (!res.ok) throw new Error("Failed to add to queue");

            alert(`Добавлено в очередь: ${items.length} адресов`);
            setScoutedAddresses([]);
            fetchQueue();
            setActiveTab('qr_batch'); // Switch to batch tab to see queue
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

    const handleUpdateGroup = async (code: string, id: number) => {
        if (!editingGroup) return;
        try {
            // 1. Update DB (local link data)
            const res = await fetch(`/api/links/${code}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tgChatId: editingGroup.tgChatId,
                    title: editingGroup.title,
                    district: editingGroup.district
                })
            });
            if (res.ok) {
                setLinks(prev => prev.map(l => l.id === id ? {
                    ...l,
                    tg_chat_id: editingGroup.tgChatId,
                    reviewer_name: editingGroup.title, // reviewer_name used as title
                    district: editingGroup.district
                } : l));

                // 2. Enqueue Telegram Update (if title changed and Telegram ID exists)
                // We check if tgChatId is present to know it's a real chat
                // Ideally we should check if title *actually* changed, but enforcing update is safer.
                if (editingGroup.tgChatId && editingGroup.title) {
                    await fetch('/api/topic-queue/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chatIds: [editingGroup.tgChatId],
                            action: 'update_title',
                            title: editingGroup.title
                        })
                    });
                    // We don't block UI on this, let it run in background
                }

                setEditingGroup(null);
            } else {
                alert("Ошибка сохранения");
            }
        } catch (e) {
            alert("Ошибка сохранения");
        }
    };

    const handleBulkUpdateStatus = async (newStatus: string) => {
        if (selectedIds.size === 0 || !newStatus) return;
        if (!confirm(`Изменить статус для ${selectedIds.size} элементов на "${newStatus}" ? `)) return;

        setLoading(true);
        const selectedLinks = links.filter(l => selectedIds.has(l.id));

        try {
            await Promise.all(selectedLinks.map(link =>
                fetch(`/api/links/${link.code}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                })
            ));

            setLinks(prev => prev.map(l =>
                selectedIds.has(l.id) ? { ...l, status: newStatus } : l
            ));

            alert('Статусы обновлены');
            setSelectedIds(new Set());
        } catch (e: any) {
            alert('Ошибка при массовом обновлении: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlinkEcosystem = async (tgChatId: string, codes: string[]) => {
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
            alert('Ошибка при отвязке экосистемы');
        }
    };

    const handleUnlinkLink = async (code: string, id: number) => {
        if (!confirm('Отвязать QR-код от группы? Он вернется в статус "Новая точка".')) return;
        try {
            const res = await fetch(`/api/links/${code}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tgChatId: null })
            });

            if (res.ok) {
                setLinks(prev => prev.map(l => l.id === id ? {
                    ...l,
                    tg_chat_id: undefined,
                    reviewer_name: undefined,
                    member_count: 0,
                    status: 'не подключен',
                    target_url: ''
                } : l));
            } else {
                alert('Ошибка при отвязке');
            }
        } catch (e) {
            alert('Ошибка сервера');
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
                if (result?.link.includes(`/ s / ${code}`)) {
                    setResult(null);
                }
            } else {
                alert('Ошибка при удалении');
            }
        } catch (e) {
            alert('Ошибка при удалении');
        }
    };

    const handleDeleteQueueItem = async (id: number) => {
        if (!confirm('Удалить этот чат из очереди?')) return;
        try {
            const res = await fetch('/api/queue', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                setQueue(prev => prev.filter(q => q.id !== id));
            }
        } catch (e) {
            alert('Ошибка при удалении');
        }
    };

    const handleProcessQueue = async () => {
        setBatchLoading(true);
        try {
            const res = await fetch("/api/queue/process?force=true");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to process");

            if (data.success) {
                alert(`Процесс запущен: создан чат ${data.chatId || ""}`);
            } else {
                alert(data.message || "Очередь пуста или нет задач к выполнению");
            }
            fetchQueue();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setBatchLoading(false);
        }
    };

    const handleUpdateQueueItem = async (item: QueueItem) => {
        try {
            const res = await fetch('/api/queue', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: item.id,
                    title: item.title,
                    district: item.district
                })
            });
            if (res.ok) {
                setQueue(prev => prev.map(q => q.id === item.id ? item : q));
                setEditingQueueItem(null);
            }
        } catch (e) {
            alert('Ошибка при обновлении');
        }
    };

    const handleUpdateScouted = (index: number, updates: any) => {
        setScoutedAddresses(prev => prev.map((a, i) => i === index ? { ...a, ...updates } : a));
    };

    const handleDeleteScouted = (index: number) => {
        setScoutedAddresses(prev => prev.filter((_, i) => i !== index));
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text || '');
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="w-full max-w-6xl space-y-12">
            <QueueConsole />
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
                            } `}
                    >
                        <QrCode className="w-4 h-4" />
                        QR Генератор
                    </button>
                    <button
                        onClick={() => setActiveTab('map')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'map'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            } `}
                    >
                        <MapIcon className="w-4 h-4" />
                        Разведчик
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'stats'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            } `}
                    >
                        <BarChart className="w-4 h-4" />
                        Статистика
                    </button>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
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
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white flex items-center gap-2 transition-all shadow-xl shadow-indigo-500/20 whitespace-nowrap"
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span className="hidden md:inline">Создать чат</span>
                    </button>
                </div>
            </div>

            {activeTab === 'ecosystem' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Create Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-xl font-semibold text-white">Создание экосистемы</h2>
                                            <p className="text-sm text-slate-400">Введите адрес дома для создания чата</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit(async (data) => {
                                        await onSubmit(data);
                                        setShowCreateModal(false);
                                    })} className="space-y-4">
                                        <div className="relative">
                                            <input
                                                {...register("title", { required: "Адрес дома обязателен" })}
                                                placeholder="Напр: ул. Пушкина, д. 10"
                                                className="w-full h-14 bg-slate-950 border border-white/10 rounded-2xl px-6 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 text-white"
                                            />
                                            {errors.title && (
                                                <p className="text-red-400 text-xs mt-1 ml-2">{errors.title.message}</p>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <input
                                                {...register("district")}
                                                placeholder="Район (напр: Хамовники)"
                                                className="w-full h-14 bg-slate-950 border border-white/10 rounded-2xl px-6 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 text-white"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-500/20 text-white"
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
                            </div>
                        </div>
                    )}

                    {/* Result Block */}
                    {result && (
                        <div className="p-8 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="p-4 bg-white rounded-2xl">
                                    <QRCode value={result.link} size={180} />
                                </div>
                                <div className="flex-1 text-left space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-semibold text-slate-400">Очередь создания ({queue.length})</h3>
                                            <button
                                                onClick={handleProcessQueue}
                                                disabled={batchLoading}
                                                className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs rounded-lg transition-all flex items-center gap-2"
                                            >
                                                {batchLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                                Обработать сейчас
                                            </button>
                                        </div>
                                        {countdown && (
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-4 bg-slate-900/50 rounded-lg px-2 py-1 w-fit">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                                Следующий чат ({nextTask?.title?.split(',')[0]}...): <span className="text-indigo-400 font-mono">{countdown}</span>
                                            </div>
                                        )}
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
                    {filteredEcosystems.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <HistoryIcon className="w-4 h-4" />
                                    <h3 className="text-sm font-medium uppercase tracking-wider">История созданных чатов</h3>
                                </div>
                                <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-tighter shrink-0">
                                    <button
                                        onClick={() => setStuckFilter('all')}
                                        className={`px-3 py-1.5 rounded-lg transition-all ${stuckFilter === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Все
                                    </button>
                                    <button
                                        onClick={() => setStuckFilter('stuck')}
                                        className={`px-3 py-1.5 rounded-lg transition-all ${stuckFilter === 'stuck' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Оклеены
                                    </button>
                                    <button
                                        onClick={() => setStuckFilter('not_stuck')}
                                        className={`px-3 py-1.5 rounded-lg transition-all ${stuckFilter === 'not_stuck' ? 'bg-orange-600/20 text-orange-400 border border-orange-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Не оклеены
                                    </button>
                                </div>

                                <div className="flex flex-1 items-center gap-2">
                                    <div className="relative flex-1 group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Поиск по коду/адресу..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500/50 text-white"
                                        />
                                    </div>

                                    <div className="relative w-48 group">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                        <input
                                            value={groupSearchTerm}
                                            onChange={(e) => setGroupSearchTerm(e.target.value)}
                                            placeholder="По Группе..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500/50 text-white"
                                        />
                                    </div>

                                    <div className="relative shrink-0">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value as any)}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider outline-none cursor-pointer hover:bg-white/10"
                                        >
                                            <option value="all" className="bg-slate-900">СТАТУС: ЛЮБОЙ</option>
                                            <option value="активен" className="bg-slate-900">АКТИВЕН</option>
                                            <option value="распечатан" className="bg-slate-900">РАСПЕЧАТАН</option>
                                            <option value="приклеен" className="bg-slate-900">ПРИКЛЕЕН</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {/* Ecosystems Table */}
                            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm shadow-2xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            <th className="p-5 w-14 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedGroupIds.size === paginatedEcosystems.length && paginatedEcosystems.length > 0}
                                                    onChange={handleSelectAllGroups}
                                                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 checked:bg-indigo-500 transition-colors cursor-pointer"
                                                />
                                            </th>
                                            <th className="p-5">Код / Экосистема</th>
                                            <th className="p-5">Статистика</th>
                                            <th className="p-5 text-right">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {paginatedEcosystems.map((item: any) => (
                                            <tr key={item.tg_chat_id} className={`group hover:bg-slate-800/30 transition-all ${selectedGroupIds.has(item.tg_chat_id) ? 'bg-indigo-500/5' : ''}`}>
                                                <td className="p-5 text-center align-top pt-6">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedGroupIds.has(item.tg_chat_id)}
                                                        onChange={() => handleToggleGroupSelect(item.tg_chat_id)}
                                                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 checked:bg-indigo-500 transition-colors cursor-pointer"
                                                    />
                                                </td>
                                                <td className="p-5 align-top">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2">
                                                            {item.codes.map((code: string) => (
                                                                <button
                                                                    key={code}
                                                                    onClick={() => copyToClipboard(`https://pevzner.ru/s/${code}`, `e-${code}`)}
                                                                    className="px-2 py-1 bg-slate-800 rounded-lg text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5 border border-transparent hover:border-slate-600"
                                                                >
                                                                    {code}
                                                                    {copiedId === `e-${code}` ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <ClipboardIcon className="w-3 h-3 opacity-50" />}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {editingGroup && editingGroup.tgChatId === item.tg_chat_id ? (
                                                            <div className="space-y-3 bg-slate-800 p-4 rounded-2xl border border-indigo-500/30 shadow-lg mt-2">
                                                                <input
                                                                    value={editingGroup.title}
                                                                    onChange={(e) => editingGroup && setEditingGroup({ ...editingGroup, title: e.target.value })}
                                                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none text-white focus:ring-1 focus:ring-indigo-500/50 placeholder:text-slate-600"
                                                                    placeholder="Название"
                                                                />
                                                                <input
                                                                    value={editingGroup.district}
                                                                    onChange={(e) => editingGroup && setEditingGroup({ ...editingGroup, district: e.target.value })}
                                                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none text-white focus:ring-1 focus:ring-indigo-500/50 placeholder:text-slate-600"
                                                                    placeholder="Район"
                                                                />
                                                                <div className="flex gap-2 pt-1">
                                                                    <button
                                                                        onClick={() => handleUpdateEcosystem(item.tg_chat_id)}
                                                                        className="flex-1 py-2 bg-indigo-600 text-xs font-bold rounded-xl text-white hover:bg-indigo-500 transition-colors shadow-md"
                                                                    >
                                                                        Сохранить
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingGroup(null)}
                                                                        className="py-2 px-4 bg-slate-700 text-xs font-bold rounded-xl text-slate-300 hover:bg-slate-600 transition-colors"
                                                                    >
                                                                        Отмена
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-1">
                                                                <div className="flex items-center gap-2 group/title">
                                                                    <h3 className="font-semibold text-base text-white">{item.title}</h3>
                                                                    <button
                                                                        onClick={() => setEditingGroup({
                                                                            tgChatId: item.tg_chat_id,
                                                                            title: item.title,
                                                                            district: item.district
                                                                        })}
                                                                        className="opacity-0 group-hover/title:opacity-100 p-1.5 hover:bg-slate-800 text-slate-500 hover:text-indigo-400 rounded-lg transition-all"
                                                                    >
                                                                        <Edit3 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                                                    <MapPin className="w-3.5 h-3.5" />
                                                                    {item.district || 'Район не указан'}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-5 align-top">
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex gap-6">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Клики</span>
                                                                <span className="text-base font-bold text-slate-200">{item.clicks_count}</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Люди</span>
                                                                <span className="text-base font-bold text-slate-200">{item.member_count}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${item.status === 'подключен'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                : 'bg-slate-800 text-slate-500 border-slate-700'
                                                                }`}>
                                                                {item.status || 'не подключен'}
                                                            </div>

                                                            {item.is_stuck && (
                                                                <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                                    ОКЛЕЕН
                                                                </div>
                                                            )}

                                                            <button
                                                                onClick={() => handleRefreshStats(item.codes[0], item.id)}
                                                                className={`p-1 hover:bg-slate-800 rounded-lg transition-all ml-auto ${refreshingId === item.id ? 'animate-spin text-indigo-400' : 'text-slate-600 hover:text-indigo-400'}`}
                                                                title="Обновить статистику"
                                                            >
                                                                <HistoryIcon className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5 align-top">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleToggleStuck(item.tg_chat_id, !!item.is_stuck)}
                                                            className={`p-2.5 rounded-xl transition-all border ${item.is_stuck
                                                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-sm'
                                                                : 'border-transparent hover:bg-slate-800 text-slate-400 hover:text-indigo-400'
                                                                }`}
                                                            title={item.is_stuck ? "Снять метку оклеен" : "Отметить оклеенным"}
                                                        >
                                                            <CheckCircle2 className={`w-5 h-5 ${item.is_stuck ? 'fill-indigo-500/20' : ''}`} />
                                                        </button>
                                                        <a
                                                            href={links.find(l => l.tg_chat_id === item.tg_chat_id)?.target_url}
                                                            target="_blank"
                                                            className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all border border-transparent"
                                                            title="Открыть в Telegram"
                                                        >
                                                            <ExternalLink className="w-5 h-5" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleDeleteEcosystem(item.tg_chat_id, item.codes)}
                                                            className="p-2.5 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-400 transition-all border border-transparent"
                                                            title="Удалить экосистему"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-2 pt-4 border-t border-white/5">
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                        Страница <span className="text-white">{currentPage}</span> из <span className="text-white">{totalPages}</span>
                                        <span className="ml-2 text-slate-600">({filteredEcosystems.length} всего)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : activeTab === 'map' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold">Карта-Разведчик</h2>
                                <p className="text-slate-500 text-sm">Найдите дома на карте и добавьте их в очередь создания чатов.</p>
                            </div>
                            {scoutedAddresses.length > 0 && (
                                <button
                                    onClick={handlePushScoutedToQueue}
                                    disabled={batchLoading}
                                    className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-white flex items-center gap-3 transition-all shadow-xl shadow-indigo-500/20"
                                >
                                    {batchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Добавить в очередь ({scoutedAddresses.length})
                                </button>
                            )}
                        </div>

                        <MapScout onAddressesFound={setScoutedAddresses} />

                        {scoutedAddresses.length > 0 && (
                            <div className="mt-8 space-y-4 text-left">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Предпросмотр адресов для очереди</h3>
                                    <button onClick={() => setScoutedAddresses([])} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase transition-all">Очистить список</button>
                                </div>
                                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {scoutedAddresses.map((addr, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 group transition-all hover:border-white/20">
                                            <div className="flex-1 w-full space-y-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold pl-1">Название / Адрес</span>
                                                    <input
                                                        value={addr.title}
                                                        onChange={(e) => handleUpdateScouted(idx, { title: e.target.value })}
                                                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500/50 text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-full md:w-64 space-y-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold pl-1">Район</span>
                                                    <input
                                                        value={addr.district || ""}
                                                        onChange={(e) => handleUpdateScouted(idx, { district: e.target.value })}
                                                        placeholder="Не указан"
                                                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500/50 text-white"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteScouted(idx)}
                                                className="p-3 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all self-end md:self-center"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'stats' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <StatisticsTab />
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
                                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-white"
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
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock className="w-4 h-4" />
                                            <h3 className="text-xs font-medium uppercase tracking-wider">Текущая очередь ({queue.filter(q => q.status === 'pending').length} ожидают)</h3>
                                        </div>
                                        {countdown && (
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-900/50 rounded-lg px-2 py-1 w-fit">
                                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                                Следующий ({nextTask?.title?.split(',')[0]}...): <span className="text-indigo-400 font-mono">{countdown}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleProcessQueue}
                                        disabled={batchLoading}
                                        className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] uppercase font-bold rounded-xl transition-all flex items-center gap-2"
                                    >
                                        {batchLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                        Обработать сейчас
                                    </button>
                                </div>

                                <div className="grid gap-2">
                                    {queue.slice(0, 10).map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group">
                                            {editingQueueItem?.id === item.id ? (
                                                <div className="flex-1 flex gap-2">
                                                    <input
                                                        className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-sm outline-none text-white"
                                                        value={editingQueueItem.title}
                                                        onChange={(e) => setEditingQueueItem({ ...editingQueueItem, title: e.target.value })}
                                                    />
                                                    <input
                                                        className="w-32 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-sm outline-none text-white"
                                                        value={editingQueueItem.district}
                                                        onChange={(e) => setEditingQueueItem({ ...editingQueueItem, district: e.target.value })}
                                                    />
                                                    <button onClick={() => handleUpdateQueueItem(editingQueueItem)} className="text-green-500 hover:text-green-400 p-1"><CheckSquare className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditingQueueItem(null)} className="text-slate-500 hover:text-slate-400 p-1"><X className="w-4 h-4" /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white">{item.title}</span>
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
                                                            {item.status}
                                                        </span>
                                                        {item.status === 'pending' && (
                                                            <div className="hidden group-hover:flex items-center gap-1">
                                                                <button onClick={() => setEditingQueueItem(item)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                                                                <button onClick={() => handleDeleteQueueItem(item.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500/50 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    {queue.length > 10 && (
                                        <div className="text-center text-[10px] text-slate-600 uppercase tracking-widest pt-2">
                                            И еще {queue.length - 10} чатов впереди...
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

                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={handleBatchGenerate}
                                disabled={batchLoading}
                                className="flex-1 h-16 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-50 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl text-lg"
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

                            {selectedIds.size > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="relative group">
                                        <select
                                            onChange={(e) => handleBulkUpdateStatus(e.target.value)}
                                            value=""
                                            className="h-16 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl text-sm border-none outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Сменить статус ({selectedIds.size})</option>
                                            <option value="не распечатан">не распечатан</option>
                                            <option value="распечатан">распечатан</option>
                                            <option value="не подключен">не подключен</option>
                                            <option value="подключен">подключен</option>
                                            <option value="архив">архив</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                            <Edit3 className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePrintSelected}
                                        className="h-16 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl text-lg"
                                    >
                                        <Printer className="w-6 h-6" />
                                        Печать
                                    </button>
                                </div>
                            )}
                        </div>

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

                            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-tighter shrink-0">
                                <button
                                    onClick={() => setStuckFilter('all')}
                                    className={`px-3 py-1.5 rounded-lg transition-all ${stuckFilter === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Все
                                </button>
                                <button
                                    onClick={() => setStuckFilter('stuck')}
                                    className={`px-3 py-1.5 rounded-lg transition-all ${stuckFilter === 'stuck' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Оклеены
                                </button>
                                <button
                                    onClick={() => setStuckFilter('not_stuck')}
                                    className={`px-3 py-1.5 rounded-lg transition-all ${stuckFilter === 'not_stuck' ? 'bg-orange-600/20 text-orange-400 border border-orange-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Не оклеены
                                </button>
                            </div>

                            <div className="flex flex-1 items-center gap-2 max-w-2xl ml-4">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Поиск по коду/адресу..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500/50 text-white"
                                    />
                                </div>

                                <div className="relative w-48 group">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        value={groupSearchTerm}
                                        onChange={(e) => setGroupSearchTerm(e.target.value)}
                                        placeholder="По Группе..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500/50 text-white"
                                    />
                                </div>

                                <div className="relative shrink-0">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as any)}
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider outline-none cursor-pointer hover:bg-white/10"
                                    >
                                        <option value="all" className="bg-slate-900">СТАТУС: ЛЮБОЙ</option>
                                        <option value="не распечатан" className="bg-slate-900">НЕ РАСПЕЧАТАН</option>
                                        <option value="распечатан" className="bg-slate-900">РАСПЕЧАТАН</option>
                                        <option value="не подключен" className="bg-slate-900">НЕ ПОДКЛЮЧЕН</option>
                                        <option value="подключен" className="bg-slate-900">ПОДКЛЮЧЕН</option>
                                        <option value="активен" className="bg-slate-900">АКТИВЕН</option>
                                        <option value="приклеен" className="bg-slate-900">ПРИКЛЕЕН</option>
                                        <option value="архив" className="bg-slate-900">АРХИВ</option>
                                    </select>
                                </div>
                            </div>

                            <div className="text-xs text-slate-500 uppercase tracking-widest ml-4">
                                Всего: {filteredAllLinks.length}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-slate-500">
                                        <th className="p-4 w-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.size === links.length && links.length > 0}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-indigo-500"
                                            />
                                        </th>
                                        <th className="p-4 font-semibold">Код</th>
                                        <th className="p-4 font-semibold">Группа / Привязка</th>
                                        <th className="p-4 font-semibold">Редирект</th>
                                        <th className="p-4 font-semibold text-right">Действие</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedLinks.map((link) => {
                                        const shortUrl = `${window.location.protocol}//${window.location.host}/s/${link.code}`;
                                        return (
                                            <tr key={link.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${selectedIds.has(link.id) ? 'bg-indigo-500/10' : ''}`}>
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(link.id)}
                                                        onChange={() => handleToggleSelect(link.id)}
                                                        className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-indigo-500"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <button
                                                            onClick={() => copyToClipboard(shortUrl, `s-${link.id}`)}
                                                            className="text-white font-mono font-bold text-sm bg-white/5 px-2 py-1 rounded hover:bg-white/10 transition-colors flex items-center gap-2 w-fit"
                                                        >
                                                            {link.code}
                                                            <ExternalLink className={`w-3 h-3 ${copiedId === `s-${link.id}` ? 'text-green-400' : 'text-slate-500'}`} />
                                                        </button>

                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                value={link.status || 'не распечатан'}
                                                                onChange={(e) => handleUpdateStatus(link.code, link.id, e.target.value)}
                                                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter border bg-transparent outline-none cursor-pointer transition-all ${link.status === 'подключен' ? 'border-green-500/20 text-green-500 bg-green-500/5' :
                                                                    link.status === 'не подключен' ? 'border-orange-500/20 text-orange-400 bg-orange-500/5' :
                                                                        link.status === 'распечатан' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' :
                                                                            link.status === 'архив' ? 'border-slate-500/20 text-slate-400 bg-slate-500/5' :
                                                                                'border-slate-500/20 text-slate-500 bg-slate-500/5'
                                                                    }`}
                                                            >
                                                                <option value="не распечатан" className="bg-slate-900">не распечатан</option>
                                                                <option value="распечатан" className="bg-slate-900">распечатан</option>
                                                                <option value="не подключен" className="bg-slate-900">не подключен</option>
                                                                <option value="подключен" className="bg-slate-900">подключен</option>
                                                                <option value="архив" className="bg-slate-900">архив</option>
                                                            </select>
                                                        </div>

                                                        <div className="flex gap-2 text-[8px] text-slate-600 uppercase">
                                                            <span>{link.clicks_count || 0} clks</span>
                                                            <span>{link.member_count || 0} subs</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1.5 text-left">
                                                        {editingGroup?.id === link.id ? (
                                                            <div className="space-y-2 p-3 bg-slate-900/50 rounded-xl border border-indigo-500/30">
                                                                <input
                                                                    placeholder="Chat ID (напр: -100...)"
                                                                    value={editingGroup?.tgChatId || ''}
                                                                    onChange={(e) => editingGroup && setEditingGroup({ ...editingGroup, tgChatId: e.target.value })}
                                                                    className="w-full bg-slate-950 border border-white/5 rounded px-2 py-1.5 text-[11px] outline-none text-white"
                                                                />
                                                                <input
                                                                    placeholder="Название группы"
                                                                    value={editingGroup?.title || ''}
                                                                    onChange={(e) => editingGroup && setEditingGroup({ ...editingGroup, title: e.target.value })}
                                                                    className="w-full bg-slate-950 border border-white/5 rounded px-2 py-1.5 text-[11px] outline-none text-white"
                                                                />
                                                                <input
                                                                    placeholder="Район"
                                                                    value={editingGroup?.district || ''}
                                                                    onChange={(e) => editingGroup && setEditingGroup({ ...editingGroup, district: e.target.value })}
                                                                    className="w-full bg-slate-950 border border-white/5 rounded px-2 py-1.5 text-[11px] outline-none text-white"
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => handleUpdateGroup(link.code, link.id)} className="flex-1 py-1 px-2 bg-indigo-600 text-white text-[10px] rounded font-bold">Save</button>
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
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <button
                                                                                onClick={() => setEditingGroup({ id: link.id, tgChatId: link.tg_chat_id || '', title: link.reviewer_name || '', district: link.district || '' })}
                                                                                className="text-[9px] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                                                                            >
                                                                                <Edit3 className="w-3 h-3" /> Ред.
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleUnlinkLink(link.code, link.id)}
                                                                                className="text-[9px] text-red-500/70 hover:text-red-500 transition-colors flex items-center gap-1"
                                                                                title="Отвязать группу"
                                                                            >
                                                                                <Link2Off className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
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
                                                    <div className="flex flex-col gap-2 text-left">
                                                        {editingTarget?.id === link.id ? (
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={editingTarget?.value || ''}
                                                                    onChange={(e) => editingTarget && setEditingTarget({ ...editingTarget, value: e.target.value })}
                                                                    className="flex-1 bg-slate-900 border border-indigo-500/50 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-white"
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

                        {/* Pagination Controls for QR Links */}
                        {totalQrPages > 1 && (
                            <div className="flex items-center justify-between px-2 pt-4 border-t border-white/5">
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                    Страница <span className="text-white">{currentPage}</span> из <span className="text-white">{totalQrPages}</span>
                                    <span className="ml-2 text-slate-600">({filteredAllLinks.length} всего)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalQrPages, prev + 1))}
                                        disabled={currentPage === totalQrPages}
                                        className="p-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Topic Action Modal - Moved to global scope */}
            {showTopicModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Управление топиками ({selectedGroupIds.size})</h2>
                            <button onClick={() => setShowTopicModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>

                        <div className="space-y-4 text-left">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase text-slate-500 pl-1">Выберите топик</label>
                                <select
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    value={topicActionData.topicName}
                                    onChange={(e) => setTopicActionData({ ...topicActionData, topicName: e.target.value })}
                                >
                                    <option value="📢 Новости">📢 Новости</option>
                                    <option value="🗣 Флудилка">🗣 Флудилка</option>
                                    <option value="🛒 БАРАХОЛКА">🛒 БАРАХОЛКА</option>
                                    <option value="🛠 Услуги">🛠 Услуги</option>
                                    <option value="‼️ ВЫБОР АДМИНА">‼️ ВЫБОР АДМИНА</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold uppercase text-slate-500 pl-1">Сообщение (необязательно)</label>
                                <textarea
                                    className="w-full h-32 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="Введите текст сообщения..."
                                    value={topicActionData.message}
                                    onChange={(e) => setTopicActionData({ ...topicActionData, message: e.target.value })}
                                />
                                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={topicActionData.pin}
                                        onChange={(e) => setTopicActionData({ ...topicActionData, pin: e.target.checked })}
                                        className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-indigo-500"
                                    />
                                    <span className="text-xs text-slate-400">Закрепить сообщение</span>
                                </label>
                            </div>

                            <div className="flex flex-col gap-1.5 pt-2">
                                <label className="text-[10px] font-bold uppercase text-slate-500 pl-1">Доступ к топику</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTopicActionData({ ...topicActionData, closedAction: topicActionData.closedAction === 'close' ? undefined : 'close' })}
                                        className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${topicActionData.closedAction === 'close' ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                    >
                                        Закрыть (Read-Only)
                                    </button>
                                    <button
                                        onClick={() => setTopicActionData({ ...topicActionData, closedAction: topicActionData.closedAction === 'open' ? undefined : 'open' })}
                                        className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${topicActionData.closedAction === 'open' ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                    >
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Actions Fixed Bar */}
            {selectedGroupIds.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-4 px-6 py-4 bg-slate-900/90 backdrop-blur border border-white/10 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-tighter">Выбрано групп</span>
                        <span className="text-lg font-black text-white">{selectedGroupIds.size}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10 mx-2" />
                    <button
                        onClick={() => setShowTopicModal(true)}
                        className="h-12 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Управление топиками
                    </button>
                    <button
                        onClick={() => setSelectedGroupIds(new Set())}
                        className="p-3 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
