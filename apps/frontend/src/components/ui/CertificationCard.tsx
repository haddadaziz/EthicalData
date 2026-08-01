"use client";

import React from "react";
import Link from "next/link";
import { GlareCard } from "@/components/ui/glare-card";

interface CertificationCardProps {
  slug: string;
  nom: string;
  codeExamen?: string;
  logo?: string;
  cleanTitle: (nom: string, code: string) => string;
}

export const CertificationCard = ({
  slug,
  nom,
  codeExamen,
  logo,
  cleanTitle,
}: CertificationCardProps) => {
  return (
    <Link href={`/certifications/${slug}`} className="block w-full transform-gpu">
      <GlareCard className="rounded-2xl group/glare">
        <div className="relative w-full h-[440px] rounded-2xl overflow-hidden bg-[#0a0f1d] border border-slate-800 transition-all duration-300 ease-out shadow-xl group-hover/glare:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] group-hover/glare:border-cyan-500/50 transform-gpu">
          
          {/* Background Image / Frame */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
            <img
              src="/images/cadre_certif.png"
              alt="Template"
              className="w-full h-full object-cover opacity-90 group-hover/glare:opacity-100 transition-opacity duration-500"
              loading="lazy"
              decoding="async"
            />
            {/* Soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#02050f]/40 via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>

          {/* Code Examen Badge (Top Left) */}
          {codeExamen && (
            <div className="absolute top-5 left-5 z-30">
              <div className="bg-slate-900/80 text-white font-bold uppercase text-[10px] tracking-widest px-3 py-1.5 rounded-md border border-slate-700/50 shadow-lg flex items-center group-hover/glare:bg-blue-600 group-hover/glare:border-cyan-500 transition-colors duration-300">
                {codeExamen}
              </div>
            </div>
          )}

          {/* Bouton Voir (Top Right - à l'opposé du Code Examen) */}
          <div className="absolute top-5 right-5 z-30">
            <div className="px-3.5 py-1.5 bg-blue-600/20 border border-blue-600/40 rounded-md flex items-center justify-center text-cyan-300 group-hover/glare:bg-blue-600 group-hover/glare:text-white group-hover/glare:border-blue-600 transition-all duration-300 text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-sm">
              Voir
            </div>
          </div>

          {/* Certification Badge Logo (Relevé encore plus haut) */}
          <div className="absolute bottom-40 left-1/2 z-20 w-32 -translate-x-1/2">
            <div className="flex justify-center w-full">
              {logo ? (
                <img
                  src={logo}
                  alt="Badge"
                  className="w-full h-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] group-hover/glare:drop-shadow-[0_20px_30px_rgba(37,99,235,0.3)] transition-all duration-500"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center font-bold text-white border border-slate-800 shadow-2xl">
                  Badge
                </div>
              )}
            </div>
          </div>

          {/* Content / Title Area (Relevé encore plus haut à bottom-20) */}
          <div className="absolute bottom-20 left-0 w-full px-5 z-40 bg-gradient-to-t from-[#02050f]/60 via-[#02050f]/30 to-transparent pt-6">
            <h3 className="text-sm md:text-base font-bold text-white group-hover/glare:text-cyan-300 leading-snug line-clamp-2 transition-colors duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {cleanTitle(nom, codeExamen || "")}
            </h3>
          </div>
        </div>
      </GlareCard>
    </Link>
  );
};
