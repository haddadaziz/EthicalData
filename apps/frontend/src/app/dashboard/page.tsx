"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { 
    Play, 
    Calendar,
    CalendarCheck, 
    BookMarked,
    Users, 
    AlertTriangle, 
    Clock, 
    ChevronRight,
    ChevronDown,
    Award,
    Target,
    BookOpen,
    X,
    FileText
} from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCertificateBadgeLogo } from '@/lib/certification-utils';
import RecentActivity from '@/components/dashboard/RecentActivity';
import CertDetailModal from '@/components/dashboard/CertDetailModal';
import QuickActions from '@/components/dashboard/QuickActions';

export default function StudentDashboard() {
    const router = useRouter();
    const [certs, setCerts] = useState<any[]>([]);
    const [targetCertIds, setTargetCertIds] = useState<string[]>([]);
    const [stats, setStats] = useState<any>({ totalAttempts: 0, averageScore: 0, readinessScore: 0, readinessLabel: 'NON_PRET' });
    const [readinessData, setReadinessData] = useState<any>(null);
    const [selectedCert, setSelectedCert] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('Étudiant');
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const [certDropdownOpen, setCertDropdownOpen] = useState(false);
    const [selectedCertModal, setSelectedCertModal] = useState<any>(null);

    const [formateurCourses, setFormateurCourses] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'APPRENANT' | 'FORMATEUR'>(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('viewMode');
            if (savedMode === 'APPRENANT' || savedMode === 'FORMATEUR') return savedMode;
        }
        return 'APPRENANT';
    });
    const [myAppointments, setMyAppointments] = useState<any[]>([]);
    const [me, setMe] = useState<any>(null);
    const [enrolledCerts, setEnrolledCerts] = useState<any[]>([]);

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
        apiFetch('/users/me/profile').then((profile) => {
            if (profile) {
                setFirstName(profile.prenom || profile.email?.split('@')[0] || 'Candidat');
            }
        }).catch(() => {});

        const loadDashboardData = async () => {
            try {
                const [certsData, statsData, profileData, appointmentsData, coursesData, enrollmentsData] = await Promise.all([
                    apiFetch('/certifications').catch(() => []),
                    apiFetch('/simulations/me/stats').catch(() => null),
                    apiFetch('/users/me/profile').catch(() => null),
                    apiFetch('/appointments/mes-rdv').catch(() => []),
                    apiFetch('/cours/mes-cours').catch(() => []),
                    apiFetch('/certifications/mes-inscriptions').catch(() => []),
                ]);
                const enrolled = Array.isArray(enrollmentsData) ? enrollmentsData : [];
                setEnrolledCerts(enrolled);
                setFormateurCourses(Array.isArray(coursesData) ? coursesData : []);
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
                    for (let attempt = 0; attempt < 3; attempt++) {
                        try {
                            const readData = await apiFetch(`/simulations/certifications/${firstCert.id}/readiness`);
                            setReadinessData(readData);
                            break;
                        } catch (e) {
                            if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                            else console.error(e);
                        }
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
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const readData = await apiFetch(`/simulations/certifications/${cert.id}/readiness`);
                setReadinessData(readData);
                return;
            } catch (e) {
                if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                else console.error(e);
            }
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
                estTime: 45
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
                estTime: 120
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
            estTime: 75
        };
    };

    const getTotalEstTime = (steps: string[]) => {
        let total = 0;
        for (const s of steps) {
            const meta = getStepMetadata(s);
            total += meta.estTime;
        }
        if (total < 60) return `${total} min`;
        const h = Math.floor(total / 60);
        const m = total % 60;
        if (m === 0) return `${h}h`;
        if (m <= 30) return `${h}h30`;
        return `${h}h${m}`;
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
        const trainerTotalCourses = formateurCourses.length;
        const hasPublishedCourses = formateurCourses.some(c => c.statut === 'PUBLIE');
        const mySessions = myAppointments.filter(rdv => rdv.formateur.id.toString() === me?.id?.toString() && rdv.statut === 'CONFIRME');

        return (
            <div className="space-y-8 text-slate-300 text-left font-sans pb-10">
                {/* Message de bienvenue simple */}
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    Bienvenue dans votre espace formateur
                </h2>

                {/* GRILLE STATISTIQUES FORMATEUR (DESIGN PREMIUM) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* STAT CARD 1: COURS CRÉÉS */}
                    <div className="bg-[#080d1a]/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between gap-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="space-y-1 relative z-10">
                            <span className="text-2xl font-black text-white block leading-tight">{trainerTotalCourses}</span>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Cours créés</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-red-950/30 border border-red-900/30 flex items-center justify-center text-red-500 relative z-10 shadow-[0_0_15px_rgba(220,38,38,0.15)]">
                            <BookMarked className="w-6 h-6" />
                        </div>
                    </div>

                    {/* STAT CARD 2: SÉANCES DE COACHING */}
                    <div className="bg-[#080d1a]/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between gap-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="space-y-1 relative z-10">
                            <span className="text-2xl font-black text-white block leading-tight">{mySessions.length}</span>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Séances confirmées</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-red-950/30 border border-red-900/30 flex items-center justify-center text-red-500 relative z-10 shadow-[0_0_15px_rgba(220,38,38,0.15)]">
                            <CalendarCheck className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* CORPS PRINCIPAL DE L'ESPACE FORMATEUR */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    
                    {/* COLONNE DE GAUCHE (8 COLS) */}
                    <div className="lg:col-span-8 flex flex-col justify-between">
                        {!hasPublishedCourses ? (
                            <div className="bg-[#080d1a]/90 border border-dashed border-slate-800 rounded-3xl p-8 shadow-xl flex-1 flex flex-col items-center justify-center text-center space-y-5">
                                <BookMarked className="w-12 h-12 text-slate-700" />
                                <div className="space-y-1.5 max-w-sm">
                                    <p className="text-sm font-black text-slate-300">Aucun cours publié</p>
                                    <p className="text-xs text-slate-500 font-medium">Créez et publiez votre premier cours pour le voir apparaître ici.</p>
                                </div>
                                <button
                                    onClick={() => router.push('/dashboard/courses')}
                                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-2xl transition-all cursor-pointer shadow-md shadow-red-600/20"
                                >
                                    Créer mon premier cours
                                </button>
                            </div>
                        ) : (
                            /* DERNIERS COURS PUBLIÉS */
                            <div className="bg-[#080d1a]/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex-1 space-y-6">
                                <Link
                                    href="/dashboard/courses"
                                    className="flex items-center justify-between border-b border-slate-800 pb-4 group"
                                >
                                    <div className="space-y-0.5">
                                        <h3 className="text-base font-black text-white tracking-tight">Derniers Cours Publiés</h3>
                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Vos deux dernières formations mises en ligne</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                                </Link>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {formateurCourses
                                        .filter(c => c.statut === 'PUBLIE')
                                        .slice(0, 2)
                                        .map(c => (
                                            <div key={c.id} className="p-4 bg-[#020617] border border-slate-800/80 rounded-2xl space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-red-950/20 text-red-500 font-extrabold text-[8px] rounded-full uppercase tracking-wider border border-red-900/30">
                                                        {c.certification?.codeExamen || 'COURS'}
                                                    </span>
                                                    <span className="text-[10px] font-extrabold text-white truncate">{c.titre}</span>
                                                </div>
                                                <div className="space-y-1.5 pl-1 border-l-2 border-slate-800">
                                                    {(c.modules || []).slice(0, 3).map((m: any) => (
                                                        <div key={m.id} className="text-xs font-bold text-slate-400 flex items-center justify-between gap-2">
                                                            <span className="truncate">• {m.titre}</span>
                                                            <span className="text-[9px] text-slate-500 shrink-0">{m.dureeEstimee}{m.dureeEstimee ? 'm' : ''}</span>
                                                        </div>
                                                    ))}
                                                    {(c.modules || []).length > 3 && (
                                                        <span className="text-[10px] text-red-500 font-extrabold block pt-1">
                                                            + {(c.modules || []).length - 3} autres modules...
                                                        </span>
                                                    )}
                                                    {(!c.modules || c.modules.length === 0) && (
                                                        <span className="text-[10px] text-slate-500 font-semibold italic">Aucun module pour l&apos;instant</span>
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
                        <QuickActions
                            onStartPractice={() => router.push('/dashboard/appointments')}
                            onBrowseCourses={() => router.push('/dashboard/courses')}
                            onGoToCommunity={() => router.push('/dashboard/community')}
                        />

                        {/* PROCHAINES SESSIONS DU FORMATEUR */}
                        <div className="bg-[#080d1a]/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                            <h3 className="text-sm font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-red-500" />
                                <span>Prochaines Sessions</span>
                            </h3>

                            {myAppointments.filter(rdv => rdv.formateur.id.toString() === me?.id?.toString() && rdv.statut === 'CONFIRME').length === 0 ? (
                                <p className="text-xs text-slate-500 font-bold italic py-4">Aucune session réservée pour aujourd'hui.</p>
                            ) : (
                                <div className="space-y-3">
                                    {myAppointments
                                        .filter(rdv => rdv.formateur.id.toString() === me?.id?.toString() && rdv.statut === 'CONFIRME')
                                        .slice(0, 3)
                                        .map((rdv) => (
                                            <div key={rdv.id} className="p-3 bg-[#020617] border border-slate-800/80 rounded-2xl text-left space-y-1">
                                                <span className="text-[9px] font-black text-red-500 uppercase bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded w-fit block">
                                                    {rdv.type.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-xs font-bold text-white block">
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
        <div className="space-y-8 text-slate-300 text-left font-sans selection:bg-red-600 selection:text-white pb-10">

            {/* BARRE D'EN-TÊTE ACTION & SÉLECTEUR DE CERTIFICATION D'EXAMEN */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Analyse Personnalisée de l&apos;Examen
                    </h1>
                    <p className="text-xs font-bold text-slate-400">
                        Examen blanc évalué : <span className="text-white font-extrabold">{selectedCert?.nom || (targetedCerts.length === 0 ? 'Aucune certification visée' : 'Microsoft Azure Fundamentals (AZ-900)')}</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
                    {/* Sélecteur de certification filtré selon les objectifs visés */}
                    {targetedCerts.length > 0 ? (
                        <div className="relative w-full sm:w-auto sm:shrink-0">
                            <button
                                type="button"
                                onClick={() => setCertDropdownOpen(!certDropdownOpen)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#080d1a] border border-slate-800 focus:border-red-600 rounded-2xl text-white text-xs font-bold outline-none cursor-pointer hover:bg-slate-800/50 transition-all sm:min-w-[220px]"
                            >
                                {selectedCert && getCertificateBadgeLogo(selectedCert) && (
                                    <img src={getCertificateBadgeLogo(selectedCert)} alt="" className="w-5 h-5 object-contain rounded shrink-0" />
                                )}
                                <span className="flex-1 text-left truncate">
                                    {selectedCert 
                                        ? (selectedCert.codeExamen && !selectedCert.nom.toLowerCase().startsWith(selectedCert.codeExamen.toLowerCase())
                                            ? `${selectedCert.codeExamen} - ${selectedCert.nom}`
                                            : selectedCert.nom)
                                        : 'Sélectionner une certification'
                                    }
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${certDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {certDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setCertDropdownOpen(false)} />
                                    <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 z-50 w-full sm:w-72 bg-[#080d1a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                                        <div className="max-h-64 overflow-y-auto">
                                            {targetedCerts.map(c => {
                                                const logo = getCertificateBadgeLogo(c);
                                                const label = c.codeExamen && !c.nom.toLowerCase().startsWith(c.codeExamen.toLowerCase())
                                                    ? `${c.codeExamen} - ${c.nom}`
                                                    : c.nom;
                                                return (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => { handleSelectCert(c); setCertDropdownOpen(false); }}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-800/50 cursor-pointer ${
                                                            selectedCert?.id === c.id ? 'bg-slate-800/80 text-white' : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {logo ? (
                                                            <img src={logo} alt="" className="w-7 h-7 object-contain rounded shrink-0" />
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                                                <Award className="w-4 h-4 text-slate-500" />
                                                            </div>
                                                        )}
                                                        <span className="block truncate font-bold text-left flex-1">{label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link 
                            href="/dashboard/certifications"
                            className="px-3.5 py-2 bg-red-950/20 hover:bg-red-950/40 text-red-500 font-extrabold rounded-xl text-xs transition-all border border-red-900/50 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                            <Target className="w-3.5 h-3.5 text-red-500" />
                            <span>Ajouter un objectif visé</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* GRILLE 1 : SCORE CIRCULAIRE (GAUCHE) & ANALYSE IA (DROITE) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                {/* GAUCHE : SCORE FINAL DONUT GAUGE OU INVITATION À VISER UNE CERTIF */}
                <div className="lg:col-span-4 bg-[#080d1a]/90 border border-slate-800 rounded-3xl p-7 flex flex-col items-center justify-between text-center shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {!selectedCert ? (
                        <div className="my-auto space-y-4 flex flex-col items-center justify-center relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-amber-950/30 border border-amber-900/30 flex items-center justify-center text-amber-500 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="font-black text-white text-sm leading-snug">
                                    Veuillez viser un certificat pour obtenir votre readiness score
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">
                                    Sélectionnez une certification cible dans le catalogue pour démarrer l&apos;analyse.
                                </p>
                            </div>
                            <Link
                                href="/dashboard/certifications"
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                                <Target className="w-3.5 h-3.5 text-white" />
                                <span>Choisir une certif</span>
                            </Link>
                        </div>
                    ) : (readinessData?.totalTentatives || 0) === 0 ? (
                        <div className="my-auto space-y-4 flex flex-col items-center justify-center relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-amber-950/30 border border-amber-900/30 flex items-center justify-center text-amber-500 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="font-black text-white text-sm leading-snug">
                                    Veuillez passer une simulation pour obtenir votre readiness score
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">
                                    Effectuez votre premier examen blanc sur {selectedCert.nom} pour lancer l&apos;analyse de l&apos;IA.
                                </p>
                            </div>
                            <Link
                                href={`/dashboard/practice?cert=${selectedCert.slug}`}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                                <Target className="w-3.5 h-3.5 text-white" />
                                <span>S&apos;entraîner</span>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="w-full space-y-1 relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Score & Éligibilité Officielles</span>
                            </div>

                            {/* GAUGES CIRCULAIRE BLEUE PRO */}
                            <div className="relative w-44 h-44 my-4 flex items-center justify-center relative z-10">
                                <svg className="w-full h-full -rotate-90">
                                    <circle 
                                        cx="88" 
                                        cy="88" 
                                        r="70" 
                                        className="stroke-slate-800 fill-none" 
                                        strokeWidth="12" 
                                    />
                                    <motion.circle
                                        cx="88"
                                        cy="88"
                                        r="70"
                                        className={`fill-none ${isReady ? 'stroke-emerald-500' : isAlmostReady ? 'stroke-amber-500' : 'stroke-red-600'}`}
                                        strokeWidth="12"
                                        strokeDasharray={2 * Math.PI * 70}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - readinessScore / 100) }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        strokeLinecap="round"
                                    />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl font-black text-white tracking-tight">{readinessScore}%</span>
                                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mt-0.5">Readiness Score</span>
                                </div>
                            </div>

                            <div className="w-full space-y-3 relative z-10">
                                <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold ${
                                    isReady ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-500' :
                                    isAlmostReady ? 'bg-amber-950/30 border border-amber-900/50 text-amber-500' :
                                    'bg-red-950/30 border border-red-900/50 text-red-500'
                                }`}>
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{isReady ? "Prêt pour l'examen" : isAlmostReady ? "Presque Prêt" : "À renforcer"}</span>
                                </div>
                                <p className="text-xs font-extrabold text-slate-500">
                                    Seuil de réussite conseillé : <span className="text-white font-black">80%</span>
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* DROITE : ANALYSE DE L'IA (8 COLS) SANS LOGO ET SANS TUTOR */}
                <div className="lg:col-span-8 bg-[#080d1a]/90 border border-slate-800 border-l-4 border-l-red-600 rounded-3xl p-7 text-left space-y-6 shadow-xl flex flex-col justify-between">
                    
                    {/* Titre sans logo ni tutor */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-white tracking-tight">
                            Analyse de l&apos;IA
                        </h2>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                            {selectedCert ? `${readinessData?.totalTentatives || 0} tentative(s) analysée(s)` : 'En attente d\'objectif'}
                        </span>
                    </div>

                    {!selectedCert ? (
                        <div className="bg-[#020617] border border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-3 my-auto relative z-10">
                            <p className="text-xs font-bold text-slate-400 max-w-md mx-auto">
                                Veuillez viser un certificat pour obtenir des recommandations de l&apos;intelligence artificielle
                            </p>
                            <Link
                                href="/dashboard/certifications"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                            >
                                <Target className="w-3.5 h-3.5 text-white" />
                                <span>Voir le catalogue des certifications</span>
                            </Link>
                        </div>
                    ) : (readinessData?.totalTentatives || 0) === 0 ? (
                        <div className="bg-[#020617] border border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-3 my-auto relative z-10">
                            <p className="text-xs font-bold text-slate-400 max-w-md mx-auto">
                                Veuillez passer une simulation afin d&apos;obtenir des recommandations de l&apos;intelligence artificielle
                            </p>
                            <Link
                                href={`/dashboard/practice?cert=${selectedCert.slug || selectedCert.id}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
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
                                                <li key={i} className="flex items-start gap-2 text-white">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                                                    <span>{lac}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-xs text-slate-500 font-semibold italic">Aucune lacune critique détectée !</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Encart Conseil IA Dynamique issu du Backend */}
                            <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-4 text-xs font-semibold text-red-100 leading-relaxed italic text-left relative z-10">
                                &ldquo;{readinessData?.conseil || `${firstName}, vous avez de très bonnes bases.`}&rdquo;
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* GRILLE 2 : PLAN DE RÉVISION PERSONNALISÉ (TIMELINE HORIZONTALE INTERACTIVE AVEC POPUPS FLOTTANTS) */}
            <div className="bg-[#080d1a]/90 border border-slate-800 rounded-3xl shadow-xl text-left relative p-6 sm:p-7 z-10">
                
                {/* En-tête de Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <h2 className="text-lg font-black text-white tracking-tight">
                            Plan de Révision Personnalisé
                        </h2>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                            Recommandations d&apos;apprentissage générées par l&apos;IA d&apos;après vos derniers résultats
                        </p>
                    </div>
                    <span className="text-xs font-extrabold text-slate-400 bg-[#020617] border border-slate-800 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-center">
                        Estimé : <strong className="text-white">{getTotalEstTime(readinessData?.planRevision || ["Révisez le Module 4 : Gestion des Coûts & Tarification Cloud.", "Consultez les fiches mémo et supports PDF de révision rapide.", "Effectuez une simulation ciblée de 20 questions chrono pour valider vos acquis."])} de travail</strong>
                    </span>
                </div>

                {/* Timeline horizontale interactive */}
                <div className="py-8 px-4 relative flex flex-col items-center justify-center bg-[#020617]/[0.01]">
                    <div className="w-full max-w-xl relative py-6">
                        {/* Ligne horizontale de connexion arrière-plan */}
                        <div className="absolute left-6 right-6 top-[44px] h-1 bg-slate-800 rounded-full z-0" />
                        
                        {/* Ligne horizontale active */}
                        <div 
                            className="absolute left-6 top-[44px] h-1 bg-gradient-to-r from-red-600 to-red-900 rounded-full transition-all duration-500 ease-out z-0" 
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
                                                        ? 'border-red-600 bg-red-600 text-white ring-8 ring-red-950/50'
                                                        : 'border-[#020617] bg-slate-800 text-slate-400 hover:border-red-500 hover:text-red-500 hover:bg-[#080d1a] hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]'
                                                }`}
                                                title={`Étape ${idx + 1} - Cliquer pour les détails`}
                                            >
                                                {idx + 1}
                                            </button>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2 bg-[#080d1a] px-2 py-0.5 rounded-md border border-slate-800 shadow-3xs relative z-30">
                                                Étape 0{idx + 1}
                                            </span>

                                            {/* Popover flottant absolu s'affichant au-dessus du numéro sans décaler la page */}
                                            {isActive && (
                                                <div 
                                                    className="tooltip-card absolute bottom-[85px] left-1/2 -translate-x-1/2 w-[280px] sm:w-[320px] bg-[#080d1a] border border-slate-800 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-5 z-40 text-left animate-fadeIn"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {/* Triangle indicateur vers le bas */}
                                                    <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-[#080d1a] border-r border-b border-slate-800 rotate-45 z-10" />
                                                    
                                                    {/* Bouton de fermeture croix */}
                                                    <button
                                                        onClick={() => setActiveStep(null)}
                                                        className="absolute right-4 top-4 p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer z-50"
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
                                                                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block">Étape {idx + 1} sur {steps.length}</span>
                                                                <h3 className="text-xs font-black text-white leading-tight">{metadata.title}</h3>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="p-3 bg-[#020617] border border-slate-800 rounded-2xl space-y-1">
                                                            <p className="text-xs text-slate-300 font-extrabold leading-normal">
                                                                {stepText}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                                                                {metadata.desc}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                                                            <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500">
                                                                <span>Estimation : <strong className="text-white">{metadata.estTime}</strong></span>
                                                            </div>
                                                            <div className="flex items-center gap-2 w-full">
                                                                <button
                                                                    onClick={() => setActiveStep(null)}
                                                                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold rounded-lg cursor-pointer text-[10px] text-center"
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
                <div className="bg-[#080d1a]/90 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xl hover:shadow-[0_0_20px_rgba(220,38,38,0.1)] transition-shadow text-left group">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-blue-950/20 border border-blue-900/40 flex items-center justify-center text-blue-500 shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="font-black text-white text-base">Besoin d&apos;aide ?</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                Réservez une session de 15 min avec un expert certifié.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/dashboard/appointments"
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0 text-center"
                    >
                        Prendre RDV
                    </Link>
                </div>

                {/* CARTE 2 : STUDY GROUP (COMMUNAUTÉ) */}
                <div className="bg-[#080d1a]/90 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xl hover:shadow-[0_0_20px_rgba(220,38,38,0.1)] transition-shadow text-left group">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 flex items-center justify-center text-emerald-500 shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="font-black text-white text-base">Study Group</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                Rejoignez 4 autres élèves qui préparent le même examen.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/dashboard/community"
                        className="px-4 py-2.5 bg-[#020617] border border-slate-800 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shrink-0 text-center"
                    >
                        Rejoindre
                    </Link>
                </div>
            </div>

            <RecentActivity
                history={filteredHistory || []}
                certifications={selectedCert ? [selectedCert] : []}
                onCertClick={(cert: any) => router.push(`/dashboard/practice?cert=${cert.slug || cert.id}`)}
            />

            {/* GRILLE 4 : VOS EXAMENS ET CERTIFICATIONS VISÉS PAR L'APPRENANT */}
            <div className="space-y-4 pt-4 text-left">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">
                            Vos Examens & Certifications Visés {targetedCerts.length > 0 ? `(${targetedCerts.length})` : ''}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Vos objectifs de préparation actifs. Ajoutez d&apos;autres certifications depuis le catalogue.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/certifications"
                        className="text-xs font-extrabold text-red-500 hover:text-red-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                        <span>Gérer mes objectifs ({certs.length} disponibles)</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {targetedCerts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {targetedCerts.map((cert: any, idx: number) => {
                            const badgeLogo = getCertificateBadgeLogo(cert);

                            return (
                                <div 
                                    key={cert.id || idx} 
                                    className="bg-[#080d1a]/90 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:shadow-[0_0_20px_rgba(220,38,38,0.1)] hover:border-slate-700 text-left"
                                >
                                    {/* Visual Box (Landing Page Style) */}
                                    <div 
                                        onClick={() => setSelectedCertModal(cert)} 
                                        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xs transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md bg-[#020617] border border-slate-800 cursor-pointer shrink-0"
                                    >
                                        {/* Background Template */}
                                        <img src="/images/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0 opacity-50 mix-blend-screen" />

                                        {/* Examen code overlay */}
                                        {cert.codeExamen && (
                                            <div className="absolute top-3 left-3 z-30">
                                                <div className="bg-[#020617] text-white font-black uppercase text-[8px] tracking-widest px-2 py-0.5 rounded-md border border-slate-800 shadow-sm flex items-center group-hover:bg-red-600 group-hover:border-red-500 transition-colors">
                                                    {cert.codeExamen}
                                                </div>
                                            </div>
                                        )}

                                        {/* Floating Badge Logo */}
                                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                            <div className="w-20 h-20 flex items-center justify-center transition-transform duration-500 -translate-y-2 group-hover:-translate-y-3.5">
                                                {badgeLogo ? (
                                                    <img src={badgeLogo} alt={cert.nom} className="max-w-full max-h-full object-contain filter drop-shadow-xl" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-[#080d1a]/95 rounded-full flex items-center justify-center border border-slate-800 shadow-sm">
                                                        <Award className="w-6 h-6 text-slate-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Title & Info & Actions */}
                                    <div className="mt-4 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-1">
                                            <h3 
                                                onClick={() => setSelectedCertModal(cert)} 
                                                className="text-xs font-black text-white leading-snug line-clamp-2 cursor-pointer hover:text-red-500 transition-colors"
                                            >
                                                {cert.nom}
                                            </h3>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                                {cert.fournisseur?.nom || 'Officiel'} • {cert.niveau} • {cert.dureeIndicative || '15h'}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCertModal(cert)}
                                                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                                            >
                                                <span>Consulter</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-[#020617] border border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-950/20 text-red-500 flex items-center justify-center mx-auto border border-red-900/30 shadow-[0_0_15px_rgba(220,38,38,0.15)]">
                            <Target className="w-7 h-7 text-red-500" />
                        </div>
                        <div className="space-y-1.5 max-w-md mx-auto">
                            <h3 className="font-extrabold text-white text-base">Aucune certification visée</h3>
                            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                Vous n&apos;avez pas encore sélectionné de certification à préparer. Parcourez notre catalogue et ajoutez vos certifications cibles pour débloquer votre analyse d&apos;éligibilité.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/certifications"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                        >
                            <BookOpen className="w-4 h-4 text-white" />
                            <span>Accéder au Catalogue des Certifications</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* Modal détail */}
            <AnimatePresence>
                {selectedCertModal && (
                    <div 
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-sm overflow-y-auto"
                        onClick={(e) => { if (e.target === e.currentTarget) setSelectedCertModal(null); }}
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: 20 }} 
                            transition={{ duration: 0.2 }}
                            className="bg-[#080d1a] border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto"
                        >
                            <CertDetailModal 
                                cert={selectedCertModal} 
                                onClose={() => setSelectedCertModal(null)} 
                                onPractice={(c: any) => { 
                                    setSelectedCertModal(null); 
                                    router.push(`/dashboard/practice?cert=${c.slug || c.id}`); 
                                }} 
                                isTargeted={true}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

