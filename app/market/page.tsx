'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, MessageCircle, MapPin, Search, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface MarketAd {
    id: number;
    chat_id: string;
    content: string;
    sender_username: string | null;
    sender_id: string | null;
    district: string | null;
    created_at: string;
}

export default function MarketPage() {
    const [ads, setAds] = useState<MarketAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("All");

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/market/ads');
            const data = await res.json();
            if (data.success) {
                setAds(data.ads);
            }
        } catch (error) {
            console.error("Failed to fetch ads", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/market/sync');
            const data = await res.json();
            if (data.success) {
                alert(`Успешно синхронизировано! Найдено ${data.synced_count} новых объявлений.`);
                fetchAds();
            }
        } catch (error) {
            console.error("Failed to sync", error);
            alert("Ошибка при синхронизации");
        } finally {
            setSyncing(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const districts = ["All", ...Array.from(new Set(ads.map(ad => ad.district).filter(Boolean))) as string[]];

    const filteredAds = ads.filter(ad => {
        const matchesSearch = ad.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDistrict = selectedDistrict === "All" || ad.district === selectedDistrict;
        return matchesSearch && matchesDistrict;
    });

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 md:ml-72">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-serif text-slate-900">Барахолка района</h1>
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Обновить
                    </button>
                </div>
            </header>

            <main className="pt-32 pb-20 px-6 md:ml-72">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input
                                type="text"
                                placeholder="Поиск по объявлениям..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 bg-white border border-slate-100 rounded-2xl pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-slate-50 transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {districts.map(district => (
                                <button
                                    key={district}
                                    onClick={() => setSelectedDistrict(district)}
                                    className={`px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-medium transition-all ${selectedDistrict === district
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'bg-white border border-slate-100 text-slate-500 hover:border-slate-200'
                                        }`}
                                >
                                    {district}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                            <Loader2 className="w-10 h-10 animate-spin" />
                            <p>Загрузка объявлений района...</p>
                        </div>
                    ) : filteredAds.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAds.map((ad) => (
                                <div key={ad.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            <MapPin className="w-3 h-3" />
                                            {ad.district || "Район не указан"}
                                        </div>
                                        <div className="text-[10px] text-slate-300">
                                            {new Date(ad.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <p className="text-slate-700 text-sm leading-relaxed mb-6 flex-1 whitespace-pre-wrap">
                                        {ad.content}
                                    </p>

                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                                <MessageCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 mb-0.5">Связь</div>
                                                <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                    {ad.sender_username ? `@${ad.sender_username}` : `UID: ${ad.sender_id?.slice(0, 8)}`}
                                                </div>
                                            </div>
                                        </div>
                                        {ad.sender_username && (
                                            <a
                                                href={`https://t.me/${ad.sender_username}`}
                                                target="_blank"
                                                className="p-2 hover:bg-slate-50 rounded-full text-indigo-400 transition-colors"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-100 rounded-[2rem] p-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <Search className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">Объявлений пока нет</h3>
                                <p className="text-slate-400 max-w-sm mx-auto mt-2">
                                    Попробуйте сменить район или нажать кнопку "Обновить", чтобы подтянуть новые данные из Telegram.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
