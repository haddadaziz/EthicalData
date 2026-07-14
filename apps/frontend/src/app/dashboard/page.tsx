"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { 
    ListChecks, 
    Play, 
    Video, 
    Calendar,
    CalendarCheck, 
    BookMarked,
    Users, 
    CheckCircle2, 
    AlertTriangle, 
    Clock, 
    ChevronRight,
    Award,
    Target,
    BookOpen,
    X,
    FileText
} from '@/components/icons';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Helper pour récupérer l'écousson/badge officiel du certificat
const getCertificateBadgeLogo = (cert: any) => {
    if (cert.image && (cert.image.endsWith('.svg') || cert.image.endsWith('.png'))) return cert.image;
    const code = (cert.codeExamen || cert.code || '').toLowerCase();
    const nom = (cert.nom || cert.title || '').toLowerCase();

    if (code.includes('az-900') || nom.includes('az-900') || nom.includes('azure fundamentals')) return '/badges/az-900.svg';
    if (code.includes('clf') || nom.includes('cloud practitioner')) return '/badges/aws-clf.svg';
    if (code.includes('saa') || nom.includes('solutions architect')) return '/badges/aws-saa.svg';
    if (code.includes('iso-27001') || nom.includes('iso 27001') || nom.includes('pecb')) return '/badges/pecb-iso.svg';
    if (code.includes('sy0') || nom.includes('security+')) return '/badges/comptia-sec.svg';
    if (code.includes('sc-900') || nom.includes('sc-900')) return '/badges/sc-900.svg';

    return cert.image || cert.logoUrl || '/badges/az-900.svg';
};

export default function StudentDashboard() {
    const [certs, setCerts] = useState<any[]>([]);
    const [targetCertIds, setTargetCertIds] = useState<string[]>([]);
    const [stats, setStats] = useState<any>({ totalAttempts: 0, averageScore: 0, readinessScore: 0, readinessLabel: 'NON_PRET' });
    const [readinessData, setReadinessData] = useState<any>(null);
    const [selectedCert, setSelectedCert] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('Étudiant');
    const [activeStep, setActiveStep] = useState<number | null>(null);

    const [viewMode, setViewMode] = useState<'APPRENANT' | 'FORMATEUR'>(() => {
        if (typeof window !== 'undefined') {
            // Priorité au choix explicite de l'utilisateur sauvegardé dans localStorage
            const savedMode = localStorage.getItem('viewMode');
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                try {
                    const payloadBase64 = token.split('.')[1];
                    const decodedPayload = JSON.parse(atob(payloadBase64));
                    const roles = decodedPayload.roles || [];
                    const isFormateur = roles.includes('FORMATEUR');
                    if (savedMode === 'APPRENANT') return 'APPRENANT';
                    if (savedMode === 'FORMATEUR' && isFormateur) return 'FORMATEUR';
                    if (isFormateur) return 'FORMATEUR';
                } catch (e) {}
            }
        }
        return 'APPRENANT';
    });
    const [myAppointments, setMyAppointments] = useState<any[]>([]);
    const [me, setMe] = useState<any>(null);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (activeStep !== null) {
                const target = e.target as HTMLElement;
                if (!target.closest('.tooltip-card') && !target.closest('.step-btn')) {
                    setActiveStep(null);
                }
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [activeStep]);

    // Écouter le changement de mode déclenché par le layout (switch instantané sans rechargement)
    useEffect(() => {
        const handleViewModeChanged = () => {
            const saved = localStorage.getItem('viewMode');
            if (saved === 'FORMATEUR' || saved === 'APPRENANT') {
                setViewMode(saved as 'APPRENANT' | 'FORMATEUR');
            }
        };
        window.addEventListener('viewModeChanged', handleViewModeChanged);
        return () => window.removeEventListener('viewModeChanged', handleViewModeChanged);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            try {
                const payloadBase64 = token.split('.')[1];
                const decodedPayload = JSON.parse(atob(payloadBase64));
                setFirstName(decodedPayload.prenom || decodedPayload.email?.split('@')[0] || 'Candidat');
            } catch (e) {
                console.error(e);
            }
        }

        const loadDashboardData = async () => {
            try {
                const [certsData, statsData, profileData, appointmentsData] = await Promise.all([
                    apiFetch('/certifications').catch(() => []),
                    apiFetch('/simulations/me/stats').catch(() => null),
                    apiFetch('/users/me/profile').catch(() => null),
                    apiFetch('/appointments/mes-rdv').catch(() => []),
                ]);
                const listCerts = Array.isArray(certsData) ? certsData : (certsData?.data || []);
                setCerts(listCerts);
                if (statsData) setStats(statsData);
                if (profileData) setMe(profileData);
                if (appointmentsData) setMyAppointments(Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData?.data || []));

                const tIds = (profileData?.preferences?.targetCertifications || []).map((id: any) => id.toString());
                setTargetCertIds(tIds);

                const targeted = listCerts.filter((c: any) => tIds.includes(c.id.toString()));

                if (targeted.length > 0) {
                    const firstCert = targeted[0];
                    setSelectedCert(firstCert);
                    try {
                        const readData = await apiFetch(`/simulations/certifications/${firstCert.id}/readiness`);
                        setReadinessData(readData);
                    } catch (e) {
                        console.error(e);
                    }
                }
            } catch (err) {
                console.error("Erreur de chargement du tableau de bord:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Gérer le changement de certification analysée
    const handleSelectCert = async (cert: any) => {
        setSelectedCert(cert);
        try {
            const readData = await apiFetch(`/simulations/certifications/${cert.id}/readiness`);
            setReadinessData(readData);
        } catch (e) {
            console.error(e);
        }
    };

    const targetedCerts = certs.filter(c => targetCertIds.includes(c.id.toString()));

    const readinessScore = readinessData?.readinessScore ?? (stats.readinessScore || 78);
    const isReady = readinessScore >= 80;
    const isAlmostReady = readinessScore >= 65 && readinessScore < 80;

    const filteredHistory = selectedCert
        ? (readinessData?.history
            ? readinessData.history
            : ((stats.history || []).filter((attempt: any) => 
                (attempt.certificationId && attempt.certificationId.toString() === selectedCert.id?.toString()) ||
                attempt.certificationSlug === selectedCert.slug ||
                attempt.certificationName === selectedCert.nom
              )))
        : (stats.history || []);

    const getNiveauBadgeStyle = (niveau: string) => {
        switch (niveau?.toUpperCase()) {
            case 'DEBUTANT': return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
            case 'INTERMEDIAIRE': return 'bg-amber-50 text-amber-700 border-amber-200/80';
            case 'AVANCE':
            case 'EXPERT': return 'bg-rose-50 text-rose-700 border-rose-200/80';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStepMetadata = (stepText: string) => {
        const text = stepText.toLowerCase();
        if (text.includes("fiche") || text.includes("pdf") || text.includes("support")) {
            return {
                title: "Fiches de Révision",
                desc: "Consultez les résumés et fiches mémo condensées pour fixer vos connaissances clés.",
                icon: FileText,
                ctaLabel: "Consulter les fiches",
                ctaHref: "/dashboard/downloads",
                color: "text-emerald-600 bg-emerald-50 border-emerald-100",
                btnColor: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
                estTime: "45 min"
            };
        }
        if (text.includes("cours") || text.includes("vidéo") || text.includes("module") || text.includes("révisez")) {
            return {
                title: "Révision de Cours",
                desc: "Revisitez les modules officiels et les concepts fondamentaux pour combler vos lacunes.",
                icon: BookOpen,
                ctaLabel: "Ouvrir les cours",
                ctaHref: "/dashboard/downloads",
                color: "text-blue-600 bg-blue-50 border-blue-100",
                btnColor: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
                estTime: "2h00"
            };
        }
        return {
            title: "Simulation Chrono",
            desc: "Mettez-vous en situation réelle pour tester vos réflexes et valider vos progrès.",
            icon: Play,
            ctaLabel: "Lancer l'entraînement",
            ctaHref: `/dashboard/practice${selectedCert?.slug ? `?cert=${selectedCert.slug}` : ''}`,
            color: "text-purple-600 bg-purple-50 border-purple-100",
            btnColor: "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20",
            estTime: "1h15"
        };
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500 gap-3">
                <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement de votre analyse IA...</p>
            </div>
        );
    }

    if (viewMode === 'FORMATEUR') {
        const trainerModulesCount = certs.reduce((acc, c) => acc + (c.modules?.length || 0), 0);
        const mySessions = myAppointments.filter(rdv => rdv.formateur.id.toString() === me?.id?.toString() && rdv.statut === 'CONFIRME');

        return (
            <div className="space-y-8 text-slate-950 text-left font-sans pb-10">
                {/* Message de bienvenue simple */}
                <h2 className="text-xl md:text-2xl font-black text-slate-955 tracking-tight">
                    Bienvenue dans votre espace formateur
                </h2>

                {/* GRILLE STATISTIQUES FORMATEUR (DESIGN PREMIUM) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* STAT CARD 1: COURS CRÉÉS */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="text-2xl font-black text-slate-900 block leading-tight">{trainerModulesCount}</span>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Cours / Modules créés</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                            <BookMarked className="w-6 h-6" />
                        </div>
                    </div>

                    {/* STAT CARD 2: SÉANCES DE COACHING */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="text-2xl font-black text-slate-900 block leading-tight">{mySessions.length}</span>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Séances de coaching confirmées</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                            <CalendarCheck className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* CORPS PRINCIPAL DE L'ESPACE FORMATEUR */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    
                    {/* COLONNE DE GAUCHE (8 COLS) */}
                    <div className="lg:col-span-8 flex flex-col justify-between">
                        {trainerModulesCount === 0 ? (
                            /* CTA CRÉER PREMIER COURS */
                            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs flex-1 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <div className="space-y-2 max-w-md">
                                    <h3 className="text-lg font-black text-slate-955">Créez votre premier module de cours</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Proposez des chapitres de révision, des fiches méthodologiques et des quiz pour accompagner vos élèves vers la réussite de leurs examens.
                                    </p>
                                </div>
                                <Link
                                    href="/dashboard/courses"
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                                >
                                    Créer un cours maintenant
                                </Link>
                            </div>
                        ) : (
                            /* LISTE DES MODULES CRÉÉS */
                            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs flex-1 space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div className="space-y-0.5">
                                        <h3 className="text-base font-black text-slate-955 tracking-tight">Vos Modules de Formation</h3>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Synthèse des contenus pédagogiques publiés</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {certs
                                        .filter(c => c.modules && c.modules.length > 0)
                                        .map(c => (
                                            <div key={c.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-[8px] rounded-full uppercase tracking-wider border border-blue-100">
                                                        {c.codeExamen || 'CERT'}
                                                    </span>
                                                    <span className="text-[10px] font-extrabold text-slate-800 truncate">{c.nom}</span>
                                                </div>
                                                <div className="space-y-1.5 pl-1 border-l-2 border-slate-200">
                                                    {(c.modules || []).slice(0, 3).map((m: any) => (
                                                        <div key={m.id} className="text-xs font-bold text-slate-650 flex items-center justify-between gap-2">
                                                            <span className="truncate">• {m.titre}</span>
                                                            <span className="text-[9px] text-slate-400 shrink-0">{m.dureeEstimee}m</span>
                                                        </div>
                                                    ))}
                                                    {(c.modules || []).length > 3 && (
                                                        <span className="text-[10px] text-blue-600 font-extrabold block pt-1">
                                                            + {(c.modules || []).length - 3} autres modules...
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLONNE DE DROITE : PROCHAINES SESSIONS & ACTIONS RAPIDES (4 COLS) */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* COMPAGNON ACTIONS RAPIDES */}
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                            <h3 className="text-sm font-black text-slate-955 border-b border-slate-100 pb-3 flex items-center gap-2">
                                <ListChecks className="w-4 h-4 text-blue-600" />
                                <span>Actions rapides</span>
                            </h3>
                            <div className="space-y-2">
                                <Link
                                    href="/dashboard/appointments"
                                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-100 rounded-2xl text-left group transition-all"
                                >
                                    <div>
                                        <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors block">Créer un créneau libre</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Ajouter mes dispo de coaching</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                                </Link>

                                <Link
                                    href="/dashboard/courses"
                                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-100 rounded-2xl text-left group transition-all"
                                >
                                    <div>
                                        <span className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors block">Ajouter un module de cours</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Publier de nouvelles fiches</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                                </Link>

                                <Link
                                    href="/dashboard/community"
                                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-100 rounded-2xl text-left group transition-all"
                                >
                                    <div>
                                        <span className="text-xs font-black text-slate-900 group-hover:text-emerald-600 transition-colors block">Échanger avec les élèves</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Participer au forum d'entraide</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                                </Link>
                            </div>
                        </div>

                        {/* PROCHAINES SESSIONS DU FORMATEUR */}
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                            <h3 className="text-sm font-black text-slate-955 border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                <span>Prochaines Sessions</span>
                            </h3>

                            {myAppointments.filter(rdv => rdv.formateur.id.toString() === me?.id?.toString() && rdv.statut === 'CONFIRME').length === 0 ? (
                                <p className="text-xs text-slate-400 font-bold italic py-4">Aucune session réservée pour aujourd'hui.</p>
                            ) : (
                                <div className="space-y-3">
                                    {myAppointments
                                        .filter(rdv => rdv.formateur.id.toString() === me?.id?.toString() && rdv.statut === 'CONFIRME')
                                        .slice(0, 3)
                                        .map((rdv) => (
                                            <div key={rdv.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-1">
                                                <span className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded w-fit block">
                                                    {rdv.type.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-xs font-bold text-slate-800 block">
                                                    {rdv.candidat.prenom} {rdv.candidat.nom}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-semibold block">
                                                    {new Date(rdv.creneau.dateDebut).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} à {new Date(rdv.creneau.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 text-slate-900 text-left font-sans selection:bg-blue-600 selection:text-white pb-10">

            {/* BARRE D'EN-TÊTE ACTION & SÉLECTEUR DE CERTIFICATION D'EXAMEN */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                        Analyse Personnalisée de l&apos;Examen
                    </h1>
                    <p className="text-xs font-bold text-slate-500">
                        Examen blanc évalué : <span className="text-slate-900 font-extrabold">{selectedCert?.nom || (targetedCerts.length === 0 ? 'Aucune certification visée' : 'Microsoft Azure Fundamentals (AZ-900)')}</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {/* Sélecteur de certification filtré selon les objectifs visés */}
                    {targetedCerts.length > 0 ? (
                        <select
                            value={selectedCert?.id || ''}
                            onChange={(e) => {
                                const found = targetedCerts.find(c => c.id.toString() === e.target.value);
                                if (found) handleSelectCert(found);
                            }}
                            className="bg-white border border-slate-200 text-slate-800 font-extrabold rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
                        >
                            {targetedCerts.map(c => {
                                const label = c.codeExamen && !c.nom.toLowerCase().startsWith(c.codeExamen.toLowerCase())
                                    ? `${c.codeExamen} - ${c.nom}`
                                    : c.nom;
                                const truncated = label.length > 38 ? `${label.substring(0, 35)}...` : label;
                                return (
                                    <option key={c.id} value={c.id.toString()}>{truncated}</option>
                                );
                            })}
                        </select>
                    ) : (
                        <Link 
                            href="/dashboard/certifications"
                            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold rounded-xl text-xs transition-all border border-blue-200/80 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                            <Target className="w-3.5 h-3.5 text-blue-600" />
                            <span>Ajouter un objectif visé</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* GRILLE 1 : SCORE CIRCULAIRE (GAUCHE) & ANALYSE IA (DROITE) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                {/* GAUCHE : SCORE FINAL DONUT GAUGE OU INVITATION À VISER UNE CERTIF */}
                <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-7 flex flex-col items-center justify-between text-center shadow-2xs relative overflow-hidden">
                    {!selectedCert ? (
                        <div className="my-auto space-y-4 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="font-black text-slate-950 text-sm leading-snug">
                                    Veuillez viser un certificat pour obtenir votre readiness score
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Sélectionnez une certification cible dans le catalogue pour démarrer l&apos;analyse.
                                </p>
                            </div>
                            <Link
                                href="/dashboard/certifications"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                                <Target className="w-3.5 h-3.5 text-white" />
                                <span>Choisir une certif</span>
                            </Link>
                        </div>
                    ) : (readinessData?.totalTentatives || 0) === 0 ? (
                        <div className="my-auto space-y-4 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="font-black text-slate-950 text-sm leading-snug">
                                    Veuillez passer une simulation pour obtenir votre readiness score
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Effectuez votre premier examen blanc sur {selectedCert.nom} pour lancer l&apos;analyse de l&apos;IA.
                                </p>
                            </div>
                            <Link
                                href={`/dashboard/practice?cert=${selectedCert.slug}`}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                                <Target className="w-3.5 h-3.5 text-white" />
                                <span>S&apos;entraîner</span>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="w-full space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Score & Éligibilité Officielles</span>
                            </div>

                            {/* GAUGES CIRCULAIRE BLEUE PRO */}
                            <div className="relative w-44 h-44 my-4 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle 
                                        cx="88" 
                                        cy="88" 
                                        r="70" 
                                        className="stroke-slate-100 fill-none" 
                                        strokeWidth="12" 
                                    />
                                    <motion.circle
                                        cx="88"
                                        cy="88"
                                        r="70"
                                        className={`fill-none ${isReady ? 'stroke-emerald-500' : isAlmostReady ? 'stroke-amber-500' : 'stroke-blue-600'}`}
                                        strokeWidth="12"
                                        strokeDasharray={2 * Math.PI * 70}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - readinessScore / 100) }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        strokeLinecap="round"
                                    />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl font-black text-slate-950 tracking-tight">{readinessScore}%</span>
                                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mt-0.5">Readiness Score</span>
                                </div>
                            </div>

                            <div className="w-full space-y-3">
                                <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold ${
                                    isReady ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' :
                                    isAlmostReady ? 'bg-amber-50 border border-amber-200 text-amber-700' :
                                    'bg-rose-50 border border-rose-200 text-rose-700'
                                }`}>
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{isReady ? "Prêt pour l'examen" : isAlmostReady ? "Presque Prêt" : "À renforcer"}</span>
                                </div>
                                <p className="text-xs font-extrabold text-slate-400">
                                    Seuil de réussite conseillé : <span className="text-slate-700 font-black">80%</span>
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* DROITE : ANALYSE DE L'IA (8 COLS) SANS LOGO ET SANS TUTOR */}
                <div className="lg:col-span-8 bg-white border border-slate-200/90 border-l-4 border-l-blue-600 rounded-3xl p-7 text-left space-y-6 shadow-2xs flex flex-col justify-between">
                    
                    {/* Titre sans logo ni tutor */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-slate-950 tracking-tight">
                            Analyse de l&apos;IA
                        </h2>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {selectedCert ? `${readinessData?.totalTentatives || 0} tentative(s) analysée(s)` : 'En attente d\'objectif'}
                        </span>
                    </div>

                    {!selectedCert ? (
                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-3 my-auto">
                            <p className="text-xs font-bold text-slate-700 max-w-md mx-auto">
                                Veuillez viser un certificat pour obtenir des recommandations de l&apos;intelligence artificielle
                            </p>
                            <Link
                                href="/dashboard/certifications"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                            >
                                <Target className="w-3.5 h-3.5 text-white" />
                                <span>Voir le catalogue des certifications</span>
                            </Link>
                        </div>
                    ) : (readinessData?.totalTentatives || 0) === 0 ? (
                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-3 my-auto">
                            <p className="text-xs font-bold text-slate-700 max-w-md mx-auto">
                                Veuillez passer une simulation afin d&apos;obtenir des recommandations de l&apos;intelligence artificielle
                            </p>
                            <Link
                                href={`/dashboard/practice?cert=${selectedCert.slug || selectedCert.id}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                            >
                                <Play className="w-3 h-3 fill-white text-white" />
                                <span>Lancer un premier entraînement</span>
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Grille 2 Colonnes : Points Forts vs Lacunes Dynamiques */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                                
                                {/* Points Forts (Vert) */}
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                                        Points Forts
                                    </span>
                                    <ul className="space-y-2 text-xs font-bold text-slate-800">
                                        {(readinessData?.pointsForts && readinessData.pointsForts.length > 0) ? (
                                            readinessData.pointsForts.map((pf: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                                    <span>{pf}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-xs text-slate-400 font-semibold italic">Analyse des points forts en cours...</li>
                                        )}
                                    </ul>
                                </div>

                                {/* Lacunes Identifiées (Rouge) */}
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                                        Lacunes Identifiées
                                    </span>
                                    <ul className="space-y-2 text-xs font-bold text-slate-800">
                                        {(readinessData?.lacunes && readinessData.lacunes.length > 0) ? (
                                            readinessData.lacunes.map((lac: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                                                    <span>{lac}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-xs text-slate-400 font-semibold italic">Aucune lacune critique détectée !</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Encart Conseil IA Dynamique issu du Backend */}
                            <div className="bg-blue-50/70 border border-blue-100/90 rounded-2xl p-4 text-xs font-semibold text-blue-950 leading-relaxed italic text-left">
                                &ldquo;{readinessData?.conseil || `${firstName}, vous avez de très bonnes bases.`}&rdquo;
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* GRILLE 2 : PLAN DE RÉVISION PERSONNALISÉ (TIMELINE HORIZONTALE INTERACTIVE AVEC POPUPS FLOTTANTS) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xs text-left relative p-6 sm:p-7 z-10">
                
                {/* En-tête de Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-black text-slate-950 tracking-tight">
                            Plan de Révision Personnalisé
                        </h2>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            Recommandations d&apos;apprentissage générées par l&apos;IA d&apos;après vos derniers résultats
                        </p>
                    </div>
                    <span className="text-xs font-extrabold text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-center">
                        Estimé : <strong className="text-slate-900">4h de travail</strong>
                    </span>
                </div>

                {/* Timeline horizontale interactive */}
                <div className="py-8 px-4 relative flex flex-col items-center justify-center bg-slate-50/[0.01]">
                    <div className="w-full max-w-xl relative py-6">
                        {/* Ligne horizontale de connexion arrière-plan */}
                        <div className="absolute left-6 right-6 top-[44px] h-1 bg-slate-100 rounded-full z-0" />
                        
                        {/* Ligne horizontale active */}
                        <div 
                            className="absolute left-6 top-[44px] h-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500 ease-out z-0" 
                            style={{ 
                                width: activeStep !== null 
                                    ? `calc(${(activeStep / (((readinessData?.planRevision || [1, 2, 3]).length) - 1)) * 100}% - 12px)`
                                    : '0%' 
                            }}
                        />
                        
                        <div className="relative flex justify-between items-center z-10 w-full">
                            {(() => {
                                const steps = readinessData?.planRevision || [
                                    "Révisez le Module 4 : Gestion des Coûts & Tarification Cloud.",
                                    "Consultez les fiches mémo et supports PDF de révision rapide.",
                                    "Effectuez une simulation ciblée de 20 questions chrono pour valider vos acquis."
                                ];

                                return steps.map((stepText: string, idx: number) => {
                                    const isActive = activeStep === idx;
                                    const metadata = getStepMetadata(stepText);
                                    const StepIcon = metadata.icon;

                                    return (
                                        <div key={idx} className="flex flex-col items-center relative">
                                            {/* Bulle numérique interactive */}
                                            <button
                                                onClick={() => setActiveStep(activeStep === idx ? null : idx)}
                                                className={`step-btn w-14 h-14 rounded-full border-4 font-black text-base flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md cursor-pointer relative z-30 ${
                                                    isActive
                                                        ? 'border-blue-600 bg-blue-600 text-white ring-8 ring-blue-50'
                                                        : 'border-white bg-slate-50 text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-white hover:shadow-lg'
                                                }`}
                                                title={`Étape ${idx + 1} - Cliquer pour les détails`}
                                            >
                                                {idx + 1}
                                            </button>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 bg-white px-2 py-0.5 rounded-md border border-slate-200/50 shadow-3xs relative z-30">
                                                Étape 0{idx + 1}
                                            </span>

                                            {/* Popover flottant absolu s'affichant au-dessus du numéro sans décaler la page */}
                                            {isActive && (
                                                <div 
                                                    className="tooltip-card absolute bottom-[85px] left-1/2 -translate-x-1/2 w-[280px] sm:w-[320px] bg-white border border-slate-200/90 rounded-3xl shadow-xl p-5 z-40 text-left animate-fadeIn"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {/* Triangle indicateur vers le bas */}
                                                    <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-200/90 rotate-45 z-10" />
                                                    
                                                    {/* Bouton de fermeture croix */}
                                                    <button
                                                        onClick={() => setActiveStep(null)}
                                                        className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer z-50"
                                                        title="Fermer"
                                                    >
                                                        <X className="w-4 h-4 cursor-pointer pointer-events-none" />
                                                    </button>

                                                    <div className="space-y-3 relative z-20">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${metadata.color}`}>
                                                                <StepIcon className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block">Étape {idx + 1} sur {steps.length}</span>
                                                                <h3 className="text-xs font-black text-slate-950 leading-tight">{metadata.title}</h3>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                                                            <p className="text-xs text-slate-950 font-extrabold leading-normal">
                                                                {stepText}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                                                                {metadata.desc}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                                                            <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500">
                                                                <span>Estimation : <strong className="text-slate-900">{metadata.estTime}</strong></span>
                                                            </div>
                                                            <div className="flex items-center gap-2 w-full">
                                                                <button
                                                                    onClick={() => setActiveStep(null)}
                                                                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-lg cursor-pointer text-[10px] text-center"
                                                                >
                                                                    Fermer
                                                                </button>
                                                                <Link
                                                                    href={metadata.ctaHref}
                                                                    onClick={() => setActiveStep(null)}
                                                                    className={`flex-1 py-1.5 text-white font-extrabold rounded-lg cursor-pointer text-[10px] text-center shadow-xs ${metadata.btnColor}`}
                                                                >
                                                                    {metadata.ctaLabel}
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* GRILLE 3 : DEUX CARTES DU BAS (BESOIN D'AIDE RDV & STUDY GROUP) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CARTE 1 : BESOIN D'AIDE ? (RDV EXPERT) */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xs hover:shadow-md transition-shadow text-left">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="font-black text-slate-950 text-base">Besoin d&apos;aide ?</h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Réservez une session de 15 min avec un expert certifié.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/dashboard/appointments"
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0 text-center"
                    >
                        Prendre RDV
                    </Link>
                </div>

                {/* CARTE 2 : STUDY GROUP (COMMUNAUTÉ) */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xs hover:shadow-md transition-shadow text-left">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="font-black text-slate-950 text-base">Study Group</h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Rejoignez 4 autres élèves qui préparent le même examen.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/dashboard/community"
                        className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl transition-all cursor-pointer shrink-0 text-center"
                    >
                        Rejoindre
                    </Link>
                </div>
            </div>

            {/* GRILLE DERN IÈRES TENTATIVES D'EXAMENS BLANCS (RÉSEAU DE TENTATIVES RÉELLES DU BACKEND) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-5 text-left">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black text-slate-950 tracking-tight">
                            Dernières Tentatives d&apos;Examens Blancs
                        </h2>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {selectedCert
                            ? `Historique des simulations pour ${selectedCert.codeExamen || selectedCert.nom}`
                            : "Veuillez viser un certificat pour consulter vos tentatives"
                        }
                        </p>
                    </div>

                    <span className="text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl shrink-0">
                        {selectedCert ? filteredHistory.length : 0} tentative(s) enregistrée(s)
                    </span>
                </div>

                {selectedCert && filteredHistory && filteredHistory.length > 0 ? (
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                        {filteredHistory.slice(0, 5).map((attempt: any, idx: number) => {
                            const isPassed = attempt.score >= 80;
                            const isWarning = attempt.score >= 65 && attempt.score < 80;

                            return (
                                <div key={attempt.id || idx} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                                            isPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                            isWarning ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                            'bg-rose-50 text-rose-700 border border-rose-200'
                                        }`}>
                                            {attempt.score}%
                                        </div>

                                        <div className="space-y-0.5">
                                            <h3 className="font-extrabold text-slate-950 text-sm">
                                                {attempt.certificationName || selectedCert?.nom || 'Simulation d\'Examen Blanc'}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{new Date(attempt.datePassage).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${
                                            isPassed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            isWarning ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                            {isPassed ? 'RÉUSSI' : isWarning ? 'À PEAUFINER' : 'À RENFORCER'}
                                        </span>

                                        <Link
                                            href={`/dashboard/practice${(attempt.certificationSlug || selectedCert?.slug) ? `?cert=${attempt.certificationSlug || selectedCert?.slug}` : ''}`}
                                            className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                                        >
                                            <Play className="w-3 h-3 fill-white text-white" />
                                            <span>Refaire</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-slate-50/80 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                            {selectedCert ? (
                                <Play className="w-6 h-6 fill-blue-600 text-blue-600" />
                            ) : (
                                <Target className="w-6 h-6 text-blue-600" />
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-extrabold text-slate-950 text-sm">
                                {selectedCert 
                                    ? `Aucune tentative effectuée pour ${selectedCert.codeExamen || selectedCert.nom}`
                                    : "Veuillez viser un certificat pour consulter vos tentatives"
                                }
                            </h3>
                            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                                {selectedCert
                                    ? "Lancez votre premier examen blanc sur ce simulateur interactif pour générer votre analyse d'éligibilité."
                                    : "Sélectionnez votre première certification cible dans le catalogue pour effectuer vos simulations et consulter votre historique."
                                }
                            </p>
                        </div>
                        <Link
                            href={selectedCert ? `/dashboard/practice?cert=${selectedCert.slug}` : "/dashboard/certifications"}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                        >
                            {selectedCert ? (
                                <>
                                    <Play className="w-3.5 h-3.5 fill-white text-white" />
                                    <span>Lancer un Examen Blanc</span>
                                </>
                            ) : (
                                <>
                                    <BookOpen className="w-3.5 h-3.5 text-white" />
                                    <span>Accéder au Catalogue</span>
                                </>
                            )}
                        </Link>
                    </div>
                )}
            </div>

            {/* GRILLE 4 : VOS EXAMENS ET CERTIFICATIONS VISÉS PAR L'APPRENANT */}
            <div className="space-y-4 pt-4 text-left">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-950 tracking-tight">
                            Vos Examens & Certifications Visés {targetedCerts.length > 0 ? `(${targetedCerts.length})` : ''}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Vos objectifs de préparation actifs. Ajoutez d&apos;autres certifications depuis le catalogue.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/certifications"
                        className="text-xs font-extrabold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                        <span>Gérer mes objectifs ({certs.length} disponibles)</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {targetedCerts.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {targetedCerts.map((cert: any, idx: number) => {
                            const badgeLogo = getCertificateBadgeLogo(cert);

                            return (
                                <div 
                                    key={cert.id || idx} 
                                    className="bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-xl rounded-3xl p-6 sm:p-7 flex flex-col justify-between group transition-all duration-300 text-left space-y-5"
                                >
                                    {/* PARTIE SUPÉRIEURE : EN-TÊTE STYLE UDEMY */}
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Côté Gauche : Badges, Titre & Description */}
                                        <div className="space-y-3 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-extrabold text-slate-900 text-[10px] uppercase tracking-wider px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg">
                                                    {cert.fournisseur?.nom || 'Éditeur'}
                                                </span>
                                                {cert.codeExamen && (
                                                    <span className="font-black text-blue-600 text-[10px] uppercase tracking-wider px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg">
                                                        {cert.codeExamen}
                                                    </span>
                                                )}
                                                <span className={`text-[9px] px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-wider border ${getNiveauBadgeStyle(cert.niveau)}`}>
                                                    {cert.niveau || 'DEBUTANT'}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="font-extrabold text-slate-950 text-lg leading-snug group-hover:text-blue-600 transition-colors">
                                                    {cert.nom}
                                                </h3>
                                                <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1.5 leading-relaxed">
                                                    {cert.description || 'Préparez-vous à l\'examen officiel sur nos simulateurs interactifs.'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-1">
                                                <span className="flex items-center gap-1.5 text-slate-600">
                                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>Candidats en préparation</span>
                                                </span>
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{cert.dureeIndicative || '15h indicatives'}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Côté Droit : Écusson/Badge Officiel Flottant du Certificat */}
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0 p-1">
                                            {badgeLogo ? (
                                                <img
                                                    src={badgeLogo}
                                                    alt={cert.nom}
                                                    className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                                                />
                                            ) : (
                                                <Award className="w-12 h-12 text-slate-300" />
                                            )}
                                        </div>
                                    </div>

                                    {/* BAS DE CARTE : ACTIONS & CTAS DISCRETS AVEC NOUVELLE PALETTE BLEUE */}
                                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-3 text-xs">
                                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Examen Blanc & Quiz inclus</span>
                                        </span>

                                        <Link 
                                            href={`/dashboard/practice?cert=${cert.slug || cert.id}`}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-md"
                                        >
                                            <Play className="w-3 h-3 fill-white text-white" />
                                            <span>S&apos;entraîner</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-slate-50/80 border border-dashed border-slate-200/90 rounded-3xl p-10 text-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                            <Target className="w-7 h-7 text-blue-600" />
                        </div>
                        <div className="space-y-1.5 max-w-md mx-auto">
                            <h3 className="font-extrabold text-slate-950 text-base">Aucune certification visée</h3>
                            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                                Vous n&apos;avez pas encore sélectionné de certification à préparer. Parcourez notre catalogue et ajoutez vos certifications cibles pour débloquer votre analyse d&apos;éligibilité.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/certifications"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                        >
                            <BookOpen className="w-4 h-4 text-white" />
                            <span>Accéder au Catalogue des Certifications</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}