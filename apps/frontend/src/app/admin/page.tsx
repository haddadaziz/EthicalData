"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Users, Award, DownloadCloud, MessageSquare, Calendar, ShieldCheck, ArrowUpRight, Plus, Activity, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>({
        totalUsers: 0,
        activeUsers: 0,
        totalCerts: 0,
        totalDownloads: 0,
        totalSujets: 0,
        totalRdv: 0,
    });
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAdminData = async () => {
        setLoading(true);
        try {
            const [usersData, certsData, resourcesData, rdvData] = await Promise.all([
                apiFetch('/users'),
                apiFetch('/certifications'),
                apiFetch('/resources'),
                apiFetch('/appointments/mes-rdv'),
            ]);

            setStats({
                totalUsers: usersData.length,
                activeUsers: usersData.filter((u: any) => u.statut === 'ACTIF').length,
                totalCerts: certsData.length,
                totalDownloads: resourcesData.length,
                totalRdv: rdvData.length,
            });

            setRecentUsers(usersData.slice(0, 5));
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
            <div className="p-16 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl max-w-5xl mx-auto">
                <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement de la console d'administration...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto text-left">

            {/* EN-TÊTE DU DASHBOARD ADMIN */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-2 relative z-10">
                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 font-extrabold text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1.5 w-max">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Console Super Admin & Direction
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                        Vue Générale de la Plateforme
                    </h1>
                    <p className="text-xs text-slate-400 font-medium max-w-xl">
                        Supervisez l'activité globale, la communauté, les certifications et la gestion des créneaux en temps réel.
                    </p>
                </div>

                <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
                    <a
                        href="/admin/certifications"
                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer w-full md:w-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nouvelle Certification</span>
                    </a>
                </div>
            </div>

            {/* CARTES KPI PRINCIPALES (GRID RESPONSIVE) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Utilisateurs Totaux */}
                <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateurs Inscrits</span>
                        <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-slate-950">{stats.totalUsers}</span>
                        <p className="text-[11px] text-emerald-600 font-bold mt-1">{stats.activeUsers} comptes actifs</p>
                    </div>
                </div>

                {/* Certifications */}
                <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certifications actives</span>
                        <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Award className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-slate-950">{stats.totalCerts}</span>
                        <p className="text-[11px] text-slate-500 font-bold mt-1">Microsoft, AWS, GCP, Cisco</p>
                    </div>
                </div>

                {/* Ressources Téléchargeables */}
                <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ressources & Fiches</span>
                        <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <DownloadCloud className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-slate-950">{stats.totalDownloads}</span>
                        <p className="text-[11px] text-slate-500 font-bold mt-1">PDF, Slides & Datasets</p>
                    </div>
                </div>

                {/* Rendez-vous Coaching */}
                <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rendez-vous Plannifiés</span>
                        <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-black text-slate-950">{stats.totalRdv}</span>
                        <p className="text-[11px] text-purple-600 font-bold mt-1">Séances individuelles</p>
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
                        className="p-6 bg-white border border-slate-200/90 rounded-3xl space-y-3 hover:border-slate-350 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-950 transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-950 group-hover:text-blue-600 transition-colors">Utilisateurs & Rôles</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Modération, attribution de rôles Formateurs / Admins et statuts.</p>
                        </div>
                    </a>

                    {/* Carte 2: Gestion Formations */}
                    <a
                        href="/admin/certifications"
                        className="p-6 bg-white border border-slate-200/90 rounded-3xl space-y-3 hover:border-slate-350 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Award className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-950 transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-950 group-hover:text-blue-600 transition-colors">Catalogue Certifications</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Ajout d'examens, questions QCM et cas pratiques par domaine.</p>
                        </div>
                    </a>

                    {/* Carte 3: Forum & Modération */}
                    <a
                        href="/admin/community"
                        className="p-6 bg-white border border-slate-200/90 rounded-3xl space-y-3 hover:border-slate-350 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-950 transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-950 group-hover:text-blue-600 transition-colors">Modération Forum</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Traitement des signalements et surveillance des discussions.</p>
                        </div>
                    </a>

                    {/* Carte 4: Planning & Coaching */}
                    <a
                        href="/admin/coaching"
                        className="p-6 bg-white border border-slate-200/90 rounded-3xl space-y-3 hover:border-slate-350 hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-950 transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-950 group-hover:text-blue-600 transition-colors">Planning & Coaching</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Ouverture de créneaux horaire et suivi des séances attribuées.</p>
                        </div>
                    </a>
                </div>
            </div>

            {/* SECTION DERNIERS UTILISATEURS INSCRIOTS */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-base font-black text-slate-950">Derniers Inscrits</h3>
                        <p className="text-xs text-slate-500 font-medium">Les plus récents candidats ayant rejoint la plateforme.</p>
                    </div>
                    <a href="/admin/users" className="text-xs font-extrabold text-blue-600 hover:underline">
                        Voir tous les utilisateurs →
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentUsers.map((user) => (
                        <div key={user.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-950 text-white font-black text-xs flex items-center justify-center shrink-0">
                                    {user.prenom[0]}{user.nom[0]}
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-950">{user.prenom} {user.nom}</h4>
                                    <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{user.email}</p>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-extrabold text-[9px] rounded-full uppercase">
                                {user.statut}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}