"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { Calendar, Clock, User, CheckCircle, Video, AlertCircle, RefreshCw, X, Sparkles, Send, Trash2, ShieldCheck, Compass, GraduationCap, Target, Briefcase } from 'lucide-react';
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
        desc: 'Évaluez votre niveau actuel et définissez le bon parcours de certification.',
        icon: Compass,
        color: 'from-blue-600 to-indigo-600',
    },
    {
        id: 'COACHING_TECHNIQUE',
        title: 'Coaching Technique',
        desc: 'Revue de concepts complexes (Azure, Data, Security) avec un formateur expert.',
        icon: GraduationCap,
        color: 'from-purple-600 to-pink-600',
    },
    {
        id: 'PREPARATION_EXAMEN',
        title: 'Validation & Blanche Examen',
        desc: 'Dernières vérifications avant le passage officiel de votre examen.',
        icon: Target,
        color: 'from-red-600 to-rose-600',
    },
    {
        id: 'BILAN_CARRIERE',
        title: 'Bilan de Carrière IT',
        desc: 'Conseils personnalisés pour valoriser vos certifications sur le marché.',
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
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Réservation sélectionnée
    const [selectedType, setSelectedType] = useState<string>('COACHING_TECHNIQUE');
    const [selectedCreneau, setSelectedCreneau] = useState<Creneau | null>(null);
    const [motif, setMotif] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [availableData, myRdvData] = await Promise.all([
                apiFetch('/appointments/creneaux/disponibles'),
                apiFetch('/appointments/mes-rdv'),
            ]);
            setCreneaux(availableData);
            setMyAppointments(myRdvData);
        } catch (err: any) {
            console.error("Erreur chargement RDV:", err);
            showToast(err.message || "Impossible de charger les créneaux et rendez-vous.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBookAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCreneau) return;

        setBookingLoading(true);
        try {
            await apiFetch('/appointments/reserver', {
                method: 'POST',
                body: {
                    creneauId: parseInt(selectedCreneau.id),
                    type: selectedType,
                    motif: motif.trim() || undefined,
                },
            });

            showToast("Votre rendez-vous a été réservé avec succès ! Une notification vous a été envoyée.", "success");
            setSelectedCreneau(null);
            setMotif('');
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

    if (loading) {
        return (
            <div className="p-16 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl max-w-5xl mx-auto">
                <span className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-red-600">Chargement du système de rendez-vous...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto text-left">
            {/* EN-TÊTE DU MODULE DE RDV */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 font-extrabold text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            Accompagnement Sur-Mesure
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                        Prise de Rendez-vous & Coaching
                    </h1>
                    <p className="text-xs text-slate-400 font-medium max-w-xl">
                        Bénéficiez de séances individuelles en visioconférence avec nos formateurs certifiés pour valider votre préparation aux examens.
                    </p>
                </div>

                {/* BADGE STATS EN-TÊTE */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center shrink-0 w-full md:w-auto">
                    <span className="text-2xl font-black text-white block">{myAppointments.filter(r => r.statut === 'CONFIRME').length}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">RDV Confirmés à venir</span>
                </div>
            </div>

            {/* ONGLETS NAVIGATION */}
            <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
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
                    <span>Mes Rendez-vous ({myAppointments.length})</span>
                </button>
            </div>

            {/* CONTENU ONGLET 1 : RÉSERVER UN CRÉNEAU */}
            {activeTab === 'BOOK' && (
                <div className="space-y-8">
                    {/* ÉTAPE 1 : CHOIX DU TYPE DE SÉANCE */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">1. Choisissez le type de séance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {APPOINTMENT_TYPES.map((type) => {
                                const Icon = type.icon;
                                const isSelected = selectedType === type.id;
                                return (
                                    <div
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`p-5 bg-white border rounded-3xl space-y-3 cursor-pointer transition-all ${isSelected
                                            ? 'border-red-600 ring-2 ring-red-600/20 shadow-lg scale-[1.02]'
                                            : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${type.color} flex items-center justify-center text-white shadow-md`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-slate-950">{type.title}</h3>
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">{type.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ÉTAPE 2 : CHOIX DU CRÉNEAU DISPONIBLE */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">2. Sélectionnez un créneau horaire</h2>
                            <span className="text-xs font-bold text-slate-400">{creneaux.length} créneau(x) disponible(s)</span>
                        </div>

                        {creneaux.length === 0 ? (
                            <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
                                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                                <h3 className="text-sm font-bold text-slate-700">Aucun créneau disponible pour le moment</h3>
                                <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
                                    Les formateurs ajoutent régulièrement de nouvelles disponibilités. N'hésitez pas à revenir consulter cette page ultérieurement.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {creneaux.map((c) => (
                                    <div
                                        key={c.id}
                                        className="p-5 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div className="space-y-3">
                                            {/* INFO FORMATEUR */}
                                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                                {c.formateur.avatar ? (
                                                    <img src={c.formateur.avatar} alt={c.formateur.prenom} className="w-9 h-9 rounded-xl object-cover" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-xl bg-slate-950 text-white font-black text-xs flex items-center justify-center">
                                                        {c.formateur.prenom[0]}{c.formateur.nom[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-950">{c.formateur.prenom} {c.formateur.nom}</h4>
                                                    <span className="text-[10px] text-red-650 font-bold uppercase tracking-wider">Formateur Expert</span>
                                                </div>
                                            </div>

                                            {/* HORAIRE ET DATE */}
                                            <div className="space-y-1">
                                                <p className="text-xs font-extrabold text-slate-900 capitalize flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                                    <span>{formatDate(c.dateDebut)}</span>
                                                </p>
                                                <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{formatTime(c.dateDebut)} - {formatTime(c.dateFin)}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedCreneau(c)}
                                            className="w-full mt-2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-red-600/20"
                                        >
                                            <span>Réserver ce créneau</span>
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
                    {myAppointments.length === 0 ? (
                        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
                            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                            <h3 className="text-sm font-bold text-slate-700">Aucun rendez-vous réservé</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                Cliquez sur "Réserver un Créneau" pour fixer votre première séance de coaching avec un formateur.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myAppointments.map((rdv) => (
                                <div
                                    key={rdv.id}
                                    className={`p-6 bg-white border rounded-3xl space-y-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${rdv.statut === 'ANNULE' ? 'opacity-60 border-slate-200' : 'border-slate-200/90'
                                        }`}
                                >
                                    <div className="flex items-start md:items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shrink-0">
                                            <Video className="w-6 h-6 text-red-500" />
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
                                                <Video className="w-4 h-4 text-red-500" />
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

            {/* MODALE DE CONFIRMATION DE RÉSERVATION */}
            <AnimatePresence>
                {selectedCreneau && (
                    <div
                        onClick={() => setSelectedCreneau(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-left relative"
                        >
                            <button
                                onClick={() => setSelectedCreneau(null)}
                                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-950 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="space-y-2">
                                <span className="px-3 py-1 bg-red-50 text-red-700 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                                    Confirmation de séance
                                </span>
                                <h3 className="text-xl font-black text-slate-950">
                                    Réserver votre créneau de coaching
                                </h3>
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                                <p className="font-bold text-slate-800 flex items-center gap-2 capitalize">
                                    <Calendar className="w-4 h-4 text-red-600" />
                                    <span>{formatDate(selectedCreneau.dateDebut)}</span>
                                </p>
                                <p className="font-bold text-slate-600 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span>{formatTime(selectedCreneau.dateDebut)} - {formatTime(selectedCreneau.dateFin)}</span>
                                </p>
                                <p className="font-bold text-slate-600 flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span>Formateur : {selectedCreneau.formateur.prenom} {selectedCreneau.formateur.nom}</span>
                                </p>
                            </div>

                            <form onSubmit={handleBookAppointment} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Motif ou questions spécifiques (Optionnel)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Précisez la certification visée ou les sujets particuliers que vous souhaitez aborder durant la séance..."
                                        value={motif}
                                        onChange={(e) => setMotif(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
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
                                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
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