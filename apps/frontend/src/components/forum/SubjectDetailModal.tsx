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
                        className="w-full max-w-3xl bg-slate-50 border-t sm:border border-slate-200/90 rounded-t-3xl sm:rounded-3xl shadow-2xl h-[92vh] sm:max-h-[90vh] flex flex-col justify-between text-left overflow-hidden relative"
                    >
                        <div className="p-5 md:p-6 bg-white border-b border-slate-200/80 flex items-center justify-between shadow-sm sticky top-0 z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-950">Espace Échanges & Réponses</h3>
                                    <p className="text-[11px] text-slate-400 font-semibold">Discussion communautaire en direct</p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2.5 text-slate-400 hover:text-slate-950 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
                            {detailLoading || !detailSujet ? (
                                <div className="p-16 text-center text-slate-400">
                                    <span className="w-9 h-9 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement de la discussion...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                            <div className="flex items-center gap-3">
                                                 {detailSujet?.auteur?.avatar ? (
                                                     <img
                                                         src={detailSujet.auteur.avatar}
                                                         alt={getAuthorFullName(detailSujet?.auteur)}
                                                         onClick={(e) => onProfileClick(detailSujet?.auteur?.id, e)}
                                                         className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0"
                                                     />
                                                 ) : (
                                                     <div
                                                         onClick={(e) => onProfileClick(detailSujet?.auteur?.id, e)}
                                                         className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0"
                                                     >
                                                         {getAuthorInitials(detailSujet?.auteur)}
                                                     </div>
                                                 )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4
                                                            onClick={(e) => onProfileClick(detailSujet?.auteur?.id, e)}
                                                            className="text-xs font-black text-slate-950 hover:underline cursor-pointer"
                                                        >
                                                            {getAuthorFullName(detailSujet?.auteur)}
                                                        </h4>
                                                        <span
                                                            onClick={(e) => onProfileClick(detailSujet?.auteur?.id, e)}
                                                            className="text-[10px] text-slate-400 font-bold hover:text-blue-600 transition-colors cursor-pointer"
                                                        >
                                                            @{getAuthorHandle(detailSujet?.auteur)}
                                                        </span>
                                                        {isUserOwnerOfSujet(detailSujet) && (
                                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-extrabold text-[9px] rounded-full">Auteur</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-semibold">{formatDate(detailSujet.dateCreation)}</span>
                                                </div>
                                            </div>

                                            <span className={`text-[10px] font-black px-3 py-1 rounded-xl border self-start sm:self-auto ${getThemeColor(detailSujet.theme)}`}>
                                                {detailSujet.theme}
                                            </span>
                                        </div>

                                        <h2 className="text-xl font-black text-slate-950 leading-snug">{detailSujet.titre}</h2>
                                        
                                        <div className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-2xl text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                                            {detailSujet.contenu}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                                            <button
                                                onClick={() => onLikeToggle(detailSujet.id)}
                                                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer font-bold ${detailSujet.isLikedByUser
                                                    ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                                                    }`}
                                            >
                                                <motion.div
                                                    key={detailSujet.isLikedByUser ? 'liked' : 'unliked'}
                                                    initial={{ scale: 0.8 }}
                                                    animate={{ scale: [0.8, 1.35, 1] }}
                                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                                >
                                                    <Heart className={`w-4 h-4 transition-colors ${detailSujet.isLikedByUser ? 'fill-rose-600 text-rose-600' : 'text-slate-400 fill-transparent'}`} />
                                                </motion.div>
                                                <span>{detailSujet.likesCount} J'aime</span>
                                            </button>

                                            {isUserOwnerOfSujet(detailSujet) ? (
                                                <button
                                                    onClick={() => onDeleteSujet(detailSujet.id)}
                                                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 cursor-pointer hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Supprimer ma publication</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onReportSujet(detailSujet)}
                                                    className="text-xs text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-colors"
                                                >
                                                    <Flag className="w-3.5 h-3.5" />
                                                    <span>Signaler</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center justify-between px-1">
                                            <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                                                <span>Commentaires</span>
                                                <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded-full text-[10px] font-black">
                                                    {topLevelComments.length}
                                                </span>
                                            </h3>
                                        </div>

                                        {topLevelComments.length === 0 ? (
                                            <div className="p-10 text-center bg-white border border-slate-200/70 rounded-3xl space-y-2">
                                                <MessageCircle className="w-8 h-8 text-slate-300 mx-auto" />
                                                <p className="text-xs font-bold text-slate-600">Aucun commentaire pour le moment</p>
                                                <p className="text-[11px] text-slate-400 font-medium">Soyez le premier apprenant à partager votre avis !</p>
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
                                                        className="w-full py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                                                    >
                                                        <span>Afficher plus de commentaires ({topLevelComments.length - visibleTopCommentsCount} restants)</span>
                                                        <ChevronDown className="w-4 h-4 text-slate-500" />
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
