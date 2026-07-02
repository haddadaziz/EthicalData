"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { Award, Clock, ArrowLeft, ArrowRight, Flag, HelpCircle, Check, X, RefreshCw, BookmarkCheck, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    if (f.includes('microsoft')) return 'bg-red-50 text-red-700 border-red-100';
    if (f.includes('aws')) return 'bg-orange-50 text-orange-700 border-orange-100';
    if (f.includes('google')) return 'bg-blue-50 text-blue-700 border-blue-100';
    return 'bg-slate-50 text-slate-700 border-slate-100';
};
export default function PracticePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const certSlug = searchParams.get('cert');

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

    useEffect(() => {
        const fetchCerts = async () => {
            try {
                const data = await apiFetch('/certifications');
                setCerts(data);
            } catch (err) {
                console.error("Erreur chargement certifications:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCerts();
    }, []);

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

    const handleFinishExam = async () => {
        setLoadingQuestions(true);
        const openQuestions = questions.filter(q => q.type === 'OUVERTE' || q.type === 'CAS_PRATIQUE');
        const aiEvaluations: { [key: string]: { score: number; critique: string; suggestions: string } } = {};

        if (openQuestions.length > 0) {
            try {
                const evalPromises = openQuestions.map(async (q) => {
                    const res = await apiFetch('/certifications/evaluer-ia', {
                        method: 'POST',
                        body: {
                            questionId: parseInt(q.id),
                            reponseCandidat: selectedAnswers[q.id] || ''
                        }
                    });
                    aiEvaluations[q.id] = res;
                });
                await Promise.all(evalPromises);
                setAiFeedbacks(aiEvaluations);
            } catch (err) {
                console.error("Erreur d'évaluation IA:", err);
            }
        }

        let totalPoints = 0;
        questions.forEach(q => {
            if (q.type === 'QCM' || q.type === 'VRAI_FAUX') {
                if (selectedAnswers[q.id] === q.reponseCorrecte) {
                    totalPoints += 100;
                }
            } else {
                // OUVERTE or CAS_PRATIQUE
                const aiScore = aiEvaluations[q.id]?.score ?? 0;
                totalPoints += aiScore;
            }
        });

        const finalScore = questions.length > 0 ? Math.round(totalPoints / questions.length) : 0;
        setScore(finalScore);
        setExamFinished(true);
        setLoadingQuestions(false);

        try {
            const currentCert = certs.find(c => c.slug === certSlug);
            if (currentCert) {
                await apiFetch(`/simulations/certifications/${currentCert.id}/tentatives`, {
                    method: 'POST',
                    body: { score: finalScore }
                });
                
                const readiness = await apiFetch(`/simulations/certifications/${currentCert.id}/readiness`);
                setReadinessData(readiness);
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
        setTimeLeft(questions.length * 120);
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
        if (!loading && certSlug && certs.length > 0) {
            const currentCert = certs.find(c => c.slug === certSlug);
            if (currentCert) {
                loadQuestions(currentCert.id);
            }
        }
    }, [certSlug, certs, loading]);

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
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-600 gap-4">
                <span className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-red-600">Chargement du simulateur...</p>
            </div>
        );
    }

    if (!certSlug) {
        return (
            <div className="space-y-8 text-left animate-fadeIn">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight">Simulateur d'Examen</h1>
                    <p className="text-slate-500 text-xs mt-1.5 font-bold uppercase tracking-wider">Sélectionnez une certification pour lancer l'entraînement interactif en conditions réelles.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certs.map((cert) => (
                        <div
                            key={cert.id}
                            className="bg-white border border-slate-200/80 hover:border-slate-350 hover:shadow-lg rounded-3xl overflow-hidden flex flex-col justify-between group transition-all duration-300"
                        >
                            {/* Entête Visuelle de la Carte */}
                            <div className="w-full h-32 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-6 relative">
                                {cert.image ? (
                                    <img src={cert.image} alt={cert.nom} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" />
                                ) : (
                                    <Award className="w-10 h-10 text-slate-300" />
                                )}
                                <div className="absolute top-3 left-3">
                                    <span className="font-bold text-red-600 text-[9px] px-2.5 py-0.5 bg-red-50 border border-red-100 rounded-lg">{cert.codeExamen || 'Examen'}</span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getNiveauBadgeStyle(cert.niveau)}`}>
                                        {cert.niveau}
                                    </span>
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border inline-block ${getFournisseurBadgeStyle(cert.fournisseur?.nom || '')}`}>
                                        {cert.fournisseur?.nom || 'Fournisseur'}
                                    </span>
                                    <h3 className="font-extrabold text-slate-950 text-base leading-snug group-hover:text-red-600 transition-colors line-clamp-1">{cert.nom}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-semibold">{cert.description}</p>
                                </div>

                                <button
                                    onClick={() => router.push(`/dashboard/practice?cert=${cert.slug}`)}
                                    className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg"
                                >
                                    <Play className="w-3 h-3 fill-white text-white" />
                                    <span>Démarrer l'entraînement</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
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

        // Calcul de la progression
        const answeredCount = Object.keys(selectedAnswers).length;
        const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left animate-fadeIn">

                <div className="lg:col-span-3 space-y-6">

                    {/* Barre de Progression Premium */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex-1">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5 pl-0.5">
                                <span>Progression de l'examen</span>
                                <span>{progressPercent}% ({answeredCount}/{questions.length} répondues)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full bg-gradient-to-r from-red-600 to-red-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">

                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                            <div>
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{currentQuestion.categorie || "Général"}</span>
                                <h2 className="text-sm font-bold text-slate-500 mt-1">Question {currentIdx + 1} sur {questions.length}</h2>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={toggleFlagQuestion}
                                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${flaggedQuestions.includes(currentQuestion.id)
                                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                                        : 'border-slate-200 text-slate-400 hover:text-slate-950 hover:bg-slate-50'
                                        }`}
                                    title="Marquer pour révision"
                                >
                                    <Flag className={`w-4 h-4 ${flaggedQuestions.includes(currentQuestion.id) ? 'fill-amber-500' : ''}`} />
                                </button>
                            </div>
                        </div>

                        <div className="py-2">
                            <p className="text-base sm:text-lg font-bold text-slate-950 leading-relaxed">{currentQuestion.enonce}</p>
                        </div>

                        {/* Options de réponse */}
                        <div className="space-y-3">
                            {currentQuestion.type === 'OUVERTE' || currentQuestion.type === 'CAS_PRATIQUE' ? (
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Saisissez votre réponse rédigée :</label>
                                    <textarea
                                        value={selectedAnswers[currentQuestion.id] || ''}
                                        onChange={(e) => handleSelectAnswer(e.target.value)}
                                        placeholder="Tapez votre réponse détaillée ici. L'évaluation prendra en compte votre rigueur, vos arguments et le vocabulaire technique..."
                                        className="w-full h-44 p-4 border border-slate-200 focus:border-red-600 focus:bg-white rounded-2xl text-slate-800 transition-all text-sm outline-none font-semibold resize-none shadow-sm"
                                    />
                                </div>
                            ) : (
                                (currentQuestion.options || []).map((opt: any) => {
                                    const isSelected = selectedAnswers[currentQuestion.id] === opt.lettre;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleSelectAnswer(opt.lettre)}
                                            className={`w-full p-4 border text-left rounded-2xl transition-all cursor-pointer flex items-center gap-4 group ${isSelected
                                                ? 'border-red-650 bg-red-50/30 text-slate-950 shadow-sm'
                                                : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/10 text-slate-500 hover:text-slate-950'
                                                }`}
                                        >
                                            <span className={`w-8 h-8 rounded-lg border font-bold text-xs uppercase flex items-center justify-center shrink-0 transition-colors ${isSelected
                                                ? 'border-red-600 bg-red-600 text-white'
                                                : 'border-slate-200 bg-slate-50 text-slate-500 group-hover:border-slate-400 group-hover:bg-slate-100'
                                                }`}>
                                                {opt.lettre}
                                            </span>
                                            <span className="text-sm font-semibold">{opt.texte}</span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Boutons Suivant / Précédent */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                            disabled={currentIdx === 0}
                            className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-2xl hover:border-slate-350 text-slate-600 hover:text-slate-950 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs uppercase font-bold tracking-wider bg-white shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Précédent</span>
                        </button>

                        {currentIdx < questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentIdx(prev => prev + 1)}
                                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-950 font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-widest shadow-sm hover:shadow-md"
                            >
                                <span>Suivant</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleFinishExam}
                                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-widest shadow-md hover:shadow-lg"
                            >
                                <span>Soumettre le test</span>
                                <Check className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Panneau de droite : Chronomètre & Grille */}
                <div className="space-y-6">
                    <div className="bg-white shadow-sm border border-slate-200/80 rounded-3xl p-6 text-center space-y-4">
                        <div className="flex items-center justify-center gap-2.5 text-slate-950">
                            <Clock className="w-5 h-5 text-red-650" />
                            <span className="text-2xl font-black tabular-nums">{formatTime(timeLeft)}</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsPaused(!isPaused)}
                                className="flex-1 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider bg-white shadow-sm"
                            >
                                {isPaused ? 'Reprendre' : 'Pause'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm border border-slate-200/80 rounded-3xl p-6 space-y-4">
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
                                            ? 'border-red-600 bg-red-50 text-red-600 font-extrabold ring-2 ring-red-100'
                                            : isFlagged
                                                ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                                                : isAnswered
                                                    ? 'border-slate-200 bg-slate-50 text-slate-700'
                                                    : 'border-slate-200/80 bg-transparent text-slate-500 hover:border-slate-300'
                                            }`}
                                    >
                                        {idx + 1}
                                        {isFlagged && (
                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
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
        const success = score >= 80;

        return (
            <div className="max-w-4xl mx-auto space-y-8 text-left animate-fadeIn">

                {/* Score Card Premium */}
                <div className="bg-white border border-slate-200/80 rounded-[32px] p-8 sm:p-10 text-center space-y-6 relative overflow-hidden shadow-sm">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-red-600/[0.02] blur-3xl pointer-events-none" />

                    <div className="space-y-2 relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Résultats de la simulation</p>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                            {success ? 'Félicitations, examen réussi ! 🎉' : 'Score insuffisant pour l\'instant ❌'}
                        </h2>
                        <p className="text-xs text-slate-500 font-bold max-w-md mx-auto leading-relaxed mt-2">
                            {success
                                ? 'Excellent travail ! Vous avez dépassé le seuil requis de 80%. Vous êtes prêt pour l\'examen officiel.'
                                : 'Ne vous découragez pas. Le seuil de réussite est fixé à 80%. Révisez vos points faibles et réessayez !'}
                        </p>
                    </div>

                    {/* Badge circulaire de score */}
                    <div className="flex justify-center py-2 relative z-10">
                        <div className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 ${success
                            ? 'border-emerald-500/20 bg-emerald-50/30 text-emerald-600'
                            : 'border-rose-500/20 bg-rose-50/30 text-rose-600'
                            }`}>
                            <span className="text-4xl font-black tracking-tight">{score}%</span>
                            <span className="text-[9px] font-black uppercase tracking-wider mt-1.5">Score obtenu</span>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex flex-wrap justify-center gap-4 relative z-10">
                        <button
                            onClick={handleStartExam}
                            className="flex items-center gap-2 px-5 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-widest shadow-md hover:shadow-lg"
                        >
                            <RefreshCw className="w-4 h-4 animate-spin-hover" />
                            <span>Recommencer le test</span>
                        </button>

                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2 px-5 py-3.5 border border-slate-200/85 hover:border-slate-350 bg-white text-slate-650 hover:text-slate-950 font-bold rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-wider shadow-sm"
                        >
                            <BookmarkCheck className="w-4 h-4" />
                            <span>Tableau de bord</span>
                        </button>
                    </div>
                </div>

                {/* SECTION READINESS SCORE & PLAN DE RÉVISION IA */}
                {readinessData && (
                    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 md:p-8 text-white space-y-6 shadow-xl relative overflow-hidden text-left">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                            <div className="space-y-1">
                                <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
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
                                            <span className="w-5 h-5 rounded-lg bg-red-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
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
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Rapport de Correction Détaillé</h2>

                    <div className="space-y-6">
                        {questions.map((q, idx) => {
                            const userAnswer = selectedAnswers[q.id];
                            const isOpen = q.type === 'OUVERTE' || q.type === 'CAS_PRATIQUE';
                            const aiFeedback = aiFeedbacks[q.id];
                            const isCorrect = isOpen ? (aiFeedback?.score >= 80) : (userAnswer === q.reponseCorrecte);

                            return (
                                <div
                                    key={q.id}
                                    className={`border rounded-3xl p-6 sm:p-8 space-y-5 text-left transition-all ${isCorrect
                                        ? 'border-emerald-500/15 bg-emerald-500/[0.01]'
                                        : 'border-rose-500/15 bg-rose-500/[0.01]'
                                        }`}
                                >
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{q.categorie || "Général"}</span>
                                        {isOpen ? (
                                            <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider flex items-center gap-1.5 ${isCorrect
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                }`}>
                                                {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                                {aiFeedback ? `Score IA : ${aiFeedback.score}/100` : "IA non évaluée"}
                                            </span>
                                        ) : (
                                            <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider flex items-center gap-1.5 ${isCorrect
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                }`}>
                                                {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                                {isCorrect ? 'Correct' : 'Incorrect'}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-base font-extrabold text-slate-950 leading-relaxed">
                                        <span className="text-slate-400 font-bold">{idx + 1}.</span> {q.enonce}
                                    </p>

                                    {isOpen ? (
                                        <div className="space-y-4 pt-1">
                                            {/* Réponse candidat */}
                                            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5 text-xs">
                                                <p className="font-bold text-slate-450 uppercase tracking-wider text-[9px]">Votre Réponse Rédigée :</p>
                                                <p className="text-slate-800 font-semibold whitespace-pre-line leading-relaxed">{userAnswer || "Aucune réponse n'a été rédigée."}</p>
                                            </div>

                                            {/* Évaluation IA */}
                                            {aiFeedback && (
                                                <div className="p-5 bg-red-50/20 border border-red-100 rounded-2xl space-y-3.5 text-xs text-left">
                                                    <div className="flex items-center justify-between border-b border-red-200/50 pb-2">
                                                        <span className="text-[9px] font-black text-red-650 uppercase tracking-widest">Analyse Éducative IA (Gemini)</span>
                                                        <span className="text-[10px] font-black text-red-700 bg-red-50 border border-red-200/60 px-2.5 py-0.5 rounded-full">{aiFeedback.score}/100</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <p className="text-slate-700 leading-relaxed font-semibold">
                                                            <strong className="text-slate-950 block font-bold uppercase text-[9px] tracking-wider mb-1">Critique détaillée :</strong>
                                                            {aiFeedback.critique}
                                                        </p>
                                                        <p className="text-slate-700 leading-relaxed font-semibold">
                                                            <strong className="text-slate-950 block font-bold uppercase text-[9px] tracking-wider mb-1">Suggestions d'amélioration :</strong>
                                                            {aiFeedback.suggestions}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Corrigé type */}
                                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-1.5 text-xs leading-relaxed">
                                                <p className="font-bold text-emerald-600 uppercase tracking-wider text-[9px]">Corrigé Type Officiel :</p>
                                                <p className="text-slate-800 font-semibold">{q.reponseCorrecte}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                                {(q.options || []).map((opt: any) => {
                                                    const wasSelected = userAnswer === opt.lettre;
                                                    const isOptionCorrect = q.reponseCorrecte === opt.lettre;

                                                    let style = "border-slate-200 bg-slate-50/20 text-slate-500";
                                                    if (wasSelected && !isOptionCorrect) {
                                                        style = "border-rose-500/30 bg-rose-500/5 text-rose-600";
                                                    } else if (isOptionCorrect) {
                                                        style = "border-emerald-500/30 bg-emerald-500/5 text-emerald-700";
                                                    }

                                                    return (
                                                        <div key={opt.id} className={`p-4 border rounded-2xl flex items-center gap-3 ${style}`}>
                                                            <span className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center shrink-0 ${isOptionCorrect
                                                                ? 'border-emerald-450 bg-emerald-500/15 text-emerald-600'
                                                                : wasSelected
                                                                    ? 'border-rose-450 bg-rose-500/15 text-rose-600'
                                                                    : 'border-slate-200 bg-white text-slate-500'
                                                                }`}>
                                                                {opt.lettre}
                                                            </span>
                                                            <span className="text-xs font-semibold leading-snug">{opt.texte}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {q.explication && (
                                                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs leading-relaxed">
                                                    <p className="font-bold text-red-650 uppercase tracking-wider text-[9px]">Explication pédagogique :</p>
                                                    <p className="text-slate-600 font-semibold">{q.explication}</p>
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

    const currentCert = certs.find(c => c.slug === certSlug) || certs[0] || { nom: "Microsoft Azure Fundamentals" };

    return (
        <div className="max-w-2xl mx-auto space-y-8 text-left relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-red-600/5 blur-3xl pointer-events-none" />

            <div className="bg-white shadow-sm border border-slate-200/80 rounded-[32px] p-8 sm:p-12 space-y-6 relative z-10 text-center">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-600">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                </div>

                <div className="space-y-2">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block">Simulateur Officiel</span>
                    <h2 className="text-2xl font-black text-slate-950 leading-snug">{currentCert.nom}</h2>
                    <p className="text-xs text-slate-450 font-semibold max-w-sm mx-auto leading-relaxed mt-2">
                        Cet examen blanc reproduit fidèlement la structure de l'examen de certification réel.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-200/80 my-4 text-xs">
                    <div className="space-y-1">
                        <p className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Questions</p>
                        <p className="font-extrabold text-slate-950">{questions.length} questions</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Durée</p>
                        <p className="font-extrabold text-slate-950">{questions.length * 2} minutes</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Seuil</p>
                        <p className="font-extrabold text-slate-950">80% de réussite</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleStartExam}
                        disabled={questions.length === 0}
                        className="flex-1 py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Démarrer l'Examen
                    </button>

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3.5 border border-slate-200/80 hover:border-slate-200 text-slate-600 hover:text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}