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
    <Link href={`/certifications/${slug}`} className="block w-full">
      <GlareCard className="rounded-2xl group/glare">
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-[#0a0f1d] border border-slate-800 transition-all duration-300 shadow-xl group-hover/glare:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] group-hover/glare:border-cyan-500/50">
          
          {/* Background Image / Frame */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
            <img
              src="/images/cadre_certif.png"
              alt="Template"
              className="w-full h-full object-cover opacity-60 group-hover/glare:opacity-100 transition-opacity duration-500"
              loading="lazy"
              decoding="async"
            />
            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-transparent to-transparent opacity-90" />
          </div>

          {/* Code Examen Badge */}
          {codeExamen && (
            <div className="absolute top-5 left-5 z-30">
              <div className="bg-slate-900/80 text-white font-bold uppercase text-[10px] tracking-widest px-3 py-1.5 rounded-md border border-slate-700/50 shadow-lg flex items-center group-hover/glare:bg-blue-600 group-hover/glare:border-cyan-500 transition-colors duration-300">
                {codeExamen}
              </div>
            </div>
          )}

          {/* Certification Badge Logo */}
          <div className="absolute bottom-36 left-1/2 z-20 w-32 -translate-x-1/2">
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

          {/* Content / Title Area */}
          <div className="absolute bottom-0 left-0 w-full p-5 z-40 bg-gradient-to-t from-[#02050f] via-[#02050f]/90 to-transparent pt-12">
            <div className="flex flex-col gap-3">
              <h3 className="text-sm md:text-base font-bold text-slate-200 group-hover/glare:text-white leading-snug line-clamp-2 transition-colors duration-300">
                {cleanTitle(nom, codeExamen || "")}
              </h3>
              <div className="w-fit px-4 py-2 bg-blue-600/10 border border-blue-600/30 rounded-lg flex items-center justify-center text-cyan-300 group-hover/glare:bg-blue-600 group-hover/glare:text-white group-hover/glare:border-blue-600 transition-all duration-300 text-[11px] font-black uppercase tracking-widest shadow-lg">
                Explorer
              </div>
            </div>
          </div>
        </div>
      </GlareCard>
    </Link>
  );
};
