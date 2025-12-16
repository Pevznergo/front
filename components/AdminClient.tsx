'use client';

import { useState } from 'react';
import { Loader2, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShortLink {
    id: number;
    code: string;
    target_url: string;
    created_at: string;
    reviewer_name?: string;
    org_url?: string;
    contacts?: string;
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
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text || '');
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
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
                contacts: contacts
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

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Review Database</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold">
                            <tr>
                                <th className="p-4">Short Link</th>
                                <th className="p-4">Reviewer</th>
                                <th className="p-4">Organization</th>
                                <th className="p-4">Contacts</th>
                                <th className="p-4">Original URL</th>
                                <th className="p-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {links.map((link) => {
                                const shortUrl = `https://aporto.tech/s/${link.code}`;
                                return (
                                    <tr key={link.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <button
                                                onClick={() => copyToClipboard(shortUrl, `short-${link.id}`)}
                                                className="flex items-center gap-2 group hover:text-[#007AFF] transition-colors font-mono font-bold"
                                            >
                                                {link.code}
                                                {copiedId === `short-${link.id}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                            </button>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <button
                                                onClick={() => copyToClipboard(link.reviewer_name || '', `name-${link.id}`)}
                                                className="flex items-center gap-2 group hover:text-[#007AFF] transition-colors"
                                            >
                                                {link.reviewer_name || '-'}
                                                {link.reviewer_name && (copiedId === `name-${link.id}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />)}
                                            </button>
                                        </td>
                                        <td className="p-4 max-w-[200px] truncate">
                                            <button
                                                onClick={() => copyToClipboard(link.org_url || '', `org-${link.id}`)}
                                                className="flex items-center gap-2 group hover:text-[#007AFF] transition-colors w-full"
                                            >
                                                <span className="truncate">{link.org_url || '-'}</span>
                                                {link.org_url && (copiedId === `org-${link.id}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />)}
                                            </button>
                                        </td>
                                        <td className="p-4 max-w-[200px] truncate">
                                            <button
                                                onClick={() => copyToClipboard(link.contacts || '', `contact-${link.id}`)}
                                                className="flex items-center gap-2 group hover:text-[#007AFF] transition-colors w-full"
                                            >
                                                <span className="truncate">{link.contacts || '-'}</span>
                                                {link.contacts && (copiedId === `contact-${link.id}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />)}
                                            </button>
                                        </td>
                                        <td className="p-4 max-w-[150px] truncate">
                                            <button
                                                onClick={() => copyToClipboard(link.target_url, `target-${link.id}`)}
                                                className="flex items-center gap-2 group hover:text-[#007AFF] transition-colors w-full"
                                            >
                                                <span className="truncate">Map Link</span>
                                                {copiedId === `target-${link.id}` ? <Check className="w-4 h-4 text-green-500 shrink-0" /> : <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />}
                                            </button>
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-slate-400 text-xs">
                                            {new Date(link.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })}
                            {links.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-400">
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
