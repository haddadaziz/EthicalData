'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { BookMarked, Globe, FilePen, Plus, BarChart3, Users } from '@/components/icons';
import { useCourses } from '@/hooks/useCourses';
import { CourseGrid } from '@/components/dashboard/courses/CourseGrid';
import { InstructorAnalyticsView } from '@/components/dashboard/courses/InstructorAnalyticsView';
import dynamic from 'next/dynamic';

const CourseEditor = dynamic(
  () => import('@/components/dashboard/courses/CourseEditor').then((mod) => mod.CourseEditor),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-400">Chargement de l'éditeur...</div> }
);

export default function CoursesPage() {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const router = useRouter();
    
    const {
        cours,
        certs,
        loading,
        error,
        fetchInitialData,
        deleteCours,
        publishCours,
        createCours,
        updateCours,
    } = useCourses();

    const [isCreating, setIsCreating] = useState(false);
    const [editingCours, setEditingCours] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<'TOUS' | 'PUBLIE' | 'BROUILLON'>('TOUS');
    const [viewMode, setViewMode] = useState<'COURS' | 'ANALYTICS'>('COURS');
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        apiFetch('/users/me/profile')
            .then((profile) => {
                if (profile && profile.roles) {
                    const roles = profile.roles.map((r: any) => r.nom);
                    if (roles.includes('FORMATEUR') || roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
                        setIsAuthorized(true);
                        fetchInitialData();
                    } else {
                        setIsAuthorized(false);
                        router.push('/dashboard');
                    }
                } else {
                    setIsAuthorized(false);
                    router.push('/login');
                }
            })
            .catch(() => {
                setIsAuthorized(false);
                router.push('/login');
            });
    }, [fetchInitialData, router]);

    const handleDeleteCours = async (coursId: string) => {
        const ok = await confirm({
            title: "Supprimer ce cours ?",
            message: "Cette action est irréversible. Tous les modules et ressources associés seront supprimés.",
            confirmText: "Oui, supprimer",
            cancelText: "Annuler",
            type: "danger",
        });
        if (!ok) return;
        try {
            await deleteCours(coursId);
            showToast("Cours supprimé avec succès.", "success");
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la suppression.", "error");
        }
    };

    const handlePublish = async (coursId: string) => {
        const coursItem = cours.find(c => c.id === coursId);
        if (coursItem) {
            const preErrors: string[] = [];
            if (!coursItem.description?.trim()) preErrors.push('Description manquante');
            if (!coursItem.objectifs?.filter((o: string) => o.trim()).length) preErrors.push('Aucun objectif renseigné');
            if (coursItem.modules.length === 0) preErrors.push('Aucun module ajouté');
            if (preErrors.length > 0) {
                showToast(`Publication impossible : ${preErrors.join(' · ')}`, "error");
                return;
            }
        }

        const ok = await confirm({
            title: "Publier ce cours ?",
            message: "Le cours sera visible par tous les apprenants. Vous pourrez le modifier après publication.",
            confirmText: "Publier",
            cancelText: "Annuler",
            type: "info",
        });
        if (!ok) return;
        try {
            await publishCours(coursId);
            showToast("Cours publié avec succès !", "success");
        } catch (err: any) {
            const msg = Array.isArray(err.message) ? err.message.join('\n') : err.message || "Erreur lors de la publication.";
            showToast(msg, "error");
        }
    };

    // Stats
    const totalCours = cours.length;
    const totalPublies = cours.filter(c => c.statut === 'PUBLIE').length;
    const totalBrouillons = cours.filter(c => c.statut === 'BROUILLON').length;

    if (isAuthorized === null || (isAuthorized === true && loading)) {
        return (
            <div className="p-16 text-center text-slate-400 bg-[#080d1a] border border-slate-800 rounded-3xl max-w-5xl mx-auto">
                <span className="w-10 h-10 border-4 border-blue-950 border-t-cyan-500 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Chargement de l'espace formateur...</p>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    if (error) {
        return (
            <div className="p-12 text-center bg-[#080d1a] border border-slate-800 rounded-3xl max-w-2xl mx-auto space-y-4 text-white">
                <p className="text-sm font-black text-rose-500">{error}</p>
                <p className="text-xs text-slate-400 font-medium">
                    Si votre rôle a été récemment mis à jour, votre session active est peut-être obsolète. Veuillez vous déconnecter et vous reconnecter pour rafraîchir vos permissions.
                </p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                    Retour au Tableau de Bord
                </button>
            </div>
        );
    }

    const filteredCours = cours.filter(c =>
        activeTab === 'TOUS' ? true : c.statut === activeTab
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-white text-left">
                {loading ? (
                    <div className="p-16 text-center text-slate-400 bg-[#080d1a] border border-slate-800 rounded-3xl max-w-5xl mx-auto">
                        <span className="w-10 h-10 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin inline-block mb-3" />
                        <p className="text-xs font-bold uppercase tracking-widest text-cyan-500">Chargement des cours...</p>
                    </div>
                ) : (
                    <>
                        {/* NAVIGATION EN-TÊTE ESPACE FORMATEUR */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#080d1a] border border-slate-800 p-2 rounded-2xl">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setViewMode('COURS')}
                                    className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                        viewMode === 'COURS'
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 border border-blue-500'
                                            : 'text-slate-400 hover:text-white hover:bg-[#020617]'
                                    }`}
                                >
                                    <BookMarked className="w-4 h-4" />
                                    <span>Mes Cours & Édition</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('ANALYTICS')}
                                    className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                        viewMode === 'ANALYTICS'
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 border border-blue-500'
                                            : 'text-slate-400 hover:text-white hover:bg-[#020617]'
                                    }`}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    <span>Suivi des Apprenants & Statistiques</span>
                                </button>
                            </div>
                        </div>

                        {viewMode === 'ANALYTICS' ? (
                            <InstructorAnalyticsView />
                        ) : (
                            <>
                                {/* STATS */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 shadow-xs flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-950/20 border border-blue-900/40 flex items-center justify-center text-cyan-400 shrink-0">
                                            <BookMarked className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-2xl font-black text-white block leading-tight">{totalCours}</span>
                                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Cours créés</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 shadow-xs flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 flex items-center justify-center text-emerald-500 shrink-0">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-2xl font-black text-white block leading-tight">{totalPublies}</span>
                                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Cours publiés</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 shadow-xs flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-950/20 border border-amber-900/40 flex items-center justify-center text-amber-500 shrink-0">
                                            <FilePen className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-2xl font-black text-white block leading-tight">{totalBrouillons}</span>
                                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Brouillons</span>
                                        </div>
                                    </div>
                                </div>

                                {/* HEADER + FILTRES */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                                    <div className="flex items-center gap-2">
                                        {(['TOUS', 'PUBLIE', 'BROUILLON'] as const).map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === tab
                                                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)] border border-cyan-500'
                                                    : 'bg-[#020617] text-slate-400 hover:bg-slate-900/50 hover:text-white border border-slate-800'
                                                    }`}
                                            >
                                                {tab === 'TOUS' ? 'Tous les cours' : tab === 'PUBLIE' ? 'Publiés' : 'Brouillons'}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => router.push('/dashboard/courses/new')}
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-xs hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all shrink-0 cursor-pointer"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Nouveau cours</span>
                                    </button>
                                </div>

                                <CourseGrid
                                    filteredCours={filteredCours}
                                    activeTab={activeTab}
                                    onCreateNew={() => router.push('/dashboard/courses/new')}
                                    onEdit={(c) => router.push(`/dashboard/courses/${c.id}/edit`)}
                                    onPublish={handlePublish}
                                    onDelete={handleDeleteCours}
                                />
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
