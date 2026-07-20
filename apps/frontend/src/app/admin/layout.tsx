"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '../../context/ToastContext';
import { LayoutDashboard, Users, BookOpen, MessageSquare, ShieldCheck, LogOut, DownloadCloud, Award, Bell, Calendar, FileText, Settings, User, X, Menu, Activity, ChevronDown } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../../components/NotificationBell';
import ErrorBoundary from '../../components/ErrorBoundary';
import { apiFetch } from '../../lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { showToast } = useToast();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userFirstName, setUserFirstName] = useState<string>('');
  const [userLastName, setUserLastName] = useState<string>('');
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleMenu = (name: string) => {
    setExpandedMenu((prev) => (prev === name ? null : name));
  };

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
    apiFetch('/users/me/profile')
      .then((profile: any) => {
        if (!profile) { router.push('/login'); return; }
        setUserEmail(profile.email);
        setUserFirstName(profile.prenom);
        setUserLastName(profile.nom);
        setUserName(`${profile.prenom || ''} ${profile.nom || ''}`.trim());
        setUserAvatar(profile.avatar || null);
        if (profile.roles) {
          const roles = profile.roles.map((r: any) => r.nom);
          const isAdmin = roles.includes('SUPER_ADMIN') || roles.includes('ADMIN');
          if (!isAdmin) { router.push('/dashboard'); return; }
          setUserRoles(roles);
          setUserRole(roles.includes('SUPER_ADMIN') ? 'Super Admin' : 'Admin');
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

  interface NavItem {
    name: string;
    href?: string;
    icon: React.ComponentType<any>;
    disabled?: boolean;
    badge?: string;
    subItems?: NavItem[];
  }

  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  const navItems: NavItem[] = [
    { name: 'Tableau de Bord', href: '/admin', icon: LayoutDashboard },
    {
      name: 'Gestion des Contenus',
      icon: FileText,
      subItems: [
        { name: 'Certifications', href: '/admin/certifications', icon: Award },
        { name: 'Gestion des Cours', href: '/admin/courses', icon: BookOpen },
        { name: 'Ressources', href: '/admin/resources', icon: DownloadCloud },
        { name: 'Historique Téléchargements', href: '/admin/downloads', icon: DownloadCloud },
        { name: 'Simulations', href: '/admin/simulations', icon: Activity },
      ]
    },
    {
      name: 'Communauté & Coaching',
      icon: Users,
      subItems: [
        { name: 'Modération Forum', href: '/admin/community', icon: MessageSquare },
        { name: 'Coaching', href: '/admin/coaching', icon: Calendar },
      ]
    },
    {
      name: 'Administration Système',
      icon: Settings,
      subItems: [
        { name: 'Utilisateurs & Rôles', href: '/admin/users', icon: ShieldCheck },
        { name: 'Santé Système', href: '/admin/health', icon: Activity },
        ...(isSuperAdmin ? [{ name: 'Configuration Système', href: '/admin/system', icon: Settings }] : []),
      ]
    },
    { name: 'Mon Profil', href: '/admin/profile', icon: User },
    { name: 'Paramètres', href: '/admin/settings', icon: Settings },
  ];

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-slate-500 gap-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />
        <span className="w-10 h-10 border-4 border-[#080d1a] border-t-cyan-500 rounded-full animate-spin relative z-10" />
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 relative z-10 animate-pulse">Chargement sécurisé...</p>
      </div>
    );
  }

  const getPageTitleAndSubtitle = () => {
    if (pathname === '/admin') {
      return { title: 'Tableau de Bord Général', subtitle: 'Console de supervision Ethical Data' };
    }
    if (pathname === '/admin/certifications') {
      return { title: 'Gestion des Certifications', subtitle: 'Catalogue des certifications et constructeurs' };
    }
    if (pathname === '/admin/courses') {
      return { title: 'Gestion des Cours', subtitle: 'Catalogue global de cours de la plateforme' };
    }
    if (pathname === '/admin/downloads') {
        return { title: 'Historique des Téléchargements', subtitle: 'Suivi de tous les téléchargements effectués sur la plateforme' };
    }
    if (pathname === '/admin/resources') {
      return { title: 'Ressources', subtitle: 'Supports de cours, documentations et fichiers pédagogiques' };
    }
    if (pathname === '/admin/simulations') {
      return { title: 'Gestion des Simulations', subtitle: 'Création et gestion des examens blancs et simulations' };
    }
    if (pathname === '/admin/community') {
      return { title: 'Modération du Forum', subtitle: 'Gestion des sujets et des signalements' };
    }
    if (pathname === '/admin/coaching') {
      return { title: 'Coaching', subtitle: 'Ouverture des créneaux et rendez-vous' };
    }
    if (pathname === '/admin/users') {
      return { title: 'Gestion des Utilisateurs', subtitle: 'Administration des comptes et attribution des rôles' };
    }
    if (pathname === '/admin/health') {
      return { title: 'Santé & Monitoring Système', subtitle: 'Surveillance des performances serveur, BDD et RAM' };
    }
    if (pathname === '/admin/profile') {
      return { title: 'Mon Profil Administrateur', subtitle: 'Gestion de vos informations personnelles et sécurité' };
    }
    if (pathname === '/admin/settings') {
      return { title: 'Paramètres', subtitle: 'Notifications, visibilité du profil et préférences système' };
    }
    if (pathname === '/admin/system') {
      return { title: 'Configuration Système', subtitle: 'Gérez les paramètres globaux, la sécurité, l\'IA et les intégrations' };
    }
    return { title: 'Administration', subtitle: 'Ethical Data' };
  };
  const { title, subtitle } = getPageTitleAndSubtitle();

  return (
    <div className="h-screen bg-[#020617] text-slate-300 flex relative overflow-hidden font-sans">

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/[0.05] rounded-full blur-[130px] pointer-events-none z-0" />

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
              className="fixed top-0 bottom-0 left-0 z-50 w-[280px] flex flex-col bg-[#080d1a] border-r border-slate-800 h-screen shadow-2xl overflow-hidden transform-gpu will-change-transform"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center">
                    <img src="/logos/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-8 w-auto object-contain" />
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-6 px-4 space-y-2">
                {navItems.map((item, index) => {
                  const hasSubItems = !!item.subItems && item.subItems.length > 0;
                  const isExpanded = expandedMenu === item.name;
                  const isActive = !hasSubItems && item.href && pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <div key={index} className="space-y-1">
                      {hasSubItems ? (
                        <button
                          onClick={() => toggleMenu(item.name)}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-extrabold transition-all duration-250 group relative cursor-pointer ${
                            isExpanded ? 'bg-blue-950/20 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className={`w-5 h-5 shrink-0 ${isExpanded ? 'text-cyan-500' : 'text-slate-500'}`} />
                            <span className="truncate">{item.name}</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-cyan-400' : ''}`} />
                        </button>
                      ) : (
                        <Link
                          href={item.href || '#'}
                          onClick={() => { setSidebarOpen(false); setExpandedMenu(null); }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold transition-all duration-250 group relative ${isActive
                            ? 'bg-blue-950/30 text-cyan-400 border-l-4 border-blue-600 shadow-2xs'
                            : item.disabled
                              ? 'text-slate-400 cursor-not-allowed opacity-40'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer'
                            }`}
                        >
                          <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-500' : 'text-slate-500'}`} />
                          <span className="truncate flex-1">{item.name}</span>
                          {item.badge && (
                            <span className="text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full shrink-0 font-extrabold uppercase tracking-wider">
                              {item.badge}
                            </span>
                          )}
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
                                  return sub.disabled ? (
                                    <span
                                      key={subIdx}
                                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all group opacity-40 cursor-not-allowed"
                                    >
                                      <SubIcon className="w-4 h-4 shrink-0 text-slate-500" />
                                      <span className="truncate flex-1">{sub.name}</span>
                                      {sub.badge && (
                                        <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full shrink-0 font-extrabold uppercase tracking-wider">
                                          {sub.badge}
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    <Link
                                      key={subIdx}
                                      href={sub.href!}
                                      onClick={() => { setSidebarOpen(false); setExpandedMenu(null); }}
                                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all group ${isSubActive
                                          ? 'bg-blue-950/20 text-cyan-400 border-l-4 border-blue-600 shadow-2xs font-extrabold'
                                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 cursor-pointer'
                                        }`}
                                    >
                                      <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? 'text-cyan-500' : 'text-slate-500'}`} />
                                      <span className="truncate flex-1">{sub.name}</span>
                                      {sub.badge && (
                                        <span className="text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full shrink-0 font-extrabold uppercase tracking-wider">
                                          {sub.badge}
                                        </span>
                                      )}
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
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-cyan-400 hover:bg-blue-950/30 hover:text-cyan-300 transition-all cursor-pointer group"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {!isMobile && (
        <div className="hidden xl:block w-20 shrink-0" />
      )}

      {!isMobile && (
        <aside className="hidden xl:flex flex-col fixed left-0 top-0 z-50 h-screen w-20 hover:w-[280px] group overflow-y-auto overflow-x-hidden border-r transition-all duration-300 bg-[#080d1a] border-slate-800">
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <Link href="/" className="flex items-center cursor-pointer overflow-hidden w-8 group-hover:w-[180px] transition-all duration-300 ease-in-out">
              <img src="/logos/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-8 w-auto max-w-none object-left object-contain" />
            </Link>
          </div>

          <nav className="flex-1 py-6 px-4 space-y-2">
            {navItems.map((item, index) => {
              const hasSubItems = !!item.subItems && item.subItems.length > 0;
              const isExpanded = expandedMenu === item.name;
              const isActive = !hasSubItems && item.href && pathname === item.href;
              const isParentActive = hasSubItems && item.subItems!.some(sub => pathname === sub.href);
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
                        : item.disabled
                          ? 'text-slate-400 cursor-not-allowed opacity-40'
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
                                  const isSubActive = pathname === sub.href;
                                  const SubIcon = sub.icon;
                                  return sub.disabled ? (
                                    <span
                                      key={subIdx}
                                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all group opacity-40 cursor-not-allowed"
                                    >
                                      <SubIcon className="w-4 h-4 shrink-0 text-slate-500" />
                                      <span className="truncate flex-1">{sub.name}</span>
                                      {sub.badge && (
                                        <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full shrink-0 font-extrabold uppercase tracking-wider">
                                          {sub.badge}
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    <Link
                                      key={subIdx}
                                      href={sub.href!}
                                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${isSubActive
                                          ? 'bg-blue-950/20 text-cyan-400 border-l-4 border-blue-600 shadow-2xs font-extrabold'
                                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 cursor-pointer'
                                        }`}
                                    >
                                      <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? 'text-cyan-500' : 'text-slate-500 hover:text-cyan-400 transition-colors'}`} />
                                      <span className="truncate flex-1">{sub.name}</span>
                                      {sub.badge && (
                                        <span className="text-[9px] bg-cyan-950/40 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full shrink-0 font-extrabold uppercase tracking-wider">
                                          {sub.badge}
                                        </span>
                                      )}
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

          <div className="p-4 border-t transition-colors duration-300 border-slate-800 bg-[#080d1a]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-bold text-cyan-400 hover:bg-blue-950/30 hover:text-cyan-300 transition-all cursor-pointer"
            >
              <LogOut className="w-6 h-6 shrink-0 mx-auto group-hover:mx-0" />
              <span className="truncate opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-3 transition-all duration-300">Déconnexion</span>
            </button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">

        <header className="py-5 md:py-6 border-b bg-[#080d1a]/80 backdrop-blur-xl flex items-center justify-between px-8 md:px-12 sticky top-0 z-40 transition-all duration-300 border-slate-800">

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

          <div className="flex items-center gap-4">
            <NotificationBell />

            <Link
              href="/admin/profile"
              className="flex items-center gap-3 p-1.5 hover:bg-slate-800/50 rounded-2xl transition-all cursor-pointer group"
              title="Voir et modifier mon profil"
            >
              <div className="flex flex-col text-right justify-center hidden sm:flex">
                <span className="text-xs font-black text-white leading-none mb-1 group-hover:text-cyan-400 transition-colors">
                  {userName || userEmail.split('@')[0]}
                </span>
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-wider leading-none">
                  {userRole}
                </span>
              </div>

              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-red-900 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                {userAvatar ? (
                  <img src={userAvatar} alt="Admin Profile" className="relative w-10 h-10 rounded-2xl object-cover border border-slate-800 shadow-md transition-transform duration-200 group-hover:scale-105" />
                ) : (
                  <div className="relative w-10 h-10 bg-gradient-to-tr from-slate-900 to-[#020617] border border-slate-800 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-md transition-transform duration-200 group-hover:scale-105">
                    {userFirstName ? userFirstName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 relative">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
