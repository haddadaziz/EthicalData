import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from '@/components/icons';
import { useToast } from '@/context/ToastContext';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function ServiceFormModal({ isOpen, onClose, onSuccess, initialData }: ServiceFormModalProps) {
  const { showToast } = useToast();
  const [activeLang, setActiveLang] = useState<'FR' | 'AR' | 'EN'>('FR');

  const [titre, setTitre] = useState('');
  const [titreAr, setTitreAr] = useState('');
  const [titreEn, setTitreEn] = useState('');

  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');

  const [categorie, setCategorie] = useState('INFOGERANCE');
  const [statut, setStatut] = useState<'ACTIF' | 'INACTIF'>('ACTIF');

  useEffect(() => {
    if (initialData) {
      setTitre(initialData.titre || '');
      setTitreAr(initialData.titreAr || '');
      setTitreEn(initialData.titreEn || '');
      setDescription(initialData.description || '');
      setDescriptionAr(initialData.descriptionAr || '');
      setDescriptionEn(initialData.descriptionEn || '');
      setCategorie(initialData.categorie || 'INFOGERANCE');
      setStatut(initialData.statut || 'ACTIF');
    } else {
      setTitre('');
      setTitreAr('');
      setTitreEn('');
      setDescription('');
      setDescriptionAr('');
      setDescriptionEn('');
      setCategorie('INFOGERANCE');
      setStatut('ACTIF');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(initialData ? 'Service mis à jour avec succès (FR/AR/EN)' : 'Nouveau service créé avec succès (FR/AR/EN)', 'success');
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-left shadow-2xl space-y-6 my-8"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-black text-white">
                {initialData ? 'Éditer le Service IT (Multilingue)' : 'Ajouter un Nouveau Service IT'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Édition simultanée des fiches en Français, Arabe et Anglais</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Onglets Multilingues FR / AR / EN */}
          <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveLang('FR')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeLang === 'FR' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                🇫🇷 Français (FR)
              </button>
              <button
                type="button"
                onClick={() => setActiveLang('AR')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeLang === 'AR' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                🇲🇦 العربية (AR)
              </button>
              <button
                type="button"
                onClick={() => setActiveLang('EN')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeLang === 'EN' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                🇬🇧 English (EN)
              </button>
            </div>
            <span className="text-[10px] text-cyan-400 font-bold px-3 py-1 bg-cyan-950/40 rounded-lg border border-cyan-800/40 hidden sm:inline">
              Mode Multilingue Actif
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Titre du Service par langue */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Titre du Service ({activeLang}) *
              </label>
              {activeLang === 'FR' && (
                <input type="text" required value={titre} onChange={(e) => setTitre(e.target.value)}
                  placeholder="Infogérance & Supervision Cloud 24/7"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-blue-500" />
              )}
              {activeLang === 'AR' && (
                <input type="text" value={titreAr} onChange={(e) => setTitreAr(e.target.value)} dir="rtl"
                  placeholder="إدارة وتأمين البنية التحتية 24/7"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-cyan-500" />
              )}
              {activeLang === 'EN' && (
                <input type="text" value={titreEn} onChange={(e) => setTitreEn(e.target.value)}
                  placeholder="24/7 Managed Cloud Services"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-cyan-500" />
              )}
            </div>

            {/* Description du Service par langue */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                Description détaillée ({activeLang}) *
              </label>
              {activeLang === 'FR' && (
                <textarea rows={4} required value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description complète des engagements et prestations en Français..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-blue-500 resize-none" />
              )}
              {activeLang === 'AR' && (
                <textarea rows={4} value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} dir="rtl"
                  placeholder="الوصف الكامل للخدمة باللغة العربية..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-cyan-500 resize-none" />
              )}
              {activeLang === 'EN' && (
                <textarea rows={4} value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Full detailed service description in English..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-cyan-500 resize-none" />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Catégorie Service</label>
                <select value={categorie} onChange={(e) => setCategorie(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none">
                  <option value="INFOGERANCE">Infogérance & Cloud</option>
                  <option value="INTEGRATION">Intégration Systèmes & Réseaux</option>
                  <option value="PROFESSIONNELS">Services Professionnels IT</option>
                  <option value="SOLUTION_IT">Solution IT globale</option>
                  <option value="PORTAGE">Portage Salarial IT</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Statut du Service</label>
                <select value={statut} onChange={(e) => setStatut(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm outline-none">
                  <option value="ACTIF">Actif (Visible Vitrine)</option>
                  <option value="INACTIF">Inactif (Masqué)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer">
                Annuler
              </button>
              <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{initialData ? 'Enregistrer les 3 versions' : 'Créer le service multilingue'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
