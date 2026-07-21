"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '../../context/ToastContext';
import { BookOpen, Award, Settings, LogOut, ShieldCheck, Menu, X, User, DownloadCloud, HelpCircle, MessageSquare, Calendar, GraduationCap, ChalkboardTeacher, ChevronDown } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../../components/NotificationBell';
import ErrorBoundary from '../../components/ErrorBoundary';
import { apiFetch } from '../../lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { showToast } = useToast();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);
    const [userEmail, setUserEmail] = useState<string>('');
    const [userFirstName, setUserFirstName] = useState<string>('');
    const [userLastName, setUserLastName] = useState<string>('');
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

    const toggleMenu = (name: string) => {
        setExpandedMenu((prev) => (prev === name ? null : name));
    };

    // Rôles et mode de vue (Apprenant / Formateur) initialisés de façon synchrone pour éviter le clignotement
    const [userRoles, setUserRoles] = useState<string[]>([]);

    const [viewMode, setViewMode] = useState<'APPRENANT' | 'FORMATEUR'>(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('viewMode');
            if (savedMode === 'APPRENANT' || savedMode === 'FORMATEUR') return savedMode;
        }
        return 'APPRENANT';
    });

    const [isSwitching, setIsSwitching] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1280;
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleRolesUpdated = () => {
            apiFetch('/users/me/profile')
                .then((profile) => {
                    if (!profile) return;
                    if (profile.roles) {
                        const roles = profile.roles.map((r: any) => r.nom);
                        setUserRoles(roles);
                        if (roles.includes('FORMATEUR')) {
                            setViewMode('FORMATEUR');
                            localStorage.setItem('viewMode', 'FORMATEUR');
                        }
                    }
                })
                .catch(() => {});
        };

        window.addEventListener('rolesUpdated', handleRolesUpdated);
        return () => window.removeEventListener('rolesUpdated', handleRolesUpdated);
    }, []);

    useEffect(() => {
        apiFetch('/users/me/profile')
            .then((profile) => {
                if (!profile) { router.push('/login'); return; }
                setUserEmail(profile.email);
                setUserFirstName(profile.prenom);
                setUserLastName(profile.nom);
                setUserAvatar(profile.avatar || null);
                if (profile.roles) {
                    const roles = profile.roles.map((r: any) => r.nom);
                    const isExemptPath = pathname.startsWith('/dashboard/profile/');
                    if ((roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) && !isExemptPath) {
                        router.push('/admin');
                        return;
                    }
                    setUserRoles(roles);
                    const savedMode = localStorage.getItem('viewMode');
                    const isFormateur = roles.includes('FORMATEUR');
                    if (!isFormateur && savedMode === 'FORMATEUR') {
                        setViewMode('APPRENANT');
                        localStorage.setItem('viewMode', 'APPRENANT');
                    }
                }
                setAuthorized(true);
            })
            .catch(() => {
                router.push('/login');
            });
    }, [router]);

    const handleLogout = async () => {
        try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
        localStorage.removeItem('access_token');
        showToast("Déconnecté avec succès, à bientôt", "success");
        router.push('/login');
    };

    const handleSwitchViewMode = () => {
        if (isSwitching) return;
        setIsSwitching(true);

        const newMode = viewMode === 'FORMATEUR' ? 'APPRENANT' : 'FORMATEUR';
        setViewMode(newMode);
        localStorage.setItem('viewMode', newMode);
        
        // Notification toast premium indiquant le nouvel espace activé
        showToast(
            newMode === 'FORMATEUR'
                ? "Passage à l'Espace Formateur réussi"
                : "Passage à l'Espace Apprenant réussi",
            "success"
        );

        // Notifier les pages enfants du changement de mode (sans rechargement complet)
        window.dispatchEvent(new Event('viewModeChanged'));
        
        // Si l'utilisateur n'est pas sur le dashboard, y naviguer
        if (pathname !== '/dashboard') {
            router.push('/dashboard');
        }

        // Déverrouillage après 1 seconde (rate limit / cooldown)
        setTimeout(() => {
            setIsSwitching(false);
        }, 1000);
    };

    type NavItem = {
        name: string;
        href?: string;
        icon: any;
        subItems?: NavItem[];
    };

    const learnerNavItems: NavItem[] = [
        { name: 'Mon Tableau de Bord', href: '/dashboard', icon: BookOpen },
        { 
            name: 'Apprentissage', 
            icon: GraduationCap,
            subItems: [
                { name: 'Mes Cours', href: '/dashboard/cours', icon: BookOpen },
                { name: 'Entraînement', href: '/dashboard/practice', icon: HelpCircle },
                { name: 'Certifications', href: '/dashboard/certifications', icon: Award },
            ]
        },
        { name: 'Ressources', href: '/dashboard/downloads', icon: DownloadCloud },
        { name: 'Communauté', href: '/dashboard/community', icon: MessageSquare },
        { name: 'Rendez-vous & Coaching', href: '/dashboard/appointments', icon: Calendar },
        { name: 'Mon Profil', href: '/dashboard/profile', icon: User },
        { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
    ];

    const trainerNavItems: NavItem[] = [
        { name: 'Mon Tableau de Bord', href: '/dashboard', icon: BookOpen },
        {
            name: 'Enseignement',
            icon: ChalkboardTeacher,
            subItems: [
                { name: 'Gérer mes cours', href: '/dashboard/courses', icon: Award },
                { name: 'Créer mes Créneaux', href: '/dashboard/appointments', icon: Calendar },
            ]
        },
        { name: 'Communauté', href: '/dashboard/community', icon: MessageSquare },
        { name: 'Mon Profil', href: '/dashboard/profile', icon: User },
        { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
    ];

    const isTrainer = userRoles.includes('FORMATEUR');
    const navItems = (isTrainer && viewMode === 'FORMATEUR') ? trainerNavItems : learnerNavItems;

    if (!authorized) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-slate-500 gap-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />
                <span className="w-10 h-10 border-4 border-[#080d1a] border-t-cyan-500 rounded-full animate-spin relative z-10" />
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 relative z-10 animate-pulse">Chargement de votre espace...</p>
            </div>
        );
    }

    // Déterminer le titre et sous-titre de la page selon l'URL et le mode de vue
    const getPageTitleAndSubtitle = () => {
        if (pathname === '/dashboard') {
            return {
                title: `Bonjour, ${userFirstName}`,
                subtitle: viewMode === 'FORMATEUR' ? 'Gérez vos cours, vos apprenants et vos sessions' : 'Suivez vos entraînements et votre progression'
            };
        }
        if (pathname === '/dashboard/certifications') {
            return { title: 'Catalogue des Certifications', subtitle: 'Explorez les certifications et accédez aux fiches de révision' };
        }
        if (pathname === '/dashboard/courses') {
            return { title: 'Gestion de mes Cours', subtitle: 'Créez et organisez vos modules, cours et ressources de formation' };
        }
        if (pathname === '/dashboard/practice') {
            return { title: 'Simulateur d\'Examen', subtitle: 'Entraînement interactif en conditions réelles' };
        }
        if (pathname === '/dashboard/downloads') {
            return { title: 'Bibliothèque de Ressources', subtitle: 'Toutes les ressources téléchargeables de vos cours' };
        }
        if (pathname === '/dashboard/cours') {
            return { title: 'Explorer les Cours', subtitle: 'Découvrez, inscrivez-vous et suivez votre progression' };
        }
        if (pathname === '/dashboard/community') {
            return { title: 'Communauté & Entraide', subtitle: 'Échangez avec les apprenants et posez vos questions d\'examen' };
        }
        if (pathname === '/dashboard/profile') {
            return {
                title: viewMode === 'FORMATEUR' ? 'Mon Profil Formateur' : 'Mon Profil Apprenant',
                subtitle: 'Gérez vos informations personnelles et votre sécurité'
            };
        }
        if (pathname.startsWith('/dashboard/profile/')) {
            return {
                title: 'Profil Utilisateur',
                subtitle: 'Consultez les détails et statistiques de cet utilisateur'
            };
        }
        if (pathname === '/dashboard/settings') {
            return {
                title: 'Paramètres',
                subtitle: 'Notifications, visibilité du profil et préférences système'
            };
        }
        if (pathname === '/dashboard/appointments') {
            return {
                title: viewMode === 'FORMATEUR' ? 'Gestion de mes Créneaux' : 'Rendez-vous & Coaching',
                subtitle: viewMode === 'FORMATEUR' ? 'Créez vos disponibilités et suivez vos rendez-vous pris' : 'Réservez un créneau individuel avec un formateur ou coach certifié'
            };
        }
        return { title: 'Catalogue des Certifications', subtitle: 'Explorez les certifications et accédez aux fiches de révision' };
    };
    const { title, subtitle } = getPageTitleAndSubtitle();

    return (
        <div className="h-screen bg-[#020617] text-slate-300 flex relative overflow-hidden font-sans">

            {/* Arrière-plan Grille Cyber */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/[0.05] rounded-full blur-[130px] pointer-events-none z-0" />


            {/* Sidebar Mobile */}
            <AnimatePresence>
                {isMobile && sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 z-45 bg-slate-900/80"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 bottom-0 left-0 z-50 w-[280px] flex flex-col border-r h-screen transform-gpu will-change-transform bg-[#080d1a] border-slate-800"
                        >
                            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center">
                                        <img src="/logos/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-8 w-auto object-contain" />
                                    </div>
                                </div>
                                <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex-1 py-6 px-4 space-y-2">
                                {navItems.map((item, index) => {
                                    const hasSubItems = !!item.subItems && item.subItems.length > 0;
                                    const isExpanded = expandedMenu === item.name;
                                    const isActive = !hasSubItems && item.href && (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')));
                                    const Icon = item.icon;
                                    
                                    return (
                                        <div key={index} className="space-y-1">
                                            {hasSubItems ? (
                                                <button
                                                    onClick={() => toggleMenu(item.name)}
                                                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                                                        isExpanded
                                                            ? 'bg-blue-950/20 text-cyan-400'
                                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <Icon className={`w-5 h-5 ${isExpanded ? 'text-cyan-500' : 'text-slate-500 group-hover:text-slate-400 transition-colors'}`} />
                                                        <span className="truncate">{item.name}</span>
                                                    </div>
                                                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </button>
                                            ) : (
                                                <Link
                                                    href={item.href || '#'}
                                                    onClick={() => { setSidebarOpen(false); setExpandedMenu(null); }}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold transition-all ${
                                                        isActive 
                                                            ? 'bg-blue-950/30 text-cyan-400 border-l-4 border-blue-600 shadow-2xs'
                                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer'
                                                    }`}
                                                >
                                                    <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-500' : 'text-slate-500 group-hover:text-slate-400 transition-colors'}`} />
                                                    <span>{item.name}</span>
                                                </Link>
                                            )}

                                            {hasSubItems && (
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="pl-4 pr-2 py-1 space-y-1">
                                                                {item.subItems!.map((sub, subIdx) => {
                                                                    const isSubActive = pathname === sub.href;
                                                                    const SubIcon = sub.icon;
                                                                    return (
                                                                        <Link
                                                                            key={subIdx}
                                                                            href={sub.href!}
                                                                            onClick={() => setSidebarOpen(false)}
                                                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                                                                isSubActive
                                                                                    ? 'bg-blue-950/20 text-cyan-400 border-l-4 border-blue-600 shadow-2xs font-extrabold'
                                                                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 cursor-pointer'
                                                                            }`}
                                                                        >
                                                                            <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? 'text-cyan-500' : 'text-slate-500 group-hover:text-slate-400 transition-colors'}`} />
                                                                            <span className="truncate flex-1">{sub.name}</span>
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            )}
                                        </div>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-slate-800 bg-[#080d1a]">
                                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-cyan-400 hover:bg-blue-950/30 hover:text-cyan-300 transition-all cursor-pointer">
                                    <LogOut className="w-5 h-5" />
                                    <span>Déconnexion</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Spacer pour maintenir le layout principal (la sidebar sera fixed et overlay au survol) */}
            {!isMobile && (
                <div className="hidden xl:block w-20 shrink-0" />
            )}

            {/* Sidebar Desktop Collapsible (Udemy style) */}
            {!isMobile && (
                <aside className="hidden xl:flex flex-col fixed left-0 top-0 z-50 h-screen w-20 hover:w-[280px] group overflow-y-auto overflow-x-hidden border-r transition-all duration-300 bg-[#080d1a] border-slate-800">
                    <div className="h-20 flex items-center px-6 border-b border-slate-800">
                        <Link href="/" className="flex items-center cursor-pointer overflow-hidden w-8 group-hover:w-[180px] transition-all duration-300 ease-in-out">
                            <img src="/logos/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-8 w-auto max-w-none object-left object-contain" />
                        </Link>
                    </div>

                    {/* Liens de navigation */}
                    <nav className="flex-1 py-6 px-4 space-y-2">
                        {navItems.map((item, index) => {
                            const hasSubItems = !!item.subItems && item.subItems.length > 0;
                            const isExpanded = expandedMenu === item.name;
                            const isActive = !hasSubItems && item.href && (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')));
                            const isParentActive = hasSubItems && item.subItems!.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'));
                            const Icon = item.icon;

                            return (
                                <div key={index} className="space-y-1">
                                    {hasSubItems ? (
                                        <button
                                            onClick={() => toggleMenu(item.name)}
                                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-extrabold transition-all duration-200 cursor-pointer relative ${
                                                isExpanded
                                                    ? 'bg-blue-950/20 text-cyan-400 shadow-sm'
                                                    : isParentActive 
                                                        ? 'bg-blue-950/10 text-cyan-300 group-hover:bg-transparent group-hover:text-slate-400'
                                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                            }`}
                                        >
                                            {isParentActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full block group-hover:hidden" />}
                                            <div className="flex items-center min-w-0">
                                                <Icon className={`w-6 h-6 shrink-0 mx-auto group-hover:mx-0 ${isExpanded ? 'text-cyan-400' : isParentActive ? 'text-cyan-400 group-hover:text-slate-500' : 'text-slate-500 hover:text-cyan-400 transition-colors'}`} />
                                                <span className="truncate opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-3 transition-all duration-300">{item.name}</span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-all duration-300 ${isExpanded ? 'rotate-180 text-cyan-400' : ''}`} />
                                        </button>
                                    ) : (
                                        <Link
                                            href={item.href || '#'}
                                            onClick={() => setExpandedMenu(null)}
                                            className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-extrabold transition-all duration-200 relative ${isActive
                                                ? 'bg-blue-950/30 text-cyan-400 shadow-2xs shadow-blue-900/10'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer'
                                                }`}
                                        >
                                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />}
                                            <Icon className={`w-6 h-6 shrink-0 mx-auto group-hover:mx-0 ${isActive ? 'text-cyan-500' : 'text-slate-500 hover:text-cyan-400 transition-colors'}`} />
                                            <span className="truncate opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-3 transition-all duration-300">{item.name}</span>
                                        </Link>
                                    )}

                                    {hasSubItems && (
                                        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300">
                                            <div className="overflow-hidden">
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="pl-14 pr-2 py-1 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                {item.subItems!.map((sub, subIdx) => {
                                                                    const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + '/');
                                                                    const SubIcon = sub.icon;
                                                                    return (
                                                                        <Link
                                                                            key={subIdx}
                                                                            href={sub.href!}
                                                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                                                                isSubActive
                                                                                    ? 'bg-blue-950/20 text-cyan-400 border-l-4 border-blue-600 shadow-2xs font-extrabold'
                                                                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 cursor-pointer'
                                                                            }`}
                                                                        >
                                                                            <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? 'text-cyan-500' : 'text-slate-500 hover:text-cyan-400 transition-colors'}`} />
                                                                            <span className="truncate flex-1">{sub.name}</span>
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Déconnexion en bas */}
                    <div className="p-4 border-t transition-colors duration-300 border-slate-800 bg-[#080d1a]">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-bold text-cyan-400 hover:bg-blue-950/30 hover:text-cyan-300 transition-all cursor-pointer"
                        >
                            <LogOut className="w-6 h-6 shrink-0 mx-auto group-hover:mx-0 group-hover:translate-x-0.5 transition-transform" />
                            <span className="truncate opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-3 transition-all duration-300">Déconnexion</span>
                        </button>
                    </div>
                </aside>
            )}

            {/* Contenu principal (h-screen fixe) */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10" style={{ scrollbarGutter: 'stable', overflowAnchor: 'none' }}>

                {/* Header Premium (Sans bouton Hamburger sur PC) */}
                <header className="py-5 md:py-6 border-b bg-[#080d1a] flex items-center justify-between px-8 md:px-12 sticky top-0 z-40 border-slate-800">

                    {/* Gauche : Titre Dynamique (Bouton Hamburger uniquement sur Mobile) */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-3 bg-[#020617] border border-slate-800 hover:border-blue-600 text-slate-400 hover:text-cyan-400 rounded-xl transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center xl:hidden"
                            aria-label="Ouvrir le menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col text-left justify-center">
                            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none mb-2">{title}</h1>
                            <p className="text-xs text-slate-400 font-bold hidden md:block leading-none">{subtitle}</p>
                        </div>
                    </div>

                    {/* Droite : Profil Utilisateur Cliquable & Notifications */}
                    <div className="flex items-center gap-4">
                        {isTrainer && (
                            <button
                                onClick={handleSwitchViewMode}
                                disabled={isSwitching}
                                className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-300 relative group border shrink-0 ${
                                    isSwitching 
                                        ? 'opacity-50 cursor-not-allowed scale-[0.98]' 
                                        : 'cursor-pointer hover:shadow-md'
                                } bg-[#020617] border-blue-600 text-slate-300`}
                                title={viewMode === 'FORMATEUR' ? "Basculer en Espace Apprenant" : "Basculer en Espace Formateur"}
                            >
                                <div className="relative w-5 h-5 flex items-center justify-center bg-[#080d1a] border border-slate-800 rounded-lg shadow-3xs p-0.5 group-hover:scale-110 transition-transform duration-300">
                                    {viewMode === 'FORMATEUR' ? (
                                        <img src="/images/formateur.png" alt="Formateur" className="w-full h-full object-contain brightness-0 invert" />
                                    ) : (
                                        <img src="/images/apprenant.png" alt="Apprenant" className="w-full h-full object-contain brightness-0 invert" />
                                    )}
                                </div>

                                <div className="hidden sm:flex flex-col text-left leading-none">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Espace</span>
                                    <span className="text-[10px] font-black tracking-tight leading-none">
                                        {viewMode === 'FORMATEUR' ? 'Formateur' : 'Apprenant'}
                                    </span>
                                </div>

                                {/* Icône de permutation subtile sur Desktop */}
                                <div className="hidden md:flex items-center text-slate-400 group-hover:text-slate-600 transition-colors ml-0.5">
                                    <svg className="w-3 h-3 transform group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                            </button>
                        )}

                        <NotificationBell />

                        <Link
                            href="/dashboard/profile"
                            className="flex items-center gap-3 p-1.5 hover:bg-slate-800/50 rounded-2xl transition-all cursor-pointer group"
                            title="Voir et modifier mon profil"
                        >
                            <div className="flex flex-col text-right justify-center hidden sm:flex">
                                <span className="text-xs font-black text-white leading-none mb-1 group-hover:text-cyan-400 transition-colors">
                                    {userFirstName} {userLastName}
                                </span>
                                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-wider leading-none">
                                    {viewMode === 'FORMATEUR' ? 'Formateur' : 'Apprenant'}
                                </span>
                            </div>

                            {/* Avatar Stylisé avec photo de profil */}
                            <div className="relative shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-red-900 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                                {userAvatar ? (
                                    <img
                                        src={userAvatar}
                                        alt={`${userFirstName} ${userLastName}`}
                                        className="relative w-10 h-10 rounded-2xl object-cover border border-slate-800 shadow-md transition-transform duration-200 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="relative w-10 h-10 bg-gradient-to-tr from-slate-900 to-[#020617] border border-slate-800 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-md transition-transform duration-200 group-hover:scale-105">
                                        {userFirstName ? userFirstName[0].toUpperCase() : 'U'}
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Contenu principal de la page */}
                <main className="flex-1 p-6 md:p-10">
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    );
}