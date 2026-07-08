"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { X, User, Sparkles, MessageSquare, Mail, Calendar, Award, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PublicLearnerProfile {
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
    };
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

    if (!learnerId) return null;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <AnimatePresence>
            <div
                onClick={onClose}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
            >
                <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-left relative overflow-hidden"
                >
                    {/* BOUTON FERMER */}
                    <button
                        onClick={onClose}
                        className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-950 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {loading || !profile ? (
                        <div className="p-12 text-center text-slate-400">
                            <span className="w-8 h-8 border-4 border-red-100 border-t-red-600 rounded-full animate-spin inline-block mb-3" />
                            <p className="text-xs font-bold uppercase tracking-widest text-red-600">Chargement de la fiche...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* EN-TÊTE AVATAR ET NOM */}
                            <div className="flex flex-col items-center text-center space-y-4 pt-4">
                                <div className="relative">
                                    {profile.avatar ? (
                                        <img
                                            src={profile.avatar}
                                            alt={`${profile.prenom} ${profile.nom}`}
                                            className="w-24 h-24 rounded-3xl object-cover border-2 border-white ring-4 ring-slate-100 shadow-xl transition-transform hover:scale-105 duration-300"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-indigo-600 border-2 border-white ring-4 ring-slate-100 flex items-center justify-center text-white font-black text-3xl shadow-xl">
                                            {profile.prenom[0]}{profile.nom[0]}
                                        </div>
                                    )}
                                    {/* No award badge next to avatar */}
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                        {profile.prenom} {profile.nom}
                                    </h3>
                                    <p className="text-xs font-bold text-indigo-600/80">
                                        @{profile.prenom.toLowerCase()}_{profile.nom.toLowerCase()}
                                    </p>
                                    <div className="pt-2">
                                        {profile.role === 'SUPER_ADMIN' || profile.role === 'ADMIN' ? (
                                            <span className="px-3.5 py-1 bg-rose-50 text-rose-700 font-extrabold text-[10px] rounded-full border border-rose-200/60 uppercase tracking-wider">
                                                Administrateur
                                            </span>
                                        ) : profile.role === 'FORMATEUR' ? (
                                            <span className="px-3.5 py-1 bg-purple-50 text-purple-700 font-extrabold text-[10px] rounded-full border border-purple-200/60 uppercase tracking-wider">
                                                Formateur
                                            </span>
                                        ) : (
                                            <span className="px-3.5 py-1 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded-full border border-blue-200/60 uppercase tracking-wider">
                                                Apprenant
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* BIO */}
                            {profile.bio && (
                                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-xs text-slate-700 font-semibold leading-relaxed relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                                    <p className="italic relative z-10">"{profile.bio}"</p>
                                </div>
                            )}

                            {/* STATISTIQUES SOCIALES */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl text-center space-y-1 shadow-2xs hover:shadow-xs transition-all duration-300">
                                    <div className="flex items-center justify-center gap-2 text-indigo-600">
                                        <Sparkles className="w-4 h-4" />
                                        <span className="text-xl font-black">{profile.stats.sujetsCount}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Discussions</span>
                                </div>

                                <div className="p-4 bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl text-center space-y-1 shadow-2xs hover:shadow-xs transition-all duration-300">
                                    <div className="flex items-center justify-center gap-2 text-blue-600">
                                        <MessageSquare className="w-4 h-4" />
                                        <span className="text-xl font-black">{profile.stats.commentairesCount}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Réponses</span>
                                </div>
                            </div>

                            {/* DATE D'INSCRIPTION */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                                <Calendar className="w-4 h-4" />
                                <span>Membre depuis {formatDate(profile.dateInscription)}</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
