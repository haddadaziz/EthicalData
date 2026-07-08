"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { MessageSquare, Heart, MessageCircle, Flag, ShieldAlert, CheckCircle, Trash2, RefreshCw, Search, User, Eye, RotateCcw, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    };
    commentairesCount: number;
    likesCount: number;
  };
}

export default function AdminCommunityPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingSignalements, setPendingSignalements] = useState<Signalement[]>([]);
  const [resolvedSignalements, setResolvedSignalements] = useState<Signalement[]>([]);
  const [sujets, setSujets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Vues
  const [mainTab, setMainTab] = useState<'SIGNALEMENTS' | 'SUJETS'>('SIGNALEMENTS');
  const [signalementStatusFilter, setSignalementStatusFilter] = useState<'PENDING' | 'RESOLVED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal d'inspection détaillée du sujet
  const [inspectedSujet, setInspectedSujet] = useState<any | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveSignalement = async (signalementId: string, type?: 'SUJET' | 'COMMENTAIRE') => {
    try {
      await apiFetch(`/forum/admin/signalements/${signalementId}/traiter?type=${type || 'SUJET'}`, { method: 'PATCH' });
      showToast('Signalement marqué comme traité avec succès !', 'success');
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors du traitement du signalement.', 'error');
    }
  };

  const handleUnresolveSignalement = async (signalementId: string, type?: 'SUJET' | 'COMMENTAIRE') => {
    try {
      await apiFetch(`/forum/admin/signalements/${signalementId}/annuler?type=${type || 'SUJET'}`, { method: 'PATCH' });
      showToast('Signalement remis en attente de modération.', 'info');
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors de l\'annulation.', 'error');
    }
  };

  const handleDeleteCommentaire = async (commentId: string) => {
    const isConfirmed = await confirm({
      title: 'Supprimer le commentaire',
      message: `Voulez-vous vraiment supprimer définitivement ce commentaire ? Cette action est irréversible.`,
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
  };

  const handleDeleteSujet = async (sujetId: string, titre: string) => {
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
      if (inspectedSujet?.id === sujetId) setInspectedSujet(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors de la suppression.', 'error');
    }
  };

  const handleInspectSujet = async (sujetId: string) => {
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
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
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

  const filteredSujets = (Array.isArray(sujets) ? sujets : []).filter(s => {
    if (!s) return false;
    const titre = s.titre || '';
    const contenu = s.contenu || '';
    const search = searchTerm.toLowerCase().trim();
    return !search || titre.toLowerCase().includes(search) || contenu.toLowerCase().includes(search);
  });

  const displayedSignalements = signalementStatusFilter === 'PENDING' ? pendingSignalements : resolvedSignalements;

  return (
    <div className="space-y-10 text-slate-800 text-left">
      
      {/* Actions et Cartes Statistiques (Sans titre redondant) */}
      <div className="flex justify-end pb-2">
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-950 rounded-xl cursor-pointer disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2 text-xs font-bold shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Cartes Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discussions Total</p>
            <p className="text-3xl font-black text-slate-950 mt-2">{stats?.totalSujets ?? 0}</p>
          </div>
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-700">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Réponses / Comms</p>
            <p className="text-3xl font-black text-slate-950 mt-2">{stats?.totalCommentaires ?? 0}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <MessageCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Likes / Vœux</p>
            <p className="text-3xl font-black text-slate-950 mt-2">{stats?.totalLikes ?? 0}</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-600">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signalements en Attente</p>
            <p className={`text-3xl font-black mt-2 ${(stats?.signalementsPending ?? 0) > 0 ? 'text-rose-600' : 'text-slate-950'}`}>
              {stats?.signalementsPending ?? 0}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${(stats?.signalementsPending ?? 0) > 0 ? 'bg-rose-50 border-rose-100 text-rose-600 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Zone Principale de Gestion */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMainTab('SIGNALEMENTS')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                mainTab === 'SIGNALEMENTS'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-slate-600'
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
                  : 'bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-slate-600'
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
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-xs font-semibold outline-none"
              />
            </div>
          )}
        </div>

        {/* CONTENU ONGLET 1 : SIGNALEMENTS */}
        {mainTab === 'SIGNALEMENTS' && (
          <div className="space-y-6">
            
            {/* Sous-onglets : En attente VS Traités */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSignalementStatusFilter('PENDING')}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
                  signalementStatusFilter === 'PENDING'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>En attente de traitement ({pendingSignalements.length})</span>
              </button>

              <button
                onClick={() => setSignalementStatusFilter('RESOLVED')}
                className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
                  signalementStatusFilter === 'RESOLVED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Historique des Traités ({resolvedSignalements.length})</span>
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <span className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin inline-block mb-2" />
                <p className="text-xs font-bold uppercase text-blue-600">Chargement des signalements...</p>
              </div>
            ) : displayedSignalements.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-semibold bg-slate-50/50 rounded-2xl border border-slate-100">
                {signalementStatusFilter === 'PENDING'
                  ? '🎉 Aucun signalement en attente ! La communauté est sereine.'
                  : 'Aucun signalement traité pour le moment.'}
              </div>
            ) : (
              <div className="space-y-4">
                {displayedSignalements.map((sig) => (
                  <div
                    key={sig.id}
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

                        {/* Lien Profil Signaleur */}
                        <Link
                          href={`/admin?search=${encodeURIComponent(getAuthorEmail(sig.signalePar))}`}
                          className="text-[11px] font-bold text-slate-700 hover:text-red-600 hover:underline flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md transition-colors"
                        >
                          <User className="w-3 h-3 text-slate-400" />
                          <span>Signalé par : {getAuthorFullName(sig.signalePar)}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                        </Link>
                      </div>

                      <span className="text-[10px] text-slate-400 font-bold shrink-0">{formatDate(sig.dateCreation)}</span>
                    </div>

                    {/* Aperçu de la Publication Signalée */}
                    <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between text-xs">
                        <Link
                          href={`/admin?search=${encodeURIComponent(getAuthorEmail(sig.sujet?.auteur))}`}
                          className="font-extrabold text-slate-900 hover:text-red-600 hover:underline flex items-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Auteur : {getAuthorFullName(sig.sujet?.auteur)} ({getAuthorEmail(sig.sujet?.auteur)})</span>
                        </Link>

                        <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                          {sig.sujet.theme}
                        </span>
                      </div>

                      <h4 className="font-black text-slate-950 text-base">{sig.sujet.titre}</h4>
                      <p className="text-xs text-slate-600 font-medium whitespace-pre-wrap line-clamp-3">{sig.sujet.contenu}</p>
                    </div>

                    {/* Actions de Modération */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => handleInspectSujet(sig.sujet.id)}
                        className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Voir la publication complète ({sig.sujet.commentairesCount} coms)</span>
                      </button>

                      <div className="flex items-center gap-3">
                        {!sig.traite ? (
                          <button
                            onClick={() => handleResolveSignalement(sig.id, sig.type)}
                            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Ignorer / Marquer comme traité</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnresolveSignalement(sig.id, sig.type)}
                            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Remettre en attente</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (sig.type === 'COMMENTAIRE' && sig.commentaireId) {
                              handleDeleteCommentaire(sig.commentaireId);
                            } else {
                              handleDeleteSujet(sig.sujet.id, sig.sujet.titre);
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
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENU ONGLET 2 : TOUTES LES PUBLICATIONS */}
        {mainTab === 'SUJETS' && (
          <div>
            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <span className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin inline-block mb-2" />
                <p className="text-xs font-bold uppercase text-blue-600">Chargement des sujets...</p>
              </div>
            ) : filteredSujets.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-semibold bg-slate-50/50 rounded-2xl border border-slate-100">
                Aucune publication trouvée.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSujets.map((sujet) => (
                  <div key={sujet.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 text-left hover:border-slate-300 transition-colors shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin?search=${encodeURIComponent(getAuthorEmail(sujet?.auteur))}`}
                          className="font-extrabold text-slate-950 text-sm hover:text-red-600 hover:underline flex items-center gap-1"
                        >
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{getAuthorFullName(sujet?.auteur)}</span>
                        </Link>
                        <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">{sujet?.auteur?.role || 'APPRENANT'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">{formatDate(sujet.dateCreation)}</span>
                    </div>

                    <h3 className="font-extrabold text-slate-950 text-base">{sujet.titre}</h3>
                    <p className="text-xs text-slate-600 font-medium line-clamp-2">{sujet.contenu}</p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                      <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider">
                        <span>❤️ {sujet.likesCount} Likes</span>
                        <span>💬 {sujet.commentairesCount} Réponses</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleInspectSujet(sujet.id)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Inspecter</span>
                        </button>

                        <button
                          onClick={() => handleDeleteSujet(sujet.id, sujet.titre)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Supprimer la publication"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL D'INSPECTION DÉTAILLÉE DE LA PUBLICATION ET DE SES COMMENTAIRES */}
      <AnimatePresence>
        {inspectedSujet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-left max-h-[85vh] overflow-y-auto relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded uppercase">
                    {inspectedSujet.theme}
                  </span>
                  <h3 className="text-base font-black text-slate-950">Publication complète</h3>
                </div>
                <button
                  onClick={() => setInspectedSujet(null)}
                  className="p-2 text-slate-400 hover:text-slate-950 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <Link
                    href={`/admin?search=${encodeURIComponent(getAuthorEmail(inspectedSujet?.auteur))}`}
                    className="font-extrabold text-slate-950 hover:text-red-600 hover:underline flex items-center gap-1.5"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{getAuthorFullName(inspectedSujet?.auteur)} ({getAuthorEmail(inspectedSujet?.auteur)})</span>
                  </Link>
                  <span className="text-slate-400 font-semibold">{formatDate(inspectedSujet.dateCreation)}</span>
                </div>

                <h2 className="text-xl font-black text-slate-950">{inspectedSujet.titre}</h2>
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                  {inspectedSujet.contenu}
                </div>
              </div>

              {/* SECTION COMMENTAIRES DU MODAL */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Commentaires ({inspectedSujet.commentaires?.length || 0})
                </h4>

                {inspectedSujet.commentaires?.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold italic">Aucun commentaire sous ce sujet.</p>
                ) : (
                  <div className="space-y-3">
                    {inspectedSujet.commentaires?.map((c: any) => (
                      <div key={c.id} className="p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <Link
                            href={`/admin?search=${encodeURIComponent(getAuthorEmail(c?.auteur))}`}
                            className="hover:text-red-600 hover:underline flex items-center gap-1"
                          >
                            <span>{getAuthorFullName(c?.auteur)}</span>
                          </Link>
                          <span className="text-[10px] text-slate-400 font-normal">{formatDate(c.dateCreation)}</span>
                        </div>
                        <p className="text-slate-600 font-medium whitespace-pre-wrap">{c.contenu}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
                <button
                  onClick={() => handleDeleteSujet(inspectedSujet.id, inspectedSujet.titre)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer cette publication</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}