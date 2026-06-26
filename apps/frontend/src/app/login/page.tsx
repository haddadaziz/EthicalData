"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mouseRef = useRef({ x: 0, y: 0, active: false });

    // Initialisation du thème réactif
    useEffect(() => {
        const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Effet pour dessiner l'animation de particules style antigravité interactif
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
            const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
            for (let i = 0; i < particleCount; i++) {
                const radius = Math.random() * 1.8 + 1.2; // Tailles légèrement augmentées (1.2px à 3.0px au lieu de 0.8px à 2.6px)
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const targetVy = -(Math.random() * 0.4 + 0.1);
                const targetVx = (Math.random() * 0.4 - 0.2);
                particles.push({
                    x,
                    y,
                    vx: targetVx,
                    vy: targetVy,
                    radius,
                    alpha: Math.random() * 0.4 + 0.4, // Opacité plus lumineuse (de 0.4 à 0.8 au lieu de 0.2 à 0.7)
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

        const repelRadius = 140;
        const maxConnectionDist = 110;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const m = mouseRef.current;
            const isDark = document.documentElement.classList.contains('dark');

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                if (p.y < -10) {
                    p.y = canvas.height + 10;
                    p.x = Math.random() * canvas.width;
                }
                if (p.y > canvas.height + 10) p.y = -10;

                if (m.active) {
                    const dx = p.x - m.x;
                    const dy = p.y - m.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < repelRadius) {
                        const force = (repelRadius - dist) / repelRadius;
                        const angle = Math.atan2(dy, dx);
                        const pushX = Math.cos(angle) * force * 3.5;
                        const pushY = Math.sin(angle) * force * 3.5;
                        p.vx += (pushX - p.vx) * 0.15;
                        p.vy += (pushY - p.vy) * 0.15;
                    } else {
                        p.vx += (p.targetVx - p.vx) * 0.04;
                        p.vy += (p.targetVy - p.vy) * 0.04;
                    }
                } else {
                    p.vx += (p.targetVx - p.vx) * 0.04;
                    p.vy += (p.targetVy - p.vy) * 0.04;
                }

                ctx.fillStyle = isDark
                    ? `rgba(165, 180, 252, ${p.alpha})`
                    : `rgba(79, 70, 229, ${p.alpha * 0.7})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i];
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxConnectionDist) {
                        const lineAlpha = (1 - dist / maxConnectionDist) * (isDark ? 0.12 : 0.08);
                        ctx.strokeStyle = isDark
                            ? `rgba(129, 140, 248, ${lineAlpha})`
                            : `rgba(79, 70, 229, ${lineAlpha})`;
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
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: { email, motDePasse: password },
            });

            localStorage.setItem('token', data.access_token);
            router.push('/admin');
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de la connexion.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6 selection:bg-indigo-500 selection:text-white relative overflow-hidden transition-colors duration-300">

            {/* Bouton de bascule de thème flottant dans le coin supérieur droit */}
            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={toggleTheme}
                    className="p-3 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-2xl cursor-pointer transition-all shadow-sm"
                    title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                >
                    {theme === 'dark' ? <Sun className="w-5.5 h-5.5" /> : <Moon className="w-5.5 h-5.5" />}
                </button>
            </div>

            {/* Halos lumineux d'arrière-plan */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 dark:bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Canvas pour l'animation de particules */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
            />

            {/* Carte de connexion agrandie et dépolie */}
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-[620px] bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-[28px] sm:rounded-[36px] shadow-2xl p-8 sm:p-12 md:p-16 relative z-10 hover:border-indigo-500/20 dark:hover:border-indigo-500/30 hover:shadow-[0_0_50px_rgba(99,102,241,0.06)] dark:hover:shadow-[0_0_50px_rgba(99,102,241,0.1)] transition-all duration-500 group/card"
            >

                {/* Logo & Titre */}
                <div className="flex flex-col items-center mb-12">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
                        className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-5 shadow-[0_0_20px_rgba(99,102,241,0.05)] dark:shadow-[0_0_20px_rgba(99,102,241,0.1)] group-hover/card:shadow-[0_0_25px_rgba(99,102,241,0.2)] transition-shadow duration-500"
                    >
                        <ShieldCheck className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight bg-clip-text bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">EthicalData</h1>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 bg-rose-500/10 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-semibold shadow-inner"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* E-mail */}
                    <div className="space-y-3 group">
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider pl-2 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors duration-200">Adresse e-mail</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-6 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
                                <Mail className="w-6 h-6" />
                            </span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@ethicaldata.local"
                                className="w-full pl-16 pr-6 py-5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-950/60 rounded-[20px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 transition-all text-lg shadow-inner focus:shadow-[0_0_20px_rgba(99,102,241,0.06)] dark:focus:shadow-[0_0_20px_rgba(99,102,241,0.12)] outline-none"
                            />
                        </div>
                    </div>

                    {/* Mot de passe */}
                    <div className="space-y-3 group">
                        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider pl-2 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors duration-200">Mot de passe</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-6 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors duration-200">
                                <Lock className="w-6 h-6" />
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-16 pr-16 py-5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-950/60 rounded-[20px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 transition-all text-lg shadow-inner focus:shadow-[0_0_20px_rgba(99,102,241,0.06)] dark:focus:shadow-[0_0_20px_rgba(99,102,241,0.12)] outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-6 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Bouton de soumission animé */}
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold rounded-[20px] text-lg transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                    >
                        {loading ? (
                            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Se connecter'
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}