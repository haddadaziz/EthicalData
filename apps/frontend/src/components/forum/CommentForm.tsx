'use client';

import React, { useRef, useEffect } from 'react';
import { Send, RefreshCw, Reply, X } from '@/components/icons';

interface CommentFormProps {
    onSubmit: (contenu: string, parentId?: string, mentionUserId?: string) => void;
    replyTarget: { id: string; authorName: string; mentionUserId?: string } | null;
    onCancelReply: () => void;
    commentText: string;
    onCommentTextChange: (text: string) => void;
    loading: boolean;
}

export default function CommentForm({
    onSubmit,
    replyTarget,
    onCancelReply,
    commentText,
    onCommentTextChange,
    loading,
}: CommentFormProps) {
    const commentInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (replyTarget && commentInputRef.current) {
            commentInputRef.current.focus();
        }
    }, [replyTarget]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        onSubmit(commentText, replyTarget?.id, replyTarget?.mentionUserId);
    };

    return (
        <div className="p-4 md:p-5 bg-white border-t border-slate-200 shadow-lg sticky bottom-0 z-20 space-y-3">
            {replyTarget && (
                <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-bold">
                    <div className="flex items-center gap-1.5">
                        <Reply className="w-3.5 h-3.5 text-blue-600" />
                        <span>Réponse à @{replyTarget.authorName}</span>
                    </div>
                    <button
                        type="button"
                        onClick={onCancelReply}
                        className="p-1 text-blue-500 hover:text-blue-900 rounded-md cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                    ref={commentInputRef}
                    rows={2}
                    placeholder={replyTarget ? `Répondre à ${replyTarget.authorName}...` : "Exprimez-vous ou posez une question..."}
                    value={commentText}
                    onChange={(e) => onCommentTextChange(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none resize-none transition-all"
                />
                <div className="flex justify-end gap-2">
                    {replyTarget && (
                        <button
                            type="button"
                            onClick={onCancelReply}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-all"
                        >
                            Annuler
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading || !commentText.trim()}
                        className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 shadow-md"
                    >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>{replyTarget ? "Envoyer la réponse" : "Publier"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
