"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { FileText, Search, Plus, X, Edit, Trash2, Award, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, FolderOpen, BookOpen, Clock } from '@/components/icons';
import { Link, Video } from 'lucide-react';
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
  coursId?: string | null;
  cours?: {
    id: string;
    titre: string;
  } | null;
}

interface Certification {
  id: string;
  nom: string;
  slug: string;
  codeExamen?: string | null;
}

interface Course {
  id: string;
  titre: string;
  statut: string;
  imageUrl?: string | null;
  formateur?: {
    prenom: string;
    nom: string;
    avatar?: string | null;
  } | null;
  certification?: {
    codeExamen: string;
  } | null;
}

const typeIcon = (type: string) => {
  const cls = "w-4 h-4 object-contain shrink-0";
  switch (type?.toUpperCase()) {
    case 'PDF':
      return <img src="/logos/pdf.webp" alt="PDF" className={cls} />;
    case 'SLIDES':
    case 'SLIDE':
      return <img src="/logos/slides.png" alt="Slides" className={cls} />;
    case 'DATASET':
      return <img src="/logos/dataset.png" alt="Dataset" className={cls} />;
    case 'IMAGE':
    case 'EXERCICE':
      return <img src="/logos/exercice.png" alt="Exercice" className={cls} />;
    case 'VIDEO':
      return <Video className="w-4 h-4 text-purple-500 shrink-0" />;
    case 'LIEN_EXTERNE':
      return <Link className="w-4 h-4 text-blue-500 shrink-0" />;
    default:
      return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
  }
};

export default function ResourcesAdminPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [resources, setResources] = useState<Resource[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertFilter, setSelectedCertFilter] = useState<string>('TOUS');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('TOUS');

  // Tri & Navigation
  const [activeView, setActiveView] = useState<'COURS' | 'CHRONO'>('COURS');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // Pagination (pour la vue chronologique)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
  const [certificationId, setCertificationId] = useState('');
  const [coursId, setCoursId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resData, certData, coursesData] = await Promise.all([
        apiFetch('/certifications/ressources/toutes'),
        apiFetch('/certifications'),
        apiFetch('/cours/admin/all'),
      ]);
      setResources(Array.isArray(resData) ? resData : []);
      setCerts(Array.isArray(certData) ? certData : (certData?.data || []));
      setCoursesList(Array.isArray(coursesData) ? coursesData : []);
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
  }, [searchTerm, selectedCertFilter, selectedCourseFilter, activeView]);

  // Filtrage des ressources (Flux chrono)
  const filteredResources = React.useMemo(() => {
    return resources.filter(res => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch = !search || res.titre.toLowerCase().includes(search) || 
                            (res.description && res.description.toLowerCase().includes(search));
      const matchesCert = selectedCertFilter === 'TOUS' || res.certificationId === selectedCertFilter;
      const matchesCourse = selectedCourseFilter === 'TOUS' || res.coursId === selectedCourseFilter;
      return matchesSearch && matchesCert && matchesCourse;
    });
  }, [resources, searchTerm, selectedCertFilter, selectedCourseFilter]);

  // Filtrage des cours (Vue par cours)
  const filteredCourses = React.useMemo(() => {
    return coursesList.filter(course => {
      const search = searchTerm.toLowerCase().trim();
      return !search || course.titre.toLowerCase().includes(search) ||
             (course.formateur && `${course.formateur.prenom} ${course.formateur.nom}`.toLowerCase().includes(search));
    });
  }, [coursesList, searchTerm]);

  // Calculs pagination pour la vue chrono
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResources = React.useMemo(() => {
    return filteredResources.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredResources, indexOfFirstItem, indexOfLastItem]);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificationId && !coursId) {
      setModalError('Veuillez associer cette ressource à une certification ou à un cours.');
      return;
    }
    setModalLoading(true);
    setModalError(null);

    try {
      // Si certificationId est spécifié, on utilise le endpoint de certification
      // sinon on peut poster à un endpoint global de ressource ou avec certificationId optionnelle
      const targetCertId = certificationId || certs[0]?.id; // Fallback pour la route backend
      
      await apiFetch(`/certifications/${targetCertId}/ressources`, {
        method: 'POST',
        body: {
          titre,
          description: description || undefined,
          type,
          url,
          taille: taille ? parseInt(taille) : undefined,
          version,
          quotaTelechargement: parseInt(quota),
          public: false,
          certificationId: certificationId ? Number(certificationId) : undefined,
          coursId: coursId ? Number(coursId) : undefined,
        },
      });

      showToast(`La ressource "${titre}" a été ajoutée.`, "success");
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
    setCertificationId(res.certificationId || '');
    setCoursId(res.coursId || '');
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
          public: false,
          certificationId: certificationId ? Number(certificationId) : null,
          coursId: coursId ? Number(coursId) : null,
        },
      });

      showToast(`La ressource a été mise à jour.`, "success");
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
    const ok = await confirm({
      title: "Supprimer cette ressource ?",
      message: `Voulez-vous vraiment supprimer la ressource "${name}" ? Cette action est irréversible.`,
      confirmText: "Supprimer",
      cancelText: "Annuler",
      type: "danger"
    });

    if (!ok) return;

    try {
      await apiFetch(`/certifications/ressources/${id}`, { method: 'DELETE' });
      showToast("Ressource supprimée.", "success");
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erreur lors de la suppression.', "error");
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
    setCertificationId('');
    setCoursId('');
    setModalError(null);
  };

  const formatBytes = (bytes: number | null | undefined) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12 bg-[#020617] text-slate-300">
      
      {/* En-tête de page */}
      <h1 className="text-3xl font-black text-white tracking-tight">Gestion des Ressources</h1>

      {/* Cartes de Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 md:p-6 flex items-center justify-between shadow-sm">
          <div className="text-left space-y-1">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total des Fichiers</p>
            <h2 className="text-3xl font-black text-white">{resources.length}</h2>
          </div>
          <div className="w-12 h-12 bg-[#020617] border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 md:p-6 flex items-center justify-between shadow-sm">
          <div className="text-left space-y-1">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Cours avec supports</p>
            <h2 className="text-3xl font-black text-white">
              {new Set(resources.filter(r => r.coursId).map(r => r.coursId)).size}
            </h2>
          </div>
          <div className="w-12 h-12 bg-[#020617] border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TABS DE SELECTION DE VUE */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
        <button
          onClick={() => setActiveView('COURS')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === 'COURS'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-600/20 text-white'
              : 'bg-[#080d1a] text-slate-400 hover:bg-slate-800/30 border border-slate-800'
          }`}
        >
          Par Cours
        </button>
        <button
          onClick={() => setActiveView('CHRONO')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeView === 'CHRONO'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-600/20 text-white'
              : 'bg-[#080d1a] text-slate-400 hover:bg-slate-800/30 border border-slate-800'
          }`}
        >
          Toutes les ressources
        </button>
      </div>

      {/* Conteneur principal de gestion */}
      <div className="bg-[#080d1a] border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Barre de recherche et de filtres */}
        <div className="p-5 md:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex flex-1 items-center gap-3 w-full max-w-lg">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Rechercher ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 h-11 py-0 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 transition-all text-xs outline-none font-bold rounded-2xl"
              />
            </div>

            {activeView === 'CHRONO' && (
              <>
                <select
                  value={selectedCertFilter}
                  onChange={(e) => setSelectedCertFilter(e.target.value)}
                  className="flex-1 min-w-0 px-4 h-11 py-0 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-2xl text-white text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="TOUS">Toutes les certifications</option>
                  {certs.map(c => (
                    <option key={c.id} value={c.id}>{c.codeExamen || c.nom}</option>
                  ))}
                </select>

                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="flex-1 min-w-0 px-4 h-11 py-0 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-2xl text-white text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="TOUS">Tous les cours</option>
                  {coursesList.map(c => (
                    <option key={c.id} value={c.id}>{c.titre}</option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
              {activeView === 'COURS' ? (
                <span>{filteredCourses.length} cours</span>
              ) : (
                <span>{filteredResources.length} document{filteredResources.length > 1 ? 's' : ''}</span>
              )}
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-600/20 font-extrabold rounded-2xl text-xs cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle ressource</span>
            </button>
          </div>
        </div>

        {/* CONTENU DE LA GRILLE */}
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <span className="w-10 h-10 border-4 border-slate-800 border-t-slate-950 rounded-full animate-spin inline-block mb-3" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Chargement des données...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 font-bold">
            {error}
          </div>
        ) : activeView === 'COURS' ? (
          /* ==============================================================
             VUE DÉTAILLÉE PAR COURS (ACCORDÉONS SANS LAG)
             ============================================================== */
          <div className="divide-y divide-slate-800">
            {filteredCourses.map(course => {
              const courseResources = resources.filter(r => r.coursId === course.id);
              const isExpanded = expandedCourseId === course.id;

              return (
                <div key={course.id} className="transition-colors hover:bg-slate-800/30">
                  {/* Entête d'accordéon de cours */}
                  <button
                    onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {course.imageUrl ? (
                        <img src={course.imageUrl} alt="" className="w-12 h-9 rounded-lg object-cover border border-slate-150 shrink-0" />
                      ) : (
                        <div className="w-12 h-9 bg-slate-900/50 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      )}
                      
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-white truncate leading-snug">
                          {course.titre}
                        </h4>
                        
                        <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                          <span className="bg-blue-950/30 border border-blue-900/50 text-blue-400 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shadow-sm">
                            {course.certification?.codeExamen || 'Général'}
                          </span>
                          <span className="text-[10px] text-slate-450 font-bold flex items-center gap-1">
                            {course.formateur?.avatar ? (
                              <img src={course.formateur.avatar} alt="" className="w-4.5 h-4.5 rounded-full object-cover shrink-0" />
                            ) : (
                              <span className="w-4.5 h-4.5 rounded-full bg-blue-950/30 text-cyan-400 flex items-center justify-center text-[8px] font-black shrink-0">
                                {course.formateur ? `${course.formateur.prenom[0]}${course.formateur.nom[0]}` : 'ED'}
                              </span>
                            )}
                            Par {course.formateur ? `${course.formateur.prenom} ${course.formateur.nom}` : 'Ethical Data'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[10px] font-black px-2.5 py-1 bg-blue-950/30 text-cyan-400 rounded-full uppercase">
                        {courseResources.length} support{courseResources.length > 1 ? 's' : ''}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Liste des ressources sous le cours */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden bg-[#020617] border-t border-slate-800"
                      >
                        {courseResources.length === 0 ? (
                          <p className="text-xs text-slate-400 font-bold p-6 text-center uppercase tracking-wide">
                            Aucun document rattaché à ce cours.
                          </p>
                        ) : (
                          <div className="p-4 overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                                  <th className="py-2.5 px-3">Type</th>
                                  <th className="py-2.5 px-3">Titre de la ressource</th>
                                  <th className="py-2.5 px-3">Version</th>
                                  <th className="py-2.5 px-3">Taille</th>
                                  <th className="py-2.5 px-3 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800 font-semibold text-slate-300">
                                {courseResources.map(res => (
                                  <tr key={res.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="py-3 px-3 shrink-0">
                                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#020617] border border-slate-800 rounded-md w-fit">
                                        {typeIcon(res.type)}
                                        <span className="font-extrabold text-[9px] uppercase tracking-wider text-slate-300">
                                          {res.type}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-3 min-w-[200px]">
                                      <p className="font-extrabold text-white text-xs truncate max-w-md">{res.titre}</p>
                                      <p className="text-[10px] text-slate-400 truncate max-w-sm mt-0.5">{res.description || 'Pas de description'}</p>
                                    </td>
                                    <td className="py-3 px-3 text-slate-400 font-bold">v{res.version}</td>
                                    <td className="py-3 px-3 text-slate-400 font-bold">{formatBytes(res.taille)}</td>
                                    <td className="py-3 px-3 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          onClick={() => handleOpenEditModal(res)}
                                          className="p-1.5 hover:bg-blue-950/30 text-cyan-400 rounded-lg cursor-pointer transition-colors"
                                          title="Modifier"
                                        >
                                          <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteResource(res.id, res.titre)}
                                          className="p-1.5 hover:bg-rose-950/30 text-rose-400 rounded-lg cursor-pointer transition-colors"
                                          title="Supprimer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          /* ==============================================================
             VUE TRADITIONNELLE CHRONOLOGIQUE PAGINÉE
             ============================================================== */
          <>
            {filteredResources.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-wide text-xs">
                Aucune ressource disponible.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-6 text-left">
                  {currentResources.map((res) => (
                    <div
                      key={res.id}
                      className="bg-[#080d1a] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between group transition-all duration-300 hover:border-slate-700 hover:shadow-md"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#020617] border border-slate-800 rounded-lg">
                            {typeIcon(res.type)}
                            <span className="font-extrabold text-[9px] uppercase tracking-wider text-slate-300">
                              {res.type}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="font-extrabold text-white text-base leading-snug group-hover:text-red-400 transition-colors truncate">
                            {res.titre}
                          </h4>
                          
                          {res.cours && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">Cours : {res.cours.titre}</span>
                            </div>
                          )}

                          {res.certification && (
                            <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold uppercase mt-0.5">
                              <Award className="w-3.5 h-3.5" />
                              <span className="truncate bg-blue-950/30 border border-blue-900/50 px-2 py-0.5 rounded-md text-[9px] shadow-sm">
                                Exam : {res.certification.codeExamen || res.certification.nom}
                              </span>
                            </div>
                          )}

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-semibold">
                            {res.description || 'Aucune description fournie.'}
                          </p>
                        </div>
                        
                        <div className="text-[10px] text-slate-400 font-bold bg-[#020617] border border-slate-800 rounded-xl p-2.5 text-center">
                          Quota max par apprenant : {res.quotaTelechargement} téléchargements
                        </div>
                      </div>

                      {/* Footer de carte */}
                      <div className="pt-4 border-t border-slate-800 mt-5">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1.5">
                            <span>{formatBytes(res.taille)}</span>
                            <span>•</span>
                            <span>v{res.version}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(res)}
                            className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-blue-600/20"
                            title="Gérer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Gérer</span>
                          </button>
                          <button
                            onClick={() => handleDeleteResource(res.id, res.titre)}
                            className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-rose-600/20"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-6 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-[#080d1a] shadow-sm"
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
                            className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${isActive ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white' : 'bg-transparent text-slate-400 hover:bg-slate-800/30 hover:text-white'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-[#080d1a] shadow-sm"
                    >
                      <span>Suivant</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* MODAL DE CRÉATION (SANS LAG) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-[#080d1a] border border-slate-800 w-full max-w-2xl rounded-2xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-black text-white">Ajouter un document</h2>
                <button
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  disabled={modalLoading}
                  className="p-1.5 hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateResource} className="p-5 overflow-y-auto hide-scrollbar space-y-3.5 flex-1 text-left">
                {modalError && (
                  <div className="p-3.5 bg-rose-950/30 border border-rose-800/50 text-rose-400 rounded-xl text-xs font-bold">
                    {modalError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Examen / Certification *</label>
                    <select
                      value={certificationId}
                      onChange={(e) => setCertificationId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white rounded-xl text-sm outline-none transition-all font-semibold cursor-pointer"
                    >
                      <option value="">Sélectionner une certification...</option>
                      {certs.map(c => (
                        <option key={c.id} value={c.id}>{c.nom} ({c.codeExamen || 'Examen'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Titre de la ressource *</label>
                    <input
                      type="text"
                      required
                      value={titre}
                      onChange={(e) => setTitre(e.target.value)}
                      placeholder="Mémo de révision..."
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl text-sm outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Détails du fichier..."
                    className="w-full h-16 p-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl text-sm outline-none transition-all font-semibold resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Format / Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white rounded-xl text-sm outline-none transition-all font-semibold cursor-pointer"
                    >
                      <option value="PDF">PDF</option>
                      <option value="SLIDES">Slides / Présentation</option>
                      <option value="DATASET">Dataset / Fichier de travail</option>
                      <option value="IMAGE">Image / Schéma</option>
                      <option value="DOCX">Word (DOCX)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Version du fichier</label>
                    <input
                      type="text"
                      required
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="1.0.0"
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl text-sm outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Lien / URL du document *</label>
                  <input
                    type="text"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/file.pdf ou /docs/az900.pdf"
                    className="w-full px-4 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl text-sm outline-none transition-all font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Taille (Bytes) <span className="lowercase font-bold text-slate-400 text-[9px]">(optionnel)</span></label>
                    <input
                      type="number"
                      value={taille}
                      onChange={(e) => setTaille(e.target.value)}
                      placeholder="1500000 (1.5 MB)"
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl text-sm outline-none transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Quota Téléchargements max *</label>
                    <input
                      type="number"
                      required
                      value={quota}
                      onChange={(e) => setQuota(e.target.value)}
                      placeholder="10"
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl text-sm outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 bg-[#080d1a]">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                    disabled={modalLoading}
                    className="px-5 py-3 bg-slate-900/50 hover:bg-rose-950/30 hover:text-rose-500 hover:border-rose-900/50 border border-transparent text-slate-400 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    {modalLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Ajouter le support'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL D'ÉDITION (SANS LAG) */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-[#080d1a] border border-slate-800 w-full max-w-2xl rounded-2xl shadow-xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-black text-white">Modifier la ressource</h2>
                <button
                  onClick={() => { setIsEditModalOpen(false); setEditingResource(null); }}
                  disabled={modalLoading}
                  className="p-1.5 hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateResource} className="p-5 overflow-y-auto hide-scrollbar space-y-3.5 flex-1 text-left">
                {modalError && (
                  <div className="p-3.5 bg-rose-950/30 border border-rose-800/50 text-rose-400 rounded-xl text-xs font-bold">
                    {modalError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Examen / Certification cible *</label>
                    <select
                      value={certificationId}
                      onChange={(e) => setCertificationId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white rounded-xl text-sm outline-none transition-all font-semibold cursor-pointer"
                    >
                      <option value="">Sélectionner une certification...</option>
                      {certs.map(c => (
                        <option key={c.id} value={c.id}>{c.nom} ({c.codeExamen || 'Examen'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Titre de la ressource *</label>
                    <input
                      type="text"
                      required
                      value={titre}
                      onChange={(e) => setTitre(e.target.value)}
                      placeholder="Mémo de révision..."
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl text-sm outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Détails du fichier..."
                    className="w-full h-16 p-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl text-sm outline-none transition-all font-semibold resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Format / Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white rounded-xl text-sm outline-none transition-all font-semibold cursor-pointer"
                    >
                      <option value="PDF">PDF</option>
                      <option value="SLIDES">Slides / Présentation</option>
                      <option value="DATASET">Dataset / Fichier de travail</option>
                      <option value="IMAGE">Image / Schéma</option>
                      <option value="DOCX">Word (DOCX)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Version du fichier</label>
                    <input
                      type="text"
                      required
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="1.0.0"
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl text-sm outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Lien / URL du document *</label>
                  <input
                    type="text"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/file.pdf ou /docs/az900.pdf"
                    className="w-full px-4 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl text-sm outline-none transition-all font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Taille (Bytes) <span className="lowercase font-bold text-slate-400 text-[9px]">(optionnel)</span></label>
                    <input
                      type="number"
                      value={taille}
                      onChange={(e) => setTaille(e.target.value)}
                      placeholder="1500000 (1.5 MB)"
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl text-sm outline-none transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Quota Téléchargements max *</label>
                    <input
                      type="number"
                      required
                      value={quota}
                      onChange={(e) => setQuota(e.target.value)}
                      placeholder="10"
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl text-sm outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 bg-[#080d1a]">
                  <button
                    type="button"
                    onClick={() => { setIsEditModalOpen(false); setEditingResource(null); resetForm(); }}
                    disabled={modalLoading}
                    className="px-5 py-3 bg-slate-900/50 hover:bg-rose-950/30 hover:text-rose-500 hover:border-rose-900/50 border border-transparent text-slate-400 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-black rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs shadow-lg shadow-blue-600/20 active:scale-95"
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
