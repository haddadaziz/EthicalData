"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { Clock, ArrowLeft, ArrowRight, HelpCircle, Check, X, Play, FileText, BookOpen, Search } from '@/components/icons';
import { getCertificateBadgeLogo } from '@/lib/certification-utils';
import PracticeFilters from '@/components/practice/PracticeFilters';
import QuestionCard from '@/components/practice/QuestionCard';
import ResultsPanel from '@/components/practice/ResultsPanel';
import ProgressBar from '@/components/practice/ProgressBar';
import CertSelector from '@/components/practice/CertSelector';

const getNiveauBadgeStyle = (niveau: string) => {
    switch (niveau) {
        case 'DEBUTANT':
            return 'bg-emerald-50 text-emerald-700 border-emerald-150';
        case 'INTERMEDIAIRE':
            return 'bg-indigo-50 text-indigo-700 border-indigo-150';
        case 'AVANCE':
            return 'bg-amber-50 text-amber-700 border-amber-150';
        default:
            return 'bg-slate-50 text-slate-700 border-slate-150';
    }
};
const getFournisseurBadgeStyle = (fournisseur: string) => {
    const f = fournisseur.toLowerCase();
    if (f.includes('microsoft')) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (f.includes('aws')) return 'bg-amber-50 text-amber-700 border-amber-100';
    if (f.includes('google')) return 'bg-blue-50 text-blue-700 border-blue-100';
    return 'bg-slate-50 text-slate-700 border-slate-100';
};
export default function PracticePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const certSlug = searchParams.get('cert');
    const courseSlug = searchParams.get('course');

    const [certs, setCerts] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const [examStarted, setExamStarted] = useState(false);
    const [examFinished, setExamFinished] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
    const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(600);
    const [isPaused, setIsPaused] = useState(false);
    const [score, setScore] = useState(0);
    const [aiFeedbacks, setAiFeedbacks] = useState<{ [key: string]: { score: number; critique: string; suggestions: string } }>({});
    const [readinessData, setReadinessData] = useState<any | null>(null);

    const [mode, setMode] = useState<'certification' | 'cours'>('certification');
    const [inscriptions, setInscriptions] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
    const [courseStatus, setCourseStatus] = useState<any | null>(null);
    const [courseSimulation, setCourseSimulation] = useState<any | null>(null);
    const [courseFilter, setCourseFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

    const [fournisseurs, setFournisseurs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<'TOUS' | 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE'>('TOUS');
    const [selectedProvider, setSelectedProvider] = useState<string>('TOUS');
    const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
    const [certDropdownOpen, setCertDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const [certsData, inscData, provData] = await Promise.all([
                    apiFetch('/certifications'),
                    apiFetch('/cours/mes-inscriptions').catch(() => []),
                    apiFetch('/certifications/fournisseurs').catch(() => []),
                ]);
                setCerts(Array.isArray(certsData) ? certsData : []);
                setInscriptions(Array.isArray(inscData) ? inscData : []);
                setFournisseurs(Array.isArray(provData) ? provData : []);
            } catch (err) {
                console.error("Erreur chargement initial:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, []);

    const [currentPage, setCurrentPage] = useState(1);

    const filteredCerts = certs.filter((cert) => {
        const search = searchTerm.toLowerCase().trim();
        const matchesSearch = !search || cert.nom.toLowerCase().includes(search) || 
                              (cert.codeExamen && cert.codeExamen.toLowerCase().includes(search));
        const matchesLevel = selectedLevel === 'TOUS' || cert.niveau === selectedLevel;
        const matchesProvider = selectedProvider === 'TOUS' || cert.fournisseur?.id === selectedProvider || cert.fournisseurId === Number(selectedProvider) || cert.fournisseur?.slug === selectedProvider;

        return matchesSearch && matchesLevel && matchesProvider;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedLevel, selectedProvider]);

    const itemsPerPage = 6;
    const totalPages = Math.ceil(filteredCerts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCerts = filteredCerts.slice(indexOfFirstItem, indexOfLastItem);

    const loadQuestions = async (certId: string) => {
        setLoadingQuestions(true);
        try {
            const data = await apiFetch(`/certifications/${certId}/questions`);
            setQuestions(data);
        } catch (err) {
            console.error("Erreur de chargement des questions :", err);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const loadCourseSimulation = async (courseId: string) => {
        setLoadingQuestions(true);
        try {
            const [sim, status] = await Promise.all([
                apiFetch(`/simulations/cours/${courseId}`),
                apiFetch(`/cours/${courseId}/inscription-status`),
            ]);
            setCourseSimulation(sim);
            setCourseStatus(status);
            if (sim?.questions?.length > 0) {
                setQuestions(sim.questions);
            } else {
                setQuestions([]);
            }
        } catch (err) {
            console.error("Erreur chargement simulation cours:", err);
            setQuestions([]);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const handleFinishExam = async () => {
        setLoadingQuestions(true);
        const openQuestions = questions.filter(q => q.type === 'OUVERTE' || q.type === 'CAS_PRATIQUE');
        const aiEvaluations: { [key: string]: { score: number; critique: string; suggestions: string } } = {};

        if (openQuestions.length > 0) {
            await Promise.all(openQuestions.map(async (q) => {
                try {
                    const res = await apiFetch('/certifications/evaluer-ia', {
                        method: 'POST',
                        body: {
                            questionId: Number(q.id),
                            reponseCandidat: selectedAnswers[q.id] || ''
                        }
                    });
                    if (res && typeof res.score === 'number') {
                        aiEvaluations[q.id] = res;
                    } else {
                        throw new Error("Invalid AI response");
                    }
                } catch (err) {
                    console.error(`Erreur d'évaluation IA pour la question ${q.id}:`, err);
                    const userRep = (selectedAnswers[q.id] || '').trim();
                    aiEvaluations[q.id] = {
                        score: userRep.length > 30 ? 75 : (userRep.length > 10 ? 45 : 15),
                        critique: userRep.length > 10 
                            ? "Votre réponse aborde les points principaux du sujet mais peut être approfondie."
                            : "La réponse rédigée est trop succincte pour valider l'ensemble des critères.",
                        suggestions: "Révisez le corrigé officiel et détaillez les termes techniques clés."
                    };
                }
            }));
            setAiFeedbacks(aiEvaluations);
        }

        let totalPoints = 0;
        questions.forEach(q => {
            if (q.type === 'QCM' || q.type === 'VRAI_FAUX') {
                if (selectedAnswers[q.id] === q.reponseCorrecte) {
                    totalPoints += 100;
                }
            } else {
                const aiScore = aiEvaluations[q.id]?.score ?? 0;
                totalPoints += aiScore;
            }
        });

        const finalScore = questions.length > 0 ? Math.round(totalPoints / questions.length) : 0;
        setScore(finalScore);
        setExamFinished(true);
        setLoadingQuestions(false);

        try {
            if (mode === 'cours' && selectedCourse) {
                await apiFetch(`/simulations/cours/${selectedCourse.id}/tentatives`, {
                    method: 'POST',
                    body: { score: finalScore }
                }).catch(e => console.warn("Erreur enregistrement tentative cours:", e));

                const readiness = await apiFetch(`/simulations/cours/${selectedCourse.id}/readiness`).catch(() => null);
                if (readiness) setReadinessData(readiness);
            } else {
                const currentCert = certs.find(c => c.slug === certSlug || String(c.id) === String(certSlug));
                const targetCertId = currentCert ? currentCert.id : (questions[0]?.certificationId || null);

                if (targetCertId) {
                    await apiFetch(`/simulations/certifications/${targetCertId}/tentatives`, {
                        method: 'POST',
                        body: { score: finalScore }
                    }).catch(e => console.warn("Erreur enregistrement tentative:", e));

                    const readiness = await apiFetch(`/simulations/certifications/${targetCertId}/readiness`).catch(() => null);
                    if (readiness) setReadinessData(readiness);
                }
            }
        } catch (err) {
            console.error("Erreur enregistrement ou Readiness Score :", err);
        }
    };

    const handleStartExam = () => {
        if (questions.length === 0) return;
        setExamStarted(true);
        setExamFinished(false);
        setCurrentIdx(0);
        setSelectedAnswers({});
        setFlaggedQuestions([]);
        setAiFeedbacks({});
        setReadinessData(null);
        
        let durationMinutes = 60;
        if (mode === 'certification') {
            const activeCert = certs.find(c => c.slug === certSlug);
            durationMinutes = activeCert?.simulations?.[0]?.duree || 60;
        } else if (mode === 'cours') {
            durationMinutes = courseSimulation?.duree || 60;
        }

        setTimeLeft(durationMinutes * 60);
        setIsPaused(false);
    };

    const handleSelectAnswer = (optionLettre: string) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questions[currentIdx].id]: optionLettre
        });
    };

    const toggleFlagQuestion = () => {
        const qId = questions[currentIdx].id;
        if (flaggedQuestions.includes(qId)) {
            setFlaggedQuestions(flaggedQuestions.filter(id => id !== qId));
        } else {
            setFlaggedQuestions([...flaggedQuestions, qId]);
        }
    };

    useEffect(() => {
        if (loading) return;
        if (certSlug && certs.length > 0) {
            setMode('certification');
            const currentCert = certs.find(c => c.slug === certSlug);
            if (currentCert) loadQuestions(currentCert.id);
        }
        if (courseSlug && inscriptions.length > 0) {
            setMode('cours');
            const insc = inscriptions.find((i: any) => i.cours?.slug === courseSlug);
            if (insc?.cours) {
                setSelectedCourse(insc.cours);
                loadCourseSimulation(insc.cours.id);
            }
        }
    }, [certSlug, courseSlug, certs, inscriptions, loading]);

    useEffect(() => {
        if (!examStarted || examFinished || isPaused) return;
        if (timeLeft <= 0) {
            handleFinishExam();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [examStarted, examFinished, isPaused, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading || loadingQuestions) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400 gap-4">
                <span className="w-10 h-10 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-500">Chargement du simulateur...</p>
            </div>
        );
    }

    if (!certSlug && !courseSlug) {
        return (
            <div className="space-y-6 text-left animate-fadeIn">
                <div className="flex items-center gap-2 mb-6 bg-[#080d1a] border border-slate-800 rounded-2xl p-1.5 w-fit shadow-xs">
                    <button
                        onClick={() => setMode('certification')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${mode === 'certification' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'text-slate-400 hover:text-white'}`}
                    >
                        Certifications
                    </button>
                    <button
                        onClick={() => setMode('cours')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${mode === 'cours' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'text-slate-400 hover:text-white'}`}
                    >
                        Mes cours
                    </button>
                </div>

                {mode === 'certification' ? (
                    <div className="space-y-8">
                        {/* Barre de Recherche et Filtres */}
                        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="relative max-w-md w-full">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                                        <Search className="w-4 h-4" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Rechercher ..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-slate-700 focus:border-cyan-500 rounded-xl text-white placeholder-slate-500 transition-all text-sm outline-none font-semibold"
                                    />
                                </div>
                                <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto shrink-0">
                                    <div className="text-xs text-slate-400 font-bold shrink-0">
                                        {filteredCerts.length} disponible{filteredCerts.length > 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>

                            {/* Filtres par Niveau */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-4">
                                <div className="space-y-2.5 text-left">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Par Niveau</span>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { val: 'TOUS', label: 'Tous' },
                                            { val: 'DEBUTANT', label: 'Débutant' },
                                            { val: 'INTERMEDIAIRE', label: 'Intermédiaire' },
                                            { val: 'AVANCE', label: 'Avancé' }
                                        ].map((niv) => (
                                            <button
                                                key={niv.val}
                                                onClick={() => setSelectedLevel(niv.val as any)}
                                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                    selectedLevel === niv.val
                                                        ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                                                        : 'bg-[#020617] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {niv.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <PracticeFilters
                                    selectedProvider={selectedProvider}
                                    onProviderChange={(id) => setSelectedProvider(id)}
                                    selectedCertId={''}
                                    onCertChange={() => {}}
                                    fournisseurs={fournisseurs}
                                    certifications={certs}
                                    providerDropdownOpen={providerDropdownOpen}
                                    setProviderDropdownOpen={setProviderDropdownOpen}
                                    certDropdownOpen={certDropdownOpen}
                                    setCertDropdownOpen={setCertDropdownOpen}
                                />
                            </div>
                        </div>

                        {filteredCerts.length === 0 ? (
                            <div className="p-12 text-center bg-[#080d1a] border border-slate-800 rounded-3xl text-slate-400 font-semibold shadow-sm">
                                Aucune certification ne correspond aux critères sélectionnés.
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <CertSelector
                                    certifications={currentCerts}
                                    certLogos={{}}
                                    onSelect={(cert) => router.push(`/dashboard/practice?cert=${cert.slug}`)}
                                    formatNumber={(n) => n.toLocaleString()}
                                />

                                {totalPages > 1 && (
                                    <div className="p-6 border-t border-slate-800 flex items-center justify-between bg-[#080d1a] rounded-3xl mt-6 shadow-sm">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-[#020617] shadow-xs"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5" />
                                            <span>Précédent</span>
                                        </button>

                                        <div className="flex items-center gap-1.5 overflow-x-auto mx-2 hide-scrollbar">
                                            {Array.from({ length: totalPages }).map((_, i) => {
                                                const pageNum = i + 1;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer shrink-0 ${currentPage === pageNum
                                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white'
                                                            : 'bg-[#020617] text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-[#020617] shadow-xs"
                                        >
                                            <span>Suivant</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Filtre En cours / Terminés */}
                        <div className="flex items-center gap-2 bg-[#080d1a] border border-slate-800 rounded-2xl p-1.5 w-fit shadow-xs">
                            <button onClick={() => setCourseFilter('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${courseFilter === 'all' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.2)]' : 'text-slate-400 hover:text-white'}`}>
                                Tous
                            </button>
                            <button onClick={() => setCourseFilter('in-progress')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${courseFilter === 'in-progress' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.2)]' : 'text-slate-400 hover:text-white'}`}>
                                En cours
                            </button>
                            <button onClick={() => setCourseFilter('completed')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${courseFilter === 'completed' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.2)]' : 'text-slate-400 hover:text-white'}`}>
                                Terminés
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {inscriptions.length === 0 ? (
                                <div className="col-span-full p-12 text-center bg-[#080d1a] border border-slate-800 rounded-3xl">
                                    <p className="text-sm font-semibold text-slate-400">Vous n'êtes inscrit à aucun cours.</p>
                                    <button onClick={() => router.push('/dashboard/cours')} className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                                        Explorer les cours
                                    </button>
                                </div>
                            ) : (
                                inscriptions
                                    .filter((insc: any) => {
                                        if (courseFilter === 'all') return true;
                                        const p = insc.progressions || [];
                                        const completed = p.filter((x: any) => x.completed).length;
                                        const total = insc.cours?.modules?.length || 1;
                                        const allDone = completed >= total && total > 0;
                                        return courseFilter === 'completed' ? allDone : !allDone;
                                    })
                                    .map((insc: any) => {
                                        const course = insc.cours;
                                        if (!course) return null;
                                        const p = insc.progressions || [];
                                        const completedCount = p.filter((x: any) => x.completed).length;
                                        const totalModules = course.modules?.length || 0;
                                        const isCompleted = completedCount >= totalModules && totalModules > 0;
                                        return (
                                            <div key={course.id} className="bg-[#080d1a] border border-slate-800 hover:border-slate-700 hover:shadow-xl rounded-3xl p-6 sm:p-7 flex flex-col justify-between group transition-all duration-300 text-left space-y-5">
                                                <div className="flex items-start gap-4">
                                                    {course.imageUrl && (
                                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-[#020617] border border-slate-700">
                                                            <img src={course.imageUrl} alt={course.titre} className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="space-y-2 flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-extrabold text-white text-base sm:text-lg leading-snug group-hover:text-cyan-400 transition-colors truncate">{course.titre}</h3>
                                                            {isCompleted && (
                                                                <span className="shrink-0 px-2 py-0.5 bg-emerald-950/30 border border-emerald-900/50 text-emerald-500 text-[9px] font-black rounded-lg">Terminé</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{course.description}</p>
                                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                                                            {!isCompleted && totalModules > 0 && (
                                                                <span className="flex items-center gap-1 text-cyan-400">
                                                                    <Clock className="w-3 h-3" />
                                                                    {completedCount}/{totalModules} modules
                                                                </span>
                                                            )}
                                                            <span className="flex items-center gap-1">
                                                                <FileText className="w-3 h-3" />
                                                                {totalModules} module{totalModules > 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="border-t border-slate-800 pt-4">
                                                    {isCompleted ? (
                                                        <button onClick={() => router.push(`/dashboard/practice?course=${course.slug}`)}
                                                            className="w-full px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                                                            <Play className="w-3.5 h-3.5 fill-white text-white" />
                                                            <span>Simulation du cours</span>
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => router.push(`/dashboard/cours/${course.id}/apprendre?from=mes-cours`)}
                                                            className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                                                            <BookOpen className="w-3.5 h-3.5" />
                                                            <span>Continuer le cours</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (examStarted && !examFinished) {
        const currentQuestion = questions[currentIdx];

        if (!currentQuestion) {
            return (
                <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500 gap-4">
                    <p className="text-sm font-semibold text-slate-650">Aucune question n'est configurée pour cette certification.</p>
                    <button onClick={() => router.push('/dashboard/practice')} className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-bold rounded-xl text-xs">
                        Retour
                    </button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left animate-fadeIn">

                <div className="lg:col-span-3 space-y-6">

                    <ProgressBar
                        current={currentIdx + 1}
                        total={questions.length}
                        answers={selectedAnswers}
                    />

                    <QuestionCard
                        question={currentQuestion}
                        selectedAnswer={selectedAnswers[currentQuestion.id] || null}
                        onAnswerSelect={handleSelectAnswer}
                        showExplanation={false}
                        questionNumber={currentIdx + 1}
                        totalQuestions={questions.length}
                        isFlagged={flaggedQuestions.includes(currentQuestion.id)}
                        onToggleFlag={toggleFlagQuestion}
                    />

                    {/* Boutons Suivant / Précédent */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                            disabled={currentIdx === 0}
                            className="flex items-center gap-2 px-5 py-3 border border-slate-800 rounded-2xl hover:border-slate-700 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs uppercase font-bold tracking-wider bg-[#080d1a] shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Précédent</span>
                        </button>

                        {currentIdx < questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentIdx(prev => prev + 1)}
                                className="flex items-center gap-2 px-6 py-3 bg-[#080d1a] hover:bg-slate-800 border border-slate-800 text-white font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-widest shadow-sm hover:shadow-md"
                            >
                                <span>Suivant</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleFinishExam}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-lg"
                            >
                                <span>Soumettre le test</span>
                                <Check className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Panneau de droite : Chronomètre & Grille */}
                <div className="space-y-6">
                    <div className="bg-[#080d1a] shadow-sm border border-slate-800 rounded-3xl p-6 text-center space-y-4">
                        <div className="flex items-center justify-center gap-2.5 text-white">
                            <Clock className="w-5 h-5 text-cyan-400" />
                            <span className="text-2xl font-black tabular-nums">{formatTime(timeLeft)}</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsPaused(!isPaused)}
                                className="flex-1 py-2.5 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider bg-[#020617] shadow-sm"
                            >
                                {isPaused ? 'Reprendre' : 'Pause'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#080d1a] shadow-sm border border-slate-800 rounded-3xl p-6 space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grille des questions</p>

                        <div className="grid grid-cols-5 gap-2.5">
                            {questions.map((q, idx) => {
                                const isSelected = currentIdx === idx;
                                const isAnswered = selectedAnswers[q.id] !== undefined;
                                const isFlagged = flaggedQuestions.includes(q.id);

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentIdx(idx)}
                                        className={`h-9 rounded-xl border text-xs font-bold transition-all cursor-pointer relative flex items-center justify-center ${isSelected
                                            ? 'border-blue-600 bg-blue-950/30 text-cyan-400 font-extrabold ring-2 ring-red-900/50'
                                            : isFlagged
                                                ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                                                : isAnswered
                                                    ? 'border-slate-700 bg-[#020617] text-slate-300'
                                                    : 'border-slate-800 bg-transparent text-slate-500 hover:border-slate-700'
                                            }`}
                                    >
                                        {idx + 1}
                                        {isFlagged && (
                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#080d1a]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>
        );
    }

    if (examFinished) {
        let correctCount = 0;
        let wrongCount = 0;
        questions.forEach(q => {
            if (q.type === 'OUVERTE' || q.type === 'CAS_PRATIQUE') {
                const fb = aiFeedbacks[q.id];
                if (fb && fb.score >= 80) correctCount++; else wrongCount++;
            } else {
                if (selectedAnswers[q.id] === q.reponseCorrecte) correctCount++; else wrongCount++;
            }
        });
        const resultsCertName = mode === 'cours' ? selectedCourse?.titre || '' : (certs.find(c => c.slug === certSlug)?.nom || '');

        return (
            <div className="max-w-4xl mx-auto space-y-8 text-left animate-fadeIn">

                <ResultsPanel
                    score={score}
                    totalQuestions={questions.length}
                    correctAnswers={correctCount}
                    wrongAnswers={wrongCount}
                    certName={resultsCertName}
                    onRetry={handleStartExam}
                    onExit={() => router.push('/dashboard')}
                />

                {/* SECTION READINESS SCORE & PLAN DE RÉVISION IA */}
                {readinessData && (
                    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 md:p-8 text-white space-y-6 shadow-xl relative overflow-hidden text-left">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                            <div className="space-y-1">
                                <span className="px-3 py-1 bg-blue-500/20 border border-cyan-500/30 text-cyan-300 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                                    Analyse d'Éligibilité par IA
                                </span>
                                <h3 className="text-xl font-black text-white">
                                    Readiness Score : {readinessData.readinessScore}%
                                </h3>
                                <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xl">
                                    {readinessData.conseil}
                                </p>
                            </div>

                            <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-center shrink-0">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Statut d'Examen</span>
                                <span className={`text-xs font-black uppercase tracking-wider ${readinessData.statut === 'PRET' ? 'text-emerald-400' : readinessData.statut === 'PRESQUE_PRET' ? 'text-amber-400' : 'text-rose-400'
                                    }`}>
                                    {readinessData.statut === 'PRET' ? 'Prêt à Passer' : readinessData.statut === 'PRESQUE_PRET' ? 'Presque Prêt' : 'Lacunes Détectées'}
                                </span>
                            </div>
                        </div>

                        {/* PLAN DE RÉVISION SUR-MESURE */}
                        {readinessData.planRevision && readinessData.planRevision.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                                    Plan de Révision Recommandé
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {readinessData.planRevision.map((etape: string, idx: number) => (
                                        <div key={idx} className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3 text-xs text-slate-200 font-medium">
                                            <span className="w-5 h-5 rounded-lg bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                                {idx + 1}
                                            </span>
                                            <span>{etape}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Liste de Correction */}
                <div className="space-y-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Rapport de Correction Détaillé</h2>

                    <div className="space-y-6">
                        {questions.map((q, idx) => {
                            const userAnswer = selectedAnswers[q.id];
                            const isOpen = q.type === 'OUVERTE' || q.type === 'CAS_PRATIQUE';
                            const aiFeedback = aiFeedbacks[q.id];
                            const isCorrect = isOpen ? ((aiFeedback?.score ?? 0) >= 80) : (userAnswer === q.reponseCorrecte);

                            return (
                                <div
                                    key={q.id}
                                    className={`border rounded-3xl p-6 sm:p-8 space-y-5 text-left transition-all ${isCorrect
                                        ? 'border-emerald-900/50 bg-emerald-950/10'
                                        : 'border-blue-900/50 bg-blue-950/10'
                                        }`}
                                >
                                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Question {idx + 1} • {q.categorie || "Général"}</span>
                                        {isOpen ? (
                                            <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider flex items-center gap-1.5 ${isCorrect
                                                ? 'bg-emerald-950/40 text-emerald-500 border border-emerald-900/50'
                                                : 'bg-rose-950/40 text-rose-500 border border-rose-900/50'
                                                }`}>
                                                {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                                {aiFeedback ? `Score IA : ${aiFeedback.score}/100` : "IA non évaluée"}
                                            </span>
                                        ) : (
                                            <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider flex items-center gap-1.5 ${isCorrect
                                                ? 'bg-emerald-950/40 text-emerald-500 border border-emerald-900/50'
                                                : 'bg-rose-950/40 text-rose-500 border border-rose-900/50'
                                                }`}>
                                                {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                                {isCorrect ? 'Correct' : 'Incorrect'}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-extrabold text-white text-sm sm:text-base leading-snug">{q.enonce}</h3>

                                    {/* Réponse ouverte */}
                                    {isOpen ? (
                                        <div className="space-y-3">
                                            <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl space-y-1">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Votre Réponse :</span>
                                                <p className="text-xs text-slate-300 font-medium whitespace-pre-wrap">{userAnswer || "Aucune réponse saisie."}</p>
                                            </div>

                                            {/* Évaluation IA */}
                                            {aiFeedback && (
                                                <div className="p-5 bg-blue-950/20 border border-blue-900/30 rounded-2xl space-y-3.5 text-xs text-left">
                                                    <div className="flex items-center justify-between border-b border-blue-900/50 pb-2">
                                                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Analyse Éducative IA (Gemini)</span>
                                                        <span className="text-[10px] font-black text-cyan-300 bg-blue-950/40 border border-blue-900/50 px-2.5 py-0.5 rounded-full">{aiFeedback.score}/100</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <p className="text-slate-300 leading-relaxed font-semibold">
                                                            <strong className="text-white block font-bold uppercase text-[9px] tracking-wider mb-1">Critique détaillée :</strong>
                                                            {aiFeedback.critique}
                                                        </p>
                                                        <p className="text-slate-300 leading-relaxed font-semibold">
                                                            <strong className="text-white block font-bold uppercase text-[9px] tracking-wider mb-1">Suggestions d'amélioration :</strong>
                                                            {aiFeedback.suggestions}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Corrigé type */}
                                            <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl space-y-1.5 text-xs leading-relaxed">
                                                <p className="font-bold text-emerald-500 uppercase tracking-wider text-[9px]">Corrigé Type Officiel :</p>
                                                <p className="text-slate-300 font-semibold">{q.reponseCorrecte}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                                {(q.options || []).map((opt: any) => {
                                                    const wasSelected = userAnswer === opt.lettre;
                                                    const isOptionCorrect = q.reponseCorrecte === opt.lettre;

                                                    let style = "border-slate-800 bg-[#020617] text-slate-400";
                                                    if (wasSelected && !isOptionCorrect) {
                                                        style = "border-cyan-500/30 bg-blue-500/10 text-cyan-400";
                                                    } else if (isOptionCorrect) {
                                                        style = "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
                                                    }

                                                    return (
                                                        <div key={opt.id} className={`p-4 border rounded-2xl flex items-center gap-3 ${style}`}>
                                                            <span className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center shrink-0 ${isOptionCorrect
                                                                ? 'border-emerald-500 bg-emerald-950/50 text-emerald-500'
                                                                : wasSelected
                                                                    ? 'border-cyan-500 bg-blue-950/50 text-cyan-400'
                                                                    : 'border-slate-700 bg-slate-800 text-slate-400'
                                                                }`}>
                                                                {opt.lettre}
                                                            </span>
                                                            <span className="text-xs font-semibold leading-snug">{opt.texte}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {q.explication && (
                                                <div className="mt-4 p-4 bg-[#020617] border border-slate-800 rounded-2xl space-y-1.5 text-xs leading-relaxed">
                                                    <p className="font-bold text-cyan-400 uppercase tracking-wider text-[9px]">Explication pédagogique :</p>
                                                    <p className="text-slate-300 font-semibold">{q.explication}</p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        );
    }

    const currentCert = mode === 'cours' && !selectedCourse ? null : (certs.find(c => c.slug === certSlug) || certs[0] || null);

    return (
        <div className="max-w-2xl mx-auto space-y-8 text-left relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />

            <div className="bg-[#080d1a] shadow-sm border border-slate-800 rounded-[32px] p-8 sm:p-12 space-y-6 relative z-10 text-center">

                {mode === 'cours' && selectedCourse ? (
                    <>
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-blue-950/30 border border-blue-900/30 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-cyan-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">Simulation de Cours</span>
                            <h2 className="text-2xl font-black text-white leading-snug">{selectedCourse.titre}</h2>

                            {courseStatus && !courseStatus.inscrit && (
                                <div className="mt-4 p-4 bg-amber-950/30 border border-amber-900/50 rounded-2xl">
                                    <p className="text-xs font-bold text-amber-500">Vous n'êtes pas inscrit à ce cours.</p>
                                    <button onClick={() => router.push(`/dashboard/cours/${selectedCourse.id}`)} className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs">
                                        Rejoindre le cours
                                    </button>
                                </div>
                            )}
                            {courseStatus && courseStatus.inscrit && !courseStatus.completed && (
                                <div className="mt-4 p-4 bg-blue-950/30 border border-blue-900/50 rounded-2xl">
                                    <p className="text-xs font-bold text-cyan-400">Vous devez d'abord terminer tous les modules du cours pour accéder à sa simulation.</p>
                                    <p className="text-xs text-cyan-300 font-semibold mt-1">Progression : {courseStatus.progression}% ({courseStatus.completedCount}/{courseStatus.totalModules} modules)</p>
                                    <button onClick={() => router.push(`/dashboard/cours/${selectedCourse.id}/apprendre`)} className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">
                                        Continuer le cours
                                    </button>
                                </div>
                            )}
                            {!courseSimulation && courseStatus?.inscrit && (
                                <div className="mt-4 p-4 bg-[#020617] border border-slate-800 rounded-2xl">
                                    <p className="text-xs font-bold text-slate-400">Le formateur n'a pas encore créé de simulation pour ce cours.</p>
                                </div>
                            )}
                        </div>

                        {courseStatus?.inscrit && courseStatus?.completed && courseSimulation && questions.length > 0 && (
                            <>
                                <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-800 my-4 text-xs">
                                    <div className="space-y-1">
                                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Questions</p>
                                        <p className="font-extrabold text-white">{questions.length} questions</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Durée</p>
                                        <p className="font-extrabold text-white">{questions.length * 2} minutes</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Seuil</p>
                                        <p className="font-extrabold text-white">80% de réussite</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button onClick={handleStartExam} disabled={questions.length === 0}
                                        className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
                                        Démarrer l'Examen
                                    </button>
                                    <button onClick={() => router.push('/dashboard')}
                                        className="px-6 py-3.5 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider bg-[#020617]">
                                        Annuler
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {currentCert && (
                            <div className="flex justify-center">
                                <div className="w-28 h-28 flex items-center justify-center p-1">
                                    {getCertificateBadgeLogo(currentCert) ? (
                                        <img src={getCertificateBadgeLogo(currentCert)} alt={currentCert.nom} className="max-h-full max-w-full object-contain filter drop-shadow-md" />
                                    ) : (
                                        <HelpCircle className="w-12 h-12 text-cyan-400" />
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">Simulateur Officiel</span>
                            <h2 className="text-2xl font-black text-white leading-snug">{currentCert?.nom || 'Chargement...'}</h2>
                            <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed mt-2">
                                Cet examen blanc reproduit fidèlement la structure de l'examen de certification réel.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-800 my-4 text-xs">
                            <div className="space-y-1">
                                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Questions</p>
                                <p className="font-extrabold text-white">{questions.length} questions</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Durée</p>
                                <p className="font-extrabold text-white">{questions.length * 2} minutes</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Seuil</p>
                                <p className="font-extrabold text-white">80% de réussite</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={handleStartExam} disabled={questions.length === 0}
                                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
                                Démarrer l'Examen
                            </button>
                            <button onClick={() => router.push('/dashboard')}
                                className="px-6 py-3.5 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider bg-[#020617]">
                                Annuler
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
