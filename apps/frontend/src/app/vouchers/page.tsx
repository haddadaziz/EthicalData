'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Award, ArrowRight, Tag } from '@/components/icons';

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
    code: 'AZ-900 / AZ-104 / SC-900',
    discount: '-25% Remise EDS',
    price: '75 €',
    officialPrice: '99 €',
    logo: '/logos/microsoft.png',
  },
  {
    provider: 'PECB International',
    code: 'ISO 27001 / ISO 27005',
    discount: '-30% Remise EDS',
    price: '350 €',
    officialPrice: '500 €',
    logo: '/logos/pecb.png',
  },
  {
    provider: 'AWS Cloud',
    code: 'AWS Cloud Practitioner / Solution Architect',
    discount: '-20% Remise EDS',
    price: '80 €',
    officialPrice: '100 €',
    logo: '/logos/aws.png',
  },
  {
    provider: 'Palo Alto Networks',
    code: 'PCCET / PCNSA Security',
    discount: '-25% Remise EDS',
    price: '120 €',
    officialPrice: '160 €',
    logo: '/logos/paloalto.png',
  },
];

function formatDate(iso?: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function VouchersPublicPage() {
  const [vouchers, setVouchers] = useState<VoucherPromo[] | null>(null);

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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-black uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5" />
            <span>Remises Partenaires Officiels</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Vouchers d'Examen Officiel avec Discount EDS
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Achetez vos tickets d'examen officiel (Pearson VUE, PECB, Microsoft, AWS) à tarif préférentiel avec nos remises exclusives réservées aux candidats EthicalData.
          </p>
        </div>

        {/* GRILLE VOUCHERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {!vouchers ? (
            <div className="md:col-span-2 py-20 text-center text-slate-400">
              <span className="w-10 h-10 border-4 border-slate-800 border-t-slate-950 rounded-full animate-spin inline-block mb-3" />
              <p className="text-xs font-black uppercase tracking-widest">Chargement des vouchers...</p>
            </div>
          ) : showDynamic ? (
            vouchers.map((v) => (
              <div
                key={v.id}
                className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full">
                      {v.type === 'POURCENTAGE' ? `-${v.valeur}%` : `-${v.valeur} MAD`} Remise EDS
                    </span>
                    {v.dateFin && (
                      <span className="text-[10px] font-bold text-amber-400/90">
                        Offre valable jusqu'au {formatDate(v.dateFin)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-900 to-slate-900 border border-cyan-800/40 rounded-2xl flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{v.nom}</h3>
                      <p className="text-xs text-slate-400">{v.cibleNom || 'Voucher d\'examen officiel'}</p>
                    </div>
                  </div>

                  {v.description && (
                    <p className="text-sm text-slate-300 leading-relaxed">{v.description}</p>
                  )}
                </div>

                <Link
                  href="/register"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
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
                className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full">
                      {voucher.discount}
                    </span>
                    <span className="text-xs font-bold text-slate-400 line-through">
                      {voucher.officialPrice}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl p-2 flex items-center justify-center shrink-0">
                      <img src={voucher.logo} alt={voucher.provider} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{voucher.provider}</h3>
                      <p className="text-xs text-slate-400">{voucher.code}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-3xl font-black text-white">
                      {voucher.price} <span className="text-xs font-normal text-slate-400">/ voucher officiel</span>
                    </p>
                  </div>
                </div>

                <Link
                  href="/register"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Commander ce voucher</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))
          )}
        </div>

      </div>

      <Footer />
    </main>
  );
}
