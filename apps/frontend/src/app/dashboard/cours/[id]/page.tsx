"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';
import { BookOpen, Clock, Users, Award, ChevronLeft, Play, CheckCircle, FileText, Sparkles, ListChecks, Target, DoorOpen, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../../../context/ToastContext';
import { useConfirm } from '../../../../context/ConfirmContext';

interface Cours {
    id: string;
    titre: string;
    description?: string;
    imageUrl?: string;
    videoUrl?: string;
    objectifs?: string[];
    prerequis?: string[];
    publicCible?: string[];
    dureeEstimee?: number;
    datePublication: string;
    certification: {
        nom: string;
        codeExamen?: string;
        fournisseur: { nom: string };
    };
    formateur?: {
        id: string;
        prenom: string;
        nom: string;
        avatar?: string;
    };
    modules: Module[];
    _count?: { modules: number; inscriptions: number };
}

interface Module {
    id: string;
    titre: string;
    description?: string;
    contenu?: string;
    ordre: number;
    dureeEstimee?: number;
    imageUrl?: string;
    videoUrl?: string;
    ressources: any[];
}

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [cours, setCours] = useState<Cours | null>(null);
    const [inscription, setInscription] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [quitting, setQuitting] = useState(false);

    const coursId = params.id as string;

    useEffect(() => {
        (async () => {
            try {
                const [coursData, inscData] = await Promise.all([
                    apiFetch(`/cours/${coursId}`),
                    apiFetch('/cours/mes-inscriptions').catch(() => []),
                ]);
                setCours(coursData);

                const insc = (Array.isArray(inscData) ? inscData : []).find(
                    (i: any) => i.cours?.id === coursId
                );
                setInscription(insc || null);
            } catch (err: any) {
                showToast("Impossible de charger le cours.", "error");
                router.push('/dashboard/cours');
            } finally {
                setLoading(false);
            }
        })();
    }, [coursId]);

    const handleJoin = async () => {
        setJoining(true);
        try {
            const insc = await apiFetch(`/cours/${coursId}/inscrire`, { method: 'POST' });
            setInscription(insc);
            showToast("Cours rejoint avec succès !", "success");
        } catch (err: any) {
            showToast(err.message || "Impossible de rejoindre ce cours.", "error");
        } finally {
            setJoining(false);
        }
    };

    const handleQuit = async () => {
        const confirmed = await confirm({
            title: "Quitter le cours",
            message: "Êtes-vous sûr de vouloir quitter ce cours ? Votre progression sera perdue.",
            confirmText: "Oui, quitter",
            cancelText: "Annuler",
            type: "danger",
        });
        if (!confirmed) return;
        setQuitting(true);
        try {
            await apiFetch(`/cours/${coursId}/inscrire`, { method: 'DELETE' });
            setInscription(null);
            showToast("Vous avez quitté le cours.", "info");
            router.push('/dashboard/cours');
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la désinscription.", "error");
        } finally {
            setQuitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-600 gap-4">
                <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement du cours...</p>
            </div>
        );
    }

    if (!cours) return null;

    const isEnrolled = !!inscription;
    const progression = inscription?.progression || 0;

    return (
        <div className="max-w-4xl mx-auto space-y-8 text-slate-800">
            {/* Retour */}
            <button onClick={() => {
                const from = searchParams.get('from');
                if (from === 'explorer' || from === 'mes-cours' || from === 'termines') {
                    router.push(`/dashboard/cours?tab=${from}`);
                } else {
                    router.back();
                }
            }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4" /> Retour
            </button>

            {/* En-tête */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="px-2 py-0.5 bg-slate-100 rounded">{cours.certification?.fournisseur?.nom || 'Général'}</span>
                    <span>{cours.certification?.nom || 'Certification'}</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">{cours.titre}</h1>
                <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">{cours.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {cours.dureeEstimee || '?'} min
                    </span>
                    <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        {cours.modules?.length || 0} modules
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        {cours._count?.inscriptions || 0} inscrits
                    </span>
                    {cours.formateur && (
                        <span className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-black">
                                {cours.formateur.avatar ? (
                                    <img src={cours.formateur.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    cours.formateur.prenom?.[0] || 'F'
                                )}
                            </div>
                            Par {cours.formateur.prenom} {cours.formateur.nom}
                        </span>
                    )}
                </div>
            </div>

            {/* Vidéo de présentation */}
            {cours.videoUrl && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-lg">
                    <iframe src={cours.videoUrl} title="Vidéo de présentation"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen />
                </motion.div>
            )}

            {/* Objectifs & Prérequis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cours.objectifs && cours.objectifs.length > 0 && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" /> Objectifs d'apprentissage
                        </h3>
                        <ul className="space-y-2">
                            {cours.objectifs.map((obj, i) => (
                                <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600 font-medium">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                    {obj}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {cours.prerequis && cours.prerequis.length > 0 && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                            <ListChecks className="w-4 h-4 text-amber-600" /> Prérequis
                        </h3>
                        <ul className="space-y-2">
                            {cours.prerequis.map((pre, i) => (
                                <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600 font-medium">
                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 shrink-0" />
                                    {pre}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Sommaire des modules */}
            <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" /> Modules du cours
                </h2>
                <div className="space-y-3">
                    {cours.modules?.map((module, index) => (
                        <motion.div key={module.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                            className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-start gap-4 hover:border-slate-300 transition-colors">
                            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black shrink-0">
                                {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-slate-900">{module.titre}</h3>
                                {module.description && (
                                    <p className="text-[12px] text-slate-500 font-medium mt-0.5 line-clamp-2">{module.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-semibold">
                                    {module.dureeEstimee && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {module.dureeEstimee} min
                                        </span>
                                    )}
                                    {module.ressources?.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> {module.ressources.length} ressource{module.ressources.length > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Quitter le cours */}
            {isEnrolled && (
                <div className="text-center">
                    <button onClick={handleQuit} disabled={quitting}
                        className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5">
                        {quitting ? (
                            <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                        ) : (
                            <><LogOut className="w-3.5 h-3.5" /> Quitter le cours</>
                        )}
                    </button>
                </div>
            )}

            {/* CTA Rejoindre / Continuer */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center space-y-4 shadow-xl">
                <h2 className="text-xl font-black">Prêt à commencer ?</h2>
                <p className="text-sm text-blue-100 font-medium max-w-md mx-auto">
                    {isEnrolled
                        ? "Continuez votre apprentissage là où vous vous êtes arrêté."
                        : "Rejoignez ce cours et commencez votre formation dès maintenant."}
                </p>
                {isEnrolled ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3 text-sm font-bold">
                            <span>Progression</span>
                            <span className="text-blue-200">{progression}%</span>
                        </div>
                        <div className="w-full max-w-xs mx-auto h-2 bg-blue-400/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all duration-500"
                                style={{ width: `${progression}%` }} />
                        </div>
                        <button onClick={() => router.push(`/dashboard/cours/${cours.id}/apprendre`)}
                            className="mt-4 px-8 py-3 bg-white text-blue-700 text-sm font-black rounded-xl hover:bg-blue-50 transition-all cursor-pointer inline-flex items-center gap-2">
                            <Play className="w-4 h-4" /> Continuer le cours
                        </button>
                    </div>
                ) : (
                    <button onClick={handleJoin} disabled={joining}
                        className="px-8 py-3 bg-white text-blue-700 text-sm font-black rounded-xl hover:bg-blue-50 transition-all cursor-pointer disabled:opacity-60 inline-flex items-center gap-2">
                        {joining ? (
                            <span className="w-4 h-4 border-2 border-blue-300 border-t-blue-700 rounded-full animate-spin" />
                        ) : (
                            <><DoorOpen className="w-4 h-4" /> Rejoindre le cours</>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
