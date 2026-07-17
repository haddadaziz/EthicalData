import React from 'react';
import { X, Play, Check, Target, CheckCircle2, Award } from '@/components/icons';
import { getCertificateBadgeLogo, getLevelBadgeStyle } from '@/lib/certification-utils';

interface CertDetailModalProps {
    cert: any | null;
    onClose: () => void;
    onPractice: (cert: any) => void;
    isTargeted?: boolean;
    onToggleTarget?: () => void;
}

export default function CertDetailModal({ cert, onClose, onPractice, isTargeted, onToggleTarget }: CertDetailModalProps) {
    if (!cert) return null;

    return (
        <div className="flex flex-col md:flex-row-reverse bg-white overflow-hidden rounded-2xl">
            <div className="w-full md:w-[340px] p-5 flex flex-col items-center justify-center bg-slate-50 border-b md:border-b-0 md:border-l border-slate-200/80 shrink-0">
                <div className="relative w-full max-w-[280px] h-[340px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                    <img src="/images/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0" />

                    {cert.codeExamen && (
                        <div className="absolute top-4 left-4 z-30">
                            <div className="bg-slate-955 text-white font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-md border border-slate-800 shadow-sm flex items-center">
                                {cert.codeExamen}
                            </div>
                        </div>
                    )}

                    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 w-28 flex justify-center">
                        {cert.image || getCertificateBadgeLogo(cert) ? (
                            <img src={cert.image || getCertificateBadgeLogo(cert)} alt={cert.nom} className="w-full h-auto object-contain filter drop-shadow-xl" />
                        ) : (
                            <div className="w-18 h-18 bg-white/95 rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                                <Award className="w-8 h-8 text-slate-400" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between p-6 md:p-8 space-y-6 text-left">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {cert.codeExamen && (
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">{cert.codeExamen}</span>
                            )}
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-black border ${getLevelBadgeStyle(cert.niveau)}`}>{cert.niveau}</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-955 leading-snug">{cert.nom}</h2>
                        <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">{cert.fournisseur?.nom || 'Officiel'}</p>
                    </div>
                    <button type="button" onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-650 transition-all cursor-pointer shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                        {cert.description || "Préparez-vous efficacement à l'examen officiel grâce à nos questionnaires actualisés."}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider">Niveau</span>
                            <p className="text-xs font-extrabold text-slate-900 mt-0.5">{cert.niveau}</p>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider">Durée</span>
                            <p className="text-xs font-extrabold text-slate-900 mt-0.5">{cert.dureeIndicative || '15h'}</p>
                        </div>
                    </div>

                    {cert.objectifs && cert.objectifs.length > 0 && (
                        <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-xl space-y-2">
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Objectifs
                            </span>
                            <ul className="space-y-1.5">
                                {cert.objectifs.slice(0, 3).map((obj: string, i: number) => (
                                    <li key={i} className="text-xs text-slate-755 font-semibold flex items-start gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        <span>{obj}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <button type="button" onClick={() => onPractice(cert)}
                        className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]">
                        <Play className="w-3.5 h-3.5 fill-white text-white" />
                        Commencer la formation
                    </button>
                    {onToggleTarget && (
                        <button type="button" onClick={() => onToggleTarget()}
                            className={`flex-1 py-3 border font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] ${
                                isTargeted
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300'
                                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300'
                            }`}>
                            {isTargeted ? <Check className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
                            <span>{isTargeted ? 'Dans mes objectifs' : 'Viser cet examen'}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
