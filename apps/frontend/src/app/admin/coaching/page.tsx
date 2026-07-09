"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { Calendar, Clock, Plus, User, CheckCircle, Video, RefreshCw, X, Trash2, ShieldCheck, Sparkles, AlertCircle } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface Formateur {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    avatar?: string | null;
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

    const [creneaux, setCreneaux] = useState<Creneau[]>([]);
    const [allRendezVous, setAllRendezVous] = useState<RendezVous[]>([]);
    const [loading, setLoading] = useState(true);
    const [createLoading, setCreateLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Formulaire d'ajout de créneau
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');

    const fetchData = async () => {
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
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateCreneau = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dateDebut || !dateFin) return;

        setCreateLoading(true);
        try {
            await apiFetch('/appointments/creneaux', {
                method: 'POST',
                body: {
                    dateDebut: new Date(dateDebut).toISOString(),
                    dateFin: new Date(dateFin).toISOString(),
                },
            });

            showToast("Nouveau créneau de disponibilité publié !", "success");
            setIsAddModalOpen(false);
            setDateDebut('');
            setDateFin('');
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

    if (loading) {
        return (
            <div className="p-16 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl max-w-5xl mx-auto">
                <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement de la gestion des rendez-vous...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto text-left">
            {/* EN-TÊTE ADMIN */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-3">
                        <Calendar className="w-7 h-7 text-red-600" />
                        <span>Planning & Gestion des Créneaux</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        Proposez des créneaux de disponibilité pour vos apprenants et suivez vos séances de coaching attribuées.
                    </p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md shadow-red-600/20 cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Ouvrir un nouveau créneau</span>
                </button>
            </div>

            {/* SECTION 1 : RENDEZ-VOUS ÉTABLIS */}
            <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Rendez-vous Réservés par les Apprenants ({allRendezVous.length})</h2>

                {allRendezVous.length === 0 ? (
                    <div className="p-10 text-center bg-white border border-slate-200 rounded-3xl space-y-2">
                        <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-600">Aucun rendez-vous réservé pour l'instant</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {allRendezVous.map((rdv) => (
                            <div
                                key={rdv.id}
                                className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-3 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-black text-slate-950">Apprenant : {rdv.candidat.prenom} {rdv.candidat.nom}</h3>
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded-full">
                                            {rdv.type}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${rdv.statut === 'CONFIRME' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {rdv.statut}
                                        </span>
                                    </div>

                                    <p className="text-xs font-bold text-slate-600 capitalize">
                                        📅 {formatDate(rdv.creneau.dateDebut)} de {formatTime(rdv.creneau.dateDebut)} à {formatTime(rdv.creneau.dateFin)}
                                    </p>

                                    {rdv.motif && (
                                        <p className="text-xs text-slate-500 italic">
                                            Motif : "{rdv.motif}"
                                        </p>
                                    )}
                                </div>

                                {rdv.statut === 'CONFIRME' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => showToast("Lancement de la salle visio sécurisée...", "info")}
                                            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                                        >
                                            <Video className="w-4 h-4 text-red-500" />
                                            <span>Rejoindre</span>
                                        </button>

                                        <button
                                            onClick={() => handleCancelRdv(rdv.id)}
                                            className="px-3 py-2 text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-xs cursor-pointer border border-rose-200"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SECTION 2 : CRÉNEAUX OUVERTS EN ATTENTE DE RÉSERVATION */}
            <div className="space-y-4 pt-4">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Créneaux Ouverts Disponibles ({creneaux.length})</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {creneaux.map((c) => (
                        <div key={c.id} className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-sm">
                            <p className="text-xs font-extrabold text-slate-900 capitalize">📅 {formatDate(c.dateDebut)}</p>
                            <p className="text-xs text-slate-500 font-bold">⏰ {formatTime(c.dateDebut)} - {formatTime(c.dateFin)}</p>
                            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                                <span className="text-[10px] text-emerald-600 font-extrabold uppercase">Disponible</span>
                                <span className="text-[10px] text-slate-400 font-bold">Formateur: {c.formateur.prenom}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODALE CRÉATION CRÉNEAU */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div
                        onClick={() => setIsAddModalOpen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-left relative"
                        >
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-950 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-slate-950">Ouvrir un créneau horaire</h3>
                                <p className="text-xs text-slate-500 font-medium">Définissez la plage horaire durant laquelle vous serez disponible.</p>
                            </div>

                            <form onSubmit={handleCreateCreneau} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Date et heure de début *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={dateDebut}
                                        onChange={(e) => setDateDebut(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Date et heure de fin *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={dateFin}
                                        onChange={(e) => setDateFin(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
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
        </div>
    );
}