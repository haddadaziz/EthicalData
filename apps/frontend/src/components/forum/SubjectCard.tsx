'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Flag, Trash2, User } from '@/components/icons';
import { Sujet } from '@/lib/types';
import { formatDate, getAuthorFullName, getAuthorInitials, getThemeColor } from '@/lib/forum-utils';

interface SubjectCardProps {
    sujet: Sujet;
    onClick: () => void;
    onProfileClick: (id: string, e: any) => void;
    onReportClick: (sujet: any, e: any) => void;
    onLikeClick: (id: string, e: any) => void;
    onDeleteClick: (id: string, e: any) => void;
    isOwner: boolean;
}

export default function SubjectCard({
    sujet,
    onClick,
    onProfileClick,
    onReportClick,
    onLikeClick,
    onDeleteClick,
    isOwner,
}: SubjectCardProps) {
    return (
        <div
            onClick={onClick}
            className="bg-[#080d1a] border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-4 cursor-pointer transition-all shadow-sm hover:shadow-lg group text-left relative"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                    {sujet?.auteur?.avatar ? (
                        <img
                            src={sujet.auteur.avatar}
                            alt={getAuthorFullName(sujet?.auteur)}
                            className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                            {getAuthorInitials(sujet?.auteur)}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-white">{getAuthorFullName(sujet?.auteur)}</h4>
                            {isOwner && (
                                <span className="px-2 py-0.5 bg-blue-950/50 text-cyan-400 font-extrabold text-[9px] rounded-full border border-blue-900/50">Vous</span>
                            )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{formatDate(sujet.dateCreation)}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-xl border ${getThemeColor(sujet.theme).replace('text-blue-700', 'text-cyan-300').replace('bg-blue-100', 'bg-blue-950/30').replace('border-blue-200', 'border-blue-900/50').replace('text-emerald-700', 'text-emerald-400').replace('bg-emerald-100', 'bg-emerald-950/30').replace('border-emerald-200', 'border-emerald-900/50').replace('text-amber-700', 'text-amber-400').replace('bg-amber-100', 'bg-amber-950/30').replace('border-amber-200', 'border-amber-900/50').replace('text-purple-700', 'text-purple-400').replace('bg-purple-100', 'bg-purple-950/30').replace('border-purple-200', 'border-purple-900/50').replace('text-rose-700', 'text-rose-400').replace('bg-rose-100', 'bg-rose-950/30').replace('border-rose-200', 'border-rose-900/50').replace('text-slate-700', 'text-slate-400').replace('bg-slate-100', 'bg-slate-900').replace('border-slate-200', 'border-slate-800')}`}>
                        {sujet.theme}
                    </span>
                    {sujet.certification && (
                        <span className="text-[10px] font-bold text-slate-400 bg-[#020617] border border-slate-800 px-2.5 py-1 rounded-xl">
                            {sujet.certification.codeExamen || sujet.certification.nom}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">
                    {sujet.titre}
                </h3>
                <p className="text-xs text-slate-400 font-medium line-clamp-3 leading-relaxed">
                    {sujet.contenu}
                </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
                <div className="flex items-center gap-5">
                    <button
                        onClick={(e) => onLikeClick(sujet.id, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                            sujet.isLikedByUser
                                ? 'bg-rose-950/30 text-rose-500 border-rose-900/50 shadow-sm'
                                : 'bg-[#020617] text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                        }`}
                        title={sujet.isLikedByUser ? "Je n'aime plus" : "J'aime"}
                    >
                        <motion.div
                            key={sujet.isLikedByUser ? 'liked' : 'unliked'}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: [0.8, 1.35, 1] }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            <Heart className={`w-4 h-4 transition-colors ${sujet.isLikedByUser ? 'fill-rose-500 text-rose-500' : 'text-slate-500 fill-transparent'}`} />
                        </motion.div>
                        <span>{sujet.likesCount}</span>
                    </button>

                    <div className="flex items-center gap-1.5 group-hover:text-cyan-300 transition-colors">
                        <MessageCircle className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                        <span>{sujet.commentairesCount} réponses</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isOwner ? (
                        <button
                            onClick={(e) => onDeleteClick(sujet.id, e)}
                            className="p-2 hover:bg-rose-950/50 text-slate-500 hover:text-rose-500 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                            title="Supprimer ma publication"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Supprimer</span>
                        </button>
                    ) : (
                        <button
                            onClick={(e) => onReportClick(sujet, e)}
                            className="p-2 hover:bg-rose-950/50 hover:text-rose-500 text-slate-500 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                            title="Signaler à la modération"
                        >
                            <Flag className="w-3.5 h-3.5" />
                            <span>Signaler</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
