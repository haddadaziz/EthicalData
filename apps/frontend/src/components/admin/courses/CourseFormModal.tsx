import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Edit, Upload, Clock, Users, PlusCircle, Trash2 } from '@/components/icons';
import { useToast } from '@/context/ToastContext';

interface CertificationInfo {
  id: string;
  nom: string;
  codeExamen: string;
  fournisseur?: { nom: string } | null;
}

interface CoursePayload {
  titre: string;
  description?: string | null;
  dureeEstimee?: number | null;
  imageUrl?: string | null;
  certificationId?: number | null;
  objectifs: string[];
  prerequis: string[];
  publicCible: string[];
  statut: 'BROUILLON' | 'PUBLIE' | 'ARCHIVE';
}

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CoursePayload) => Promise<void>;
  initialData?: (CoursePayload & { id?: string }) | null;
  certifications: CertificationInfo[];
  modalLoading: boolean;
  modalError: string | null;
  inline?: boolean;
  fullWidth?: boolean;
}

export const CourseFormModal = React.memo(function CourseFormModal({
  isOpen, onClose, onSubmit, initialData, certifications, modalLoading, modalError, inline, fullWidth
}: CourseFormModalProps) {
  const { showToast } = useToast();
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [dureeEstimee, setDureeEstimee] = useState<number>(10);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const [certificationId, setCertificationId] = useState('');
  const [statut, setStatut] = useState<'BROUILLON' | 'PUBLIE' | 'ARCHIVE'>('BROUILLON');
  const [objectifsList, setObjectifsList] = useState<string[]>(['']);
  const [prerequisList, setPrerequisList] = useState<string[]>(['']);
  const [publicCibleList, setPublicCibleList] = useState<string[]>(['']);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitre(initialData.titre);
        setDescription(initialData.description || '');
        setDureeEstimee(initialData.dureeEstimee || 10);
        setImageUrl(initialData.imageUrl || '');
        setCertificationId(initialData.certificationId?.toString() || '');
        setStatut(initialData.statut);
        setObjectifsList(initialData.objectifs?.length ? initialData.objectifs : ['']);
        setPrerequisList(initialData.prerequis?.length ? initialData.prerequis : ['']);
        setPublicCibleList(initialData.publicCible?.length ? initialData.publicCible : ['']);
      } else {
        setTitre('');
        setDescription('');
        setDureeEstimee(10);
        setImageUrl('');
        setCertificationId('');
        setStatut('BROUILLON');
        setObjectifsList(['']);
        setPrerequisList(['']);
        setPublicCibleList(['']);
      }
      setImageError(false);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isOpen && !inline) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, inline]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("L'image est trop grande. La taille maximale est de 2 Mo.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      titre,
      description: description || null,
      dureeEstimee: Number(dureeEstimee) || null,
      imageUrl: imageUrl || null,
      certificationId: certificationId ? Number(certificationId) : null,
      objectifs: objectifsList.filter(v => v.trim()),
      prerequis: prerequisList.filter(v => v.trim()),
      publicCible: publicCibleList.filter(v => v.trim()),
      statut,
    });
  };

  const handleAdd = useCallback((list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, label: string) => {
    if (list.length > 0 && list[list.length - 1].trim() === '') {
      showToast(`Remplissez d'abord le dernier champ "${label}".`, "error");
      return;
    }
    setter(prev => [...prev, '']);
  }, [showToast]);

  const handleRemove = useCallback((index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleChange = useCallback((index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const selectedCert = certifications.find(c => c.id === certificationId);

  const renderBody = () => (
    <form onSubmit={handleSubmit} className="flex-1 p-5 md:p-8 space-y-5 overflow-y-auto text-left">
      {modalError && (
        <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold">
          {modalError}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-5">
          {/* Titre */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Titre du cours</label>
            <input type="text" required value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Initiation à la Sécurité Informatique"
              className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Certification associée</label>
              <select value={certificationId} onChange={(e) => setCertificationId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold">
                <option value="">Aucune certification</option>
                {certifications.map((c) => (
                  <option key={c.id} value={c.id}>{c.codeExamen ? `[${c.codeExamen}] ` : ''}{c.nom}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Durée estimée (heures)</label>
              <input type="number" required min={1} value={dureeEstimee}
                onChange={(e) => setDureeEstimee(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all" />
            </div>
          </div>

          {/* Statut */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Statut</label>
            <select value={statut} onChange={(e) => setStatut(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all font-semibold">
              <option value="BROUILLON">Brouillon (Privé)</option>
              <option value="PUBLIE">Publié (Visible par tous)</option>
              <option value="ARCHIVE">Archivé (Désactivé)</option>
            </select>
          </div>

          {/* Image + Preview côte à côte */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Image picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Image de couverture</label>
              {imageUrl ? (
                <div className="flex items-center gap-3 p-3 bg-indigo-950/10 border border-indigo-900/30 rounded-xl">
                  <div className="w-12 h-12 bg-[#020617] border border-slate-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1">
                    <img src={imageUrl} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">Image sélectionnée</p>
                    <p className="text-[10px] text-slate-400 truncate">{imageUrl.startsWith('data:') ? 'Fichier importé (Base64)' : imageUrl}</p>
                  </div>
                  <button type="button" onClick={() => setImageUrl('')}
                    className="p-1.5 hover:bg-slate-800/30 text-rose-500 rounded-lg transition-colors cursor-pointer" title="Supprimer l'image">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border border-dashed border-slate-800 p-3 rounded-xl bg-slate-900/50 hover:bg-indigo-950/5 hover:border-red-100 transition-all duration-200 relative">
                    <Upload className="w-4 h-4 text-slate-400 pl-1" />
                    <input type="file" accept="image/*" onChange={handleFileChange}
                      className="w-full text-xs text-slate-400 file:mr-4 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-900/50 file:text-white hover:file:bg-slate-800 file:cursor-pointer cursor-pointer" />
                  </div>
                  <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Ou saisissez une URL (ex: /courses/security.png)"
                    className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all" />
                </div>
              )}
            </div>

            {/* Aperçu en direct */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Aperçu en direct</label>
              <div className="bg-[#080d1a] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
                <div className="relative aspect-[750/422] bg-gradient-to-br from-slate-900/50 to-slate-800/50 overflow-hidden">
                  {imageUrl && !imageError ? (
                    <img src={imageUrl} alt={titre || "Cours"}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  <span className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-md font-extrabold text-[7px] uppercase tracking-wider ${
                    statut === 'PUBLIE' ? 'bg-emerald-600 text-white' : statut === 'ARCHIVE' ? 'bg-slate-600 text-white' : 'bg-amber-500 text-white'
                  }`}>{statut}</span>
                  {selectedCert && (
                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-slate-900/70 text-white text-[7px] font-extrabold rounded-md uppercase tracking-wider">
                      {selectedCert.codeExamen || selectedCert.nom}
                    </span>
                  )}
                </div>
                <div className="p-2.5 space-y-1">
                  <h3 className="text-[11px] font-black text-white leading-snug line-clamp-1">{titre || 'Titre du cours'}</h3>
                  <div className="flex items-center gap-2 text-[8px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {dureeEstimee || 0} h</span>
                    <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" /> 0 inscrits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
            <textarea required rows={3} value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Présentation générale du cours..."
              className="w-full px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all resize-none" />
          </div>
        </div>

        <div className="space-y-5">
          {/* Objectifs */}
          <div className="space-y-3 border-t xl:border-t-0 xl:border-l border-slate-800 pl-0 xl:pl-6 pt-4 xl:pt-0">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objectifs</label>
            <div className="space-y-2">
              {objectifsList.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={val}
                    onChange={(e) => handleChange(i, e.target.value, setObjectifsList)}
                    placeholder="Ex : Maîtriser le déploiement d'architectures hybrides"
                    className="flex-1 px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all" />
                  {objectifsList.length > 1 && (
                    <button type="button" onClick={() => handleRemove(i, setObjectifsList)}
                      className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {objectifsList.length < 5 && (
              <button type="button" onClick={() => handleAdd(objectifsList, setObjectifsList, 'objectif')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-black cursor-pointer flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" /> Ajouter un objectif
              </button>
            )}
          </div>

          {/* Prérequis */}
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prérequis</label>
            <div className="space-y-2">
              {prerequisList.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={val}
                    onChange={(e) => handleChange(i, e.target.value, setPrerequisList)}
                    placeholder="Ex : Connaissances de base en administration réseau"
                    className="flex-1 px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all" />
                  {prerequisList.length > 1 && (
                    <button type="button" onClick={() => handleRemove(i, setPrerequisList)}
                      className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {prerequisList.length < 5 && (
              <button type="button" onClick={() => handleAdd(prerequisList, setPrerequisList, 'prérequis')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-black cursor-pointer flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" /> Ajouter un prérequis
              </button>
            )}
          </div>

          {/* Public cible */}
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public cible</label>
            <div className="space-y-2">
              {publicCibleList.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={val}
                    onChange={(e) => handleChange(i, e.target.value, setPublicCibleList)}
                    placeholder="Ex : Administrateurs systèmes souhaitant passer AZ-500"
                    className="flex-1 px-4 py-2.5 bg-[#080d1a] shadow-sm border border-slate-800/80 focus:border-blue-600 rounded-xl text-white text-sm outline-none transition-all" />
                  {publicCibleList.length > 1 && (
                    <button type="button" onClick={() => handleRemove(i, setPublicCibleList)}
                      className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {publicCibleList.length < 5 && (
              <button type="button" onClick={() => handleAdd(publicCibleList, setPublicCibleList, 'public cible')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-black cursor-pointer flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" /> Ajouter un public cible
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Actions */}
      <div className="pt-6 border-t border-slate-800/80 flex justify-end gap-3 bg-[#020617]">
        <button type="button" onClick={() => { if (!modalLoading) onClose(); }} disabled={modalLoading}
          className="px-5 py-3 bg-slate-900/50 hover:bg-rose-950/30 hover:text-rose-500 hover:border-rose-900/50 border border-transparent text-slate-400 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs uppercase tracking-wider">
          Annuler
        </button>
        <button type="submit" disabled={modalLoading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/20 font-black rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md">
          {modalLoading ? (
            <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
          ) : (
            initialData ? 'Enregistrer' : 'Créer le cours'
          )}
        </button>
      </div>
    </form>
  );

  if (inline) {
    return (
      <div className={`flex flex-col bg-[#020617] overflow-hidden ${fullWidth ? 'h-full' : 'border border-slate-800/80 rounded-[32px] shadow-2xl'}`}>
        {fullWidth && (
          <div className="px-6 pt-5 pb-0 border-b border-slate-800 flex items-center bg-[#080d1a] shrink-0">
            <button onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold transition-colors cursor-pointer pb-5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Retour aux cours
            </button>
          </div>
        )}
        <div className={`shrink-0 ${fullWidth ? 'px-6 pb-0' : 'p-6'} border-b border-slate-800 flex items-center justify-between bg-[#080d1a]`}>
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${initialData ? 'bg-blue-950/30 border-blue-800/50 text-cyan-400' : 'bg-red-50 border-red-100 text-cyan-500'}`}>
              {initialData ? <Edit className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div className="text-left">
              <h2 className="text-xl font-black text-white leading-tight">
                {initialData ? 'Modifier le cours' : 'Nouveau cours'}
              </h2>
              <p className="text-xs text-slate-400">
                {initialData ? 'Modifiez les informations du programme et visualisez l\'aperçu en direct.' : 'Configurez un nouveau cours et visualisez l\'aperçu en direct.'}
              </p>
            </div>
          </div>
          {!fullWidth && (
            <button onClick={() => { if (!modalLoading) onClose(); }} disabled={modalLoading}
              className="p-2 hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-xl transition-all cursor-pointer disabled:opacity-50">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {renderBody()}
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => { if (!modalLoading) onClose(); }}
            className="fixed inset-0 bg-slate-900/80 will-change-auto"
          />
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="bg-[#020617] border border-slate-800/80 w-full max-w-5xl rounded-[32px] shadow-2xl relative z-10 flex flex-col md:max-h-[90vh] max-h-full overflow-hidden will-change-auto"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#080d1a] shrink-0">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${initialData ? 'bg-blue-950/30 border-blue-800/50 text-cyan-400' : 'bg-red-50 border-red-100 text-cyan-500'}`}>
                  {initialData ? <Edit className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-black text-white leading-tight">
                    {initialData ? 'Modifier le cours' : 'Nouveau cours'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {initialData ? "Modifiez les informations du programme et visualisez l'aperçu en direct." : "Configurez un nouveau cours et visualisez l'aperçu en direct."}
                  </p>
                </div>
              </div>
              <button onClick={() => { if (!modalLoading) onClose(); }} disabled={modalLoading}
                className="p-2 hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-xl transition-all cursor-pointer disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderBody()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
