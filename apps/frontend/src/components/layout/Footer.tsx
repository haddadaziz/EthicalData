"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative z-10 bg-[#020617] text-[#A3A3A3] overflow-hidden">
      
      {/* Background cyber network image - Stretching 100% edge-to-edge */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/bg/footer_cyber_bg.png" 
          alt="Footer background" 
          className="w-full h-full object-cover opacity-15 transform-gpu" 
          loading="lazy"
          decoding="async"
        />
        {/* Soft gradient fading perfectly to top section to ensure smooth seamless flow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-12">
        
        <div className="max-w-xl space-y-4 text-left">
          <img src="/logos/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-10 w-auto object-contain" />
          <p className="text-sm leading-relaxed text-slate-400">
            {t('footer_tagline')}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12 text-left">
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white uppercase tracking-wider">{t('footer_col1')}</h4>
            <div className="text-sm space-y-2.5">
              <a href="/formations" className="block text-slate-400 hover:text-white transition-colors">{t('sub_cat_formations')}</a>
              <a href="/certifications" className="block text-slate-400 hover:text-white transition-colors">{t('nav_certifications')}</a>
              <a href="/examens-blancs" className="block text-slate-400 hover:text-white transition-colors">{t('sub_exam_ia')}</a>
              <a href="/vouchers" className="block text-slate-400 hover:text-white transition-colors">{t('sub_vouchers')}</a>
              <a href="/coaching" className="block text-slate-400 hover:text-white transition-colors">{t('sub_coaching')}</a>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white uppercase tracking-wider">{t('footer_col2')}</h4>
            <div className="text-sm space-y-2.5">
              <a href="/infogerance" className="block text-slate-400 hover:text-white transition-colors">{t('sub_infogerance')}</a>
              <a href="/integration" className="block text-slate-400 hover:text-white transition-colors">{t('sub_integration')}</a>
              <a href="/services-professionnels" className="block text-slate-400 hover:text-white transition-colors">{t('sub_prof_services')}</a>
              <a href="/solution-it" className="block text-slate-400 hover:text-white transition-colors">{t('sub_solution_it')}</a>
              <a href="/portage-salarial" className="block text-slate-400 hover:text-white transition-colors">{t('sub_portage')}</a>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white uppercase tracking-wider">{t('footer_col3')}</h4>
            <div className="text-sm space-y-3">
              <p><span className="font-bold text-[#E5E5E5]">Email :</span> contact@ethicaldatasecurity.ma</p>
              <p><span className="font-bold text-[#E5E5E5]">Tél :</span> +212 664 244 343 // +212 520 572 631</p>
              <p><span className="font-bold text-[#E5E5E5]">Adresse :</span> Bureau 305, Technopark Casablanca</p>
            </div>
          </div>
        </div>
        
      </div>

      {/* BOTTOM COPYRIGHT STRIP */}
      <div className="w-full bg-[#030712]/90 border-t border-slate-900/50 py-5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex items-center">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Ethical Data Security - Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
