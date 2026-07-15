"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from '@/components/icons';
import { apiFetch } from '../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TriangleLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={`${className} text-red-600`} viewBox="0 0 100 100" fill="currentColor">
        <polygon points="50,15 15,85 85,85" className="fill-none stroke-red-600 stroke-[6]" />
        <polygon points="50,30 28,75 72,75" className="fill-none stroke-slate-900 stroke-[4]" />
        <polygon points="50,45 40,65 60,65" className="fill-red-600" />
    </svg>
);

export default function RegisterPage() {
    const router = useRouter();
    const [prenom, setPrenom] = useState('');
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mouseRef = useRef({ x: 0, y: 0, active: false });

    // Configuration SEO de la page
    useEffect(() => {
        document.title = "Inscription - Ethical Data Security";
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }, []);

    // Animation de fond interactive (particules rouges EDS)
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
                ctx.fillStyle = `rgba(220, 38, 38, ${p.alpha})`;
                ctx.shadowColor = '#dc2626';
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
                        ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`;
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

    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/;

    const getPasswordStrength = (pw: string): { label: string; color: string; width: string } => {
        const checks = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z\d\s]/, /.{8,}/];
        const passed = checks.filter((r) => r.test(pw)).length;
        if (passed <= 1) return { label: 'Faible', color: 'bg-red-500', width: 'w-1/5' };
        if (passed <= 3) return { label: 'Moyen', color: 'bg-orange-500', width: 'w-2/5' };
        if (passed <= 4) return { label: 'Bon', color: 'bg-yellow-500', width: 'w-3/5' };
        return { label: 'Fort', color: 'bg-green-500', width: 'w-full' };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        setPasswordError(null);

        if (!PASSWORD_REGEX.test(password)) {
            setPasswordError('8 caractères min, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial');
            setLoading(false);
            return;
        }

        try {
            const data = await apiFetch('/auth/register', {
                method: 'POST',
                body: { prenom, nom, email, motDePasse: password },
            });

            if (data?.access_token) {
                localStorage.setItem('access_token', data.access_token);
            }

            setSuccessMessage('Compte créé avec succès ! Redirection...');

            setTimeout(() => {
                router.push('/dashboard');
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de l&apos;inscription.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen w-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 selection:bg-red-600 selection:text-white relative overflow-hidden">
            
            {/* BARRE SUPÉRIEURE ÉPURÉE */}
            <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-20 px-2 sm:px-4 py-2">
            </header>


            {/* Grille d'arrière-plan claire */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/[0.02] rounded-full blur-[130px] pointer-events-none z-0" />

            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
            />

            {/* CONTENANT CENTRAL POUR LA BOÎTE D'INSCRIPTION */}
            <div className="flex-1 flex items-center justify-center relative z-10 my-auto py-6">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full max-w-[400px] bg-white border border-slate-200/80 rounded-[28px] shadow-xl p-6 sm:p-8 relative z-10 hover:border-slate-350 hover:shadow-2xl transition-all duration-500 group/card"
                >
                    <div className="flex flex-col items-center mb-5">
                        <div className="flex items-center justify-center mb-2 group-hover/card:scale-105 transition-transform duration-300">
                            <img src="/favicon_ethical_data.png" alt="Ethical Data Security" className="w-10 h-10 object-contain" />
                        </div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Inscription</h1>
                        <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">
                            Créez votre accès étudiant
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold text-left">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-semibold text-left">
                                {successMessage}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5 text-left group">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Prénom</label>
                                <input
                                    type="text"
                                    required
                                    value={prenom}
                                    onChange={(e) => setPrenom(e.target.value)}
                                    placeholder="Jean"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 rounded-xl text-slate-900 placeholder-slate-400 transition-all text-xs outline-none font-semibold"
                                />
                            </div>

                            <div className="space-y-1.5 text-left group">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Nom</label>
                                <input
                                    type="text"
                                    required
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    placeholder="Dupont"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 rounded-xl text-slate-900 placeholder-slate-400 transition-all text-xs outline-none font-semibold"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 text-left group">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Adresse e-mail</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nom@exemple.com"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 rounded-xl text-slate-900 placeholder-slate-400 transition-all text-xs outline-none font-semibold"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 text-left group">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Mot de passe</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 rounded-xl text-slate-900 placeholder-slate-400 transition-all text-xs outline-none font-semibold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {password && (
                                <div className="mt-2 space-y-1">
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-300 ${getPasswordStrength(password).color} ${getPasswordStrength(password).width}`} />
                                    </div>
                                    <p className="text-[10px] font-semibold text-slate-400">
                                        Force : <span className="text-slate-600">{getPasswordStrength(password).label}</span>
                                    </p>
                                </div>
                            )}
                            {passwordError && (
                                <p className="mt-1 text-[10px] font-semibold text-red-500">{passwordError}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 shadow-md"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "S'inscrire"
                            )}
                        </button>
                    </form>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col items-center gap-2 text-center">
                        <Link
                            href="/login"
                            className="text-xs text-slate-600 hover:text-slate-950 font-bold transition-colors cursor-pointer"
                        >
                            Déjà inscrit ? Se connecter
                        </Link>
                        <Link
                            href="/"
                            className="text-[11px] text-slate-400 hover:text-blue-600 font-bold tracking-wide uppercase transition-colors cursor-pointer flex items-center gap-1 mt-1"
                        >
                            <span>← Retourner à l&apos;accueil</span>
                        </Link>
                    </div>
                </motion.div>
            </div>

            <footer className="w-full text-center py-2 text-[11px] text-slate-400 font-medium z-20">
                © {new Date().getFullYear()} Ethical Data Security. Tous droits réservés.
            </footer>
        </main>
    );
}
