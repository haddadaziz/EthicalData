"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Award, Clock, BookOpen, ChevronRight, Play, FileText, CheckCircle2, Download, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const [certs, setCerts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalAttempts: 0, averageScore: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('Étudiant');

  useEffect(() => {
    const token = localStorage.getItem('token');
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
        const [certsData, statsData] = await Promise.all([
          apiFetch('/certifications'),
          apiFetch('/certifications/practice/stats')
        ]);
        setCerts(certsData);
        setStats(statsData);
      } catch (err) {
        console.error("Erreur de chargement du catalogue:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getLevelBadgeStyle = (niv: string) => {
    switch (niv) {
      case 'AVANCE':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'INTERMEDIAIRE':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'DEBUTANT':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-10 text-slate-800 text-left">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">Bonjour, {firstName} 👋</h1>
          <p className="text-slate-600 text-xs mt-1.5 font-semibold uppercase tracking-wider">
            Suivez vos entraînements et votre niveau de préparation aux examens.
          </p>
        </div>
      </div>

      {/* Grid de Statistiques Dynamiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Readiness Score Moyen */}
        <div className="bg-white shadow-sm backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 flex items-center justify-between min-h-[160px]">
          <div className="space-y-2 text-left">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Readiness Score Moyen</p>
            <h3 className="text-2xl font-black text-slate-950">
              {stats.averageScore >= 80 ? 'Prêt pour l\'examen' : 'En préparation'}
            </h3>
            <p className="text-xs text-slate-600 font-semibold">Seuil de réussite conseillé : 80%</p>
          </div>
          
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="absolute w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="38" className="stroke-slate-900 fill-none" strokeWidth="6" />
              <motion.circle 
                cx="48" 
                cy="48" 
                r="38" 
                className={`fill-none ${stats.averageScore >= 80 ? 'stroke-emerald-500' : 'stroke-red-600'}`}
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 38}
                initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - stats.averageScore / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center z-10">
              <span className="text-xl font-black text-slate-950">{stats.averageScore}%</span>
            </div>
          </div>
        </div>

        {/* Nombre de simulations passées */}
        <div className="bg-white shadow-sm backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Simulations Complétées</p>
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1 text-left">
            <h3 className="text-3xl font-black text-slate-950">{stats.totalAttempts}</h3>
            <p className="text-xs text-slate-450 font-semibold">Examens blancs passés en conditions réelles</p>
          </div>
        </div>

        {/* Chapitres et modules */}
        <div className="bg-white shadow-sm backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Formations du Catalogue</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1 text-left">
            <h3 className="text-3xl font-black text-slate-950">{certs.length}</h3>
            <p className="text-xs text-slate-450 font-semibold">Certifications professionnelles prêtes à réviser</p>
          </div>
        </div>

      </div>

      {/* Certifications et Fiches */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950 uppercase tracking-widest">Catalogue d'Entraînement</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-44 bg-white border border-slate-200/80 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : certs.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200/80 rounded-3xl text-slate-500 font-semibold">
              Aucune certification disponible.
            </div>
          ) : (
            <div className="space-y-4">
              {certs.map((cert) => {
                // Trouver le dernier score ou la tentative la plus haute pour cette certif
                const certAttempts = stats.history.filter((h: any) => h.certificationSlug === cert.slug);
                const hasTaken = certAttempts.length > 0;
                const bestScore = hasTaken ? Math.max(...certAttempts.map((h: any) => h.score)) : 0;

                return (
                  <div 
                    key={cert.id}
                    className="bg-white shadow-sm border border-slate-200/80 hover:border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between transition-all duration-300 group"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-2 shrink-0">
                        {cert.image ? (
                          <img src={cert.image} alt={cert.nom} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <Award className="w-8 h-8 text-slate-800" />
                        )}
                      </div>
                      <div className="text-left space-y-1">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getLevelBadgeStyle(cert.niveau)}`}>
                          {cert.niveau}
                        </span>
                        <h3 className="font-extrabold text-slate-950 text-base leading-snug group-hover:text-red-600 transition-colors">
                          {cert.nom}
                        </h3>
                        <p className="text-xs text-slate-450 font-semibold">{cert.codeExamen || 'Examen'}</p>
                      </div>
                    </div>

                    <div className="w-full sm:w-64 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500 font-medium">Meilleur Score</span>
                        <span className={`font-bold ${bestScore >= 80 ? 'text-emerald-400' : hasTaken ? 'text-amber-400' : 'text-slate-500'}`}>
                          {hasTaken ? `${bestScore}%` : 'Aucune tentative'}
                        </span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-slate-50 border border-slate-200/80 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${bestScore >= 80 ? 'bg-emerald-500' : 'bg-red-600'}`} 
                          style={{ width: `${bestScore}%` }} 
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{cert.dureeIndicative || 'Non spécifiée'}</span>
                        
                        <a 
                          href={`/dashboard/practice?cert=${cert.slug}`}
                          className="flex items-center gap-1.5 px-4.5 py-2 bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                          <span>S'entraîner</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Colonne Droite : Historique des tentatives de test de l'utilisateur */}
        <div className="space-y-6 text-left">
          <h2 className="text-lg font-black text-slate-950 uppercase tracking-widest">Dernières Tentatives</h2>
          
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4">
            {stats.history.length === 0 ? (
              <p className="text-xs text-slate-500 font-semibold text-center py-6">
                Aucun historique d'examen disponible. Vos tentatives apparaîtront ici.
              </p>
            ) : (
              <div className="space-y-3.5">
                {stats.history.slice(0, 4).map((attempt: any) => {
                  const passed = attempt.score >= 80;
                  const dateFormatee = new Date(attempt.datePassage).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short'
                  });

                  return (
                    <div 
                      key={attempt.id}
                      className="flex items-center justify-between p-3.5 bg-slate-50/40 border border-slate-200/80 rounded-2xl"
                    >
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-bold text-slate-800 truncate">{attempt.certificationName}</p>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>Le {dateFormatee}</span>
                        </div>
                      </div>
                      
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider shrink-0 ${
                        passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {attempt.score}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <a 
              href="/dashboard/practice"
              className="flex items-center justify-center gap-1 w-full py-3 border border-slate-200/80 hover:border-slate-200 bg-slate-50/20 hover:bg-slate-50 text-xs font-bold text-slate-600 hover:text-slate-950 rounded-xl transition-all uppercase tracking-wider cursor-pointer"
            >
              <span>Lancer un nouvel examen</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}