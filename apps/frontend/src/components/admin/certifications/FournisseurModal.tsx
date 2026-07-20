import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Plus, Trash2 } from '@/components/icons';

interface Fournisseur {
  id: string;
  nom: string;
  slug: string;
  certificationCount?: number;
}

interface FournisseurModalProps {
  isOpen: boolean;
  onClose: () => void;
  fournisseurs: Fournisseur[];
  onCreate: (nom: string) => Promise<void>;
  onDelete: (id: string, nom: string) => Promise<void>;
}

export function FournisseurModal({
  isOpen, onClose, fournisseurs, onCreate, onDelete
}: FournisseurModalProps) {
  const [fournNom, setFournNom] = useState('');
  const [fournLoading, setFournLoading] = useState(false);
  const [fournError, setFournError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fournNom.trim()) return;

    try {
      setFournLoading(true);
      setFournError(null);
      await onCreate(fournNom.trim());
      setFournNom('');
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-50 border border-slate-200/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[80vh] will-change-transform"
          >
            {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-500" />
              <h3 className="font-extrabold text-sm text-slate-950 uppercase tracking-wider">Gérer les Fournisseurs</h3>
            </div>
            <button
              onClick={() => {
                onClose();
                setFournError(null);
                setFournNom('');
              }}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 text-left">
            {fournError && (
              <div className="p-3 bg-rose-500/5 border border-rose-500/25 text-rose-400 text-xs font-bold rounded-xl">
                {fournError}
              </div>
            )}

            {/* Formulaire d'ajout */}
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                type="text"
                value={fournNom}
                onChange={(e) => setFournNom(e.target.value)}
                placeholder="Nom du fournisseur (ex: Microsoft)"
                className="flex-1 px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                disabled={fournLoading}
              />
              <button
                type="submit"
                disabled={fournLoading || !fournNom.trim()}
                className="px-4 py-2 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 uppercase tracking-widest cursor-pointer"
              >
                {fournLoading ? (
                  <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Ajouter</span>
              </button>
            </form>

            {/* Liste des fournisseurs */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Fournisseurs actuels</p>

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {fournisseurs.length === 0 ? (
                  <div className="text-center py-6 text-sm text-slate-500 bg-white rounded-xl border border-dashed border-slate-200/80">
                    Aucun fournisseur enregistré.
                  </div>
                ) : (
                  fournisseurs.map((f: any) => {
                    const count = f.certificationCount || 0;
                    const hasCerts = count > 0;
                    return (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-200/80 rounded-xl transition-colors hover:border-slate-200"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-950 truncate">{f.nom}</p>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            {count} certification{count > 1 ? 's' : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(f.id.toString(), f.nom)}
                          disabled={fournLoading || hasCerts}
                          title={hasCerts ? "Ce fournisseur est lié à des certifications et ne peut pas être supprimé." : "Supprimer le fournisseur"}
                          className={`p-2 rounded-lg transition-all duration-200 ${hasCerts
                            ? 'text-slate-300 cursor-not-allowed opacity-50'
                            : 'text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer'
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
