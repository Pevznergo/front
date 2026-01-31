"use client";

import QRCode from 'qrcode';
import {
    ArrowRight,
    Check,
    Copy,
    Crown,
    Loader2,
    Pencil,
    Plus,
    Share2,
    Shield,
    Star,
    Zap,
    QrCode,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
    createClan,
    fetchClanData,
    joinClan,
    updateClanName,
} from "./actions";
import { trackEvent, identifyUser } from "@/lib/mixpanel";

// Levels Config (Frontend Display)
const LEVELS = [
    {
        level: 1,
        benefits: [
            { text: "15 бесплатных запросов / неделю", icon: "⚡" },
            { text: "Доступ к базовым моделям", icon: "🤖" },
            { text: "7 цветов для названия клана", icon: "🎨" },
        ],
    },
    {
        level: 2,
        benefits: [
            { text: "30 бесплатных запросов / неделю", icon: "⚡" },
            { text: "Приоритетная очередь", icon: "🚀" },
            { text: "7 цветовых схем для ссылок", icon: "🔗" },
        ],
    },
    {
        level: 3,
        benefits: [
            { text: "50 бесплатных запросов / неделю", icon: "⚡" },
            { text: "3 генерации изображений", icon: "🎨" },
            { text: "Авто-перевод сообщений", icon: "🌐" },
        ],
    },
    {
        level: 5,
        benefits: [
            { text: "Безлимит GPT-5 Nano", icon: "♾️" },
            { text: "Безлимит Gemini Flash", icon: "♾️" },
            { text: "10 генераций изображений", icon: "🎨" },
        ],
    },
];

type ClanMember = {
    id: string;
    name: string;
    role: string;
    isPro: boolean;
};

type ClanData = {
    id: string;
    name: string;
    level: number;
    membersCount: number;
    proMembersCount: number;
    nextLevel: number;
    progress: number;
    nextLevelRequirements: string;
    inviteCode: string;
    isOwner: boolean;
    membersList: ClanMember[];
};

export default function ClanPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [clan, setClan] = useState<ClanData | null>(null);
    const [inClan, setInClan] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState<"overview" | "members">(
        "overview"
    );
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [copied, setCopied] = useState(false);

    // QR State
    const [showQr, setShowQr] = useState(false);
    const [qrSrc, setQrSrc] = useState("");

    // Auth State
    const [initData, setInitData] = useState("");

    // Creation / Join State
    const [createName, setCreateName] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const initTelegram = async () => {
            if (typeof window === 'undefined') return;

            // Wait strictly for SDK
            let attempts = 0;
            while (!window.Telegram?.WebApp && attempts < 10) {
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }

            const tg = window.Telegram?.WebApp;
            if (tg) {
                tg.ready();
                tg.expand();
                try { tg.setHeaderColor('#1c1c1e'); } catch (e) { }

                const data = tg.initData || "";
                setInitData(data);

                load(data);
            } else {
                // Fallback for browser testing (if hash present)
                // or just fail gently
                if (window.location.hash.includes('tgWebAppData')) {
                    // try parse hash
                }
                setLoading(false);
                setError("Telegram SDK not found");
            }
        }

        initTelegram();
    }, []);

    async function load(data: string) {
        if (!data) {
            setLoading(false);
            return;
        }
        try {
            const res = await fetchClanData(data);

            // Identify User
            if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
                const user = window.Telegram.WebApp.initDataUnsafe.user;
                identifyUser(user.id.toString(), {
                    name: user.first_name,
                    username: user.username,
                    language_code: 'ru', // Telegram WebApp doesn't always give lang, but we can assume or get it from elsewhere
                });
                trackEvent('Page View', { page: 'Clan Page' });
            }

            if (res.error) {
                setError(res.error);
            } else if (res.inClan && res.clan) {
                setInClan(true);
                setClan(res.clan as ClanData);
                setEditedName(res.clan.name);
            } else {
                setInClan(false);
            }
        } catch (err) {
            console.error(err);
            setError("Не удалось загрузить данные клана.");
        } finally {
            setLoading(false);
        }
    }

    const handleCopy = () => {
        if (!clan) {
            return;
        }
        navigator.clipboard.writeText(
            `https://t.me/aporto_bot?start=clan_${clan.inviteCode}`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        trackEvent('Clan Link Copied', { clan_id: clan.id });
    };

    const handleShowQr = async () => {
        if (!clan) return;
        trackEvent('Clan QR Opened', { clan_id: clan.id });
        const link = `https://t.me/aporto_bot?start=clan_${clan.inviteCode}`;
        try {
            const url = await QRCode.toDataURL(link, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
            setQrSrc(url);
            setShowQr(true);
        } catch (e) {
            console.error(e);
        }
    };

    const handleShare = () => {
        if (!clan) {
            return;
        }
        trackEvent('Clan Shared', { clan_id: clan.id });
        const text = "Вступай в мой клан!";
        const url = `https://t.me/share/url?url=https://t.me/aporto_bot?start=clan_${clan.inviteCode}&text=${encodeURIComponent(text)}`;

        if (window.Telegram?.WebApp?.openTelegramLink) {
            window.Telegram.WebApp.openTelegramLink(url);
        } else {
            window.open(url, "_blank");
        }
    };

    const saveName = async () => {
        if (!clan || !editedName.trim()) {
            return;
        }
        const oldName = clan.name;
        setClan((prev) => (prev ? { ...prev, name: editedName } : null));
        setIsEditing(false);

        const res = await updateClanName(initData, editedName);

        if (!res.success) {
            setClan((prev) => (prev ? { ...prev, name: oldName } : null));
            console.error(`Failed to update name: ${res.error || "Unknown error"}`);
        }
    };

    const handleCreateClan = async () => {
        if (!createName.trim()) {
            return;
        }
        setActionLoading(true);
        const res = await createClan(initData, createName);
        setActionLoading(false);

        if (res.success) {
            trackEvent('Clan Created', { name: createName });
            window.location.reload();
        } else {
            console.error(`Failed: ${res.error}`);
        }
    };

    const handleJoinClan = async () => {
        if (!joinCode.trim()) {
            return;
        }
        setActionLoading(true);
        const res = await joinClan(initData, joinCode);
        setActionLoading(false);

        if (res.success) {
            window.location.reload();
        } else {
            console.error(`Failed: ${res.error}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // --- No Clan View ---
    if (!inClan && !error) {
        return (
            <div className="min-h-screen bg-[#1c1c1e] text-white font-sans overflow-x-hidden p-6 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                    <Shield className="w-8 h-8 text-blue-400" />
                </div>

                <h1 className="text-2xl font-bold mb-2 text-center">
                    Присоединяйтесь к битве
                </h1>
                <p className="text-gray-400 text-center mb-10 max-w-xs text-sm">
                    Создайте клан, чтобы получать бонусы, или вступите по коду
                    приглашения.
                </p>

                {/* Create Section */}
                <div className="w-full max-w-sm space-y-3 mb-8">
                    <input
                        className="w-full bg-[#2c2c2e] border border-[#3a3a3c] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                        onChange={(e) => setCreateName(e.target.value)}
                        placeholder="Название клана"
                        type="text"
                        value={createName}
                    />
                    <button
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={actionLoading || !createName.trim()}
                        onClick={handleCreateClan}
                        type="button"
                    >
                        {actionLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                        Создать клан
                    </button>
                </div>

                <div className="flex items-center gap-4 w-full max-w-sm mb-8">
                    <div className="h-[1px] bg-[#2c2c2e] flex-1" />
                    <span className="text-gray-500 text-xs uppercase font-medium">
                        ИЛИ
                    </span>
                    <div className="h-[1px] bg-[#2c2c2e] flex-1" />
                </div>

                {/* Join Section */}
                <div className="w-full max-w-sm space-y-3">
                    <div className="relative">
                        <input
                            className="w-full bg-[#2c2c2e] border border-[#3a3a3c] rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors"
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="Код приглашения (например: CLAN-XYZ)"
                            style={{ textTransform: "uppercase" }}
                            type="text"
                            value={joinCode}
                        />
                    </div>
                    <button
                        className="w-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                        disabled={actionLoading || !joinCode.trim()}
                        onClick={handleJoinClan}
                        type="button"
                    >
                        {actionLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <ArrowRight className="w-5 h-5" />
                        )}
                        Вступить по коду
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500">
                        Получили ссылку? <br /> Откройте ее в Telegram для автоматического
                        вступления.
                    </p>
                </div>
            </div>
        );
    }

    if (error || !clan) {
        return (
            <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center text-white p-4 text-center">
                <div>
                    <p className="mb-4 text-red-400 font-bold">
                        {error || "Что-то пошло не так"}
                    </p>
                    <div className="text-xs text-gray-500 mb-4 bg-black/20 p-2 rounded text-left overflow-auto max-w-[300px] break-all">
                        <p>
                            URL:{" "}
                            {typeof window !== "undefined" ? window.location.href : "N/A"}
                        </p>
                        <p>
                            Debug Init: {initData.substring(0, 20)}...
                        </p>
                    </div>
                    <button
                        className="bg-[#2c2c2e] px-4 py-2 rounded-lg text-sm"
                        onClick={() => window.location.reload()}
                        type="button"
                    >
                        Повторить
                    </button>
                </div>
            </div>
        );
    }

    // --- Clan View ---
    return (
        <div className="min-h-screen bg-[#1c1c1e] text-white font-sans overflow-x-hidden selection:bg-blue-500/30">
            {/* Header */}
            <div className="flex flex-col items-center pt-10 pb-6 px-4">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-16 h-16">
                        <Zap
                            className="w-16 h-16 text-white rotate-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                            fill="currentColor"
                            strokeWidth={1.5}
                        />
                    </div>
                </div>

                {/* Title / Edit */}
                <div className="flex items-center justify-center gap-2 mb-2 w-full max-w-sm">
                    {isEditing ? (
                        <div className="flex items-center gap-2 w-full animate-in fade-in zoom-in-95 bg-[#2c2c2e] rounded-lg p-1 ring-2 ring-blue-500">
                            <input
                                autoFocus
                                className="bg-transparent border-none outline-none text-xl font-bold text-center w-full px-2"
                                onChange={(e) => setEditedName(e.target.value)}
                                type="text"
                                value={editedName}
                            />
                            <button
                                className="p-2 bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                                onClick={saveName}
                                type="button"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-xl font-bold text-center leading-tight tracking-tight">
                                {clan.name}
                            </h1>
                            {clan.isOwner && (
                                <button
                                    className="p-1.5 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10"
                                    onClick={() => setIsEditing(true)}
                                    type="button"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </>
                    )}
                </div>

                <p className="text-gray-400 text-sm text-center max-w-xs mx-auto mb-8 leading-relaxed">
                    Участники клана повышают уровень группы и открывают дополнительные
                    возможности.
                </p>

                {/* Level Stats Bar */}
                <div className="w-full max-w-sm">
                    <div className="flex justify-between text-xs text-blue-300 font-medium mb-2 px-1">
                        <span>Уровень {clan.level}</span>
                        <span>Уровень {clan.nextLevel}</span>
                    </div>

                    {/* Progress Track */}
                    <div className="h-[6px] bg-[#2c2c2e] rounded-full overflow-hidden w-full relative">
                        {/* Active Progress */}
                        <div
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                            style={{ width: `${clan.progress}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center mt-2 text-[10px] text-gray-500 px-1">
                        <div className="flex gap-3">
                            <span>{clan.membersCount} Участников</span>
                            <span>{clan.proMembersCount} Pro</span>
                        </div>
                        <span>{clan.nextLevelRequirements}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-6 border-b border-[#2c2c2e] max-w-sm mx-auto">
                <button
                    className={cn(
                        "pb-3 px-6 text-sm font-medium transition-colors relative",
                        activeTab === "overview"
                            ? "text-white"
                            : "text-gray-500 hover:text-gray-300"
                    )}
                    onClick={() => setActiveTab("overview")}
                    type="button"
                >
                    Обзор
                    {activeTab === "overview" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
                    )}
                </button>
                <button
                    className={cn(
                        "pb-3 px-6 text-sm font-medium transition-colors relative",
                        activeTab === "members"
                            ? "text-white"
                            : "text-gray-500 hover:text-gray-300"
                    )}
                    onClick={() => setActiveTab("members")}
                    type="button"
                >
                    Участники
                    {activeTab === "members" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-48 max-w-sm mx-auto">
                {activeTab === "overview" && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                        {LEVELS.map((lvl) => (
                            <div
                                className={cn(
                                    "transition-opacity duration-300",
                                    clan.level >= lvl.level
                                        ? "opacity-100"
                                        : "opacity-50 grayscale-[0.5]"
                                )}
                                key={lvl.level}
                            >
                                {/* Pill Header */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#2c2c2e]" />
                                    <div className="px-5 py-1.5 rounded-full bg-gradient-to-r from-[#7059e3] to-[#9c71e8] text-white text-xs font-bold shadow-lg shadow-purple-900/40">
                                        Доступно на уровне {lvl.level}:
                                    </div>
                                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#2c2c2e]" />
                                </div>

                                {/* Benefits Items */}
                                <div className="space-y-4 px-2">
                                    {lvl.benefits.map((benefit) => (
                                        <div
                                            className="flex items-start gap-4"
                                            key={`${lvl.level}-${benefit.text}`}
                                        >
                                            <div className="w-6 h-6 rounded-full border border-blue-400/30 flex items-center justify-center bg-blue-500/10 shrink-0">
                                                <span className="text-xs">{benefit.icon}</span>
                                            </div>
                                            <div className="text-sm font-medium leading-tight pt-1">
                                                {benefit.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "members" && (
                    <div className="space-y-3 animate-in slide-in-from-right-4 fade-in duration-300">
                        {clan.membersList.map((member) => (
                            <div
                                className="flex items-center justify-between bg-[#2c2c2e]/50 p-3 rounded-xl border border-[#3a3a3c] mb-2"
                                key={member.id}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-sm font-bold">
                                        {member.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold flex items-center gap-1.5">
                                            {member.name}
                                            {member.role === "owner" && (
                                                <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                                            {member.role}
                                        </div>
                                    </div>
                                </div>
                                {member.isPro && (
                                    <div className="bg-purple-500/20 px-2 py-1 rounded text-purple-300 text-[10px] font-bold flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-purple-300" />
                                        PRO
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer / Invite */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1c1c1e] border-t border-[#2c2c2e]/50 backdrop-blur-xl z-10 pb-12">
                <div className="max-w-md mx-auto space-y-3">
                    <div className="bg-[#2c2c2e] p-1 rounded-xl flex items-center gap-2 pr-2">
                        <div className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-300 truncate font-mono outline-none">
                            t.me/aporto_bot?start=clan_{clan.inviteCode}
                        </div>
                        {/* Copy Button */}
                        <button
                            className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors shadow-lg shadow-blue-500/20 active:scale-95"
                            onClick={handleCopy}
                            type="button"
                        >
                            {copied ? (
                                <Check className="w-5 h-5 text-white" />
                            ) : (
                                <Copy className="w-5 h-5 text-white" />
                            )}
                        </button>
                        {/* QR Button */}
                        <button
                            className="w-10 h-10 bg-purple-500 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors shadow-lg shadow-purple-500/20 active:scale-95"
                            onClick={handleShowQr}
                            type="button"
                        >
                            <QrCode className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <button
                        className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(59,130,246,0.3)] active:scale-[0.98]"
                        onClick={handleShare}
                        type="button"
                    >
                        <Share2 className="w-5 h-5" />
                        Поделиться
                    </button>
                </div>
            </div>

            {/* QR Code Modal */}
            {showQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1c1c1e] w-full max-w-sm rounded-2xl p-6 relative border border-[#2c2c2e] shadow-2xl">
                        <button
                            onClick={() => setShowQr(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-[#2c2c2e] rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center space-y-4">
                            <h3 className="text-xl font-bold text-white mb-2">QR-код Клана</h3>
                            <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={qrSrc} alt="Clan QR" className="w-48 h-48" />
                            </div>
                            <p className="text-sm text-gray-400">
                                Отсканируйте код камерой телефона <br /> для быстрого вступления
                            </p>
                            <p className="font-mono text-blue-400 bg-blue-500/10 py-2 rounded-lg text-sm select-all">
                                {clan.inviteCode}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Global declaration for Telegram WebApp
declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initData: string;
                initDataUnsafe: {
                    user?: { id: number; first_name: string; username?: string };
                    start_param?: string;
                };
                ready: () => void;
                expand: () => void;
                setHeaderColor: (color: string) => void;
                switchInlineQuery: (query: string, types?: string[]) => void;
                openTelegramLink: (url: string) => void;
                platform?: string;
            };
        };
    }
}
