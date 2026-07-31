"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Tag, Check, ChevronDown } from '@/components/icons';
import { useToast } from '@/context/ToastContext';
import { apiFetch } from '@/lib/api';

interface PromotionFormData {
  id?: string;
  nom: string;
  description?: string | null;
  type: 'POURCENTAGE' | 'MONTANT';
  valeur: number;
  targetType: 'FORMATION' | 'VOUCHER' | 'PACK_EXAMEN_BLANC';
  targetId?: string | null;
  cibleNom?: string | null;
  dateDebut?: string | null;
  dateFin?: string | null;
  actif: boolean;
  isPublic?: boolean;
}

interface CourseInfo {
  id: string;
  titre: string;
}

interface PromotionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingPromo?: PromotionFormData | null;
  coursesList: CourseInfo[];
}

const TARGET_LABELS: Record<string, string> = {
  FORMATION: 'Formation',
  VOUCHER: "Voucher d'examen",
  PACK_EXAMEN_BLANC: "Pack d'examens blancs",
};

export function PromotionFormModal({ isOpen, onClose, onSaved, editingPromo, coursesList }: PromotionFormModalProps) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'POURCENTAGE' | 'MONTANT'>('POURCENTAGE');
  const [valeur, setValeur] = useState<number>(10);
  const [targetType, setTargetType] = useState<'FORMATION' | 'VOUCHER' | 'PACK_EXAMEN_BLANC'>('FORMATION');
  const [targetId, setTargetId] = useState('');
  const [cibleNom, setCibleNom] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [actif, setActif] = useState(true);
  const [isPublic, setIsPublic] = useState(true);

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);

  const isEditing = !!editingPromo;

  useEffect(() => {
    if (isOpen) {
      if (editingPromo) {
        setNom(editingPromo.nom);
        setDescription(editingPromo.description || '');
        setType(editingPromo.type);
        setValeur(editingPromo.valeur);
        setTargetType(editingPromo.targetType);
        setTargetId(editingPromo.targetId || '');
        setCibleNom(editingPromo.cibleNom || '');
        setDateDebut(editingPromo.dateDebut ? editingPromo.dateDebut.slice(0, 10) : '');
        setDateFin(editingPromo.dateFin ? editingPromo.dateFin.slice(0, 10) : '');
        setActif(editingPromo.actif);
        setIsPublic(editingPromo.isPublic ?? true);
      } else {
        setNom('');
        setDescription('');
        setType('POURCENTAGE');
        setValeur(10);
        setTargetType('FORMATION');
        setTargetId('');
        setCibleNom('');
        setDateDebut('');
        setDateFin('');
        setActif(true);
        setIsPublic(true);
      }
      setError(null);
    }
  }, [isOpen, editingPromo]);

  if (!isOpen) return null;

  const selectedCourse = coursesList.find(c => c.id === targetId);

  const handleSave = async () => {
    if (!nom.trim()) { setError('Veuillez saisir un nom pour la promotion.'); return; }
    if (!valeur || valeur <= 0) { setError('La valeur de la remise est obligatoire.'); return; }
    if (type === 'POURCENTAGE' && valeur > 100) { setError('Un pourcentage de remise ne peut pas dépasser 100%.'); return; }
    if (dateDebut && dateFin && new Date(dateDebut) > new Date(dateFin)) { setError('La date de début doit être antérieure à la date de fin.'); return; }

    setSaving(true); setError(null);
    try {
      const body = {
        nom,
        description: description || undefined,
        type,
        valeur,
        targetType,
        targetId: targetType === 'FORMATION' ? (targetId ? Number(targetId) : null) : null,
        cibleNom: targetType !== 'FORMATION' && cibleNom ? cibleNom : undefined,
        dateDebut: dateDebut || undefined,
        dateFin: dateFin || undefined,
        actif,
        isPublic,
      };
      if (isEditing && editingPromo) {
        await apiFetch(`/promotions/${editingPromo.id}`, { method: 'PATCH', body });
      } else {
        await apiFetch('/promotions', { method: 'POST', body });
      }
      showToast(isEditing ? 'Promotion modifiée avec succès' : 'Promotion créée avec succès', 'success');
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => { if (!saving) onClose(); }}
        className="fixed inset-0 bg-slate-900/80 will-change-auto"
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="bg-[#020617] border border-slate-800/80 w-full max-w-lg rounded-[32px] shadow-2xl relative z-10 flex flex-col md:max-h-[90vh] max-h-none overflow-visible md:overflow-hidden will-change-auto my-auto"
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#080d1a] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-950/30 border-amber-800/50 text-amber-400 flex items-center justify-center">
              {isEditing ? <Sparkles className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
            </div>
            <div className="text-left">
              <h2 className="text-xl font-black text-white leading-tight">
                {isEditing ? 'Modifier la promotion' : 'Nouvelle promotion'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Modifiez les paramètres de la remise.' : 'Configurez une remise sur une formation, un voucher ou un pack.'}
              </p>
            </div>
          </div>
          <button onClick={() => { if (!saving) { onClose(); } }} disabled={saving}
            className="p-2 hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-xl transition-all cursor-pointer disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto text-left">
          {error && (
            <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold">{error}</div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nom de la promotion *</label>
            <input type="text" required value={nom} onChange={e => setNom(e.target.value)}
              placeholder="Ex : -20% sur AZ-900"
              className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Description courte de la promotion..."
              className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all resize-none h-16" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Type de remise</label>
              <select value={type} onChange={e => { setType(e.target.value as any); if (e.target.value === 'POURCENTAGE' && valeur > 100) setValeur(10); }}
                className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold cursor-pointer">
                <option value="POURCENTAGE">Pourcentage (%)</option>
                <option value="MONTANT">Montant (MAD)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{type === 'POURCENTAGE' ? 'Valeur (%) *' : 'Valeur (MAD) *'}</label>
              <input type="number" required min={1} max={type === 'POURCENTAGE' ? 100 : undefined} value={valeur} onChange={e => setValeur(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cible de la remise</label>
            <div className="grid grid-cols-3 gap-2">
              {(['FORMATION', 'VOUCHER', 'PACK_EXAMEN_BLANC'] as const).map(t => (
                <button key={t} type="button" onClick={() => { setTargetType(t); setTargetId(''); }}
                  className={`px-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                    targetType === t
                      ? 'bg-amber-950/30 border-amber-800/60 text-amber-400'
                      : 'bg-[#080d1a] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}>
                  {TARGET_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {targetType === 'FORMATION' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Formation concernée</label>
              <div className="relative">
                <button type="button" onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold cursor-pointer">
                  <span className="truncate">{selectedCourse ? selectedCourse.titre : 'Toutes les formations'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${courseDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {courseDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCourseDropdownOpen(false)} />
                    <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-[#080d1a] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
                      <button type="button"
                        onClick={() => { setTargetId(''); setCourseDropdownOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-left transition-colors hover:bg-slate-800/30 cursor-pointer ${!targetId ? 'bg-slate-900/50 text-white' : 'text-slate-400'}`}>
                        <span className="truncate">Toutes les formations</span>
                        {!targetId && <Check className="w-3.5 h-3.5 text-amber-400 ml-auto shrink-0" />}
                      </button>
                      <div className="border-t border-slate-800" />
                      <div className="max-h-56 overflow-y-auto">
                        {coursesList.map(c => (
                          <button key={c.id} type="button"
                            onClick={() => { setTargetId(c.id); setCourseDropdownOpen(false); }}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-left transition-colors hover:bg-slate-800/30 cursor-pointer ${targetId === c.id ? 'bg-slate-900/50 text-white' : 'text-slate-400'}`}>
                            <span className="truncate">{c.titre}</span>
                            {targetId === c.id && <Check className="w-3.5 h-3.5 text-amber-400 ml-auto shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {(targetType === 'VOUCHER' || targetType === 'PACK_EXAMEN_BLANC') && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                {targetType === 'VOUCHER' ? "Libellé du voucher (opt.)" : "Libellé du pack (opt.)"}
              </label>
              <input type="text" value={cibleNom} onChange={e => setCibleNom(e.target.value)}
                placeholder={targetType === 'VOUCHER' ? "Ex : Voucher AZ-900" : "Ex : Pack 3 examens blancs Azure"}
                className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date de début</label>
              <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date de fin</label>
              <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3.5 bg-[#080d1a] border border-slate-800/80 rounded-xl">
              <div>
                <p className="text-xs font-black text-white">Activer</p>
                <p className="text-[10px] text-slate-400 font-semibold">Activation / désactivation</p>
              </div>
              <button type="button" onClick={() => setActif(!actif)}
                className={`relative w-12 h-6.5 rounded-full transition-colors cursor-pointer shrink-0 ${actif ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                <span className={`absolute top-0.5 w-5.5 h-5.5 rounded-full bg-white shadow transition-all ${actif ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-[#080d1a] border border-slate-800/80 rounded-xl">
              <div>
                <p className="text-xs font-black text-white">Public</p>
                <p className="text-[10px] text-slate-400 font-semibold">Visible par les utilisateurs</p>
              </div>
              <button type="button" onClick={() => setIsPublic(!isPublic)}
                className={`relative w-12 h-6.5 rounded-full transition-colors cursor-pointer shrink-0 ${isPublic ? 'bg-blue-600' : 'bg-slate-700'}`}>
                <span className={`absolute top-0.5 w-5.5 h-5.5 rounded-full bg-white shadow transition-all ${isPublic ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 shrink-0 bg-[#020617]">
          <div className="pt-5 border-t border-slate-800/80 flex justify-end gap-3">
            <button type="button" onClick={() => { if (!saving) onClose(); }} disabled={saving}
              className="px-5 py-3 bg-slate-900/50 hover:bg-rose-950/30 hover:text-rose-500 hover:border-rose-900/50 border border-transparent text-slate-400 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs uppercase tracking-wider">Annuler</button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-600/20 font-black rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
              {saving ? <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              {isEditing ? 'Enregistrer' : 'Créer la promotion'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
