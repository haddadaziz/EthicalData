"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import LearnerProfileModal from '../../../components/LearnerProfileModal';
import { MessageSquare, Heart, MessageCircle, Flag, ShieldAlert, CheckCircle, Trash2, Search, Eye, RotateCcw, X, ExternalLink } from '@/components/icons';
import Link from 'next/link';

interface AdminStats {
  totalSujets: number;
  totalCommentaires: number;
  totalLikes: number;
  signalementsPending: number;
}

interface Signalement {
  id: string;
  motif?: string | null;
  dateCreation: string;
  traite: boolean;
  type?: 'SUJET' | 'COMMENTAIRE';
  commentaireId?: string;
  signalePar: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  sujet: {
    id: string;
    titre: string;
    contenu: string;
    theme: string;
    dateCreation: string;
    auteur: {
      id: string;
      prenom: string;
      nom: string;
      email: string;
      avatar?: string;
      role?: string;
    };
    commentairesCount: number;
    likesCount: number;
  };
}

const getInitial = (str?: string) => (str && str.length > 0 ? str[0].toUpperCase() : '');
const getAuthorInitials = (auteur?: { prenom?: string; nom?: string }) => {
  const p = getInitial(auteur?.prenom) || 'U';
  const n = getInitial(auteur?.nom);
  return `${p}${n}`;
};
const getAuthorFullName = (auteur?: any) => {
  if (!auteur) return 'Utilisateur anonyme';
  const prenom = auteur.prenom || '';
  const nom = auteur.nom || '';
  const name = `${prenom} ${nom}`.trim();
  return name || auteur.email || 'Utilisateur';
};
const getAuthorEmail = (auteur?: any) => {
  if (!auteur) return '';
  return auteur.email || '';
};
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const AvatarDisplay = React.memo(function AvatarDisplay({ auteur, size = 'md', onClickAvatar }: {
  auteur?: { avatar?: string | null; prenom?: string; nom?: string };
  size?: 'sm' | 'md' | 'lg';
  onClickAvatar?: (e: React.MouseEvent) => void;
}) {
  const sizeMap = {
    sm: { container: 'w-6 h-6 rounded-lg', font: 'text-[8px]' },
    md: { container: 'w-8 h-8 rounded-xl', font: 'text-[10px]' },
    lg: { container: 'w-10 h-10 rounded-2xl', font: 'text-sm' },
  };
  const s = sizeMap[size];
  const initials = getAuthorInitials(auteur);

  return auteur?.avatar ? (
    <img
      src={auteur.avatar}
      alt={getAuthorFullName(auteur)}
      onClick={onClickAvatar}
      className={`${s.container} object-cover border border-slate-200 shadow-md shrink-0 cursor-pointer hover:scale-105 transition-transform`}
    />
  ) : (
    <div
      onClick={onClickAvatar}
      className={`${s.container} bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black ${s.font} shadow-md shrink-0 cursor-pointer hover:scale-105 transition-transform`}
    >
      {initials}
    </div>
  );
});

const SujetCard = React.memo(function SujetCard({ sujet, onInspect, onDelete, onOpenProfile }: {
  sujet: any;
  onInspect: (id: string) => void;
  onDelete: (id: string, titre: string) => void;
  onOpenProfile: (learnerId: string) => void;
}) {
  const openProfile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (sujet?.auteur?.id) onOpenProfile(sujet.auteur.id);
  }, [sujet?.auteur?.id, onOpenProfile]);

  const handleCardClick = useCallback(() => {
    onInspect(sujet.id);
  }, [sujet.id, onInspect]);

  return (
    <div
      onClick={handleCardClick}
      className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-6 space-y-4 transition-all shadow-sm hover:shadow-md text-left cursor-pointer"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AvatarDisplay auteur={sujet?.auteur} size="lg" onClickAvatar={openProfile} />
          <div>
            <div className="flex items-center gap-2">
              <h4
                onClick={openProfile}
                className="text-xs font-black text-slate-950 hover:underline cursor-pointer"
              >
                {getAuthorFullName(sujet?.auteur)}
              </h4>
              <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                {sujet?.auteur?.role || 'APPRENANT'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">{formatDate(sujet.dateCreation)}</span>
          </div>
        </div>
        <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded uppercase shrink-0">
          {sujet.theme}
        </span>
      </div>

      <h3 className="font-extrabold text-slate-950 text-base">{sujet.titre}</h3>
      <p className="text-xs text-slate-600 font-medium line-clamp-2">{sujet.contenu}</p>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Heart className={`w-4 h-4 ${sujet.likesCount > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
            {sujet.likesCount}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            {sujet.commentairesCount}
          </span>
          <button
            onClick={() => onInspect(sujet.id)}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>{sujet.commentairesCount} coms</span>
          </button>
        </div>
        <button
          onClick={() => onDelete(sujet.id, sujet.titre)}
          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
        >
          <Trash2 className="w-4 h-4" />
          <span>Supprimer</span>
        </button>
      </div>
    </div>
  );
});

const SignalementCard = React.memo(function SignalementCard({ sig, onResolve, onUnresolve, onDeleteSujet, onDeleteCommentaire, onInspect, onOpenProfile }: {
  sig: Signalement;
  onResolve: (id: string, type?: 'SUJET' | 'COMMENTAIRE') => void;
  onUnresolve: (id: string, type?: 'SUJET' | 'COMMENTAIRE') => void;
  onDeleteSujet: (id: string, titre: string) => void;
  onDeleteCommentaire: (id: string) => void;
  onInspect: (id: string) => void;
  onOpenProfile: (learnerId: string) => void;
}) {
  const openSignaleurProfile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (sig.signalePar?.id) onOpenProfile(sig.signalePar.id);
  }, [sig.signalePar?.id, onOpenProfile]);

  const openAuteurProfile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (sig.sujet?.auteur?.id) onOpenProfile(sig.sujet.auteur.id);
  }, [sig.sujet?.auteur?.id, onOpenProfile]);

  return (
    <div
      className={`border rounded-2xl p-6 space-y-4 text-left transition-colors ${
        sig.traite
          ? 'bg-slate-50/70 border-slate-200/80 opacity-90'
          : 'bg-rose-50/20 border-rose-200/70'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
            sig.traite ? 'bg-slate-200 text-slate-700' : 'bg-rose-100 text-rose-700'
          }`}>
            Motif : {sig.motif || 'Aucun motif spécifié'}
          </span>

          <span
            onClick={openSignaleurProfile}
            className="text-[11px] font-bold text-slate-700 hover:text-red-600 hover:underline flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            <AvatarDisplay auteur={sig.signalePar} size="sm" />
            <span>Signalé par : {getAuthorFullName(sig.signalePar)}</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </span>
        </div>

        <span className="text-[10px] text-slate-400 font-bold shrink-0">{formatDate(sig.dateCreation)}</span>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div
              onClick={openAuteurProfile}
              className="flex items-center gap-2 cursor-pointer"
            >
              <AvatarDisplay auteur={sig.sujet?.auteur} size="sm" />
              <span className="font-extrabold text-slate-900 hover:text-red-600 hover:underline">
                Auteur : {getAuthorFullName(sig.sujet?.auteur)}
              </span>
            </div>
          </div>

          <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
            {sig.sujet.theme}
          </span>
        </div>

        <h4 className="font-black text-slate-950 text-base">{sig.sujet.titre}</h4>
        <p className="text-xs text-slate-600 font-medium whitespace-pre-wrap line-clamp-3">{sig.sujet.contenu}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={() => onInspect(sig.sujet.id)}
          className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
        >
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Voir la publication complète ({sig.sujet.commentairesCount} coms)</span>
        </button>

        <div className="flex items-center gap-3">
          {!sig.traite ? (
            <button
              onClick={() => onResolve(sig.id, sig.type)}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Ignorer / Marquer comme traité</span>
            </button>
          ) : (
            <button
              onClick={() => onUnresolve(sig.id, sig.type)}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Remettre en attente</span>
            </button>
          )}

          <button
            onClick={() => {
              if (sig.type === 'COMMENTAIRE' && sig.commentaireId) {
                onDeleteCommentaire(sig.commentaireId);
              } else {
                onDeleteSujet(sig.sujet.id, sig.sujet.titre);
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {sig.type === 'COMMENTAIRE' ? 'Supprimer le commentaire' : 'Supprimer la publication'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

const InspectionModal = React.memo(function InspectionModal({ sujet, loading, onClose, onDelete, onDeleteComment, onOpenProfile }: {
  sujet: any | null;
  loading: boolean;
  onClose: () => void;
  onDelete: (id: string, titre: string) => void;
  onDeleteComment: (id: string) => void;
  onOpenProfile: (learnerId: string) => void;
}) {
  const handleDelete = useCallback(() => {
    if (!sujet) return;
    onDelete(sujet.id, sujet.titre);
  }, [sujet?.id, sujet?.titre, onDelete]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            {sujet && (
              <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded uppercase">
                {sujet.theme}
              </span>
            )}
            <h3 className="text-base font-black text-slate-950">Publication complète</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-950 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-6 md:pb-8 space-y-6 text-left">
          {loading || !sujet ? (
            <div className="py-20 text-center text-slate-400">
              <span className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
              <p className="text-xs font-bold uppercase text-blue-600">Chargement de la publication...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs pt-6">
                <div
                  onClick={() => sujet.auteur?.id && onOpenProfile(sujet.auteur.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <AvatarDisplay auteur={sujet.auteur} size="md" />
                  <span className="font-extrabold text-slate-950 hover:text-red-600 hover:underline">
                    {getAuthorFullName(sujet.auteur)}
                  </span>
                </div>
                <span className="text-slate-400 font-semibold">{formatDate(sujet.dateCreation)}</span>
              </div>

              <h2 className="text-xl font-black text-slate-950">{sujet.titre}</h2>
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                {sujet.contenu}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Commentaires ({sujet.commentaires?.length || 0})
                </h4>

                {sujet.commentaires?.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold italic">Aucun commentaire sous ce sujet.</p>
                ) : (
                  <div className="space-y-3">
                    {sujet.commentaires?.map((c: any) => (
                      <CommentRow key={c.id} comment={c} onOpenProfile={onOpenProfile} onDelete={onDeleteComment} />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
                <button
                  onClick={handleDelete}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer cette publication</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

const CommentRow = React.memo(function CommentRow({ comment, onOpenProfile, onDelete }: {
  comment: any;
  onOpenProfile: (learnerId: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-1.5 text-xs">
      <div className="flex items-center justify-between font-bold text-slate-900">
        <div
          onClick={() => comment?.auteur?.id && onOpenProfile(comment.auteur.id)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <AvatarDisplay auteur={comment?.auteur} size="sm" />
          <span className="hover:text-red-600 hover:underline">
            {getAuthorFullName(comment?.auteur)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-normal">{formatDate(comment.dateCreation)}</span>
          <button
            onClick={() => onDelete(comment.id)}
            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Supprimer ce commentaire"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <p className="text-slate-600 font-medium whitespace-pre-wrap">{comment.contenu}</p>
    </div>
  );
});

export default function AdminCommunityPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingSignalements, setPendingSignalements] = useState<Signalement[]>([]);
  const [resolvedSignalements, setResolvedSignalements] = useState<Signalement[]>([]);
  const [sujets, setSujets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState<'SIGNALEMENTS' | 'SUJETS'>('SIGNALEMENTS');
  const [signalementStatusFilter, setSignalementStatusFilter] = useState<'PENDING' | 'RESOLVED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectedSujet, setInspectedSujet] = useState<any | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [profileLearnerId, setProfileLearnerId] = useState<string | null>(null);

  const isAnyModalOpen = !!(inspectedSujet || inspectLoading || profileLearnerId);
  const scrollPosRef = useRef(0);
  useEffect(() => {
    if (isAnyModalOpen) {
      scrollPosRef.current = window.scrollY;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, pendingData, resolvedData, sujetsData] = await Promise.all([
        apiFetch('/forum/admin/stats').catch((err) => { console.error(err); return null; }),
        apiFetch('/forum/admin/signalements?traite=false').catch((err) => { console.error(err); return []; }),
        apiFetch('/forum/admin/signalements?traite=true').catch((err) => { console.error(err); return []; }),
        apiFetch('/forum').catch((err) => { console.error(err); return []; }),
      ]);

      if (statsData) setStats(statsData);
      setPendingSignalements(pendingData || []);
      setResolvedSignalements(resolvedData || []);
      const listSujets = Array.isArray(sujetsData) ? sujetsData : (sujetsData?.data || []);
      setSujets(listSujets);
    } catch (err: any) {
      console.error("Erreur chargement admin communauté:", err);
      showToast(err.message || 'Erreur d\'accès aux données de modération.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResolveSignalement = useCallback(async (signalementId: string, type?: 'SUJET' | 'COMMENTAIRE') => {
    try {
      await apiFetch(`/forum/admin/signalements/${signalementId}/traiter?type=${type || 'SUJET'}`, { method: 'PATCH' });
      showToast('Signalement marqué comme traité avec succès !', 'success');
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors du traitement du signalement.', 'error');
    }
  }, [showToast, fetchData]);

  const handleUnresolveSignalement = useCallback(async (signalementId: string, type?: 'SUJET' | 'COMMENTAIRE') => {
    try {
      await apiFetch(`/forum/admin/signalements/${signalementId}/annuler?type=${type || 'SUJET'}`, { method: 'PATCH' });
      showToast('Signalement remis en attente de modération.', 'info');
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors de l\'annulation.', 'error');
    }
  }, [showToast, fetchData]);

  const handleDeleteCommentaire = useCallback(async (commentId: string) => {
    const isConfirmed = await confirm({
      title: 'Supprimer le commentaire',
      message: 'Voulez-vous vraiment supprimer définitivement ce commentaire ? Cette action est irréversible.',
      confirmText: 'Supprimer le commentaire',
      cancelText: 'Annuler',
      type: 'danger',
    });
    if (!isConfirmed) return;
    try {
      await apiFetch(`/forum/commentaires/${commentId}`, { method: 'DELETE' });
      showToast('Commentaire supprimé avec succès !', 'success');
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors de la suppression du commentaire.', 'error');
    }
  }, [confirm, showToast, fetchData]);

  const handleDeleteSujet = useCallback(async (sujetId: string, titre: string) => {
    const isConfirmed = await confirm({
      title: 'Supprimer la publication',
      message: `Voulez-vous vraiment supprimer définitivement la publication "${titre}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer la publication',
      cancelText: 'Annuler',
      type: 'danger',
    });
    if (!isConfirmed) return;
    try {
      await apiFetch(`/forum/${sujetId}`, { method: 'DELETE' });
      showToast(`La publication "${titre}" a été définitivement supprimée.`, 'error');
      setInspectedSujet((prev: any) => prev?.id === sujetId ? null : prev);
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors de la suppression.', 'error');
    }
  }, [confirm, showToast, fetchData]);

  const handleInspectSujet = useCallback(async (sujetId: string) => {
    setInspectedSujet(null);
    setInspectLoading(true);
    try {
      const data = await apiFetch(`/forum/${sujetId}`);
      setInspectedSujet(data);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Impossible d\'inspecter la publication.', 'error');
    } finally {
      setInspectLoading(false);
    }
  }, [showToast]);

  const handleOpenProfile = useCallback((learnerId: string) => {
    setProfileLearnerId(learnerId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setInspectedSujet(null);
    setInspectLoading(false);
  }, []);

  const closeProfileModal = useCallback(() => {
    setProfileLearnerId(null);
  }, []);

  const filteredSujets = React.useMemo(() => {
    return (Array.isArray(sujets) ? sujets : []).filter(s => {
      if (!s) return false;
      const titre = s.titre || '';
      const contenu = s.contenu || '';
      const search = searchTerm.toLowerCase().trim();
      return !search || titre.toLowerCase().includes(search) || contenu.toLowerCase().includes(search);
    });
  }, [sujets, searchTerm]);

  const displayedSignalements = React.useMemo(() => {
    return signalementStatusFilter === 'PENDING' ? pendingSignalements : resolvedSignalements;
  }, [signalementStatusFilter, pendingSignalements, resolvedSignalements]);

  return (
    <div className="space-y-10 bg-[#020617] text-slate-300 text-left">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discussions Total</p>
            <p className="text-3xl font-black text-white mt-2">{stats?.totalSujets ?? 0}</p>
          </div>
          <div className="w-12 h-12 bg-[#020617] border border-slate-800 rounded-xl flex items-center justify-center text-slate-400">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commentaires</p>
            <p className="text-3xl font-black text-white mt-2">{stats?.totalCommentaires ?? 0}</p>
          </div>
          <div className="w-12 h-12 bg-blue-950/30 border border-blue-800/50 rounded-xl flex items-center justify-center text-cyan-400">
            <MessageCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Likes</p>
            <p className="text-3xl font-black text-white mt-2">{stats?.totalLikes ?? 0}</p>
          </div>
          <div className="w-12 h-12 bg-rose-950/30 border border-rose-800/50 rounded-xl flex items-center justify-center text-rose-400">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signalements en Attente</p>
            <p className={`text-3xl font-black mt-2 ${(stats?.signalementsPending ?? 0) > 0 ? 'text-rose-400' : 'text-white'}`}>
              {stats?.signalementsPending ?? 0}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${(stats?.signalementsPending ?? 0) > 0 ? 'bg-rose-950/30 border-rose-800/50 text-rose-400 animate-pulse' : 'bg-[#020617] border-slate-800 text-slate-400'}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMainTab('SIGNALEMENTS')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                mainTab === 'SIGNALEMENTS'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'bg-[#020617] border border-slate-800 hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>Gestion des Signalements</span>
            </button>

            <button
              onClick={() => setMainTab('SUJETS')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                mainTab === 'SUJETS'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'bg-[#020617] border border-slate-800 hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Toutes les Publications ({sujets.length})</span>
            </button>
          </div>

          {mainTab === 'SUJETS' && (
            <div className="relative max-w-xs w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Rechercher par titre ou contenu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl text-xs font-semibold outline-none"
              />
            </div>
          )}
        </div>

        {mainTab === 'SIGNALEMENTS' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSignalementStatusFilter('PENDING')}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
                  signalementStatusFilter === 'PENDING'
                    ? 'bg-rose-950/30 text-rose-400 border border-rose-800/50 shadow-sm'
                    : 'bg-[#020617] text-slate-400 hover:bg-slate-800/50 border border-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>En attente de traitement ({pendingSignalements.length})</span>
              </button>

              <button
                onClick={() => setSignalementStatusFilter('RESOLVED')}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
                  signalementStatusFilter === 'RESOLVED'
                    ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-800/50 shadow-sm'
                    : 'bg-[#020617] text-slate-400 hover:bg-slate-800/50 border border-slate-800'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Historique des Traités ({resolvedSignalements.length})</span>
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <span className="w-8 h-8 border-3 border-blue-800/50 border-t-cyan-400 rounded-full animate-spin inline-block mb-2" />
                <p className="text-xs font-bold uppercase text-cyan-400">Chargement des signalements...</p>
              </div>
            ) : displayedSignalements.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-semibold bg-[#020617] rounded-2xl border border-slate-800">
                Aucun signalement {signalementStatusFilter === 'PENDING' ? 'en attente' : 'traité'}.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {displayedSignalements.map((sig) => (
                  <SignalementCard
                    key={sig.id}
                    sig={sig}
                    onResolve={handleResolveSignalement}
                    onUnresolve={handleUnresolveSignalement}
                    onDeleteSujet={handleDeleteSujet}
                    onDeleteCommentaire={handleDeleteCommentaire}
                    onInspect={handleInspectSujet}
                    onOpenProfile={handleOpenProfile}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {mainTab === 'SUJETS' && (
          <div>
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <span className="w-8 h-8 border-3 border-blue-800/50 border-t-cyan-400 rounded-full animate-spin inline-block mb-2" />
                <p className="text-xs font-bold uppercase text-cyan-400">Chargement des sujets...</p>
              </div>
            ) : filteredSujets.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-semibold bg-[#020617] rounded-2xl border border-slate-800">
                Aucune publication trouvée.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSujets.map((sujet) => (
                  <SujetCard
                    key={sujet.id}
                    sujet={sujet}
                    onInspect={handleInspectSujet}
                    onDelete={handleDeleteSujet}
                    onOpenProfile={handleOpenProfile}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {(inspectedSujet || inspectLoading) && (
        <InspectionModal
          sujet={inspectedSujet}
          loading={inspectLoading}
          onClose={handleCloseModal}
          onDelete={handleDeleteSujet}
          onDeleteComment={handleDeleteCommentaire}
          onOpenProfile={handleOpenProfile}
        />
      )}

      <LearnerProfileModal learnerId={profileLearnerId} onClose={closeProfileModal} />
    </div>
  );
}
