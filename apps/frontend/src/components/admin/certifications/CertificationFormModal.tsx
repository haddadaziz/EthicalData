import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Edit, Upload, Award, Layers, Clock } from '@/components/icons';

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
  fournisseurId: string;
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
    }
  }, [isOpen, initialData, fournisseurs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("L'image est trop grande. La taille maximale est de 2 Mo.");
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
      fournisseurId
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { if (!modalLoading) onClose(); }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-50 border border-slate-200/80 w-full max-w-5xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/20">
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
          <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-900">
            
            {/* Formulaire (Gauche) */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5 md:w-1/2 overflow-y-auto text-left">
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
                      className="text-[10px] text-red-600 hover:text-indigo-300 font-bold uppercase tracking-wider"
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
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objectifs de la certification..."
                  className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all resize-none"
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
            <div className="p-8 md:w-1/2 bg-gradient-to-tr from-slate-950 to-indigo-950/15 flex flex-col items-center justify-center border-l border-slate-200/80 relative min-h-[450px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-red-50 blur-3xl pointer-events-none" />

              <div className="w-full max-w-xs space-y-5 relative z-10">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center">Aperçu en direct</span>

                <div className="w-full max-w-xs bg-white backdrop-blur-md border border-slate-200 rounded-[28px] overflow-hidden shadow-xl hover:shadow-2xl hover:border-red-100 transition-all duration-300 group flex flex-col relative">

                  <div className="h-40 w-full bg-slate-50 border-b border-slate-200 relative flex items-center justify-center overflow-hidden p-3">
                    <div className="absolute w-32 h-32 rounded-full bg-red-50 blur-xl group-hover:bg-red-600/15 transition-all duration-500" />

                    {image && !imageError ? (
                      <img
                        src={image}
                        alt={nom || "Certification"}
                        className="max-w-full max-h-full object-contain relative z-10 filter drop-shadow-sm group-hover:scale-[1.02] transition-all duration-500"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                        <div className="w-12 h-12 rounded-2xl border border-dashed border-slate-700/80 bg-white shadow-sm flex items-center justify-center mb-2">
                          <Award className="w-6 h-6 text-slate-600" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Aucune image
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${getSupplierBadgeStyle(fournisseurs.find(f => f.id === fournisseurId)?.nom || '')}`}>
                          {fournisseurs.find(f => f.id === fournisseurId)?.nom || 'Fournisseur'}
                        </span>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${getNiveauBadgeStyle(niveau)}`}>
                          {niveau}
                        </span>
                      </div>

                      <div className="space-y-0.5 text-left">
                        {codeExamen && (
                          <span className="text-[10px] font-bold text-red-600 block uppercase tracking-wider">
                            {codeExamen}
                          </span>
                        )}
                        <h3 className="font-extrabold text-base text-slate-950 line-clamp-1 group-hover:text-red-600 transition-colors">
                          {nom || 'Titre de la Certification'}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed text-left">
                        {description || 'Aucune description rédigée pour le moment.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{dureeIndicative || 'Non spécifiée'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>0 module</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
