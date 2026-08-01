"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Award, TrendingUp, Download, ArrowUpRight, Video, BookOpen, BarChart2, PieChart, RefreshCw, CheckCircle, Calendar, Shield } from '@/components/icons';
import { useToast } from '../../../context/ToastContext';

export default function AdminReportingPage() {
  const { showToast } = useToast();
  const [period, setPeriod] = useState<'7d' | '30d' | 'ytd' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INSCRIPTIONS' | 'REVENU' | 'REUSSITE' | 'SESSIONS'>('OVERVIEW');
  const [exporting, setExporting] = useState(false);

  // Données analytiques enrichies
  const stats = {
    totalInscriptions: 1248,
    inscriptionsGrowth: 18.5,
    chiffreAffairesMAD: 485900,
    caGrowth: 24.2,
    tauxReussite: 91.4,
    reussiteGrowth: 4.2,
    sessionsFormationsActives: 14,
    placesReserveesRatio: 88,
    panierMoyenMAD: 2450,
  };

  const inscriptionsByCertif = [
    { certif: "Microsoft Azure (AZ-900 & AZ-500)", count: 430, percentage: 34.5, color: "bg-blue-500" },
    { certif: "AWS Solutions Architect (SAA-C03)", count: 312, percentage: 25.0, color: "bg-cyan-400" },
    { certif: "Palo Alto Networks (PCNSA)", count: 240, percentage: 19.2, color: "bg-purple-500" },
    { certif: "PECB ISO 27001 Lead Implementer", count: 156, percentage: 12.5, color: "bg-emerald-500" },
    { certif: "CompTIA Security+ (SY0-701)", count: 110, percentage: 8.8, color: "bg-amber-400" },
  ];

  const topSessions = [
    {
      id: 1,
      titre: "Microsoft Azure Fundamentals (AZ-900)",
      categorie: "Cloud Computing",
      formateur: "Leila Naciri",
      format: "Formation Visioconférence Live Teams",
      inscrits: 12,
      placesMax: 12,
      remplissage: 100,
      caMAD: 42000,
      tauxReussite: "94%",
      badgeColor: "bg-cyan-950/60 text-cyan-300 border-cyan-800/60"
    },
    {
      id: 2,
      titre: "AWS Certified Solutions Architect Associate",
      categorie: "Cloud Architecture",
      formateur: "Aziz Haddad",
      format: "E-learning Autoformation 24/7",
      inscrits: 312,
      placesMax: "Illimité",
      remplissage: 95,
      caMAD: 93600,
      tauxReussite: "89%",
      badgeColor: "bg-cyan-950/60 text-cyan-300 border-cyan-800/60"
    },
    {
      id: 3,
      titre: "PECB ISO/IEC 27001 Lead Implementer",
      categorie: "Gouvernance IT & Sécurité",
      formateur: "Sofia Alami",
      format: "Formation Visioconférence Live Teams",
      inscrits: 10,
      placesMax: 10,
      remplissage: 100,
      caMAD: 90000,
      tauxReussite: "96%",
      badgeColor: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
    },
    {
      id: 4,
      titre: "Palo Alto PCNSA Security Engineer",
      categorie: "Network Security",
      formateur: "Dr. Tariq Berrada",
      format: "Formation Visioconférence Live Teams",
      inscrits: 14,
      placesMax: 15,
      remplissage: 93,
      caMAD: 84000,
      tauxReussite: "92%",
      badgeColor: "bg-purple-950/60 text-purple-300 border-purple-800/60"
    },
    {
      id: 5,
      titre: "CompTIA Security+ SY0-701 Fast-Track",
      categorie: "Cybersécurité Fondamentale",
      formateur: "Mehdi Kabbaj",
      format: "E-learning Autoformation 24/7",
      inscrits: 189,
      placesMax: "Illimité",
      remplissage: 82,
      caMAD: 56700,
      tauxReussite: "85%",
      badgeColor: "bg-amber-950/60 text-amber-300 border-amber-800/60"
    }
  ];

  const revenueBreakdown = [
    { source: "Formations E-learning 24/7", percentage: 48, amountMAD: 233232, color: "bg-cyan-500" },
    { source: "Sessions Live Visioconférence", percentage: 32, amountMAD: 155488, color: "bg-purple-500" },
    { source: "Vouchers D'Examen Constructeurs", percentage: 14, amountMAD: 68026, color: "bg-emerald-500" },
    { source: "Coaching 1-on-1 & Examens Blancs IA", percentage: 6, amountMAD: 29154, color: "bg-amber-500" },
  ];

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      showToast("Rapport analytique complet (Inscriptions, CA, Réussite) exporté au format CSV !", "success");
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-12 text-left">
      
      {/* Header & Filtres */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#080d1a] p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-white flex items-center gap-2.5">
              <BarChart2 className="w-6 h-6 text-cyan-400" />
              Reporting & Analytics Administrateur
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Supervision du Chiffre d'Affaires, Inscriptions, Taux de réussite aux examens et Sessions les plus demandées.
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

      {/* TABS DE NAVIGATION DES ANALYTICS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'OVERVIEW' ? 'bg-blue-600 text-white shadow-md' : 'bg-[#080d1a] border border-slate-800 text-slate-400 hover:text-white'}`}
        >
          <Activity className="w-4 h-4" />
          <span>Vue d'ensemble KPIs</span>
        </button>
        <button
          onClick={() => setActiveTab('INSCRIPTIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'INSCRIPTIONS' ? 'bg-cyan-600 text-white shadow-md' : 'bg-[#080d1a] border border-slate-800 text-slate-400 hover:text-white'}`}
        >
          <Users className="w-4 h-4" />
          <span>Inscriptions & Parcours</span>
        </button>
        <button
          onClick={() => setActiveTab('REVENU')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'REVENU' ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#080d1a] border border-slate-800 text-slate-400 hover:text-white'}`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Chiffre d'Affaires MAD</span>
        </button>
        <button
          onClick={() => setActiveTab('REUSSITE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'REUSSITE' ? 'bg-purple-600 text-white shadow-md' : 'bg-[#080d1a] border border-slate-800 text-slate-400 hover:text-white'}`}
        >
          <Award className="w-4 h-4" />
          <span>Taux de Réussite</span>
        </button>
        <button
          onClick={() => setActiveTab('SESSIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'SESSIONS' ? 'bg-amber-600 text-white shadow-md' : 'bg-[#080d1a] border border-slate-800 text-slate-400 hover:text-white'}`}
        >
          <Video className="w-4 h-4" />
          <span>Sessions Plus Demandées</span>
        </button>
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
            <p className="text-[10px] text-slate-400 font-medium mt-1">Apprenants actifs sur la plateforme</p>
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
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Chiffre d'Affaires</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{stats.chiffreAffairesMAD.toLocaleString('fr-FR')} MAD</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Panier moyen : {stats.panierMoyenMAD} MAD</p>
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
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Taux de Réussite Examen</p>
            <h3 className="text-2xl font-black text-purple-300 mt-1">{stats.tauxReussite}%</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Moyenne Readiness Score : 88%</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Répartition par Produit & Répartition Inscriptions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Chiffre d'affaires par canal */}
          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyan-400" />
                Répartition du Chiffre d'Affaires
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                Total : {stats.chiffreAffairesMAD.toLocaleString('fr-FR')} MAD
              </span>
            </div>

            <div className="space-y-3.5">
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

          {/* Inscriptions par parcours de certification */}
          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Répartition des Inscriptions par Certification
            </h3>

            <div className="space-y-3">
              {inscriptionsByCertif.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-bold p-2.5 bg-[#020617] rounded-xl border border-slate-800/60">
                  <span className="text-slate-300 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    {item.certif}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 font-black">{item.count} inscrits</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tableau des Sessions & Formations les Plus Demandées */}
        <div className="lg:col-span-7 bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  Top Sessions de Formation & Cours les Plus Demandés
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Classement par nombre d'inscriptions, taux de remplissage et revenus</p>
              </div>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full shrink-0">
                Top 5 Demandées
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-3 px-4">Formation & Formateur</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4 text-center">Inscrits / Capacité</th>
                    <th className="py-3 px-4 text-center">Taux Réussite</th>
                    <th className="py-3 px-4 text-right">Revenu Généré</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {topSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white max-w-[220px]">
                        <p className="truncate text-xs text-white font-bold">{session.titre}</p>
                        <p className="text-[10px] text-cyan-400 font-medium mt-0.5">👨‍🏫 {session.formateur}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border ${session.badgeColor}`}>
                          {session.format}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                        <span className="text-cyan-400 font-black">{session.inscrits}</span>
                        <span className="text-slate-500 font-medium"> / {session.placesMax}</span>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-cyan-400 h-full" style={{ width: `${session.remplissage}%` }} />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-[10px] font-black">
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

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Toutes les sessions affichées sont configurées avec formateurs certifiés
            </span>
            <span className="text-cyan-400 font-bold cursor-pointer hover:underline" onClick={handleExport}>
              Télécharger Rapport Complet PDF & CSV &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
