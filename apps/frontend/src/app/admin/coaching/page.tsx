"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { Calendar, CalendarCheck, Clock, Plus, User, CheckCircle, Video, RefreshCw, X, Trash2, ShieldCheck, Sparkles, AlertCircle, Search, ChevronDown, ChevronUp, Edit } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface Formateur {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    avatar?: string | null;
    telephone?: string | null;
}

interface Creneau {
    id: string;
    dateDebut: string;
    dateFin: string;
    estReserve: boolean;
    formateur: Formateur;
}

interface RendezVous {
    id: string;
    type: string;
    motif?: string;
    statut: string;
    dateCreation: string;
    candidat: Formateur;
    formateur: Formateur;
    creneau: Creneau;
}

export default function AdminCoachingPage() {
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const [tab, setTab] = useState<'creneaux' | 'rdv'>('creneaux');
    const [creneaux, setCreneaux] = useState<Creneau[]>([]);
    const [allRendezVous, setAllRendezVous] = useState<RendezVous[]>([]);
    const [loading, setLoading] = useState(true);
    const [createLoading, setCreateLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [selectedFormateur, setSelectedFormateur] = useState<Formateur | null>(null);
    const [formateurSearch, setFormateurSearch] = useState('');
    const [formateurResults, setFormateurResults] = useState<Formateur[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const searchQueryRef = useRef('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCreneau, setEditingCreneau] = useState<Creneau | null>(null);
    const [editDateDebut, setEditDateDebut] = useState('');
    const [editDateFin, setEditDateFin] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [creneauxData, rdvData] = await Promise.all([
                apiFetch('/appointments/creneaux/disponibles'),
                apiFetch('/appointments/mes-rdv'),
            ]);
            setCreneaux(creneauxData);
            setAllRendezVous(rdvData);
        } catch (err: any) {
            console.error("Erreur chargement coaching:", err);
            showToast(err.message || "Erreur lors du chargement des créneaux.", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearchFormateur = useCallback(async (q: string) => {
        if (!q.trim()) {
            setFormateurResults([]);
            setSearchOpen(false);
            return;
        }
        searchQueryRef.current = q.trim();
        setSearchLoading(true);
        try {
            const results = await apiFetch(`/users?q=${encodeURIComponent(q.trim())}`);
            if (searchQueryRef.current === q.trim()) {
                setFormateurResults(results);
                setSearchOpen(results.length > 0);
            }
        } catch (err: any) {
            console.error(err);
            if (searchQueryRef.current === q.trim()) {
                setFormateurResults([]);
            }
        } finally {
            if (searchQueryRef.current === q.trim()) {
                setSearchLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isAddModalOpen) handleSearchFormateur(formateurSearch);
        }, 250);
        return () => clearTimeout(timer);
    }, [formateurSearch, isAddModalOpen, handleSearchFormateur]);

    const handleCreateCreneau = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dateDebut || !dateFin) return;
        if (!selectedFormateur) {
            showToast("Veuillez sélectionner un formateur.", "error");
            return;
        }

        setCreateLoading(true);
        try {
            await apiFetch('/appointments/creneaux', {
                method: 'POST',
                body: {
                    dateDebut: new Date(dateDebut).toISOString(),
                    dateFin: new Date(dateFin).toISOString(),
                    formateurId: parseInt(selectedFormateur.id),
                },
            });

            showToast(`Créneau publié pour ${selectedFormateur.prenom} ${selectedFormateur.nom} !`, "success");
            setIsAddModalOpen(false);
            setDateDebut('');
            setDateFin('');
            setSelectedFormateur(null);
            setFormateurSearch('');
            setFormateurResults([]);
            fetchData();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la création du créneau.", "error");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleCancelRdv = async (rdvId: string) => {
        const isConfirmed = await confirm({
            title: "Annuler ce rendez-vous ?",
            message: "Cette action libérera le créneau horaire et enverra une notification d'annulation à l'apprenant.",
            confirmText: "Oui, annuler le RDV",
            cancelText: "Retour",
            type: "danger",
        });

        if (!isConfirmed) return;

        try {
            await apiFetch(`/appointments/${rdvId}/annuler`, { method: 'PATCH' });
            showToast("Le rendez-vous a été annulé.", "success");
            fetchData();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de l'annulation.", "error");
        }
    };

    const handleDeleteCreneau = async (c: Creneau) => {
        const isConfirmed = await confirm({
            title: "Supprimer ce créneau ?",
            message: `Êtes-vous sûr de vouloir supprimer le créneau du ${formatDate(c.dateDebut)} ?`,
            confirmText: "Oui, supprimer",
            cancelText: "Retour",
            type: "danger",
        });

        if (!isConfirmed) return;

        try {
            await apiFetch(`/appointments/creneaux/${c.id}`, { method: 'DELETE' });
            showToast("Créneau supprimé.", "success");
            fetchData();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la suppression.", "error");
        }
    };

    const openEditModal = (c: Creneau) => {
        setEditingCreneau(c);
        const toDatetimeLocal = (iso: string) => {
            const d = new Date(iso);
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };
        setEditDateDebut(toDatetimeLocal(c.dateDebut));
        setEditDateFin(toDatetimeLocal(c.dateFin));
        setIsEditModalOpen(true);
    };

    const handleUpdateCreneau = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editDateDebut || !editDateFin || !editingCreneau) return;

        setEditLoading(true);
        try {
            await apiFetch(`/appointments/creneaux/${editingCreneau.id}`, {
                method: 'PATCH',
                body: {
                    dateDebut: new Date(editDateDebut).toISOString(),
                    dateFin: new Date(editDateFin).toISOString(),
                },
            });
            showToast("Créneau modifié avec succès.", "success");
            setIsEditModalOpen(false);
            setEditingCreneau(null);
            fetchData();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la modification.", "error");
        } finally {
            setEditLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const now = new Date();
    const rdvAVenir = allRendezVous.filter(rdv => new Date(rdv.creneau.dateDebut) > now);
    const rdvPasses = allRendezVous.filter(rdv => new Date(rdv.creneau.dateDebut) <= now);

    if (loading) {
        return (
            <div className="p-16 text-center text-slate-400 bg-[#080d1a] border border-slate-800 rounded-3xl max-w-5xl mx-auto">
                <span className="w-10 h-10 border-4 border-blue-800/50 border-t-cyan-400 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Chargement de la gestion des rendez-vous...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto text-left bg-[#020617]">

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-[#080d1a] border border-slate-800 rounded-2xl p-1.5 w-fit shadow-xs">
                <button
                    onClick={() => setTab('creneaux')}
className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${tab === 'creneaux' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                        Créneaux Ouverts
                </button>
                <button
                    onClick={() => setTab('rdv')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${tab === 'rdv' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                    Rendez-vous
                </button>
            </div>

            {tab === 'creneaux' && (
                <>
                    {/* Stats bar */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total RDV</p>
                            <p className="text-2xl font-black text-white">{allRendezVous.length}</p>
                        </div>
                        <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">À venir</p>
                            <p className="text-2xl font-black text-emerald-400">{rdvAVenir.length}</p>
                        </div>
                        <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Passés</p>
                            <p className="text-2xl font-black text-slate-400">{rdvPasses.length}</p>
                        </div>
                    </div>

                    {/* Créneaux grid */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Créneaux Ouverts ({creneaux.length})</h2>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                <Plus className="w-3 h-3" />
                                <span>Nouveau créneau</span>
                            </button>
                        </div>

                        {creneaux.length === 0 ? (
                            <div className="p-10 text-center bg-[#080d1a] border border-slate-800 rounded-3xl space-y-2">
                                <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                                <p className="text-xs font-bold text-slate-400">Aucun créneau disponible pour le moment</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {creneaux.map((c) => (
                                    <div key={c.id} className="p-3 bg-[#080d1a] border border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-700 transition-all flex flex-col justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                                                {c.formateur.avatar ? (
                                                    <img src={c.formateur.avatar} alt={c.formateur.prenom} className="w-8 h-8 rounded-lg object-cover border border-slate-800" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-slate-950 text-white font-black text-[10px] flex items-center justify-center">
                                                        {c.formateur.prenom[0]}{c.formateur.nom[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-[11px] font-black text-white">{c.formateur.prenom} {c.formateur.nom}</h4>
                                                    <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">Formateur</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1 bg-[#020617] p-2.5 rounded-xl border border-slate-800">
                                                <p className="text-[11px] font-extrabold text-white capitalize flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                                    <span>{formatDate(c.dateDebut)}</span>
                                                </p>
                                                <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{formatTime(c.dateDebut)} - {formatTime(c.dateFin)}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800 mt-2">
                                            <button
                                                onClick={() => openEditModal(c)}
                                                className="flex-1 py-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                                                title="Gérer"
                                            >
                                                <Edit className="w-3 h-3" />
                                                <span>Gérer</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCreneau(c)}
                                                className="flex-1 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                <span>Supprimer</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {tab === 'rdv' && (
                <div className="space-y-6">
                    {/* À venir */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-600 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>À venir ({rdvAVenir.length})</span>
                        </h3>

                        {rdvAVenir.length === 0 ? (
                            <div className="p-8 text-center bg-[#080d1a] border border-slate-800 rounded-3xl space-y-2">
                                <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                                <p className="text-xs font-bold text-slate-400">Aucun rendez-vous à venir</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {rdvAVenir.map((rdv) => (
                                    <RdvCard key={rdv.id} rdv={rdv} handleCancelRdv={handleCancelRdv} showToast={showToast} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Historique */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Historique ({rdvPasses.length})</span>
                        </h3>

                        {rdvPasses.length === 0 ? (
                            <div className="p-8 text-center bg-[#080d1a] border border-slate-800 rounded-3xl space-y-2">
                                <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                                <p className="text-xs font-bold text-slate-400">Aucun rendez-vous passé</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {rdvPasses.map((rdv) => (
                                    <RdvCard key={rdv.id} rdv={rdv} handleCancelRdv={handleCancelRdv} showToast={showToast} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODALE CRÉATION */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div
                        onClick={() => setIsAddModalOpen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70"
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.15 }}
                            className="w-full max-w-lg bg-[#080d1a] border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-left relative"
                        >
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-white rounded-2xl hover:bg-slate-800/50 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-white">Ouvrir un créneau horaire</h3>
                                <p className="text-xs text-slate-400 font-medium">Sélectionnez le formateur et définissez la plage horaire.</p>
                            </div>

                            <form onSubmit={handleCreateCreneau} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Formateur concerné *</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                                            <Search className="w-3.5 h-3.5" />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Rechercher par nom, prénom, email ou téléphone..."
                                            value={formateurSearch}
                                            onChange={(e) => {
                                                setFormateurSearch(e.target.value);
                                                if (selectedFormateur) setSelectedFormateur(null);
                                            }}
                                            onFocus={() => formateurResults.length > 0 && setSearchOpen(true)}
                                            className="w-full pl-10 pr-3 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-2xl text-xs font-semibold outline-none"
                                        />
                                        {searchLoading && (
                                            <span className="absolute inset-y-0 right-3 flex items-center">
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                                            </span>
                                        )}
                                        {searchOpen && formateurResults.length > 0 && (
                                            <div className="absolute top-full mt-1 left-0 right-0 bg-[#080d1a] border border-slate-800 rounded-2xl shadow-xl max-h-48 overflow-y-auto z-20">
                                                {formateurResults.map((f) => (
                                                    <button
                                                        key={f.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedFormateur(f);
                                                            setFormateurSearch(`${f.prenom} ${f.nom}`);
                                                            setSearchOpen(false);
                                                        }}
                                                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800/30 text-left transition-colors border-b border-slate-800 last:border-0 cursor-pointer"
                                                    >
                                                        {f.avatar ? (
                                                            <img src={f.avatar} alt={f.prenom} className="w-8 h-8 rounded-xl object-cover border border-slate-800 shrink-0" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-[10px] shrink-0">
                                                                {f.prenom[0]}{f.nom[0]}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-xs font-bold text-white">{f.prenom} {f.nom}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium">{f.email}{f.telephone ? ` · ${f.telephone}` : ''}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Date et heure de début *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={dateDebut}
                                        onChange={(e) => setDateDebut(e.target.value)}
                                        className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-2xl text-xs font-semibold outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Date et heure de fin *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={dateFin}
                                        onChange={(e) => setDateFin(e.target.value)}
                                        className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-2xl text-xs font-semibold outline-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-5 py-2.5 bg-slate-900/50 hover:bg-slate-800/50 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading || !selectedFormateur}
                                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                                    >
                                        {createLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        <span>Publier le créneau</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODALE ÉDITION */}
            <AnimatePresence>
                {isEditModalOpen && editingCreneau && (
                    <div
                        onClick={() => setIsEditModalOpen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70"
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.15 }}
                            className="w-full max-w-lg bg-[#080d1a] border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-left relative"
                        >
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-white rounded-2xl hover:bg-slate-800/50 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-white">Modifier le créneau</h3>
                                <p className="text-xs text-slate-400 font-medium">
                                    {editingCreneau.formateur.prenom} {editingCreneau.formateur.nom} — {formatDate(editingCreneau.dateDebut)}
                                </p>
                            </div>

                            <form onSubmit={handleUpdateCreneau} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Nouvelle date et heure de début *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={editDateDebut}
                                        onChange={(e) => setEditDateDebut(e.target.value)}
                                        className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-2xl text-xs font-semibold outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Nouvelle date et heure de fin *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={editDateFin}
                                        onChange={(e) => setEditDateFin(e.target.value)}
                                        className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-2xl text-xs font-semibold outline-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-5 py-2.5 bg-slate-900/50 hover:bg-slate-800/50 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editLoading}
                                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                                    >
                                        {editLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
                                        <span>Enregistrer</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function RdvCard({ rdv, handleCancelRdv, showToast }: { rdv: RendezVous; handleCancelRdv: (id: string) => void; showToast: any }) {
    return (
        <div className="p-5 bg-[#080d1a] border border-slate-800 rounded-3xl space-y-3 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    {rdv.candidat.avatar ? (
                        <img src={rdv.candidat.avatar} alt={rdv.candidat.prenom} className="w-8 h-8 rounded-xl object-cover border border-slate-800 shrink-0" />
                    ) : (
                        <div className="w-8 h-8 rounded-xl bg-indigo-950/30 flex items-center justify-center text-indigo-300 font-black text-xs shrink-0">
                            {rdv.candidat.prenom[0]}{rdv.candidat.nom[0]}
                        </div>
                    )}
                    <div>
                        <h3 className="text-xs font-black text-white">{rdv.candidat.prenom} {rdv.candidat.nom}</h3>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-950/30 text-cyan-300 font-extrabold text-[10px] rounded-full">
                                {rdv.type}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${rdv.statut === 'CONFIRME' ? 'bg-emerald-950/30 text-emerald-300' : 'bg-rose-950/30 text-rose-400'}`}>
                                {rdv.statut}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 ml-10">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="capitalize">{new Date(rdv.creneau.dateDebut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                    <span>{new Date(rdv.creneau.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(rdv.creneau.dateFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {rdv.motif && (
                    <p className="text-xs text-slate-400 italic ml-10">
                        Motif : &quot;{rdv.motif}&quot;
                    </p>
                )}
            </div>

            {rdv.statut === 'CONFIRME' && (
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => showToast("Lancement de la salle visio sécurisée...", "info")}
                        className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                    >
                        <Video className="w-4 h-4 text-red-500" />
                        <span>Rejoindre</span>
                    </button>

                    <button
                        onClick={() => handleCancelRdv(rdv.id)}
                        className="px-3 py-2 text-rose-400 hover:bg-rose-950/30 font-bold rounded-xl text-xs cursor-pointer border border-rose-800/50"
                    >
                        Annuler
                    </button>
                </div>
            )}
        </div>
    );
}
