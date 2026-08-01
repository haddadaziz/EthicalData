'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Check, Save, RefreshCw, Layers } from '@/components/icons';
import { useToast } from '@/context/ToastContext';
import { useLanguage, Language } from '@/context/LanguageContext';

export function AdminTrilingualLanguageSection() {
  const { showToast } = useToast();
  const { language, setLanguage } = useLanguage();
  
  const [defaultLang, setDefaultLang] = useState<Language>('fr');
  const [enabledFR, setEnabledFR] = useState(true);
  const [enabledAR, setEnabledAR] = useState(true);
  const [enabledEN, setEnabledEN] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSaveTrilingualConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Configuration du site trilingue (FR / AR / EN) enregistrée avec succès !", "success");
    }, 800);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSaveTrilingualConfig}
      className="bg-[#080d1a] border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm text-left"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full text-cyan-400 text-[10px] font-black uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5" />
            <span>Gestion Multilingue (Section 8)</span>
          </div>
          <h3 className="text-base font-black text-white tracking-tight pt-1">Configuration du Site Trilingue (FR / AR / EN)</h3>
          <p className="text-xs text-slate-400 font-medium">
            Gérez les langues actives, la langue par défaut et la direction de texte (LTR/RTL) pour l&apos;ensemble de la plateforme.
          </p>
        </div>

        <span className="hidden sm:inline-flex px-3 py-1.5 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-bold rounded-full">
          3 Langues Opérationnelles
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* LANGUE FRANÇAISE */}
        <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🇫🇷</span>
              <span className="text-xs font-black text-white">Français (FR)</span>
            </div>
            <span className="text-[10px] font-bold text-cyan-400 px-2 py-0.5 bg-cyan-950 border border-cyan-800/60 rounded">
              LTR
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Langue principale du contenu et des formations.</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500 font-bold">Actif sur le site</span>
            <button
              type="button"
              onClick={() => setEnabledFR(!enabledFR)}
              className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                enabledFR ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>

        {/* LANGUE ARABE */}
        <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🇲🇦</span>
              <span className="text-xs font-black text-white">العربية (AR)</span>
            </div>
            <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 bg-amber-950 border border-amber-800/60 rounded">
              RTL
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Interface adaptée aux apprenants francophones & arabophones.</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500 font-bold">Actif sur le site</span>
            <button
              type="button"
              onClick={() => setEnabledAR(!enabledAR)}
              className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                enabledAR ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>

        {/* LANGUE ANGLAISE */}
        <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🇬🇧</span>
              <span className="text-xs font-black text-white">English (EN)</span>
            </div>
            <span className="text-[10px] font-bold text-cyan-400 px-2 py-0.5 bg-cyan-950 border border-cyan-800/60 rounded">
              LTR
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Certifications & vouchers d&apos;examens internationaux.</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500 font-bold">Actif sur le site</span>
            <button
              type="button"
              onClick={() => setEnabledEN(!enabledEN)}
              className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                enabledEN ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>

      </div>

      <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <label className="text-xs font-bold text-white">Langue par défaut de la plateforme</label>
          <p className="text-[11px] text-slate-400">Langue appliquée automatiquement aux nouveaux visiteurs du site.</p>
        </div>

        <select
          value={defaultLang}
          onChange={(e) => setDefaultLang(e.target.value as Language)}
          className="p-2.5 bg-[#080d1a] border border-slate-800 focus:border-cyan-500 rounded-xl text-white text-xs font-bold outline-none cursor-pointer"
        >
          <option value="fr">🇫🇷 Français (FR)</option>
          <option value="ar">🇲🇦 العربية (AR)</option>
          <option value="en">🇬🇧 English (EN)</option>
        </select>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Dictionnaire multilingue synchronisé (LanguageContext)</span>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Enregistrer les paramètres multilingues</span>
        </button>
      </div>
    </motion.form>
  );
}
