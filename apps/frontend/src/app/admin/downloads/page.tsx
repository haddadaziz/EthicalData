"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { Search, Download, FileText, Video, Link as LinkIcon, Puzzle, ChevronLeft, ChevronRight, User, Calendar, Filter, ChevronDown } from '@/components/icons';
import { motion } from 'framer-motion';

export default function AdminDownloadsPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    const loadHistory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
            if (search) params.set('search', search);
            if (typeFilter) params.set('type', typeFilter);
            const data = await apiFetch(`/resources/admin/historique?${params}`);
            setHistory(data.data || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error('Erreur chargement historique:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [page, typeFilter]);

    useEffect(() => {
        setPage(1);
    }, [search, typeFilter]);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

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

    const typeIcon = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'PDF': return <img src="/logos/pdf.webp" alt="PDF" className="w-4 h-4 object-contain" />;
            case 'VIDEO': return <Video className="w-4 h-4" />;
            case 'LIEN_EXTERNE': return <LinkIcon className="w-4 h-4" />;
            case 'EXERCICE': return <img src="/logos/exercice.png" alt="Exercice" className="w-4 h-4 object-contain" />;
            case 'SLIDE': return <img src="/logos/slides.png" alt="Slides" className="w-4 h-4 object-contain" />;
            case 'DATASET': return <img src="/logos/dataset.png" alt="Dataset" className="w-4 h-4 object-contain" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6 bg-[#020617] text-slate-300">

            {/* Filtres */}
            <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Rechercher ..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl text-sm outline-none font-medium"
                    />
                </div>
                <div className="relative w-full sm:w-52">
                    <button type="button" onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                        className="flex items-center gap-2.5 px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-xl text-white text-xs font-bold outline-none cursor-pointer hover:bg-slate-800/50 transition-all w-full">
                        <span className="flex-1 text-left truncate">
                            {typeFilter === '' ? 'Tous les types' : typeLabel(typeFilter)}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${typeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {typeDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setTypeDropdownOpen(false)} />
                            <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-[#080d1a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                                <button onClick={() => { setTypeFilter(''); setTypeDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-800/30 cursor-pointer ${typeFilter === '' ? 'bg-slate-900/50 text-white' : 'text-slate-400'}`}>
                                    <div className="w-7 h-7 rounded-lg bg-slate-900/50 flex items-center justify-center shrink-0">
                                        <Filter className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <span className="truncate">Tous les types</span>
                                </button>
                                <div className="border-t border-slate-800" />
                                {['PDF', 'VIDEO', 'SLIDE', 'EXERCICE', 'LIEN_EXTERNE', 'DATASET'].map((t) => (
                                    <button key={t} onClick={() => { setTypeFilter(t); setTypeDropdownOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-800/30 cursor-pointer ${typeFilter === t ? 'bg-slate-900/50 text-white' : 'text-slate-400'}`}>
                                        <span className="w-7 h-7 rounded-lg bg-slate-900/50 flex items-center justify-center shrink-0">
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
                    {total} téléchargement{total > 1 ? 's' : ''}
                </span>
            </div>

            {/* Table */}
            {loading ? (
                <div className="min-h-[40vh] flex flex-col items-center justify-center text-slate-400 gap-4">
                    <span className="w-10 h-10 border-4 border-blue-800/50 border-t-cyan-400 rounded-full animate-spin" />
                </div>
            ) : history.length === 0 ? (
                <div className="p-12 text-center bg-[#080d1a] border border-slate-800 rounded-2xl text-slate-400">
                    <p className="text-sm font-bold">Aucun téléchargement trouvé.</p>
                </div>
            ) : (
                <div className="bg-[#080d1a] border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/50">
                                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Date</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Utilisateur</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Ressource</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Type</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Certification</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider text-slate-400">IP</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-wider text-slate-400"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {history.map((h: any) => (
                                    <tr key={h.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                {formatDate(h.date)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-slate-900/50 flex items-center justify-center shrink-0">
                                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white">
                                                        {h.utilisateur?.prenom} {h.utilisateur?.nom}
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 font-semibold">{h.utilisateur?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2.5 max-w-[250px]">
                                                <div className="w-7 h-7 rounded-lg bg-slate-900/50 flex items-center justify-center shrink-0 text-slate-400">
                                                    {typeIcon(h.ressource?.type)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-white truncate">{h.ressource?.titre}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">{typeLabel(h.ressource?.type)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            {h.ressource?.certification ? (
                                                <span className="text-[10px] font-bold text-cyan-400">
                                                    {h.ressource.certification.codeExamen || h.ressource.certification.nom}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-[10px] text-slate-400 font-mono">{h.ip || '-'}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => window.open(h.ressource?.url, '_blank')}
                                                className="p-1.5 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all cursor-pointer"
                                                title="Télécharger à nouveau"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-slate-800">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" /> Précédent
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(totalPages, 10) }).map((_, idx) => {
                                    const pageNum = idx + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                                page === pageNum
                                                    ? 'bg-slate-950 text-white shadow-md'
                                                    : 'bg-transparent text-slate-400 hover:bg-slate-800/30'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
                            >
                                Suivant <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
