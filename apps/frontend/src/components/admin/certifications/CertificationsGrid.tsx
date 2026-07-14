import React, { useState, useMemo } from 'react';
import { Award, Edit, Trash2, ArrowLeft, ArrowRight } from '@/components/icons';

interface CertificationsGridProps {
  filteredCerts: any[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit: (cert: any) => void;
  onDelete: (id: string, nom: string) => void;
}

const getNiveauBadgeStyle = (niv: string) => {
  switch (niv) {
    case 'AVANCE': return 'bg-rose-50 text-rose-600 border-rose-200';
    case 'INTERMEDIAIRE': return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'DEBUTANT':
    default: return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  }
};

export function CertificationsGrid({
  filteredCerts, loading, error, onRetry, onEdit, onDelete
}: CertificationsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(filteredCerts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  const currentCerts = useMemo(() => {
    return filteredCerts.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredCerts, indexOfFirstItem, indexOfLastItem]);

  // Reset page if filtered list is too small
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredCerts, totalPages, currentPage]);

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center">
        <p className="text-rose-500 font-bold mb-2">Une erreur est survenue</p>
        <p className="text-xs text-slate-500 mb-6">{error}</p>
        <button onClick={onRetry} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-950 font-bold rounded-xl cursor-pointer transition-colors">Réessayer</button>
      </div>
    );
  }

  if (filteredCerts.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Aucune certification ne correspond à vos critères.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {currentCerts.map((cert) => (
          <div
            key={cert.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between group transition-all duration-300 hover:shadow-lg hover:border-slate-300"
          >
            {/* Visual Box (Landing Page Style) */}
            <div onClick={() => onEdit(cert)} className="relative w-full aspect-[4/3] sm:aspect-auto sm:h-[240px] rounded-xl overflow-hidden shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-blue-900/30 group-hover:shadow-2xl bg-white border border-slate-100 cursor-pointer">
              {/* Background Template */}
              <img src="/logos/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" />

              {/* Examen code overlay */}
              {cert.codeExamen && (
                <div className="absolute top-3 left-3 z-30 pointer-events-none">
                  <div className="bg-slate-900/80 backdrop-blur-md text-white font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-md border border-slate-700/50 shadow-sm flex items-center group-hover:bg-red-600 group-hover:border-red-500 transition-colors">
                    {cert.codeExamen}
                  </div>
                </div>
              )}

              {/* Floating Badge Logo */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-32 h-32 lg:w-24 lg:h-24 flex items-center justify-center transition-transform duration-500 -translate-y-3 group-hover:-translate-y-5">
                  {cert.image ? (
                    <img src={cert.image} alt={cert.nom} className="max-w-full max-h-full object-contain filter drop-shadow-xl" />
                  ) : (
                    <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                      <Award className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Title & Info & Actions */}
            <div className="mt-4 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-950 leading-snug line-clamp-2">
                  {cert.nom}
                </h3>
                <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                  {cert.fournisseur?.nom || 'Officiel'} • {cert.niveau} • {cert.dureeIndicative || '15h'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 mt-4">
                <button
                  onClick={() => onEdit(cert)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Gérer</span>
                </button>

                <button
                  onClick={() => onDelete(cert.id, cert.nom)}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-950 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-white shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Précédent</span>
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto mx-2 hide-scrollbar">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer shrink-0 ${currentPage === pageNum
                    ? 'bg-slate-950 text-white shadow-md'
                    : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-950 border border-slate-200/50'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-950 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-white shadow-sm"
          >
            <span>Suivant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
