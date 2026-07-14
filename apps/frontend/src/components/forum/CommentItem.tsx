'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Flag, Trash2, Reply, ChevronDown, ChevronUp, AtSign } from '@/components/icons';
import { formatDate, getAuthorFullName, getAuthorInitials, getAuthorHandle } from '@/lib/forum-utils';
import { CommentaireItem } from '@/lib/types';

interface CommentItemProps {
    comment: CommentaireItem;
    isSubReply?: boolean;
    currentUserId: string | undefined;
    currentUserEmail: string | undefined;
    subReplies?: CommentaireItem[];
    expandedReplies?: Record<string, boolean>;
    onToggleReplies?: (commId: string) => void;
    onLikeToggle: (commentId: string, e?: React.MouseEvent) => void;
    onDelete: (commentId: string) => void;
    onReport: (commentId: string, authorId?: string, authorEmail?: string) => void;
    onReplyInit: (commId: string, authorName: string, mentionUserId?: string) => void;
    onProfileClick: (learnerId?: string, e?: React.MouseEvent) => void;
    parentAuthor?: { id?: string; prenom?: string; nom?: string };
}

export default function CommentItem({
    comment,
    isSubReply = false,
    currentUserId,
    currentUserEmail,
    subReplies,
    expandedReplies,
    onToggleReplies,
    onLikeToggle,
    onDelete,
    onReport,
    onReplyInit,
    onProfileClick,
    parentAuthor,
}: CommentItemProps) {
    const isOwner = (currentUserId && comment.auteur?.id === currentUserId) || (currentUserEmail && comment.auteur?.email === currentUserEmail);
    const isExpanded = expandedReplies?.[comment.id];

    if (isSubReply) {
        const isSubOwner = (currentUserId && comment.auteur?.id === currentUserId) || (currentUserEmail && comment.auteur?.email === currentUserEmail);
        return (
            <div key={comment.id} id={`comment-${comment.id}`} className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2 text-left relative">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        {comment.auteur?.avatar ? (
                            <img
                                src={comment.auteur.avatar}
                                alt={getAuthorFullName(comment.auteur)}
                                onClick={(e) => onProfileClick(comment.auteur?.id, e)}
                                className="w-6 h-6 rounded-lg object-cover border border-slate-200 cursor-pointer shrink-0"
                            />
                        ) : (
                            <div
                                onClick={(e) => onProfileClick(comment.auteur?.id, e)}
                                className="w-6 h-6 rounded-lg bg-slate-900 text-white font-black text-[9px] flex items-center justify-center cursor-pointer shrink-0"
                            >
                                {getAuthorInitials(comment.auteur)}
                            </div>
                        )}
                        <span
                            onClick={(e) => onProfileClick(comment.auteur?.id, e)}
                            className="font-black text-slate-950 hover:underline cursor-pointer"
                        >
                            {getAuthorFullName(comment.auteur)}
                        </span>
                        
                        {parentAuthor && (
                            <span
                                onClick={(e) => onProfileClick(parentAuthor?.id, e)}
                                className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-100/70 text-blue-700 font-extrabold text-[9px] rounded-md hover:underline cursor-pointer"
                            >
                                <AtSign className="w-2.5 h-2.5" />
                                {parentAuthor.prenom || 'Utilisateur'}
                            </span>
                        )}

                        {comment.mentionUser && comment.mentionUser.id !== parentAuthor?.id && (
                            <span
                                onClick={(e) => onProfileClick(comment.mentionUser?.id, e)}
                                className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-indigo-100/70 text-indigo-700 font-extrabold text-[9px] rounded-md hover:underline cursor-pointer"
                            >
                                <AtSign className="w-2.5 h-2.5" />
                                {comment.mentionUser.prenom}
                            </span>
                        )}

                        {isSubOwner && (
                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 font-extrabold text-[8px] rounded-full">Vous</span>
                        )}
                    </div>
                    <span className="text-[9px] text-slate-400 font-semibold">{formatDate(comment.dateCreation)}</span>
                </div>

                <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap pl-5">
                    {comment.contenu}
                </p>

                <div className="flex items-center justify-end gap-3 pt-1 text-[10px] font-bold">
                    <button
                        onClick={(e) => onLikeToggle(comment.id, e)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            comment.isLikedByUser
                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                : 'bg-slate-100/80 text-slate-500 border-slate-200/60 hover:bg-slate-200/80 hover:text-slate-700'
                        }`}
                        title={comment.isLikedByUser ? "Je n'aime plus" : "J'aime cette réponse"}
                    >
                        <motion.div
                            key={comment.isLikedByUser ? 'sub-liked' : 'sub-unliked'}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: [0.8, 1.3, 1] }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            <Heart className={`w-3 h-3 transition-colors ${comment.isLikedByUser ? 'fill-rose-600 text-rose-600' : 'text-slate-400 fill-transparent'}`} />
                        </motion.div>
                        <span>{comment.likesCount || 0}</span>
                    </button>

                    <button
                        onClick={() => onReplyInit(comment.id, getAuthorFullName(comment.auteur), comment.auteur?.id)}
                        className="text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                        <Reply className="w-3 h-3" />
                        <span>Répondre</span>
                    </button>

                    {isSubOwner && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                            <span>Supprimer</span>
                        </button>
                    )}

                    {!isSubOwner && (
                        <button
                            onClick={() => onReport(comment.id, comment.auteur?.id, comment.auteur?.email)}
                            className="text-slate-400 hover:text-amber-600 flex items-center gap-1 cursor-pointer transition-colors"
                            title="Signaler ce commentaire"
                        >
                            <Flag className="w-3 h-3" />
                            <span>Signaler</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div key={comment.id} id={`comment-${comment.id}`} className="bg-white border border-slate-200/90 rounded-3xl p-4 md:p-5 space-y-3 shadow-sm text-left">
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                    {comment.auteur?.avatar ? (
                        <img
                            src={comment.auteur.avatar}
                            alt={getAuthorFullName(comment.auteur)}
                            onClick={(e) => onProfileClick(comment.auteur?.id, e)}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-200 cursor-pointer shrink-0"
                        />
                    ) : (
                        <div
                            onClick={(e) => onProfileClick(comment.auteur?.id, e)}
                            className="w-8 h-8 rounded-xl bg-slate-950 text-white font-black text-xs flex items-center justify-center cursor-pointer shrink-0"
                        >
                            {getAuthorInitials(comment.auteur)}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span
                                onClick={(e) => onProfileClick(comment.auteur?.id, e)}
                                className="font-black text-slate-950 hover:underline cursor-pointer"
                            >
                                {getAuthorFullName(comment.auteur)}
                            </span>
                            <button
                                onClick={(e) => onProfileClick(comment.auteur?.id, e)}
                                className="text-[10px] text-slate-400 font-bold hover:text-blue-600 transition-colors"
                            >
                                @{getAuthorHandle(comment.auteur)}
                            </button>
                            {isOwner && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-extrabold text-[9px] rounded-full">Vous</span>
                            )}
                        </div>
                    </div>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{formatDate(comment.dateCreation)}</span>
            </div>

            <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed pl-1">
                {comment.contenu}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-bold">
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => onLikeToggle(comment.id, e)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                            comment.isLikedByUser
                                ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm'
                                : 'bg-slate-50 text-slate-500 border-slate-200/60 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                        title={comment.isLikedByUser ? "Je n'aime plus" : "J'aime ce commentaire"}
                    >
                        <motion.div
                            key={comment.isLikedByUser ? 'comm-liked' : 'comm-unliked'}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: [0.8, 1.3, 1] }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            <Heart className={`w-3.5 h-3.5 transition-colors ${comment.isLikedByUser ? 'fill-rose-600 text-rose-600' : 'text-slate-400 fill-transparent'}`} />
                        </motion.div>
                        <span>{comment.likesCount || 0}</span>
                    </button>

                    <button
                        onClick={() => onReplyInit(comment.id, getAuthorFullName(comment.auteur))}
                        className="text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 hover:bg-blue-50 rounded-lg"
                    >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Répondre</span>
                    </button>

                    {isOwner && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 hover:bg-rose-50 rounded-lg"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Supprimer</span>
                        </button>
                    )}

                    {!isOwner && (
                        <button
                            onClick={() => onReport(comment.id, comment.auteur?.id, comment.auteur?.email)}
                            className="text-slate-400 hover:text-amber-600 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 hover:bg-amber-50 rounded-lg"
                            title="Signaler ce commentaire"
                        >
                            <Flag className="w-3.5 h-3.5" />
                            <span>Signaler</span>
                        </button>
                    )}
                </div>

                {subReplies && subReplies.length > 0 && onToggleReplies && (
                    <button
                        onClick={() => onToggleReplies(comment.id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-extrabold cursor-pointer px-2.5 py-1 bg-blue-50/80 rounded-xl transition-colors"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-3.5 h-3.5" />
                                <span>Masquer {subReplies.length} réponse{subReplies.length > 1 ? 's' : ''}</span>
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-3.5 h-3.5" />
                                <span>Afficher {subReplies.length} réponse{subReplies.length > 1 ? 's' : ''}</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && subReplies && subReplies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="ml-4 md:ml-6 border-l-2 border-red-200/80 pl-3 md:pl-4 space-y-3 pt-2"
                    >
                        {subReplies.map((sub: any) => (
                            <CommentItem
                                key={sub.id}
                                comment={sub}
                                isSubReply
                                currentUserId={currentUserId}
                                currentUserEmail={currentUserEmail}
                                onLikeToggle={onLikeToggle}
                                onDelete={onDelete}
                                onReport={onReport}
                                onReplyInit={onReplyInit}
                                onProfileClick={onProfileClick}
                                parentAuthor={comment.auteur}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
