"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, Award, Settings, LogOut, ShieldCheck, Menu, X, User, DownloadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      // On extrait le prénom s'il est présent dans le JWT, sinon on utilise le début de l'email
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
    { name: 'Entraînement', href: '/dashboard/practice', icon: Award },
    { name: 'Mes Fiches & Cours', href: '/dashboard/downloads', icon: DownloadCloud },
  ];

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 gap-4">
        <span className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-red-600">Chargement de votre espace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex relative overflow-hidden font-sans">
      
      {/* Halos d'arrière-plan */}
      <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-red-500/2 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] bg-purple-550/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-50/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-[260px] flex flex-col bg-white backdrop-blur-xl border-r border-slate-200/80 h-screen"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600">
                    <ShieldCheck className="w-5.5 h-5.5" />
                  </div>
                  <span className="font-extrabold text-base text-slate-950 tracking-tight">EthicalData</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
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
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-slate-950 text-white shadow-md' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'}`}
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
                    <p className="text-xs font-bold text-slate-950 truncate">{userFirstName}</p>
                    <p className="text-[9px] text-red-600 font-extrabold uppercase tracking-wider">Candidat</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-400">
                  <LogOut className="w-5 h-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      {!isMobile && (
        <aside className="w-[260px] flex flex-col bg-white shadow-sm backdrop-blur-xl border-r border-slate-200/80 shrink-0 h-screen z-10">
          <div className="h-20 flex items-center px-6 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-base text-slate-950 tracking-tight">EthicalData</span>
            </div>
          </div>

          <nav className="flex-1 py-6 px-4 space-y-2">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${isActive ? 'bg-slate-950 text-white shadow-md' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50/60'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200/80 bg-slate-50/40">
            <div className="flex items-center gap-3 p-2 rounded-xl mb-2">
              <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600">
                <User className="w-5 h-5" />
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-bold text-slate-950 truncate">{userFirstName}</p>
                <p className="text-[9px] text-red-600 font-extrabold uppercase tracking-wider">Candidat</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-500">
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto relative z-10">
        <header className="h-20 border-b border-slate-200/80 bg-white/70 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-950 rounded-xl md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:block text-left">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Espace Apprenant</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-950">{userEmail}</span>
            <div className="w-9 h-9 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
              {userEmail.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}