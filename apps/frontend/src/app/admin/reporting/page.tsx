"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Award, TrendingUp, Download, ArrowUpRight, Video, BookOpen, BarChart2, PieChart, RefreshCw } from '@/components/icons';
import { useToast } from '../../../context/ToastContext';

export default function AdminReportingPage() {
  const { showToast } = useToast();
  const [period, setPeriod] = useState<'7d' | '30d' | 'ytd' | 'all'>('30d');
  const [exporting, setExporting] = useState(false);

  // Données de KPI simulées basées sur les enregistrements réels
  const stats = {
    totalInscriptions: 1248,
    inscriptionsGrowth: 18.5,
    chiffreAffairesMAD: 485900,
    caGrowth: 24.2,
    tauxReussite: 84.6,
    reussiteGrowth: 3.1,
    sessionsFormationsActives: 14,
    placesReserveesRatio: 88, // 88% de taux de remplissage
  };

  const topSessions = [
    {
      id: 1,
      titre: "AWS Certified Solutions Architect Associate",
      categorie: "Cloud Computing",
      format: "E-learning Autoformation 24/7",
      inscrits: 312,
      placesMax: "Illimité",
      caMAD: 93600,
      tauxReussite: "89%",
      badgeColor: "bg-cyan-950/40 text-cyan-400 border-cyan-800/60"
    },
    {
      id: 2,
      titre: "Palo Alto PCNSA Security Engineer",
      categorie: "Network Security",
      format: "Formation Visioconférence Live Teams",
      inscrits: 24,
      placesMax: 25,
      caMAD: 84000,
      tauxReussite: "92%",
      badgeColor: "bg-purple-950/40 text-purple-300 border-purple-800/60"
    },
    {
      id: 3,
      titre: "Microsoft Azure Security Technologies (AZ-500)",
      categorie: "Cloud & Security",
      format: "E-learning Autoformation 24/7",
      inscrits: 205,
      placesMax: "Illimité",
      caMAD: 71750,
      tauxReussite: "82%",
      badgeColor: "bg-blue-950/40 text-blue-300 border-blue-800/60"
    },
    {
      id: 4,
      titre: "PECB ISO/IEC 27001 Lead Implementer",
      categorie: "Gouvernance IT & Sécurité",
      format: "Formation Visioconférence Live Teams",
      inscrits: 18,
      placesMax: 20,
      caMAD: 90000,
      tauxReussite: "95%",
      badgeColor: "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
    },
    {
      id: 5,
      titre: "CompTIA Security+ SY0-701 Fast-Track",
      categorie: "Cybersécurité Fondamentale",
      format: "E-learning Autoformation 24/7",
      inscrits: 189,
      placesMax: "Illimité",
      caMAD: 56700,
      tauxReussite: "79%",
      badgeColor: "bg-amber-950/40 text-amber-300 border-amber-800/60"
    }
  ];

  const revenueBreakdown = [
    { source: "Formations E-learning", percentage: 48, amountMAD: 233232, color: "bg-cyan-500" },
    { source: "Sessions Live Visioconférence", percentage: 32, amountMAD: 155488, color: "bg-purple-500" },
    { source: "Vouchers D'Examen Constructeurs", percentage: 14, amountMAD: 68026, color: "bg-emerald-500" },
    { source: "Packs Examens Blancs & Coaching", percentage: 6, amountMAD: 29154, color: "bg-amber-500" },
  ];

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      showToast("Rapport analytique exporté au format CSV avec succès !", "success");
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Filtres */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#080d1a] p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            <BarChart2 className="w-6 h-6 text-cyan-400" />
            Reporting & Key Performance Indicators (KPIs)
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Supervision du Chiffre d&apos;Affaires, Inscriptions, Taux de réussite et Sessions les plus demandées.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Sélecteur de Période */}
          <div className="bg-[#020617] border border-slate-800 rounded-2xl p-1 flex items-center gap-1">
            <button
              onClick={() => setPeriod('7d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${period === '7d' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              7 Jours
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${period === '30d' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              30 Jours
            </button>
            <button
              onClick={() => setPeriod('ytd')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${period === 'ytd' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Cette Année
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${period === 'all' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Tout
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Exporter Rapport (CSV)
          </button>
        </div>
      </div>

      {/* Cartes KPI Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Inscriptions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#080d1a] border border-blue-900/30 rounded-3xl p-6 relative overflow-hidden group hover:border-cyan-500/50 transition-all shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-cyan-950/50 text-cyan-400 border border-cyan-800/40">
              <Users className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[10px] font-black flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +{stats.inscriptionsGrowth}%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Inscriptions</p>
            <h3 className="text-2xl font-black text-white mt-1">{stats.totalInscriptions.toLocaleString('fr-FR')}</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Élèves inscrits aux cours & visios</p>
          </div>
        </motion.div>

        {/* Chiffre d'Affaires MAD */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#080d1a] border border-blue-900/30 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[10px] font-black flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +{stats.caGrowth}%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Chiffre d&apos;Affaires</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{stats.chiffreAffairesMAD.toLocaleString('fr-FR')} MAD</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Formations, Vouchers & Examens</p>
          </div>
        </motion.div>

        {/* Taux de Réussite Global */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#080d1a] border border-blue-900/30 rounded-3xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-purple-950/50 text-purple-400 border border-purple-800/40">
              <Award className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[10px] font-black flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +{stats.reussiteGrowth}%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Taux de Réussite</p>
            <h3 className="text-2xl font-black text-purple-300 mt-1">{stats.tauxReussite}%</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Moyenne aux examens blancs</p>
          </div>
        </motion.div>

        {/* Taux de Remplissage Sessions Live */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#080d1a] border border-blue-900/30 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-amber-950/50 text-amber-400 border border-amber-800/40">
              <Video className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 text-[10px] font-black">
              {stats.placesReserveesRatio}% Rempli
            </span>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sessions Live Actives</p>
            <h3 className="text-2xl font-black text-amber-300 mt-1">{stats.sessionsFormationsActives} Sessions</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Formateurs affectés en Live Teams</p>
          </div>
        </motion.div>
      </div>

      {/* Grid 2 colonnes: Ventilation du Revenu & Analytics Visio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition des Revenus par Produit */}
        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              Ventilation du Chiffre d&apos;Affaires
            </h3>
          </div>

          <div className="space-y-4">
            {revenueBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5 bg-[#020617] p-3.5 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    {item.source}
                  </span>
                  <span className="text-white font-black">{item.amountMAD.toLocaleString('fr-FR')} MAD</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                </div>
                <div className="flex justify-end">
                  <span className="text-[10px] text-slate-500 font-semibold">{item.percentage}% du total</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tableau des Sessions & Formations les Plus Demandées */}
        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Top Sessions & Formations les Plus Demandées
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Formations ayant généré le plus d&apos;inscriptions et de revenu</p>
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 px-3 py-1 rounded-full">
              Top 5 Performeurs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Formation & Catégorie</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4 text-center">Inscrits / Capacité</th>
                  <th className="py-3 px-4 text-center">Taux Réussite</th>
                  <th className="py-3 px-4 text-right">Revenu Généré</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {topSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white max-w-[240px]">
                      <p className="truncate text-xs text-white font-bold">{session.titre}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{session.categorie}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border ${session.badgeColor}`}>
                        {session.format}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                      <span className="text-cyan-400 font-black">{session.inscrits}</span>
                      <span className="text-slate-500 font-medium"> / {session.placesMax}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-[10px] font-black">
                        {session.tauxReussite}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-400">
                      {session.caMAD.toLocaleString('fr-FR')} MAD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
