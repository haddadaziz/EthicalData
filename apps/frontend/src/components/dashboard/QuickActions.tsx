import React from 'react';
import { ListChecks, ChevronRight } from '@/components/icons';

interface QuickActionsProps {
    onStartPractice: () => void;
    onBrowseCourses: () => void;
    onGoToCommunity: () => void;
    isTrainer?: boolean;
}

export default function QuickActions({ onStartPractice, onBrowseCourses, onGoToCommunity, isTrainer }: QuickActionsProps) {
    const actions = isTrainer
        ? [
            {
                label: "Gérer mes disponibilités",
                sublabel: "Ajoutez des créneaux de coaching pour les apprenants",
                onClick: onStartPractice,
                hoverBg: 'hover:bg-blue-950/20 hover:border-blue-900/40',
                hoverText: 'group-hover:text-cyan-400',
            },
            {
                label: "Créer / Gérer mes cours",
                sublabel: "Mettez en ligne des formations et modules de révision",
                onClick: onBrowseCourses,
                hoverBg: 'hover:bg-blue-950/20 hover:border-blue-900/40',
                hoverText: 'group-hover:text-cyan-400',
            },
            {
                label: "Aider la communauté",
                sublabel: "Répondez aux questions des apprenants sur le forum",
                onClick: onGoToCommunity,
                hoverBg: 'hover:bg-blue-950/20 hover:border-blue-900/40',
                hoverText: 'group-hover:text-cyan-400',
            },
        ]
        : [
            {
                label: "Lancer une simulation",
                sublabel: "Testez vos connaissances en conditions réelles",
                onClick: onStartPractice,
                hoverBg: 'hover:bg-blue-950/20 hover:border-blue-900/40',
                hoverText: 'group-hover:text-cyan-400',
            },
            {
                label: "Parcourir les cours",
                sublabel: "Accédez aux modules de révision et fiches",
                onClick: onBrowseCourses,
                hoverBg: 'hover:bg-blue-950/20 hover:border-blue-900/40',
                hoverText: 'group-hover:text-cyan-400',
            },
            {
                label: "Échanger avec la communauté",
                sublabel: "Participez au forum d'entraide",
                onClick: onGoToCommunity,
                hoverBg: 'hover:bg-blue-950/20 hover:border-blue-900/40',
                hoverText: 'group-hover:text-cyan-400',
            },
        ];

    return (
        <div className="bg-[#080d1a]/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-cyan-400" />
                <span>Actions rapides</span>
            </h3>
            <div className="space-y-2">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        type="button"
                        onClick={action.onClick}
                        className={`w-full flex items-center justify-between p-3.5 bg-[#020617] ${action.hoverBg} border border-slate-800 rounded-2xl text-left group transition-all cursor-pointer`}
                    >
                        <div>
                            <span className={`text-xs font-black text-white ${action.hoverText} transition-colors block`}>{action.label}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{action.sublabel}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-slate-500 ${action.hoverText} group-hover:translate-x-0.5 transition-all`} />
                    </button>
                ))}
            </div>
        </div>
    );
}
