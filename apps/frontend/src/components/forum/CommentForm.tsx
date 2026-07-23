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
        <div className="p-4 md:p-5 bg-[#020617] border-t border-slate-800 shadow-2xl sticky bottom-0 z-20 space-y-3">
            {replyTarget && (
                <div className="flex items-center justify-between px-3 py-1.5 bg-blue-950/30 border border-blue-900/50 rounded-xl text-xs text-cyan-400 font-bold">
                    <div className="flex items-center gap-1.5">
                        <Reply className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Réponse à @{replyTarget.authorName}</span>
                    </div>
                    <button
                        type="button"
                        onClick={onCancelReply}
                        className="p-1 text-cyan-300 hover:text-cyan-200 rounded-md cursor-pointer"
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
                    className="w-full p-3 bg-[#080d1a] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none resize-none transition-all"
                />
                <div className="flex justify-end gap-2">
                    {replyTarget && (
                        <button
                            type="button"
                            onClick={onCancelReply}
                            className="px-4 py-2 bg-[#080d1a] hover:bg-slate-800 border border-slate-800 text-slate-400 font-bold rounded-xl text-xs cursor-pointer transition-all"
                        >
                            Annuler
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading || !commentText.trim()}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                    >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>{replyTarget ? "Envoyer la réponse" : "Publier"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
