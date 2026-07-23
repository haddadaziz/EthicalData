"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { apiFetch } from '../lib/api';
import { getCertificateBadgeLogo } from '../lib/certification-utils';
import { X, Calendar, Sparkles, MessageSquare, Heart, Award } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface PublicLearnerProfile {
    id: string;
    prenom: string;
    nom: string;
    avatar?: string | null;
    bio?: string | null;
    dateInscription: string;
    role: string;
    preferences?: any;
    stats: {
        sujetsCount: number;
        commentairesCount: number;
        likesCount?: number;
    };
    obtainedCertifications?: any[];
}

interface LearnerProfileModalProps {
    learnerId: string | null;
    onClose: () => void;
}

export default function LearnerProfileModal({ learnerId, onClose }: LearnerProfileModalProps) {
    const [profile, setProfile] = useState<PublicLearnerProfile | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!learnerId) return;

        const fetchPublicProfile = async () => {
            setLoading(true);
            try {
                const data = await apiFetch(`/users/public/${learnerId}`);
                setProfile(data);
            } catch (err) {
                console.error("Erreur chargement profil public:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicProfile();
    }, [learnerId]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric',
        });
    };

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    if (typeof window === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {learnerId && (
                <motion.div
                    onClick={onClose}
                    onKeyDown={handleKeyDown}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 overflow-y-auto"
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl text-left relative overflow-hidden flex flex-col max-h-[85vh] outline-none"
                    >
                        {loading || !profile ? (
                            <div className="p-16 text-center text-slate-400">
                                <span className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin inline-block mb-3" />
                                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Chargement de la fiche...</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 border-b border-slate-800 p-6 text-white relative overflow-hidden shrink-0">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
                                    
                                    <button
                                        onClick={onClose}
                                        className="absolute right-5 top-5 p-2 text-white/50 hover:text-white rounded-2xl hover:bg-white/10 transition-colors cursor-pointer z-20"
                                        aria-label="Fermer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="flex flex-col md:flex-row items-center gap-5 relative z-10">
                                        <div className="shrink-0">
                                            {profile.avatar ? (
                                                <img
                                                    src={profile.avatar}
                                                    alt={`${profile.prenom} ${profile.nom}`}
                                                    className="w-20 h-20 rounded-3xl object-cover border-2 border-white/20 shadow-xl ring-4 ring-indigo-500/15"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-white/20 flex items-center justify-center text-white font-black text-2xl shadow-xl ring-4 ring-indigo-500/15">
                                                    {profile.prenom[0]}{profile.nom[0]}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 text-center md:text-left flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                                                <h3 className="text-xl font-black tracking-tight text-white truncate">
                                                    {profile.prenom} {profile.nom}
                                                </h3>
                                                <span className="px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-extrabold text-[9px] rounded-full uppercase tracking-wider">
                                                    {profile.role === 'SUPER_ADMIN' || profile.role === 'ADMIN' 
                                                        ? 'Administrateur' 
                                                        : profile.role === 'FORMATEUR' 
                                                        ? 'Formateur' 
                                                        : 'Apprenant'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold flex items-center justify-center md:justify-start gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                                <span>Membre depuis le {formatDate(profile.dateInscription)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-y-auto flex-1 p-6 md:p-8 space-y-6 bg-slate-50">
                                    {profile.bio && (
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Présentation</span>
                                            <div className="p-4 bg-white border border-slate-200/85 rounded-2xl text-xs text-slate-700 font-semibold leading-relaxed relative overflow-hidden shadow-2xs">
                                                <p className="relative z-10 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Activité Forum</span>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-3 bg-white border border-slate-250/80 rounded-2xl text-center space-y-1 shadow-2xs hover:border-slate-300 transition-colors">
                                                <div className="flex items-center justify-center gap-1.5 text-indigo-600">
                                                    <Sparkles className="w-4 h-4" />
                                                    <span className="text-base font-black">{profile.stats.sujetsCount}</span>
                                                </div>
                                                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Sujets</span>
                                            </div>

                                            <div className="p-3 bg-white border border-slate-250/80 rounded-2xl text-center space-y-1 shadow-2xs hover:border-slate-300 transition-colors">
                                                <div className="flex items-center justify-center gap-1.5 text-blue-600">
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span className="text-base font-black">{profile.stats.commentairesCount}</span>
                                                </div>
                                                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Réponses</span>
                                            </div>

                                            <div className="p-3 bg-white border border-slate-250/80 rounded-2xl text-center space-y-1 shadow-2xs hover:border-slate-300 transition-colors">
                                                <div className="flex items-center justify-center gap-1.5 text-rose-500">
                                                    <Heart className="w-4 h-4" />
                                                    <span className="text-base font-black">{profile.stats.likesCount || 0}</span>
                                                </div>
                                                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Likes</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Certifications Validées</span>
                                        {profile.preferences?.showObtainedCerts !== false ? (
                                            profile.obtainedCertifications && profile.obtainedCertifications.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {profile.obtainedCertifications.map((cert) => {
                                                        const logo = getCertificateBadgeLogo(cert);
                                                        return (
                                                            <div 
                                                                key={cert.id} 
                                                                className="flex items-center gap-3 p-3 bg-white border border-slate-200/80 hover:border-blue-300 rounded-2xl shadow-2xs group transition-all"
                                                            >
                                                                {logo ? (
                                                                    <img src={logo} alt={cert.nom} className="w-10 h-10 object-contain shrink-0 transition-transform group-hover:scale-105" />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                                                        <Award className="w-6 h-6 text-slate-450" />
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0 flex-1 text-left">
                                                                    <p className="text-[8.5px] font-black text-emerald-600 uppercase tracking-wider leading-none">
                                                                        Score IA : {cert.bestScore || 100}%
                                                                    </p>
                                                                    <p className="text-xs font-bold text-slate-900 truncate mt-1.5" title={cert.nom}>
                                                                        {cert.nom}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-6 text-center bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-400 font-bold italic shadow-2xs">
                                                    Aucune certification validée pour le moment.
                                                </div>
                                            )
                                        ) : (
                                            <div className="p-6 text-center bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-400 font-bold italic shadow-2xs">
                                                L'utilisateur a configuré son compte pour garder ces informations privées.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
