"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Award, Settings, LogOut, ShieldCheck, Menu, X, User, DownloadCloud, HelpCircle, MessageSquare, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../../components/NotificationBell';
import { apiFetch } from '../../lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);
    const [userEmail, setUserEmail] = useState<string>('');
    const [userFirstName, setUserFirstName] = useState<string>('');
    const [userLastName, setUserLastName] = useState<string>('');
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));

            const now = Math.floor(Date.now() / 1000);
            if (decodedPayload.exp && decodedPayload.exp < now) {
                throw new Error("Jeton expiré");
            }

            setUserEmail(decodedPayload.email || 'apprenant@ethicaldata.local');
            setUserFirstName(decodedPayload.prenom || decodedPayload.email?.split('@')[0] || 'Étudiant');
            setUserLastName(decodedPayload.nom || '');
            setUserAvatar(decodedPayload.avatar || null);
            setAuthorized(true);

            // Charger le profil utilisateur à jour avec sa photo
            apiFetch('/users/me/profile')
                .then((profile) => {
                    if (profile) {
                        if (profile.prenom) setUserFirstName(profile.prenom);
                        if (profile.nom) setUserLastName(profile.nom);
                        if (profile.email) setUserEmail(profile.email);
                        if (profile.avatar) setUserAvatar(profile.avatar);
                    }
                })
                .catch((err) => console.warn("Impossible de charger l'avatar du profil:", err));
        } catch (error) {
            console.error("Vérification session échouée :", error);
            localStorage.removeItem('token');
            router.push('/login');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    const navItems = [
        { name: 'Mon Tableau de Bord', href: '/dashboard', icon: BookOpen },
        { name: 'Certifications', href: '/dashboard/certifications', icon: Award },
        { name: 'Entraînement', href: '/dashboard/practice', icon: HelpCircle },
        { name: 'Mes Fiches & Cours', href: '/dashboard/downloads', icon: DownloadCloud },
        { name: 'Communauté', href: '/dashboard/community', icon: MessageSquare },
        { name: 'Rendez-vous & Coaching', href: '/dashboard/appointments', icon: Calendar },
        { name: 'Mon Profil', href: '/dashboard/profile', icon: User },
    ];

    if (!authorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-4">
                <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement de votre espace...</p>
            </div>
        );
    }

    // Déterminer le titre et sous-titre de la page selon l'URL
    const getPageTitleAndSubtitle = () => {
        if (pathname === '/dashboard') {
            return { title: `Bonjour, ${userFirstName}`, subtitle: 'Suivez vos entraînements et votre progression' };
        }
        if (pathname === '/dashboard/certifications') {
            return { title: 'Catalogue des Certifications', subtitle: 'Explorez les certifications et accédez aux fiches de révision' };
        }
        if (pathname === '/dashboard/practice') {
            return { title: 'Simulateur d\'Examen', subtitle: 'Entraînement interactif en conditions réelles' };
        }
        if (pathname === '/dashboard/downloads') {
            return { title: 'Fiches & Guides de Cours', subtitle: 'Supports de révision condensés et téléchargements autorisés' };
        }
        if (pathname === '/dashboard/community') {
            return { title: 'Communauté & Entraide', subtitle: 'Échangez avec les apprenants et posez vos questions d\'examen' };
        }
        if (pathname === '/dashboard/profile') {
            return { title: 'Mon Profil Apprenant', subtitle: 'Gérez vos informations personnelles, votre sécurité et vos préférences' };
        }
        if (pathname === '/dashboard/appointments') {
            return { title: 'Rendez-vous & Coaching', subtitle: 'Réservez un créneau individuel avec un formateur ou coach certifié' };
        }
        return { title: 'Catalogue des Certifications', subtitle: 'Explorez les certifications et accédez aux fiches de révision' };
    };
    const { title, subtitle } = getPageTitleAndSubtitle();

    return (
        <div className="h-screen bg-slate-50 text-slate-800 flex relative overflow-hidden font-sans">

            {/* Halos d'arrière-plan */}
            <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-blue-500/2 rounded-full blur-[140px] pointer-events-none z-0" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] bg-blue-600/[0.01] rounded-full blur-[140px] pointer-events-none z-0" />

            {/* Sidebar Mobile */}
            <AnimatePresence>
                {isMobile && sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 z-45 bg-slate-50/60 backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: -260 }}
                            animate={{ x: 0 }}
                            exit={{ x: -260 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 bottom-0 left-0 z-50 w-[260px] flex flex-col bg-white border-r border-slate-200/80 h-screen"
                        >
                            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/80">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center">
                                        <svg className="w-7 h-7 text-red-600" viewBox="0 0 100 100" fill="currentColor">
                                            <polygon points="50,15 15,85 85,85" className="fill-none stroke-red-600 stroke-[6]" />
                                            <polygon points="50,30 28,75 72,75" className="fill-none stroke-slate-900 stroke-[4]" />
                                            <polygon points="50,45 40,65 60,65" className="fill-red-600" />
                                        </svg>
                                    </div>
                                    <span className="font-extrabold text-base text-slate-950 tracking-tight">EthicalData</span>
                                </div>
                                <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-650">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex-1 py-6 px-4 space-y-2">
                                {navItems.map((item, index) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;
                                    return (
                                        <a
                                            key={index}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-extrabold transition-all ${isActive ? 'bg-blue-50 text-blue-600 border border-blue-100/90 shadow-2xs' : 'text-slate-600 hover:text-slate-955 hover:bg-slate-50'}`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                            <span>{item.name}</span>
                                        </a>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-slate-200/80 bg-slate-50/40">
                                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-550/10 hover:text-rose-455">
                                    <LogOut className="w-5 h-5" />
                                    <span>Déconnexion</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Sidebar Desktop Fixe et Élégante */}
            {!isMobile && (
                <aside className="hidden md:flex flex-col bg-white border-r border-slate-200/80 relative z-10 shrink-0 sticky top-0 h-screen shadow-sm w-[260px] overflow-y-auto overflow-x-hidden">
                    {/* Logo Brand avec Triangle */}
                    <div className="h-20 flex items-center px-6 border-b border-slate-200/80">
                        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                            <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
                                <svg className="w-8 h-8 text-red-600" viewBox="0 0 100 100" fill="currentColor">
                                    <polygon points="50,15 15,85 85,85" className="fill-none stroke-red-600 stroke-[6]" />
                                    <polygon points="50,30 28,75 72,75" className="fill-none stroke-slate-900 stroke-[4]" />
                                    <polygon points="50,45 40,65 60,65" className="fill-red-600" />
                                </svg>
                            </div>
                            <span className="font-extrabold text-base text-slate-950 tracking-tight uppercase">
                                EthicalData
                            </span>
                        </Link>
                    </div>

                    {/* Liens de navigation */}
                    <nav className="flex-1 py-6 px-4 space-y-2">
                        {navItems.map((item, index) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <a
                                    key={index}
                                    href={item.href}
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-extrabold transition-all duration-200 group relative ${isActive
                                        ? 'bg-blue-50 text-blue-600 border border-blue-100/90 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 cursor-pointer'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600 transition-colors'}`} />
                                    <span className="truncate flex-1">{item.name}</span>
                                </a>
                            );
                        })}
                    </nav>

                    {/* Déconnexion en bas */}
                    <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer group"
                        >
                            <LogOut className="w-5.5 h-5.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </aside>
            )}

            {/* Contenu principal (h-screen fixe) */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">

                {/* Header Premium (Sans bouton Hamburger sur PC) */}
                <header className="py-5 md:py-6 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 md:px-12 sticky top-0 z-20 transition-all duration-300">

                    {/* Gauche : Titre Dynamique (Bouton Hamburger uniquement sur Mobile) */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-3 bg-slate-50 border border-slate-200 hover:border-blue-600 text-slate-600 hover:text-blue-600 rounded-xl transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center"
                            aria-label="Ouvrir le menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col text-left justify-center">
                            <h1 className="text-xl md:text-2xl font-black text-slate-955 tracking-tight leading-none mb-2">{title}</h1>
                            <p className="text-xs text-slate-400 font-bold hidden md:block leading-none">{subtitle}</p>
                        </div>
                    </div>

                    {/* Droite : Profil Utilisateur Cliquable & Notifications */}
                    <div className="flex items-center gap-4">
                        <NotificationBell />

                        <a
                            href="/dashboard/profile"
                            className="flex items-center gap-3 p-1.5 hover:bg-slate-100/80 rounded-2xl transition-all cursor-pointer group"
                            title="Voir et modifier mon profil"
                        >
                            <div className="flex flex-col text-right justify-center hidden sm:flex">
                                <span className="text-xs font-black text-slate-950 leading-none mb-1 group-hover:text-blue-600 transition-colors">
                                    {userFirstName} {userLastName}
                                </span>
                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider leading-none">
                                    Apprenant
                                </span>
                            </div>

                            {/* Avatar Stylisé avec photo de profil */}
                            <div className="relative shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt={`${userFirstName} ${userLastName}`}
                                        className="relative w-10 h-10 rounded-2xl object-cover border border-slate-200/80 shadow-md transition-transform duration-200 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="relative w-10 h-10 bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-md transition-transform duration-200 group-hover:scale-105">
                                        {userFirstName ? userFirstName[0].toUpperCase() : 'U'}
                                    </div>
                                )}
                            </div>
                        </a>
                    </div>
                </header>

                {/* Contenu principal de la page */}
                <main className="flex-1 p-6 md:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}