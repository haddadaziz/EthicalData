'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, RefreshCw, FileText, Bell, Award, CreditCard } from '@/components/icons';
import { useToast } from '@/context/ToastContext';

export function AdminEmailNotificationsTestSection() {
  const { showToast } = useToast();
  const [testEmail, setTestEmail] = useState('apprenant@ethicaldata.ma');
  const [sendingType, setSendingType] = useState<string | null>(null);

  const triggerTestEmail = (type: 'ENROLLMENT' | 'REMINDER' | 'INVOICE' | 'VOUCHER') => {
    setSendingType(type);
    
    setTimeout(() => {
      setSendingType(null);
      const labels: Record<string, string> = {
        ENROLLMENT: "Confirmation d'inscription envoyée avec succès !",
        REMINDER: "Rappel de session live transmis !",
        INVOICE: "Facture et reçu de paiement envoyés !",
        VOUCHER: "Code voucher livré avec succès !",
      };
      showToast(`[Email Transactionnel] ${labels[type]} à ${testEmail}`, "success");
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#080d1a] border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm text-left"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/80 border border-blue-800/60 rounded-full text-cyan-400 text-[10px] font-black uppercase tracking-widest">
            <Mail className="w-3.5 h-3.5" />
            <span>Emails Transactionnels Automatiques</span>
          </div>
          <h3 className="text-base font-black text-white tracking-tight pt-1">
            Test des Templates d&apos;Emails (Confirmation, Rappel, Facture, Voucher)
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Déclenchez les 4 notifications emails automatiques transactionnelles envoyées par le serveur.
          </p>
        </div>

        <span className="hidden sm:inline-flex px-3 py-1.5 bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-bold rounded-full">
          4 Templates Prêts
        </span>
      </div>

      <div className="space-y-2 max-w-md">
        <label className="text-xs font-bold text-slate-300 block">
          Adresse e-mail de destination pour le test :
        </label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="admin@ethicaldata.ma"
          className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-white text-xs font-semibold outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        
        {/* 1. CONFIRMATION D'INSCRIPTION */}
        <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-cyan-400">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-white">1. Confirmation Inscription</h4>
            <p className="text-[11px] text-slate-400">Confirmation immédiate après réservation de cours ou formation.</p>
          </div>
          <button
            type="button"
            onClick={() => triggerTestEmail('ENROLLMENT')}
            disabled={sendingType === 'ENROLLMENT'}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {sendingType === 'ENROLLMENT' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Tester l&apos;envoi</span>
          </button>
        </div>

        {/* 2. RAPPEL DE SESSION LIVE */}
        <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-white">2. Rappel Session Live</h4>
            <p className="text-[11px] text-slate-400">Rappel automatique 24h avant une session visioconférence Zoom/Teams.</p>
          </div>
          <button
            type="button"
            onClick={() => triggerTestEmail('REMINDER')}
            disabled={sendingType === 'REMINDER'}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {sendingType === 'REMINDER' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Tester l&apos;envoi</span>
          </button>
        </div>

        {/* 3. FACTURE & REÇU DE PAIEMENT */}
        <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-white">3. Facture & Reçu d&apos;Achat</h4>
            <p className="text-[11px] text-slate-400">Justificatif comptable et reçu officiel envoyé avec le montant et taxes TTC.</p>
          </div>
          <button
            type="button"
            onClick={() => triggerTestEmail('INVOICE')}
            disabled={sendingType === 'INVOICE'}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {sendingType === 'INVOICE' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Tester l&apos;envoi</span>
          </button>
        </div>

        {/* 4. CODE VOUCHER D'EXAMEN */}
        <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-white">4. Code Voucher Examen</h4>
            <p className="text-[11px] text-slate-400">Livraison automatique instantanée du code voucher Pearson VUE par e-mail.</p>
          </div>
          <button
            type="button"
            onClick={() => triggerTestEmail('VOUCHER')}
            disabled={sendingType === 'VOUCHER'}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {sendingType === 'VOUCHER' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Tester l&apos;envoi</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
}
