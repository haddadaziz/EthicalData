"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import { Users, Award, MessageSquare, Calendar, ArrowUpRight, BookOpen } from '@/components/icons';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<any>({
        totalUsers: 0,
        activeUsers: 0,
        totalCerts: 0,
        totalCours: 0,
        totalSujets: 0,
        totalRdv: 0,
    });
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAdminData = async () => {
        setLoading(true);
        try {
            const [usersData, certsData, coursData, rdvData] = await Promise.all([
                apiFetch('/users'),
                apiFetch('/certifications'),
                apiFetch('/cours'),
                apiFetch('/appointments/all'),
            ]);

            setStats({
                totalUsers: usersData.length,
                activeUsers: usersData.filter((u: any) => u.statut === 'ACTIF').length,
                totalCerts: certsData.length,
                totalCours: coursData.length,
                totalRdv: rdvData.length,
            });

            setRecentUsers(usersData.slice(0, 6));
        } catch (err: any) {
            console.error("Erreur chargement stats admin:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdminData();
    }, []);

    if (loading) {
        return (
            <div className="p-16 text-center text-slate-400 bg-[#080d1a] border border-slate-800 rounded-3xl max-w-5xl mx-auto">
                <span className="w-10 h-10 border-4 border-blue-800/50 border-t-cyan-400 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Chargement de la console d'administration...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto text-left pt-6 bg-[#020617]">

            {/* CARTES KPI PRINCIPALES (GRID RESPONSIVE) */}
            <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Statistiques Globales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Utilisateurs Totaux */}
                <div className="p-6 bg-[#080d1a] border border-slate-800 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateurs Inscrits</span>
                        <div className="w-9 h-9 rounded-2xl bg-blue-950/30 text-cyan-400 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-white">{stats.totalUsers}</span>
                        <p className="text-[11px] text-emerald-400 font-bold mt-1">{stats.activeUsers} comptes actifs</p>
                    </div>
                </div>

                {/* Certifications */}
                <div className="p-6 bg-[#080d1a] border border-slate-800 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certifications actives</span>
                        <div className="w-9 h-9 rounded-2xl bg-amber-950/30 text-amber-400 flex items-center justify-center">
                            <Award className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-white">{stats.totalCerts}</span>
                        <p className="text-[11px] text-slate-400 font-bold mt-1">Microsoft, AWS, GCP, Cisco</p>
                    </div>
                </div>

                {/* Cours sur la plateforme */}
                <div className="p-6 bg-[#080d1a] border border-slate-800 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cours sur la plateforme</span>
                        <div className="w-9 h-9 rounded-2xl bg-emerald-950/30 text-emerald-400 flex items-center justify-center">
                            <BookOpen className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-white">{stats.totalCours}</span>
                        <p className="text-[11px] text-slate-400 font-bold mt-1">Vidéos & Modules</p>
                    </div>
                </div>

                {/* Rendez-vous Coaching */}
                <div className="p-6 bg-[#080d1a] border border-slate-800 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rendez-vous Plannifiés</span>
                        <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-white">{stats.totalRdv}</span>
                        <p className="text-[11px] text-purple-600 font-bold mt-1">Séances individuelles</p>
                    </div>
                </div>
                </div>
            </div>

            {/* CARTES ACCÈS RAPIDE PAR RUBRIQUE (RESPONSIVE CARDS) */}
            <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Modules d'Administration</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Carte 1: Gestion Utilisateurs */}
                    <a
                        href="/admin/users"
                        className="p-6 bg-[#080d1a] border border-slate-800 rounded-3xl space-y-3 hover:border-slate-700 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-blue-950/30 text-cyan-400 flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">Utilisateurs & Rôles</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">Modération, attribution de rôles Formateurs / Admins et statuts.</p>
                        </div>
                    </a>

                    {/* Carte 2: Gestion Formations */}
                    <a
                        href="/admin/certifications"
                        className="p-6 bg-[#080d1a] border border-slate-800 rounded-3xl space-y-3 hover:border-slate-700 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-amber-950/30 text-amber-400 flex items-center justify-center">
                                <Award className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">Catalogue Certifications</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">Ajout d'examens, questions QCM et cas pratiques par domaine.</p>
                        </div>
                    </a>

                    {/* Carte 3: Forum & Modération */}
                    <a
                        href="/admin/community"
                        className="p-6 bg-[#080d1a] border border-slate-800 rounded-3xl space-y-3 hover:border-slate-700 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-rose-950/30 text-rose-400 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">Modération Forum</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">Traitement des signalements et surveillance des discussions.</p>
                        </div>
                    </a>

                    {/* Carte 4: Planning & Coaching */}
                    <a
                        href="/admin/coaching"
                        className="p-6 bg-[#080d1a] border border-slate-800 rounded-3xl space-y-3 hover:border-slate-700 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">Planning & Coaching</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">Ouverture de créneaux horaire et suivi des séances attribuées.</p>
                        </div>
                    </a>
                </div>
            </div>

            {/* SECTION DERNIERS UTILISATEURS INSCRIOTS */}
            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                        <h3 className="text-base font-black text-white">Derniers Inscrits</h3>
                        <p className="text-xs text-slate-400 font-medium">Les plus récents candidats ayant rejoint la plateforme.</p>
                    </div>
                    <a
                        href="/admin/users"
                        className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 self-end sm:self-auto shadow-sm"
                    >
                        <span>Voir tous les utilisateurs</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentUsers.map((user) => (
                        <div key={user.id} onClick={() => router.push(`/dashboard/profile/${user.id}`)} className="p-4 bg-[#020617] border border-slate-800 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-800/50 hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-3">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={`${user.prenom} ${user.nom}`} className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm" />
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-slate-950 text-white font-black text-xs flex items-center justify-center shrink-0">
                                        {user.prenom[0]}{user.nom[0]}
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-xs font-black text-white">{user.prenom} {user.nom}</h4>
                                    <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{user.email}</p>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-950/30 text-emerald-300 font-extrabold text-[9px] rounded-full uppercase">
                                {user.statut}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
