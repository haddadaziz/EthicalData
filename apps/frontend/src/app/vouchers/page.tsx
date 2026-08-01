'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Award, ArrowRight, Tag } from '@/components/icons';
import { VoucherCmiCheckoutModal } from '@/components/vouchers/VoucherCmiCheckoutModal';

interface VoucherPromo {
  id: string;
  nom: string;
  description?: string | null;
  type: 'POURCENTAGE' | 'MONTANT';
  valeur: number;
  cibleNom?: string | null;
  dateFin?: string | null;
}

const STATIC_VOUCHERS = [
  {
    provider: 'Microsoft Azure',
    certification: 'Microsoft Azure Fundamentals',
    code: 'AZ-900',
    discount: '-25% Remise EDS',
    price: '850 MAD',
    officialPrice: '1 200 MAD',
    validite: '12 Mois (365 jours)',
    centreExamen: 'Pearson VUE (En ligne ou en Centre Agréé)',
    logo: '/logos/microsoft.png',
  },
  {
    provider: 'PECB International',
    certification: 'PECB ISO/IEC 27001 Lead Implementer',
    code: 'ISO-27001-LI',
    discount: '-30% Remise EDS',
    price: '3 800 MAD',
    officialPrice: '5 500 MAD',
    validite: '12 Mois (Inclus 1 rattrapage gratuit)',
    centreExamen: 'PECB Examination Center (En ligne sécurisé)',
    logo: '/logos/pecb.png',
  },
  {
    provider: 'AWS Cloud',
    certification: 'AWS Certified Cloud Practitioner',
    code: 'CLF-C02',
    discount: '-20% Remise EDS',
    price: '900 MAD',
    officialPrice: '1 150 MAD',
    validite: '12 Mois (Pearson VUE / PSI)',
    centreExamen: 'Pearson VUE',
    logo: '/logos/aws.png',
  },
  {
    provider: 'Palo Alto Networks',
    certification: 'Palo Alto Network Security Administrator',
    code: 'PCNSA',
    discount: '-25% Remise EDS',
    price: '1 400 MAD',
    officialPrice: '1 850 MAD',
    validite: '12 Mois à partir de l\'achat',
    centreExamen: 'Pearson VUE',
    logo: '/logos/paloalto.png',
  },
  {
    provider: 'Fortinet Security',
    certification: 'Fortinet NSE 4 Network Security Professional',
    code: 'NSE-4',
    discount: '-20% Remise EDS',
    price: '3 200 MAD',
    officialPrice: '4 000 MAD',
    validite: '12 Mois (Pearson VUE Test Center)',
    centreExamen: 'Pearson VUE',
    logo: '/logos/fortinet.png',
  },
  {
    provider: 'CompTIA Security',
    certification: 'CompTIA Security+ Certification',
    code: 'SY0-701',
    discount: '-22% Remise EDS',
    price: '2 950 MAD',
    officialPrice: '3 800 MAD',
    validite: '12 Mois (Pearson VUE OnVUE)',
    centreExamen: 'Pearson VUE',
    logo: '/logos/comptia.png',
  },
];

function formatDate(iso?: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function VouchersPublicPage() {
  const [vouchers, setVouchers] = useState<VoucherPromo[] | null>(null);
  const [selectedVoucherForCmi, setSelectedVoucherForCmi] = useState<any | null>(null);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    fetch(`${API_URL}/promotions/public/actives?type=VOUCHER`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setVouchers(Array.isArray(data) ? data : []))
      .catch(() => setVouchers([]));
  }, []);

  const showDynamic = !!vouchers && vouchers.length > 0;

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <Navbar />

      <div className="pt-28 pb-20 relative z-10 max-w-7xl mx-auto px-4 md:px-6 text-left space-y-16">

        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
              Vouchers d&apos;Examen Officiel avec Discount EDS
            </span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Achetez vos tickets et pass d&apos;examen officiel (Pearson VUE, PECB, Microsoft, AWS, Palo Alto, Fortinet) à tarif remisé négocié directement par EthicalData Security.
          </p>
        </div>

        {/* GRILLE VOUCHERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!vouchers ? (
            <div className="md:col-span-3 py-20 text-center text-slate-400">
              <span className="w-10 h-10 border-4 border-slate-800 border-t-slate-950 rounded-full animate-spin inline-block mb-3" />
              <p className="text-xs font-black uppercase tracking-widest">Chargement des vouchers...</p>
            </div>
          ) : showDynamic ? (
            vouchers.map((v) => (
              <div
                key={v.id}
                className="bg-[#080d1a] border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full">
                      {v.type === 'POURCENTAGE' ? `-${v.valeur}%` : `-${v.valeur} MAD`} Remise EDS
                    </span>
                    {v.dateFin && (
                      <span className="text-[10px] font-bold text-amber-400/90">
                        Jusqu&apos;au {formatDate(v.dateFin)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-900 to-slate-900 border border-cyan-800/40 rounded-2xl flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">{v.nom}</h3>
                      <span className="inline-block text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50 mt-1">
                        {v.cibleNom || 'EXAM-VOUCHER'}
                      </span>
                    </div>
                  </div>

                  {v.description && (
                    <p className="text-xs text-slate-300 leading-relaxed">{v.description}</p>
                  )}

                  <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                    <p className="text-slate-400 flex items-center justify-between">
                      <span>Validité :</span>
                      <strong className="text-white font-bold">12 Mois (Pearson VUE)</strong>
                    </p>
                    <p className="text-slate-400 flex items-center justify-between">
                      <span>Centre d&apos;examen :</span>
                      <strong className="text-cyan-400 font-bold">Pearson VUE / Centre Agréé</strong>
                    </p>
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <span>Commander ce voucher</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))
          ) : (
            STATIC_VOUCHERS.map((voucher, idx) => (
              <div
                key={idx}
                className="bg-[#080d1a] border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 group"
              >
                <div className="space-y-4">
                  {/* Badge Remise + Prix Normal Barré Mis en Avant */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full">
                      {voucher.discount}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Prix public :</span>
                      <span className="text-xs font-black text-rose-400 line-through decoration-rose-500 decoration-2 px-2 py-0.5 bg-rose-950/50 border border-rose-900/60 rounded-lg">
                        {voucher.officialPrice}
                      </span>
                    </div>
                  </div>

                  {/* Logo + Provider + Code Examen */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 bg-white rounded-2xl p-2 flex items-center justify-center shrink-0 shadow-md">
                      <img src={voucher.logo} alt={voucher.provider} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-white leading-snug group-hover:text-cyan-300 transition-colors">
                        {voucher.certification}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black text-cyan-400 bg-cyan-950/90 border border-cyan-800/60 px-2 py-0.5 rounded-md">
                          Code : {voucher.code}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prix Remisé Affiché en Gros */}
                  <div className="p-3.5 bg-[#020617] border border-slate-800 rounded-2xl space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prix remisé EDS :</p>
                    <p className="text-2xl font-black text-emerald-400 tracking-tight">
                      {voucher.price} <span className="text-[10px] font-medium text-slate-400">/ voucher officiel</span>
                    </p>
                  </div>

                  {/* Détails : Validité & Centre d'examen */}
                  <div className="pt-2 space-y-2 text-xs border-t border-slate-800/80">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-400 font-medium shrink-0">Validité :</span>
                      <span className="text-white font-bold text-right text-[11px]">{voucher.validite}</span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-400 font-medium shrink-0">Centre d&apos;examen :</span>
                      <span className="text-cyan-400 font-bold text-right text-[11px]">{voucher.centreExamen}</span>
                    </div>
                  </div>
                </div>

                {/* Bouton Commander via CMI */}
                <button
                  type="button"
                  onClick={() => setSelectedVoucherForCmi(voucher)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <span>Commander ce voucher</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

      </div>

      {/* MODALE DE PAIEMENT CMI & LIVRAISON VOUCHER */}
      {selectedVoucherForCmi && (
        <VoucherCmiCheckoutModal
          voucher={selectedVoucherForCmi}
          onClose={() => setSelectedVoucherForCmi(null)}
        />
      )}

      <Footer />
    </main>
  );
}
