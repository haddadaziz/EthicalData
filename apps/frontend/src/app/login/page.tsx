"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ShieldCheck, Eye, EyeOff, User } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [prenom, setPrenom] = useState('');
    const [nom, setNom] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mouseRef = useRef({ x: 0, y: 0, active: false });

    // Initialisation forcée du thème sombre global
    useEffect(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }, []);

    // Effet pour l'animation de fond de particules interactives style antigravité
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
            const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 75);
            for (let i = 0; i < particleCount; i++) {
                const radius = Math.random() * 1.3 + 0.8;
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
                    alpha: Math.random() * 0.25 + 0.25,
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
                        const pushX = Math.cos(angle) * force * 2.5;
                        const pushY = Math.sin(angle) * force * 2.5;
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

                ctx.fillStyle = `rgba(165, 180, 252, ${p.alpha})`;
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
                        const lineAlpha = (1 - dist / maxConnectionDist) * 0.06;
                        ctx.strokeStyle = `rgba(129, 140, 248, ${lineAlpha})`;
                        ctx.lineWidth = 0.4;
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
        setSuccessMessage(null);

        try {
            if (mode === 'login') {
                const data = await apiFetch('/auth/login', {
                    method: 'POST',
                    body: { email, motDePasse: password },
                });

                localStorage.setItem('token', data.access_token);

                const payloadBase64 = data.access_token.split('.')[1];
                const decodedPayload = JSON.parse(atob(payloadBase64));
                const roles = decodedPayload.roles || [];

                if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
                // --------------------------------------------------------
            } else {
                // Inscription
                await apiFetch('/users', {
                    method: 'POST',
                    body: {
                        prenom,
                        nom,
                        email,
                        motDePasse: password,
                        roles: ['APPRENANT']
                    },
                });

                setSuccessMessage('Inscription réussie ! Connexion automatique...');

                const data = await apiFetch('/auth/login', {
                    method: 'POST',
                    body: { email, motDePasse: password },
                });

                localStorage.setItem('token', data.access_token);

                // Rediriger l'apprenant fraîchement inscrit
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1000);
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-indigo-500 selection:text-white relative overflow-hidden">

            {/* Grille d'arrière-plan ultra-discrète */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

            {/* Halos lumineux floutés */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/[0.04] rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/[0.04] rounded-full blur-[130px] pointer-events-none" />

            {/* Canvas de fond */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
            />

            {/* Boîte principale de connexion (Design Glassmorphic Premium Flottant) */}
            <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-[420px] bg-slate-900/15 backdrop-blur-2xl border border-slate-800 rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-8 sm:p-10 relative z-10 hover:border-slate-700 hover:shadow-[0_25px_60px_-15px_rgba(99,102,241,0.05)] transition-all duration-500 group/card"
            >
                {/* Logo & En-tête */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-11 h-11 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-center text-white mb-4 shadow-[0_0_15px_rgba(255,255,255,0.02)] group-hover/card:border-indigo-500/30 group-hover/card:text-indigo-400 transition-all duration-500">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <motion.h1
                        layout="position"
                        className="text-xl font-bold text-white tracking-tight"
                    >
                        {mode === 'login' ? 'Connexion' : 'Inscription'}
                    </motion.h1>
                    <p className="text-[11px] text-slate-500 mt-1.5 font-semibold uppercase tracking-wider">
                        {mode === 'login' ? 'Préparation aux Certifications IT' : 'Créez votre accès étudiant'}
                    </p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-3.5 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl text-xs font-semibold text-left"
                            >
                                {error}
                            </motion.div>
                        )}

                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-xl text-xs font-semibold text-left"
                            >
                                {successMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Inputs spécifiques inscription */}
                    <AnimatePresence>
                        {mode === 'register' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-6 overflow-hidden"
                            >
                                {/* Prénom */}
                                <div className="space-y-2 text-left group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Prénom</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            value={prenom}
                                            onChange={(e) => setPrenom(e.target.value)}
                                            placeholder="Ex: Jean"
                                            className="w-full pl-5 pr-5 py-3.5 bg-white/[0.02] border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:bg-white/[0.04] focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-white placeholder-slate-650 transition-all text-sm outline-none font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Nom */}
                                <div className="space-y-2 text-left group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nom</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            value={nom}
                                            onChange={(e) => setNom(e.target.value)}
                                            placeholder="Ex: Dupont"
                                            className="w-full pl-5 pr-5 py-3.5 bg-white/[0.02] border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:bg-white/[0.04] focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-white placeholder-slate-650 transition-all text-sm outline-none font-medium"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* E-mail */}
                    <div className="space-y-2 text-left group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Adresse e-mail</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nom@exemple.com"
                                className="w-full pl-5 pr-5 py-3.5 bg-white/[0.02] border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:bg-white/[0.04] focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-white placeholder-slate-650 transition-all text-sm outline-none font-medium"
                            />
                        </div>
                    </div>

                    {/* Mot de passe */}
                    <div className="space-y-2 text-left group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mot de passe</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-5 pr-12 py-3.5 bg-white/[0.02] border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:bg-white/[0.04] focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-white placeholder-slate-650 transition-all text-sm outline-none font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Bouton Soumettre */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-2xl text-[11px] uppercase tracking-widest transition-all focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8 shadow-md"
                    >
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                        ) : (
                            mode === 'login' ? 'Se connecter' : 'Valider'
                        )}
                    </motion.button>
                </form>

                {/* Séparateur & Bascule de mode */}
                <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
                    <button
                        onClick={() => {
                            setMode(mode === 'login' ? 'register' : 'login');
                            setError(null);
                            setSuccessMessage(null);
                        }}
                        className="text-xs text-slate-500 hover:text-white font-bold transition-colors cursor-pointer"
                    >
                        {mode === 'login'
                            ? "Pas encore de compte ? Créer un compte"
                            : "Déjà inscrit ? Se connecter"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}