'use client';

import { useState } from 'react';
import { Loader2, Link as LinkIcon, Copy, Check, Send, Mail, Eye, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShortLink {
    id: number;
    code: string;
    target_url: string;
    created_at: string;
    reviewer_name?: string;
    org_url?: string;
    contacts?: string;
    email_status?: 'pending' | 'queued' | 'sent' | 'opened' | 'replied';
}

interface AdminClientProps {
    initialLinks: ShortLink[];
}

export default function AdminClient({ initialLinks }: AdminClientProps) {
    const [links, setLinks] = useState<ShortLink[]>(initialLinks);
    const [reviewUrl, setReviewUrl] = useState('');
    const [reviewerName, setReviewerName] = useState('');
    const [orgUrl, setOrgUrl] = useState('');
    const [contacts, setContacts] = useState('');
    const [loading, setLoading] = useState(false);
    const [sendingId, setSendingId] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text || '');
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const generateEmail = (link: ShortLink) => {
        const reviewer = link.reviewer_name || 'the reviewer';
        const shortUrl = `https://aporto.tech/s/${link.code}`;

        return {
            subject: `1-star review from ${reviewer}`,
            body: `Hey,

I saw that recent 1-star review from ${reviewer} is dragging down your rating on Maps.

I scanned it with our Agent, and it actually violates Google's posting policies. We can help you file a formal appeal to get it deleted.

Check your removal chances for free here: ${shortUrl}
Best, aporto.tech`
        };
    };

    const handleSendEmail = async (id: number) => {
        if (!confirm("Send email to this contact?")) return;
        setSendingId(id);
        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send");

            // Update local state
            setLinks(prev => prev.map(l => l.id === id ? { ...l, email_status: 'queued' } : l));
            alert("Email queued!");
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSendingId(null);
        }
    };

    const formatDate = (d: string) => {
        try { return new Date(d).toLocaleDateString(); } catch (e) { return '-'; }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'replied': return <div className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded text-xs font-bold"><MessageSquare className="w-3 h-3" /> Replied</div>;
            case 'opened': return <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold"><Eye className="w-3 h-3" /> Opened</div>;
            case 'sent': return <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold"><Check className="w-3 h-3" /> Sent</div>;
            case 'queued': return <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-bold"><Loader2 className="w-3 h-3 animate-spin" /> Queued</div>;
            default: return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const fullTargetUrl = `https://aporto.tech/?link=${encodeURIComponent(reviewUrl)}`;

            const shortenRes = await fetch('/api/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target_url: fullTargetUrl,
                    reviewer_name: reviewerName,
                    org_url: orgUrl,
                    contacts: contacts
                })
            });
            const shortenData = await shortenRes.json();

            if (!shortenData.shortUrl) throw new Error("Failed to shorten link");

            const newLink: ShortLink = {
                id: Date.now(),
                code: shortenData.code,
                target_url: fullTargetUrl,
                created_at: new Date().toISOString(),
                reviewer_name: reviewerName,
                org_url: orgUrl,
                contacts: contacts,
                email_status: 'pending'
            };
            setLinks([newLink, ...links]);
            // Clear form
            setReviewUrl('');
            setReviewerName('');
            setOrgUrl('');
            setContacts('');

        } catch (error) {
            console.error(error);
            alert("Failed to create link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Google Maps Review URL *
                            </label>
                            <input
                                type="url"
                                required
                                value={reviewUrl}
                                onChange={(e) => setReviewUrl(e.target.value)}
                                placeholder="https://maps.app.goo.gl/..."
                                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#007AFF] focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Reviewer Name (e.g. Gabriel M.)
                            </label>
                            <input
                                type="text"
                                value={reviewerName}
                                onChange={(e) => setReviewerName(e.target.value)}
                                placeholder="Gabriel M."
                                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#007AFF] focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Organization Website
                            </label>
                            <input
                                type="url"
                                value={orgUrl}
                                onChange={(e) => setOrgUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#007AFF] focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Contacts
                            </label>
                            <input
                                type="text"
                                value={contacts}
                                onChange={(e) => setContacts(e.target.value)}
                                placeholder="Email: test@test.com, Phone: +123..."
                                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#007AFF] focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !reviewUrl}
                        className="w-full bg-[#007AFF] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 h-[50px]"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                        Generate Link & Save
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Review Database</h2>
                    <button onClick={() => window.location.reload()} className="text-slate-500 hover:text-slate-700 text-sm">Refresh Status</button>
                </div>
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold">
                            <tr>
                                <th className="p-4">Short Link</th>
                                <th className="p-4">Reviewer</th>
                                <th className="p-4">Org / Contact</th>
                                <th className="p-4">Actions</th>
                                <th className="p-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {links.map((link) => {
                                const shortUrl = `https://aporto.tech/s/${link.code}`;
                                return (
                                    <tr key={link.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 align-top">
                                            <div className='flex flex-col gap-2'>
                                                <button
                                                    onClick={() => copyToClipboard(shortUrl, `short-${link.id}`)}
                                                    className="flex items-center gap-2 group hover:text-[#007AFF] transition-colors font-mono font-bold"
                                                >
                                                    {link.code}
                                                    {copiedId === `short-${link.id}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(link.target_url, `target-${link.id}`)}
                                                    className="text-xs text-slate-400 hover:text-[#007AFF] flex items-center gap-1"
                                                >
                                                    Original Map Link
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="font-medium text-slate-900">{link.reviewer_name || '-'}</div>
                                        </td>
                                        <td className="p-4 align-top max-w-[250px]">
                                            <div className="flex flex-col gap-1">
                                                {link.org_url && <a href={link.org_url} target="_blank" className="text-[#007AFF] underline truncate">{link.org_url}</a>}
                                                <div className="text-xs text-slate-500 break-words">{link.contacts || '-'}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="flex flex-col gap-2 items-start">
                                                {getStatusIcon(link.email_status)}

                                                <div className="flex flex-col gap-1.5 w-full">
                                                    <button
                                                        onClick={() => {
                                                            const { subject } = generateEmail(link);
                                                            copyToClipboard(subject, `sub-${link.id}`);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-all text-xs font-medium w-full"
                                                    >
                                                        {copiedId === `sub-${link.id}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                                        Copy Subject
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            const { body } = generateEmail(link);
                                                            copyToClipboard(body, `body-${link.id}`);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-all text-xs font-medium w-full"
                                                    >
                                                        {copiedId === `body-${link.id}` ? <Check className="w-3 h-3 text-green-500" /> : <Mail className="w-3 h-3" />}
                                                        Copy Message
                                                    </button>

                                                    {link.email_status !== 'sent' && link.email_status !== 'opened' && link.email_status !== 'replied' && link.email_status !== 'queued' && (
                                                        <button
                                                            onClick={() => handleSendEmail(link.id)}
                                                            disabled={sendingId === link.id || !link.contacts}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#007AFF] hover:text-[#007AFF] rounded-lg transition-all text-xs font-semibold disabled:opacity-50 w-full mt-1"
                                                        >
                                                            {sendingId === link.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                                            Send via API
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top text-slate-400 text-xs whitespace-nowrap">
                                            {formatDate(link.created_at)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {links.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">
                                        No links generated yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
