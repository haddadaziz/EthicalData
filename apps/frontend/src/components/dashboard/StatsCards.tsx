import React from 'react';
import {
    MessageCircle,
    MessageSquare,
    Heart,
    BookOpen,
    Award,
    Play,
    User
} from '@/components/icons';
import type { DashboardStats } from '@/lib/types';

interface StatsCardsProps {
    stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
    const items = [
        { icon: MessageCircle, value: stats.sujetsCount, label: 'Sujets', color: 'text-cyan-400', bg: 'bg-[#080d1a] border-slate-700' },
        { icon: MessageSquare, value: stats.commentairesCount, label: 'Réponses', color: 'text-cyan-300', bg: 'bg-[#080d1a] border-slate-700' },
        { icon: Heart, value: stats.likesCount, label: 'Likes', color: 'text-rose-500', bg: 'bg-[#080d1a] border-slate-700' },
        { icon: BookOpen, value: stats.coursCount, label: 'Cours', color: 'text-cyan-500', bg: 'bg-[#080d1a] border-slate-700' },
        { icon: Award, value: stats.certificationsCount, label: 'Certifications', color: 'text-rose-400', bg: 'bg-[#080d1a] border-slate-700' },
        { icon: Play, value: stats.tentativesCount, label: 'Tentatives', color: 'text-cyan-400', bg: 'bg-[#080d1a] border-slate-700' },
        { icon: User, value: stats.inscriptionsCount, label: 'Inscriptions', color: 'text-rose-500', bg: 'bg-[#080d1a] border-slate-700' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
                <div key={item.label} className="bg-[#080d1a] border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center border ${item.color} shrink-0`}>
                        <item.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-lg font-black text-white block leading-tight">{item.value}</span>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{item.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
