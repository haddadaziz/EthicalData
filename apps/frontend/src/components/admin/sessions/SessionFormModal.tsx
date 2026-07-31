"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Check, ChevronDown, BookOpen } from '@/components/icons';
import { useToast } from '@/context/ToastContext';
import { apiFetch } from '@/lib/api';

interface CourseInfo {
  id: string;
  titre: string;
}

interface FormateurOption {
  id: string;
  prenom: string;
  nom: string;
  avatar?: string | null;
}

interface SessionFormData {
  id?: string;
  titre: string;
  description?: string | null;
  dateDebut: string;
  dateFin?: string | null;
  maxPlaces?: number | null;
  placesOccupees: number;
  statut: 'OUVERTE' | 'COMPLETE' | 'CLOTUREE';
  teamsLink?: string | null;
  coursId?: string | null;
  formateurId: string;
}

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingSession?: SessionFormData | null;
  coursesList: CourseInfo[];
}

function toLocalInput(iso?: string | null) {  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SessionFormModal({ isOpen, onClose, onSaved, editingSession, coursesList }: SessionFormModalProps) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [maxPlaces, setMaxPlaces] = useState<string>('');
  const [placesOccupees, setPlacesOccupees] = useState<number>(0);
  const [statut, setStatut] = useState<'OUVERTE' | 'COMPLETE' | 'CLOTUREE'>('OUVERTE');
  const [teamsLink, setTeamsLink] = useState('');
  const [coursId, setCoursId] = useState('');
  const [formateurId, setFormateurId] = useState('');

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [trainerDropdownOpen, setTrainerDropdownOpen] = useState(false);
  const [trainerSearchQuery, setTrainerSearchQuery] = useState('');
  const [trainersList, setTrainersList] = useState<FormateurOption[]>([]);

  const isEditing = !!editingSession;

  useEffect(() => {
    if (isOpen) {
      if (editingSession) {
        setTitre(editingSession.titre);
        setDescription(editingSession.description || '');
        setDateDebut(toLocalInput(editingSession.dateDebut));
        setDateFin(toLocalInput(editingSession.dateFin));
        setMaxPlaces(editingSession.maxPlaces != null ? String(editingSession.maxPlaces) : '');
        setPlacesOccupees(editingSession.placesOccupees || 0);
        setStatut(editingSession.statut);
        setTeamsLink(editingSession.teamsLink || '');
        setCoursId(editingSession.coursId || '');
        setFormateurId(editingSession.formateurId);
      } else {
        setTitre('');
        setDescription('');
        setDateDebut('');
        setDateFin('');
        setMaxPlaces('');
        setPlacesOccupees(0);
        setStatut('OUVERTE');
        setTeamsLink('');
        setCoursId('');
        setFormateurId('');
      }
      setError(null);

      apiFetch('/users')
        .then((usersData: any) => {
          if (Array.isArray(usersData) && usersData.length > 0) {
            const mapped: FormateurOption[] = usersData
              .filter((u: any) => !u.roles || u.roles.some((r: any) => r.nom === 'FORMATEUR' || r.nom === 'SUPER_ADMIN' || r.nom === 'ADMIN'))
              .map((u: any) => ({
                id: u.id,
                prenom: u.prenom || 'Formateur',
                nom: u.nom || '',
                avatar: u.avatar || null,
              }));
            setTrainersList(mapped);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, editingSession]);

  if (!isOpen) return null;

  const selectedCourse = coursesList.find(c => c.id === coursId);
  const selectedTrainer = trainersList.find(t => t.id === formateurId);
  const filteredTrainers = trainersList.filter(t =>
    `${t.prenom} ${t.nom}`.toLowerCase().includes(trainerSearchQuery.toLowerCase().trim())
  );

  const handleSave = async () => {
    if (!titre.trim()) { setError('Veuillez saisir un titre pour la session.'); return; }
    if (!dateDebut) { setError('La date et l\'heure de la session sont obligatoires.'); return; }
    if (!formateurId) { setError('Veuillez affecter un formateur à la session.'); return; }
    if (dateDebut && dateFin && new Date(dateDebut) >= new Date(dateFin)) { setError('La date de fin doit être postérieure à la date de début.'); return; }

    setSaving(true); setError(null);
    try {
      const body = {
        titre,
        description: description || undefined,
        dateDebut: new Date(dateDebut).toISOString(),
        dateFin: dateFin ? new Date(dateFin).toISOString() : undefined,
        maxPlaces: maxPlaces ? Number(maxPlaces) : undefined,
        placesOccupees,
        statut,
        teamsLink: teamsLink || undefined,
        coursId: coursId ? Number(coursId) : null,
        formateurId: Number(formateurId),
      };
      if (isEditing && editingSession) {
        await apiFetch(`/sessions/${editingSession.id}`, { method: 'PATCH', body });
      } else {
        await apiFetch('/sessions', { method: 'POST', body });
      }
      showToast(isEditing ? 'Session modifiée avec succès' : 'Session planifiée avec succès', 'success');
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
        className="bg-[#020617] border border-slate-800/80 w-full max-w-xl rounded-[32px] shadow-2xl relative z-10 flex flex-col md:max-h-[90vh] max-h-none overflow-visible md:overflow-hidden will-change-auto my-auto"
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#080d1a] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-950/30 border-blue-800/50 text-blue-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-black text-white leading-tight">
                {isEditing ? 'Modifier la session' : 'Planifier une session'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Modifiez les paramètres de la session live.' : 'Session live, formateur affecté, places et statut.'}
              </p>
            </div>
          </div>
          <button onClick={() => { if (!saving) onClose(); }} disabled={saving}
            className="p-2 hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-xl transition-all cursor-pointer disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto text-left">
          {error && (
            <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold">{error}</div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Titre de la session *</label>
            <input type="text" required value={titre} onChange={e => setTitre(e.target.value)}
              placeholder="Ex : Révision live Azure AZ-900"
              className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Thèmes abordés, prérequis, déroulé de la session..."
              className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all resize-none h-16" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Formation associée (optionnel)</label>
            <div className="relative">
              <button type="button" onClick={() => { setCourseDropdownOpen(!courseDropdownOpen); setTrainerDropdownOpen(false); }}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold cursor-pointer">
                <span className="flex items-center gap-2 truncate">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {selectedCourse ? selectedCourse.titre : 'Aucune formation (session indépendante)'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${courseDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {courseDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCourseDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-[#080d1a] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
                    <button type="button"
                      onClick={() => { setCoursId(''); setCourseDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-left transition-colors hover:bg-slate-800/30 cursor-pointer ${!coursId ? 'bg-slate-900/50 text-white' : 'text-slate-400'}`}>
                      <span className="truncate">Aucune formation (session indépendante)</span>
                      {!coursId && <Check className="w-3.5 h-3.5 text-amber-400 ml-auto shrink-0" />}
                    </button>
                    <div className="border-t border-slate-800" />
                    <div className="max-h-56 overflow-y-auto">
                      {coursesList.map(c => (
                        <button key={c.id} type="button"
                          onClick={() => { setCoursId(c.id); setCourseDropdownOpen(false); }}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-left transition-colors hover:bg-slate-800/30 cursor-pointer ${coursId === c.id ? 'bg-slate-900/50 text-white' : 'text-slate-400'}`}>
                          <span className="truncate">{c.titre}</span>
                          {coursId === c.id && <Check className="w-3.5 h-3.5 text-amber-400 ml-auto shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Formateur affecté *</label>
            <div className="relative">
              <button type="button" onClick={() => { setTrainerDropdownOpen(!trainerDropdownOpen); setCourseDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold cursor-pointer">
                {selectedTrainer?.avatar ? (
                  <img src={selectedTrainer.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                    {(selectedTrainer?.prenom?.[0] || 'F')}
                  </div>
                )}
                <span className="truncate">{selectedTrainer ? `${selectedTrainer.prenom} ${selectedTrainer.nom}` : 'Sélectionner un formateur'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ml-auto shrink-0 ${trainerDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {trainerDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setTrainerDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-[#080d1a] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-slate-800">
                      <input type="text" value={trainerSearchQuery} onChange={e => setTrainerSearchQuery(e.target.value)}
                        placeholder="Rechercher un formateur par nom..."
                        className="w-full px-3 py-2 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-lg text-white text-xs outline-none transition-all font-semibold" />
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {filteredTrainers.length === 0 ? (
                        <p className="px-4 py-4 text-xs text-slate-500 font-bold text-center">Aucun formateur trouvé</p>
                      ) : filteredTrainers.map(t => (
                        <button key={t.id} type="button"
                          onClick={() => { setFormateurId(t.id); setTrainerDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-left transition-colors hover:bg-slate-800/30 cursor-pointer ${formateurId === t.id ? 'bg-slate-900/50 text-white' : 'text-slate-400'}`}>
                          {t.avatar ? (
                            <img src={t.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                              {t.prenom?.[0] || 'F'}
                            </div>
                          )}
                          <span className="truncate">{t.prenom} {t.nom}</span>
                          {formateurId === t.id && <Check className="w-3.5 h-3.5 text-amber-400 ml-auto shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Début *</label>
              <input type="datetime-local" required value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Fin</label>
              <input type="datetime-local" value={dateFin} onChange={e => setDateFin(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Places disponibles</label>
              <input type="number" min={1} value={maxPlaces} onChange={e => setMaxPlaces(e.target.value)}
                placeholder="Illimité"
                className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Places occupées</label>
              <input type="number" min={0} value={placesOccupees} onChange={e => setPlacesOccupees(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Statut</label>
              <select value={statut} onChange={e => setStatut(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold cursor-pointer">
                <option value="OUVERTE">Ouverte</option>
                <option value="COMPLETE">Complète</option>
                <option value="CLOTUREE">Clôturée</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Lien Teams / Visio</label>
              <input type="text" value={teamsLink} onChange={e => setTeamsLink(e.target.value)}
                placeholder="https://teams.microsoft.com/..."
                className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold" />
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 shrink-0 bg-[#020617]">
          <div className="pt-5 border-t border-slate-800/80 flex justify-end gap-3">
            <button type="button" onClick={() => { if (!saving) onClose(); }} disabled={saving}
              className="px-5 py-3 bg-slate-900/50 hover:bg-rose-950/30 hover:text-rose-500 hover:border-rose-900/50 border border-transparent text-slate-400 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs uppercase tracking-wider">Annuler</button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/20 font-black rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
              {saving ? <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              {isEditing ? 'Enregistrer' : 'Planifier la session'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
