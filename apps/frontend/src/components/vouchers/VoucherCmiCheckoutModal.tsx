'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, RefreshCw, CreditCard, Lock, Mail, ArrowRight, X } from '@/components/icons';
import { useToast } from '@/context/ToastContext';

interface VoucherCheckoutProps {
  voucher: {
    certification: string;
    code: string;
    price: string;
    officialPrice: string;
    discount: string;
    validite: string;
    centreExamen: string;
    logo?: string;
  };
  onClose: () => void;
}

export function VoucherCmiCheckoutModal({ voucher, onClose }: VoucherCheckoutProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  // Form State
  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [numCarte, setNumCarte] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Generated Voucher Code on Success
  const [generatedVoucherCode, setGeneratedVoucherCode] = useState('');

  const handleCmiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !nomComplet) {
      showToast("Veuillez remplir vos informations de livraison.", "error");
      return;
    }

    setLoading(true);

    // Simulate CMI Gateway Request & Processing
    setTimeout(() => {
      setLoading(false);
      setPaidSuccess(true);
      const randomCode = `EDS-VOUCHER-${voucher.code.replace(/[^A-Z0-9]/gi, '')}-${Math.floor(100000 + Math.random() * 900000)}`;
      setGeneratedVoucherCode(randomCode);
      showToast(`Paiement CMI validé ! Votre code voucher a été envoyé à ${email}`, "success");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-[#080d1a] border border-cyan-900/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-left my-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="space-y-2 border-b border-slate-800 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full text-cyan-400 text-[10px] font-black uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" />
            <span>Paiement Sécurisé CMI MAROC & Envoi Instantané</span>
          </div>
          <h3 className="text-xl font-black text-white pt-1">Commander mon Voucher d&apos;Examen</h3>
          <p className="text-xs text-slate-400">
            Achetez au tarif remisé. Votre code voucher officiel sera envoyé automatiquement par e-mail immédiatement après confirmation.
          </p>
        </div>

        {/* SUMMARY CARD */}
        <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 border border-cyan-800/60 px-2 py-0.5 rounded">
              {voucher.code}
            </span>
            <h4 className="text-sm font-black text-white">{voucher.certification}</h4>
            <p className="text-[11px] text-slate-400">{voucher.centreExamen}</p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-500 line-through block">{voucher.officialPrice}</span>
            <span className="text-xl font-black text-emerald-400">{voucher.price}</span>
          </div>
        </div>

        {paidSuccess ? (
          /* SUCCESS SCREEN */
          <div className="p-6 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-900/60 border border-emerald-500/60 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-white">Paiement CMI Confirmé !</h4>
              <p className="text-xs text-slate-300">
                Votre transaction a été validée avec succès par le Centre Monétique Interbancaire (CMI).
              </p>
            </div>

            <div className="p-4 bg-[#020617] border border-cyan-900/80 rounded-xl space-y-1 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Votre Code Voucher Officiel</span>
              <p className="text-lg font-mono font-black text-cyan-400 select-all tracking-wider">
                {generatedVoucherCode}
              </p>
            </div>

            <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-left flex items-start gap-3">
              <Mail className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300">
                Un e-mail de confirmation contenant votre facture et les instructions d&apos;inscription sur <strong>Pearson VUE</strong> a été envoyé à <strong className="text-cyan-400">{email}</strong>.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Fermer et retourner au catalogue
            </button>
          </div>
        ) : (
          /* CMI CHECKOUT FORM */
          <form onSubmit={handleCmiSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Nom Complet *</label>
                <input
                  type="text"
                  required
                  value={nomComplet}
                  onChange={(e) => setNomComplet(e.target.value)}
                  placeholder="Mohammed Benali"
                  className="w-full p-3 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-white text-xs font-medium outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">E-mail de Réception *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.ma"
                  className="w-full p-3 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-white text-xs font-medium outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Téléphone Mobile</label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+212 600-000000"
                className="w-full p-3 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-white text-xs font-medium outline-none"
              />
            </div>

            {/* CARD DETAILS PREPARATION */}
            <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span>Paiement Carte Bancaire (CMI MAROC)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-bold">Visa / Mastercard / CMI</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Numéro de Carte</label>
                <input
                  type="text"
                  maxLength={19}
                  value={numCarte}
                  onChange={(e) => setNumCarte(e.target.value)}
                  placeholder="4000 1234 5678 9010"
                  className="w-full p-3 bg-[#080d1a] border border-slate-800 focus:border-cyan-500 rounded-xl text-white text-xs font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Expiration</label>
                  <input
                    type="text"
                    maxLength={5}
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    placeholder="MM/AA"
                    className="w-full p-3 bg-[#080d1a] border border-slate-800 focus:border-cyan-500 rounded-xl text-white text-xs font-mono text-center outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="w-full p-3 bg-[#080d1a] border border-slate-800 focus:border-cyan-500 rounded-xl text-white text-xs font-mono text-center outline-none"
                  />
                </div>
              </div>
            </div>

            {/* CMI TRUST SECURITY FOOTER */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>Protection SSL 256-bit & 3D Secure</span>
              </span>
              <span>Passerelle CMI MAROC Agréée</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Redirection Passerelle CMI...</span>
                  </>
                ) : (
                  <>
                    <span>Payer {voucher.price} via CMI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
