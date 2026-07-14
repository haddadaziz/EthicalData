import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Edit, Upload, Award, Layers, Clock } from '@/components/icons';
import { useToast } from '@/context/ToastContext';

interface Fournisseur {
  id: string;
  nom: string;
  slug: string;
}

interface CertificationPayload {
  nom: string;
  codeExamen?: string | null;
  description: string;
  niveau: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  dureeIndicative?: string | null;
  image?: string | null;
  fournisseurId: number;
}

interface CertificationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CertificationPayload) => Promise<void>;
  initialData?: CertificationPayload & { id?: string } | null;
  fournisseurs: Fournisseur[];
  modalLoading: boolean;
  modalError: string | null;
  onManageFournisseurs: () => void;
}

const getSupplierBadgeStyle = (name: string) => {
  switch (name?.toLowerCase()) {
    case 'microsoft': return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
    case 'aws': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'google cloud':
    case 'google': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'cisco': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    default: return 'bg-slate-500/10 text-slate-600 border border-slate-500/20';
  }
};

const getNiveauBadgeStyle = (niv: string) => {
  switch (niv) {
    case 'AVANCE': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    case 'INTERMEDIAIRE': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'DEBUTANT':
    default: return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  }
};

export function CertificationFormModal({
  isOpen, onClose, onSubmit, initialData, fournisseurs, modalLoading, modalError, onManageFournisseurs
}: CertificationFormModalProps) {
  const { showToast } = useToast();
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [nom, setNom] = useState('');
  const [codeExamen, setCodeExamen] = useState('');
  const [description, setDescription] = useState('');
  const [niveau, setNiveau] = useState<'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE'>('DEBUTANT');
  const [dureeIndicative, setDureeIndicative] = useState('');
  const [fournisseurId, setFournisseurId] = useState('');
  const [image, setImage] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNom(initialData.nom);
        setCodeExamen(initialData.codeExamen || '');
        setDescription(initialData.description);
        setNiveau(initialData.niveau);
        setDureeIndicative(initialData.dureeIndicative || '');
        setFournisseurId(initialData.fournisseurId.toString());
        setImage(initialData.image || '');
      } else {
        setNom('');
        setCodeExamen('');
        setDescription('');
        setNiveau('DEBUTANT');
        setDureeIndicative('');
        setImage('');
        if (fournisseurs.length > 0) {
          setFournisseurId(fournisseurs[0].id.toString());
        }
      }
      setImageError(false);
      // Auto-resize textarea après remplissage
      requestAnimationFrame(() => {
        if (descRef.current) {
          const el = descRef.current;
          el.style.height = 'auto';
          const newHeight = Math.min(el.scrollHeight, 200);
          el.style.height = `${newHeight}px`;
          el.style.overflowY = el.scrollHeight > 200 ? 'auto' : 'hidden';
        }
      });
    }
  }, [isOpen, initialData, fournisseurs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("L'image est trop grande. La taille maximale est de 2 Mo.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nom,
      codeExamen: codeExamen || null,
      description,
      niveau,
      dureeIndicative: dureeIndicative || null,
      image: image || null,
      fournisseurId: Number(fournisseurId)
    });
  };

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
                {initialData ? <Edit className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div className="text-left">
                <h2 className="text-xl font-black text-slate-950 leading-tight">
                  {initialData ? 'Modifier la certification' : 'Nouvelle certification'}
                </h2>
                <p className="text-xs text-slate-500">
                  {initialData ? 'Modifiez les caractéristiques et suivez l\'impact visuel en direct.' : 'Configurez une nouvelle certification et visualisez-la en direct.'}
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
          <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
            
            {/* Formulaire (Gauche) */}
            <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-5 w-full md:w-1/2 md:overflow-y-auto text-left">
              {modalError && (
                <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold">
                  {modalError}
                </div>
              )}

              {/* Nom commercial */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Nom commercial</label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Azure Fundamentals"
                  className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                />
              </div>

              {/* Code et Fournisseur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Code examen</label>
                  <input
                    type="text"
                    value={codeExamen}
                    onChange={(e) => setCodeExamen(e.target.value)}
                    placeholder="AZ-900"
                    className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center pl-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fournisseur</label>
                    <button
                      type="button"
                      onClick={onManageFournisseurs}
                      className="text-[10px] text-red-600 hover:text-red-750 font-bold uppercase tracking-wider cursor-pointer"
                    >
                      + Gérer
                    </button>
                  </div>
                  <select
                    value={fournisseurId}
                    onChange={(e) => setFournisseurId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold"
                  >
                    {fournisseurs.length === 0 ? (
                      <option value="" disabled>Aucun fournisseur - Cliquez sur "+ Gérer"</option>
                    ) : (
                      fournisseurs.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nom}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Niveau et Durée */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Niveau</label>
                  <select
                    value={niveau}
                    onChange={(e) => setNiveau(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold"
                  >
                    <option value="DEBUTANT">Débutant</option>
                    <option value="INTERMEDIAIRE">Intermédiaire</option>
                    <option value="AVANCE">Avancé</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Durée indicative</label>
                  <input
                    type="text"
                    value={dureeIndicative}
                    onChange={(e) => setDureeIndicative(e.target.value)}
                    placeholder="15 heures"
                    className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Image picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Image / Badge de Certification</label>

                {image ? (
                  <div className="flex items-center gap-3 p-3 bg-indigo-950/10 border border-indigo-900/30 rounded-xl">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <img src={image} alt="Thumbnail" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">Image sélectionnée</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {image.startsWith('data:') ? 'Fichier importé (Base64)' : image}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImage('')}
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
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Ou saisissez un chemin d'accès (ex: /certifications/az900.png)"
                      className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Description</label>
                <textarea
                  ref={descRef}
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    const el = e.target;
                    el.style.height = 'auto';
                    const newHeight = Math.min(el.scrollHeight, 200);
                    el.style.height = `${newHeight}px`;
                    el.style.overflowY = el.scrollHeight > 200 ? 'auto' : 'hidden';
                  }}
                  placeholder="Objectifs de la certification..."
                  className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all resize-none overflow-y-hidden"
                />
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
                    initialData ? 'Sauvegarder' : 'Créer'
                  )}
                </button>
              </div>
            </form>

            {/* Prévisualisation (Droite) */}
            <div className="p-5 md:p-8 w-full md:w-1/2 bg-gradient-to-tr from-slate-950 to-indigo-950/15 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-200/80 relative min-h-[450px] md:overflow-y-auto shrink-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-red-50 opacity-20 pointer-events-none" />

              <div className="w-full max-w-xs space-y-5 relative z-10">
                <div className="w-full max-w-xs flex flex-col group relative">
                  <div className="relative w-full h-[340px] rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                    {/* Background Template */}
                    <img src="/logos/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0" />

                    {/* Examen code overlay */}
                    {codeExamen && (
                      <div className="absolute top-4 left-4 z-30">
                        <div className="bg-slate-900/80 text-white font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-md border border-slate-700/50 shadow-sm flex items-center gap-1.5 group-hover:bg-red-600 group-hover:border-red-500 transition-colors">
                          <span className="w-1 h-1 rounded-full bg-red-500 group-hover:bg-white animate-pulse transition-colors"></span>
                          {codeExamen}
                        </div>
                      </div>
                    )}

                    {/* Floating Badge Logo */}
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 w-32 flex justify-center">
                      {image && !imageError ? (
                        <img
                          src={image}
                          alt={nom || "Certification"}
                          className="w-full h-auto object-contain filter drop-shadow-xl"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-white/95 rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                          <Award className="w-10 h-10 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & details underneath (No view button) */}
                  <div className="mt-4 flex flex-col gap-1.5 px-1 text-left">
                    <h3 className="text-[13px] font-black text-slate-950 leading-snug line-clamp-2">
                      {nom || 'Titre de la Certification'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-black uppercase">
                        {niveau}
                      </span>
                      <span className="text-[8px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-black uppercase">
                        {fournisseurs.find(f => f.id === fournisseurId)?.nom || 'Fournisseur'}
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
}
