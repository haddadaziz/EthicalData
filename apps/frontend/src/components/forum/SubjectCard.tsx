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
            className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-6 space-y-4 cursor-pointer transition-all shadow-sm hover:shadow-md group text-left relative"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                    {sujet?.auteur?.avatar ? (
                        <img
                            src={sujet.auteur.avatar}
                            alt={getAuthorFullName(sujet?.auteur)}
                            className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-md shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                            {getAuthorInitials(sujet?.auteur)}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-950">{getAuthorFullName(sujet?.auteur)}</h4>
                            {isOwner && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-extrabold text-[9px] rounded-full">Vous</span>
                            )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{formatDate(sujet.dateCreation)}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-xl border ${getThemeColor(sujet.theme)}`}>
                        {sujet.theme}
                    </span>
                    {sujet.certification && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-xl">
                            {sujet.certification.codeExamen || sujet.certification.nom}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-950 group-hover:text-blue-600 transition-colors">
                    {sujet.titre}
                </h3>
                <p className="text-xs text-slate-600 font-medium line-clamp-3 leading-relaxed">
                    {sujet.contenu}
                </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <div className="flex items-center gap-5">
                    <button
                        onClick={(e) => onLikeClick(sujet.id, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                            sujet.isLikedByUser
                                ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm'
                                : 'bg-slate-50 text-slate-500 border-slate-200/80 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                        title={sujet.isLikedByUser ? "Je n'aime plus" : "J'aime"}
                    >
                        <motion.div
                            key={sujet.isLikedByUser ? 'liked' : 'unliked'}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: [0.8, 1.35, 1] }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            <Heart className={`w-4 h-4 transition-colors ${sujet.isLikedByUser ? 'fill-rose-600 text-rose-600' : 'text-slate-400 fill-transparent'}`} />
                        </motion.div>
                        <span>{sujet.likesCount}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span>{sujet.commentairesCount} réponses</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isOwner ? (
                        <button
                            onClick={(e) => onDeleteClick(sujet.id, e)}
                            className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                            title="Supprimer ma publication"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Supprimer</span>
                        </button>
                    ) : (
                        <button
                            onClick={(e) => onReportClick(sujet, e)}
                            className="p-2 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
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
