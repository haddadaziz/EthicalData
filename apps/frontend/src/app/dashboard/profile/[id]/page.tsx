"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';
import { useToast } from '../../../../context/ToastContext';
import { User, Award, Calendar, Mail, MessageSquare, Sparkles, Heart, ChevronRight, ArrowLeft, ShieldCheck } from '@/components/icons';
import { motion } from 'framer-motion';

interface PublicUserProfile {
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
    targetedCertifications: any[];
    obtainedCertifications: any[];
}

const getCertificateBadgeLogo = (cert: any) => {
    if (cert.image && (cert.image.endsWith('.svg') || cert.image.endsWith('.png'))) return cert.image;
    const code = (cert.codeExamen || cert.code || '').toLowerCase();
    const nom = (cert.nom || cert.title || '').toLowerCase();

    if (code.includes('az-900') || nom.includes('az-900') || nom.includes('azure fundamentals')) return '/badges/az-900.svg';
    if (code.includes('clf') || nom.includes('cloud practitioner')) return '/badges/aws-clf.svg';
    if (code.includes('saa') || nom.includes('solutions architect')) return '/badges/aws-saa.svg';
    if (code.includes('iso-27001') || nom.includes('iso 27001') || nom.includes('pecb')) return '/badges/pecb-iso.svg';
    if (code.includes('sy0') || nom.includes('security+')) return '/badges/comptia-sec.svg';
    if (code.includes('sc-900') || nom.includes('sc-900')) return '/badges/sc-900.svg';

    return cert.image || cert.logoUrl || '/badges/az-900.svg';
};

export default function PublicProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [profile, setProfile] = useState<PublicUserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPublicProfile = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await apiFetch(`/users/public/${id}`);
            setProfile(data);
        } catch (err: any) {
            console.error("Erreur lors du chargement du profil public:", err);
            showToast(err.message || "Impossible de charger le profil de cet utilisateur.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicProfile();
    }, [id]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getUserRoleLabel = (roleName?: string) => {
        if (!roleName) return 'Apprenant';
        if (roleName === 'SUPER_ADMIN' || roleName === 'ADMIN') return 'Administrateur';
        if (roleName === 'FORMATEUR') return 'Formateur';
        return 'Apprenant';
    };

    if (loading) {
        return (
            <div className="p-16 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl max-w-5xl mx-auto">
                <span className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Chargement du profil...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-12 text-center bg-white border border-slate-200/85 rounded-3xl max-w-2xl mx-auto space-y-4 shadow-sm">
                <p className="text-sm font-extrabold text-slate-700">Profil utilisateur introuvable ou inexistant.</p>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour</span>
                </button>
            </div>
        );
    }

    // Récupérer les visibilités paramétrées par l'apprenant dans son compte
    const showTargetedCerts = profile.preferences?.showTargetedCerts !== false;
    const showObtainedCerts = profile.preferences?.showObtainedCerts !== false;

    return (
        <div className="space-y-8 max-w-6xl mx-auto text-left">
            {/* BOUTON RETOUR */}
            <div className="flex items-center">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Retour</span>
                </button>
            </div>

            {/* BANNIÈRE DE PROFIL PUBLIC */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 flex-1">
                    {/* AVATAR */}
                    <div className="shrink-0">
                        {profile.avatar ? (
                            <img
                                src={profile.avatar}
                                alt={`${profile.prenom} ${profile.nom}`}
                                className="w-24 h-24 rounded-3xl object-cover border-2 border-white/20 shadow-xl ring-4 ring-indigo-500/10"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-white/20 flex items-center justify-center text-white font-black text-3xl shadow-xl ring-4 ring-indigo-500/10">
                                {profile.prenom[0]}{profile.nom[0]}
                            </div>
                        )}
                    </div>

                    {/* DÉTAILS DE L'UTILISATEUR */}
                    <div className="space-y-2 text-center md:text-left flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white truncate">
                                {profile.prenom} {profile.nom}
                            </h1>
                            <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                                {getUserRoleLabel(profile.role)}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                Membre depuis le {formatDate(profile.dateInscription)}
                            </span>
                        </p>
                        {profile.bio && (
                            <p className="text-xs text-slate-300 font-medium italic max-w-xl line-clamp-3 pt-1 leading-relaxed">
                                "{profile.bio}"
                            </p>
                        )}
                    </div>
                </div>

                {/* STATISTIQUES FORUM */}
                <div className="grid grid-cols-3 gap-3 w-full lg:w-auto relative z-10 shrink-0">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-1">
                        <div className="flex items-center justify-center text-indigo-400 gap-1.5">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xl font-black">{profile.stats.sujetsCount}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Discussions</span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-1">
                        <div className="flex items-center justify-center text-blue-400 gap-1.5">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xl font-black">{profile.stats.commentairesCount}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Réponses</span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-1">
                        <div className="flex items-center justify-center text-rose-400 gap-1.5">
                            <Heart className="w-4 h-4" />
                            <span className="text-xl font-black">{profile.stats.likesCount || 0}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Likes</span>
                    </div>
                </div>
            </div>

            {/* CONTENU DU PROFIL (GRILLE A DEUX COLONNES) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PARCOURS & BIO (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-4 shadow-xs">
                        <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                            <User className="w-4 h-4 text-indigo-600" />
                            <span>Parcours Professionnel</span>
                        </h3>
                        {profile.bio ? (
                            <p className="text-xs text-slate-700 font-semibold leading-relaxed whitespace-pre-line">
                                {profile.bio}
                            </p>
                        ) : (
                            <p className="text-xs text-slate-400 font-bold italic py-4">
                                L'utilisateur n'a pas rédigé de présentation personnelle pour le moment.
                            </p>
                        )}
                    </div>
                </div>

                {/* CERTIFICATIONS (1/3) */}
                <div className="space-y-6">
                    {/* SECTION OBTENUES */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Certifications obtenues</span>
                            </h3>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold text-[9px] rounded-full">
                                {showObtainedCerts ? profile.obtainedCertifications.length : 0}
                            </span>
                        </div>

                        {!showObtainedCerts ? (
                            <div className="text-center py-4">
                                <p className="text-xs text-slate-400 font-bold italic">Ces informations sont privées.</p>
                            </div>
                        ) : profile.obtainedCertifications.length > 0 ? (
                            <div className="space-y-3">
                                {profile.obtainedCertifications.map((cert) => {
                                    const logo = getCertificateBadgeLogo(cert);
                                    return (
                                        <div key={cert.id} className="flex items-center gap-3.5 p-3.5 bg-gradient-to-r from-emerald-500/5 to-teal-500/0 border border-emerald-500/10 hover:border-emerald-500/20 shadow-2xs hover:shadow-xs rounded-2xl transition-all duration-300 group">
                                            {logo.endsWith('.svg') || logo.endsWith('.png') ? (
                                                <img src={logo} alt={cert.nom} className="w-10 h-10 object-contain transition-transform group-hover:scale-105" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-700 text-xs font-black transition-transform group-hover:scale-105">
                                                    {(cert.codeExamen || 'CERT').slice(0, 3)}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider leading-none">
                                                    Score IA : {cert.bestScore}%
                                                </p>
                                                <p className="text-xs font-bold text-slate-850 truncate mt-1">
                                                    {cert.nom}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-xs text-slate-400 font-bold italic">Aucune certification validée pour le moment.</p>
                            </div>
                        )}
                    </div>

                    {/* SECTION VISÉES */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Award className="w-4 h-4 text-indigo-600" />
                                <span>Certifications visées</span>
                            </h3>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-[9px] rounded-full">
                                {showTargetedCerts ? profile.targetedCertifications.length : 0}
                            </span>
                        </div>

                        {!showTargetedCerts ? (
                            <div className="text-center py-4">
                                <p className="text-xs text-slate-400 font-bold italic">Ces informations sont privées.</p>
                            </div>
                        ) : profile.targetedCertifications.length > 0 ? (
                            <div className="space-y-3">
                                {profile.targetedCertifications.map((cert) => {
                                    const logo = getCertificateBadgeLogo(cert);
                                    return (
                                        <div key={cert.id} className="flex items-center gap-3.5 p-3.5 bg-gradient-to-r from-indigo-500/5 to-blue-500/0 border border-indigo-500/10 hover:border-indigo-500/20 shadow-2xs hover:shadow-xs rounded-2xl transition-all duration-300 group">
                                            {logo.endsWith('.svg') || logo.endsWith('.png') ? (
                                                <img src={logo} alt={cert.nom} className="w-10 h-10 object-contain transition-transform group-hover:scale-105" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-indigo-100/80 flex items-center justify-center text-indigo-700 text-xs font-black transition-transform group-hover:scale-105">
                                                    {(cert.codeExamen || 'CERT').slice(0, 3)}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-wider leading-none">
                                                    {cert.codeExamen || 'Examen'}
                                                </p>
                                                <p className="text-xs font-bold text-slate-850 truncate mt-1">
                                                    {cert.nom}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-xs text-slate-400 font-bold italic">Aucun objectif défini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
