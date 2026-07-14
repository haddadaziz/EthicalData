"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import LearnerProfileModal from '../../../components/LearnerProfileModal';
import { MessageSquare } from '@/components/icons';
import { Sujet, DetailSujet } from '@/lib/types';
import { getAuthorFullName } from '@/lib/forum-utils';
import FilterBar from '@/components/forum/FilterBar';
import SubjectCard from '@/components/forum/SubjectCard';
import SubjectDetailModal from '@/components/forum/SubjectDetailModal';
import ReportModal from '@/components/forum/ReportModal';
import NewSubjectModal from '@/components/forum/NewSubjectModal';

export default function CommunityPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [sujets, setSujets] = useState<Sujet[]>([]);
    const [certs, setCerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('TOUS');
    const [selectedCert, setSelectedCert] = useState('');

    const [selectedProviderFilter, setSelectedProviderFilter] = useState('');
    const [providerFilterDropdownOpen, setProviderFilterDropdownOpen] = useState(false);
    const [certFilterDropdownOpen, setCertFilterDropdownOpen] = useState(false);

    useEffect(() => {
        setSelectedCert('');
    }, [selectedProviderFilter]);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

    const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const [fournisseurs, setFournisseurs] = useState<any[]>([]);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportSujetId, setReportSujetId] = useState<string | null>(null);
    const [reportCommentId, setReportCommentId] = useState<string | null>(null);
    const [reportType, setReportType] = useState<'SUJET' | 'COMMENTAIRE'>('SUJET');
    const [reportLoading, setReportLoading] = useState(false);

    const [selectedSujetId, setSelectedSujetId] = useState<string | null>(null);
    const [detailSujet, setDetailSujet] = useState<DetailSujet | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [newCommentText, setNewCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
    const [visibleTopCommentsCount, setVisibleTopCommentsCount] = useState(5);
    const [replyTarget, setReplyTarget] = useState<{ id: string; authorName: string; mentionUserId?: string } | null>(null);

    useEffect(() => {
        apiFetch('/users/me/profile').then((profile) => {
            if (profile) {
                setCurrentUserId(profile.id ? profile.id.toString() : null);
                setCurrentUserEmail(profile.email || null);
            }
        }).catch(() => {});
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (selectedTheme !== 'TOUS') queryParams.append('theme', selectedTheme);
            if (selectedCert) queryParams.append('certificationId', selectedCert);

            const endpoint = queryParams.toString() ? `/forum?${queryParams.toString()}` : '/forum';
            const [sujetsData, certsData, provData] = await Promise.all([
                apiFetch(endpoint),
                apiFetch('/certifications').catch(() => []),
                apiFetch('/certifications/fournisseurs').catch(() => []),
            ]);

            const listSujets = Array.isArray(sujetsData) ? sujetsData : (sujetsData?.data || []);
            const listCerts = Array.isArray(certsData) ? certsData : (certsData?.data || []);
            const listProvs = Array.isArray(provData) ? provData : (provData?.data || []);
            setSujets(listSujets);
            setCerts(listCerts);
            setFournisseurs(listProvs);
        } catch (err: any) {
            console.error("Erreur de chargement de la communauté:", err);
            showToast(err.message || "Impossible de charger les publications du forum.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedTheme, selectedCert]);

    useEffect(() => {
        const sujetIdParam = searchParams.get('sujetId');
        if (sujetIdParam && (!detailSujet || detailSujet.id !== sujetIdParam)) {
            handleOpenSujet(sujetIdParam);
        }
    }, [searchParams]);

    useEffect(() => {
        const commentIdParam = searchParams.get('commentId');
        
        if (detailSujet && commentIdParam) {
            const targetComment = detailSujet.commentaires?.find(c => c.id === commentIdParam);
            
            if (targetComment) {
                if (targetComment.parentCommentaireId) {
                    setExpandedReplies(prev => ({
                        ...prev,
                        [targetComment.parentCommentaireId as string]: true
                    }));
                }

                setTimeout(() => {
                    const commentElement = document.getElementById(`comment-${commentIdParam}`);
                    if (commentElement) {
                        commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        commentElement.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'transition-all', 'duration-500');
                        setTimeout(() => {
                            commentElement.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
                        }, 3000);
                    }
                }, 300);
            }
        }
    }, [detailSujet, searchParams]);

    const loadSujetDetail = async (id: string) => {
        setDetailLoading(true);
        try {
            const data = await apiFetch(`/forum/${id}`);
            setDetailSujet(data);
            setVisibleTopCommentsCount(5);
            setExpandedReplies({});
        } catch (err: any) {
            console.error("Erreur chargement détail sujet:", err);
            showToast(err.message || "Erreur lors de l'ouverture de la discussion.", "error");
        } finally {
            setDetailLoading(false);
        }
    };

    const handleOpenSujet = (id: string) => {
        setSelectedSujetId(id);
        setReplyTarget(null);
        loadSujetDetail(id);
    };

    const handleCreateSujet = async (data: { titre: string; theme: string; contenu: string; certificationId?: number }) => {
        setModalLoading(true);
        try {
            await apiFetch('/forum', {
                method: 'POST',
                body: {
                    titre: data.titre,
                    theme: data.theme,
                    contenu: data.contenu,
                    certificationId: data.certificationId,
                },
            });

            showToast("Votre publication a été créée avec succès !", "success");
            setIsNewSubjectModalOpen(false);
            setSelectedTheme('TOUS');
            setSelectedCert('');
            await loadData();
        } catch (err: any) {
            showToast(err.message || 'Erreur lors de la création de la publication.', "error");
        } finally {
            setModalLoading(false);
        }
    };

    const handleDeleteSujet = async (sujetId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const isConfirmed = await confirm({
            title: "Supprimer la publication",
            message: "Êtes-vous sûr de vouloir supprimer cette publication ? Tous les commentaires associés seront définitivement effacés.",
            type: "danger",
            confirmText: "Oui, supprimer",
            cancelText: "Annuler",
        });

        if (!isConfirmed) return;

        try {
            await apiFetch(`/forum/${sujetId}`, { method: 'DELETE' });
            showToast("La publication a été supprimée avec succès.", "success");
            if (selectedSujetId === sujetId) {
                setSelectedSujetId(null);
                setDetailSujet(null);
            }
            setSujets(prev => prev.filter(s => s.id !== sujetId));
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la suppression de la publication.", "error");
        }
    };

    const handleToggleLike = async (sujetId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            const res = await apiFetch(`/forum/${sujetId}/like`, { method: 'POST' });

            setSujets(prev => prev.map(s => {
                if (s.id === sujetId) {
                    return {
                        ...s,
                        isLikedByUser: res.liked,
                        likesCount: res.liked ? s.likesCount + 1 : Math.max(0, s.likesCount - 1),
                    };
                }
                return s;
            }));

            if (detailSujet && detailSujet.id === sujetId) {
                setDetailSujet(prev => prev ? {
                    ...prev,
                    isLikedByUser: res.liked,
                    likesCount: res.liked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1),
                } : null);
            }
        } catch (err: any) {
            console.error(err);
            showToast(err.message || "Erreur lors du Like.", "error");
        }
    };

    const handleToggleCommentLike = async (commentId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            const res = await apiFetch(`/forum/commentaires/${commentId}/like`, { method: 'POST' });

            if (detailSujet) {
                setDetailSujet(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        commentaires: prev.commentaires.map(c => {
                            if (c.id === commentId) {
                                const currentCount = c.likesCount || 0;
                                return {
                                    ...c,
                                    isLikedByUser: res.liked,
                                    likesCount: res.liked ? currentCount + 1 : Math.max(0, currentCount - 1),
                                };
                            }
                            return c;
                        }),
                    };
                });
            }
        } catch (err: any) {
            console.error(err);
            showToast(err.message || "Erreur lors du Like du commentaire.", "error");
        }
    };

    const handleAddComment = async (contenu: string, parentId?: string, mentionUserId?: string) => {
        if (!selectedSujetId || !contenu.trim()) return;
        setCommentLoading(true);

        try {
            const comment = await apiFetch(`/forum/${selectedSujetId}/commentaires`, {
                method: 'POST',
                body: {
                    contenu,
                    parentCommentaireId: parentId ? parseInt(parentId) : undefined,
                    mentionUserId: mentionUserId ? parseInt(mentionUserId) : undefined,
                },
            });

            setDetailSujet(prev => prev ? {
                ...prev,
                commentaires: [...prev.commentaires, comment],
                commentairesCount: prev.commentairesCount + 1,
            } : null);

            if (replyTarget) {
                setExpandedReplies(prev => ({ ...prev, [replyTarget.id]: true }));
            }

            setSujets(prev => prev.map(s => s.id === selectedSujetId ? { ...s, commentairesCount: s.commentairesCount + 1 } : s));
            setNewCommentText('');
            setReplyTarget(null);
            showToast("Votre commentaire a été publié.", "success");
        } catch (err: any) {
            showToast(err.message || 'Erreur lors de l\'ajout du commentaire.', "error");
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeleteCommentaire = async (commentId: string) => {
        const isConfirmed = await confirm({
            title: "Supprimer le commentaire",
            message: "Êtes-vous sûr de vouloir supprimer ce commentaire ?",
            type: "danger",
            confirmText: "Supprimer",
            cancelText: "Annuler",
        });

        if (!isConfirmed) return;

        try {
            await apiFetch(`/forum/commentaires/${commentId}`, { method: 'DELETE' });
            showToast("Commentaire supprimé.", "success");

            if (detailSujet) {
                setDetailSujet({
                    ...detailSujet,
                    commentaires: detailSujet.commentaires.filter(c => c.id !== commentId && c.parentCommentaireId !== commentId),
                    commentairesCount: Math.max(0, detailSujet.commentairesCount - 1),
                });
                setSujets(prev => prev.map(s => s.id === detailSujet.id ? { ...s, commentairesCount: Math.max(0, s.commentairesCount - 1) } : s));
            }
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la suppression du commentaire.", "error");
        }
    };

    const handleInitiateReply = (commId: string, authorName: string, mentionUserId?: string) => {
        setReplyTarget({ id: commId, authorName, mentionUserId });
    };

    const toggleReplies = (commId: string) => {
        setExpandedReplies(prev => ({
            ...prev,
            [commId]: !prev[commId],
        }));
    };

    const [inspectedLearnerId, setInspectedLearnerId] = useState<string | null>(null);

    const handleOpenLearnerProfile = (learnerId?: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (learnerId) {
            setInspectedLearnerId(learnerId);
        }
    };

    const handleOpenReportModal = (sujet: Sujet, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        const isOwner = (currentUserId && sujet.auteur.id === currentUserId) || (currentUserEmail && sujet.auteur.email === currentUserEmail);
        if (isOwner) {
            showToast("Vous ne pouvez pas signaler votre propre publication.", "error");
            return;
        }

        setReportType('SUJET');
        setReportSujetId(sujet.id);
        setReportCommentId(null);
        setIsReportModalOpen(true);
    };

    const handleOpenReportCommentModal = (commentId: string, authorId?: string, authorEmail?: string) => {
        const isOwner = (currentUserId && authorId === currentUserId) || (currentUserEmail && authorEmail === currentUserEmail);
        if (isOwner) {
            showToast("Vous ne pouvez pas signaler votre propre commentaire.", "error");
            return;
        }

        setReportType('COMMENTAIRE');
        setReportCommentId(commentId);
        setReportSujetId(null);
        setIsReportModalOpen(true);
    };

    const handleSubmitReport = async (motif: string, details: string) => {
        if (reportType === 'SUJET' && !reportSujetId) return;
        if (reportType === 'COMMENTAIRE' && !reportCommentId) return;

        setReportLoading(true);
        try {
            const finalMotif = motif;

            const url = reportType === 'SUJET'
                ? `/forum/${reportSujetId}/signaler`
                : `/forum/commentaires/${reportCommentId}/signaler`;

            const res = await apiFetch(url, {
                method: 'POST',
                body: { motif: finalMotif },
            });

            if (res.message && res.message.includes('déjà signalé')) {
                showToast(res.message, 'error');
                return;
            }

            showToast(reportType === 'SUJET' ? "Signalement transmis à l'équipe de modération." : "Signalement de commentaire transmis à l'équipe de modération.", "success");
            setIsReportModalOpen(false);
        } catch (err: any) {
            showToast(err.message || 'Erreur lors de l\'envoi du signalement.', 'error');
        } finally {
            setReportLoading(false);
        }
    };

    const filteredSujets = (Array.isArray(sujets) ? sujets : []).filter((s) => {
        if (!s) return false;
        
        if (selectedProviderFilter && !selectedCert) {
            if (!s.certification) return false;
            const certObj = certs.find(c => String(c.id) === String(s.certification?.id));
            if (!certObj) return false;
            
            const isMatch = String(certObj.fournisseur?.id) === String(selectedProviderFilter) ||
                            String(certObj.fournisseurId) === String(selectedProviderFilter) ||
                            String(certObj.fournisseur?.slug) === String(selectedProviderFilter);
            if (!isMatch) return false;
        }

        const titre = s.titre || '';
        const contenu = s.contenu || '';
        const name = getAuthorFullName(s.auteur);
        const search = searchTerm.toLowerCase();
        return titre.toLowerCase().includes(search) ||
            contenu.toLowerCase().includes(search) ||
            name.toLowerCase().includes(search);
    });

    const isUserOwnerOfSujet = (sujet?: Sujet | null): boolean => {
        if (!sujet || !sujet.auteur) return false;
        return !!((currentUserId && sujet.auteur.id === currentUserId) || (currentUserEmail && sujet.auteur.email === currentUserEmail));
    };

    const topLevelComments = (detailSujet && Array.isArray(detailSujet.commentaires))
        ? detailSujet.commentaires.filter(c => c && !c.parentCommentaireId)
        : [];

    const getSubReplies = (parentId: string) => {
        return (detailSujet && Array.isArray(detailSujet.commentaires))
            ? detailSujet.commentaires.filter(c => c && c.parentCommentaireId === parentId)
            : [];
    };

    const handleCloseDetail = () => {
        setSelectedSujetId(null);
        setDetailSujet(null);
        setReplyTarget(null);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <FilterBar
                searchQuery={searchTerm}
                onSearchChange={setSearchTerm}
                selectedTheme={selectedTheme}
                onThemeChange={setSelectedTheme}
                selectedProviderFilter={selectedProviderFilter}
                onProviderChange={setSelectedProviderFilter}
                selectedCert={selectedCert}
                onCertChange={setSelectedCert}
                fournisseurs={fournisseurs}
                certifications={certs}
                providerFilterDropdownOpen={providerFilterDropdownOpen}
                setProviderFilterDropdownOpen={setProviderFilterDropdownOpen}
                certFilterDropdownOpen={certFilterDropdownOpen}
                setCertFilterDropdownOpen={setCertFilterDropdownOpen}
                onNewDiscussion={() => setIsNewSubjectModalOpen(true)}
            />

            {loading ? (
                <div className="p-16 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl">
                    <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement de la communauté...</p>
                </div>
            ) : filteredSujets.length === 0 ? (
                <div className="p-16 text-center bg-white border border-slate-200/80 rounded-3xl space-y-3">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="font-extrabold text-slate-950 text-base">Aucune discussion trouvée</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Soyez le premier à lancer un échange sur ce sujet en cliquant sur "Nouvelle Discussion".
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5">
                    {filteredSujets.map((sujet) => (
                        <SubjectCard
                            key={sujet.id}
                            sujet={sujet}
                            onClick={() => handleOpenSujet(sujet.id)}
                            onProfileClick={handleOpenLearnerProfile}
                            onReportClick={handleOpenReportModal}
                            onLikeClick={handleToggleLike}
                            onDeleteClick={handleDeleteSujet}
                            isOwner={isUserOwnerOfSujet(sujet)}
                        />
                    ))}
                </div>
            )}

            <SubjectDetailModal
                selectedSujetId={selectedSujetId}
                onClose={handleCloseDetail}
                detailSujet={detailSujet}
                detailLoading={detailLoading}
                currentUserId={currentUserId || undefined}
                currentUserEmail={currentUserEmail || undefined}
                commentText={newCommentText}
                onCommentTextChange={setNewCommentText}
                commentLoading={commentLoading}
                replyTarget={replyTarget}
                onCancelReply={() => setReplyTarget(null)}
                onLikeToggle={handleToggleLike}
                onDeleteSujet={handleDeleteSujet}
                onReportSujet={handleOpenReportModal}
                onCommentLikeToggle={handleToggleCommentLike}
                onCommentDelete={handleDeleteCommentaire}
                onReportComment={handleOpenReportCommentModal}
                onReplyInit={handleInitiateReply}
                onCommentSubmit={handleAddComment}
                onProfileClick={handleOpenLearnerProfile}
                onToggleReplies={toggleReplies}
                onShowMoreComments={() => setVisibleTopCommentsCount(prev => prev + 5)}
                expandedReplies={expandedReplies}
                visibleTopCommentsCount={visibleTopCommentsCount}
                isUserOwnerOfSujet={isUserOwnerOfSujet}
                topLevelComments={topLevelComments}
                getSubReplies={getSubReplies}
            />

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={handleSubmitReport}
                loading={reportLoading}
            />

            <NewSubjectModal
                isOpen={isNewSubjectModalOpen}
                onClose={() => setIsNewSubjectModalOpen(false)}
                onSubmit={handleCreateSujet}
                fournisseurs={fournisseurs}
                certifications={certs}
                loading={modalLoading}
            />

            <LearnerProfileModal
                learnerId={inspectedLearnerId}
                onClose={() => setInspectedLearnerId(null)}
            />
        </div>
    );
}
