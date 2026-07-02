"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { MessageSquare, Heart, Plus, Search, RefreshCw, X, Send, Flag, Trash2, Award, User, Sparkles, MessageCircle } from 'lucide-react';
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
    prenom: string;
    nom: string;
    avatar?: string | null;
    role: string;
  };
  certification?: {
    id: string;
    nom: string;
    codeExamen?: string | null;
  } | null;
}

interface DetailSujet extends Sujet {
  isLikedByUser: boolean;
  commentaires: {
    id: string;
    contenu: string;
    dateCreation: string;
    auteur: {
      id: string;
      prenom: string;
      nom: string;
      avatar?: string | null;
      role: string;
    };
  }[];
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
  const [sujets, setSujets] = useState<Sujet[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('TOUS');
  const [selectedCert, setSelectedCert] = useState('');

  // Modal Nouveau Sujet
  const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState(false);
  const [newTitre, setNewTitre] = useState('');
  const [newTheme, setNewTheme] = useState('Azure & Cloud');
  const [newCertId, setNewCertId] = useState('');
  const [newContenu, setNewContenu] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Tiroir/Modal de détail d'un sujet (Commentaires)
  const [selectedSujetId, setSelectedSujetId] = useState<string | null>(null);
  const [detailSujet, setDetailSujet] = useState<DetailSujet | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedTheme !== 'TOUS') queryParams.append('theme', selectedTheme);
      if (selectedCert) queryParams.append('certificationId', selectedCert);

      const [sujetsData, certsData] = await Promise.all([
        apiFetch(`/forum?${queryParams.toString()}`),
        apiFetch('/certifications'),
      ]);

      setSujets(sujetsData);
      setCerts(certsData);
    } catch (err) {
      console.error("Erreur de chargement de la communauté:", err);
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
    } catch (err) {
      console.error("Erreur chargement détail sujet:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenSujet = (id: string) => {
    setSelectedSujetId(id);
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

      setIsNewSubjectModalOpen(false);
      setNewTitre('');
      setNewContenu('');
      setNewCertId('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la création de la publication.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleLike = async (sujetId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await apiFetch(`/forum/${sujetId}/like`, { method: 'POST' });
      
      // Mettre à jour dans la liste globale
      setSujets(prev => prev.map(s => {
        if (s.id === sujetId) {
          return {
            ...s,
            likesCount: res.liked ? s.likesCount + 1 : Math.max(0, s.likesCount - 1),
          };
        }
        return s;
      }));

      // Mettre à jour si le détail est ouvert
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
        body: { contenu: newCommentText },
      });

      setDetailSujet(prev => prev ? {
        ...prev,
        commentaires: [...prev.commentaires, comment],
        commentairesCount: prev.commentairesCount + 1,
      } : null);

      // Mettre à jour le compteur global
      setSujets(prev => prev.map(s => s.id === selectedSujetId ? { ...s, commentairesCount: s.commentairesCount + 1 } : s));
      setNewCommentText('');
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'ajout du commentaire.');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleReport = async (sujetId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await apiFetch(`/forum/${sujetId}/signaler`, { method: 'POST' });
      alert(res.message);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du signalement.');
    }
  };

  // Filtrage par recherche textuelle
  const filteredSujets = sujets.filter(s => {
    const search = searchTerm.toLowerCase().trim();
    return !search || s.titre.toLowerCase().includes(search) || s.contenu.toLowerCase().includes(search);
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getThemeColor = (theme: string) => {
    if (theme.includes('Azure')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (theme.includes('Data')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (theme.includes('Cyber')) return 'bg-rose-50 text-rose-600 border-rose-100';
    if (theme.includes('Conseils')) return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-slate-50 text-slate-600 border-slate-200/80';
  };

  return (
    <div className="space-y-10 text-slate-800 text-left">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">Espace Communauté</h1>
          <p className="text-slate-500 text-xs mt-1.5 font-bold uppercase tracking-wider">
            Posez vos questions, partagez vos retours d'examens et échangez avec les autres apprenants.
          </p>
        </div>

        <button
          onClick={() => setIsNewSubjectModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest cursor-pointer shadow-md hover:shadow-lg transition-all shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Nouvelle Discussion</span>
        </button>
      </div>

      {/* Barre de Recherche & Filtres Thématiques */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Rechercher une question, une idée, un examen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 placeholder-slate-400 transition-all text-sm outline-none font-semibold"
            />
          </div>

          <select
            value={selectedCert}
            onChange={(e) => setSelectedCert(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-xs font-bold outline-none cursor-pointer transition-all"
          >
            <option value="">Toutes les certifications</option>
            {certs.map(c => (
              <option key={c.id} value={c.id}>{c.nom} ({c.codeExamen || 'Examen'})</option>
            ))}
          </select>
        </div>

        {/* Onglets des Thèmes */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {THEMES.map((theme) => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTheme === theme
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Fil de discussions */}
      <div>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 bg-white border border-slate-100 rounded-3xl animate-pulse p-6" />
            ))}
          </div>
        ) : filteredSujets.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl text-slate-500 font-semibold shadow-sm">
            Aucune discussion ne correspond à vos critères. Soyez le premier à lancer un sujet !
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSujets.map((sujet) => (
              <div
                key={sujet.id}
                onClick={() => handleOpenSujet(sujet.id)}
                className="bg-white border border-slate-200/80 hover:border-slate-350 hover:shadow-md rounded-3xl p-6 transition-all duration-200 cursor-pointer space-y-4 group"
              >
                {/* Auteur & Badges */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 border border-slate-800 text-white rounded-full flex items-center justify-center font-extrabold text-xs">
                      {sujet.auteur.prenom ? sujet.auteur.prenom.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-950 text-sm">{sujet.auteur.prenom} {sujet.auteur.nom}</span>
                        <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                          {sujet.auteur.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">{formatDate(sujet.dateCreation)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${getThemeColor(sujet.theme)}`}>
                      {sujet.theme}
                    </span>
                    {sujet.certification && (
                      <span className="text-[9px] font-black text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block">
                        {sujet.certification.codeExamen || sujet.certification.nom}
                      </span>
                    )}
                  </div>
                </div>

                {/* Titre & Aperçu */}
                <div className="space-y-1.5">
                  <h3 className="font-black text-slate-950 text-lg group-hover:text-red-600 transition-colors leading-snug">
                    {sujet.titre}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-semibold">
                    {sujet.contenu}
                  </p>
                </div>

                {/* Métriques / Interractions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => handleToggleLike(sujet.id, e)}
                      className="flex items-center gap-1.5 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>{sujet.likesCount}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-slate-400" />
                      <span>{sujet.commentairesCount} réponse{sujet.commentairesCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleReport(sujet.id, e)}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                    title="Signaler à la modération"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CRÉATION DE DISCUSSION */}
      <AnimatePresence>
        {isNewSubjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewSubjectModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Nouvelle Discussion</h2>
                <button
                  onClick={() => setIsNewSubjectModalOpen(false)}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSujet} className="p-6 overflow-y-auto space-y-5 flex-1 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Thème principal</label>
                  <select
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-xl text-slate-900 text-sm outline-none font-semibold cursor-pointer"
                  >
                    {THEMES.filter(t => t !== 'TOUS').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Certification concernée <span className="lowercase font-bold text-slate-400">(optionnel)</span></label>
                  <select
                    value={newCertId}
                    onChange={(e) => setNewCertId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-xl text-slate-900 text-sm outline-none font-semibold cursor-pointer"
                  >
                    <option value="">Aucune certification spécifique</option>
                    {certs.map(c => (
                      <option key={c.id} value={c.id}>{c.nom} ({c.codeExamen || 'Examen'})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Titre du sujet</label>
                  <input
                    type="text"
                    required
                    value={newTitre}
                    onChange={(e) => setNewTitre(e.target.value)}
                    placeholder="Posez votre question ou proposez un sujet..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-xl text-slate-900 text-sm outline-none font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Message / Description</label>
                  <textarea
                    required
                    value={newContenu}
                    onChange={(e) => setNewContenu(e.target.value)}
                    placeholder="Donnez plus de précisions..."
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-xl text-slate-900 text-sm outline-none font-semibold resize-none"
                  />
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewSubjectModalOpen(false)}
                    className="px-5 py-3 bg-slate-50 text-slate-650 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {modalLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Publier'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DETAILED DISCUSSION (RÉPONSES) */}
      <AnimatePresence>
        {selectedSujetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSujetId(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Discussion</h2>
                <button
                  onClick={() => setSelectedSujetId(null)}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {detailLoading || !detailSujet ? (
                <div className="p-12 text-center text-slate-400">
                  <span className="w-8 h-8 border-3 border-red-100 border-t-red-600 rounded-full animate-spin inline-block mb-3" />
                  <p className="text-xs font-bold uppercase">Chargement de la discussion...</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
                  {/* Contenu Sujet Principal */}
                  <div className="space-y-4 border-b border-slate-100 pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-950 text-white rounded-full flex items-center justify-center font-extrabold text-xs">
                          {detailSujet.auteur.prenom ? detailSujet.auteur.prenom.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-950 text-sm">{detailSujet.auteur.prenom} {detailSujet.auteur.nom}</span>
                          <p className="text-[10px] text-slate-400 font-semibold">{formatDate(detailSujet.dateCreation)}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleLike(detailSujet.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                          detailSujet.isLikedByUser
                            ? 'bg-rose-50 border-rose-100 text-rose-600'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${detailSujet.isLikedByUser ? 'fill-rose-600 text-rose-600' : 'text-slate-500'}`} />
                        <span>{detailSujet.likesCount}</span>
                      </button>
                    </div>

                    <h2 className="text-xl font-black text-slate-950 leading-snug">{detailSujet.titre}</h2>
                    <p className="text-sm text-slate-650 leading-relaxed font-medium whitespace-pre-wrap">{detailSujet.contenu}</p>
                  </div>

                  {/* Liste des Commentaires */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Réponses ({detailSujet.commentaires.length})
                    </h4>

                    {detailSujet.commentaires.length === 0 ? (
                      <p className="text-xs text-slate-400 font-semibold italic text-center py-4">Aucune réponse pour le moment. Soyez le premier !</p>
                    ) : (
                      detailSujet.commentaires.map((comm) => (
                        <div key={comm.id} className="bg-slate-50/70 border border-slate-200/60 rounded-2xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-950">{comm.auteur.prenom} {comm.auteur.nom}</span>
                              <span className="text-[8px] font-black text-slate-400 bg-white px-2 py-0.5 rounded uppercase border border-slate-100">
                                {comm.auteur.role}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-semibold">{formatDate(comm.dateCreation)}</span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium leading-relaxed">{comm.contenu}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Input Nouveau Commentaire */}
              {detailSujet && (
                <form onSubmit={handleAddComment} className="p-4 border-t border-slate-200 bg-slate-50/50 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Répondre à cette discussion..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 focus:border-red-600 rounded-xl text-slate-900 text-xs font-semibold outline-none"
                  />
                  <button
                    type="submit"
                    disabled={commentLoading}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {commentLoading ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Envoyer</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}