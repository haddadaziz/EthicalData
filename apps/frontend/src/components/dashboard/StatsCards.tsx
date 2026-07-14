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
        { icon: MessageCircle, value: stats.sujetsCount, label: 'Sujets', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
        { icon: MessageSquare, value: stats.commentairesCount, label: 'Réponses', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
        { icon: Heart, value: stats.likesCount, label: 'Likes', color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100' },
        { icon: BookOpen, value: stats.coursCount, label: 'Cours', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
        { icon: Award, value: stats.certificationsCount, label: 'Certifications', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
        { icon: Play, value: stats.tentativesCount, label: 'Tentatives', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
        { icon: User, value: stats.inscriptionsCount, label: 'Inscriptions', color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
                <div key={item.label} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} shrink-0`}>
                        <item.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-lg font-black text-slate-900 block leading-tight">{item.value}</span>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{item.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
