"use client";

import React, { useState, useEffect, useRef } from 'react';
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

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mouseRef = useRef({ x: 0, y: 0, active: false });

    useEffect(() => {
        document.title = "Mot de passe oublié - Ethical Data Security";
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            alpha: number;
            targetVx: number;
            targetVy: number;
        }> = [];

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 10000), 120);
            for (let i = 0; i < particleCount; i++) {
                const radius = Math.random() * 1.8 + 1.2;
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const targetVy = -(Math.random() * 0.25 + 0.05);
                const targetVx = (Math.random() * 0.2 - 0.1);
                particles.push({
                    x,
                    y,
                    vx: targetVx,
                    vy: targetVy,
                    radius,
                    alpha: Math.random() * 0.2 + 0.15,
                    targetVx,
                    targetVy
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
            mouseRef.current.active = true;
        };

        const handleMouseLeave = () => {
            mouseRef.current.active = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        const repelRadius = 160;
        const maxConnectionDist = 130;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const m = mouseRef.current;

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.y < 0) {
                    p.y = canvas.height;
                    p.x = Math.random() * canvas.width;
                }
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;

                if (m.active) {
                    const dx = p.x - m.x;
                    const dy = p.y - m.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < repelRadius && dist > 0) {
                        const force = (1 - dist / repelRadius) * 2.5;
                        p.vx += (dx / dist) * force;
                        p.vy += (dy / dist) * force;
                    }
                }

                p.vx += (p.targetVx - p.vx) * 0.05;
                p.vy += (p.targetVy - p.vy) * 0.05;

                ctx.save();
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
                ctx.shadowColor = '#06b6d4';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.restore();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i];
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxConnectionDist) {
                        const alpha = (1 - dist / maxConnectionDist) * 0.15;
                        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
                        ctx.lineWidth = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationId);
        };
    }, []);

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
                    <img src="/logos/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-9 sm:h-12 w-auto object-contain" />
                </Link>
            </header>

            {/* Static Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/[0.05] rounded-full blur-[130px] pointer-events-none z-0" />

            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
            />

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

                            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col items-center gap-2 text-center">
                                <Link
                                    href="/login"
                                    className="text-xs text-slate-400 hover:text-white font-bold transition-colors cursor-pointer"
                                >
                                    Retour à la connexion
                                </Link>
                                <Link
                                    href="/"
                                    className="text-[11px] text-slate-500 hover:text-cyan-400 font-bold tracking-wide uppercase transition-colors cursor-pointer flex items-center gap-1 mt-1"
                                >
                                    <span>← Retourner à l&apos;accueil</span>
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
