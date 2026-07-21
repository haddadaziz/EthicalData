"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { Search, Plus, Edit, Trash2, Award, BookOpen, Clock, Activity, ArrowLeft, ArrowRight, ChevronDown } from '@/components/icons';
import { SimulationFormModal } from '../../../components/admin/simulations/SimulationFormModal';
import { getCertificateBadgeLogo } from '../../../lib/certification-utils';

interface CertificationInfo {
    id: string;
    nom: string;
    codeExamen: string;
    slug: string;
    image?: string;
}

interface CourseInfo {
    id: string;
    titre: string;
}

interface Question {
    id: string;
    type: string;
    enonce: string;
    reponseCorrecte: string;
    explication?: string;
    categorie?: string;
    grilleNotation?: string;
    options?: { lettre: string; texte: string }[];
}

interface SimulationData {
    id: string;
    titre: string;
    description?: string | null;
    duree: number;
    scoreMinimal: number;
    dateCreation: string;
    statut?: string;
    certificationId: string;
    certification: CertificationInfo | null;
    coursId?: string | null;
    cours: CourseInfo | null;
    _count: { questions: number; tentatives: number };
    questions?: Question[];
}

export default function AdminSimulationsPage() {
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const [simulations, setSimulations] = useState<SimulationData[]>([]);
    const [certifications, setCertifications] = useState<CertificationInfo[]>([]);
    const [coursesList, setCoursesList] = useState<CourseInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCertFilter, setSelectedCertFilter] = useState('TOUS');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [certDropdownOpen, setCertDropdownOpen] = useState(false);

    // Modal state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingSim, setEditingSim] = useState<SimulationData | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [simsData, certsData, coursesData] = await Promise.all([
                apiFetch('/simulations'),
                apiFetch('/certifications'),
                apiFetch('/cours/admin/all'),
            ]);
            setSimulations(Array.isArray(simsData) ? simsData : []);
            setCertifications(Array.isArray(certsData) ? certsData : (certsData?.data || []));
            setCoursesList(Array.isArray(coursesData) ? coursesData : []);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Impossible de récupérer les simulations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCertFilter]);

    const filteredSimulations = useMemo(() => {
        return simulations.filter(sim => {
            const search = searchTerm.toLowerCase().trim();
            const matchesSearch = !search || sim.titre.toLowerCase().includes(search) ||
                                  (sim.description && sim.description.toLowerCase().includes(search));
            const matchesCert = selectedCertFilter === 'TOUS' || sim.certificationId === selectedCertFilter;
            return matchesSearch && matchesCert;
        });
    }, [simulations, searchTerm, selectedCertFilter]);

    const totalPages = Math.ceil(filteredSimulations.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSimulations = useMemo(() => {
        return filteredSimulations.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredSimulations, indexOfFirstItem, indexOfLastItem]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [filteredSimulations, totalPages, currentPage]);

    const handleDelete = async (sim: SimulationData) => {
        const ok = await confirm({
            title: "Supprimer cette simulation ?",
            message: `Voulez-vous vraiment supprimer la simulation "${sim.titre}" ? Cette action est irréversible et supprimera toutes ses questions et tentatives associées.`,
            confirmText: "Supprimer",
            cancelText: "Annuler",
            type: "danger"
        });
        if (!ok) return;
        try {
            await apiFetch(`/simulations/${sim.id}`, { method: 'DELETE' });
            showToast("Simulation supprimée.", "success");
            fetchData();
        } catch (err: any) {
            showToast(err.message || 'Erreur lors de la suppression.', "error");
        }
    };

    const getStatutBadge = (statut?: string) => {
        if (statut === 'PUBLIE') return 'bg-emerald-950/30 text-emerald-300';
        return 'bg-amber-950/30 text-amber-300';
    };

    const selectedCert = selectedCertFilter !== 'TOUS' ? certifications.find(c => c.id === selectedCertFilter) : null;

    return (
        <div className="space-y-6 md:space-y-8 pb-12 bg-[#020617] text-slate-300">
            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-5 md:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                    <div className="flex flex-1 items-center gap-3 w-full max-w-lg">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                <Search className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                placeholder="Rechercher ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 transition-all text-xs outline-none font-bold rounded-2xl"
                            />
                        </div>

                        {certifications.length > 0 && (
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setCertDropdownOpen(!certDropdownOpen)}
                                    className="flex items-center gap-2.5 px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-2xl text-white text-xs font-bold outline-none cursor-pointer hover:bg-slate-800/50 transition-all min-w-[200px]"
                                >
                                    {selectedCert && getCertificateBadgeLogo(selectedCert) && (
                                        <img src={getCertificateBadgeLogo(selectedCert)} alt="" className="w-5 h-5 object-contain rounded shrink-0" />
                                    )}
                                    <span className="flex-1 text-left truncate">
                                        {selectedCertFilter === 'TOUS' ? 'Toutes les certifications' : selectedCert?.codeExamen || selectedCert?.nom || 'Sélectionner'}
                                    </span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${certDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {certDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setCertDropdownOpen(false)} />
                                        <div className="absolute top-full left-0 mt-1.5 z-50 w-72 bg-[#080d1a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                                            <button
                                                onClick={() => { setSelectedCertFilter('TOUS'); setCertDropdownOpen(false); }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-800/30 cursor-pointer ${
                                                    selectedCertFilter === 'TOUS' ? 'bg-slate-900/50 text-white' : 'text-slate-400'
                                                }`}
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-slate-900/50 flex items-center justify-center shrink-0">
                                                    <Award className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <span className="truncate">Toutes les certifications</span>
                                            </button>
                                            <div className="border-t border-slate-800" />
                                            <div className="max-h-64 overflow-y-auto">
                                                {certifications.map(c => {
                                                    const logo = getCertificateBadgeLogo(c);
                                                    return (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => { setSelectedCertFilter(c.id); setCertDropdownOpen(false); }}
                                                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-800/30 cursor-pointer ${
                                                                selectedCertFilter === c.id ? 'bg-slate-900/50 text-white' : 'text-slate-400'
                                                            }`}
                                                        >
                                                            {logo ? (
                                                                <img src={logo} alt="" className="w-7 h-7 object-contain rounded shrink-0" />
                                                            ) : (
                                                                <div className="w-7 h-7 rounded-lg bg-slate-900/50 flex items-center justify-center shrink-0">
                                                                    <Award className="w-4 h-4 text-slate-400" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <span className="block truncate">{c.codeExamen || c.nom}</span>
                                                                {c.codeExamen && c.nom && (
                                                                    <span className="block text-[10px] text-slate-400 truncate mt-0.5">{c.nom}</span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto shrink-0">
                        <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
                            {filteredSimulations.length} simulation{filteredSimulations.length > 1 ? 's' : ''}
                        </span>
                        <button
                            onClick={() => { setEditingSim(null); setIsFormModalOpen(true); }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-600/20 rounded-2xl text-xs font-bold cursor-pointer transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nouvelle simulation</span>
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
                ) : filteredSimulations.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-wide text-xs min-h-[400px] flex flex-col items-center justify-center">
                        {simulations.length === 0 ? 'Aucune simulation créée pour le moment.' : 'Aucune simulation ne correspond à vos critères.'}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                            {currentSimulations.map((sim) => (
                                <div key={sim.id} onClick={() => { setEditingSim(sim); setIsFormModalOpen(true); }} className="bg-[#080d1a] border border-slate-800 rounded-2xl p-4 flex flex-col group transition-all duration-300 hover:shadow-lg hover:border-slate-700 cursor-pointer">
                                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 bg-[#080d1a] border border-slate-800">
                                        <img src="/images/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0 opacity-50 mix-blend-screen pointer-events-none" />

                                        <div className="absolute top-3 left-3 z-30 flex flex-col gap-1 pointer-events-none">
                                            {sim.certification?.codeExamen && (
                                                <div className="bg-red-600 text-white font-extrabold uppercase text-[8px] tracking-wider px-2 py-0.5 rounded-md border border-red-500/50 shadow-sm w-fit hover:bg-red-700 transition-colors">
                                                    {sim.certification.codeExamen}
                                                </div>
                                            )}
                                            <div className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider w-fit shadow-sm ${getStatutBadge(sim.statut)}`}>
                                                {sim.statut === 'PUBLIE' ? 'Publié' : 'Brouillon'}
                                            </div>
                                            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-extrabold uppercase text-[8px] tracking-wider px-2 py-0.5 rounded-md border border-blue-500/50 shadow-sm w-fit hover:from-blue-500 hover:to-cyan-500 transition-colors">
                                                {sim._count.questions} Question{sim._count.questions > 1 ? 's' : ''}
                                            </div>
                                        </div>

                                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                            <div className="w-32 h-32 lg:w-24 lg:h-24 flex items-center justify-center transition-transform duration-500 -translate-y-3 group-hover:-translate-y-5">
                                                {(() => {
                                                    const cert = certifications.find(c => c.id.toString() === sim.certificationId.toString()) || sim.certification;
                                                    const logo = cert ? getCertificateBadgeLogo(cert) : '';
                                                    return logo ? (
                                                        <img src={logo} alt="" className="max-w-full max-h-full object-contain filter drop-shadow-xl" />
                                                    ) : (
                                                        <Activity className="w-8 h-8 text-cyan-400" />
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex flex-col">
                                        <h3 className="text-sm font-black text-white leading-snug line-clamp-2">
                                            {sim.titre}
                                        </h3>

                                        <div className="pt-3 border-t border-slate-800 flex items-center gap-2 mt-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingSim(sim); setIsFormModalOpen(true); }}
                                                className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-600/20 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                                <span>Gérer</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(sim); }}
                                                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Supprimer</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                                                className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${isActive ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white' : 'bg-transparent text-slate-400 hover:bg-slate-800/30 hover:text-white'}`}
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

            {/* Modal simulation (création / édition) avec questions intégrées */}
            <SimulationFormModal
                isOpen={isFormModalOpen}
                onClose={() => { setIsFormModalOpen(false); setEditingSim(null); }}
                onSaved={fetchData}
                editingSim={editingSim}
                certifications={certifications}
                coursesList={coursesList}
            />
        </div>
    );
}
