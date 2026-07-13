"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { BookOpen, Plus, Search, Edit, Trash2, Globe, Clock, User, Users, ArrowRight } from '@/components/icons';
import { CourseFormModal } from '../../../components/admin/courses/CourseFormModal';

interface FormateurInfo {
    id: string;
    prenom: string;
    nom: string;
    avatar?: string | null;
}

interface CertificationInfo {
    id: string;
    nom: string;
    codeExamen: string;
    fournisseur?: { nom: string } | null;
}

interface CourseData {
    id: string;
    titre: string;
    description?: string | null;
    statut: 'BROUILLON' | 'PUBLIE' | 'ARCHIVE';
    dureeEstimee?: number | null;
    dateCreation: string;
    imageUrl?: string | null;
    objectifs: string[];
    prerequis: string[];
    publicCible: string[];
    formateur?: FormateurInfo | null;
    certification?: CertificationInfo | null;
    _count?: { modules: number; inscriptions?: number } | null;
}

export default function AdminCoursesPage() {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const router = useRouter();

    const [courses, setCourses] = useState<CourseData[]>([]);
    const [certifications, setCertifications] = useState<CertificationInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [certFilter, setCertFilter] = useState('ALL');

    // Edit Modal state
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Modal error states
    const [editModalError, setEditModalError] = useState<string | null>(null);

    const fetchCoursesAndCerts = async () => {
        setLoading(true);
        try {
            const [coursesData, certsData] = await Promise.all([
                apiFetch('/cours/admin/all'),
                apiFetch('/certifications')
            ]);
            setCourses(Array.isArray(coursesData) ? coursesData : []);
            setCertifications(Array.isArray(certsData) ? certsData : (certsData?.data || []));
        } catch (err: any) {
            console.error("Erreur chargement cours admin:", err);
            showToast(err.message || "Erreur lors du chargement des données.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoursesAndCerts();
    }, []);

    const handleOpenEditModal = (course: CourseData) => {
        setEditModalError(null);
        setSelectedCourse({
            id: course.id,
            titre: course.titre,
            description: course.description,
            dureeEstimee: course.dureeEstimee,
            imageUrl: course.imageUrl,
            certificationId: course.certification?.id ? Number(course.certification.id) : null,
            objectifs: course.objectifs || [],
            prerequis: course.prerequis || [],
            publicCible: course.publicCible || [],
            statut: course.statut,
        });
    };

    const handleUpdateCourse = useCallback(async (payload: any) => {
        if (!selectedCourse) return;

        setUpdateLoading(true);
        setEditModalError(null);
        try {
            await apiFetch(`/cours/${selectedCourse.id}`, {
                method: 'PATCH',
                body: payload
            });

            showToast(`Le cours "${payload.titre}" a été mis à jour.`, "success");
            setSelectedCourse(null);
            fetchCoursesAndCerts();
        } catch (err: any) {
            const msg = err.message || "Erreur lors de la mise à jour.";
            setEditModalError(msg);
            showToast(msg, "error");
        } finally {
            setUpdateLoading(false);
        }
    }, []);

    const handleDeleteCourse = async (course: CourseData) => {
        const isConfirmed = await confirm({
            title: "Supprimer ce cours ?",
            message: `Êtes-vous sûr de vouloir supprimer le cours "${course.titre}" ? Tous les modules et ressources associés seront perdus.`,
            confirmText: "Oui, supprimer",
            cancelText: "Annuler",
            type: "danger"
        });

        if (!isConfirmed) return;

        try {
            await apiFetch(`/cours/${course.id}`, { method: 'DELETE' });
            showToast("Le cours a été supprimé avec succès.", "success");
            fetchCoursesAndCerts();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la suppression.", "error");
        }
    };

    const handlePublishCourse = async (course: CourseData) => {
        const isConfirmed = await confirm({
            title: "Publier ce cours ?",
            message: `Voulez-vous publier le cours "${course.titre}" ? Il sera visible par tous les apprenants.`,
            confirmText: "Oui, publier",
            cancelText: "Annuler",
            type: "info"
        });

        if (!isConfirmed) return;

        try {
            await apiFetch(`/cours/${course.id}/publier`, { method: 'PATCH' });
            showToast("Le cours a été publié avec succès !", "success");
            fetchCoursesAndCerts();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la publication.", "error");
        }
    };

    const filteredCourses = React.useMemo(() => {
        return courses.filter(c => {
            const matchesSearch = c.titre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (c.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 (c.formateur?.prenom || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 (c.formateur?.nom || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || c.statut === statusFilter;
            const matchesCert = certFilter === 'ALL' || c.certification?.id === certFilter;

            return matchesSearch && matchesStatus && matchesCert;
        });
    }, [courses, searchQuery, statusFilter, certFilter]);

    // Summary calculations
    const stats = React.useMemo(() => {
        const total = courses.length;
        const published = courses.filter(c => c.statut === 'PUBLIE').length;
        const draft = courses.filter(c => c.statut === 'BROUILLON').length;
        return { total, published, draft };
    }, [courses]);

    const closeEditModal = useCallback(() => { if (!updateLoading) setSelectedCourse(null); }, [updateLoading]);

    return (
        <div className="space-y-6 md:space-y-8 pb-12 text-slate-800">
            {/* STATS GENERALES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Total des Cours</p>
                        <h2 className="text-3xl font-black text-slate-950">{stats.total}</h2>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <BookOpen className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Cours Publiés</p>
                        <h2 className="text-3xl font-black text-slate-950 text-emerald-600">{stats.published}</h2>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Globe className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Brouillons / Privés</p>
                        <h2 className="text-3xl font-black text-slate-950 text-amber-600">{stats.draft}</h2>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Edit className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* FILTRES & RECHERCHE */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 md:p-6 bg-white border border-slate-200/90 rounded-3xl shadow-sm">
                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                    {/* Recherche */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher un cours par titre ou auteur..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                        />
                    </div>

                    {/* Filtres Dropdowns */}
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-950 text-xs font-bold outline-none cursor-pointer"
                        >
                            <option value="ALL">Tous les Statuts</option>
                            <option value="PUBLIE">Publiés</option>
                            <option value="BROUILLON">Brouillons</option>
                            <option value="ARCHIVE">Archivés</option>
                        </select>

                        <select
                            value={certFilter}
                            onChange={(e) => setCertFilter(e.target.value)}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-950 text-xs font-bold outline-none cursor-pointer max-w-[200px]"
                        >
                            <option value="ALL">Toutes les Certifications</option>
                            {certifications.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.codeExamen ? `[${c.codeExamen}] ` : ''}{c.nom}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* GRILLE RESPONSIVE DE COURS */}
            {loading ? (
                <div className="py-24 text-center">
                    <span className="w-10 h-10 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Chargement du catalogue...</p>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="p-12 text-center bg-white border border-slate-200/90 rounded-3xl text-slate-400 font-medium">
                    Aucun cours ne correspond à vos filtres de recherche.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <div
                            key={course.id}
                            className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-350 transition-all duration-300 flex flex-col"
                        >
                            {/* Image Header */}
                            <div onClick={() => handleOpenEditModal(course)} className="relative w-full h-[200px] bg-gradient-to-br from-slate-100 to-slate-200 cursor-pointer">
                                {course.imageUrl ? (
                                    <img src={course.imageUrl} alt={course.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="w-10 h-10 text-slate-300 group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                )}
                                <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-md font-extrabold text-[8px] uppercase tracking-wider z-10 pointer-events-none ${
                                    course.statut === 'PUBLIE' ? 'bg-emerald-600 text-white' : course.statut === 'ARCHIVE' ? 'bg-slate-600 text-white' : 'bg-amber-600 text-white'
                                }`}>
                                    {course.statut}
                                </span>
                                <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-slate-900/80 text-white text-[8px] font-extrabold rounded-md uppercase tracking-wider z-10 pointer-events-none">
                                    {course.certification?.codeExamen || course.certification?.nom || 'Certification'}
                                </span>
                            </div>

                            {/* Card Content */}
                            <div className="p-4 flex-1 flex flex-col gap-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                        {course.certification?.fournisseur?.nom || 'Général'}
                                    </span>
                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                        {course._count?.modules || 0} modules
                                    </span>
                                </div>

                                <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {course.titre}
                                </h3>

                                <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                    {course.description || "Aucune description fournie pour ce cours."}
                                </p>

                                <div className="flex items-center gap-3 mt-auto pt-2 text-[10px] text-slate-400 font-bold">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {course.dureeEstimee || 0} h estimées
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {course._count?.inscriptions || 0} inscrits
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-50">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-black shrink-0 overflow-hidden">
                                        {course.formateur?.avatar ? (
                                            <img src={course.formateur.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            course.formateur ? `${course.formateur.prenom[0]}${course.formateur.nom[0]}` : 'ED'
                                        )}
                                    </div>
                                    <span className="truncate">Par {course.formateur ? `${course.formateur.prenom} ${course.formateur.nom}` : 'Ethical Data'}</span>
                                </div>

                                <button
                                    onClick={() => router.push(`/dashboard/cours/${course.id}`)}
                                    className="self-start flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Consulter <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Actions / Card Footer */}
                            <div className="border-t border-slate-100 p-3 flex items-center gap-2 bg-slate-50/50">
                                <button
                                    onClick={() => handleOpenEditModal(course)}
                                    className="flex-1 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Modifier</span>
                                </button>
                                {course.statut === 'BROUILLON' && (
                                <button
                                    onClick={() => handlePublishCourse(course)}
                                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                >
                                    <Globe className="w-3.5 h-3.5" />
                                    <span>Publier</span>
                                </button>
                                )}
                                <button
                                    onClick={() => handleDeleteCourse(course)}
                                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Supprimer</span>
                                </button>
                            </div>
                        </div>
                        ))}
                </div>
            )}

            {/* MODALE D'ÉDITION */}
            <CourseFormModal
                isOpen={selectedCourse !== null}
                onClose={closeEditModal}
                onSubmit={handleUpdateCourse}
                initialData={selectedCourse}
                certifications={certifications}
                modalLoading={updateLoading}
                modalError={editModalError}
            />
        </div>
    );
}
