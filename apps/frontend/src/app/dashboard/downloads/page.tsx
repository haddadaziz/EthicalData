"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { Search, Download, BookOpen, FolderOpen, FileText, ChevronLeft, Globe, FileSpreadsheet, Video, Link as LinkIcon, Puzzle, Filter, ArrowRight } from '@/components/icons';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'generales' | 'mes-cours';

export default function DownloadsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('mes-cours');
    const [searchTerm, setSearchTerm] = useState('');

    // Ressources générales
    const [publicResources, setPublicResources] = useState<any[]>([]);
    const [loadingPublic, setLoadingPublic] = useState(true);

    // Mes cours (inscriptions)
    const [inscriptions, setInscriptions] = useState<any[]>([]);
    const [loadingInscriptions, setLoadingInscriptions] = useState(true);

    // Filtres ressources générales
    const [selectedCertFilter, setSelectedCertFilter] = useState('TOUS');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('TOUS');
    // Filtre progression mes cours
    const [progressionFilter, setProgressionFilter] = useState<'TOUS' | 'EN_COURS' | 'TERMINE'>('TOUS');

    // Ressources d'un cours sélectionné (modal)
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

    useEffect(() => {
        apiFetch('/resources')
            .then((data) => setPublicResources(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoadingPublic(false));

        apiFetch('/cours/mes-inscriptions')
            .then((data) => setInscriptions(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoadingInscriptions(false));
    }, []);

    const uniqueCerts = Array.from(new Map(publicResources.filter(r => r.certification).map(r => [r.certification.id, r.certification])).values());
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

    const handleDownload = (url: string) => {
        window.open(url, '_blank');
    };

    const typeIcon = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'PDF': return <FileText className="w-4 h-4" />;
            case 'VIDEO': return <Video className="w-4 h-4" />;
            case 'LIEN_EXTERNE': return <LinkIcon className="w-4 h-4" />;
            case 'EXERCICE': return <Puzzle className="w-4 h-4" />;
            case 'SLIDE': return <FileSpreadsheet className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
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
                </div>
            </div>

            {/* --- ONGLET RESSOURCES GÉNÉRALES --- */}
            {activeTab === 'generales' && (
                <>
                {/* Filtres */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center gap-3">
                    <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <select value={selectedCertFilter} onChange={(e) => setSelectedCertFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold outline-none cursor-pointer text-slate-700">
                        <option value="TOUS">Toutes certifications</option>
                        {uniqueCerts.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.codeExamen || c.nom}</option>
                        ))}
                    </select>
                    <select value={selectedTypeFilter} onChange={(e) => setSelectedTypeFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold outline-none cursor-pointer text-slate-700">
                        <option value="TOUS">Tous les types</option>
                        {uniqueTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    <span className="text-[10px] text-slate-400 font-bold ml-auto">
                        {filteredPublic.length} ressource{filteredPublic.length > 1 ? 's' : ''}
                    </span>
                </div>

                <AnimatePresence mode="wait">
                    {filteredPublic.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl text-slate-500 font-semibold">
                            Aucune ressource trouvée.
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filteredPublic.map((res: any) => (
                                <div key={res.id}
                                    className="bg-white border border-slate-200/80 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-slate-300 flex flex-col gap-3 group">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider truncate">
                                            {res.type || 'RESSOURCE'}
                                        </span>
                                        {res.certification && (
                                            <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                                                {res.certification.codeExamen || res.certification.nom}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xs font-extrabold text-slate-950 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {res.titre}
                                    </h3>
                                    {res.description && (
                                        <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                            {res.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                            {typeIcon(res.type)}
                                            {formatBytes(res.taille) && <span>{formatBytes(res.taille)}</span>}
                                        </span>
                                        <button onClick={() => handleDownload(res.url)}
                                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 transition-all cursor-pointer">
                                            <Download className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
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
                            {filteredInscriptions.map((insc: any) => {
                                const c = insc.cours;
                                const totalModResources = (c?.modules || []).reduce((acc: number, m: any) => acc + (m.ressources?.length || 0), 0);
                                return (
                                    <div key={insc.id}
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
                                            <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-slate-900/70 text-white text-[8px] font-extrabold rounded-md uppercase tracking-wider backdrop-blur-sm">
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
                />
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
}: {
    inscription: any;
    onBack: () => void;
    onDownload: (url: string) => void;
    formatBytes: (b: number | null) => string | null;
    typeIcon: (type: string) => React.ReactNode;
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
                    {allResources.map((res: any) => (
                        <div key={res.id}
                            className="bg-white border border-slate-200/80 rounded-xl p-4 transition-all hover:shadow-sm hover:border-slate-300 flex items-center gap-4">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                                {typeIcon(res.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-extrabold text-slate-950 leading-snug">{res.titre}</h4>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-2">
                                    <span>{res.moduleTitle}</span>
                                    {res.taille && <span>• {formatBytes(res.taille)}</span>}
                                    <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{res.type}</span>
                                </p>
                                {res.description && (
                                    <p className="text-[10px] text-slate-500 font-medium mt-1 line-clamp-1">{res.description}</p>
                                )}
                            </div>
                            <button onClick={() => onDownload(res.url)}
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
