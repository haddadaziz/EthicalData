"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Award, Clock, BookOpen, ChevronRight, Play, CheckCircle2, Calendar, Video, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
    const [certs, setCerts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ totalAttempts: 0, averageScore: 0, readinessScore: 0, readinessLabel: 'NON_PRET', history: [] });
    const [upcomingRdv, setUpcomingRdv] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('Étudiant');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payloadBase64 = token.split('.')[1];
                const decodedPayload = JSON.parse(atob(payloadBase64));
                setFirstName(decodedPayload.prenom || decodedPayload.email?.split('@')[0] || 'Candidat');
            } catch (e) {
                console.error(e);
            }
        }

        const loadDashboardData = async () => {
            try {
                const [certsData, statsData, rdvData] = await Promise.all([
                    apiFetch('/certifications'),
                    apiFetch('/simulations/me/stats'),
                    apiFetch('/appointments/mes-rdv'),
                ]);
                setCerts(certsData);
                setStats(statsData);
                
                // Filtrer les RDV confirmés à venir
                const now = new Date();
                const upcoming = rdvData.filter((r: any) => r.statut === 'CONFIRME' && new Date(r.creneau.dateDebut) >= now);
                setUpcomingRdv(upcoming);
            } catch (err) {
                console.error("Erreur de chargement du tableau de bord:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const getLevelBadgeStyle = (niv: string) => {
        switch (niv) {
            case 'AVANCE':
                return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
            case 'INTERMEDIAIRE':
                return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            case 'DEBUTANT':
            default:
                return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-10 text-slate-800 text-left">

            {/* EN-TÊTE BONJOUR */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight">Bonjour, {firstName} 👋</h1>
                    <p className="text-slate-600 text-xs mt-1.5 font-semibold uppercase tracking-wider">
                        Suivez vos entraînements, votre éligibilité IA et vos rendez-vous de coaching.
                    </p>
                </div>
            </div>

            {/* GRID DES STATISTIQUES DYNAMIQUES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* READINESS SCORE MOYEN IA */}
                <div className="bg-white shadow-sm border border-slate-200/80 rounded-3xl p-6 flex items-center justify-between min-h-[160px] transition-all hover:shadow-md">
                    <div className="space-y-2 text-left">
                        <div className="flex items-center gap-1.5 text-red-600 font-extrabold text-[10px] uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Readiness Score IA</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-950">
                            {stats.readinessScore >= 80 ? 'Prêt pour l\'examen' : stats.readinessScore >= 65 ? 'Presque Prêt' : 'En préparation'}
                        </h3>
                        <p className="text-xs text-slate-550 font-semibold">Seuil d'éligibilité conseillé : 80%</p>
                    </div>

                    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                        <svg className="absolute w-full h-full -rotate-90">
                            <circle cx="48" cy="48" r="38" className="stroke-slate-100 fill-none" strokeWidth="6" />
                            <motion.circle
                                cx="48"
                                cy="48"
                                r="38"
                                className={`fill-none ${stats.readinessScore >= 80 ? 'stroke-emerald-500' : stats.readinessScore >= 65 ? 'stroke-amber-500' : 'stroke-red-650'}`}
                                strokeWidth="6"
                                strokeDasharray={2 * Math.PI * 38}
                                initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - (stats.readinessScore || 0) / 100) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="text-center z-10">
                            <span className="text-xl font-black text-slate-950">{stats.readinessScore || 0}%</span>
                        </div>
                    </div>
                </div>

                {/* SIMULATIONS COMPLÉTÉES */}
                <div className="bg-white shadow-sm border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between min-h-[160px] transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Simulations Complétées</p>
                        <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                            <BookOpen className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="space-y-1 text-left">
                        <h3 className="text-3xl font-black text-slate-950">{stats.totalAttempts}</h3>
                        <p className="text-xs text-slate-500 font-bold">Examens blancs passés en conditions réelles</p>
                    </div>
                </div>

                {/* FORMATIONS DU CATALOGUE */}
                <div className="bg-white shadow-sm border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between min-h-[160px] transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Formations du Catalogue</p>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="space-y-1 text-left">
                        <h3 className="text-3xl font-black text-slate-950">{certs.length}</h3>
                        <p className="text-xs text-slate-500 font-bold">Certifications professionnelles prêtes à réviser</p>
                    </div>
                </div>

            </div>

            {/* CATALOGUE ET COLONNE DROITE */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Catalogue d'Entraînement</h2>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="h-44 bg-white border border-slate-200/80 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : certs.length === 0 ? (
                        <div className="p-8 text-center bg-white border border-slate-200/80 rounded-3xl text-slate-500 font-semibold">
                            Aucune certification disponible.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {certs.map((cert) => {
                                const certAttempts = stats.history ? stats.history.filter((h: any) => h.certificationSlug === cert.slug) : [];
                                const hasTaken = certAttempts.length > 0;
                                const bestScore = hasTaken ? Math.max(...certAttempts.map((h: any) => h.score)) : 0;

                                return (
                                    <div
                                        key={cert.id}
                                        className="bg-white border border-slate-200/80 hover:border-slate-350 hover:shadow-md rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between transition-all duration-300 group"
                                    >
                                        <div className="flex gap-4 items-center">
                                            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-2 shrink-0">
                                                {cert.image ? (
                                                    <img src={cert.image} alt={cert.nom} className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <Award className="w-8 h-8 text-slate-800" />
                                                )}
                                            </div>
                                            <div className="text-left space-y-1">
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getLevelBadgeStyle(cert.niveau)}`}>
                                                    {cert.niveau}
                                                </span>
                                                <h3 className="font-extrabold text-slate-950 text-base leading-snug group-hover:text-red-600 transition-colors">
                                                    {cert.nom}
                                                </h3>
                                                <p className="text-xs text-slate-500 font-bold">{cert.codeExamen || 'Examen'}</p>
                                            </div>
                                        </div>

                                        <div className="w-full sm:w-64 space-y-2.5">
                                            <div className="flex items-center justify-between text-xs font-semibold">
                                                <span className="text-slate-550 font-medium">Meilleur Score</span>
                                                <span className={`font-bold ${bestScore >= 80 ? 'text-emerald-650' : hasTaken ? 'text-amber-600' : 'text-slate-500'}`}>
                                                    {hasTaken ? `${bestScore}%` : 'Aucune tentative'}
                                                </span>
                                            </div>

                                            <div className="w-full h-1.5 bg-slate-50 border border-slate-200/80 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${bestScore >= 80 ? 'bg-emerald-500' : 'bg-red-600'}`}
                                                    style={{ width: `${bestScore}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{cert.dureeIndicative || 'Non spécifiée'}</span>

                                                <a
                                                    href={`/dashboard/practice?cert=${cert.slug}`}
                                                    className="flex items-center gap-1.5 px-4.5 py-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                                                >
                                                    <Play className="w-3.5 h-3.5 fill-white text-white" />
                                                    <span>S'entraîner</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* COLONNE DROITE : HISTORIQUE ET PROCHAIN RDV */}
                <div className="space-y-6 text-left">
                    {/* WIDGET PROCHAIN RDV */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Prochain Rendez-vous</h2>
                        {upcomingRdv.length > 0 ? (
                            <div className="p-5 bg-gradient-to-r from-slate-950 to-slate-900 rounded-3xl text-white space-y-3 shadow-md border border-slate-800">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <span className="px-2.5 py-0.5 bg-red-500/20 text-red-400 font-extrabold text-[9px] rounded-full uppercase tracking-wider">
                                        {upcomingRdv[0].type}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold">Confirmé</span>
                                </div>

                                <p className="text-xs font-black text-white capitalize flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                                    <span>{formatDate(upcomingRdv[0].creneau.dateDebut)}</span>
                                </p>

                                <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Formateur : {upcomingRdv[0].formateur.prenom} {upcomingRdv[0].formateur.nom}</span>
                                </p>

                                <a
                                    href="/dashboard/appointments"
                                    className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer block text-center"
                                >
                                    <Video className="w-3.5 h-3.5 text-red-400" />
                                    <span>Gérer mes RDV</span>
                                </a>
                            </div>
                        ) : (
                            <div className="p-5 bg-white border border-slate-200/80 rounded-3xl text-center space-y-2">
                                <Calendar className="w-6 h-6 text-slate-300 mx-auto" />
                                <p className="text-xs text-slate-500 font-semibold">Aucun rendez-vous planifié</p>
                                <a
                                    href="/dashboard/appointments"
                                    className="text-xs font-extrabold text-red-600 hover:underline inline-block"
                                >
                                    Réserver une séance coaching →
                                </a>
                            </div>
                        )}
                    </div>

                    {/* HISTORIQUE TENTATIVES */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Dernières Tentatives</h2>

                        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4">
                            {!stats.history || stats.history.length === 0 ? (
                                <p className="text-xs text-slate-500 font-semibold text-center py-4">
                                    Aucun historique d'examen disponible.
                                </p>
                            ) : (
                                <div className="space-y-3.5">
                                    {stats.history.slice(0, 4).map((attempt: any) => {
                                        const passed = attempt.score >= 80;
                                        const dateFormatee = new Date(attempt.datePassage).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short'
                                        });

                                        return (
                                            <div
                                                key={attempt.id}
                                                className="flex items-center justify-between p-3.5 bg-slate-50/40 border border-slate-200/80 rounded-2xl"
                                            >
                                                <div className="min-w-0 text-left">
                                                    <p className="text-xs font-bold text-slate-800 truncate">{attempt.certificationName}</p>
                                                    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                                                        <Calendar className="w-3 h-3 text-slate-500" />
                                                        <span>Le {dateFormatee}</span>
                                                    </div>
                                                </div>

                                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider shrink-0 ${passed
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                    }`}>
                                                    {attempt.score}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <a
                                href="/dashboard/practice"
                                className="flex items-center justify-center gap-1 w-full py-3 border border-slate-200/80 hover:border-slate-350 bg-slate-50/20 hover:bg-slate-50 text-xs font-bold text-slate-600 hover:text-slate-955 rounded-xl transition-all uppercase tracking-wider cursor-pointer shadow-sm"
                            >
                                <span>Lancer un nouvel examen</span>
                                <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}