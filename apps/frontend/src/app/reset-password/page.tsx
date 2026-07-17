"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '../../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle, AlertTriangle } from '@/components/icons';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError('Lien de réinitialisation invalide. Aucun token trouvé.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        setLoading(true);
        try {
            await apiFetch('/auth/reset-password', {
                method: 'POST',
                body: { token, motDePasse: password },
            });
            setSuccess(true);
            setTimeout(() => router.push('/login'), 3000);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    if (!token && !error) return null;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                {success ? (
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-7 h-7 text-emerald-600" />
                        </div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight">Mot de passe réinitialisé</h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Vous allez être redirigé vers la page de connexion...
                        </p>
                        <Link
                            href="/login"
                            className="inline-block mt-4 px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                        >
                            Se connecter
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-6">
                        <div className="text-center space-y-2">
                            {error && !token ? (
                                <>
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h1 className="text-lg font-black text-slate-900 tracking-tight">Lien invalide</h1>
                                    <p className="text-xs text-slate-500 font-medium">{error}</p>
                                    <Link
                                        href="/forgot-password"
                                        className="inline-block mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                                    >
                                        Demander un nouveau lien
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto">
                                        <Eye className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h1 className="text-lg font-black text-slate-900 tracking-tight">Nouveau mot de passe</h1>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Choisissez un mot de passe sécurisé d&apos;au moins 8 caractères.
                                    </p>
                                </>
                            )}
                        </div>

                        {token && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Nouveau mot de passe</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            minLength={8}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Confirmer le mot de passe</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                                    />
                                </div>

                                {error && (
                                    <p className="text-xs text-red-600 font-bold bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                                >
                                    {loading ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Réinitialiser'
                                    )}
                                </button>
                            </form>
                        )}

                        <div className="text-center pt-2 border-t border-slate-100">
                            <Link
                                href="/login"
                                className="text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                                <span>Retour à la connexion</span>
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
                <span className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            </main>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
