import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Award, Play } from '@/components/icons';

interface CertificationModalProps {
  selectedCourse: any;
  setSelectedCourse: (course: any) => void;
  isConnected: boolean;
  cleanTitle: (nom: string, code: string) => string;
}

export function CertificationModal({ selectedCourse, setSelectedCourse, isConnected, cleanTitle }: CertificationModalProps) {
  return (
    <AnimatePresence>
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCourse(null)}
            className="absolute inset-0 bg-slate-950/90 cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 max-h-[90vh] will-change-transform"
          >
            <button 
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Partie Gauche Modale: La Carte elle-même (Aperçu) */}
            <div className="w-full md:w-5/12 p-8 flex flex-col items-center justify-center relative overflow-hidden shrink-0 min-h-[400px]">
               <img src="/logos/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0" />
               
               {/* Bandeau Code Certification (Modale) */}
               {selectedCourse.codeExamen && (
                 <div className="absolute top-6 left-6 z-30">
                   <div className="bg-slate-900/80 backdrop-blur-md text-white font-bold uppercase text-[11px] tracking-widest px-3.5 py-1.5 rounded-lg border border-slate-700/50 shadow-lg flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                     {selectedCourse.codeExamen}
                   </div>
                 </div>
               )}

               {selectedCourse.logo && <img src={selectedCourse.logo} alt={selectedCourse.nom} className="w-56 object-contain relative z-20 drop-shadow-lg hover:scale-105 transition-transform duration-300" style={{ transform: 'translateY(-15%)' }} />}
            </div>

            {/* Partie Droite Modale: Détails */}
            <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg">
                    {selectedCourse.fournisseur?.nom || 'Éditeur'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight mb-4">{cleanTitle(selectedCourse.nom, selectedCourse.codeExamen)}</h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-8">{selectedCourse.description}</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <Clock className="w-5 h-5 text-red-500" />
                    <span>{selectedCourse.dureeIndicative || '15h indicatives'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <Award className="w-5 h-5 text-red-500" />
                    <span>Niveau: <span className="uppercase">{selectedCourse.niveau || 'DEBUTANT'}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                <button 
                  onClick={() => window.location.href = isConnected ? '/dashboard/practice' : '/login'}
                  className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  S'entraîner maintenant
                </button>
                <button className="w-14 h-14 shrink-0 bg-slate-950 hover:bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center hover:-translate-y-0.5 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
