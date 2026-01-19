'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog';
import { Calendar, ArrowRight } from 'lucide-react';

export default function BlogIndex() {
    return (
        <main className="min-h-screen bg-[#F2F2F7]">
            <Header />
            <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Блог обновлений</h1>
                    <p className="text-lg text-slate-500">Последние новости о моделях, функциях и релизах Aporto AI.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {BLOG_POSTS.map((post) => (
                        <article key={post.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col">
                            <div className="text-xs font-semibold text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full mb-4 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {post.date}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-3 leading-tight hover:text-[#007AFF] transition-colors">
                                <Link href={`/blog/${post.slug}`}>
                                    {post.title}
                                </Link>
                            </h2>
                            <p className="text-slate-500 mb-6 flex-1">{post.excerpt}</p>
                            <Link
                                href={`/blog/${post.slug}`}
                                className="inline-flex items-center text-sm font-bold text-[#007AFF] hover:gap-2 transition-all"
                            >
                                Читать полностью <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}
