"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, MessageSquare, ShieldCheck, LogOut, DownloadCloud, Award, Bell, Calendar, FileText, Settings, User, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../../components/NotificationBell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Détection de la taille d'écran
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialisation en thème clair
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');

    // Vérification token
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const adminNavItems = [
      { name: 'Vue Générale', href: '/admin', icon: LayoutDashboard },
      { name: 'Gestion Formations', href: '/admin/certifications', icon: Award },
      { name: 'Ressources & Fiches', href: '/admin/downloads', icon: DownloadCloud },
      { name: 'Modération Forum', href: '/admin/community', icon: MessageSquare },
      { name: 'Planning & Coaching', href: '/admin/coaching', icon: Calendar },
      { name: 'Utilisateurs & Rôles', href: '/admin/users', icon: Users },
    ];

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      const now = Math.floor(Date.now() / 1000);
      if (decodedPayload.exp && decodedPayload.exp < now) {
        throw new Error("Jeton expiré");
      }

      const roles = decodedPayload.roles || [];
      if (!roles.includes('SUPER_ADMIN') && !roles.includes('ADMIN')) {
        throw new Error("Accès refusé - Rôle insuffisant");
      }

      setUserRole(roles.includes('SUPER_ADMIN') ? 'Super Admin' : 'Admin');
      setUserEmail(decodedPayload.email || 'admin@ethicaldata.local');
      setAuthorized(true);
    } catch (error) {
      console.error("Erreur d'authentification :", error);
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    disabled?: boolean;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { name: 'Utilisateurs', href: '/admin', icon: Users },
    { name: 'Certifications', href: '/admin/certifications', icon: Award },
    { name: 'Ressources', href: '/admin/resources', icon: FileText },
    { name: 'Communauté', href: '/admin/community', icon: MessageSquare },
    { name: 'Paramètres', href: '#', icon: Settings, disabled: true },
  ];

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-4">
        <span className="w-10 h-10 border-4 border-red-600/10 border-t-red-600 rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-red-600">Chargement sécurisé...</p>
      </div>
    );
  }

  // Déterminer le titre et sous-titre selon la page courante
  const getPageTitleAndSubtitle = () => {
    if (pathname === '/admin') {
      return { title: 'Utilisateurs', subtitle: 'Gestion des comptes et des rôles d\'accès' };
    }
    if (pathname === '/admin/certifications') {
      return { title: 'Certifications', subtitle: 'Gestion du catalogue d\'examens et questions' };
    }
    return { title: 'Administration', subtitle: 'Console de gestion Ethical Data' };
  };
  const { title, subtitle } = getPageTitleAndSubtitle();

  return (
    <div className="h-screen bg-slate-50 text-slate-800 flex relative overflow-hidden font-sans">

      {/* Arrière-plan texturé clair */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-red-600/[0.01] rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Sidebar mobile */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-[260px] flex flex-col bg-white border-r border-slate-200/80 h-screen shadow-2xl overflow-hidden"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600">
                    <ShieldCheck className="w-5.5 h-5.5" />
                  </div>
                  <span className="font-extrabold text-base text-slate-950 tracking-tight uppercase">
                    EthicalData
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <a
                      key={index}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-250 group relative ${isActive
                        ? 'bg-slate-950 text-white shadow-md'
                        : item.disabled
                          ? 'text-slate-400 cursor-not-allowed opacity-40'
                          : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 cursor-pointer'
                        }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-600 transition-colors'}`} />
                      <span className="truncate flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="text-[9px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full shrink-0 font-extrabold uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
                <div className="flex items-center gap-3 p-2 rounded-xl mb-2 overflow-hidden">
                  <div className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="truncate flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate leading-none mb-1">{userEmail}</p>
                    <p className="text-[9px] text-red-600 font-extrabold uppercase tracking-wider leading-none">{userRole}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer group"
                >
                  <LogOut className="w-5 h-5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
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
          <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center ${sidebarOpen ? 'gap-4 px-4' : 'justify-center px-0'} py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group relative ${isActive
                    ? 'bg-slate-950 text-white shadow-md'
                    : item.disabled
                      ? 'text-slate-400 cursor-not-allowed opacity-40'
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
                  {sidebarOpen && item.badge && (
                    <span className="text-[9px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full shrink-0 font-bold uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Profil & Déconnexion en bas */}
          <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
            <div className={`flex items-center ${sidebarOpen ? 'gap-3 p-2' : 'justify-center p-0'} rounded-xl mb-2 overflow-hidden`}>
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                <User className="w-5.5 h-5.5" />
              </div>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate flex-1 min-w-0"
                >
                  <p className="text-xs font-bold text-slate-900 truncate leading-none mb-1">{userEmail}</p>
                  <p className="text-[9px] text-red-600 font-extrabold uppercase tracking-wider leading-none">{userRole}</p>
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

      {/* Contenu de droite */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">

        {/* Header Premium */}
        {/* Header Premium */}
        <header className="py-5 md:py-6 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 md:px-12 sticky top-0 z-20 transition-all duration-300">

          {/* Gauche : Bouton Sidebar & Titre Dynamique */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 bg-slate-50 border border-slate-200 hover:border-red-600 hover:bg-red-50/30 text-slate-600 hover:text-red-600 rounded-xl transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center"
              title={sidebarOpen ? "Réduire le menu" : "Agrandir le menu"}
            >
              {sidebarOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>

            <div className="flex flex-col text-left justify-center">
              <h1 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight leading-none mb-2">{title}</h1>
              <p className="text-xs text-slate-400 font-bold hidden md:block leading-none">{subtitle}</p>
            </div>
          </div>

          {/* Droite : Profil Utilisateur & Notifications */}
          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="flex flex-col text-right justify-center hidden sm:flex">
              <span className="text-sm font-bold text-slate-900 leading-none mb-1.5">{userEmail}</span>
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none">{userRole}</span>
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

        <main className="flex-1 p-4 md:p-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}