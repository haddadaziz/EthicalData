"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Users, Award, Settings, LogOut, ShieldCheck, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Détection de la taille d'écran et écoute des changements
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

  // Initialisation forcée en thème sombre et authentification
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');

    // Vérification token
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
    { name: 'Paramètres', href: '#', icon: Settings, disabled: true },
  ];

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <span className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Chargement sécurisé...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-hidden font-sans">

      {/* Halos lumineux d'ambiance d'arrière-plan */}
      <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-indigo-550/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] bg-purple-550/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Sidebar mobile avec overlay de fond */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-[260px] flex flex-col bg-slate-900/90 backdrop-blur-xl border-r border-slate-900 h-screen"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                    <ShieldCheck className="w-5.5 h-5.5" />
                  </div>
                  <span className="font-extrabold text-base text-white tracking-tight">
                    EthicalData
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 cursor-pointer"
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
                        ? 'bg-white text-slate-950 shadow-lg'
                        : item.disabled
                          ? 'text-slate-650 cursor-not-allowed opacity-40'
                          : 'text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer'
                        }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-500 group-hover:text-indigo-400 transition-colors'}`} />
                      <span className="truncate flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="text-[9px] bg-slate-800 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full shrink-0 font-extrabold uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-900 bg-slate-950/40">
                <div className="flex items-center gap-3 p-2 rounded-xl mb-2 overflow-hidden">
                  <div className="w-9 h-9 bg-slate-800 border border-slate-700/80 rounded-xl flex items-center justify-center text-slate-300 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="truncate flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-none mb-1">{userEmail}</p>
                    <p className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-wider leading-none">{userRole}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer group"
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
          className="hidden md:flex flex-col bg-slate-900/20 backdrop-blur-xl border-r border-slate-900 relative z-10 shrink-0 h-screen"
        >
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-900">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-extrabold text-base text-white tracking-tight shrink-0"
                >
                  EthicalData
                </motion.span>
              )}
            </div>
          </div>

          <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 group relative ${isActive
                    ? 'bg-white text-slate-950 shadow-lg shadow-white/5'
                    : item.disabled
                      ? 'text-slate-650 cursor-not-allowed opacity-40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60 cursor-pointer'
                    }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-500 group-hover:text-indigo-400 transition-colors'}`} />
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
                    <span className="text-[9px] bg-slate-800 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full shrink-0 font-bold uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-900 bg-slate-950/40">
            <div className="flex items-center gap-3 p-2 rounded-xl mb-2 overflow-hidden">
              <div className="w-10 h-10 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                <User className="w-5.5 h-5.5" />
              </div>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate flex-1 min-w-0"
                >
                  <p className="text-xs font-bold text-white truncate leading-none mb-1">{userEmail}</p>
                  <p className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-wider leading-none">{userRole}</p>
                </motion.div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-rose-450 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer group`}
            >
              <LogOut className="w-5.5 h-5.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              {sidebarOpen && <span>Déconnexion</span>}
            </button>
          </div>
        </motion.aside>
      )}

      {/* Contenu de droite */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto relative z-10">

        {/* Header (Fini les boutons de Thème, uniquement mode sombre) */}
        <header className="h-20 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-xl cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-bold text-white">{userEmail}</span>
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">{userRole}</span>
            </div>
            <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold">
              {userEmail.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-10 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}