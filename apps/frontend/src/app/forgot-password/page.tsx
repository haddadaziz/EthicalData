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
        <main className="min-h-screen w-screen bg-[#020617] flex flex-col justify-between p-4 sm:p-6 selection:bg-cyan-600 selection:text-white relative overflow-hidden">
            
            <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-20 px-2 sm:px-4 py-2 mt-2">
                <Link href="/" className="flex items-center hover:opacity-80 transition-opacity cursor-pointer">
                    <img src="/logos/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-6 sm:h-8 w-auto object-contain" />
                </Link>
            </header>

            {/* Static Background Pattern (No Canvas to keep it simple but matching the dark theme) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/[0.05] rounded-full blur-[130px] pointer-events-none z-0" />

            <div className="flex-1 flex items-center justify-center relative z-10 my-auto py-6">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full max-w-[400px] bg-[#080d1a]/90 border border-slate-800 rounded-[28px] shadow-xl p-6 sm:p-8 relative z-10 hover:border-slate-700 hover:shadow-2xl transition-all duration-500"
                >
                    {sent ? (
                        <div className="text-center space-y-4">
                            <div className="w-14 h-14 rounded-full bg-emerald-950/40 border border-emerald-900/50 flex items-center justify-center mx-auto">
                                <CheckCircle className="w-7 h-7 text-emerald-500" />
                            </div>
                            <h1 className="text-lg font-bold text-white tracking-tight">Email envoyé</h1>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                Si un compte existe avec l&apos;adresse <strong className="text-white">{email}</strong>,
                                vous recevrez un lien de réinitialisation sous quelques minutes.
                            </p>
                            <p className="text-[9px] text-slate-500 font-medium">
                                Pensez à vérifier vos spams si vous ne trouvez pas l&apos;email.
                            </p>
                            <Link
                                href="/login"
                                className="inline-block mt-4 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-xl text-[10px] transition-all cursor-pointer shadow-md"
                            >
                                Retour à la connexion
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 rounded-2xl bg-blue-950/40 border border-blue-900/50 flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-6 h-6 text-cyan-400" />
                                </div>
                                <h1 className="text-lg font-bold text-white tracking-tight">Mot de passe oublié</h1>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    Entrez votre adresse e-mail pour recevoir un lien
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-950/30 border border-red-900/20 text-red-500 rounded-xl text-xs font-semibold text-left">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1.5 text-left group">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Adresse e-mail</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="vous@exemple.com"
                                            className="w-full pl-11 pr-4 py-3.5 bg-[#020617] border border-slate-800 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 rounded-xl text-xs font-bold text-white outline-none transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
                                >
                                    {loading ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Envoyer le lien'
                                    )}
                                </button>
                            </form>

                            <div className="text-center pt-4 border-t border-slate-800">
                                <Link
                                    href="/login"
                                    className="text-[10px] text-slate-400 hover:text-white font-black uppercase tracking-widest transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>Retour à la connexion</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
            
            <footer className="w-full text-center py-4 relative z-10">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Ethical Data Security
                </p>
            </footer>
        </main>
    );
}
