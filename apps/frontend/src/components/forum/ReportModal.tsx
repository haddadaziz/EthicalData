'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, RefreshCw } from '@/components/icons';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (motif: string, details: string) => Promise<void>;
    loading: boolean;
}

const REPORT_PREDEFINED_MOTIFS = [
    'Contenu haineux, diffamatoire ou inapproprié',
    'Spam, publicité non sollicitée ou lien suspect',
    'Désinformation ou fausses affirmations',
    'Harcèlement ou attaques personnelles',
    'Autre motif',
];

export default function ReportModal({
    isOpen,
    onClose,
    onSubmit,
    loading,
}: ReportModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const [reportReasonOption, setReportReasonOption] = useState(REPORT_PREDEFINED_MOTIFS[0]);
    const [customReportDetails, setCustomReportDetails] = useState('');

    const handleSubmitReport = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalMotif = reportReasonOption === 'Autre motif'
            ? (customReportDetails.trim() ? `Autre: ${customReportDetails.trim()}` : 'Autre motif non précisé')
            : `${reportReasonOption}${customReportDetails.trim() ? ` - Précisions: ${customReportDetails.trim()}` : ''}`;
        await onSubmit(finalMotif, customReportDetails);
    };

    const handleClose = () => {
        setReportReasonOption(REPORT_PREDEFINED_MOTIFS[0]);
        setCustomReportDetails('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 text-left relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-950/30 border border-red-900/50 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">
                                Signaler cette publication
                            </h3>
                            <p className="text-xs font-semibold text-slate-400">Aidez-nous à préserver un espace sécurisé.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 rounded-xl hover:bg-[#020617] transition-all cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmitReport} className="space-y-5">
                    <div className="space-y-2.5">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Motif principal</label>
                        <div className="space-y-2">
                            {REPORT_PREDEFINED_MOTIFS.map((motifOption) => (
                                <label
                                    key={motifOption}
                                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${reportReasonOption === motifOption
                                        ? 'bg-red-950/20 border-red-900/50 text-red-400 shadow-sm'
                                        : 'bg-[#020617] border-slate-800 hover:bg-[#020617]/50 text-slate-400 hover:text-slate-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={motifOption}
                                        checked={reportReasonOption === motifOption}
                                        onChange={(e) => setReportReasonOption(e.target.value)}
                                        className="accent-red-500 w-4 h-4 cursor-pointer"
                                    />
                                    <span>{motifOption}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Précisions supplémentaires (Optionnel)</label>
                        <textarea
                            rows={3}
                            placeholder="Fournissez plus de contexte si nécessaire..."
                            value={customReportDetails}
                            onChange={(e) => setCustomReportDetails(e.target.value)}
                            className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-red-600 rounded-xl text-white placeholder:text-slate-500 text-xs font-semibold outline-none resize-none transition-colors"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2.5 bg-[#020617] border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                            <span>Confirmer le signalement</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
