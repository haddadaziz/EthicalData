"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '../../../../context/ToastContext';
import { User, MessageCircle, Heart, Reply, Target, CheckCircle, ChevronRight, ArrowLeft } from '@/components/icons';
import { motion } from 'framer-motion';
import { getCertificateBadgeLogo } from '@/lib/certification-utils';
import { apiFetch } from '../../../../lib/api';

interface PublicProfile {
    id: string;
    prenom: string;
    nom: string;
    avatar?: string | null;
    bio?: string | null;
    dateInscription: string;
    role: string;
    stats: {
        sujetsCount: number;
        commentairesCount: number;
        likesCount: number;
    };
    obtainedCertifications?: any[];
    targetedCertifications?: any[];
}

const getRoleLabel = (role?: string) => {
    if (!role) return 'Apprenant';
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return 'Administrateur';
    if (role === 'FORMATEUR') return 'Formateur';
    return 'Apprenant';
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

export default function PublicProfilePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { showToast } = useToast();
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        apiFetch(`/users/public/${id}`)
            .then((data) => setProfile(data))
            .catch((err: any) => {
                showToast(err.message || "Impossible de charger ce profil.", "error");
            })
            .finally(() => setLoading(false));
    }, [id, showToast]);

    if (loading) {
        return (
            <div className="p-16 text-center bg-[#080d1a] border border-slate-800 rounded-3xl max-w-5xl mx-auto shadow-sm">
                <span className="w-10 h-10 border-4 border-blue-950 border-t-cyan-500 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Chargement du profil...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-16 text-center bg-[#080d1a] border border-slate-800 rounded-3xl max-w-5xl mx-auto shadow-sm space-y-4">
                <p className="text-sm font-bold text-slate-300">Profil introuvable.</p>
                <a href="/admin/users" className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Retour aux utilisateurs
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto text-left text-white">
            {/* Bouton de retour */}
            <div className="flex justify-start">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#080d1a] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour</span>
                </button>
            </div>

            {/* ═══ BANNIÈRE PREMIUM ═══ */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="bg-gradient-to-br from-[#020617] via-slate-900 to-[#080d1a] border border-slate-800 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-black"
            >
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-red-800/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
                    {/* Avatar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="relative shrink-0"
                    >
                        <div className="absolute -inset-2 bg-blue-600/20 rounded-full blur-sm" />
                        {profile.avatar ? (
                            <img
                                src={profile.avatar}
                                alt={`${profile.prenom} ${profile.nom}`}
                                className="w-28 h-28 rounded-full object-cover border-4 border-[#080d1a] shadow-2xl ring-4 ring-blue-600/30 relative z-10"
                            />
                        ) : (
                            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-red-700 to-rose-500 border-4 border-[#080d1a] flex items-center justify-center text-white font-black text-3xl shadow-[0_0_15px_rgba(37,99,235,0.3)] ring-4 ring-blue-600/30 relative z-10">
                                {profile.prenom?.[0]}{profile.nom?.[0]}
                            </div>
                        )}
                    </motion.div>

                    {/* Infos */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-2.5 text-center lg:text-left flex-1 min-w-0"
                    >
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white truncate">
                                {profile.prenom} {profile.nom}
                            </h1>
                            <span className="px-3.5 py-1 bg-blue-950/40 border border-blue-900/50 text-cyan-400 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                                {getRoleLabel(profile.role)}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1">
                            <span>Membre depuis {formatDate(profile.dateInscription)}</span>
                        </p>
                        {profile.bio && (
                            <p className="text-xs text-slate-400/80 font-medium italic max-w-xl line-clamp-2 pt-0.5 leading-relaxed">
                                {`"${profile.bio}"`}
                            </p>
                        )}
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.35 }}
                        className="grid grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto relative z-10 shrink-0"
                    >
                        {[
                            { icon: <MessageCircle className="w-4 h-4" />, value: profile.stats.sujetsCount, label: 'Discussions', color: 'text-cyan-300' },
                            { icon: <Reply className="w-4 h-4" />, value: profile.stats.commentairesCount, label: 'Réponses', color: 'text-rose-400' },
                            { icon: <Heart className="w-4 h-4" />, value: profile.stats.likesCount, label: "J'aime", color: 'text-cyan-400' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                                className="bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] rounded-2xl p-4 text-center space-y-1.5 transition-all duration-200 group hover:-translate-y-0.5"
                            >
                                <div className={`flex items-center justify-center ${stat.color} gap-1.5 group-hover:scale-110 transition-transform duration-300`}>
                                    {stat.icon}
                                    <span className="text-xl font-black">{stat.value}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{stat.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Grid obtained & targeted certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ═══ CERTIFICATIONS OBTENUES ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-[#080d1a] border border-slate-800 rounded-3xl shadow-sm hover:shadow-lg hover:border-slate-700 transition-all duration-300 overflow-hidden"
                >
                    <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span>Certifications obtenues</span>
                            </h3>
                            <span className="px-2.5 py-0.5 bg-emerald-950/30 text-emerald-500 font-extrabold text-[9px] rounded-full border border-emerald-900/50">
                                {profile.obtainedCertifications?.length || 0}
                            </span>
                        </div>

                        {(profile.obtainedCertifications && profile.obtainedCertifications.length > 0) ? (
                            <div className="space-y-2.5">
                                {profile.obtainedCertifications.map((cert: any, i: number) => {
                                    const logo = getCertificateBadgeLogo(cert);
                                    return (
                                        <motion.div
                                            key={cert.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 + i * 0.06 }}
                                            className="flex items-center gap-3 p-3 bg-[#020617] border border-slate-800 rounded-2xl hover:shadow-sm hover:border-emerald-900/50 transition-all duration-200 group"
                                        >
                                            {logo.endsWith('.svg') || logo.endsWith('.png') ? (
                                                <img src={logo} alt={cert.nom} className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-xl bg-emerald-950/50 flex items-center justify-center text-emerald-500 text-xs font-black border border-emerald-900/50">
                                                    {(cert.codeExamen || 'CERT').slice(0, 3)}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-[9px] font-extrabold text-emerald-500 uppercase tracking-tight leading-none">
                                                    Score IA : {cert.bestScore}%
                                                </p>
                                                <p className="text-xs font-bold text-white truncate mt-0.5">
                                                    {cert.nom}
                                                </p>
                                            </div>
                                            <a
                                                href={`/dashboard/practice?cert=${cert.slug}`}
                                                className="p-1.5 bg-[#080d1a] border border-slate-800 hover:border-cyan-500 rounded-xl hover:bg-blue-600 text-slate-400 hover:text-white transition-all duration-200 shadow-sm opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                                                title="S'entraîner"
                                            >
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </a>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6 space-y-2">
                                <div className="w-12 h-12 mx-auto bg-[#020617] border border-slate-800 rounded-2xl flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-slate-600" />
                                </div>
                                <p className="text-xs text-slate-400 font-bold">Aucune certification validée pour le moment.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ═══ CERTIFICATIONS VISÉES ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="bg-[#080d1a] border border-slate-800 rounded-3xl shadow-sm hover:shadow-lg hover:border-slate-700 transition-all duration-300 overflow-hidden"
                >
                    <div className="h-1 bg-gradient-to-r from-blue-600 to-rose-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                                <Target className="w-4 h-4 text-cyan-400" />
                                <span>Certifications visées</span>
                            </h3>
                            <span className="px-2.5 py-0.5 bg-blue-950/30 text-cyan-400 font-extrabold text-[9px] rounded-full border border-blue-900/50">
                                {profile.targetedCertifications?.length || 0}
                            </span>
                        </div>

                        {(profile.targetedCertifications && profile.targetedCertifications.length > 0) ? (
                            <div className="space-y-2.5">
                                {profile.targetedCertifications.map((cert: any, i: number) => {
                                    const logo = getCertificateBadgeLogo(cert);
                                    return (
                                        <motion.div
                                            key={cert.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.6 + i * 0.06 }}
                                            className="flex items-center gap-3 p-3 bg-[#020617] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all duration-200 group"
                                        >
                                            {logo.endsWith('.svg') || logo.endsWith('.png') ? (
                                                <img src={logo} alt={cert.nom} className="w-9 h-9 object-contain group-hover:scale-105 transition-transform bg-slate-900 border border-slate-800/80 rounded-lg p-1" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-xl bg-blue-950/30 border border-blue-900/50 flex items-center justify-center text-cyan-400 text-xs font-black">
                                                    {(cert.codeExamen || 'CERT').slice(0, 3)}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-tight leading-none">
                                                    {cert.codeExamen || 'Examen'}
                                                </p>
                                                <p className="text-xs font-bold text-slate-300 truncate group-hover:text-white transition-colors mt-0.5">
                                                    {cert.nom}
                                                </p>
                                            </div>
                                            <a
                                                href={`/dashboard/practice?cert=${cert.slug}`}
                                                className="p-1.5 bg-[#080d1a] border border-slate-800 hover:border-cyan-500 rounded-xl hover:bg-blue-600 text-slate-400 hover:text-white transition-all duration-200 shadow-sm opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                                                title="S'entraîner"
                                            >
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </a>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6 space-y-2">
                                <div className="w-12 h-12 mx-auto bg-[#020617] border border-slate-800 rounded-2xl flex items-center justify-center">
                                    <Target className="w-5 h-5 text-slate-600" />
                                </div>
                                <p className="text-xs text-slate-400 font-bold">Aucune certification ciblée pour le moment.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
