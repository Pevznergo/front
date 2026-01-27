'use client';

import { useEffect, useState } from 'react';
import { Users, Crown, LogOut, UserPlus, Edit2, Copy, Check } from 'lucide-react';
import { getUserClanInfo, createClan, joinClan, updateClanName, leaveClan, initClanTables } from './actions';

export default function ClanPage() {
    const [clan, setClan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [newClanName, setNewClanName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [copied, setCopied] = useState(false);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        // Initialize tables on first load
        initClanTables().then(() => {
            loadClanData();
        });

        // Expand Telegram WebApp
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            window.Telegram.WebApp.expand();
        }
    }, []);

    const loadClanData = async () => {
        try {
            setLoading(true);
            setError('');

            if (typeof window === 'undefined' || !window.Telegram?.WebApp?.initData) {
                throw new Error('Откройте приложение через Telegram');
            }

            const tg = window.Telegram.WebApp;
            const user = tg.initDataUnsafe?.user;

            if (!user?.id) {
                throw new Error('Данные пользователя недоступны');
            }

            const data = await getUserClanInfo(user.id.toString());

            if (data?.hasClan) {
                setClan(data.clan);
                setUserRole(data.userRole);
                setEditedName(data.clan.name);
            } else {
                setClan(null);
            }
        } catch (err: any) {
            setError(err.message || 'Не удалось загрузить данные');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClan = async () => {
        if (!newClanName.trim()) return;

        try {
            const tg = window.Telegram?.WebApp;
            const user = tg?.initDataUnsafe?.user;

            if (!user?.id) throw new Error('Недоступны данные пользователя');

            const result = await createClan(user.id.toString(), newClanName.trim());

            if (result.success) {
                setShowCreate(false);
                setNewClanName('');
                await loadClanData();
            } else {
                alert(result.error || 'Ошибка при создании клана');
            }
        } catch (err: any) {
            alert(err.message || 'Не удалось создать клан');
        }
    };

    const handleJoinClan = async () => {
        if (!inviteCode.trim()) return;

        try {
            const tg = window.Telegram?.WebApp;
            const user = tg?.initDataUnsafe?.user;

            if (!user?.id) throw new Error('Недоступны данные пользователя');

            const result = await joinClan(user.id.toString(), inviteCode.trim());

            if (result.success) {
                setShowJoin(false);
                setInviteCode('');
                await loadClanData();
            } else {
                alert(result.error || 'Ошибка при вступлении');
            }
        } catch (err: any) {
            alert(err.message || 'Не удалось вступить в клан');
        }
    };

    const handleUpdateName = async () => {
        if (!editedName.trim()) return;

        try {
            const tg = window.Telegram?.WebApp;
            const user = tg?.initDataUnsafe?.user;

            if (!user?.id) throw new Error('Недоступны данные пользователя');

            const result = await updateClanName(user.id.toString(), editedName.trim());

            if (result.success) {
                setIsEditingName(false);
                await loadClanData();
            } else {
                alert(result.error || 'Ошибка при изменении названия');
            }
        } catch (err: any) {
            alert(err.message || 'Не удалось изменить название');
        }
    };

    const handleLeaveClan = async () => {
        if (!confirm('Вы действительно хотите покинуть клан?')) return;

        try {
            const tg = window.Telegram?.WebApp;
            const user = tg?.initDataUnsafe?.user;

            if (!user?.id) throw new Error('Недоступны данные пользователя');

            const result = await leaveClan(user.id.toString());

            if (result.success) {
                await loadClanData();
            } else {
                alert(result.error || 'Ошибка при выходе');
            }
        } catch (err: any) {
            alert(err.message || 'Не удалось выйти из клана');
        }
    };

    const copyInviteCode = () => {
        if (clan?.inviteCode) {
            navigator.clipboard.writeText(clan.inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getNextLevelRequirements = (level: number, totalMembers: number, proMembers: number) => {
        if (level >= 5) return 'МАКС. УРОВЕНЬ';
        if (level === 4) return `Нужно еще ${Math.max(0, 15 - totalMembers)} чел. и ${Math.max(0, 3 - proMembers)} Pro`;
        if (level === 3) return `Нужно еще ${Math.max(0, 2 - proMembers)} Pro`;
        if (level === 2) return `Нужно еще ${Math.max(0, 10 - totalMembers)} чел. и 1 Pro`;
        if (level === 1) return `Нужно еще ${Math.max(0, 2 - totalMembers)} чел.`;
        return '';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                    <p className="text-sm text-gray-400">Загрузка...</p>
                </div>
            </div>
        );
    }

    if (error || !clan) {
        return (
            <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center text-white p-4 text-center">
                <div>
                    <p className="mb-4 text-red-400 font-bold">{error || 'Что-то пошло не так'}</p>
                    <p className="text-gray-500 text-sm mb-4">Вы открываете это из Telegram?</p>
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => setShowCreate(true)}
                            className="w-full bg-blue-600 px-4 py-3 rounded-lg font-medium"
                        >
                            Создать клан
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowJoin(true)}
                            className="w-full bg-[#2c2c2e] px-4 py-3 rounded-lg font-medium"
                        >
                            Вступить в клан
                        </button>
                    </div>
                </div>

                {/* Create Clan Modal */}
                {showCreate && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-[#2c2c2e] rounded-xl p-6 w-full max-w-sm">
                            <h3 className="text-xl font-bold mb-4">Создать клан</h3>
                            <input
                                type="text"
                                value={newClanName}
                                onChange={(e) => setNewClanName(e.target.value)}
                                placeholder="Название клана"
                                className="w-full bg-[#1c1c1e] border border-gray-700 rounded-lg px-4 py-3 mb-4"
                                maxLength={20}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 bg-[#1c1c1e] px-4 py-3 rounded-lg"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreateClan}
                                    className="flex-1 bg-blue-600 px-4 py-3 rounded-lg font-medium"
                                >
                                    Создать
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Join Clan Modal */}
                {showJoin && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-[#2c2c2e] rounded-xl p-6 w-full max-w-sm">
                            <h3 className="text-xl font-bold mb-4">Вступить в клан</h3>
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Код приглашения"
                                className="w-full bg-[#1c1c1e] border border-gray-700 rounded-lg px-4 py-3 mb-4 uppercase"
                                maxLength={6}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowJoin(false)}
                                    className="flex-1 bg-[#1c1c1e] px-4 py-3 rounded-lg"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="button"
                                    onClick={handleJoinClan}
                                    className="flex-1 bg-blue-600 px-4 py-3 rounded-lg font-medium"
                                >
                                    Вступить
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1c1c1e] text-white p-4 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Crown className="w-8 h-8 text-yellow-400" />
                        {isEditingName ? (
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onBlur={handleUpdateName}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                                className="bg-white/20 border-0 text-xl font-bold rounded px-2 py-1"
                                autoFocus
                            />
                        ) : (
                            <h1 className="text-2xl font-bold">{clan.name}</h1>
                        )}
                        {(userRole === 'owner' || userRole === 'admin') && !isEditingName && (
                            <button type="button" onClick={() => setIsEditingName(true)}>
                                <Edit2 className="w-4 h-4 opacity-70" />
                            </button>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">LVL {clan.level}</div>
                        <div className="text-xs text-white/70">{userRole === 'owner' ? 'Владелец' : userRole === 'admin' ? 'Админ' : 'Участник'}</div>
                    </div>
                </div>

                {/* Progress */}
                <div className="bg-white/10 rounded-full h-2 overflow-hidden mb-2">
                    <div
                        className="bg-white h-full transition-all"
                        style={{ width: `${(clan.level / 5) * 100}%` }}
                    />
                </div>
                <div className="text-xs text-white/70">
                    {getNextLevelRequirements(clan.level, clan.totalMembers, clan.proMembers)}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#2c2c2e] rounded-xl p-4">
                    <Users className="w-5 h-5 mb-2 text-blue-400" />
                    <div className="text-2xl font-bold">{clan.totalMembers}</div>
                    <div className="text-xs text-gray-400">Участников</div>
                </div>
                <div className="bg-[#2c2c2e] rounded-xl p-4">
                    <Crown className="w-5 h-5 mb-2 text-yellow-400" />
                    <div className="text-2xl font-bold">{clan.proMembers}</div>
                    <div className="text-xs text-gray-400">Pro участников</div>
                </div>
            </div>

            {/* Invite Code */}
            <div className="bg-[#2c2c2e] rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs text-gray-400 mb-1">Код приглашения</div>
                        <div className="text-2xl font-mono font-bold tracking-wider">{clan.inviteCode}</div>
                    </div>
                    <button
                        type="button"
                        onClick={copyInviteCode}
                        className="bg-blue-600 p-3 rounded-lg"
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
                {userRole !== 'owner' && (
                    <button
                        type="button"
                        onClick={handleLeaveClan}
                        className="w-full bg-red-600/20 text-red-400 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-5 h-5" />
                        Покинуть клан
                    </button>
                )}
            </div>
        </div>
    );
}

declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initData: string;
                initDataUnsafe: {
                    user?: { id: number; first_name: string; username?: string };
                    start_param?: string;
                };
                expand: () => void;
                switchInlineQuery: (query: string, types?: string[]) => void;
                platform?: string;
            };
        };
    }
}
