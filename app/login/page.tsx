'use client';

import { ArrowRight, Github } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-4">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-sm relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <div className="w-4 h-4 bg-white rounded-md opacity-20" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">Resolve AI</span>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-white/50">
                    <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Welcome back</h1>
                    <p className="text-center text-slate-500 text-sm mb-8">Log in to view your scan results</p>

                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={async () => {
                                console.log("Initiating Google Sign In...");
                                const result = await signIn('google', { callbackUrl: '/dashboard' });
                                if (result?.error) {
                                    console.error("Sign in error:", result.error);
                                    alert("Login failed: " + result.error);
                                }
                            }}
                            className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M12.0003 20.45c-4.6667 0-8.45005-3.7834-8.45005-8.45005C3.55025 7.33328 7.3336 3.54993 12.0003 3.54993c2.0673 0 3.9616.75887 5.4318 2.01307l-2.071 2.071c-.78-.63-1.99-1.18-3.3608-1.18-2.61 0-4.825 1.77-5.615 4.145-.205.62-.32 1.285-.32 1.975s.115 1.355.32 1.975c.79 2.375 3.005 4.145 5.615 4.145 2.195 0 3.655-1.12 4.455-1.93.655-.66 1.09-1.615 1.24-2.815H12.0003v-3.5h7.795c.075.385.115.795.115 1.235 0 3.73-2.515 6.385-6.385 6.385h-.0003l-1.5247-1.1247z" fill="currentColor" /></svg>
                            Continue with Google
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white/0 backdrop-blur-xl px-2 text-slate-400 font-medium">Or continue with email</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="name@work-email.com"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all text-slate-900 placeholder:text-slate-400"
                            />
                            <button
                                onClick={() => alert("Email login is not configured yet. Please use Google.")}
                                className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20"
                            >
                                Sign in
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center space-x-6 text-xs text-slate-400 font-medium">
                    <Link href="#" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
                    <Link href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
                </div>
            </div>
        </div>
    );
}
