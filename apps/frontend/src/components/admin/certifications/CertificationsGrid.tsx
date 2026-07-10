import React, { useState, useMemo } from 'react';
import { Users, Clock, Award, Edit, Layers, Trash2, ArrowLeft, ArrowRight } from '@/components/icons';

interface CertificationsGridProps {
  filteredCerts: any[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit: (cert: any) => void;
  onManageQuestions: (cert: any) => void;
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
  filteredCerts, loading, error, onRetry, onEdit, onManageQuestions, onDelete
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {currentCerts.map((cert) => (
          <div
            key={cert.id}
            className="bg-white border border-slate-200/90 hover:border-slate-350 hover:shadow-xl rounded-3xl p-6 sm:p-7 flex flex-col justify-between group transition-all duration-300 text-left space-y-5"
          >
            {/* PARTIE SUPÉRIEURE : EN-TÊTE STYLE UDEMY */}
            <div className="flex items-start justify-between gap-4">
              {/* Côté Gauche : Badges, Titre & Description */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-[10px] uppercase tracking-wider px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg">
                    {cert.fournisseur?.nom || 'Éditeur'}
                  </span>
                  {cert.codeExamen && (
                    <span className="font-black text-red-600 text-[10px] uppercase tracking-wider px-2.5 py-1 bg-red-50 border border-red-100 rounded-lg">
                      {cert.codeExamen}
                    </span>
                  )}
                  <span className={`text-[9px] px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-wider border ${getNiveauBadgeStyle(cert.niveau)}`}>
                    {cert.niveau}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-950 text-lg leading-snug group-hover:text-red-600 transition-colors">
                    {cert.nom}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1.5 leading-relaxed">
                    {cert.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Candidats en préparation</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{cert.dureeIndicative || '15h indicatives'}</span>
                  </span>
                </div>
              </div>

              {/* Côté Droit : Écusson/Badge Officiel Flottant */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0 p-1">
                {cert.image ? (
                  <img
                    src={cert.image}
                    alt={cert.nom}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <Award className="w-12 h-12 text-slate-300" />
                )}
              </div>
            </div>

            {/* PARTIE INFÉRIEURE : ACTIONS */}
            <div className="pt-5 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={() => onEdit(cert)}
                className="flex-1 py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Gérer la certification</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onManageQuestions(cert)}
                  className="p-2.5 text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 group/btn"
                  title="Gérer la banque de questions (IA & QCM)"
                >
                  <Layers className="w-4 h-4 group-hover/btn:text-blue-600" />
                </button>

                <button
                  onClick={() => onDelete(cert.id, cert.nom)}
                  className="p-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer group/btn"
                  title="Supprimer la certification"
                >
                  <Trash2 className="w-4 h-4 group-hover/btn:text-rose-700" />
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
