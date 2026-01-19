import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getPostBySlug } from '@/lib/blog';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User } from 'lucide-react';

interface Props {
    params: {
        slug: string;
    }
}

export default function BlogPost({ params }: Props) {
    const post = getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#F2F2F7]">
            <Header />
            <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Вернуться в блог
                </Link>

                <article className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
                    <header className="mb-10 text-center">
                        <div className="flex items-center justify-center gap-4 text-sm text-slate-400 mb-6">
                            <span className="flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full">
                                <Calendar className="w-4 h-4" />
                                {post.date}
                            </span>
                            <span className="flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full">
                                <User className="w-4 h-4" />
                                {post.author}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                            {post.title}
                        </h1>
                        <p className="text-xl text-slate-500 font-medium">
                            {post.excerpt}
                        </p>
                    </header>

                    <div
                        className="prose prose-lg prose-slate mx-auto prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-[#007AFF]"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>
            </div>
            <Footer />
        </main>
    );
}
