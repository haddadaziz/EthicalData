"use client";

import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import LearnerProfileModal from '../../../components/LearnerProfileModal';
import { MessageSquare, Heart, Plus, Search, RefreshCw, X, Send, Flag, Trash2, Award, User, Sparkles, MessageCircle, ShieldAlert, Reply, ChevronDown, ChevronUp, CornerDownRight, AtSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Sujet {
    id: string;
    titre: string;
    contenu: string;
    theme: string;
    dateCreation: string;
    likesCount: number;
    commentairesCount: number;
    auteur: {
        id: string;
        prenom: string;
        nom: string;
        email?: string;
        avatar?: string | null;
        role: string;
    };
    certification?: {
        id: string;
        nom: string;
        codeExamen?: string | null;
    } | null;
}

interface CommentaireItem {
    id: string;
    contenu: string;
    dateCreation: string;
    parentCommentaireId?: string | null;
    auteur: {
        id: string;
        prenom: string;
        nom: string;
        email?: string;
        avatar?: string | null;
        role: string;
    };
}

interface DetailSujet extends Sujet {
    isLikedByUser: boolean;
    commentaires: CommentaireItem[];
}

const THEMES = [
    'TOUS',
    'Azure & Cloud',
    'Data & AI',
    'Cybersécurité',
    'Microsoft 365',
    'Conseils Examen',
    'Carrière & Emploi',
];

export default function CommunityPage() {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [sujets, setSujets] = useState<Sujet[]>([]);
    const [certs, setCerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('TOUS');
    const [selectedCert, setSelectedCert] = useState('');

    // Utilisateur courant
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

    // Modal Nouveau Sujet
    const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState(false);
    const [newTitre, setNewTitre] = useState('');
    const [newTheme, setNewTheme] = useState('Azure & Cloud');
    const [newCertId, setNewCertId] = useState('');
    const [newContenu, setNewContenu] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    // Modal de Signalement Enrichi
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportSujetId, setReportSujetId] = useState<string | null>(null);
    const [reportReasonOption, setReportReasonOption] = useState('Contenu haineux, diffamatoire ou inapproprié');
    const [customReportDetails, setCustomReportDetails] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    const [shakeModal, setShakeModal] = useState(false);

    const triggerShake = () => {
        setShakeModal(true);
        setTimeout(() => setShakeModal(false), 450);
    };

    const REPORT_PREDEFINED_MOTIFS = [
        'Contenu haineux, diffamatoire ou inapproprié',
        'Spam, publicité non sollicitée ou lien suspect',
        'Désinformation ou fausses affirmations',
        'Harcèlement ou attaques personnelles',
        'Autre motif',
    ];

    // Tiroir/Modal de détail d'un sujet (Commentaires)
    const [selectedSujetId, setSelectedSujetId] = useState<string | null>(null);
    const [detailSujet, setDetailSujet] = useState<DetailSujet | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [newCommentText, setNewCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    // Réponses imbriquées & Pagination
    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
    const [visibleTopCommentsCount, setVisibleTopCommentsCount] = useState(5);
    const [replyTarget, setReplyTarget] = useState<{ id: string; authorName: string } | null>(null);
    const commentInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.sub ? payload.sub.toString() : (payload.id ? payload.id.toString() : null));
                setCurrentUserEmail(payload.email || null);
            } catch (e) {
                console.error("Erreur de décodage du jeton d'authentification:", e);
            }
        }
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (selectedTheme !== 'TOUS') queryParams.append('theme', selectedTheme);
            if (selectedCert) queryParams.append('certificationId', selectedCert);

            const endpoint = queryParams.toString() ? `/forum?${queryParams.toString()}` : '/forum';
            const [sujetsData, certsData] = await Promise.all([
                apiFetch(endpoint),
                apiFetch('/certifications').catch(() => []),
            ]);

            setSujets(Array.isArray(sujetsData) ? sujetsData : []);
            setCerts(Array.isArray(certsData) ? certsData : []);
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

    const handleCreateSujet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitre.trim() || !newContenu.trim()) return;
        setModalLoading(true);

        try {
            await apiFetch('/forum', {
                method: 'POST',
                body: {
                    titre: newTitre,
                    theme: newTheme,
                    contenu: newContenu,
                    certificationId: newCertId ? parseInt(newCertId) : undefined,
                },
            });

            showToast("Votre publication a été créée avec succès !", "success");
            setIsNewSubjectModalOpen(false);
            setNewTitre('');
            setNewContenu('');
            setNewCertId('');
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
                        likesCount: res.liked ? s.likesCount + 1 : Math.max(0, s.likesCount - 1),
                    };
                }
                return s;
            }));

            if (detailSujet && detailSujet.id === sujetId) {
                setDetailSujet({
                    ...detailSujet,
                    isLikedByUser: res.liked,
                    likesCount: res.liked ? detailSujet.likesCount + 1 : Math.max(0, detailSujet.likesCount - 1),
                });
            }
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSujetId || !newCommentText.trim()) return;
        setCommentLoading(true);

        try {
            const comment = await apiFetch(`/forum/${selectedSujetId}/commentaires`, {
                method: 'POST',
                body: {
                    contenu: newCommentText,
                    parentCommentaireId: replyTarget ? parseInt(replyTarget.id) : undefined,
                },
            });

            setDetailSujet(prev => prev ? {
                ...prev,
                commentaires: [...prev.commentaires, comment],
                commentairesCount: prev.commentairesCount + 1,
            } : null);

            // Ouvrir automatiquement les réponses du commentaire parent si c'était une réponse
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

    const handleInitiateReply = (commId: string, authorName: string) => {
        setReplyTarget({ id: commId, authorName });
        if (commentInputRef.current) {
            commentInputRef.current.focus();
        }
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

        setReportSujetId(sujet.id);
        setReportReasonOption('Contenu haineux, diffamatoire ou inapproprié');
        setCustomReportDetails('');
        setIsReportModalOpen(true);
    };

    const handleSubmitReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportSujetId) return;

        setReportLoading(true);
        try {
            const finalMotif = reportReasonOption === 'Autre motif'
                ? (customReportDetails.trim() ? `Autre: ${customReportDetails.trim()}` : 'Autre motif non précisé')
                : `${reportReasonOption}${customReportDetails.trim() ? ` - Précisions: ${customReportDetails.trim()}` : ''}`;

            const res = await apiFetch(`/forum/${reportSujetId}/signaler`, {
                method: 'POST',
                body: { motif: finalMotif },
            });

            if (res.message && res.message.includes('déjà signalé')) {
                triggerShake();
                showToast(res.message, 'error');
                return;
            }

            showToast("Signalement transmis à l'équipe de modération.", "success");
            setIsReportModalOpen(false);
        } catch (err: any) {
            triggerShake();
            showToast(err.message || 'Erreur lors de l\'envoi du signalement.', 'error');
        } finally {
            setReportLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredSujets = sujets.filter((s) => {
        const matchesSearch = s.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.contenu.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${s.auteur.prenom} ${s.auteur.nom}`.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getThemeColor = (theme: string) => {
        switch (theme) {
            case 'Azure & Cloud': return 'bg-sky-50 text-sky-700 border-sky-200';
            case 'Data & AI': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Cybersécurité': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Microsoft 365': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Conseils Examen': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const isUserOwnerOfSujet = (sujet: Sujet) => {
        return (currentUserId && sujet.auteur.id === currentUserId) || (currentUserEmail && sujet.auteur.email === currentUserEmail);
    };

    // Organisation des commentaires en arbre (Top-level & Réponses imbriquées)
    const topLevelComments = detailSujet
        ? detailSujet.commentaires.filter(c => !c.parentCommentaireId)
        : [];

    const getSubReplies = (parentId: string) => {
        return detailSujet
            ? detailSujet.commentaires.filter(c => c.parentCommentaireId === parentId)
            : [];
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* En-tête Communauté */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-2 max-w-2xl text-left relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-bold uppercase tracking-widest">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Forum & Entraide Apprenants</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
                        Communauté EthicalData
                    </h1>
                    <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
                        Échangez avec vos pairs, posez vos questions d'examen et partagez vos retours d'expérience sur les certifications IT.
                    </p>
                </div>

                <button
                    onClick={() => setIsNewSubjectModalOpen(true)}
                    className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl text-xs md:text-sm flex items-center gap-2.5 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all cursor-pointer shrink-0 relative z-10"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nouvelle Discussion</span>
                </button>
            </div>

            {/* Barre de Recherche & Filtres */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-4 md:p-6 space-y-4 shadow-sm text-left">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                    {/* Recherche */}
                    <div className="flex-1 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher un sujet, un mot-clé ou un auteur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-950 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filtre Certification */}
                    <select
                        value={selectedCert}
                        onChange={(e) => setSelectedCert(e.target.value)}
                        className="p-3 bg-slate-50 border border-slate-200/80 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-bold outline-none transition-all cursor-pointer"
                    >
                        <option value="">Toutes les Certifications</option>
                        {certs.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.codeExamen ? `[${c.codeExamen}] ${c.nom}` : c.nom}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={loadData}
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                        title="Rafraîchir"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                {/* Badges de Thèmes */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {THEMES.map((theme) => (
                        <button
                            key={theme}
                            onClick={() => setSelectedTheme(theme)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${selectedTheme === theme
                                ? 'bg-slate-950 text-white shadow-md'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                                }`}
                        >
                            {theme}
                        </button>
                    ))}
                </div>
            </div>

            {/* Liste des Sujets */}
            {loading ? (
                <div className="p-16 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl">
                    <span className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin inline-block mb-3" />
                    <p className="text-xs font-bold uppercase tracking-widest">Chargement de la communauté...</p>
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
                    {filteredSujets.map((sujet) => {
                        const isOwner = isUserOwnerOfSujet(sujet);
                        return (
                            <div
                                key={sujet.id}
                                onClick={() => handleOpenSujet(sujet.id)}
                                className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-6 space-y-4 cursor-pointer transition-all shadow-sm hover:shadow-md group text-left relative"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                                            {sujet.auteur.prenom[0]}{sujet.auteur.nom[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-black text-slate-950">{sujet.auteur.prenom} {sujet.auteur.nom}</h4>
                                                {isOwner && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 font-extrabold text-[9px] rounded-full">Vous</span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-semibold">{formatDate(sujet.dateCreation)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
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
                                    <h3 className="text-lg font-black text-slate-950 group-hover:text-red-600 transition-colors">
                                        {sujet.titre}
                                    </h3>
                                    <p className="text-xs text-slate-600 font-medium line-clamp-3 leading-relaxed">
                                        {sujet.contenu}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                                    <div className="flex items-center gap-5">
                                        <button
                                            onClick={(e) => handleToggleLike(sujet.id, e)}
                                            className="flex items-center gap-1.5 hover:text-rose-600 transition-colors cursor-pointer"
                                        >
                                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/10" />
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
                                                onClick={(e) => handleDeleteSujet(sujet.id, e)}
                                                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                                                title="Supprimer ma publication"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Supprimer</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => handleOpenReportModal(sujet, e)}
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
                    })}
                </div>
            )}

            {/* POPUP MODAL DE DÉTAIL SUJET & COMMENTAIRES (CENTRE + FERMETURE AU CLIC EXTÉRIEUR) */}
            <AnimatePresence>
                {selectedSujetId && (
                    <div
                        onClick={() => { setSelectedSujetId(null); setDetailSujet(null); setReplyTarget(null); }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="w-full max-w-3xl bg-slate-50 border border-slate-200/90 rounded-3xl shadow-2xl max-h-[90vh] flex flex-col justify-between text-left overflow-hidden relative"
                        >
                            {/* EN-TÊTE DE LA POPUP */}
                            <div className="p-5 md:p-6 bg-white border-b border-slate-200/80 flex items-center justify-between shadow-sm sticky top-0 z-20">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-black">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-950">Espace Échanges & Réponses</h3>
                                        <p className="text-[11px] text-slate-400 font-semibold">Discussion communautaire en direct</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setSelectedSujetId(null); setDetailSujet(null); setReplyTarget(null); }}
                                    className="p-2.5 text-slate-400 hover:text-slate-950 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* CORPS DE LA DISCUSSION */}
                            <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
                                {detailLoading || !detailSujet ? (
                                    <div className="p-16 text-center text-slate-400">
                                        <span className="w-9 h-9 border-4 border-red-100 border-t-red-600 rounded-full animate-spin inline-block mb-3" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Chargement de la discussion...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* SUJET PRINCIPAL EN-TÊTE DÉTAILLÉ */}
                                        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-sm">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        onClick={(e) => handleOpenLearnerProfile(detailSujet.auteur.id, e)}
                                                        className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-black text-sm shadow-md cursor-pointer hover:scale-105 transition-transform"
                                                    >
                                                        {detailSujet.auteur.prenom[0]}{detailSujet.auteur.nom[0]}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4
                                                                onClick={(e) => handleOpenLearnerProfile(detailSujet.auteur.id, e)}
                                                                className="text-xs font-black text-slate-950 hover:underline cursor-pointer"
                                                            >
                                                                {detailSujet.auteur.prenom} {detailSujet.auteur.nom}
                                                            </h4>
                                                            <span
                                                                onClick={(e) => handleOpenLearnerProfile(detailSujet.auteur.id, e)}
                                                                className="text-[10px] text-slate-400 font-bold hover:text-red-600 transition-colors cursor-pointer"
                                                            >
                                                                @{detailSujet.auteur.prenom.toLowerCase()}_{detailSujet.auteur.nom.toLowerCase()}
                                                            </span>
                                                            {isUserOwnerOfSujet(detailSujet) && (
                                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 font-extrabold text-[9px] rounded-full">Auteur</span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-semibold">{formatDate(detailSujet.dateCreation)}</span>
                                                    </div>
                                                </div>

                                                <span className={`text-[10px] font-black px-3 py-1 rounded-xl border ${getThemeColor(detailSujet.theme)}`}>
                                                    {detailSujet.theme}
                                                </span>
                                            </div>

                                            <h2 className="text-xl font-black text-slate-950 leading-snug">{detailSujet.titre}</h2>
                                            
                                            <div className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-2xl text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                                                {detailSujet.contenu}
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                                                <button
                                                    onClick={() => handleToggleLike(detailSujet.id)}
                                                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${detailSujet.isLikedByUser
                                                        ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    <Heart className={`w-4 h-4 ${detailSujet.isLikedByUser ? 'fill-rose-600 text-rose-600' : ''}`} />
                                                    <span>{detailSujet.likesCount} J'aime</span>
                                                </button>

                                                {isUserOwnerOfSujet(detailSujet) ? (
                                                    <button
                                                        onClick={() => handleDeleteSujet(detailSujet.id)}
                                                        className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 cursor-pointer hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        <span>Supprimer ma publication</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenReportModal(detailSujet)}
                                                        className="text-xs text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-colors"
                                                    >
                                                        <Flag className="w-3.5 h-3.5" />
                                                        <span>Signaler</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* SECTION COMMENTAIRES & RÉPONSES IMBRIQUÉES */}
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
                                                    {topLevelComments.slice(0, visibleTopCommentsCount).map((comm) => {
                                                        const isCommOwner = (currentUserId && comm.auteur.id === currentUserId) || (currentUserEmail && comm.auteur.email === currentUserEmail);
                                                        const subReplies = getSubReplies(comm.id);
                                                        const isExpanded = !!expandedReplies[comm.id];

                                                        return (
                                                            <div key={comm.id} className="bg-white border border-slate-200/90 rounded-3xl p-4 md:p-5 space-y-3 shadow-sm text-left">
                                                                {/* En-tête commentaire top-level */}
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div
                                                                            onClick={(e) => handleOpenLearnerProfile(comm.auteur.id, e)}
                                                                            className="w-8 h-8 rounded-xl bg-slate-950 text-white font-black text-xs flex items-center justify-center cursor-pointer shrink-0"
                                                                        >
                                                                            {comm.auteur.prenom[0]}{comm.auteur.nom[0]}
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span
                                                                                    onClick={(e) => handleOpenLearnerProfile(comm.auteur.id, e)}
                                                                                    className="font-black text-slate-950 hover:underline cursor-pointer"
                                                                                >
                                                                                    {comm.auteur.prenom} {comm.auteur.nom}
                                                                                </span>
                                                                                <button
                                                                                    onClick={(e) => handleOpenLearnerProfile(comm.auteur.id, e)}
                                                                                    className="text-[10px] text-slate-400 font-bold hover:text-blue-600 transition-colors"
                                                                                >
                                                                                    @{comm.auteur.prenom.toLowerCase()}_{comm.auteur.nom.toLowerCase()}
                                                                                </button>
                                                                                {isCommOwner && (
                                                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-extrabold text-[9px] rounded-full">Vous</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-[10px] text-slate-400 font-semibold">{formatDate(comm.dateCreation)}</span>
                                                                </div>

                                                                {/* Contenu commentaire */}
                                                                <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed pl-1">
                                                                    {comm.contenu}
                                                                </p>

                                                                {/* Barre d'action commentaire */}
                                                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-bold">
                                                                    <div className="flex items-center gap-3">
                                                                        <button
                                                                            onClick={() => handleInitiateReply(comm.id, `${comm.auteur.prenom} ${comm.auteur.nom}`)}
                                                                            className="text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 hover:bg-blue-50 rounded-lg"
                                                                        >
                                                                            <Reply className="w-3.5 h-3.5" />
                                                                            <span>Répondre</span>
                                                                        </button>

                                                                        {isCommOwner && (
                                                                            <button
                                                                                onClick={() => handleDeleteCommentaire(comm.id)}
                                                                                className="text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 hover:bg-rose-50 rounded-lg"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                                <span>Supprimer</span>
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    {/* Bouton déplier/replier les réponses */}
                                                                    {subReplies.length > 0 && (
                                                                        <button
                                                                            onClick={() => toggleReplies(comm.id)}
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

                                                                {/* REPONSES IMBRIQUÉES AVEC INDENTATION (REDDIT/TWITTER STYLE) */}
                                                                <AnimatePresence>
                                                                    {isExpanded && subReplies.length > 0 && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: 'auto' }}
                                                                            exit={{ opacity: 0, height: 0 }}
                                                                            transition={{ duration: 0.25 }}
                                                                            className="ml-4 md:ml-6 border-l-2 border-red-200/80 pl-3 md:pl-4 space-y-3 pt-2"
                                                                        >
                                                                            {subReplies.map((sub) => {
                                                                                const isSubOwner = (currentUserId && sub.auteur.id === currentUserId) || (currentUserEmail && sub.auteur.email === currentUserEmail);
                                                                                return (
                                                                                    <div key={sub.id} className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2 text-left relative">
                                                                                        <div className="flex items-center justify-between text-xs">
                                                                                            <div className="flex items-center gap-2">
                                                                                                                                                                               <span
                                                                                                    onClick={(e) => handleOpenLearnerProfile(sub.auteur.id, e)}
                                                                                                    className="font-black text-slate-950 hover:underline cursor-pointer"
                                                                                                >
                                                                                                    {sub.auteur.prenom} {sub.auteur.nom}
                                                                                                </span>
                                                                                                
                                                                                                                                                 <span
                                                                                                    onClick={(e) => handleOpenLearnerProfile(comm.auteur.id, e)}
                                                                                                    className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-100/70 text-blue-700 font-extrabold text-[9px] rounded-md hover:underline cursor-pointer"
                                                                                                >
                                                                                                    <AtSign className="w-2.5 h-2.5" />
                                                                                                    {comm.auteur.prenom}
                                                                                                </span>

                                                                                                {isSubOwner && (
                                                                                                    <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 font-extrabold text-[8px] rounded-full">Vous</span>
                                                                                                )}
                                                                                            </div>
                                                                                            <span className="text-[9px] text-slate-400 font-semibold">{formatDate(sub.dateCreation)}</span>
                                                                                        </div>

                                                                                        <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap pl-5">
                                                                                            {sub.contenu}
                                                                                        </p>

                                                                                        <div className="flex items-center justify-end gap-3 pt-1 text-[10px] font-bold">
                                                                                            <button
                                                                                                onClick={() => handleInitiateReply(comm.id, `${sub.auteur.prenom} ${sub.auteur.nom}`)}
                                                                                                className="text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
                                                                                            >
                                                                                                <Reply className="w-3 h-3" />
                                                                                                <span>Répondre</span>
                                                                                            </button>

                                                                                            {isSubOwner && (
                                                                                                <button
                                                                                                    onClick={() => handleDeleteCommentaire(sub.id)}
                                                                                                    className="text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                                                                                                >
                                                                                                    <Trash2 className="w-3 h-3" />
                                                                                                    <span>Supprimer</span>
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        );
                                                    })}

                                                    {/* PAGINATION DE COMMENTAIRES (5 PAR 5) */}
                                                    {topLevelComments.length > visibleTopCommentsCount && (
                                                        <button
                                                            onClick={() => setVisibleTopCommentsCount(prev => prev + 5)}
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

                            {/* FORMULAIRE DE COMMENTAIRE STICKY AU BAS DU TIROIR */}
                            {detailSujet && (
                                <div className="p-4 md:p-5 bg-white border-t border-slate-200 shadow-lg sticky bottom-0 z-20 space-y-3">
                                    {replyTarget && (
                                        <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-bold">
                                            <div className="flex items-center gap-1.5">
                                                <Reply className="w-3.5 h-3.5 text-blue-600" />
                                                <span>Réponse à @{replyTarget.authorName}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setReplyTarget(null)}
                                                className="p-1 text-blue-500 hover:text-blue-900 rounded-md cursor-pointer"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    <form onSubmit={handleAddComment} className="space-y-3">
                                        <textarea
                                            ref={commentInputRef}
                                            rows={2}
                                            placeholder={replyTarget ? `Répondre à ${replyTarget.authorName}...` : "Exprimez-vous ou posez une question..."}
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none resize-none transition-all"
                                        />
                                        <div className="flex justify-end gap-2">
                                            {replyTarget && (
                                                <button
                                                    type="button"
                                                    onClick={() => setReplyTarget(null)}
                                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-all"
                                                >
                                                    Annuler
                                                </button>
                                            )}
                                            <button
                                                type="submit"
                                                disabled={commentLoading || !newCommentText.trim()}
                                                className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 shadow-md"
                                            >
                                                {commentLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                <span>{replyTarget ? "Envoyer la réponse" : "Publier"}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DE SIGNALEMENT */}
            <AnimatePresence>
                {isReportModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={shakeModal ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 text-left relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                                        <ShieldAlert className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-950">Signaler cette publication</h3>
                                        <p className="text-xs font-semibold text-slate-500">Aidez-nous à préserver un espace sécurisé.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsReportModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-950 rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitReport} className="space-y-5">
                                <div className="space-y-2.5">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Motif principal</label>
                                    <div className="space-y-2">
                                        {REPORT_PREDEFINED_MOTIFS.map((motifOption) => (
                                            <label
                                                key={motifOption}
                                                className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${reportReasonOption === motifOption
                                                    ? 'bg-rose-50/60 border-rose-300 text-rose-950 shadow-sm'
                                                    : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-100 text-slate-700'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="reportReason"
                                                    value={motifOption}
                                                    checked={reportReasonOption === motifOption}
                                                    onChange={(e) => setReportReasonOption(e.target.value)}
                                                    className="accent-rose-600 w-4 h-4 cursor-pointer"
                                                />
                                                <span>{motifOption}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Précisions supplémentaires (Optionnel)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Fournissez plus de contexte si nécessaire..."
                                        value={customReportDetails}
                                        onChange={(e) => setCustomReportDetails(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200/80 focus:border-rose-600 rounded-xl text-slate-950 text-xs font-semibold outline-none resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsReportModalOpen(false)}
                                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={reportLoading}
                                        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-rose-600/20 cursor-pointer"
                                    >
                                        {reportLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                                        <span>Confirmer le signalement</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL CRÉATION DE SUJET */}
            <AnimatePresence>
                {isNewSubjectModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6 text-left"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <h3 className="text-lg font-black text-slate-950">Nouvelle Discussion</h3>
                                <button
                                    onClick={() => setIsNewSubjectModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-950 rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSujet} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Titre de la discussion *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: Conseils pour réussir l'examen AZ-900..."
                                        value={newTitre}
                                        onChange={(e) => setNewTitre(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">Thématique *</label>
                                        <select
                                            value={newTheme}
                                            onChange={(e) => setNewTheme(e.target.value)}
                                            className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-bold outline-none cursor-pointer"
                                        >
                                            {THEMES.filter(t => t !== 'TOUS').map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">Certification liée (Optionnel)</label>
                                        <select
                                            value={newCertId}
                                            onChange={(e) => setNewCertId(e.target.value)}
                                            className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-bold outline-none cursor-pointer"
                                        >
                                            <option value="">Aucune certification spécifique</option>
                                            {certs.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.codeExamen ? `[${c.codeExamen}] ${c.nom}` : c.nom}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Contenu / Question *</label>
                                    <textarea
                                        required
                                        rows={5}
                                        placeholder="Décrivez précisément votre question ou votre retour d'expérience..."
                                        value={newContenu}
                                        onChange={(e) => setNewContenu(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsNewSubjectModalOpen(false)}
                                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={modalLoading}
                                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-red-600/20 cursor-pointer"
                                    >
                                        {modalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        <span>Publier la discussion</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODALE DE PROFIL PUBLIC APPRENANT */}
            <LearnerProfileModal
                learnerId={inspectedLearnerId}
                onClose={() => setInspectedLearnerId(null)}
            />
        </div>
    );
}