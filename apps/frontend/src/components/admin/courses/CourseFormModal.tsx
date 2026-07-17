import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Edit, Upload, Award, Clock, Users, Globe, PlusCircle, Trash2 } from '@/components/icons';
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
}

export const CourseFormModal = React.memo(function CourseFormModal({
  isOpen, onClose, onSubmit, initialData, certifications, modalLoading, modalError
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
            className="bg-slate-50 border border-slate-200/80 w-full max-w-5xl rounded-[32px] shadow-2xl relative z-10 flex flex-col md:max-h-[90vh] max-h-full overflow-hidden will-change-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white relative z-20">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${initialData ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                  {initialData ? <Edit className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-black text-slate-950 leading-tight">
                    {initialData ? 'Modifier le cours' : 'Nouveau cours'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {initialData ? 'Modifiez les informations du programme et visualisez l\'aperçu en direct.' : 'Configurez un nouveau cours et visualisez l\'aperçu en direct.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { if (!modalLoading) onClose(); }}
                disabled={modalLoading}
                className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-950 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side-by-side content */}
            <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden">

              {/* Formulaire (Gauche) */}
              <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-5 w-full md:w-1/2 md:overflow-y-auto text-left">
                {modalError && (
                  <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold">
                    {modalError}
                  </div>
                )}

                {/* Titre */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Titre du cours</label>
                  <input
                    type="text"
                    required
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Initiation à la Sécurité Informatique"
                    className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                  />
                </div>

                {/* Certification et Durée */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Certification associée</label>
                    <select
                      value={certificationId}
                      onChange={(e) => setCertificationId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold"
                    >
                      <option value="">Aucune certification</option>
                      {certifications.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.codeExamen ? `[${c.codeExamen}] ` : ''}{c.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Durée estimée (heures)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={dureeEstimee}
                      onChange={(e) => setDureeEstimee(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Statut */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Statut</label>
                  <select
                    value={statut}
                    onChange={(e) => setStatut(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold"
                  >
                    <option value="BROUILLON">Brouillon (Privé)</option>
                    <option value="PUBLIE">Publié (Visible par tous)</option>
                    <option value="ARCHIVE">Archivé (Désactivé)</option>
                  </select>
                </div>

                {/* Image picker */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Image de couverture</label>

                  {imageUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-indigo-950/10 border border-indigo-900/30 rounded-xl">
                      <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1">
                        <img src={imageUrl} alt="Thumbnail" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">Image sélectionnée</p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {imageUrl.startsWith('data:') ? 'Fichier importé (Base64)' : imageUrl}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="p-1.5 hover:bg-slate-50 text-rose-500 rounded-lg transition-colors cursor-pointer"
                        title="Supprimer l'image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 border border-dashed border-slate-200 p-3 rounded-xl bg-slate-50/20 hover:bg-indigo-950/5 hover:border-red-100 transition-all duration-200 relative">
                        <Upload className="w-4 h-4 text-slate-500 pl-1" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-50 file:text-slate-950 hover:file:bg-slate-100 file:cursor-pointer cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Ou saisissez une URL (ex: /courses/security.png)"
                        className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Présentation générale du cours..."
                    className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all resize-none"
                  />
                </div>

                {/* Objectifs */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Objectifs</label>
                  <div className="space-y-2">
                    {objectifsList.map((val, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleChange(i, e.target.value, setObjectifsList)}
                          placeholder="Ex : Maîtriser le déploiement d'architectures hybrides"
                          className="flex-1 px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                        />
                        {objectifsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemove(i, setObjectifsList)}
                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {objectifsList.length < 5 && (
                    <button
                      type="button"
                      onClick={() => handleAdd(objectifsList, setObjectifsList, 'objectif')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-black cursor-pointer flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Ajouter un objectif
                    </button>
                  )}
                </div>

                {/* Prérequis */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prérequis</label>
                  <div className="space-y-2">
                    {prerequisList.map((val, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleChange(i, e.target.value, setPrerequisList)}
                          placeholder="Ex : Connaissances de base en administration réseau"
                          className="flex-1 px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                        />
                        {prerequisList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemove(i, setPrerequisList)}
                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {prerequisList.length < 5 && (
                    <button
                      type="button"
                      onClick={() => handleAdd(prerequisList, setPrerequisList, 'prérequis')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-black cursor-pointer flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Ajouter un prérequis
                    </button>
                  )}
                </div>

                {/* Public cible */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Public cible</label>
                  <div className="space-y-2">
                    {publicCibleList.map((val, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleChange(i, e.target.value, setPublicCibleList)}
                          placeholder="Ex : Administrateurs systèmes souhaitant passer AZ-500"
                          className="flex-1 px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                        />
                        {publicCibleList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemove(i, setPublicCibleList)}
                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {publicCibleList.length < 5 && (
                    <button
                      type="button"
                      onClick={() => handleAdd(publicCibleList, setPublicCibleList, 'public cible')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-black cursor-pointer flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Ajouter un public cible
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-slate-200/80 flex justify-end gap-3 bg-slate-50 mt-6">
                  <button
                    type="button"
                    onClick={() => { if (!modalLoading) onClose(); }}
                    disabled={modalLoading}
                    className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs uppercase tracking-wider"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md"
                  >
                    {modalLoading ? (
                      <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    ) : (
                      initialData ? 'Enregistrer' : 'Créer le cours'
                    )}
                  </button>
                </div>
              </form>

              {/* Prévisualisation (Droite) */}
              <div className="p-5 md:p-8 w-full md:w-1/2 bg-gradient-to-tr from-slate-950 to-indigo-950/15 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-200/80 relative min-h-[450px] md:overflow-y-auto shrink-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-red-50 opacity-20 pointer-events-none" />

                <div className="w-full max-w-sm space-y-5 relative z-10">
                  <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-lg">
                    <div className="relative aspect-[750/422] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      {imageUrl && !imageError ? (
                        <img
                          src={imageUrl}
                          alt={titre || "Cours"}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-slate-300" />
                        </div>
                      )}
                      <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-md font-extrabold text-[8px] uppercase tracking-wider ${
                        statut === 'PUBLIE' ? 'bg-emerald-500 text-white' : statut === 'ARCHIVE' ? 'bg-slate-500 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {statut}
                      </span>
                      {selectedCert && (
                        <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-slate-900/70 text-white text-[8px] font-extrabold rounded-md uppercase tracking-wider">
                          {selectedCert.codeExamen || selectedCert.nom}
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">
                        {titre || 'Titre du cours'}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                        {description || 'Aucune description fournie.'}
                      </p>
                      <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dureeEstimee || 0} h estimées
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          0 inscrits
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
