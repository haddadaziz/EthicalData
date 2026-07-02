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
                            <div className="flex flex-col items-center text-center space-y-3 pt-2">
                                {profile.avatar ? (
                                    <img
                                        src={profile.avatar}
                                        alt={`${profile.prenom} ${profile.nom}`}
                                        className="w-20 h-20 rounded-3xl object-cover border-2 border-slate-100 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-red-600 to-rose-500 border-2 border-slate-100 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                                        {profile.prenom[0]}{profile.nom[0]}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-950">
                                        {profile.prenom} {profile.nom}
                                    </h3>
                                    <p className="text-xs font-bold text-red-600">
                                        @{profile.prenom.toLowerCase()}_{profile.nom.toLowerCase()}
                                    </p>
                                    <div className="pt-1">
                                        <span className="px-3 py-1 bg-red-50 text-red-700 font-extrabold text-[10px] rounded-full border border-red-200">
                                            {profile.role === 'SUPER_ADMIN' || profile.role === 'ADMIN' ? 'Administrateur' : 'Candidat Apprenant'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* BIO */}
                            {profile.bio && (
                                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 font-medium leading-relaxed italic">
                                    "{profile.bio}"
                                </div>
                            )}

                            {/* STATISTIQUES SOCIALES */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1">
                                    <div className="flex items-center justify-center gap-1.5 text-red-600">
                                        <Sparkles className="w-4 h-4" />
                                        <span className="text-lg font-black">{profile.stats.sujetsCount}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Discussions</span>
                                </div>

                                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1">
                                    <div className="flex items-center justify-center gap-1.5 text-blue-600">
                                        <MessageSquare className="w-4 h-4" />
                                        <span className="text-lg font-black">{profile.stats.commentairesCount}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Réponses</span>
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
