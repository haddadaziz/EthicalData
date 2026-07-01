"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { Award, Clock, ArrowLeft, ArrowRight, Flag, HelpCircle, Check, X, RefreshCw, BookmarkCheck, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleStartExam = () => {
    if (questions.length === 0) return;
    setExamStarted(true);
    setExamFinished(false);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setFlaggedQuestions([]);
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

  const handleFinishExam = async () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.reponseCorrecte) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setExamFinished(true);

    try {
      const currentCert = certs.find(c => c.slug === certSlug);
      if (currentCert) {
        await apiFetch(`/certifications/${currentCert.id}/tentatives`, {
          method: 'POST',
          body: { score: finalScore }
        });
      }
    } catch (err) {
      console.error("Erreur enregistrement tentative :", err);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading || loadingQuestions) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400 gap-4">
        <span className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Chargement du simulateur...</p>
      </div>
    );
  }

  if (!certSlug) {
    return (
      <div className="space-y-8 text-left">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Simulateur d'Examen</h1>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold uppercase tracking-wider">Sélectionnez la certification pour lancer l'entraînement interactif.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certs.map((cert) => (
            <div 
              key={cert.id}
              className="bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-3xl p-6 flex flex-col justify-between group transition-all duration-300 animate-fadeIn"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white border border-slate-850 rounded-xl flex items-center justify-center p-2">
                  {cert.image ? <img src={cert.image} alt={cert.nom} className="max-w-full max-h-full object-contain" /> : <Award className="text-slate-800" />}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 block uppercase tracking-wider">{cert.codeExamen || 'Examen'}</span>
                  <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-indigo-400 transition-colors">{cert.nom}</h3>
                </div>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{cert.description}</p>
              </div>

              <button 
                onClick={() => router.push(`/dashboard/practice?cert=${cert.slug}`)}
                className="w-full mt-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>Lancer le simulateur</span>
              </button>
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
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-405 gap-4">
          <p className="text-sm font-semibold text-slate-400">Aucune question n'est configurée pour cette certification.</p>
          <button onClick={() => router.push('/dashboard/practice')} className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-white font-bold rounded-xl text-xs">
            Retour
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left">
        
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{currentQuestion.categorie || "Général"}</span>
                <h2 className="text-sm font-bold text-slate-450 mt-1">Question {currentIdx + 1} sur {questions.length}</h2>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleFlagQuestion}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    flaggedQuestions.includes(currentQuestion.id) 
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' 
                      : 'border-slate-800 text-slate-450 hover:text-white'
                  }`}
                  title="Marquer pour révision"
                >
                  <Flag className={`w-4.5 h-4.5 ${flaggedQuestions.includes(currentQuestion.id) ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            <div className="py-4">
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">{currentQuestion.enonce}</p>
            </div>

            <div className="space-y-3">
              {(currentQuestion.options || []).map((opt: any) => {
                const isSelected = selectedAnswers[currentQuestion.id] === opt.lettre;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectAnswer(opt.lettre)}
                    className={`w-full p-4 border text-left rounded-2xl transition-all cursor-pointer flex items-center gap-4 group ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-500/5 text-white' 
                        : 'border-slate-900 hover:border-slate-800 bg-slate-950/20 text-slate-350 hover:text-white'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg border font-bold text-xs uppercase flex items-center justify-center shrink-0 transition-colors ${
                      isSelected 
                        ? 'border-indigo-400 bg-indigo-500/10 text-indigo-400' 
                        : 'border-slate-800 bg-slate-950 text-slate-500 group-hover:border-slate-700'
                    }`}>
                      {opt.lettre}
                    </span>
                    <span className="text-sm font-semibold">{opt.texte}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 px-5 py-3 border border-slate-900 rounded-2xl hover:border-slate-800 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs uppercase font-bold tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-widest shadow-md"
              >
                <span>Suivant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinishExam}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/15"
              >
                <span>Soumettre l'Examen</span>
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2.5 text-white">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span className="text-2xl font-black tabular-nums">{formatTime(timeLeft)}</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="flex-1 py-2 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider"
              >
                {isPaused ? 'Reprendre' : 'Pause'}
              </button>
            </div>
          </div>

          <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 space-y-4">
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
                    className={`h-9 rounded-xl border text-xs font-bold transition-all cursor-pointer relative flex items-center justify-center ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-extrabold ring-2 ring-indigo-500/20'
                        : isFlagged
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : isAnswered
                            ? 'border-slate-800 bg-slate-900 text-slate-300'
                            : 'border-slate-900 bg-transparent text-slate-500 hover:border-slate-800'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-slate-950" />
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
      <div className="max-w-4xl mx-auto space-y-8 text-left">
        
        <div className="bg-slate-900/20 border border-slate-900 rounded-[32px] p-8 sm:p-10 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Résultats de la simulation</p>
            <h2 className="text-3xl font-black text-white">
              {success ? 'Félicitations, vous avez réussi ! 🎉' : 'Niveau insuffisant pour l\'instant ❌'}
            </h2>
            <p className="text-xs text-slate-400 font-semibold max-w-md mx-auto mt-2">
              {success 
                ? 'Votre score est supérieur au seuil requis de 80%. Vous êtes prêt pour passer l\'examen officiel.' 
                : 'Continuez à vous entraîner. Le seuil officiel d\'obtention est fixé à 80% (ou 700/1000).'}
            </p>
          </div>

          <div className="flex justify-center py-4 relative z-10">
            <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-lg ${
              success ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-rose-500/20 bg-rose-500/5 text-rose-400'
            }`}>
              <span className="text-3xl font-black">{score}%</span>
              <span className="text-[9px] font-black uppercase tracking-wider mt-1">Score Final</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <button
              onClick={handleStartExam}
              className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-widest shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recommencer le test</span>
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-5 py-3.5 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all cursor-pointer text-xs uppercase font-bold tracking-wider"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Retour au Tableau de Bord</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-black text-white uppercase tracking-widest">Correction Détaillée</h2>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const userAnswer = selectedAnswers[q.id];
              const isCorrect = userAnswer === q.reponseCorrecte;

              return (
                <div 
                  key={q.id}
                  className={`border rounded-3xl p-6 sm:p-8 space-y-4 text-left transition-all ${
                    isCorrect 
                      ? 'border-emerald-500/10 bg-emerald-500/[0.01]' 
                      : 'border-rose-500/10 bg-rose-500/[0.01]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{q.categorie || "Général"}</span>
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isCorrect 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                    }`}>
                      {isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <p className="text-base font-bold text-white leading-relaxed">
                    <span className="text-slate-500">{idx + 1}.</span> {q.enonce}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {(q.options || []).map((opt: any) => {
                      const wasSelected = userAnswer === opt.lettre;
                      const isOptionCorrect = q.reponseCorrecte === opt.lettre;

                      let style = "border-slate-900 bg-slate-950/20 text-slate-400";
                      if (wasSelected && !isOptionCorrect) {
                        style = "border-rose-500/30 bg-rose-500/5 text-rose-350";
                      } else if (isOptionCorrect) {
                        style = "border-emerald-500/30 bg-emerald-500/5 text-emerald-355";
                      }

                      return (
                        <div key={opt.id} className={`p-4 border rounded-2xl flex items-center gap-3 ${style}`}>
                          <span className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center shrink-0 ${
                            isOptionCorrect 
                              ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400' 
                              : wasSelected 
                                ? 'border-rose-400 bg-rose-500/10 text-rose-455' 
                                : 'border-slate-800 bg-slate-950 text-slate-500'
                          }`}>
                            {opt.lettre}
                          </span>
                          <span className="text-xs font-semibold leading-snug">{opt.texte}</span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explication && (
                    <div className="mt-4 p-4 bg-slate-900/20 border border-slate-900 rounded-2xl space-y-1.5 text-xs leading-relaxed">
                      <p className="font-bold text-indigo-400 uppercase tracking-wider text-[9px]">Explication :</p>
                      <p className="text-slate-350 font-medium">{q.explication}</p>
                    </div>
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="bg-slate-900/20 border border-slate-900 rounded-[32px] p-8 sm:p-12 space-y-6 relative z-10 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
            <HelpCircle className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Simulateur Officiel</span>
          <h2 className="text-2xl font-black text-white leading-snug">{currentCert.nom}</h2>
          <p className="text-xs text-slate-450 font-semibold max-w-sm mx-auto leading-relaxed mt-2">
            Cet examen blanc reproduit fidèlement la structure de l'examen de certification réel.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-900 my-4 text-xs">
          <div className="space-y-1">
            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Questions</p>
            <p className="font-extrabold text-white">{questions.length} questions</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Durée</p>
            <p className="font-extrabold text-white">{questions.length * 2} minutes</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Seuil</p>
            <p className="font-extrabold text-white">80% de réussite</p>
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
            className="px-6 py-3.5 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}