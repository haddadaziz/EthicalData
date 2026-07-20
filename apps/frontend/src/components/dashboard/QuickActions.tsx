import React from 'react';
import { ListChecks, ChevronRight } from '@/components/icons';

interface QuickActionsProps {
    onStartPractice: () => void;
    onBrowseCourses: () => void;
    onGoToCommunity: () => void;
}

export default function QuickActions({ onStartPractice, onBrowseCourses, onGoToCommunity }: QuickActionsProps) {
    const actions = [
        {
            label: "Lancer une simulation",
            sublabel: "Testez vos connaissances en conditions réelles",
            onClick: onStartPractice,
            hoverBg: 'hover:bg-red-950/20 hover:border-red-900/40',
            hoverText: 'group-hover:text-red-500',
        },
        {
            label: "Parcourir les cours",
            sublabel: "Accédez aux modules de révision et fiches",
            onClick: onBrowseCourses,
            hoverBg: 'hover:bg-amber-950/20 hover:border-amber-900/40',
            hoverText: 'group-hover:text-amber-500',
        },
        {
            label: "Échanger avec la communauté",
            sublabel: "Participez au forum d'entraide",
            onClick: onGoToCommunity,
            hoverBg: 'hover:bg-emerald-950/20 hover:border-emerald-900/40',
            hoverText: 'group-hover:text-emerald-500',
        },
    ];

    return (
        <div className="bg-[#080d1a]/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-red-500" />
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
