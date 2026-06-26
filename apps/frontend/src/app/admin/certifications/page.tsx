"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { Award, Plus, RefreshCw, X, Edit, Trash2, Search, Layers, Briefcase, BookmarkCheck, Upload, Clock, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Fournisseur {
  id: string;
  nom: string;
  slug: string;
  image?: string | null;
  certificationCount?: number;
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
  
  const [imageError, setImageError] = useState(false);
  const [editImageError, setEditImageError] = useState(false);

  // États pour la gestion simplifiée des fournisseurs en ligne
  const [isFournModalOpen, setIsFournModalOpen] = useState(false);
  const [fournNom, setFournNom] = useState('');
  const [fournLoading, setFournLoading] = useState(false);
  const [fournError, setFournError] = useState<string | null>(null);

  useEffect(() => {
    setImageError(false);
  }, [image]);

  useEffect(() => {
    setEditImageError(false);
  }, [editImage]);

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

  // Gestion de la sélection locale de fichiers (conversion en Base64 pour prévisualisation immédiate et stockage)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("L'image est trop grande. La taille maximale est de 2 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isEdit) {
        setEditImage(base64String);
      } else {
        setImage(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateFournisseur = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fournNom.trim()) return;
    setFournLoading(true);
    setFournError(null);
    try {
      const newFourn = await apiFetch('/certifications/fournisseurs', {
        method: 'POST',
        body: { nom: fournNom.trim() }
      });
      const fournisseursData = await apiFetch('/certifications/fournisseurs');
      setFournisseurs(fournisseursData);
      
      if (newFourn && newFourn.id) {
        const strId = newFourn.id.toString();
        if (isEditModalOpen) {
          setEditFournisseurId(strId);
        } else {
          setFournisseurId(strId);
        }
      }
      setFournNom('');
    } catch (err: any) {
      console.error(err);
      setFournError(err.message || 'Une erreur est survenue lors de la création du fournisseur.');
    } finally {
      setFournLoading(false);
    }
  };

  const handleDeleteFournisseur = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le fournisseur "${name}" ?`)) {
      return;
    }
    setFournLoading(true);
    setFournError(null);
    try {
      await apiFetch(`/certifications/fournisseurs/${id}`, {
        method: 'DELETE'
      });
      const fournisseursData = await apiFetch('/certifications/fournisseurs');
      setFournisseurs(fournisseursData);
      
      if (fournisseurId === id) {
        setFournisseurId(fournisseursData[0]?.id || '');
      }
      if (editFournisseurId === id) {
        setEditFournisseurId(fournisseursData[0]?.id || '');
      }
    } catch (err: any) {
      console.error(err);
      setFournError(err.message || 'Une erreur est survenue lors de la suppression du fournisseur.');
    } finally {
      setFournLoading(false);
    }
  };

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
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case 'INTERMEDIAIRE':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'DEBUTANT':
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    }
  };

  const getSupplierBadgeStyle = (name: string) => {
    switch (name?.toLowerCase()) {
      case 'microsoft':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20';
      case 'aws':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'google cloud':
      case 'google':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'cisco':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
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
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-655 dark:text-purple-400">
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
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-955/60 border border-slate-200 dark:border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm outline-none"
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
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block">
                          {cert.nom}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 max-w-md mt-0.5">
                          {cert.description}
                        </span>
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

                    <td className="py-4 px-6 text-slate-555 dark:text-slate-450 font-medium">
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

      {/* MODAL DE CRÉATION (Avec Aperçu en direct Côte à Côte) */}
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
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200/80 dark:border-slate-850 flex items-center justify-between bg-slate-50/50 dark:bg-slate-955/20">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Nouvelle certification</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Configurez une nouvelle certification et visualisez-la en direct.</p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  disabled={modalLoading}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Side-by-side content */}
              <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200/80 dark:divide-slate-850">
                
                {/* Formulaire (Gauche) */}
                <form onSubmit={handleCreateCert} className="p-8 space-y-5 md:w-1/2 overflow-y-auto">
                  {modalError && (
                    <div className="p-4 bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-450 rounded-2xl text-sm font-semibold">
                      {modalError}
                    </div>
                  )}

                  {/* Nom commercial */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider pl-1">Nom commercial</label>
                    <input
                      type="text"
                      required
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Azure Fundamentals"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200"
                    />
                  </div>

                  {/* Code et Fournisseur */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider pl-1">Code examen</label>
                      <input
                        type="text"
                        value={codeExamen}
                        onChange={(e) => setCodeExamen(e.target.value)}
                        placeholder="AZ-900"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center pl-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fournisseur</label>
                        <button
                          type="button"
                          onClick={() => setIsFournModalOpen(true)}
                          className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold hover:underline"
                        >
                          + Gérer
                        </button>
                      </div>
                      <select
                        value={fournisseurId}
                        onChange={(e) => setFournisseurId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200 font-semibold"
                      >
                        {fournisseurs.length === 0 ? (
                          <option value="" disabled>Aucun fournisseur - Cliquez sur "+ Gérer"</option>
                        ) : (
                          fournisseurs.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.nom}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Niveau et Durée */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider pl-1">Niveau</label>
                      <select
                        value={niveau}
                        onChange={(e) => setNiveau(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200 font-semibold"
                      >
                        <option value="DEBUTANT">Débutant</option>
                        <option value="INTERMEDIAIRE">Intermédiaire</option>
                        <option value="AVANCE">Avancé</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider pl-1">Durée indicative</label>
                      <input
                        type="text"
                        value={dureeIndicative}
                        onChange={(e) => setDureeIndicative(e.target.value)}
                        placeholder="15 heures"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Image picker */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider pl-1">Image / Badge de Certification</label>
                    
                    {image ? (
                      <div className="flex items-center gap-3 p-3 bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
                        <div className="w-12 h-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1">
                          <img src={image} alt="Thumbnail" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">Image sélectionnée</p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 truncate">
                            {image.startsWith('data:') ? 'Fichier importé (Base64)' : image}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setImage('')}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer l'image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 border border-dashed border-slate-200 dark:border-slate-800 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-955/20 hover:bg-indigo-50/10 dark:hover:bg-indigo-955/5 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-200 relative">
                          <Upload className="w-4 h-4 text-slate-450 dark:text-slate-500 pl-1" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, false)}
                            className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-650 hover:file:bg-indigo-100 file:cursor-pointer cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          placeholder="Ou saisissez un chemin d'accès (ex: /certifications/az900.svg)"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider pl-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Objectifs de la certification..."
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-200/80 dark:border-slate-850 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { setIsModalOpen(false); resetForm(); }}
                      disabled={modalLoading}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200/60 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-600/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                    >
                      {modalLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Créer la certification'
                      )}
                    </button>
                  </div>
                </form>

                {/* Prévisualisation (Droite) */}
                <div className="p-8 md:w-1/2 bg-gradient-to-tr from-slate-50 to-indigo-50/20 dark:from-slate-950 dark:to-indigo-950/10 flex flex-col items-center justify-center border-l border-slate-200/60 dark:border-slate-850 relative min-h-[450px]">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl pointer-events-none" />

                  <div className="w-full max-w-xs space-y-5 relative z-10">
                    <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block text-center">Aperçu en direct (Vue utilisateur)</span>
                    
                    <div className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[28px] overflow-hidden shadow-xl hover:shadow-2xl dark:shadow-black/30 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-300 group flex flex-col relative">
                      
                      <div className="h-40 w-full bg-white dark:bg-slate-950 border-b border-slate-150 dark:border-slate-850 relative flex items-center justify-center overflow-hidden p-3">
                        <div className="absolute w-32 h-32 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/15 transition-all duration-500" />
                        
                        {image && !imageError ? (
                          <img 
                            src={image} 
                            alt={nom || "Certification"} 
                            className="max-w-full max-h-full object-contain relative z-10 filter drop-shadow-sm group-hover:scale-103 transition-all duration-500"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                            <div className="w-12 h-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700/80 bg-slate-105/50 dark:bg-slate-900/40 flex items-center justify-center mb-2">
                              <Award className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                              Aucune image insérée
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${getSupplierBadgeStyle(fournisseurs.find(f => f.id === fournisseurId)?.nom || '')}`}>
                              {fournisseurs.find(f => f.id === fournisseurId)?.nom || 'Fournisseur'}
                            </span>
                            <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${getNiveauBadgeStyle(niveau)}`}>
                              {niveau}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            {codeExamen && (
                              <span className="text-[10px] font-bold text-indigo-550 dark:text-indigo-405 block uppercase tracking-wider">
                                {codeExamen}
                              </span>
                            )}
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                              {nom || 'Titre de la Certification'}
                            </h3>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {description || 'Aucune description rédigée pour le moment.'}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{dureeIndicative || 'Non spécifiée'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5" />
                            <span>0 module</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE MODIFICATION (Avec Aperçu en direct Côte à Côte) */}
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
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200/80 dark:border-slate-850 flex items-center justify-between bg-slate-50/50 dark:bg-slate-955/20">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Modifier la certification</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Modifiez les caractéristiques et suivez l'impact visuel en direct.</p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsEditModalOpen(false); setEditingCert(null); }}
                  disabled={modalLoading}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Side-by-side content */}
              <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200/80 dark:divide-slate-850">
                
                {/* Formulaire (Gauche) */}
                <form onSubmit={handleUpdateCert} className="p-8 space-y-5 md:w-1/2 overflow-y-auto">
                  {modalError && (
                    <div className="p-4 bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-455 rounded-2xl text-sm font-semibold">
                      {modalError}
                    </div>
                  )}

                  {/* Nom commercial */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider pl-1">Nom commercial</label>
                    <input
                      type="text"
                      required
                      value={editNom}
                      onChange={(e) => setEditNom(e.target.value)}
                      placeholder="Azure Fundamentals"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200"
                    />
                  </div>

                  {/* Code et Fournisseur */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider pl-1">Code examen</label>
                      <input
                        type="text"
                        value={editCodeExamen}
                        onChange={(e) => setEditCodeExamen(e.target.value)}
                        placeholder="AZ-900"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center pl-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fournisseur</label>
                        <button
                          type="button"
                          onClick={() => setIsFournModalOpen(true)}
                          className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold hover:underline"
                        >
                          + Gérer
                        </button>
                      </div>
                      <select
                        value={editFournisseurId}
                        onChange={(e) => setEditFournisseurId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200 font-semibold"
                      >
                        {fournisseurs.length === 0 ? (
                          <option value="" disabled>Aucun fournisseur - Cliquez sur "+ Gérer"</option>
                        ) : (
                          fournisseurs.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.nom}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Niveau et Durée */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider pl-1">Niveau</label>
                      <select
                        value={editNiveau}
                        onChange={(e) => setEditNiveau(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200 font-semibold"
                      >
                        <option value="DEBUTANT">Débutant</option>
                        <option value="INTERMEDIAIRE">Intermédiaire</option>
                        <option value="AVANCE">Avancé</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider pl-1">Durée indicative</label>
                      <input
                        type="text"
                        value={editDureeIndicative}
                        onChange={(e) => setEditDureeIndicative(e.target.value)}
                        placeholder="15 heures"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Image picker */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider pl-1">Image / Badge de Certification</label>
                    
                    {editImage ? (
                      <div className="flex items-center gap-3 p-3 bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
                        <div className="w-12 h-12 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1">
                          <img src={editImage} alt="Thumbnail" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">Image de la certif actuelle / sélectionnée</p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 truncate">
                            {editImage.startsWith('data:') ? 'Fichier importé (Base64)' : editImage}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditImage('')}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer l'image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 border border-dashed border-slate-200 dark:border-slate-800 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-955/20 hover:bg-indigo-50/10 dark:hover:bg-indigo-955/5 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-200 relative">
                          <Upload className="w-4 h-4 text-slate-450 dark:text-slate-550 pl-1" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, true)}
                            className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-650 hover:file:bg-indigo-100 file:cursor-pointer cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={editImage}
                          onChange={(e) => setEditImage(e.target.value)}
                          placeholder="Ou saisissez un chemin d'accès (ex: /certifications/az900.svg)"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider pl-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Objectifs de la certification..."
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-200/80 dark:border-slate-850 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { setIsEditModalOpen(false); setEditingCert(null); }}
                      disabled={modalLoading}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200/60 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-600/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                    >
                      {modalLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Sauvegarder les modifications'
                      )}
                    </button>
                  </div>
                </form>

                {/* Prévisualisation (Droite) */}
                <div className="p-8 md:w-1/2 bg-gradient-to-tr from-slate-50 to-indigo-50/20 dark:from-slate-955 dark:to-indigo-955/10 flex flex-col items-center justify-center border-l border-slate-200/60 dark:border-slate-850 relative min-h-[450px]">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl pointer-events-none" />

                  <div className="w-full max-w-xs space-y-5 relative z-10">
                    <span className="text-[10px] font-black text-slate-450 dark:text-slate-550 uppercase tracking-widest block text-center">Aperçu en direct (Vue utilisateur)</span>
                    
                    <div className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[28px] overflow-hidden shadow-xl hover:shadow-2xl dark:shadow-black/30 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-300 group flex flex-col relative">
                      
                      <div className="h-40 w-full bg-white dark:bg-slate-955 border-b border-slate-150 dark:border-slate-850 relative flex items-center justify-center overflow-hidden p-3">
                        <div className="absolute w-32 h-32 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/15 transition-all duration-500" />
                        
                        {editImage && !editImageError ? (
                          <img 
                            src={editImage} 
                            alt={editNom || "Certification"} 
                            className="max-w-full max-h-full object-contain relative z-10 filter drop-shadow-sm group-hover:scale-103 transition-all duration-500"
                            onError={() => setEditImageError(true)}
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                            <div className="w-12 h-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700/80 bg-slate-105/50 dark:bg-slate-900/40 flex items-center justify-center mb-2">
                              <Award className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-widest">
                              Aucune image insérée
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${getSupplierBadgeStyle(fournisseurs.find(f => f.id === editFournisseurId)?.nom || '')}`}>
                              {fournisseurs.find(f => f.id === editFournisseurId)?.nom || 'Fournisseur'}
                            </span>
                            <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${getNiveauBadgeStyle(editNiveau)}`}>
                              {editNiveau}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            {editCodeExamen && (
                              <span className="text-[10px] font-bold text-indigo-555 dark:text-indigo-405 block uppercase tracking-wider">
                                {editCodeExamen}
                              </span>
                            )}
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                              {editNom || 'Titre de la Certification'}
                            </h3>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {editDescription || 'Aucune description rédigée pour le moment.'}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{editDureeIndicative || 'Non spécifiée'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5" />
                            <span>{editingCert?.modules?.length || 0} module{editingCert?.modules?.length > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de gestion des fournisseurs */}
      <AnimatePresence>
        {isFournModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-white uppercase tracking-wider">Gérer les Fournisseurs</h3>
                </div>
                <button
                  onClick={() => {
                    setIsFournModalOpen(false);
                    setFournError(null);
                    setFournNom('');
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenu */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {fournError && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold rounded-xl flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{fournError}</span>
                  </div>
                )}

                {/* Formulaire d'ajout */}
                <form onSubmit={handleCreateFournisseur} className="flex gap-2">
                  <input
                    type="text"
                    value={fournNom}
                    onChange={(e) => setFournNom(e.target.value)}
                    placeholder="Nom du fournisseur (ex: Microsoft)"
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all duration-200"
                    disabled={fournLoading}
                  />
                  <button
                    type="submit"
                    disabled={fournLoading || !fournNom.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1 shrink-0"
                  >
                    {fournLoading ? (
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>Ajouter</span>
                  </button>
                </form>

                {/* Liste des fournisseurs */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Fournisseurs actuels</p>
                  
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {fournisseurs.length === 0 ? (
                      <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        Aucun fournisseur enregistré.
                      </div>
                    ) : (
                      fournisseurs.map((f: any) => {
                        const count = f.certificationCount || 0;
                        const hasCerts = count > 0;
                        return (
                          <div
                            key={f.id}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-800/60 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/40"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{f.nom}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {count} certification{count > 1 ? 's' : ''}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteFournisseur(f.id, f.nom)}
                              disabled={fournLoading || hasCerts}
                              title={hasCerts ? "Ce fournisseur est lié à des certifications et ne peut pas être supprimé." : "Supprimer le fournisseur"}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                hasCerts
                                  ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50'
                                  : 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}