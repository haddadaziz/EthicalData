"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Award, Settings, LogOut, ShieldCheck, Menu, X, User, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialisation du thème et authentification
  useEffect(() => {
    // 1. Gestion du thème
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Vérification token
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
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-4">
        <span className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Chargement sécurisé...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex relative overflow-hidden font-sans transition-colors duration-300">

      {/* Halos lumineux d'ambiance d'arrière-plan */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-indigo-950/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 dark:bg-purple-950/15 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Sidebar - Menu de navigation à gauche */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-slate-50/90 dark:bg-slate-900/80 backdrop-blur-md border-r border-slate-200 dark:border-slate-800/80 relative z-10 shrink-0 h-screen transition-colors duration-300"
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight shrink-0"
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
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 group relative ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                  : item.disabled
                    ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 cursor-pointer'
                  }`}
              >
                <Icon className={`w-5.5 h-5.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors'}`} />
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
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full shrink-0 font-bold uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-950/5 dark:bg-slate-950/20">
          <div className="flex items-center gap-3 p-2 rounded-xl mb-2 overflow-hidden">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/80 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <User className="w-5.5 h-5.5" />
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="truncate flex-1 min-w-0"
              >
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate leading-none mb-1">{userEmail}</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider leading-none">{userRole}</p>
              </motion.div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 transition-all cursor-pointer group`}
          >
            <LogOut className="w-5.5 h-5.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </motion.aside>

      {/* Contenu de droite */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto relative z-10">

        {/* Header avec switch de Thème */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20 transition-colors duration-300">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4">
            {/* Bouton de bascule Mode Sombre / Mode Clair */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl cursor-pointer transition-colors"
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-bold text-slate-800 dark:text-white">{userEmail}</span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{userRole}</span>
            </div>
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center text-indigo-500 dark:text-indigo-400 font-bold">
              {userEmail.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}