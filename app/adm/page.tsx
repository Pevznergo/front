'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminPage() {
    const { data: session } = useSession();
    // In a real app, you'd check session?.user?.email === 'admin@email...' or a role.

    const [reviewUrl, setReviewUrl] = useState('');
    const [webhookUrl, setWebhookUrl] = useState(''); // Allow user to set output webhook if needed
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            // 1. First, create a short link for this review (to be used in the n8n flow)
            // The shortened link will point to: https://aporto.tech/?link={ReviewURL}
            const fullTargetUrl = `https://aporto.tech/?link=${encodeURIComponent(reviewUrl)}`;

            const shortenRes = await fetch('/api/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_url: fullTargetUrl })
            });
            const shortenData = await shortenRes.json();

            if (!shortenData.shortUrl) throw new Error("Failed to shorten link");

            setResult({
                status: 'Success',
                original: reviewUrl,
                shortLink: shortenData.shortUrl,
                message: "Ready for n8n processing"
            });

            // NOTE: In the requested flow, the USER triggers n8n, which THEN calls the shortener? 
            // OR the Admin page calls n8n? 
            // The prompt says: "ты сохраняешь... создаешь уникальную ссылку... shortening..."
            // It implies n8n does the scraping AND the shortening.
            // BUT since n8n might not talk to our internal DB easily without an API key, 
            // we expose the /api/shorten endpoint for n8n to call.

            // For now, let's just display the short link here as a utility, 
            // AND we can also technically call the n8n webhook if the user provided one.

            if (webhookUrl) {
                // Fire and forget to n8n
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        review_url: reviewUrl,
                        short_link: shortenData.shortUrl // We can just pass it if we made it, or let n8n make it.
                        // Let's assume n8n will handle scraping.
                    })
                });
                setResult((prev: any) => ({ ...prev, message: "Sent to n8n successfully!" }));
            }

        } catch (error) {
            console.error(error);
            setResult({ status: 'Error', message: 'Something went wrong.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] p-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Admin Console</h1>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Google Maps Review URL
                            </label>
                            <input
                                type="url"
                                required
                                value={reviewUrl}
                                onChange={(e) => setReviewUrl(e.target.value)}
                                placeholder="https://maps.app.goo.gl/..."
                                className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-[#007AFF] focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                N8N Webhook URL (Optional)
                            </label>
                            <input
                                type="url"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                placeholder="https://primary.n8n.cloud/webhook/..."
                                className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-[#007AFF] focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                            <p className="text-xs text-slate-400 mt-2">If provided, we will send the review data here.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !reviewUrl}
                            className="w-full bg-[#007AFF] hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <LinkIcon className="w-5 h-5" />}
                            Process Review
                        </button>
                    </form>

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-8 p-6 rounded-xl border ${result.status === 'Error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100'}`}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <span className={`font-bold uppercase text-xs tracking-wider px-2 py-1 rounded bg-white/50 ${result.status === 'Error' ? 'text-red-700' : 'text-green-700'}`}>
                                    {result.status}
                                </span>
                            </div>

                            {result.shortLink && (
                                <div className="space-y-2">
                                    <p className="text-sm text-slate-500 font-medium">Generated Short Link:</p>
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-green-200">
                                        <code className="text-[#007AFF] font-mono text-sm break-all">{result.shortLink}</code>
                                    </div>
                                    <p className="text-sm mt-4">{result.message}</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
