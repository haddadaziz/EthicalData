import React from 'react';
import { Play, Target, BookOpen } from '@/components/icons';
import Link from 'next/link';
import CertHistoryCard from './CertHistoryCard';

interface RecentActivityProps {
    history: any[];
    certifications: any[];
    onCertClick: (cert: any) => void;
}

export default function RecentActivity({ history, certifications, onCertClick }: RecentActivityProps) {
    const formatDate = (d: string) => {
        return new Date(d).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const selectedCert = certifications?.[0] || null;

    return (
        <div className="bg-[#080d1a]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 text-left">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-black text-white tracking-tight">
                        Dernières Tentatives d&apos;Examens Blancs
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        {selectedCert
                            ? `Historique des simulations pour ${selectedCert.codeExamen || selectedCert.nom}`
                            : "Veuillez viser un certificat pour consulter vos tentatives"
                        }
                    </p>
                </div>

                <span className="text-xs font-extrabold text-cyan-400 bg-blue-950/20 border border-blue-900/40 px-3 py-1.5 rounded-xl shrink-0">
                    {history.length} tentative(s) enregistrée(s)
                </span>
            </div>

            {history.length > 0 ? (
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-[#020617]">
                    {history.slice(0, 5).map((attempt: any, idx: number) => (
                        <CertHistoryCard
                            key={attempt.id || idx}
                            item={attempt}
                            cert={selectedCert}
                            index={idx}
                            onCertClick={onCertClick}
                            formatDate={formatDate}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-[#020617] border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-950/20 text-cyan-400 border border-blue-900/30 shadow-[0_0_15px_rgba(37,99,235,0.15)] flex items-center justify-center mx-auto">
                        {selectedCert ? (
                            <Play className="w-6 h-6 fill-red-500 text-cyan-400" />
                        ) : (
                            <Target className="w-6 h-6 text-cyan-400" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-extrabold text-white text-sm">
                            {selectedCert
                                ? `Aucune tentative effectuée pour ${selectedCert.codeExamen || selectedCert.nom}`
                                : "Veuillez viser un certificat pour consulter vos tentatives"
                            }
                        </h3>
                        <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
                            {selectedCert
                                ? "Lancez votre premier examen blanc sur ce simulateur interactif pour générer votre analyse d'éligibilité."
                                : "Sélectionnez votre première certification cible dans le catalogue pour effectuer vos simulations et consulter votre historique."
                            }
                        </p>
                    </div>
                    <Link
                        href={selectedCert ? `/dashboard/practice?cert=${selectedCert.slug}` : "/dashboard/certifications"}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                    >
                        {selectedCert ? (
                            <>
                                <Play className="w-3.5 h-3.5 fill-white text-white" />
                                <span>Lancer un Examen Blanc</span>
                            </>
                        ) : (
                            <>
                                <BookOpen className="w-3.5 h-3.5 text-white" />
                                <span>Accéder au Catalogue</span>
                            </>
                        )}
                    </Link>
                </div>
            )}
        </div>
    );
}
