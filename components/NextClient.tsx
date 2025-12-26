"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Send, QrCode, Download, History, MessageSquare, ExternalLink, Trash2 } from "lucide-react";
import QRCode from "react-qr-code";
import QRCodeLib from "qrcode";

interface ChatHistoryItem {
    id: string;
    title: string;
    link: string;
    shortCode?: string;
    createdAt: string;
}

export default function NextClient() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<{ title: string }>();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ link: string; title: string } | null>(null);
    const [history, setHistory] = useState<ChatHistoryItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Load history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("tg_chat_history");
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const onSubmit = async (data: { title: string }) => {
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

            const newItem: ChatHistoryItem = {
                id: resultData.chatId || Math.random().toString(36).substr(2, 9),
                title: data.title,
                link: resultData.link,
                shortCode: resultData.shortCode,
                createdAt: new Date().toISOString(),
            };

            const updatedHistory = [newItem, ...history];
            setHistory(updatedHistory);
            localStorage.setItem("tg_chat_history", JSON.stringify(updatedHistory));

            setResult({ link: resultData.link, title: data.title });
            reset();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
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

    const handleDelete = async (item: ChatHistoryItem) => {
        if (!confirm(`Удалить чат "${item.title}"? Это также удалит короткую ссылку из базы данных.`)) return;

        try {
            // 1. Delete from DB if shortCode exists
            if (item.shortCode) {
                await fetch("/api/shorten", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: item.shortCode })
                });
            }

            // 2. Remove from local state and localStorage
            const updatedHistory = history.filter(h => h.id !== item.id);
            setHistory(updatedHistory);
            localStorage.setItem("tg_chat_history", JSON.stringify(updatedHistory));

            if (result?.link === item.link) {
                setResult(null);
            }
        } catch (err) {
            console.error("Failed to delete chat", err);
            alert("Ошибка при удалении");
        }
    };

    return (
        <div className="w-full max-w-4xl space-y-12">
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
            {history.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400 px-2">
                        <History className="w-4 h-4" />
                        <h3 className="text-sm font-medium uppercase tracking-wider">История созданных чатов</h3>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-4 font-semibold text-slate-300">Название (Адрес)</th>
                                    <th className="p-4 font-semibold text-slate-300">Дата</th>
                                    <th className="p-4 font-semibold text-slate-300 text-right">Действие</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item) => (
                                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-white">{item.title}</div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-400">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => downloadQR(item.link, item.title)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                                                    title="Скачать QR"
                                                >
                                                    <QrCode className="w-4 h-4" />
                                                </button>
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    className="p-2 hover:bg-white/10 rounded-lg text-indigo-400 transition-colors"
                                                    title="Открыть"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                                                    title="Удалить"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
    );
}
