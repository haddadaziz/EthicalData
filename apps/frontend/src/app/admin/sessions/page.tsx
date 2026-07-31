"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { Search, Plus, Edit, Trash2, Calendar, Clock, Users, Video, BookOpen, Check, ChevronDown, ArrowLeft, ArrowRight } from '@/components/icons';
import { SessionFormModal } from '../../../components/admin/sessions/SessionFormModal';

interface CourseInfo {
    id: string;
    titre: string;
}

interface SessionData {
    id: string;
    titre: string;
    description?: string | null;
    dateDebut: string;
    dateFin?: string | null;
    maxPlaces?: number | null;
    placesOccupees: number;
    placesDisponibles?: number | null;
    estComplet?: boolean;
    statut: 'OUVERTE' | 'COMPLETE' | 'CLOTUREE';
    teamsLink?: string | null;
    coursId?: string | null;
    cours?: { id: string; titre: string } | null;
    formateurId: string;
    formateur?: { id: string; prenom: string; nom: string; nomComplet: string; avatar?: string | null } | null;
    dateCreation: string;
}

const STATUT_BADGES: Record<string, string> = {
    OUVERTE: 'bg-emerald-950/30 text-emerald-300',
    COMPLETE: 'bg-amber-950/30 text-amber-300',
    CLOTUREE: 'bg-slate-800/50 text-slate-400',
};

const STATUT_LABELS: Record<string, string> = {
    OUVERTE: 'Ouverte',
    COMPLETE: 'Complète',
    CLOTUREE: 'Clôturée',
};

export default function AdminSessionsPage() {
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [coursesList, setCoursesList] = useState<CourseInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statutFilter, setStatutFilter] = useState('TOUS');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [statutDropdownOpen, setStatutDropdownOpen] = useState(false);
    const [statusMenuId, setStatusMenuId] = useState<string | null>(null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<SessionData | null>(null);

    const [statutChangingId, setStatutChangingId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [sessionsData, coursesData] = await Promise.all([
                apiFetch('/sessions'),
                apiFetch('/cours/admin/all'),
            ]);
            setSessions(Array.isArray(sessionsData) ? sessionsData : []);
            setCoursesList(Array.isArray(coursesData) ? coursesData : []);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Impossible de récupérer les sessions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statutFilter]);

    const stats = useMemo(() => {
        const ouvertes = sessions.filter(s => s.statut === 'OUVERTE').length;
        const completes = sessions.filter(s => s.statut === 'COMPLETE').length;
        const cloturees = sessions.filter(s => s.statut === 'CLOTUREE').length;
        return { ouvertes, completes, cloturees };
    }, [sessions]);

    const filteredSessions = useMemo(() => {
        return sessions.filter(session => {
            const search = searchTerm.toLowerCase().trim();
            const matchesSearch = !search ||
                session.titre.toLowerCase().includes(search) ||
                (session.description && session.description.toLowerCase().includes(search)) ||
                (session.cours?.titre && session.cours.titre.toLowerCase().includes(search)) ||
                (session.formateur && session.formateur.nomComplet.toLowerCase().includes(search));
            const matchesStatut = statutFilter === 'TOUS' || session.statut === statutFilter;
            return matchesSearch && matchesStatut;
        });
    }, [sessions, searchTerm, statutFilter]);

    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSessions = useMemo(() => {
        return filteredSessions.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredSessions, indexOfFirstItem, indexOfLastItem]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [filteredSessions, totalPages, currentPage]);

    const handleChangeStatut = async (session: SessionData, statut: 'OUVERTE' | 'COMPLETE' | 'CLOTUREE') => {
        if (statut === session.statut) { setStatusMenuId(null); return; }
        setStatutChangingId(session.id);
        try {
            await apiFetch(`/sessions/${session.id}/statut`, { method: 'PATCH', body: { statut } });
            showToast(`Session "${session.titre}" marquée ${STATUT_LABELS[statut].toLowerCase()}.`, "success");
            fetchData();
        } catch (err: any) {
            showToast(err.message || 'Erreur lors du changement de statut.', "error");
        } finally {
            setStatutChangingId(null);
            setStatusMenuId(null);
        }
    };

    const handleDelete = async (session: SessionData) => {
        const ok = await confirm({
            title: "Supprimer cette session ?",
            message: `Voulez-vous vraiment supprimer la session "${session.titre}" ? Cette action est irréversible.`,
            confirmText: "Supprimer",
            cancelText: "Annuler",
            type: "danger"
        });
        if (!ok) return;
        try {
            await apiFetch(`/sessions/${session.id}`, { method: 'DELETE' });
            showToast("Session supprimée.", "success");
            fetchData();
        } catch (err: any) {
            showToast(err.message || 'Erreur lors de la suppression.', "error");
        }
    };

    const formatDateTime = (iso?: string | null) => {
        if (!iso) return null;
        const d = new Date(iso);
        return {
            date: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
            time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        };
    };

    const isUpcoming = (iso: string) => new Date(iso) > new Date();

    return (
        <div className="space-y-6 md:space-y-8 pb-12 bg-[#020617] text-slate-300">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-950/30 border-blue-800/50 text-blue-400 flex items-center justify-center"><Calendar className="w-4 h-4" /></div>
                    </div>
                    <p className="text-3xl font-black text-white">{sessions.length}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">sessions planifiées</p>
                </div>
                <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ouvertes</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-950/30 border-emerald-800/50 text-emerald-400 flex items-center justify-center"><Video className="w-4 h-4" /></div>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.ouvertes}</p>
                    <p className="text-[10px] text-emerald-500/70 font-bold mt-1">inscriptions ouvertes</p>
                </div>
                <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complètes</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-950/30 border-amber-800/50 text-amber-400 flex items-center justify-center"><Users className="w-4 h-4" /></div>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.completes}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">places épuisées</p>
                </div>
                <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clôturées</span>
                        <div className="w-9 h-9 rounded-xl bg-slate-900/50 border-slate-800 text-slate-400 flex items-center justify-center"><Clock className="w-4 h-4" /></div>
                    </div>
                    <p className="text-3xl font-black text-white">{stats.cloturees}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">sessions terminées</p>
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
                                placeholder="Rechercher une session (titre, formation, formateur)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 transition-all text-xs outline-none font-bold rounded-2xl"
                            />
                        </div>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => { setStatutDropdownOpen(!statutDropdownOpen); setStatusMenuId(null); }}
                                className="flex items-center gap-2.5 px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-2xl text-white text-xs font-bold outline-none cursor-pointer hover:bg-slate-800/50 transition-all min-w-[150px]"
                            >
                                <span className="flex-1 text-left truncate">{statutFilter === 'TOUS' ? 'Tous les statuts' : STATUT_LABELS[statutFilter]}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${statutDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {statutDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setStatutDropdownOpen(false)} />
                                    <div className="absolute top-full left-0 mt-1.5 z-50 w-44 bg-[#080d1a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                                        {['TOUS', 'OUVERTE', 'COMPLETE', 'CLOTUREE'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => { setStatutFilter(s); setStatutDropdownOpen(false); }}
                                                className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-left transition-colors hover:bg-slate-800/30 cursor-pointer ${statutFilter === s ? 'bg-slate-900/50 text-white' : 'text-slate-400'}`}
                                            >
                                                <span className="truncate">{s === 'TOUS' ? 'Tous les statuts' : STATUT_LABELS[s]}</span>
                                                {statutFilter === s && <Check className="w-3.5 h-3.5 text-cyan-400 ml-auto shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto shrink-0">
                        <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
                            {filteredSessions.length} session{filteredSessions.length > 1 ? 's' : ''}
                        </span>
                        <button
                            onClick={() => { setEditingSession(null); setIsFormModalOpen(true); }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-600/20 rounded-2xl text-xs font-bold cursor-pointer transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nouvelle session</span>
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
                ) : filteredSessions.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-wide text-xs min-h-[400px] flex flex-col items-center justify-center">
                        {sessions.length === 0 ? 'Aucune session planifiée pour le moment.' : 'Aucune session ne correspond à vos critères.'}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-6">
                            {currentSessions.map((session) => {
                                const debut = formatDateTime(session.dateDebut);
                                const fin = formatDateTime(session.dateFin);
                                const complet = session.estComplet || (session.placesDisponibles != null && session.placesDisponibles <= 0);
                                return (
                                    <div key={session.id} className="bg-[#020617] border border-slate-800 rounded-2xl p-5 flex flex-col group transition-all duration-300 hover:shadow-lg hover:border-slate-700">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${session.statut === 'OUVERTE' ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400' : session.statut === 'COMPLETE' ? 'bg-amber-950/30 border-amber-800/50 text-amber-400' : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}>
                                                    <Video className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-black text-white leading-snug truncate">{session.titre}</h3>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider mt-1 ${STATUT_BADGES[session.statut]}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${session.statut === 'OUVERTE' ? 'bg-emerald-400' : 'bg-current'}`} />
                                                        {STATUT_LABELS[session.statut]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                {debut && <span>{debut.date}</span>}
                                                <span className="text-slate-600">•</span>
                                                <span className="text-cyan-400">{debut && debut.time}</span>
                                                {fin && <span className="text-slate-500">→ {fin.time}</span>}
                                                {isUpcoming(session.dateDebut) && session.statut !== 'CLOTUREE' && (
                                                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-blue-950/30 text-blue-300">À venir</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                                <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                <span className="truncate">{session.cours?.titre || 'Session indépendante'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                                {session.formateur?.avatar ? (
                                                    <img src={session.formateur.avatar} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-[8px] font-black shrink-0">
                                                        {(session.formateur?.prenom?.[0] || 'F')}
                                                    </div>
                                                )}
                                                <span className="truncate">{session.formateur?.nomComplet || 'Formateur non assigné'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                <div className="flex-1">
                                                    {session.maxPlaces != null ? (
                                                        <>
                                                            <div className="flex items-center justify-between text-[11px] font-bold">
                                                                <span className="text-slate-400">{session.placesDisponibles} place{session.placesDisponibles !== 1 ? 's' : ''} disponibles</span>
                                                                <span className="text-slate-500">{session.placesOccupees}/{session.maxPlaces}</span>
                                                            </div>
                                                            <div className="mt-1 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full transition-all ${complet ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                                    style={{ width: `${Math.min(100, (session.placesOccupees / session.maxPlaces) * 100)}%` }} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-[11px] font-bold text-slate-400">Places illimitées</span>
                                                    )}
                                                </div>
                                            </div>
                                            {session.teamsLink && (
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-cyan-400/80 truncate">
                                                    <Video className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="truncate">Lien Teams configuré</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setStatusMenuId(statusMenuId === session.id ? null : session.id); setStatutDropdownOpen(false); }}
                                                        disabled={statutChangingId === session.id}
                                                        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#080d1a] border border-slate-800 hover:border-slate-700 rounded-xl text-[11px] font-bold text-slate-300 outline-none transition-all cursor-pointer disabled:opacity-50"
                                                    >
                                                        <span className="truncate">{statutChangingId === session.id ? '...' : 'Changer le statut'}</span>
                                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform ${statusMenuId === session.id ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {statusMenuId === session.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-40" onClick={() => setStatusMenuId(null)} />
                                                            <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-[#080d1a] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
                                                                {(['OUVERTE', 'COMPLETE', 'CLOTUREE'] as const).map(s => (
                                                                    <button key={s} type="button"
                                                                        onClick={() => handleChangeStatut(session, s)}
                                                                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold text-left transition-colors hover:bg-slate-800/30 cursor-pointer ${session.statut === s ? 'text-cyan-400' : 'text-slate-400'}`}>
                                                                        <span className="truncate">{STATUT_LABELS[s]}</span>
                                                                        {session.statut === s && <Check className="w-3.5 h-3.5 ml-auto shrink-0" />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => { setEditingSession(session); setIsFormModalOpen(true); }}
                                                    className="p-2 bg-blue-950/30 hover:bg-blue-950/50 border border-blue-800/50 text-blue-400 hover:text-blue-300 rounded-xl transition-colors cursor-pointer"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(session)}
                                                    className="p-2 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-800/50 text-rose-400 hover:text-rose-300 rounded-xl transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
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

            <SessionFormModal
                isOpen={isFormModalOpen}
                onClose={() => { setIsFormModalOpen(false); setEditingSession(null); }}
                onSaved={fetchData}
                editingSession={editingSession}
                coursesList={coursesList}
            />
        </div>
    );
}
