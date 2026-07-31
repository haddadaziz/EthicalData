"use client";

import React, { useState } from 'react';
import { DownloadCloud, CheckCircle, Clock, FileText, ShoppingBag } from '@/components/icons';
import { useToast } from '@/context/ToastContext';

interface PurchaseItem {
  id: string;
  itemType: 'Cours E-learning' | 'Examen Blanc' | 'Voucher Officiel';
  itemTitle: string;
  date: string;
  amountMAD: number;
  paymentMethod: string;
  invoiceRef: string;
  status: 'PAYÉ' | 'CONFIRMÉ';
}

const MOCK_PURCHASES: PurchaseItem[] = [
  {
    id: "p1",
    itemType: "Voucher Officiel",
    itemTitle: "Voucher Examen Palo Alto PCNSA (Pearson VUE)",
    date: "12 Juillet 2026",
    amountMAD: 2500,
    paymentMethod: "Carte Bancaire CMI",
    invoiceRef: "INV-2026-00891",
    status: "PAYÉ"
  },
  {
    id: "p2",
    itemType: "Cours E-learning",
    itemTitle: "Pack Expert Cybersécurité & Infrastructure Net-Sec",
    date: "01 Juin 2026",
    amountMAD: 4900,
    paymentMethod: "Virement Bancaire",
    invoiceRef: "INV-2026-00432",
    status: "PAYÉ"
  },
  {
    id: "p3",
    itemType: "Examen Blanc",
    itemTitle: "Pack 5 Simulations AWS Certified Security Specialty",
    date: "15 Mai 2026",
    amountMAD: 950,
    paymentMethod: "Carte Bancaire CMI",
    invoiceRef: "INV-2026-00311",
    status: "CONFIRMÉ"
  }
];

export default function PurchaseHistorySection() {
  const { showToast } = useToast();
  const [purchases] = useState<PurchaseItem[]>(MOCK_PURCHASES);

  const handleDownloadInvoice = (invoiceRef: string) => {
    showToast(`Téléchargement de la facture ${invoiceRef} en cours...`, "success");
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            <span>Historique des Achats & Factures</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Retrouvez tous vos reçus et factures d&apos;achats de cours, examens blancs et vouchers officiels.
          </p>
        </div>

        <div className="px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full text-cyan-400 text-xs font-bold w-max">
          {purchases.length} Transactions
        </div>
      </div>

      {/* Purchase List Cards */}
      <div className="space-y-4">
        {purchases.map((p) => (
          <div
            key={p.id}
            className="bg-[#080d1a] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-2.5 py-0.5 bg-cyan-950 border border-cyan-800/60 rounded-full">
                  {p.itemType}
                </span>
                <span className="text-xs font-mono text-slate-400">{p.invoiceRef}</span>
              </div>

              <h4 className="text-base font-black text-white">{p.itemTitle}</h4>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
                <span>Date : <strong className="text-slate-200">{p.date}</strong></span>
                <span>Mode : <strong className="text-slate-200">{p.paymentMethod}</strong></span>
              </div>
            </div>

            <div className="flex items-center sm:flex-col sm:items-end justify-between border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0 gap-2">
              <div className="text-right">
                <div className="text-lg font-black text-white">{p.amountMAD} MAD</div>
                <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>{p.status}</span>
                </div>
              </div>

              <button
                onClick={() => handleDownloadInvoice(p.invoiceRef)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Facture PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
