'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { BookMarked, Globe, FilePen, Plus } from '@/components/icons';
import { useCourses } from '@/hooks/useCourses';
import { CourseGrid } from '@/components/dashboard/courses/CourseGrid';
import { CourseEditor } from '@/components/dashboard/courses/CourseEditor';

export default function CoursesPage() {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    
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

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

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

    const filteredCours = cours.filter(c =>
        activeTab === 'TOUS' ? true : c.statut === activeTab
    );

    if (isCreating || editingCours) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-28">
                <Navbar />
                <CourseEditor
                    certs={certs}
                    editingCours={editingCours}
                    onClose={() => { setIsCreating(false); setEditingCours(null); }}
                    showToast={showToast}
                    onSave={async (data) => {
                        try {
                            if (editingCours) {
                                await updateCours(editingCours.id, data);
                                showToast("Cours mis à jour.", "success");
                            } else {
                                await createCours(data, 'BROUILLON');
                                showToast("Cours créé.", "success");
                            }
                            setIsCreating(false);
                            setEditingCours(null);
                        } catch (err: any) {
                            showToast(err.message || "Erreur.", "error");
                        }
                    }}
                    onSaveDraft={async (data) => {
                        try {
                            if (editingCours) {
                                await updateCours(editingCours.id, data, 'BROUILLON');
                                showToast("Brouillon mis à jour.", "success");
                            } else {
                                await createCours(data, 'BROUILLON');
                                showToast("Brouillon sauvegardé.", "success");
                            }
                            setIsCreating(false);
                            setEditingCours(null);
                        } catch (err: any) {
                            showToast(err.message || "Erreur.", "error");
                        }
                    }}
                    onPublish={async (data) => {
                        try {
                            if (editingCours) {
                                await updateCours(editingCours.id, data, 'PUBLIE');
                            } else {
                                await createCours(data, 'PUBLIE');
                            }
                            showToast("Cours publié avec succès !", "success");
                            setIsCreating(false);
                            setEditingCours(null);
                        } catch (err: any) {
                            showToast(err.message || "Erreur.", "error");
                        }
                    }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-28">
            <Navbar />
            <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
                {loading ? (
                    <div className="p-16 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl max-w-5xl mx-auto">
                        <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement des cours...</p>
                    </div>
                ) : (
                    <>
                        {/* STATS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                    <BookMarked className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-2xl font-black text-slate-900 block leading-tight">{totalCours}</span>
                                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Cours créés</span>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-2xl font-black text-slate-900 block leading-tight">{totalPublies}</span>
                                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Cours publiés</span>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                    <FilePen className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-2xl font-black text-slate-900 block leading-tight">{totalBrouillons}</span>
                                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Brouillons</span>
                                </div>
                            </div>
                        </div>

                        {/* HEADER + FILTRES */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                            <div className="flex items-center gap-2">
                                {(['TOUS', 'PUBLIE', 'BROUILLON'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === tab
                                            ? 'bg-slate-950 text-white shadow-xs'
                                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
                                            }`}
                                    >
                                        {tab === 'TOUS' ? 'Tous les cours' : tab === 'PUBLIE' ? 'Publiés' : 'Brouillons'}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-xs hover:shadow-md transition-all shrink-0 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Nouveau cours</span>
                            </button>
                        </div>

                        <CourseGrid
                            filteredCours={filteredCours}
                            activeTab={activeTab}
                            onCreateNew={() => setIsCreating(true)}
                            onEdit={(c) => setEditingCours(c)}
                            onPublish={handlePublish}
                            onDelete={handleDeleteCours}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
