import React from 'react';
import { Clock, Play } from '@/components/icons';
import Link from 'next/link';

interface CertHistoryCardProps {
    item: any;
    cert: any;
    index: number;
    onCertClick: (cert: any) => void;
    formatDate: (d: string) => string;
}

export default function CertHistoryCard({ item, cert, index, onCertClick, formatDate }: CertHistoryCardProps) {
    const isPassed = item.score >= 80;
    const isWarning = item.score >= 65 && item.score < 80;

    return (
        <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                    isPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    isWarning ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                    {item.score}%
                </div>

                <div className="space-y-0.5">
                    <h3 className="font-extrabold text-slate-950 text-sm">
                        {item.certificationName || cert?.nom || "Simulation d'Examen Blanc"}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDate(item.datePassage)}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${
                    isPassed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    isWarning ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                    {isPassed ? 'RÉUSSI' : isWarning ? 'À PEAUFINER' : 'À RENFORCER'}
                </span>

                <Link
                    href={`/dashboard/practice${(item.certificationSlug || cert?.slug) ? `?cert=${item.certificationSlug || cert?.slug}` : ''}`}
                    className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                    <Play className="w-3 h-3 fill-white text-white" />
                    <span>Refaire</span>
                </Link>
            </div>
        </div>
    );
}
