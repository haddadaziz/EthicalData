"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { Search, Plus, Edit, Trash2, Tag, Clock, Calendar, BookOpen, Check, ChevronDown, ArrowLeft, ArrowRight } from '@/components/icons';
import { PromotionFormModal } from '../../../components/admin/promotions/PromotionFormModal';

interface CourseInfo {
    id: string;
    titre: string;
}

interface PromotionData {
    id: string;
    nom: string;
    description?: string | null;
    type: 'POURCENTAGE' | 'MONTANT';
    valeur: number;
    targetType: 'FORMATION' | 'VOUCHER' | 'PACK_EXAMEN_BLANC';
    targetId?: string | null;
    cibleNom?: string | null;
    dateDebut?: string | null;
    dateFin?: string | null;
    actif: boolean;
    isPublic: boolean;
    dateCreation: string;
    statut: 'ACTIVE' | 'A_VENIR' | 'EXPIREE' | 'INACTIVE';
    cours?: { id: string; titre: string } | null;
}

const TARGET_LABELS: Record<string, string> = {
    FORMATION: 'Formation',
    VOUCHER: "Voucher d'examen",
    PACK_EXAMEN_BLANC: "Pack d'examens blancs",
};

const STATUT_BADGES: Record<string, string> = {
    ACTIVE: 'bg-emerald-950/30 text-emerald-300',
    A_VENIR: 'bg-blue-950/30 text-blue-300',
    EXPIREE: 'bg-rose-950/30 text-rose-300',
    INACTIVE: 'bg-slate-800/50 text-slate-400',
};

export default function AdminPromotionsPage() {
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const [promotions, setPromotions] = useState<PromotionData[]>([]);
    const [coursesList, setCoursesList] = useState<CourseInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statutFilter, setStatutFilter] = useState('TOUS');
    const [targetFilter, setTargetFilter] = useState('TOUS');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [statutDropdownOpen, setStatutDropdownOpen] = useState(false);
    const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromotionData | null>(null);

    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [togglingPublicId, setTogglingPublicId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [promosData, coursesData] = await Promise.all([
                apiFetch('/promotions'),
                apiFetch('/cours/admin/all'),
            ]);
            setPromotions(Array.isArray(promosData) ? promosData : []);
            setCoursesList(Array.isArray(coursesData) ? coursesData : []);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Impossible de récupérer les promotions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statutFilter, targetFilter]);

    const stats = useMemo(() => {
        const actives = promotions.filter(p => p.statut === 'ACTIVE').length;
        const aVenir = promotions.filter(p => p.statut === 'A_VENIR').length;
        const expirees = promotions.filter(p => p.statut === 'EXPIREE').length;
        const inactives = promotions.filter(p => p.statut === 'INACTIVE').length;
        return { actives, aVenir, expirees, inactives };
    }, [promotions]);

    const filteredPromotions = useMemo(() => {
        return promotions.filter(promo => {
            const search = searchTerm.toLowerCase().trim();
            const matchesSearch = !search || promo.nom.toLowerCase().includes(search) ||
                                  (promo.description && promo.description.toLowerCase().includes(search)) ||
                                  (promo.cibleNom && promo.cibleNom.toLowerCase().includes(search));
            const matchesStatut = statutFilter === 'TOUS' || promo.statut === statutFilter;
            const matchesTarget = targetFilter === 'TOUS' || promo.targetType === targetFilter;
            return matchesSearch && matchesStatut && matchesTarget;
        });
    }, [promotions, searchTerm, statutFilter, targetFilter]);

    const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPromotions = useMemo(() => {
        return filteredPromotions.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredPromotions, indexOfFirstItem, indexOfLastItem]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [filteredPromotions, totalPages, currentPage]);

    const handleToggle = async (promo: PromotionData) => {
        setTogglingId(promo.id);
        try {
            await apiFetch(`/promotions/${promo.id}/toggle`, { method: 'PATCH' });
            showToast(promo.actif ? `Promotion "${promo.nom}" désactivée.` : `Promotion "${promo.nom}" activée !`, "success");
            fetchData();
        } catch (err: any) {
            showToast(err.message || 'Erreur lors de l\'activation.', "error");
        } finally {
            setTogglingId(null);
        }
    };

    const handleTogglePublic = async (promo: PromotionData) => {
        setTogglingPublicId(promo.id);
        try {
            await apiFetch(`/promotions/${promo.id}/toggle-public`, { method: 'PATCH' });
            showToast(promo.isPublic ? `Promotion "${promo.nom}" passée en privé.` : `Promotion "${promo.nom}" rendue publique.`, "success");
            fetchData();
        } catch (err: any) {
            showToast(err.message || 'Erreur lors du changement de visibilité.', "error");
        } finally {
            setTogglingPublicId(null);
        }
    };

    const handleDelete = async (promo: PromotionData) => {
        const ok = await confirm({
            title: "Supprimer cette promotion ?",
            message: `Voulez-vous vraiment supprimer la promotion "${promo.nom}" ? Cette action est irréversible.`,
            confirmText: "Supprimer",
            cancelText: "Annuler",
            type: "danger"
        });
        if (!ok) return;
        try {
            await apiFetch(`/promotions/${promo.id}`, { method: 'DELETE' });
            showToast("Promotion supprimée.", "success");
            fetchData();
        } catch (err: any) {
            showToast(err.message || 'Erreur lors de la suppression.', "error");
        }
    };

    const formatDate = (iso?: string | null) => {
        if (!iso) return null;
        const d = new Date(iso);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getTargetDisplay = (promo: PromotionData) => {
        if (promo.targetType === 'FORMATION') {
            if (promo.cours?.titre) return promo.cours.titre;
            if (promo.cibleNom) return promo.cibleNom;
            return 'Toutes les formations';
        }
        return promo.cibleNom || TARGET_LABELS[promo.targetType];
    };

    const statutFilterLabels: Record<string, string> = {
        TOUS: 'Tous les statuts',
        ACTIVE: 'Actives',
        A_VENIR: 'À venir',
        EXPIREE: 'Expirées',
        INACTIVE: 'Inactives',
    };

    return (
        <div className="space-y-6 md:space-y-8 pb-12 bg-[#020617] text-slate-300">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-950/30 border-blue-800/50 text-blue-400 flex items-center justify-center"><Tag className="w-4 h-4" /></div>
                    </div>
                    <p className="text-3xl font-black text-white">{promotions.length}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">promotions créées</p>
                </div>
                <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actives</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-950/30 border-emerald-800/50 text-emerald-400 flex items-center justify-center"><Check className="w-4 h-4" /></div>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.actives}</p>
                    <p className="text-[10px] text-emerald-500/70 font-bold mt-1">en cours actuellement</p>
                </div>
                <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">À venir</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-950/30 border-blue-800/50 text-blue-400 flex items-center justify-center"><Clock className="w-4 h-4" /></div>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.aVenir}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">planifiées</p>
                </div>
                <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expirées</span>
                        <div className="w-9 h-9 rounded-xl bg-rose-950/30 border-rose-800/50 text-rose-400 flex items-center justify-center"><Calendar className="w-4 h-4" /></div>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.expirees}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">{stats.inactives} inactives</p>
                </div>
            </div>

            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-5 md:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                    <div className="flex flex-1 items-center gap-3 w-full max-w-lg">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                <Search className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                placeholder="Rechercher une promotion..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 transition-all text-xs outline-none font-bold rounded-2xl"
                            />
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => { setStatutDropdownOpen(!statutDropdownOpen); setTargetDropdownOpen(false); }}
                                className="flex items-center gap-2.5 px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-2xl text-white text-xs font-bold outline-none cursor-pointer hover:bg-slate-800/50 transition-all min-w-[150px]"
                            >
                                <span className="flex-1 text-left truncate">{statutFilterLabels[statutFilter]}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${statutDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {statutDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setStatutDropdownOpen(false)} />
                                    <div className="absolute top-full left-0 mt-1.5 z-50 w-44 bg-[#080d1a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                                        {['TOUS', 'ACTIVE', 'A_VENIR', 'EXPIREE', 'INACTIVE'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => { setStatutFilter(s); setStatutDropdownOpen(false); }}
                                                className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-left transition-colors hover:bg-slate-800/30 cursor-pointer ${statutFilter === s ? 'bg-slate-900/50 text-white' : 'text-slate-400'}`}
                                            >
                                                <span className="truncate">{statutFilterLabels[s]}</span>
                                                {statutFilter === s && <Check className="w-3.5 h-3.5 text-amber-400 ml-auto shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => { setTargetDropdownOpen(!targetDropdownOpen); setStatutDropdownOpen(false); }}
                                className="flex items-center gap-2.5 px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-2xl text-white text-xs font-bold outline-none cursor-pointer hover:bg-slate-800/50 transition-all min-w-[150px]"
                            >
                                <span className="flex-1 text-left truncate">{targetFilter === 'TOUS' ? 'Toutes les cibles' : TARGET_LABELS[targetFilter]}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${targetDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {targetDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setTargetDropdownOpen(false)} />
                                    <div className="absolute top-full left-0 mt-1.5 z-50 w-52 bg-[#080d1a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                                        {['TOUS', 'FORMATION', 'VOUCHER', 'PACK_EXAMEN_BLANC'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => { setTargetFilter(t); setTargetDropdownOpen(false); }}
                                                className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-left transition-colors hover:bg-slate-800/30 cursor-pointer ${targetFilter === t ? 'bg-slate-900/50 text-white' : 'text-slate-400'}`}
                                            >
                                                <span className="truncate">{t === 'TOUS' ? 'Toutes les cibles' : TARGET_LABELS[t]}</span>
                                                {targetFilter === t && <Check className="w-3.5 h-3.5 text-amber-400 ml-auto shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto shrink-0">
                        <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
                            {filteredPromotions.length} promotion{filteredPromotions.length > 1 ? 's' : ''}
                        </span>
                        <button
                            onClick={() => { setEditingPromo(null); setIsFormModalOpen(true); }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-600/20 rounded-2xl text-xs font-bold cursor-pointer transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nouvelle promotion</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-16 text-center text-slate-400">
                        <span className="w-10 h-10 border-4 border-slate-800 border-t-slate-950 rounded-full animate-spin inline-block mb-3" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Chargement...</p>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center">
                        <p className="text-rose-500 font-bold mb-2 text-sm">Une erreur est survenue</p>
                        <p className="text-xs text-slate-400 mb-6">{error}</p>
                        <button onClick={fetchData} className="px-5 py-2.5 bg-[#020617] hover:bg-slate-800/50 border border-slate-800 text-white font-bold rounded-xl cursor-pointer transition-colors text-xs">Réessayer</button>
                    </div>
                ) : filteredPromotions.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-wide text-xs min-h-[400px] flex flex-col items-center justify-center">
                        {promotions.length === 0 ? 'Aucune promotion créée pour le moment.' : 'Aucune promotion ne correspond à vos critères.'}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-6">
                            {currentPromotions.map((promo) => {
                                const isActif = promo.actif;
                                return (
                                    <div key={promo.id} className="bg-[#020617] border border-slate-800 rounded-2xl p-5 flex flex-col group transition-all duration-300 hover:shadow-lg hover:border-slate-700">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${isActif ? 'bg-amber-950/30 border-amber-800/50 text-amber-400' : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}>
                                                    <Tag className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-black text-white leading-snug truncate">{promo.nom}</h3>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider mt-1 ${STATUT_BADGES[promo.statut]}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${promo.statut === 'ACTIVE' ? 'bg-emerald-400' : 'bg-current'}`} />
                                                        {promo.statut === 'ACTIVE' ? 'Active' : promo.statut === 'A_VENIR' ? 'À venir' : promo.statut === 'EXPIREE' ? 'Expirée' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-black border ${isActif ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-transparent text-white shadow-sm shadow-amber-600/20' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}>
                                                {promo.type === 'POURCENTAGE' ? `-${promo.valeur}%` : `-${promo.valeur} MAD`}
                                            </div>
                                        </div>

                                        {promo.description && (
                                            <p className="mt-3 text-xs text-slate-400 font-semibold line-clamp-2 min-h-[2rem]">{promo.description}</p>
                                        )}

                                        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                                <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                <span className="truncate">{TARGET_LABELS[promo.targetType]}</span>
                                                <span className="text-slate-600">•</span>
                                                <span className="truncate text-slate-300">{getTargetDisplay(promo)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                                    {formatDate(promo.dateDebut) || 'Immédiate'}
                                                </span>
                                                {promo.dateFin && (
                                                    <>
                                                        <span className="text-slate-700">→</span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                                                            {formatDate(promo.dateFin)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-auto space-y-2.5">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleToggle(promo)}
                                                    disabled={togglingId === promo.id}
                                                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-50 ${isActif ? 'bg-emerald-600' : 'bg-slate-700'}`}
                                                    title={isActif ? 'Désactiver la promotion' : 'Activer la promotion'}
                                                >
                                                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isActif ? 'left-5' : 'left-0.5'}`} />
                                                </button>
                                                <span className="text-[11px] font-bold text-slate-400 flex-1">
                                                    {togglingId === promo.id ? '...' : (isActif ? 'Activée' : 'Désactivée')}
                                                </span>
                                                <button
                                                    onClick={() => { setEditingPromo(promo); setIsFormModalOpen(true); }}
                                                    className="p-2 bg-blue-950/30 hover:bg-blue-950/50 border border-blue-800/50 text-blue-400 hover:text-blue-300 rounded-xl transition-colors cursor-pointer"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(promo)}
                                                    className="p-2 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-800/50 text-rose-400 hover:text-rose-300 rounded-xl transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                                                <button
                                                    onClick={() => handleTogglePublic(promo)}
                                                    disabled={togglingPublicId === promo.id}
                                                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-50 ${promo.isPublic ? 'bg-blue-600' : 'bg-slate-700'}`}
                                                    title={promo.isPublic ? 'Passer en privé' : 'Rendre public'}
                                                >
                                                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${promo.isPublic ? 'left-5' : 'left-0.5'}`} />
                                                </button>
                                                <span className="text-[11px] font-bold text-slate-400 flex-1">
                                                    {togglingPublicId === promo.id ? '...' : (promo.isPublic ? 'Publique' : 'Privée')}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${promo.isPublic ? 'bg-blue-950/30 text-blue-300' : 'bg-slate-800/50 text-slate-400'}`}>
                                                    {promo.isPublic ? 'Public' : 'Privé'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="p-6 border-t border-slate-800 flex items-center justify-between bg-[#020617]">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-[#080d1a] shadow-sm"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>Précédent</span>
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }).map((_, index) => {
                                        const pageNum = index + 1;
                                        const isActive = currentPage === pageNum;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${isActive ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_0_15px_rgba(245,158,11,0.4)] text-white' : 'bg-transparent text-slate-400 hover:bg-slate-800/30 hover:text-white'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-[#080d1a] shadow-sm"
                                >
                                    <span>Suivant</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <PromotionFormModal
                isOpen={isFormModalOpen}
                onClose={() => { setIsFormModalOpen(false); setEditingPromo(null); }}
                onSaved={fetchData}
                editingPromo={editingPromo}
                coursesList={coursesList}
            />
        </div>
    );
}
