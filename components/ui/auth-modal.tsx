'use client';

import { useState, useEffect } from 'react';
import { X, Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { registerUser } from '@/app/actions/auth';
import Image from 'next/image';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setError(null);
            setPassword('');
        } else {
            document.body.style.overflow = 'unset';
            setMode('signin'); // Reset mode on close
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (mode === 'signup') {
                const formData = new FormData();
                formData.append('email', email);
                formData.append('password', password);

                const result = await registerUser(formData);
                if (result.error) {
                    setError(result.error);
                    setIsLoading(false);
                    return;
                }
            }

            // Sign In (for both modes)
            const res = await signIn('credentials', {
                email,
                password,
                redirect: true,
                callbackUrl: 'https://api.aporto.tech/client'
            });

            if (res?.error) {
                setError('Invalid credentials');
                setIsLoading(false);
            }
            // NextAuth redirect handles success
        } catch (err) {
            console.error(err);
            setError('Something went wrong');
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        setIsLoading(true);
        signIn('google', { callbackUrl: 'https://api.aporto.tech/client' });
    };

    const toggleMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setError(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mode === 'signup' ? 'Create your account' : 'Welcome back'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                    {mode === 'signup'
                        ? 'Welcome! Please fill in the details to get started.'
                        : 'Please enter your details to sign in.'}
                </p>

                <div className="space-y-3 mb-6">
                    {/* Google Button */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </button>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">or</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="mb-4 text-sm text-red-500 text-center">
                            {error}
                        </div>
                    )}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                            placeholder="Enter your email address"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div className="flex items-center mb-6">
                        <input id="terms" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" required />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : (mode === 'signup' ? 'Continue' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                        {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                    </span>
                    <button onClick={toggleMode} className="text-blue-600 hover:underline font-medium">
                        {mode === 'signup' ? 'Sign in' : 'Sign up'}
                    </button>
                </div>

            </div>
        </div>
    );
}
