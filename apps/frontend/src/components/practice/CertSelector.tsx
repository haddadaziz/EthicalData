import { Award, Play } from '@/components/icons';
import { getCertificateBadgeLogo } from '@/lib/certification-utils';
import React from 'react';

interface CertSelectorProps {
  certifications: any[];
  certLogos: Record<string, string>;
  onSelect: (cert: any) => void;
  formatNumber: (n: number) => string;
}

export default function CertSelector({ certifications, certLogos, onSelect, formatNumber }: CertSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {certifications.map((cert) => (
        <div
          key={cert.id}
          className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between group transition-all duration-300 hover:shadow-lg hover:border-slate-300 text-left"
        >
          <div onClick={() => onSelect(cert)} className="relative w-full aspect-[4/3] sm:aspect-auto sm:h-[240px] rounded-xl overflow-hidden shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-blue-900/30 group-hover:shadow-2xl bg-white border border-slate-100 cursor-pointer">
            <img src="/images/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0" />

            {cert.codeExamen && (
              <div className="absolute top-3 left-3 z-30">
                <div className="bg-slate-900/80 backdrop-blur-md text-white font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-md border border-slate-700/50 shadow-sm flex items-center group-hover:bg-red-600 group-hover:border-red-500 transition-colors">
                  {cert.codeExamen}
                </div>
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="w-32 h-32 lg:w-24 lg:h-24 flex items-center justify-center transition-transform duration-500 -translate-y-3 group-hover:-translate-y-5">
                {getCertificateBadgeLogo(cert) ? (
                  <img src={getCertificateBadgeLogo(cert)} alt={cert.nom} className="max-w-full max-h-full object-contain filter drop-shadow-xl" />
                ) : (
                  <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                    <Award className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 onClick={() => onSelect(cert)} className="text-sm font-black text-slate-950 leading-snug line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors">
                {cert.nom}
              </h3>
              <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                {cert.fournisseur?.nom || 'Officiel'} • {cert.niveau} • {cert.simulations?.[0]?.duree || 60} min
              </p>
            </div>

            <div className="pt-4 flex flex-col items-stretch gap-3 text-xs mt-4">
              <button
                onClick={() => onSelect(cert)}
                className="w-full py-3 lg:py-2 bg-slate-950 hover:bg-slate-900 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Lancer le simulateur</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
