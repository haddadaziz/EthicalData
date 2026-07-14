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
            hoverBg: 'hover:bg-blue-50/60 hover:border-blue-100',
            hoverText: 'group-hover:text-blue-600',
        },
        {
            label: "Parcourir les cours",
            sublabel: "Accédez aux modules de révision et fiches",
            onClick: onBrowseCourses,
            hoverBg: 'hover:bg-indigo-50/60 hover:border-indigo-100',
            hoverText: 'group-hover:text-indigo-600',
        },
        {
            label: "Échanger avec la communauté",
            sublabel: "Participez au forum d'entraide",
            onClick: onGoToCommunity,
            hoverBg: 'hover:bg-emerald-50/60 hover:border-emerald-100',
            hoverText: 'group-hover:text-emerald-600',
        },
    ];

    return (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-955 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-blue-600" />
                <span>Actions rapides</span>
            </h3>
            <div className="space-y-2">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        type="button"
                        onClick={action.onClick}
                        className={`w-full flex items-center justify-between p-3.5 bg-slate-50 ${action.hoverBg} border border-slate-100 rounded-2xl text-left group transition-all cursor-pointer`}
                    >
                        <div>
                            <span className={`text-xs font-black text-slate-900 ${action.hoverText} transition-colors block`}>{action.label}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{action.sublabel}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                ))}
            </div>
        </div>
    );
}
