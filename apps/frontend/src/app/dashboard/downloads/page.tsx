"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { Search, Download, BookOpen, FolderOpen, FileText, ChevronLeft, Globe, Video, Link as LinkIcon, Puzzle, Filter, ArrowRight, ArrowLeft, Clock, User, ChevronDown, ChevronUp } from '@/components/icons';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../context/ToastContext';

type Tab = 'generales' | 'mes-cours' | 'historique';

export default function DownloadsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('mes-cours');
    const [searchTerm, setSearchTerm] = useState('');

    // Ressources générales
    const [publicResources, setPublicResources] = useState<any[]>([]);
    const [certs, setCerts] = useState<any[]>([]);
    const [loadingPublic, setLoadingPublic] = useState(true);

    // Mes cours (inscriptions)
    const [inscriptions, setInscriptions] = useState<any[]>([]);
    const [loadingInscriptions, setLoadingInscriptions] = useState(true);

    // Historique des téléchargements
    const [downloadHistory, setDownloadHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [expandedResources, setExpandedResources] = useState<Record<string, boolean>>({});

    const { showToast } = useToast();

    const groupedHistory = React.useMemo(() => {
        const map = new Map<string, any[]>();
        downloadHistory.forEach((h: any) => {
            const key = h.ressource?.id || h.id;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(h);
        });
        return Array.from(map.entries()).map(([resId, items]) => ({
            ressourceId: resId,
            ressource: items[0].ressource,
            items,
            count: items.length,
            firstDate: items[items.length - 1].date,
        })).sort((a, b) => new Date(b.firstDate).getTime() - new Date(a.firstDate).getTime());
    }, [downloadHistory]);

    // Pagination
    const ITEMS_PER_PAGE = 6;
    const [currentPage, setCurrentPage] = useState(1);

    // Filtres ressources générales
    const [selectedCertFilter, setSelectedCertFilter] = useState('TOUS');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('TOUS');
    const [certDropdownOpen, setCertDropdownOpen] = useState(false);
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    // Filtre progression mes cours
    const [progressionFilter, setProgressionFilter] = useState<'TOUS' | 'EN_COURS' | 'TERMINE'>('TOUS');

    // Ressources d'un cours sélectionné (modal)
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

    useEffect(() => {
        apiFetch('/resources')
            .then((data) => setPublicResources(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoadingPublic(false));

        apiFetch('/certifications')
            .then((data) => setCerts(Array.isArray(data) ? data : (data?.data || [])))
            .catch(() => {});

        apiFetch('/cours/mes-inscriptions')
            .then((data) => setInscriptions(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoadingInscriptions(false));

        apiFetch('/resources/me/historique')
            .then((data) => setDownloadHistory(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoadingHistory(false));
    }, []);

    const uniqueTypes = Array.from(new Set(publicResources.map(r => r.type))).sort();

    const filteredPublic = publicResources.filter((res: any) => {
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch = !q ||
            res.titre?.toLowerCase().includes(q) ||
            res.description?.toLowerCase().includes(q) ||
            res.type?.toLowerCase().includes(q);
        const matchesCert = selectedCertFilter === 'TOUS' || res.certification?.id === selectedCertFilter;
        const matchesType = selectedTypeFilter === 'TOUS' || res.type === selectedTypeFilter;
        return matchesSearch && matchesCert && matchesType;
    });

    const totalPages = Math.ceil(filteredPublic.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentPublic = filteredPublic.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCertFilter, selectedTypeFilter]);

    const filteredInscriptions = inscriptions.filter((insc: any) => {
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch = !q || insc.cours?.titre?.toLowerCase().includes(q);
        const matchesProgression = progressionFilter === 'TOUS' ||
            (progressionFilter === 'EN_COURS' && insc.progression < 100) ||
            (progressionFilter === 'TERMINE' && insc.progression >= 100);
        return matchesSearch && matchesProgression;
    });

    const formatBytes = (bytes: number | null) => {
        if (!bytes) return null;
        if (bytes < 1024) return `${bytes} o`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} Ko`;
        return `${(bytes / 1048576).toFixed(1)} Mo`;
    };

    const handleDownload = async (resourceId: string) => {
        try {
            const result = await apiFetch(`/resources/${resourceId}/download`, { method: 'POST' });
            if (result?.url) {
                window.open(result.url, '_blank');
            }
            apiFetch('/resources/me/historique')
                .then((data) => setDownloadHistory(Array.isArray(data) ? data : []))
                .catch(() => {});
        } catch (err: any) {
            showToast(err.message || 'Erreur de téléchargement', 'error');
        }
    };

    const typeLabel = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'PDF': return 'PDF';
            case 'VIDEO': return 'Vidéo';
            case 'LIEN_EXTERNE': return 'Lien externe';
            case 'EXERCICE': return 'Exercice';
            case 'SLIDE': return 'Slides';
            case 'DATASET': return 'Dataset';
            default: return type || 'Fichier';
        }
    };

    const typeIcon = (type: string, size: 'sm' | 'md' = 'md') => {
        const cls = size === 'sm' ? 'w-5 h-5' : 'w-4 h-4';
        switch (type?.toUpperCase()) {
            case 'PDF': return <img src="/logos/pdf.webp" alt="PDF" className={`${cls} object-contain`} />;
            case 'VIDEO': return <Video className={cls} />;
            case 'LIEN_EXTERNE': return <LinkIcon className={cls} />;
            case 'EXERCICE': return <img src="/logos/exercice.png" alt="Exercice" className={`${cls} object-contain`} />;
            case 'SLIDE': return <img src="/logos/slides.png" alt="Slides" className={`${cls} object-contain`} />;
            case 'DATASET': return <img src="/logos/dataset.png" alt="Dataset" className={`${cls} object-contain`} />;
            default: return <FileText className={cls} />;
        }
    };

    const loading = loadingPublic || loadingInscriptions;

    if (loading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-600 gap-4">
                <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-slate-800">

            {/* Header + Search */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <div className="relative max-w-md w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Search className="w-4 h-4" />
                    </span>
                    <input type="text"
                        placeholder={activeTab === 'mes-cours' ? "Rechercher un cours..." : "Rechercher une ressource..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-blue-600 rounded-xl text-sm outline-none font-medium" />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-slate-100 pb-0">
                    <button onClick={() => { setActiveTab('mes-cours'); setSearchTerm(''); }}
                        className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 ${activeTab === 'mes-cours'
                            ? 'border-blue-600 text-slate-950'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}>
                        <span className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5" /> Mes cours
                        </span>
                    </button>
                    <button onClick={() => { setActiveTab('generales'); setSearchTerm(''); }}
                        className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 ${activeTab === 'generales'
                            ? 'border-blue-600 text-slate-950'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}>
                        <span className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" /> Ressources générales
                        </span>
                    </button>
                    <button onClick={() => { setActiveTab('historique'); setSearchTerm(''); }}
                        className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 ${activeTab === 'historique'
                            ? 'border-blue-600 text-slate-950'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}>
                        <span className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> Mon historique
                        </span>
                    </button>
                </div>
            </div>

            {/* --- ONGLET RESSOURCES GÉNÉRALES --- */}
            {activeTab === 'generales' && (
                <>
                {/* Filtres */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center gap-3">
                    <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                    {/* Filtre Certification */}
                    <div className="relative w-full sm:w-52">
                        <button type="button" onClick={() => setCertDropdownOpen(!certDropdownOpen)}
                            className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all w-full">
                            {(() => {
                                const cert = selectedCertFilter !== 'TOUS' ? certs.find(c => c.id === selectedCertFilter) : null;
                                return cert?.image ? <img src={cert.image} alt="" className="w-5 h-5 object-contain rounded shrink-0" /> : null;
                            })()}
                            <span className="flex-1 text-left truncate">
                                {selectedCertFilter === 'TOUS' ? 'Toutes certifications' : (certs.find(c => c.id === selectedCertFilter)?.codeExamen || certs.find(c => c.id === selectedCertFilter)?.nom || 'Sélectionner')}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${certDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {certDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setCertDropdownOpen(false)} />
                                <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden">
                                    <button onClick={() => { setSelectedCertFilter('TOUS'); setCertDropdownOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${selectedCertFilter === 'TOUS' ? 'bg-slate-100 text-slate-950' : 'text-slate-600'}`}>
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                            <Puzzle className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <span className="truncate">Toutes certifications</span>
                                    </button>
                                    <div className="border-t border-slate-100" />
                                    {certs.map((c: any, idx: number) => (
                                        <button key={c.id || `cert-${idx}`} onClick={() => { setSelectedCertFilter(c.id); setCertDropdownOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${selectedCertFilter === c.id ? 'bg-slate-100 text-slate-950' : 'text-slate-600'}`}>
                                            {c.image ? (
                                                <img src={c.image} alt="" className="w-7 h-7 object-contain rounded shrink-0" />
                                            ) : (
                                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                    <Puzzle className="w-3.5 h-3.5 text-slate-400" />
                                                </div>
                                            )}
                                            <span className="truncate">{c.codeExamen || c.nom}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Filtre Type */}
                    <div className="relative w-full sm:w-52">
                        <button type="button" onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                            className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all w-full">
                            <span className="flex-1 text-left truncate">
                                {selectedTypeFilter === 'TOUS' ? 'Tous les types' : typeLabel(selectedTypeFilter)}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${typeDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {typeDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setTypeDropdownOpen(false)} />
                                <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden">
                                    <button onClick={() => { setSelectedTypeFilter('TOUS'); setTypeDropdownOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${selectedTypeFilter === 'TOUS' ? 'bg-slate-100 text-slate-950' : 'text-slate-600'}`}>
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <span className="truncate">Tous les types</span>
                                    </button>
                                    <div className="border-t border-slate-100" />
                                    {uniqueTypes.map((t, idx: number) => (
                                        <button key={t || `type-${idx}`} onClick={() => { setSelectedTypeFilter(t); setTypeDropdownOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${selectedTypeFilter === t ? 'bg-slate-100 text-slate-950' : 'text-slate-600'}`}>
                                            <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                {typeIcon(t)}
                                            </span>
                                            <span>{typeLabel(t)}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <span className="text-[10px] text-slate-400 font-bold ml-auto">
                        {filteredPublic.length} ressource{filteredPublic.length > 1 ? 's' : ''}
                    </span>
                </div>

                <AnimatePresence mode="wait">
                    {filteredPublic.length === 0 ? (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl text-slate-500 font-semibold">
                            Aucune ressource trouvée.
                        </motion.div>
                    ) : (
                        <motion.div key="grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {currentPublic.map((res: any, idx: number) => (
                                <div key={res.id || `res-${idx}`}
                                    className="bg-white border border-slate-200/80 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-slate-300 flex flex-col gap-3 group">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-xs font-extrabold text-slate-950 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {res.titre}
                                        </h3>
                                        {res.certification && (
                                            <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5">
                                                {res.certification.codeExamen || res.certification.nom}
                                            </span>
                                        )}
                                    </div>
                                    {res.description && (
                                        <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                            {res.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                                            <span className="w-4 h-4 flex items-center justify-center shrink-0">{typeIcon(res.type)}</span>
                                            <span>{typeLabel(res.type)}</span>
                                            {formatBytes(res.taille) && <span className="text-slate-300">• {formatBytes(res.taille)}</span>}
                                        </span>
                                        <button onClick={() => handleDownload(res.id)}
                                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 transition-all cursor-pointer">
                                            <Download className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                        <button onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-650 hover:text-slate-950 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-white shadow-sm">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Précédent</span>
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, index) => {
                                const pageNum = index + 1;
                                const isActive = currentPage === pageNum;
                                return (
                                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${isActive ? 'bg-slate-950 text-white shadow-md' : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950'}`}>
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-650 hover:text-slate-950 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-white shadow-sm">
                            <span>Suivant</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
                </>
            )}

            {/* --- ONGLET MES COURS --- */}
            {activeTab === 'mes-cours' && !selectedCourse && (
                <>
                {/* Filtre progression */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Statut</span>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { val: 'TOUS', label: 'Tous' },
                            { val: 'EN_COURS', label: 'En cours' },
                            { val: 'TERMINE', label: 'Terminés' }
                        ].map((item) => (
                            <button
                                key={item.val}
                                onClick={() => setProgressionFilter(item.val as any)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    progressionFilter === item.val
                                        ? 'bg-slate-950 text-white shadow-sm'
                                        : 'bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-slate-600'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold ml-auto">
                        {filteredInscriptions.length} cours
                    </span>
                </div>

                <AnimatePresence mode="wait">
                    {filteredInscriptions.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl text-slate-500 space-y-4">
                            {progressionFilter === 'TERMINE' ? (
                                <>
                                    <p className="text-sm font-bold text-slate-500">Vous n'avez pas encore terminé de cours.</p>
                                    <Link href="/dashboard/cours?tab=explorer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer">
                                        Explorer le catalogue <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </>
                            ) : progressionFilter === 'EN_COURS' ? (
                                <p className="text-sm font-bold text-slate-500">Tous vos cours sont terminés !</p>
                            ) : (
                                <p className="text-sm font-bold text-slate-500">Aucun cours trouvé.</p>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredInscriptions.map((insc: any, idx: number) => {
                                const c = insc.cours;
                                const totalModResources = (c?.modules || []).reduce((acc: number, m: any) => acc + (m.ressources?.length || 0), 0);
                                return (
                                    <div key={insc.id || `insc-${idx}`}
                                        className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col cursor-pointer"
                                        onClick={() => setSelectedCourse(insc)}>
                                        <div className="relative aspect-[750/422] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                            {c.imageUrl ? (
                                                <img src={c.imageUrl} alt={c.titre}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="w-10 h-10 text-slate-300" />
                                                </div>
                                            )}
                                            <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-slate-900/70 text-white text-[8px] font-extrabold rounded-md uppercase tracking-wider">
                                                {c.certification?.codeExamen || c.certification?.nom || 'Certification'}
                                            </span>
                                        </div>

                                        <div className="p-4 flex-1 flex flex-col gap-2">
                                            <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {c.titre}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-black shrink-0">
                                                    {c.formateur?.avatar ? (
                                                        <img src={c.formateur.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        c.formateur?.prenom?.[0] || 'F'
                                                    )}
                                                </div>
                                                <span className="truncate">Par {c.formateur?.prenom || 'Un formateur'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-auto pt-1">
                                                <FolderOpen className="w-3.5 h-3.5" />
                                                <span>{totalModResources} ressource{totalModResources > 1 ? 's' : ''}</span>
                                            </div>
                                            {insc.progression > 0 && (
                                                <div className="space-y-1 pt-2">
                                                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                                                        <span>Progression</span>
                                                        <span>{insc.progression}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                                            style={{ width: `${insc.progression}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-slate-100 p-3">
                                            <button onClick={(e) => { e.stopPropagation(); setSelectedCourse(insc); }}
                                                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                                                <FolderOpen className="w-3.5 h-3.5" /> Voir les ressources
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
                </>
            )}

            {/* --- VUE DÉTAIL RESSOURCES D'UN COURS --- */}
            {activeTab === 'mes-cours' && selectedCourse && (
                <CourseResourcesView
                    inscription={selectedCourse}
                    onBack={() => setSelectedCourse(null)}
                    onDownload={handleDownload}
                    formatBytes={formatBytes}
                    typeIcon={typeIcon}
                    typeLabel={typeLabel}
                />
            )}

            {/* --- ONGLET MON HISTORIQUE --- */}
            {activeTab === 'historique' && (
                <>
                {loadingHistory ? (
                    <div className="min-h-[30vh] flex flex-col items-center justify-center text-slate-600 gap-4">
                        <span className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : downloadHistory.length === 0 ? (
                    <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl text-slate-500 space-y-4">
                        <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="text-sm font-bold text-slate-500">Aucun téléchargement pour le moment.</p>
                        <p className="text-xs text-slate-400">Les ressources que vous téléchargez apparaîtront ici.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">
                                Historique des téléchargements
                            </h3>
                            <span className="text-[10px] text-slate-400 font-bold">
                                {downloadHistory.length} téléchargement{downloadHistory.length > 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {groupedHistory.map((group: any, idx: number) => {
                                const isExpanded = expandedResources[group.ressourceId];
                                return (
                                    <div key={group.ressourceId || `group-${idx}`}>
                                        <div className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                                            {group.count > 1 && (
                                                <button
                                                    onClick={() => setExpandedResources((prev) => ({ ...prev, [group.ressourceId]: !prev[group.ressourceId] }))}
                                                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                                                >
                                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                </button>
                                            )}
                                            {group.count === 1 && <div className="w-[22px] shrink-0" />}
                                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                                                {typeIcon(group.ressource?.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-extrabold text-slate-950 leading-snug flex items-center gap-1.5">
                                                    {group.ressource?.titre || 'Ressource'}
                                                    {group.count > 1 && (
                                                        <span className="text-[10px] font-black text-slate-400">({group.count})</span>
                                                    )}
                                                </h4>
                                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1.5">
                                                    <span className="font-bold">{typeLabel(group.ressource?.type)}</span>
                                                    <span>•</span>
                                                    <span>{new Date(group.firstDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    {group.ressource?.taille && (
                                                        <span>• {formatBytes(group.ressource.taille)}</span>
                                                    )}
                                                </p>
                                                {group.ressource?.certification && (
                                                    <p className="text-[9px] text-blue-600 font-bold mt-0.5">
                                                        {group.ressource.certification.codeExamen || group.ressource.certification.nom}
                                                    </p>
                                                )}
                                            </div>
                                            <button onClick={() => handleDownload(group.ressource?.id)}
                                                className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 transition-all cursor-pointer shrink-0">
                                                <Download className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        {isExpanded && group.items.length > 1 && (
                                            <div className="border-t border-slate-50 bg-slate-50/50">
                                                {group.items.slice(0, -1).reverse().map((item: any, iidx: number) => (
                                                    <div key={item.id || `item-${iidx}`} className="pl-[70px] pr-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
                                                        <span className="font-semibold">
                                                            {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {item.ip && (
                                                            <span className="text-[9px] text-slate-400 font-mono">{item.ip}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                </>
            )}

        </div>
    );
}

/* ───── VUE DÉTAIL RESSOURCES D'UN COURS ───── */
function CourseResourcesView({
    inscription,
    onBack,
    onDownload,
    formatBytes,
    typeIcon,
    typeLabel,
}: {
    inscription: any;
    onBack: () => void;
    onDownload: (resourceId: string) => void;
    formatBytes: (b: number | null) => string | null;
    typeIcon: (type: string) => React.ReactNode;
    typeLabel: (type: string) => string;
}) {
    const c = inscription.cours;
    const allResources = (c?.modules || []).flatMap((mod: any) =>
        (mod.ressources || []).map((res: any) => ({ ...res, moduleTitle: mod.titre, moduleId: mod.id }))
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3">
                <button onClick={onBack}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                    <ChevronLeft className="w-3.5 h-3.5" /> Retour aux cours
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        {c.imageUrl ? (
                            <img src={c.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <BookOpen className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-950">{c.titre}</h2>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{allResources.length} ressource{allResources.length > 1 ? 's' : ''}</p>
                    </div>
                </div>
            </div>

            {/* Liste des ressources */}
            {allResources.length === 0 ? (
                <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl mt-4 text-slate-500 font-semibold">
                    Aucune ressource dans ce cours.
                </div>
            ) : (
                <div className="mt-4 space-y-2">
                    {allResources.map((res: any, ridx: number) => (
                        <div key={res.id || `resource-${ridx}`}
                            className="bg-white border border-slate-200/80 rounded-xl p-4 transition-all hover:shadow-sm hover:border-slate-300 flex items-center gap-4">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                                {typeIcon(res.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-extrabold text-slate-950 leading-snug">{res.titre}</h4>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1.5">
                                    <span className="font-bold">{typeLabel(res.type)}</span>
                                    <span className="text-slate-300">•</span>
                                    <span>{res.moduleTitle}</span>
                                    {res.taille && <><span className="text-slate-300">•</span><span>{formatBytes(res.taille)}</span></>}
                                </p>
                                {res.description && (
                                    <p className="text-[10px] text-slate-500 font-medium mt-1 line-clamp-1">{res.description}</p>
                                )}
                            </div>
                            <button onClick={() => onDownload(res.id)}
                                className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 transition-all cursor-pointer shrink-0">
                                <Download className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
