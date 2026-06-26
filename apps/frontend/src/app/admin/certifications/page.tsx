"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { Award, Plus, RefreshCw, X, Edit, Trash2, Search, Layers, Briefcase, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Fournisseur {
  id: string;
  nom: string;
  slug: string;
  logo?: string | null;
}

interface Module {
  id: string;
  titre: string;
  ordre: number;
}

interface Certification {
  id: string;
  nom: string;
  slug: string;
  codeExamen?: string | null;
  description: string;
  niveau: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  dureeIndicative?: string | null;
  image?: string | null;
  dateCreation: string;
  fournisseurId: string;
  fournisseur: Fournisseur;
  modules: Module[];
}

export default function CertificationsAdmin() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // États pour le modal de création
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Formulaire de création
  const [nom, setNom] = useState('');
  const [codeExamen, setCodeExamen] = useState('');
  const [description, setDescription] = useState('');
  const [niveau, setNiveau] = useState<'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE'>('DEBUTANT');
  const [dureeIndicative, setDureeIndicative] = useState('');
  const [fournisseurId, setFournisseurId] = useState('');
  const [image, setImage] = useState('');

  // États pour le modal de modification
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editCodeExamen, setEditCodeExamen] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editNiveau, setEditNiveau] = useState<'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE'>('DEBUTANT');
  const [editDureeIndicative, setEditDureeIndicative] = useState('');
  const [editFournisseurId, setEditFournisseurId] = useState('');
  const [editImage, setEditImage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [certsData, fournisseursData] = await Promise.all([
        apiFetch('/certifications'),
        apiFetch('/certifications/fournisseurs')
      ]);
      setCerts(certsData);
      setFournisseurs(fournisseursData);
      if (fournisseursData.length > 0) {
        setFournisseurId(fournisseursData[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Impossible de charger les données du catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrage des certifications
  const filteredCerts = certs.filter(c => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const nomVal = (c.nom || '').toLowerCase();
    const codeVal = (c.codeExamen || '').toLowerCase();
    const descVal = (c.description || '').toLowerCase();
    const fournVal = (c.fournisseur.nom || '').toLowerCase();

    return nomVal.includes(search) || codeVal.includes(search) || descVal.includes(search) || fournVal.includes(search);
  });

  // Calcul des statistiques
  const totalCerts = certs.length;
  const microsoftCount = certs.filter(c => c.fournisseur.nom === 'Microsoft').length;
  const awsCount = certs.filter(c => c.fournisseur.nom === 'AWS').length;
  const otherCount = totalCerts - (microsoftCount + awsCount);

  const handleCreateCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    try {
      await apiFetch('/certifications', {
        method: 'POST',
        body: {
          nom,
          codeExamen: codeExamen || undefined,
          description,
          niveau,
          dureeIndicative: dureeIndicative || undefined,
          image: image || undefined,
          fournisseurId: parseInt(fournisseurId, 10)
        }
      });

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || 'Une erreur est survenue lors de la création.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenEditModal = (cert: Certification) => {
    setEditingCert(cert);
    setEditNom(cert.nom);
    setEditCodeExamen(cert.codeExamen || '');
    setEditDescription(cert.description);
    setEditNiveau(cert.niveau);
    setEditDureeIndicative(cert.dureeIndicative || '');
    setEditFournisseurId(cert.fournisseurId);
    setEditImage(cert.image || '');
    setModalError(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;
    setModalLoading(true);
    setModalError(null);

    try {
      await apiFetch(`/certifications/${editingCert.id}`, {
        method: 'PATCH',
        body: {
          nom: editNom,
          codeExamen: editCodeExamen || null,
          description: editDescription,
          niveau: editNiveau,
          dureeIndicative: editDureeIndicative || null,
          image: editImage || null,
          fournisseurId: parseInt(editFournisseurId, 10)
        }
      });

      setIsEditModalOpen(false);
      setEditingCert(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || 'Une erreur est survenue lors de la modification.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteCert = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la certification "${name}" ?`)) {
      return;
    }

    try {
      await apiFetch(`/certifications/${id}`, {
        method: 'DELETE'
      });
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Une erreur est survenue lors de la suppression.");
    }
  };

  const resetForm = () => {
    setNom('');
    setCodeExamen('');
    setDescription('');
    setNiveau('DEBUTANT');
    setDureeIndicative('');
    setImage('');
    if (fournisseurs.length > 0) {
      setFournisseurId(fournisseurs[0].id);
    }
    setModalError(null);
  };

  const getNiveauBadgeStyle = (niv: string) => {
    switch (niv) {
      case 'AVANCE':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-500/20';
      case 'INTERMEDIAIRE':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/20';
      case 'DEBUTANT':
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-10">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Catalogue Certifications</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez les examens, les modules et les prérequis de formation.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-2xl cursor-pointer disabled:opacity-50 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl cursor-pointer shadow-lg shadow-indigo-600/15 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle Certification</span>
          </button>
        </div>
      </div>

      {/* Cartes Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 animate-pulse space-y-4" />
          ))
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex items-center justify-between transition-colors duration-300"
            >
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Certifications</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{totalCerts}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Award className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex items-center justify-between transition-colors duration-300"
            >
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Microsoft</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{microsoftCount}</p>
              </div>
              <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Layers className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex items-center justify-between transition-colors duration-300"
            >
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AWS</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{awsCount}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Briefcase className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex items-center justify-between transition-colors duration-300"
            >
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Autres fournisseurs</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{otherCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-650 dark:text-purple-400">
                <BookmarkCheck className="w-6 h-6" />
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Conteneur de la table */}
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-[24px] overflow-hidden transition-colors duration-300">
        
        {/* Entête avec Recherche */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">
              <Search className="w-5 h-5" />
            </span>
            <input 
              type="text"
              placeholder="Rechercher une certification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm outline-none"
            />
          </div>
          
          <div className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
            {filteredCerts.length} certification{filteredCerts.length > 1 ? 's' : ''} trouvée{filteredCerts.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/20 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-rose-500 dark:text-rose-400 font-semibold mb-2">Une erreur est survenue</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">{error}</p>
              <button 
                onClick={fetchData}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold rounded-xl cursor-pointer transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : filteredCerts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-medium">
              Aucune certification disponible dans le catalogue.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-5 px-6">Code / Examen</th>
                  <th className="py-5 px-6">Nom</th>
                  <th className="py-5 px-6">Fournisseur</th>
                  <th className="py-5 px-6">Niveau</th>
                  <th className="py-5 px-6">Durée indicative</th>
                  <th className="py-5 px-6">Modules</th>
                  <th className="py-5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 text-sm">
                {filteredCerts.map((cert) => (
                  <tr 
                    key={cert.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="py-4 px-6 font-bold text-indigo-650 dark:text-indigo-400">
                      {cert.codeExamen || 'N/A'}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {/* Conteneur de l'image de la certification (avec repli sur le logo du fournisseur) */}
                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800 overflow-hidden">
                          {cert.image ? (
                            <img 
                              src={cert.image} 
                              alt={cert.nom} 
                              className="w-full h-full object-cover"
                            />
                          ) : cert.fournisseur.logo ? (
                            <img 
                              src={cert.fournisseur.logo} 
                              alt={cert.fournisseur.nom} 
                              className="w-6 h-6 object-contain"
                            />
                          ) : (
                            <span className="font-bold text-slate-500 dark:text-slate-400 text-sm">
                              {cert.fournisseur.nom.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block font-sans">
                            {cert.nom}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 max-w-md mt-0.5">
                            {cert.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-650 dark:text-slate-400">
                      {cert.fournisseur.nom}
                    </td>

                    <td className="py-4 px-6">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getNiveauBadgeStyle(cert.niveau)}`}>
                        {cert.niveau}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-550 dark:text-slate-450 font-medium">
                      {cert.dureeIndicative || 'Non spécifiée'}
                    </td>

                    <td className="py-4 px-6 text-slate-400 dark:text-slate-500 font-bold">
                      {cert.modules?.length || 0} module{cert.modules?.length > 1 ? 's' : ''}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(cert)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCert(cert.id, cert.nom)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-[28px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Créer une certification</h2>
                <button
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  disabled={modalLoading}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCert} className="p-6 overflow-y-auto space-y-5 flex-1 font-sans">
                {modalError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-semibold">
                    {modalError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Nom commercial</label>
                    <input
                      type="text"
                      required
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Azure Fundamentals"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Code examen <span className="text-[10px] text-slate-400/80 lowercase">(optionnel)</span></label>
                    <input
                      type="text"
                      value={codeExamen}
                      onChange={(e) => setCodeExamen(e.target.value)}
                      placeholder="AZ-900"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Fournisseur</label>
                  <select
                    value={fournisseurId}
                    onChange={(e) => setFournisseurId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15 font-semibold"
                  >
                    {fournisseurs.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Niveau</label>
                    <select
                      value={niveau}
                      onChange={(e) => setNiveau(e.target.value as any)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15 font-semibold"
                    >
                      <option value="DEBUTANT">Débutant</option>
                      <option value="INTERMEDIAIRE">Intermédiaire</option>
                      <option value="AVANCE">Avancé</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Durée indicative</label>
                    <input
                      type="text"
                      value={dureeIndicative}
                      onChange={(e) => setDureeIndicative(e.target.value)}
                      placeholder="15 heures"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                    />
                  </div>
                </div>

                {/* Champ d'image de la certification */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">URL de l'image de certification</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Ex: /certifications/az900.svg"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Saisissez les objectifs et l'audience cible de cette certification..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15 resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/10 dark:bg-slate-950/10 mt-6">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                    disabled={modalLoading}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-600/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {modalLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Créer la certification'
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
        {isEditModalOpen && editingCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!modalLoading) { setIsEditModalOpen(false); setEditingCert(null); } }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-[28px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Modifier la certification</h2>
                <button
                  onClick={() => { setIsEditModalOpen(false); setEditingCert(null); }}
                  disabled={modalLoading}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateCert} className="p-6 overflow-y-auto space-y-5 flex-1">
                {modalError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-semibold">
                    {modalError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Nom commercial</label>
                    <input
                      type="text"
                      required
                      value={editNom}
                      onChange={(e) => setEditNom(e.target.value)}
                      placeholder="Azure Fundamentals"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Code examen <span className="text-[10px] text-slate-400/80 lowercase">(optionnel)</span></label>
                    <input
                      type="text"
                      value={editCodeExamen}
                      onChange={(e) => setEditCodeExamen(e.target.value)}
                      placeholder="AZ-900"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Fournisseur</label>
                  <select
                    value={editFournisseurId}
                    onChange={(e) => setEditFournisseurId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15 font-semibold"
                  >
                    {fournisseurs.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Niveau</label>
                    <select
                      value={editNiveau}
                      onChange={(e) => setEditNiveau(e.target.value as any)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15 font-semibold"
                    >
                      <option value="DEBUTANT">Débutant</option>
                      <option value="INTERMEDIAIRE">Intermédiaire</option>
                      <option value="AVANCE">Avancé</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Durée indicative</label>
                    <input
                      type="text"
                      value={editDureeIndicative}
                      onChange={(e) => setEditDureeIndicative(e.target.value)}
                      placeholder="15 heures"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                    />
                  </div>
                </div>

                {/* Modification du champ d'image de la certification */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">URL de l'image de certification</label>
                  <input
                    type="text"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    placeholder="Ex: /certifications/az900.svg"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Saisissez les objectifs et l'audience cible de cette certification..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15 resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/10 dark:bg-slate-950/10 mt-6">
                  <button
                    type="button"
                    onClick={() => { setIsEditModalOpen(false); setEditingCert(null); }}
                    disabled={modalLoading}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-600/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {modalLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Sauvegarder les modifications'
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