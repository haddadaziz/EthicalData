'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Heart, Flag, Trash2, MessageCircle, ChevronDown } from '@/components/icons';
import { formatDate, getAuthorFullName, getAuthorInitials, getAuthorHandle, getThemeColor } from '@/lib/forum-utils';
import { getProviderLogo } from '@/lib/certification-utils';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface SubjectDetailModalProps {
    selectedSujetId: string | null;
    onClose: () => void;
    detailSujet: any;
    detailLoading: boolean;
    currentUserId: string | undefined;
    currentUserEmail: string | undefined;
    commentText: string;
    onCommentTextChange: (text: string) => void;
    commentLoading: boolean;
    replyTarget: { id: string; authorName: string; mentionUserId?: string } | null;
    onCancelReply: () => void;
    onLikeToggle: (sujetId: string, e?: React.MouseEvent) => void;
    onDeleteSujet: (sujetId: string, e?: React.MouseEvent) => void;
    onReportSujet: (sujet: any, e?: React.MouseEvent) => void;
    onCommentLikeToggle: (commentId: string, e?: React.MouseEvent) => void;
    onCommentDelete: (commentId: string) => void;
    onReportComment: (commentId: string, authorId?: string, authorEmail?: string) => void;
    onReplyInit: (commId: string, authorName: string, mentionUserId?: string) => void;
    onCommentSubmit: (contenu: string, parentId?: string, mentionUserId?: string) => void;
    onProfileClick: (learnerId?: string, e?: React.MouseEvent) => void;
    onToggleReplies: (commId: string) => void;
    onShowMoreComments: () => void;
    expandedReplies: Record<string, boolean>;
    visibleTopCommentsCount: number;
    isUserOwnerOfSujet: (sujet?: any) => boolean;
    topLevelComments: any[];
    getSubReplies: (parentId: string) => any[];
}

export default function SubjectDetailModal({
    selectedSujetId,
    onClose,
    detailSujet,
    detailLoading,
    currentUserId,
    currentUserEmail,
    commentText,
    onCommentTextChange,
    commentLoading,
    replyTarget,
    onCancelReply,
    onLikeToggle,
    onDeleteSujet,
    onReportSujet,
    onCommentLikeToggle,
    onCommentDelete,
    onReportComment,
    onReplyInit,
    onCommentSubmit,
    onProfileClick,
    onToggleReplies,
    onShowMoreComments,
    expandedReplies,
    visibleTopCommentsCount,
    isUserOwnerOfSujet,
    topLevelComments,
    getSubReplies,
}: SubjectDetailModalProps) {
    return (
        <AnimatePresence>
            {selectedSujetId && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/70 overflow-y-auto"
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.15 }}
                        className="w-full max-w-3xl bg-[#080d1a] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl h-[92vh] sm:maxh-[90vh] flex flex-col justify-between text-left overflow-hidden relative"
                    >
                        <div className="p-5 md:p-6 bg-[#020617] border-b border-slate-800 flex items-center justify-between shadow-sm sticky top-0 z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-950/30 text-cyan-400 rounded-2xl flex items-center justify-center font-black">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white">Espace Échanges & Réponses</h3>
                                    <p className="text-[11px] text-slate-400 font-semibold">Discussion communautaire en direct</p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2.5 text-slate-400 hover:text-white rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
                            {detailLoading || !detailSujet ? (
                                <div className="p-16 text-center text-slate-400">
                                    <span className="w-9 h-9 border-4 border-blue-950 border-t-cyan-500 rounded-full animate-spin inline-block mb-3" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Chargement de la discussion...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-[#020617] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                            <div className="flex items-center gap-3">
                                                 {detailSujet?.auteur?.avatar ? (
                                                     <img
                                                         src={detailSujet.auteur.avatar}
                                                         alt={getAuthorFullName(detailSujet?.auteur)}
                                                         onClick={(e) => onProfileClick(detailSujet?.auteur?.id, e)}
                                                         className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0"
                                                     />
                                                 ) : (
                                                     <div
                                                         onClick={(e) => onProfileClick(detailSujet?.auteur?.id, e)}
                                                         className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0"
                                                     >
                                                         {getAuthorInitials(detailSujet?.auteur)}
                                                     </div>
                                                 )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4
                                                            onClick={(e) => onProfileClick(detailSujet?.auteur?.id, e)}
                                                            className="text-xs font-black text-white hover:underline cursor-pointer"
                                                        >
                                                            {getAuthorFullName(detailSujet?.auteur)}
                                                        </h4>
                                                        <span
                                                            onClick={(e) => onProfileClick(detailSujet?.auteur?.id, e)}
                                                            className="text-[10px] text-slate-400 font-bold hover:text-cyan-400 transition-colors cursor-pointer"
                                                        >
                                                            @{getAuthorHandle(detailSujet?.auteur)}
                                                        </span>
                                                        {isUserOwnerOfSujet(detailSujet) && (
                                                            <span className="px-2 py-0.5 bg-blue-950/50 text-cyan-400 font-extrabold text-[9px] border border-blue-900/50 rounded-full">Auteur</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-semibold">{formatDate(detailSujet.dateCreation)}</span>
                                                </div>
                                            </div>

                                            <span className={`text-[10px] font-black px-3 py-1 rounded-xl border self-start sm:self-auto ${getThemeColor(detailSujet.theme).replace('text-blue-700', 'text-cyan-300').replace('bg-blue-100', 'bg-blue-950/30').replace('border-blue-200', 'border-blue-900/50').replace('text-emerald-700', 'text-emerald-400').replace('bg-emerald-100', 'bg-emerald-950/30').replace('border-emerald-200', 'border-emerald-900/50').replace('text-amber-700', 'text-amber-400').replace('bg-amber-100', 'bg-amber-950/30').replace('border-amber-200', 'border-amber-900/50').replace('text-purple-700', 'text-purple-400').replace('bg-purple-100', 'bg-purple-950/30').replace('border-purple-200', 'border-purple-900/50').replace('text-rose-700', 'text-rose-400').replace('bg-rose-100', 'bg-rose-950/30').replace('border-rose-200', 'border-rose-900/50').replace('text-slate-700', 'text-slate-400').replace('bg-slate-100', 'bg-slate-900').replace('border-slate-200', 'border-slate-800')}`}>
                                                {detailSujet.theme}
                                            </span>
                                        </div>

                                        <h2 className="text-xl font-black text-white leading-snug">{detailSujet.titre}</h2>
                                        
                                        <div className="p-4 bg-[#080d1a] border border-slate-800 rounded-2xl text-xs text-slate-400 font-medium whitespace-pre-wrap leading-relaxed">
                                            {detailSujet.contenu}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-bold">
                                            <button
                                                onClick={() => onLikeToggle(detailSujet.id)}
                                                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer font-bold ${detailSujet.isLikedByUser
                                                    ? 'bg-rose-950/30 text-rose-500 border border-rose-900/50 shadow-sm'
                                                    : 'bg-[#080d1a] text-slate-400 hover:bg-slate-800 border border-slate-800'
                                                    }`}
                                            >
                                                <motion.div
                                                    key={detailSujet.isLikedByUser ? 'liked' : 'unliked'}
                                                    initial={{ scale: 0.8 }}
                                                    animate={{ scale: [0.8, 1.35, 1] }}
                                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                                >
                                                    <Heart className={`w-4 h-4 transition-colors ${detailSujet.isLikedByUser ? 'fill-rose-500 text-rose-500' : 'text-slate-400 fill-transparent'}`} />
                                                </motion.div>
                                                <span>{detailSujet.likesCount} J'aime</span>
                                            </button>

                                            {isUserOwnerOfSujet(detailSujet) ? (
                                                <button
                                                    onClick={() => onDeleteSujet(detailSujet.id)}
                                                    className="text-xs text-rose-500 hover:text-rose-400 font-bold flex items-center gap-1.5 cursor-pointer hover:bg-rose-950/50 px-3 py-1.5 rounded-xl transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Supprimer ma publication</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onReportSujet(detailSujet)}
                                                    className="text-xs text-slate-400 hover:text-rose-500 font-bold flex items-center gap-1 cursor-pointer hover:bg-slate-800 px-3 py-1.5 rounded-xl transition-colors"
                                                >
                                                    <Flag className="w-3.5 h-3.5" />
                                                    <span>Signaler</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center justify-between px-1">
                                            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                                                <span>Commentaires</span>
                                                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full text-[10px] font-black">
                                                    {topLevelComments.length}
                                                </span>
                                            </h3>
                                        </div>

                                        {topLevelComments.length === 0 ? (
                                            <div className="p-10 text-center bg-[#020617] border border-slate-800 rounded-3xl space-y-2">
                                                <MessageCircle className="w-8 h-8 text-slate-600 mx-auto" />
                                                <p className="text-xs font-bold text-slate-400">Aucun commentaire pour le moment</p>
                                                <p className="text-[11px] text-slate-500 font-medium">Soyez le premier apprenant à partager votre avis !</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {topLevelComments.slice(0, visibleTopCommentsCount).map((comm: any) => {
                                                    const subReplies = getSubReplies(comm.id);
                                                    return (
                                                        <CommentItem
                                                            key={comm.id}
                                                            comment={comm}
                                                            currentUserId={currentUserId}
                                                            currentUserEmail={currentUserEmail}
                                                            subReplies={subReplies}
                                                            expandedReplies={expandedReplies}
                                                            onToggleReplies={onToggleReplies}
                                                            onLikeToggle={onCommentLikeToggle}
                                                            onDelete={onCommentDelete}
                                                            onReport={onReportComment}
                                                            onReplyInit={onReplyInit}
                                                            onProfileClick={onProfileClick}
                                                        />
                                                    );
                                                })}

                                                {topLevelComments.length > visibleTopCommentsCount && (
                                                    <button
                                                        onClick={onShowMoreComments}
                                                        className="w-full py-3 bg-[#020617] hover:bg-slate-900 border border-slate-800 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                                                    >
                                                        <span>Afficher plus de commentaires ({topLevelComments.length - visibleTopCommentsCount} restants)</span>
                                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {detailSujet && (
                            <CommentForm
                                onSubmit={onCommentSubmit}
                                replyTarget={replyTarget}
                                onCancelReply={onCancelReply}
                                commentText={commentText}
                                onCommentTextChange={onCommentTextChange}
                                loading={commentLoading}
                            />
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
