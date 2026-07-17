"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from '@/components/icons';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await apiFetch('/auth/forgot-password', {
                method: 'POST',
                body: { email },
            });
            setSent(true);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                {sent ? (
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-7 h-7 text-emerald-600" />
                        </div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight">Email envoyé</h1>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Si un compte existe avec l&apos;adresse <strong className="text-slate-900">{email}</strong>,
                            vous recevrez un lien de réinitialisation sous quelques minutes.
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                            Pensez à vérifier vos spams si vous ne trouvez pas l&apos;email.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block mt-4 px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                        >
                            Retour à la connexion
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                            <h1 className="text-lg font-black text-slate-900 tracking-tight">Mot de passe oublié</h1>
                            <p className="text-xs text-slate-500 font-medium">
                                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Adresse email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="vous@exemple.com"
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
                                    'Envoyer le lien'
                                )}
                            </button>
                        </form>

                        <div className="text-center pt-2 border-t border-slate-100">
                            <Link
                                href="/login"
                                className="text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Retour à la connexion</span>
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </main>
    );
}
