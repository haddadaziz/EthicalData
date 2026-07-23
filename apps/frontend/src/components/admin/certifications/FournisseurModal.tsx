import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Plus, Trash2, Award } from '@/components/icons';
import { getProviderLogo } from '@/lib/certification-utils';

interface Fournisseur {
  id: string;
  nom: string;
  slug: string;
  image?: string | null;
  certificationCount?: number;
}

interface FournisseurModalProps {
  isOpen: boolean;
  onClose: () => void;
  fournisseurs: Fournisseur[];
  onCreate: (nom: string, image?: string) => Promise<void>;
  onDelete: (id: string, nom: string) => Promise<void>;
}

export function FournisseurModal({
  isOpen, onClose, fournisseurs, onCreate, onDelete
}: FournisseurModalProps) {
  const [fournNom, setFournNom] = useState('');
  const [fournImage, setFournImage] = useState('');
  const [fournLoading, setFournLoading] = useState(false);
  const [fournError, setFournError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fournNom.trim()) return;

    try {
      setFournLoading(true);
      setFournError(null);
      await onCreate(fournNom.trim(), fournImage.trim() || undefined);
      setFournNom('');
      setFournImage('');
    } catch (err: any) {
      setFournError(err.message || 'Erreur lors de la création');
    } finally {
      setFournLoading(false);
    }
  };

  const handleDelete = async (id: string, nom: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le fournisseur "${nom}" ?`)) return;
    try {
      setFournLoading(true);
      setFournError(null);
      await onDelete(id, nom);
    } catch (err: any) {
      setFournError(err.message || 'Erreur lors de la suppression');
    } finally {
      setFournLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#080d1a] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[85vh] will-change-transform"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-500" />
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Gérer les Fournisseurs</h3>
              </div>
              <button
                onClick={() => {
                  onClose();
                  setFournError(null);
                  setFournNom('');
                  setFournImage('');
                }}
                className="p-1.5 hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-left hide-scrollbar">
              {fournError && (
                <div className="p-3 bg-rose-950/30 border border-rose-800/50 text-rose-400 text-xs font-bold rounded-xl">
                  {fournError}
                </div>
              )}

              {/* Formulaire d'ajout */}
              <form onSubmit={handleCreate} className="space-y-3 p-4 bg-[#020617] border border-slate-800 rounded-2xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nom du Fournisseur *</label>
                  <input
                    type="text"
                    required
                    value={fournNom}
                    onChange={(e) => setFournNom(e.target.value)}
                    placeholder="Nom du fournisseur (ex: Microsoft)"
                    className="w-full px-4 py-2.5 bg-[#080d1a] border border-slate-850 focus:border-blue-600 rounded-xl text-white text-xs font-bold outline-none transition-all placeholder:text-slate-500"
                    disabled={fournLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Chemin du Logo (Optionnel)</label>
                  <input
                    type="text"
                    value={fournImage}
                    onChange={(e) => setFournImage(e.target.value)}
                    placeholder="ex: /logos/microsoft.png"
                    className="w-full px-4 py-2.5 bg-[#080d1a] border border-slate-850 focus:border-blue-600 rounded-xl text-white text-xs font-bold outline-none transition-all placeholder:text-slate-500"
                    disabled={fournLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={fournLoading || !fournNom.trim()}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  {fournLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Ajouter</span>
                </button>
              </form>

              {/* Liste des fournisseurs */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Fournisseurs actuels</p>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 hide-scrollbar">
                  {fournisseurs.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500 bg-[#020617] rounded-xl border border-dashed border-slate-800">
                      Aucun fournisseur enregistré.
                    </div>
                  ) : (
                    fournisseurs.map((f: any) => {
                      const count = f.certificationCount || 0;
                      const hasCerts = count > 0;
                      const logo = f.image || getProviderLogo(f.slug || f.nom || '');
                      return (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-3 bg-[#020617] border border-slate-800 rounded-xl transition-all hover:border-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            {logo ? (
                              <img src={logo} alt={f.nom} className="w-8 h-8 rounded-lg object-contain bg-slate-950 border border-slate-800 p-1 shrink-0 shadow-sm" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 font-bold shrink-0 text-[10px] uppercase">
                                {f.nom.substring(0, 2)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-white truncate">{f.nom}</p>
                              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                {count} certification{count > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDelete(f.id.toString(), f.nom)}
                            disabled={fournLoading || hasCerts}
                            title={hasCerts ? "Ce fournisseur est lié à des certifications et ne peut pas être supprimé." : "Supprimer le fournisseur"}
                            className={`p-2 rounded-lg transition-all duration-200 ${hasCerts
                              ? 'text-slate-700 cursor-not-allowed opacity-50'
                              : 'text-slate-400 hover:text-rose-500 hover:bg-rose-950/30 cursor-pointer'
                              }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
