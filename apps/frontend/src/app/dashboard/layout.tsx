"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, Award, Settings, LogOut, ShieldCheck, Menu, X, User, DownloadCloud, HelpCircle, MessageSquare, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../../components/NotificationBell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);
    const [userEmail, setUserEmail] = useState<string>('');
    const [userFirstName, setUserFirstName] = useState<string>('');
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
            setAuthorized(true);
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
                <span className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-red-600">Chargement de votre espace...</p>
            </div>
        );
    }

    // Déterminer le titre et sous-titre de la page selon l'URL
    const getPageTitleAndSubtitle = () => {
        if (pathname === '/dashboard') {
            return { title: `Bonjour, ${userFirstName} 👋`, subtitle: 'Suivez vos entraînements et votre progression' };
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
        return { title: 'Mon Espace', subtitle: 'Ethical Data' };
    };
    const { title, subtitle } = getPageTitleAndSubtitle();

    return (
        <div className="h-screen bg-slate-50 text-slate-800 flex relative overflow-hidden font-sans">

            {/* Halos d'arrière-plan */}
            <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-red-500/2 rounded-full blur-[140px] pointer-events-none z-0" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] bg-red-650/[0.01] rounded-full blur-[140px] pointer-events-none z-0" />

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
                                    <div className="w-9 h-9 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600">
                                        <ShieldCheck className="w-5.5 h-5.5" />
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
                                            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-slate-950 text-white shadow-md' : 'text-slate-600 hover:text-slate-955 hover:bg-slate-50'}`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span>{item.name}</span>
                                        </a>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-slate-200/80 bg-slate-50/40">
                                <div className="flex items-center gap-3 p-2 rounded-xl mb-2">
                                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="truncate flex-1">
                                        <p className="text-xs font-bold text-slate-955 truncate">{userFirstName}</p>
                                        <p className="text-[9px] text-red-650 font-extrabold uppercase tracking-wider">Candidat</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-450">
                                    <LogOut className="w-5 h-5" />
                                    <span>Déconnexion</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Sidebar Desktop Animée (comme l'admin) */}
            {!isMobile && (
                <motion.aside
                    animate={{ width: sidebarOpen ? 260 : 80 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="hidden md:flex flex-col bg-white border-r border-slate-200/80 relative z-10 shrink-0 sticky top-0 h-screen shadow-sm overflow-y-auto overflow-x-hidden"
                >
                    {/* Logo */}
                    <div className={`h-20 flex items-center ${sidebarOpen ? 'justify-between px-6' : 'justify-center px-0'} border-b border-slate-200/80`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-extrabold text-base text-slate-950 tracking-tight shrink-0 uppercase animate-fade-in"
                                >
                                    EthicalData
                                </motion.span>
                            )}
                        </div>
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
                                    className={`flex items-center ${sidebarOpen ? 'gap-4 px-4' : 'justify-center px-0'} py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group relative ${isActive
                                        ? 'bg-slate-950 text-white shadow-md'
                                        : 'text-slate-600 hover:text-slate-955 hover:bg-slate-50 cursor-pointer'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-600 transition-colors'}`} />
                                    {sidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="truncate flex-1"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </a>
                            );
                        })}
                    </nav>

                    {/* Profil & Déconnexion en bas */}
                    <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
                        <div className={`flex items-center ${sidebarOpen ? 'gap-3 p-2' : 'justify-center p-0'} rounded-xl mb-2 overflow-hidden`}>
                            <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 shrink-0">
                                <User className="w-5.5 h-5.5" />
                            </div>
                            {sidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="truncate flex-1 min-w-0"
                                >
                                    <p className="text-xs font-bold text-slate-900 truncate leading-none mb-1">{userFirstName}</p>
                                    <p className="text-[9px] text-red-600 font-extrabold uppercase tracking-wider leading-none">Candidat</p>
                                </motion.div>
                            )}
                        </div>

                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center ${sidebarOpen ? 'gap-4 px-4' : 'justify-center px-0'} py-3.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer group`}
                        >
                            <LogOut className="w-5.5 h-5.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            {sidebarOpen && <span>Déconnexion</span>}
                        </button>
                    </div>
                </motion.aside>
            )}

            {/* Contenu principal (h-screen fixe) */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">

                {/* Header Premium (py-5 md:py-6 comme l'admin) */}
                <header className="py-5 md:py-6 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 md:px-12 sticky top-0 z-20 transition-all duration-300">

                    {/* Gauche : Bouton Sidebar & Titre Dynamique */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-3 bg-slate-50 border border-slate-200 hover:border-red-650 hover:bg-red-50/30 text-slate-600 hover:text-red-600 rounded-xl transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center"
                            title={sidebarOpen ? "Réduire le menu" : "Agrandir le menu"}
                        >
                            {sidebarOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
                        </button>

                        <div className="flex flex-col text-left justify-center">
                            <h1 className="text-xl md:text-2xl font-black text-slate-955 tracking-tight leading-none mb-2">{title}</h1>
                            <p className="text-xs text-slate-400 font-bold hidden md:block leading-none">{subtitle}</p>
                        </div>
                    </div>

                    {/* Droite : Profil Utilisateur & Notifications */}
                    <div className="flex items-center gap-4">
                        <NotificationBell />

                        <div className="flex flex-col text-right justify-center hidden sm:flex">
                            <span className="text-sm font-bold text-slate-900 leading-none mb-1.5">{userEmail}</span>
                            <span className="text-[10px] font-black text-red-650 uppercase tracking-widest leading-none">Candidat</span>
                        </div>

                        {/* Avatar Stylisé avec Dégradé */}
                        <div className="relative group cursor-pointer shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-rose-500 rounded-full blur-md opacity-25 group-hover:opacity-40 transition-opacity" />
                            <div className="relative w-12 h-12 bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-md transition-transform duration-200 group-hover:scale-105">
                                {userEmail.charAt(0).toUpperCase()}
                            </div>
                        </div>
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