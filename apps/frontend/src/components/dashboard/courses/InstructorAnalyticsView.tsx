'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Users, Award, BookOpen, Clock, CheckCircle2, Search, ChevronDown, BarChart3, ShieldCheck, Play, ArrowUpRight } from '@/components/icons';

interface Learner {
  id: string;
  apprenant: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    avatar?: string;
  };
  dateInscription: string;
  progression: number;
  modulesCompletes: number;
  totalModules: number;
  dernierAcces?: string;
}

interface Attempt {
  id: string;
  score: number;
  dureePassage?: number;
  datePassage: string;
  reussi: boolean;
  utilisateur: {
    id: string;
    prenom: string;
    nom: string;
    avatar?: string;
  };
}

interface SimulationStat {
  id: string;
  titre: string;
  duree: number;
  scoreMinimal: number;
  totalTentatives: number;
  reussisCount: number;
  tauxReussite: number;
  scoreMoyen: number;
  meilleurScore: number;
  dernieresTentatives: Attempt[];
}

interface CourseAnalytics {
  id: string;
  titre: string;
  imageUrl?: string;
  statut: string;
  datePublication?: string;
  dureeEstimee?: number;
  certification?: {
    id: string;
    nom: string;
    codeExamen?: string;
  };
  totaux: {
    totalInscrits: number;
    progressionMoyenne: number;
    totalModules: number;
    totalSimulations: number;
    totalTentatives: number;
    tauxReussiteSimulations: number;
  };
  inscrits: Learner[];
  simulationsStats: SimulationStat[];
}

export function InstructorAnalyticsView() {
  const [analytics, setAnalytics] = useState<CourseAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');
  const [searchStudent, setSearchStudent] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    apiFetch('/cours/formateur/analytics')
      .then((data) => {
        if (Array.isArray(data)) {
          setAnalytics(data);
        }
      })
      .catch((err) => {
        setError(err.message || 'Erreur lors du chargement des statistiques.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 bg-[#080d1a] border border-slate-800 rounded-3xl max-w-5xl mx-auto">
        <span className="w-10 h-10 border-4 border-slate-800 border-t-cyan-400 rounded-full animate-spin inline-block mb-3" />
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
          Chargement des données de suivi...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-[#080d1a] border border-slate-800 rounded-3xl max-w-2xl mx-auto space-y-4">
        <p className="text-sm font-bold text-rose-500">{error}</p>
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className="p-12 text-center bg-[#080d1a] border border-slate-800 rounded-3xl max-w-3xl mx-auto space-y-3">
        <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white">Aucun cours trouvé</h3>
        <p className="text-xs text-slate-400">
          Vous n’avez pas encore créé de cours. Créez un cours pour voir les statistiques d’inscription et de progression.
        </p>
      </div>
    );
  }

  // Active course dataset or aggregated dataset
  const activeCourse =
    selectedCourseId !== 'ALL'
      ? analytics.find((c) => c.id === selectedCourseId)
      : null;

  // Global Totals
  const totalInscritsGlobal = analytics.reduce((sum, c) => sum + c.totaux.totalInscrits, 0);
  const totalSimulationsGlobal = analytics.reduce((sum, c) => sum + c.totaux.totalSimulations, 0);
  const totalTentativesGlobales = analytics.reduce((sum, c) => sum + c.totaux.totalTentatives, 0);
  
  const totalInscritsWithProgress = analytics.flatMap((c) => c.inscrits);
  const progressionMoyenneGlobale =
    totalInscritsWithProgress.length > 0
      ? Math.round(
          totalInscritsWithProgress.reduce((sum, i) => sum + i.progression, 0) /
            totalInscritsWithProgress.length
        )
      : 0;

  const allTentatives = analytics.flatMap((c) =>
    c.simulationsStats.flatMap((s) => s.dernieresTentatives)
  );
  const reussisTentativesCount = allTentatives.filter((t) => t.reussi).length;
  const tauxReussiteGlobal =
    allTentatives.length > 0
      ? Math.round((reussisTentativesCount / allTentatives.length) * 100)
      : 0;

  // Selected view list of learners
  const learnersToDisplay = activeCourse
    ? activeCourse.inscrits
    : totalInscritsWithProgress;

  const filteredLearners = learnersToDisplay.filter((l) => {
    const query = searchStudent.toLowerCase().trim();
    if (!query) return true;
    const fullName = `${l.apprenant.prenom} ${l.apprenant.nom}`.toLowerCase();
    return fullName.includes(query) || l.apprenant.email.toLowerCase().includes(query);
  });

  // Selected view list of simulations
  const simulationsToDisplay = activeCourse
    ? activeCourse.simulationsStats
    : analytics.flatMap((c) => c.simulationsStats);

  return (
    <div className="space-y-8 text-left text-white animate-fadeIn">
      
      {/* SELECTIONS & HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#080d1a] border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Suivi des Apprenants & Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Consultez en temps réel les inscriptions, la progression par module et les scores aux simulations d’examen.
          </p>
        </div>

        {/* Course Filter Dropdown */}
        <div className="relative w-full md:w-72 shrink-0">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-white text-xs font-bold outline-none cursor-pointer hover:bg-slate-900 transition-all"
          >
            <option value="ALL">Tous mes cours ({analytics.length})</option>
            {analytics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titre} ({c.totaux.totalInscrits} inscrits)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-950/40 border border-blue-800/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white block leading-tight">
              {activeCourse ? activeCourse.totaux.totalInscrits : totalInscritsGlobal}
            </span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
              Apprenants Inscrits
            </span>
          </div>
        </div>

        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white block leading-tight">
              {activeCourse ? activeCourse.totaux.progressionMoyenne : progressionMoyenneGlobale}%
            </span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
              Progression Moyenne
            </span>
          </div>
        </div>

        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white block leading-tight">
              {activeCourse ? activeCourse.totaux.totalTentatives : totalTentativesGlobales}
            </span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
              Passages de Simulations
            </span>
          </div>
        </div>

        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white block leading-tight">
              {activeCourse ? activeCourse.totaux.tauxReussiteSimulations : tauxReussiteGlobal}%
            </span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
              Taux de Réussite
            </span>
          </div>
        </div>
      </div>

      {/* SECTION TABLEAU DES APPRENANTS */}
      <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">
              Liste des Apprenants & Progression
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Visualisez le niveau d’avancement de chaque participant module par module.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder="Rechercher un apprenant..."
              className="w-full pl-10 pr-4 py-2 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-white placeholder-slate-500 text-xs font-semibold outline-none"
            />
          </div>
        </div>

        {filteredLearners.length === 0 ? (
          <div className="py-12 text-center border border-slate-800/60 rounded-2xl bg-[#020617]/50 space-y-2">
            <p className="text-xs font-bold text-slate-400">Aucun apprenant inscrit à afficher.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Apprenant</th>
                  <th className="py-3 px-4">Date d'inscription</th>
                  <th className="py-3 px-4">Modules Complétés</th>
                  <th className="py-3 px-4">Progression Globale</th>
                  <th className="py-3 px-4 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredLearners.map((item) => {
                  const isFinished = item.progression >= 100;
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-950 border border-blue-800/50 flex items-center justify-center text-cyan-400 font-bold overflow-hidden shrink-0">
                            {item.apprenant.avatar ? (
                              <img src={item.apprenant.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span>{item.apprenant.prenom[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-tight">
                              {item.apprenant.prenom} {item.apprenant.nom}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {item.apprenant.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-medium">
                        {new Date(item.dateInscription).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-bold">
                        {item.modulesCompletes} / {item.totalModules} modules
                      </td>
                      <td className="py-3.5 px-4 w-48">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-cyan-400">{item.progression}%</span>
                          </div>
                          <div className="w-full h-2 bg-[#020617] rounded-full overflow-hidden border border-slate-800">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isFinished ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-cyan-500'
                              }`}
                              style={{ width: `${item.progression}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                            isFinished
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                              : item.progression > 0
                              ? 'bg-blue-950/60 text-cyan-400 border-blue-800/50'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {isFinished ? 'Terminé' : item.progression > 0 ? 'En cours' : 'Non démarré'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION ANLYTIQUE DES SIMULATIONS & EXAMENS BLANCS */}
      <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Statistiques des Simulations d'Examens Blancs</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Résultats et taux de réussite obtenus par les apprenants sur les questionnaires d’entraînement.
          </p>
        </div>

        {simulationsToDisplay.length === 0 ? (
          <div className="py-12 text-center border border-slate-800/60 rounded-2xl bg-[#020617]/50 space-y-2">
            <p className="text-xs font-bold text-slate-400">Aucune simulation d'examen enregistrée pour ces cours.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {simulationsToDisplay.map((sim) => (
              <div
                key={sim.id}
                className="bg-[#020617] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">{sim.titre}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Durée: {sim.duree} min · Score min requis: {sim.scoreMinimal} pts
                    </span>
                  </div>
                  <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-amber-950/60 text-amber-400 border border-amber-800/50 rounded-full shrink-0">
                    {sim.totalTentatives} passage{sim.totalTentatives > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-center">
                  <div className="p-2.5 bg-[#080d1a] border border-slate-800 rounded-xl">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Score Moyen</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{sim.scoreMoyen} pts</span>
                  </div>
                  <div className="p-2.5 bg-[#080d1a] border border-slate-800 rounded-xl">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Meilleur Score</span>
                    <span className="text-sm font-bold text-cyan-400 mt-0.5 block">{sim.meilleurScore} pts</span>
                  </div>
                  <div className="p-2.5 bg-[#080d1a] border border-slate-800 rounded-xl">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Taux Réussite</span>
                    <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{sim.tauxReussite}%</span>
                  </div>
                </div>

                {/* Derniers passages */}
                {sim.dernieresTentatives.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      Derniers passages des apprenants :
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {sim.dernieresTentatives.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#080d1a] border border-slate-800/50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">
                              {t.utilisateur.prenom} {t.utilisateur.nom}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 font-medium text-[11px]">
                              {t.score} pts
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded ${
                                t.reussi
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                                  : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                              }`}
                            >
                              {t.reussi ? 'Réussi' : 'Échoué'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
