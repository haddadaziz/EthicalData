"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { Calendar, CalendarCheck, Clock, User, CheckCircle, Video, AlertCircle, RefreshCw, X, Sparkles, Send, Trash2, ShieldCheck, Compass, GraduationCap, Target, Briefcase, Filter, Award, Check, Plus } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface Formateur {
    id: string;
    prenom: string;
    nom: string;
    avatar?: string | null;
    email: string;
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
    type: 'ORIENTATION' | 'COACHING_TECHNIQUE' | 'PREPARATION_EXAMEN' | 'BILAN_CARRIERE';
    motif?: string;
    statut: 'CONFIRME' | 'ANNULE' | 'TERMINE';
    dateCreation: string;
    candidat: Formateur;
    formateur: Formateur;
    creneau: Creneau;
}

const APPOINTMENT_TYPES = [
    {
        id: 'ORIENTATION',
        title: 'Orientation & Diagnostic',
        desc: 'Évaluez votre niveau et définissez votre parcours de certification.',
        icon: Compass,
        color: 'from-blue-600 to-indigo-600',
    },
    {
        id: 'COACHING_TECHNIQUE',
        title: 'Coaching Technique',
        desc: 'Revue de concepts complexes (Azure, Data, Security) avec un expert.',
        icon: GraduationCap,
        color: 'from-purple-600 to-pink-600',
    },
    {
        id: 'PREPARATION_EXAMEN',
        title: 'Validation & Examen Blanc',
        desc: 'Dernières vérifications avant le passage officiel de votre examen.',
        icon: Target,
        color: 'from-blue-600 to-indigo-600',
    },
    {
        id: 'BILAN_CARRIERE',
        title: 'Bilan de Carrière IT',
        desc: 'Conseils pour valoriser vos certifications auprès des recruteurs.',
        icon: Briefcase,
        color: 'from-emerald-600 to-teal-600',
    },
];

export default function AppointmentsPage() {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    
    const [activeTab, setActiveTab] = useState<'BOOK' | 'MY_RDV'>('BOOK');
    const [creneaux, setCreneaux] = useState<Creneau[]>([]);
    const [myAppointments, setMyAppointments] = useState<RendezVous[]>([]);
    const [certs, setCerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Mode Formateur & Profil Connecté
    const [viewMode, setViewMode] = useState<'APPRENANT' | 'FORMATEUR'>('APPRENANT');
    const [me, setMe] = useState<any>(null);
    const [trainerActiveTab, setTrainerActiveTab] = useState<'CREATE' | 'RDV'>('CREATE');

    // Formulaire de création de créneau (Formateur)
    const [slotDate, setSlotDate] = useState('');
    const [slotStart, setSlotStart] = useState('');
    const [slotEnd, setSlotEnd] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    // Filtres Étape 1 (Créneaux)
    const [selectedFormateurFilter, setSelectedFormateurFilter] = useState<string>('ALL');
    const [selectedCertFilter, setSelectedCertFilter] = useState<string>('ALL');
    const [selectedDateFilter, setSelectedDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK'>('ALL');

    // Étape 2 : Sélection dans la Modale de Réservation
    const [selectedCreneau, setSelectedCreneau] = useState<Creneau | null>(null);
    const [selectedType, setSelectedType] = useState<string>('COACHING_TECHNIQUE');
    const [selectedCertForBooking, setSelectedCertForBooking] = useState<string>('');
    const [motif, setMotif] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [availableData, myRdvData, certsData, meData] = await Promise.all([
                apiFetch('/appointments/creneaux/disponibles'),
                apiFetch('/appointments/mes-rdv'),
                apiFetch('/certifications').catch(() => []),
                apiFetch('/users/me/profile').catch(() => null),
            ]);
            const listCreneaux = Array.isArray(availableData) ? availableData : (availableData?.data || []);
            const listRdv = Array.isArray(myRdvData) ? myRdvData : (myRdvData?.data || []);
            const listCerts = Array.isArray(certsData) ? certsData : (certsData?.data || []);
            
            setCreneaux(listCreneaux);
            setMyAppointments(listRdv);
            setCerts(listCerts);
            setMe(meData);
        } catch (err: any) {
            console.error("Erreur chargement RDV:", err);
            showToast(err.message || "Impossible de charger les créneaux et rendez-vous.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem('viewMode');
        if (saved === 'FORMATEUR' || saved === 'APPRENANT') {
            setViewMode(saved as 'APPRENANT' | 'FORMATEUR');
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!slotDate || !slotStart || !slotEnd) {
            showToast("Veuillez remplir tous les champs du créneau.", "error");
            return;
        }

        const dateDebut = new Date(`${slotDate}T${slotStart}:00`).toISOString();
        const dateFin = new Date(`${slotDate}T${slotEnd}:00`).toISOString();

        if (new Date(dateDebut) >= new Date(dateFin)) {
            showToast("L'heure de début doit être antérieure à l'heure de fin.", "error");
            return;
        }

        setCreateLoading(true);
        try {
            await apiFetch('/appointments/creneaux', {
                method: 'POST',
                body: { dateDebut, dateFin },
            });
            showToast("Votre créneau de disponibilité a été créé avec succès !", "success");
            setSlotDate('');
            setSlotStart('');
            setSlotEnd('');
            fetchData();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la création du créneau.", "error");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteSlot = async (id: string) => {
        const isConfirmed = await confirm({
            title: "Supprimer le Créneau ?",
            message: "Êtes-vous sûr de vouloir supprimer ce créneau de disponibilité ?",
            confirmText: "Oui, supprimer",
            cancelText: "Annuler",
            type: "danger",
        });
        if (!isConfirmed) return;

        try {
            await apiFetch(`/appointments/creneaux/${id}`, {
                method: 'DELETE',
            });
            showToast("Créneau supprimé avec succès.", "success");
            fetchData();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la suppression du créneau.", "error");
        }
    };

    const handleBookAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCreneau) return;

        setBookingLoading(true);
        try {
            let finalMotif = motif.trim();
            if (selectedCertForBooking) {
                finalMotif = `[Certification: ${selectedCertForBooking}] ${finalMotif}`.trim();
            }

            await apiFetch('/appointments/reserver', {
                method: 'POST',
                body: {
                    creneauId: parseInt(selectedCreneau.id),
                    type: selectedType,
                    motif: finalMotif || undefined,
                },
            });

            showToast("Votre rendez-vous a été réservé avec succès ! Une notification vous a été envoyée.", "success");
            setSelectedCreneau(null);
            setMotif('');
            setSelectedCertForBooking('');
            setActiveTab('MY_RDV');
            fetchData();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la réservation du créneau.", "error");
        } finally {
            setBookingLoading(false);
        }
    };

    const handleCancelAppointment = async (rdvId: string) => {
        const isConfirmed = await confirm({
            title: "Annuler le Rendez-vous ?",
            message: "Êtes-vous sûr de vouloir annuler cette session ? Le créneau sera libéré pour d'autres apprenants.",
            confirmText: "Oui, annuler",
            cancelText: "Garder mon RDV",
            type: "danger",
        });

        if (!isConfirmed) return;

        try {
            await apiFetch(`/appointments/${rdvId}/annuler`, { method: 'PATCH' });
            showToast("Le rendez-vous a été annulé avec succès.", "success");
            fetchData();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de l'annulation du rendez-vous.", "error");
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

    // Liste unique des formateurs ayant des créneaux
    const availableFormateurs = Array.from(
        new Map(creneaux.map(c => [c.formateur.id, c.formateur])).values()
    );

    // Filtrage dynamique des créneaux (Étape 1)
    const filteredCreneaux = creneaux.filter((c) => {
        if (selectedFormateurFilter !== 'ALL' && c.formateur.id !== selectedFormateurFilter) {
            return false;
        }

        if (selectedDateFilter === 'TODAY') {
            const today = new Date().toDateString();
            if (new Date(c.dateDebut).toDateString() !== today) return false;
        } else if (selectedDateFilter === 'WEEK') {
            const now = new Date();
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const d = new Date(c.dateDebut);
            if (d < now || d > nextWeek) return false;
        }

        return true;
    });

    if (loading) {
        return (
            <div className="p-16 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl max-w-5xl mx-auto">
                <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement des créneaux & coaching...</p>
            </div>
        );
    }

    if (viewMode === 'FORMATEUR') {
        const mySlots = creneaux.filter(c => c.formateur.id.toString() === me?.id?.toString());
        const mySessions = myAppointments.filter(rdv => rdv.formateur.id.toString() === me?.id?.toString() && rdv.statut === 'CONFIRME');

        return (
            <div className="space-y-8 max-w-6xl mx-auto text-left">
                {/* BARRE D'ACTION SUPÉRIEURE ÉPURÉE */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setTrainerActiveTab('CREATE')}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${trainerActiveTab === 'CREATE'
                                ? 'bg-slate-950 text-white shadow-md'
                                : 'bg-white text-slate-650 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Gérer mes Créneaux ({mySlots.length})</span>
                        </button>

                        <button
                            onClick={() => setTrainerActiveTab('RDV')}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${trainerActiveTab === 'RDV'
                                ? 'bg-slate-950 text-white shadow-md'
                                : 'bg-white text-slate-650 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            <CalendarCheck className="w-4 h-4" />
                            <span>Sessions de Coaching ({mySessions.length})</span>
                        </button>
                    </div>
                </div>

                {trainerActiveTab === 'CREATE' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* FORMULAIRE DE CRÉATION (1/3) */}
                        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs h-fit space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-sm font-black text-slate-955 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span>Ajouter une disponibilité</span>
                                </h3>
                                <p className="text-[11px] text-slate-400 font-medium">
                                    Proposez un créneau horaire libre que les apprenants pourront réserver.
                                </p>
                            </div>

                            <form onSubmit={handleCreateSlot} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Date du créneau</label>
                                    <input
                                        type="date"
                                        value={slotDate}
                                        onChange={(e) => setSlotDate(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-950 text-xs font-bold outline-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">Heure de début</label>
                                        <input
                                            type="time"
                                            value={slotStart}
                                            onChange={(e) => setSlotStart(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-950 text-xs font-bold outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">Heure de fin</label>
                                        <input
                                            type="time"
                                            value={slotEnd}
                                            onChange={(e) => setSlotEnd(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-950 text-xs font-bold outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white disabled:text-slate-400 font-extrabold text-xs rounded-2xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {createLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    <span>Ajouter la disponibilité</span>
                                </button>
                            </form>
                        </div>

                        {/* LISTE DES CRÉNEAUX LIBRES (2/3) */}
                        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
                            <h3 className="text-sm font-black text-slate-955 border-b border-slate-100 pb-3 mb-4">
                                Mes créneaux libres disponibles ({mySlots.length})
                            </h3>

                            {mySlots.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-xs text-slate-400 font-bold italic">Aucun créneau disponible créé pour le moment.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {mySlots.map((c) => (
                                        <div key={c.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-slate-900">
                                                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                                    <span className="text-xs font-bold">{formatDate(c.dateDebut)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-medium">
                                                        {formatTime(c.dateDebut)} - {formatTime(c.dateFin)}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSlot(c.id)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                                                title="Supprimer ce créneau"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* SESSIONS DE COACHING RÉSERVÉES */
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
                        <h3 className="text-sm font-black text-slate-955 border-b border-slate-100 pb-3">
                            Séances de coaching planifiées avec vos apprenants ({mySessions.length})
                        </h3>

                        {mySessions.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-xs text-slate-400 font-bold italic">Aucun rendez-vous réservé avec un apprenant pour le moment.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {mySessions.map((rdv) => (
                                    <div key={rdv.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            {/* Info Apprenant */}
                                            {rdv.candidat.avatar ? (
                                                <img src={rdv.candidat.avatar} alt={rdv.candidat.prenom} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm shrink-0">
                                                    {rdv.candidat.prenom[0]}{rdv.candidat.nom[0]}
                                                </div>
                                            )}
                                            <div className="space-y-1">
                                                <span className="text-xs font-black text-slate-900">
                                                    {rdv.candidat.prenom} {rdv.candidat.nom}
                                                </span>
                                                <span className="text-[10px] text-indigo-600 font-extrabold uppercase bg-indigo-50 px-2 py-0.5 rounded-md block w-fit">
                                                    {rdv.type.replace(/_/g, ' ')}
                                                </span>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                    {rdv.motif || "Aucune précision fournie."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                                            <div className="space-y-1 text-left md:text-right">
                                                <div className="flex items-center gap-1.5 text-slate-900 justify-start md:justify-end">
                                                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                                    <span className="text-xs font-bold">{formatDate(rdv.creneau.dateDebut)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500 justify-start md:justify-end">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-semibold">
                                                        {formatTime(rdv.creneau.dateDebut)} - {formatTime(rdv.creneau.dateFin)}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleCancelAppointment(rdv.id)}
                                                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[10px] rounded-xl transition-all cursor-pointer border border-rose-250/20"
                                            >
                                                Annuler la session
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto text-left">
            {/* BARRE D'ACTION SUPÉRIEURE ÉPURÉE */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveTab('BOOK')}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'BOOK'
                            ? 'bg-slate-950 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Réserver un Créneau ({creneaux.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('MY_RDV')}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'MY_RDV'
                            ? 'bg-slate-950 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                    >
                        <Clock className="w-4 h-4" />
                        <span>Mes Rendez-vous ({myAppointments.filter(r => r.statut === 'CONFIRME').length})</span>
                    </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-2xl shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{myAppointments.filter(r => r.statut === 'CONFIRME').length} RDV confirmé(s) à venir</span>
                </div>
            </div>

            {/* CONTENU ONGLET 1 : SÉLECTION DES CRÉNEAUX EN PREMIER */}
            {activeTab === 'BOOK' && (
                <div className="space-y-8">
                    {/* ÉTAPE 1 : CHOIX DU CRÉNEAU HORAIRE (AVEC FILTRES INTELLIGENTS) */}
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-wider text-slate-950 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                                    <span>Sélectionnez un créneau horaire disponible</span>
                                </h2>
                                <p className="text-xs text-slate-500 font-medium mt-1">
                                    Filtrer par certification ou par créneau horaire pour trouver votre horaire idéal.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-slate-400 shrink-0">
                                {filteredCreneaux.length} créneau(x) disponible(s)
                            </span>
                        </div>

                        {/* BARRE DE FILTRES INTELLIGENTE (CERTIFICATION + CRÉNEAU) */}
                        <div className="bg-white border border-slate-200/90 rounded-3xl p-4 md:p-5 shadow-sm space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* FILTRE PAR CERTIFICATION */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Award className="w-3.5 h-3.5 text-blue-600" />
                                        <span>Filtre par Certification</span>
                                    </label>
                                    <select
                                        value={selectedCertFilter}
                                        onChange={(e) => setSelectedCertFilter(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-950 text-xs font-bold outline-none cursor-pointer"
                                    >
                                        <option value="ALL">Toutes les certifications</option>
                                        {certs.map((c) => (
                                            <option key={c.id} value={c.codeExamen || c.nom}>
                                                {c.codeExamen ? `[${c.codeExamen}] ${c.nom}` : c.nom}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* FILTRE PAR PÉRIODE / CRÉNEAU */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Filtre par Créneau</span>
                                    </label>
                                    <select
                                        value={selectedDateFilter}
                                        onChange={(e) => setSelectedDateFilter(e.target.value as any)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-950 text-xs font-bold outline-none cursor-pointer"
                                    >
                                        <option value="ALL">Tous les créneaux à venir</option>
                                        <option value="TODAY">Aujourd'hui uniquement</option>
                                        <option value="WEEK">7 prochains jours</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* GRILLE DES CRÉNEAUX DISPONIBLES */}
                        {filteredCreneaux.length === 0 ? (
                            <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
                                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                                <h3 className="text-sm font-bold text-slate-700">Aucun créneau correspondant à vos filtres</h3>
                                <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
                                    Essayez de modifier vos options de filtres ou revenez ultérieurement pour découvrir de nouvelles disponibilités.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredCreneaux.map((c) => (
                                    <div
                                        key={c.id}
                                        className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                                    >
                                        <div className="space-y-3">
                                            {/* INFO FORMATEUR */}
                                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                                {c.formateur.avatar ? (
                                                    <img src={c.formateur.avatar} alt={c.formateur.prenom} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-slate-950 text-white font-black text-xs flex items-center justify-center">
                                                        {c.formateur.prenom[0]}{c.formateur.nom[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-950">{c.formateur.prenom} {c.formateur.nom}</h4>
                                                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Formateur Expert</span>
                                                </div>
                                            </div>

                                            {/* HORAIRE ET DATE DU CRÉNEAU */}
                                            <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                                <p className="text-xs font-extrabold text-slate-900 capitalize flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                                                    <span>{formatDate(c.dateDebut)}</span>
                                                </p>
                                                <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                                    <span>{formatTime(c.dateDebut)} - {formatTime(c.dateFin)}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedCreneau(c)}
                                            className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/20 hover:shadow-blue-600/40"
                                        >
                                            <span>Sélectionner ce créneau</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CONTENU ONGLET 2 : MES RENDEZ-VOUS */}
            {activeTab === 'MY_RDV' && (
                <div className="space-y-4">
                    {myAppointments.filter(r => r.statut === 'CONFIRME').length === 0 ? (
                        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
                            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                            <h3 className="text-sm font-bold text-slate-700">Aucun rendez-vous réservé</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                Cliquez sur "Sélectionner un Créneau" pour fixer votre première séance de coaching avec un formateur.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myAppointments.filter(r => r.statut === 'CONFIRME').map((rdv) => (
                                <div
                                    key={rdv.id}
                                    className={`p-6 bg-white border rounded-3xl space-y-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${rdv.statut === 'ANNULE' ? 'opacity-60 border-slate-200' : 'border-slate-200/90'
                                        }`}
                                >
                                    <div className="flex items-start md:items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shrink-0">
                                            <Video className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-black text-slate-950">Séance : {rdv.type}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${rdv.statut === 'CONFIRME' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                    }`}>
                                                    {rdv.statut === 'CONFIRME' ? 'Confirmé' : 'Annulé'}
                                                </span>
                                            </div>

                                            <p className="text-xs font-bold text-slate-600 flex items-center gap-2 capitalize">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{formatDate(rdv.creneau.dateDebut)} à {formatTime(rdv.creneau.dateDebut)}</span>
                                            </p>

                                            <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Formateur : <strong>{rdv.formateur.prenom} {rdv.formateur.nom}</strong></span>
                                            </p>

                                            {rdv.motif && (
                                                <p className="text-xs text-slate-400 italic pt-1 max-w-lg">
                                                    Motif : "{rdv.motif}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {rdv.statut === 'CONFIRME' && (
                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <button
                                                onClick={() => showToast("Le lien de visioconférence sécurisé s'activera 10 minutes avant la séance.", "info")}
                                                className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                                            >
                                                <Video className="w-4 h-4 text-blue-500" />
                                                <span>Accéder à la visio</span>
                                            </button>

                                            <button
                                                onClick={() => handleCancelAppointment(rdv.id)}
                                                className="px-3 py-2.5 text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-xs cursor-pointer transition-colors border border-rose-200"
                                            >
                                                <span>Annuler</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ÉTAPE 2 : MODALE DÉFAINITION DU TYPE DE SÉANCE & CONFIRMATION RÉSERVATION */}
            <AnimatePresence>
                {selectedCreneau && (
                    <div
                        onClick={() => setSelectedCreneau(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-left relative max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setSelectedCreneau(null)}
                                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-950 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* RAPPEL DU CRÉNEAU SÉLECTIONNÉ (ÉTAPE 1) */}
                            <div className="space-y-2 border-b border-slate-100 pb-4">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                                    Étape 2 / 2 : Configuration de la séance
                                </span>
                                <h3 className="text-xl font-black text-slate-950">
                                    Finaliser votre réservation de coaching
                                </h3>

                                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-2">
                                    <div className="space-y-1">
                                        <p className="font-extrabold text-slate-900 capitalize flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            <span>{formatDate(selectedCreneau.dateDebut)}</span>
                                        </p>
                                        <p className="font-bold text-slate-600 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span>{formatTime(selectedCreneau.dateDebut)} - {formatTime(selectedCreneau.dateFin)}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/60">
                                        {selectedCreneau.formateur.avatar ? (
                                            <img src={selectedCreneau.formateur.avatar} alt={selectedCreneau.formateur.prenom} className="w-7 h-7 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-lg bg-slate-950 text-white font-black text-[10px] flex items-center justify-center">
                                                {selectedCreneau.formateur.prenom[0]}{selectedCreneau.formateur.nom[0]}
                                            </div>
                                        )}
                                        <span className="font-bold text-slate-900 text-xs">{selectedCreneau.formateur.prenom} {selectedCreneau.formateur.nom}</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleBookAppointment} className="space-y-6">
                                {/* CHOIX DU TYPE DE SÉANCE */}
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-950 block">
                                        Choisissez le type de séance *
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {APPOINTMENT_TYPES.map((type) => {
                                            const Icon = type.icon;
                                            const isSelected = selectedType === type.id;
                                            return (
                                                <div
                                                    key={type.id}
                                                    onClick={() => setSelectedType(type.id)}
                                                    className={`p-4 bg-white border rounded-2xl space-y-2 cursor-pointer transition-all ${isSelected
                                                        ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/10 shadow-md'
                                                        : 'border-slate-200/90 hover:border-slate-350 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${type.color} flex items-center justify-center text-white shadow-sm`}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        {isSelected && (
                                                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-black text-slate-950">{type.title}</h4>
                                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{type.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* CHOIX DE LA CERTIFICATION CONCERNÉE (OPTIONNEL) */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Certification concernée (Optionnel)</label>
                                    {(() => {
                                        const targetCertifications = certs.filter(c => 
                                            (me?.preferences?.targetCertifications || []).map((id: any) => id.toString()).includes(c.id.toString())
                                        );
                                        const hasTargetCerts = targetCertifications.length > 0;

                                        return (
                                            <select
                                                value={selectedCertForBooking}
                                                onChange={(e) => setSelectedCertForBooking(e.target.value)}
                                                disabled={!hasTargetCerts}
                                                className={`w-full p-3.5 border rounded-2xl text-xs font-bold outline-none transition-all ${
                                                    hasTargetCerts 
                                                        ? 'bg-slate-50 border-slate-200 focus:border-blue-600 text-slate-950 cursor-pointer' 
                                                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {hasTargetCerts ? (
                                                    <>
                                                        <option value="">Sélectionnez la certification de votre choix</option>
                                                        {targetCertifications.map((c) => (
                                                            <option key={c.id} value={c.codeExamen || c.nom}>
                                                                {c.codeExamen ? `[${c.codeExamen}] ${c.nom}` : c.nom}
                                                            </option>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <option value="">Vous n&apos;avez aucune certification dans vos objectifs visés, veuillez en ajouter</option>
                                                )}
                                            </select>
                                        );
                                    })()}
                                </div>

                                {/* MOTIF / QUESTIONS PARTICULIÈRES */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Précisions ou questions particulières (Optionnel)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Décrivez les points particuliers que vous souhaitez aborder durant cette séance..."
                                        value={motif}
                                        onChange={(e) => setMotif(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCreneau(null)}
                                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={bookingLoading}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                                    >
                                        {bookingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        <span>Confirmer la réservation</span>
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