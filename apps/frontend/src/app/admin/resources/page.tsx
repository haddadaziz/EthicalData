"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { FileText, Download, Search, Plus, RefreshCw, X, Edit, Trash2, BookOpen, Lock, Globe, Award, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Resource {
  id: string;
  titre: string;
  description?: string | null;
  type: string;
  url: string;
  taille?: number | null;
  version: string;
  quotaTelechargement: number;
  public: boolean;
  certificationId?: string | null;
  certification?: {
    id: string;
    nom: string;
    slug: string;
    codeExamen?: string | null;
  } | null;
}

interface Certification {
  id: string;
  nom: string;
  slug: string;
  codeExamen?: string | null;
}

export default function ResourcesAdminPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertFilter, setSelectedCertFilter] = useState<string>('TOUS');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Formulaire de création / édition
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('PDF');
  const [url, setUrl] = useState('');
  const [taille, setTaille] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [quota, setQuota] = useState('10');
  const [isPublic, setIsPublic] = useState(false);
  const [certificationId, setCertificationId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resData, certData] = await Promise.all([
        apiFetch('/certifications/ressources/toutes'),
        apiFetch('/certifications'),
      ]);
      setResources(resData);
      setCerts(certData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Impossible de récupérer les ressources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Remettre à la page 1 si les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCertFilter]);

  // Filtrage
  const filteredResources = resources.filter(res => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch = !search || res.titre.toLowerCase().includes(search) || 
                          (res.description && res.description.toLowerCase().includes(search));
    const matchesCert = selectedCertFilter === 'TOUS' || res.certificationId === selectedCertFilter;
    return matchesSearch && matchesCert;
  });

  // Calculs pagination
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResources = filteredResources.slice(indexOfFirstItem, indexOfLastItem);

  // Stats
  const totalCount = resources.length;
  const publicCount = resources.filter(r => r.public).length;
  const privateCount = resources.filter(r => !r.public).length;

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificationId) {
      setModalError('Veuillez associer cette ressource à une certification.');
      return;
    }
    setModalLoading(true);
    setModalError(null);

    try {
      await apiFetch(`/certifications/${certificationId}/ressources`, {
        method: 'POST',
        body: {
          titre,
          description: description || undefined,
          type,
          url,
          taille: taille ? parseInt(taille) : undefined,
          version,
          quotaTelechargement: parseInt(quota),
          public: isPublic,
        },
      });

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || 'Erreur lors de la création.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenEditModal = (res: Resource) => {
    setEditingResource(res);
    setTitre(res.titre);
    setDescription(res.description || '');
    setType(res.type);
    setUrl(res.url);
    setTaille(res.taille ? res.taille.toString() : '');
    setVersion(res.version);
    setQuota(res.quotaTelechargement.toString());
    setIsPublic(res.public);
    setCertificationId(res.certificationId || '');
    setModalError(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;
    setModalLoading(true);
    setModalError(null);

    try {
      await apiFetch(`/certifications/ressources/${editingResource.id}`, {
        method: 'PATCH',
        body: {
          titre,
          description: description || null,
          type,
          url,
          taille: taille ? parseInt(taille) : null,
          version,
          quotaTelechargement: parseInt(quota),
          public: isPublic,
          certificationId: certificationId || null,
        },
      });

      setIsEditModalOpen(false);
      setEditingResource(null);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteResource = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer la ressource "${name}" ?`)) return;

    try {
      await apiFetch(`/certifications/ressources/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erreur lors de la suppression.');
    }
  };

  const resetForm = () => {
    setTitre('');
    setDescription('');
    setType('PDF');
    setUrl('');
    setTaille('');
    setVersion('1.0.0');
    setQuota('10');
    setIsPublic(false);
    setCertificationId('');
    setModalError(null);
  };

  const formatBytes = (bytes: number | null | undefined) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-10 text-slate-800">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 text-left">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">Ressources & Guides</h1>
          <p className="text-slate-500 text-xs mt-1.5 font-semibold">Gérez les documents et supports de cours téléchargeables par vos apprenants.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest cursor-pointer shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Nouveau Document</span>
          </button>
        </div>
      </div>

      {/* Cartes Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl p-6 animate-pulse" />
          ))
        ) : (
          <>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Fichiers</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{totalCount}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-650">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supports Publics</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{publicCount}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <Globe className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supports Privés (Sous Quota)</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{privateCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600">
                <Lock className="w-6 h-6" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Conteneur principal */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Barre de Filtres */}
        <div className="p-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex flex-1 items-center gap-3 w-full max-w-lg">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Rechercher par titre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 placeholder-slate-400 transition-all text-sm outline-none font-semibold"
              />
            </div>

            <select
              value={selectedCertFilter}
              onChange={(e) => setSelectedCertFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-xs font-bold outline-none transition-all cursor-pointer"
            >
              <option value="TOUS">Tous les examens</option>
              {certs.map(c => (
                <option key={c.id} value={c.id}>{c.codeExamen || c.nom}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-bold shrink-0">
            {filteredResources.length} document{filteredResources.length > 1 ? 's' : ''} trouvé{filteredResources.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Grille de Cartes */}
        <div>
          {loading ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-60 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-rose-500 font-bold mb-2">Une erreur est survenue</p>
              <p className="text-xs text-slate-500 mb-6">{error}</p>
              <button onClick={fetchData} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-950 font-bold rounded-xl cursor-pointer transition-colors">Réessayer</button>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="p-12 text-center text-slate-550 font-medium">
              Aucune ressource ne correspond à vos critères.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-6 text-left">
                {currentResources.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between group transition-all duration-300 hover:border-slate-350 hover:shadow-md"
                  >
                    <div className="space-y-4">
                      {/* En-tête de carte */}
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-red-600 text-[9px] px-2.5 py-0.5 bg-red-50 border border-red-100 rounded-lg">
                          {res.type}
                        </span>
                        
                        <span className={`inline-flex items-center gap-1 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                          res.public ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {res.public ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                          {res.public ? 'Public' : 'Privé'}
                        </span>
                      </div>

                      {/* Infos */}
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-slate-950 text-base leading-snug group-hover:text-red-600 transition-colors truncate">
                          {res.titre}
                        </h4>
                        
                        {res.certification && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                            <Award className="w-3.5 h-3.5 text-slate-400" />
                            <span>Lié à : {res.certification.codeExamen || res.certification.nom}</span>
                          </div>
                        )}

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-semibold">
                          {res.description || 'Aucune description fournie.'}
                        </p>
                      </div>
                      
                      {/* Quota */}
                      {!res.public && (
                        <div className="text-[10px] text-red-600 font-black uppercase tracking-wider bg-red-50/50 border border-red-100/50 rounded-xl p-2.5 text-center">
                          Quota max par apprenant : {res.quotaTelechargement} téléchargements
                        </div>
                      )}
                    </div>

                    {/* Footer de carte */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span>{formatBytes(res.taille)}</span>
                        <span>•</span>
                        <span>v{res.version}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(res)}
                          className="p-2 bg-slate-50 border border-slate-200/80 hover:border-slate-350 text-slate-600 hover:text-slate-950 rounded-xl transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(res.id, res.titre)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-slate-200/60 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-950 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-white shadow-sm"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Précédent</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNum = index + 1;
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${isActive ? 'bg-slate-950 text-white shadow-md' : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-950 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-white shadow-sm"
                  >
                    <span>Suivant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL DE CRÉATION */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!modalLoading) { setIsModalOpen(false); resetForm(); } }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Ajouter un document</h2>
                <button
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  disabled={modalLoading}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateResource} className="p-6 overflow-y-auto space-y-5 flex-1 text-left">
                {modalError && (
                  <div className="p-3.5 bg-rose-550/10 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold">
                    {modalError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Examen / Certification cible</label>
                  <select
                    required
                    value={certificationId}
                    onChange={(e) => setCertificationId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold cursor-pointer"
                  >
                    <option value="">Sélectionner une certification...</option>
                    {certs.map(c => (
                      <option key={c.id} value={c.id}>{c.nom} ({c.codeExamen || 'Examen'})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Titre de la ressource</label>
                  <input
                    type="text"
                    required
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Mémo de révision..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Détails du fichier..."
                    className="w-full h-24 p-4 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Format / Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold cursor-pointer"
                    >
                      <option value="PDF">PDF</option>
                      <option value="SLIDES">Slides / Cours</option>
                      <option value="DATASET">Dataset / Données</option>
                      <option value="IMAGE">Image / Schéma</option>
                      <option value="DOCX">Word (DOCX)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Version du fichier</label>
                    <input
                      type="text"
                      required
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="1.0.0"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">URL du document</label>
                  <input
                    type="text"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/file.pdf ou /docs/az900.pdf"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Taille (en octets / Bytes) <span className="lowercase font-bold text-slate-400 text-[9px]">(optionnel)</span></label>
                    <input
                      type="number"
                      value={taille}
                      onChange={(e) => setTaille(e.target.value)}
                      placeholder="1500000 (1.5 MB)"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Quota de Téléchargements max</label>
                    <input
                      type="number"
                      required
                      value={quota}
                      onChange={(e) => setQuota(e.target.value)}
                      placeholder="10"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Visibilité du document</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`p-3.5 border rounded-2xl text-center font-bold text-xs uppercase transition-all cursor-pointer ${isPublic
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-slate-200 hover:border-slate-350 bg-white text-slate-500 shadow-sm'
                      }`}
                    >
                      Public (Sans quota)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`p-3.5 border rounded-2xl text-center font-bold text-xs uppercase transition-all cursor-pointer ${!isPublic
                        ? 'border-red-600 bg-red-50 text-red-600 shadow-sm'
                        : 'border-slate-200 hover:border-slate-350 bg-white text-slate-500 shadow-sm'
                      }`}
                    >
                      Privé (Sous quota)
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 bg-white mt-6">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                    disabled={modalLoading}
                    className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-650 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs uppercase tracking-wider border border-slate-200/60"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md"
                  >
                    {modalLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Ajouter le document'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE MODIFICATION */}
      <AnimatePresence>
        {isEditModalOpen && editingResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!modalLoading) { setIsEditModalOpen(false); setEditingResource(null); } }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Modifier le document</h2>
                <button
                  onClick={() => { setIsEditModalOpen(false); setEditingResource(null); }}
                  disabled={modalLoading}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateResource} className="p-6 overflow-y-auto space-y-5 flex-1 text-left">
                {modalError && (
                  <div className="p-3.5 bg-rose-550/10 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold">
                    {modalError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Examen / Certification cible</label>
                  <select
                    required
                    value={certificationId}
                    onChange={(e) => setCertificationId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold cursor-pointer"
                  >
                    <option value="">Sélectionner une certification...</option>
                    {certs.map(c => (
                      <option key={c.id} value={c.id}>{c.nom} ({c.codeExamen || 'Examen'})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Titre de la ressource</label>
                  <input
                    type="text"
                    required
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Mémo de révision..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Détails du fichier..."
                    className="w-full h-24 p-4 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Format / Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold cursor-pointer"
                    >
                      <option value="PDF">PDF</option>
                      <option value="SLIDES">Slides / Cours</option>
                      <option value="DATASET">Dataset / Données</option>
                      <option value="IMAGE">Image / Schéma</option>
                      <option value="DOCX">Word (DOCX)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Version du fichier</label>
                    <input
                      type="text"
                      required
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="1.0.0"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">URL du document</label>
                  <input
                    type="text"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/file.pdf ou /docs/az900.pdf"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Taille (en octets / Bytes) <span className="lowercase font-bold text-slate-400 text-[9px]">(optionnel)</span></label>
                    <input
                      type="number"
                      value={taille}
                      onChange={(e) => setTaille(e.target.value)}
                      placeholder="1500000 (1.5 MB)"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Quota de Téléchargements max</label>
                    <input
                      type="number"
                      required
                      value={quota}
                      onChange={(e) => setQuota(e.target.value)}
                      placeholder="10"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-slate-900 text-sm outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Visibilité du document</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`p-3.5 border rounded-2xl text-center font-bold text-xs uppercase transition-all cursor-pointer ${isPublic
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-slate-200 hover:border-slate-350 bg-white text-slate-500 shadow-sm'
                      }`}
                    >
                      Public (Sans quota)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`p-3.5 border rounded-2xl text-center font-bold text-xs uppercase transition-all cursor-pointer ${!isPublic
                        ? 'border-red-600 bg-red-50 text-red-600 shadow-sm'
                        : 'border-slate-200 hover:border-slate-350 bg-white text-slate-500 shadow-sm'
                      }`}
                    >
                      Privé (Sous quota)
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 bg-white mt-6">
                  <button
                    type="button"
                    onClick={() => { setIsEditModalOpen(false); setEditingResource(null); resetForm(); }}
                    disabled={modalLoading}
                    className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-650 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs uppercase tracking-wider border border-slate-200/60"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md"
                  >
                    {modalLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Enregistrer les modifications'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}