import React from 'react';
import { Layers, Clock, FileText, Send, Trash2, BookMarked } from '@/components/icons';

interface CourseGridProps {
  filteredCours: any[];
  activeTab: 'TOUS' | 'PUBLIE' | 'BROUILLON';
  onCreateNew: () => void;
  onEdit: (cours: any) => void;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CourseGrid({
  filteredCours,
  activeTab,
  onCreateNew,
  onEdit,
  onPublish,
  onDelete
}: CourseGridProps) {
  if (filteredCours.length === 0) {
    return (
      <div className="text-center py-20 bg-[#080d1a] border border-dashed border-slate-800 rounded-3xl">
        <BookMarked className="w-12 h-12 text-slate-800 mx-auto mb-3" />
        <p className="text-sm font-black text-slate-500">
          {activeTab === 'BROUILLON' ? 'Aucun brouillon en cours.' : 'Aucun cours trouvé.'}
        </p>
        <button onClick={onCreateNew}
          className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.2)]">
          Créer mon premier cours
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {filteredCours.map((c) => (
        <div key={c.id} className="group bg-[#080d1a] border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/10 hover:border-slate-700 transition-all duration-300 flex flex-col">
          {/* Image de couverture */}
          <div className="relative aspect-[750/422] bg-[#020617] overflow-hidden">
            {c.imageUrl ? (
              <img src={c.imageUrl} alt={c.titre}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Layers className="w-10 h-10 text-slate-800" />
              </div>
            )}
            {/* Badge statut */}
            <span className={`absolute top-3 right-3 px-2.5 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider border shadow-sm backdrop-blur-sm ${c.statut === 'PUBLIE'
                ? 'bg-emerald-950/80 text-emerald-500 border-emerald-900/50'
                : 'bg-amber-950/80 text-amber-500 border-amber-900/50'
              }`}>
              {c.statut === 'PUBLIE' ? 'Publié' : 'Brouillon'}
            </span>
            {/* Certification badge */}
            {c.certification && (
              <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-white text-[8px] font-extrabold rounded-md uppercase tracking-wider border border-slate-800/50">
                {c.certification.codeExamen && !c.certification.nom.includes(c.certification.codeExamen) ? c.certification.codeExamen : c.certification.nom}
              </span>
            )}
          </div>

          {/* Contenu */}
          <div className="p-4 flex-1 flex flex-col gap-2">
            <h3 className="text-sm font-black text-white leading-snug line-clamp-2 group-hover:text-cyan-400 transition-colors">
              {c.titre}
            </h3>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
              <div className="w-5 h-5 rounded-full bg-blue-950/30 text-cyan-400 border border-blue-900/30 flex items-center justify-center text-[8px] font-black shrink-0 overflow-hidden">
                {c.formateur?.avatar ? (
                  <img src={c.formateur.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  (c.formateur?.prenom?.[0] || 'F')
                )}
              </div>
              <span className="truncate">
                Par {c.formateur?.prenom || 'Vous'} {c.formateur?.nom || ''}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-auto pt-2 text-[10px] text-slate-500 font-bold">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {c.modules?.length || 0} module{(c.modules?.length || 0) > 1 ? 's' : ''}
              </span>
              {c.dureeEstimee && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {c.dureeEstimee} min
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-slate-800 p-3 flex items-center gap-2">
            <button onClick={() => onEdit(c)}
              className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
              <FileText className="w-3 h-3" />
              Modifier
            </button>
            {c.statut === 'BROUILLON' && (
              <button onClick={() => onPublish(c.id)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm">
                <Send className="w-3 h-3" />
                Publier
              </button>
            )}
            <button onClick={() => onDelete(c.id)}
              className="p-2 text-cyan-400 hover:bg-blue-950/20 rounded-xl transition-all cursor-pointer"
              title="Supprimer">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
