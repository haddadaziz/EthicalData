"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { Award, Plus, RefreshCw, X, Edit, Trash2, Search, Layers, Briefcase, BookmarkCheck, Upload, Clock, Sparkles, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react'; import { motion, AnimatePresence } from 'framer-motion';

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
    const [selectedLevel, setSelectedLevel] = useState<string>('TOUS');
    const [selectedProvider, setSelectedProvider] = useState<string>('TOUS');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedLevel, selectedProvider]);

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
    // États pour le modal de gestion des questions
    const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
    const [selectedCertForQuestions, setSelectedCertForQuestions] = useState<Certification | null>(null);
    const [questionsList, setQuestionsList] = useState<any[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    // États pour le formulaire d'ajout de question
    const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
    const [questionType, setQuestionType] = useState('QCM');
    const [questionEnonce, setQuestionEnonce] = useState('');
    const [questionExplication, setQuestionExplication] = useState('');
    const [questionReponseCorrecte, setQuestionReponseCorrecte] = useState('A');
    const [questionGrilleNotation, setQuestionGrilleNotation] = useState('');
    const [questionCategorie, setQuestionCategorie] = useState('');
    const [optA, setOptA] = useState('');
    const [optB, setOptB] = useState('');
    const [optC, setOptC] = useState('');
    const [optD, setOptD] = useState('');
    const [questionError, setQuestionError] = useState<string | null>(null);
    const [questionLoading, setQuestionLoading] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

    const handleOpenQuestionsModal = async (cert: Certification) => {
        setSelectedCertForQuestions(cert);
        setIsQuestionsModalOpen(true);
        setLoadingQuestions(true);
        try {
            const data = await apiFetch(`/certifications/${cert.id}/questions`);
            setQuestionsList(data);
        } catch (err: any) {
            console.error(err);
            alert("Impossible de charger les questions de cette certification.");
        } finally {
            setLoadingQuestions(false);
        }
    };

    const handleDeleteQuestion = async (qId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette question de l'examen ?")) return;
        try {
            await apiFetch(`/certifications/questions/${qId}`, {
                method: 'DELETE'
            });
            if (selectedCertForQuestions) {
                const data = await apiFetch(`/certifications/${selectedCertForQuestions.id}/questions`);
                setQuestionsList(data);
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Une erreur est survenue lors de la suppression.");
        }
    };

    const handleEditQuestion = (q: any) => {
        setEditingQuestion(q);
        setQuestionType(q.type || 'QCM');
        setQuestionEnonce(q.enonce);
        setQuestionExplication(q.explication || '');
        setQuestionReponseCorrecte(q.reponseCorrecte);
        setQuestionGrilleNotation(q.grilleNotation || '');
        setQuestionCategorie(q.categorie || '');
        
        if (q.type === 'QCM' && q.options) {
            setOptA(q.options.find((o: any) => o.lettre === 'A')?.texte || '');
            setOptB(q.options.find((o: any) => o.lettre === 'B')?.texte || '');
            setOptC(q.options.find((o: any) => o.lettre === 'C')?.texte || '');
            setOptD(q.options.find((o: any) => o.lettre === 'D')?.texte || '');
        } else {
            setOptA('');
            setOptB('');
            setOptC('');
            setOptD('');
        }
        setIsQuestionFormOpen(true);
    };

    const handleSaveQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCertForQuestions) return;
        if (!questionEnonce.trim()) {
            setQuestionError("L'énoncé de la question est obligatoire.");
            return;
        }

        setQuestionLoading(true);
        setQuestionError(null);

        const payload: any = {
            enonce: questionEnonce.trim(),
            explication: questionExplication.trim() || null,
            categorie: questionCategorie.trim() || null,
            type: questionType
        };

        if (questionType === 'QCM') {
            if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
                setQuestionError("Les 4 options de réponse sont obligatoires pour un QCM.");
                setQuestionLoading(false);
                return;
            }
            payload.reponseCorrecte = questionReponseCorrecte;
            payload.options = [
                { lettre: 'A', texte: optA.trim() },
                { lettre: 'B', texte: optB.trim() },
                { lettre: 'C', texte: optC.trim() },
                { lettre: 'D', texte: optD.trim() }
            ];
        } else if (questionType === 'VRAI_FAUX') {
            payload.reponseCorrecte = questionReponseCorrecte;
            payload.options = [
                { lettre: 'A', texte: 'Vrai' },
                { lettre: 'B', texte: 'Faux' }
            ];
        } else {
            // OUVERTE ou CAS_PRATIQUE
            if (!questionReponseCorrecte.trim()) {
                setQuestionError("La réponse modèle attendue (pour l'étudiant) est obligatoire.");
                setQuestionLoading(false);
                return;
            }
            if (!questionGrilleNotation.trim()) {
                setQuestionError("La grille de notation/critères d'évaluation (pour l'IA) est obligatoire.");
                setQuestionLoading(false);
                return;
            }
            payload.reponseCorrecte = questionReponseCorrecte.trim();
            payload.grilleNotation = questionGrilleNotation.trim();
            payload.options = [];
        }

        try {
            if (editingQuestion) {
                await apiFetch(`/certifications/questions/${editingQuestion.id}`, {
                    method: 'PATCH',
                    body: payload
                });
            } else {
                await apiFetch(`/certifications/${selectedCertForQuestions.id}/questions`, {
                    method: 'POST',
                    body: payload
                });
            }

            const data = await apiFetch(`/certifications/${selectedCertForQuestions.id}/questions`);
            setQuestionsList(data);
            setIsQuestionFormOpen(false);
            resetQuestionForm();
        } catch (err: any) {
            console.error(err);
            setQuestionError(err.message || "Une erreur est survenue lors de l'enregistrement.");
        } finally {
            setQuestionLoading(false);
        }
    };

    const resetQuestionForm = () => {
        setEditingQuestion(null);
        setQuestionType('QCM');
        setQuestionEnonce('');
        setQuestionExplication('');
        setQuestionReponseCorrecte('A');
        setQuestionGrilleNotation('');
        setQuestionCategorie('');
        setOptA('');
        setOptB('');
        setOptC('');
        setOptD('');
        setQuestionError(null);
    };

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
                setFournisseurId(fournisseursData[0].id.toString());
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
        const matchesSearch = !search || (
            (c.nom || '').toLowerCase().includes(search) ||
            (c.codeExamen || '').toLowerCase().includes(search) ||
            (c.description || '').toLowerCase().includes(search) ||
            (c.fournisseur?.nom || '').toLowerCase().includes(search)
        );

        const matchesLevel = selectedLevel === 'TOUS' || c.niveau === selectedLevel;
        const matchesProvider = selectedProvider === 'TOUS' || c.fournisseur?.slug === selectedProvider;

        return matchesSearch && matchesLevel && matchesProvider;
    });

    // Calcul des statistiques
    const totalCerts = certs.length;
    const microsoftCount = certs.filter(c => c.fournisseur.nom === 'Microsoft').length;
    const awsCount = certs.filter(c => c.fournisseur.nom === 'AWS').length;
    const otherCount = totalCerts - (microsoftCount + awsCount);

    // Pagination
    const totalPages = Math.ceil(filteredCerts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCerts = filteredCerts.slice(indexOfFirstItem, indexOfLastItem);

    // Gestion de la sélection locale de fichiers (conversion en Base64)
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
                setFournisseurId(fournisseursData[0]?.id?.toString() || '');
            }
            if (editFournisseurId === id) {
                setEditFournisseurId(fournisseursData[0]?.id?.toString() || '');
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
        setEditFournisseurId(cert.fournisseurId.toString());
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
            setFournisseurId(fournisseurs[0].id.toString());
        }
        setModalError(null);
    };

    const getNiveauBadgeStyle = (niv: string) => {
        switch (niv) {
            case 'AVANCE':
                return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
            case 'INTERMEDIAIRE':
                return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            case 'DEBUTANT':
            default:
                return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        }
    };

    const getSupplierBadgeStyle = (name: string) => {
        switch (name?.toLowerCase()) {
            case 'microsoft':
                return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
            case 'aws':
                return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            case 'google cloud':
            case 'google':
                return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'cisco':
                return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
            default:
                return 'bg-slate-500/10 text-slate-600 border border-slate-500/20';
        }
    };

    return (
        <div className="space-y-10 text-slate-800">

            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="text-left">
                    <h1 className="text-3xl font-black text-slate-950 tracking-tight">Catalogue Certifications</h1>
                    <p className="text-slate-600 text-xs mt-1.5 font-medium">Gérez les examens, les modules et les prérequis de formation.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-950 rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
                        title="Rafraîchir"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-white/5 transition-all"
                    >
                        <Plus className="w-4.5 h-4.5" />
                        <span>Nouvelle Certification</span>
                    </button>
                </div>
            </div>

            {/* Cartes Statistiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 bg-white shadow-sm border border-slate-200/80 rounded-2xl p-6 animate-pulse space-y-4" />
                    ))
                ) : (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white shadow-sm backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between"
                        >
                            <div className="text-left">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Certifications</p>
                                <p className="text-3xl font-black text-slate-950 mt-2">{totalCerts}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-red-600">
                                <Award className="w-6 h-6" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white shadow-sm backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between"
                        >
                            <div className="text-left">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Microsoft</p>
                                <p className="text-3xl font-black text-slate-950 mt-2">{microsoftCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center text-sky-400">
                                <Layers className="w-6 h-6" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white shadow-sm backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between"
                        >
                            <div className="text-left">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AWS</p>
                                <p className="text-3xl font-black text-slate-950 mt-2">{awsCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-405">
                                <Briefcase className="w-6 h-6" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white shadow-sm backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 flex items-center justify-between"
                        >
                            <div className="text-left">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Autres</p>
                                <p className="text-3xl font-black text-slate-950 mt-2">{otherCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                                <BookmarkCheck className="w-6 h-6" />
                            </div>
                        </motion.div>
                    </>
                )}
            </div>

            {/* Conteneur des Certifications */}
            <div className="bg-white backdrop-blur-xl border border-slate-200/80 rounded-3xl overflow-hidden">

                {/* Entête avec Recherche & Filtres */}
                <div className="p-6 border-b border-slate-200/80 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        {/* Barre de recherche */}
                        <div className="relative flex-1 max-w-sm">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                                <Search className="w-4 h-4" />
                            </span>
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 placeholder-slate-400 transition-all text-sm outline-none font-semibold"
                            />
                        </div>

                        {/* Filtre Niveau */}
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-xs font-bold outline-none transition-all cursor-pointer"
                        >
                            <option value="TOUS">Tous les niveaux</option>
                            <option value="DEBUTANT">Débutant</option>
                            <option value="INTERMEDIAIRE">Intermédiaire</option>
                            <option value="AVANCE">Avancé</option>
                        </select>

                        {/* Filtre Fournisseur */}
                        <select
                            value={selectedProvider}
                            onChange={(e) => setSelectedProvider(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-xs font-bold outline-none transition-all cursor-pointer"
                        >
                            <option value="TOUS">Tous les constructeurs</option>
                            {fournisseurs.map(f => (
                                <option key={f.id} value={f.slug}>{f.nom}</option>
                            ))}
                        </select>

                        <div className="text-xs text-slate-500 font-bold ml-auto shrink-0">
                            {filteredCerts.length} certification{filteredCerts.length > 1 ? 's' : ''} trouvée{filteredCerts.length > 1 ? 's' : ''}
                        </div>
                    </div>
                </div>

                {/* Grille de Cartes Premium */}
                <div>
                    {loading ? (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-72 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <p className="text-rose-500 font-bold mb-2">Une erreur est survenue</p>
                            <p className="text-xs text-slate-500 mb-6">{error}</p>
                            <button onClick={fetchData} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-950 font-bold rounded-xl cursor-pointer transition-colors">Réessayer</button>
                        </div>
                    ) : filteredCerts.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 font-medium">
                            Aucune certification ne correspond à vos critères.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
                                {currentCerts.map((cert) => (
                                    <div
                                        key={cert.id}
                                        className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-300 hover:shadow-lg flex flex-col group"
                                    >
                                        {/* Image */}
                                        <div className="w-full h-36 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-6 relative overflow-hidden shrink-0">
                                            {cert.image ? (
                                                <img src={cert.image} alt={cert.nom} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" />
                                            ) : (
                                                <Award className="w-12 h-12 text-slate-300" />
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <span className="font-bold text-red-600 text-[9px] px-2 py-0.5 bg-red-50 border border-red-100 rounded-lg">{cert.codeExamen || 'Examen'}</span>
                                            </div>
                                            <div className="absolute top-3 right-3">
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getNiveauBadgeStyle(cert.niveau)}`}>{cert.niveau}</span>
                                            </div>
                                        </div>

                                        {/* Corps */}
                                        <div className="p-5 flex-1 flex flex-col text-left space-y-3">
                                            <div className="space-y-1.5">
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider inline-block ${getSupplierBadgeStyle(cert.fournisseur.nom)}`}>{cert.fournisseur.nom}</span>
                                                <h4 className="font-extrabold text-slate-950 text-base leading-snug group-hover:text-red-600 transition-colors line-clamp-1">{cert.nom}</h4>
                                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-semibold">{cert.description}</p>
                                            </div>

                                            <div className="pt-3 border-t border-slate-100 mt-auto space-y-3">
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                                                    <span>{cert.dureeIndicative || 'Durée N/A'}</span>
                                                    <span>{cert.modules?.length || 0} module{cert.modules?.length > 1 ? 's' : ''}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => handleOpenQuestionsModal(cert)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 hover:text-red-700 rounded-xl transition-all cursor-pointer text-[10px] font-black uppercase tracking-wider" title="Questions">
                                                        <HelpCircle className="w-3.5 h-3.5" />
                                                        <span>Questions</span>
                                                    </button>
                                                    <button onClick={() => handleOpenEditModal(cert)} className="p-2.5 bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-slate-600 hover:text-slate-950 rounded-xl transition-colors cursor-pointer" title="Modifier">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteCert(cert.id, cert.nom)} className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors cursor-pointer" title="Supprimer">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Premium */}
                            {totalPages > 1 && (
                                <div className="p-6 border-t border-slate-200/80 flex items-center justify-between">
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
                            className="bg-slate-50 border border-slate-200/80 w-full max-w-5xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-xl font-black text-slate-950 leading-tight">Nouvelle certification</h2>
                                        <p className="text-xs text-slate-500">Configurez une nouvelle certification et visualisez-la en direct.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    disabled={modalLoading}
                                    className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-950 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Side-by-side content */}
                            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-900">

                                {/* Formulaire (Gauche) */}
                                <form onSubmit={handleCreateCert} className="p-8 space-y-5 md:w-1/2 overflow-y-auto text-left">
                                    {modalError && (
                                        <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold">
                                            {modalError}
                                        </div>
                                    )}

                                    {/* Nom commercial */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Nom commercial</label>
                                        <input
                                            type="text"
                                            required
                                            value={nom}
                                            onChange={(e) => setNom(e.target.value)}
                                            placeholder="Azure Fundamentals"
                                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                                        />
                                    </div>

                                    {/* Code et Fournisseur */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Code examen</label>
                                            <input
                                                type="text"
                                                value={codeExamen}
                                                onChange={(e) => setCodeExamen(e.target.value)}
                                                placeholder="AZ-900"
                                                className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center pl-1">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fournisseur</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsFournModalOpen(true)}
                                                    className="text-[10px] text-red-600 hover:text-indigo-300 font-bold uppercase tracking-wider"
                                                >
                                                    + Gérer
                                                </button>
                                            </div>
                                            <select
                                                value={fournisseurId}
                                                onChange={(e) => setFournisseurId(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold"
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Niveau</label>
                                            <select
                                                value={niveau}
                                                onChange={(e) => setNiveau(e.target.value as any)}
                                                className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold"
                                            >
                                                <option value="DEBUTANT">Débutant</option>
                                                <option value="INTERMEDIAIRE">Intermédiaire</option>
                                                <option value="AVANCE">Avancé</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Durée indicative</label>
                                            <input
                                                type="text"
                                                value={dureeIndicative}
                                                onChange={(e) => setDureeIndicative(e.target.value)}
                                                placeholder="15 heures"
                                                className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Image picker */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Image / Badge de Certification</label>

                                        {image ? (
                                            <div className="flex items-center gap-3 p-3 bg-indigo-950/10 border border-indigo-900/30 rounded-xl">
                                                <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1">
                                                    <img src={image} alt="Thumbnail" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-355 truncate">Image sélectionnée</p>
                                                    <p className="text-[10px] text-slate-500 truncate">
                                                        {image.startsWith('data:') ? 'Fichier importé (Base64)' : image}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setImage('')}
                                                    className="p-1.5 hover:bg-slate-50 text-rose-500 rounded-lg transition-colors cursor-pointer"
                                                    title="Supprimer l'image"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 border border-dashed border-slate-200 p-3 rounded-xl bg-slate-50/20 hover:bg-indigo-950/5 hover:border-red-100 transition-all duration-200 relative">
                                                    <Upload className="w-4 h-4 text-slate-500 pl-1" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileChange(e, false)}
                                                        className="w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-50 file:text-slate-950 hover:file:bg-slate-100 file:cursor-pointer cursor-pointer"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={image}
                                                    onChange={(e) => setImage(e.target.value)}
                                                    placeholder="Ou saisissez un chemin d'accès (ex: /certifications/az900.png)"
                                                    className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Description</label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Objectifs de la certification..."
                                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all resize-none"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-6 border-t border-slate-200/80 flex justify-end gap-3 bg-slate-50 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => { setIsModalOpen(false); resetForm(); }}
                                            disabled={modalLoading}
                                            className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-450 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs uppercase tracking-wider"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={modalLoading}
                                            className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md"
                                        >
                                            {modalLoading ? (
                                                <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                            ) : (
                                                'Créer la certification'
                                            )}
                                        </button>
                                    </div>
                                </form>

                                {/* Prévisualisation (Droite) */}
                                <div className="p-8 md:w-1/2 bg-gradient-to-tr from-slate-950 to-indigo-950/15 flex flex-col items-center justify-center border-l border-slate-200/80 relative min-h-[450px]">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-red-50 blur-3xl pointer-events-none" />

                                    <div className="w-full max-w-xs space-y-5 relative z-10">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center">Aperçu en direct (Vue utilisateur)</span>

                                        <div className="w-full max-w-xs bg-white backdrop-blur-md border border-slate-200 rounded-[28px] overflow-hidden shadow-xl hover:shadow-2xl hover:border-red-100 transition-all duration-300 group flex flex-col relative">

                                            <div className="h-40 w-full bg-slate-50 border-b border-slate-200 relative flex items-center justify-center overflow-hidden p-3">
                                                <div className="absolute w-32 h-32 rounded-full bg-red-50 blur-xl group-hover:bg-red-600/15 transition-all duration-500" />

                                                {image && !imageError ? (
                                                    <img
                                                        src={image}
                                                        alt={nom || "Certification"}
                                                        className="max-w-full max-h-full object-contain relative z-10 filter drop-shadow-sm group-hover:scale-[1.02] transition-all duration-500"
                                                        onError={() => setImageError(true)}
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                                                        <div className="w-12 h-12 rounded-2xl border border-dashed border-slate-700/80 bg-white shadow-sm flex items-center justify-center mb-2">
                                                            <Award className="w-6 h-6 text-slate-600" />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
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

                                                    <div className="space-y-0.5 text-left">
                                                        {codeExamen && (
                                                            <span className="text-[10px] font-bold text-red-600 block uppercase tracking-wider">
                                                                {codeExamen}
                                                            </span>
                                                        )}
                                                        <h3 className="font-extrabold text-base text-slate-950 line-clamp-1 group-hover:text-red-600 transition-colors">
                                                            {nom || 'Titre de la Certification'}
                                                        </h3>
                                                    </div>

                                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed text-left">
                                                        {description || 'Aucune description rédigée pour le moment.'}
                                                    </p>
                                                </div>

                                                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
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
                            className="bg-slate-50 border border-slate-200/80 w-full max-w-5xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                                        <Edit className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-xl font-black text-slate-950 leading-tight">Modifier la certification</h2>
                                        <p className="text-xs text-slate-500">Modifiez les caractéristiques et suivez l'impact visuel en direct.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setIsEditModalOpen(false); setEditingCert(null); }}
                                    disabled={modalLoading}
                                    className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-950 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Side-by-side content */}
                            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-900">

                                {/* Formulaire (Gauche) */}
                                <form onSubmit={handleUpdateCert} className="p-8 space-y-5 md:w-1/2 overflow-y-auto text-left">
                                    {modalError && (
                                        <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold">
                                            {modalError}
                                        </div>
                                    )}

                                    {/* Nom commercial */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Nom commercial</label>
                                        <input
                                            type="text"
                                            required
                                            value={editNom}
                                            onChange={(e) => setEditNom(e.target.value)}
                                            placeholder="Azure Fundamentals"
                                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                                        />
                                    </div>

                                    {/* Code et Fournisseur */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Code examen</label>
                                            <input
                                                type="text"
                                                value={editCodeExamen}
                                                onChange={(e) => setEditCodeExamen(e.target.value)}
                                                placeholder="AZ-900"
                                                className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center pl-1">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fournisseur</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsFournModalOpen(true)}
                                                    className="text-[10px] text-red-600 hover:text-indigo-300 font-bold uppercase tracking-wider"
                                                >
                                                    + Gérer
                                                </button>
                                            </div>
                                            <select
                                                value={editFournisseurId}
                                                onChange={(e) => setEditFournisseurId(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold"
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Niveau</label>
                                            <select
                                                value={editNiveau}
                                                onChange={(e) => setEditNiveau(e.target.value as any)}
                                                className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold"
                                            >
                                                <option value="DEBUTANT">Débutant</option>
                                                <option value="INTERMEDIAIRE">Intermédiaire</option>
                                                <option value="AVANCE">Avancé</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Durée indicative</label>
                                            <input
                                                type="text"
                                                value={editDureeIndicative}
                                                onChange={(e) => setEditDureeIndicative(e.target.value)}
                                                placeholder="15 heures"
                                                className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Image picker */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Image / Badge de Certification</label>

                                        {editImage ? (
                                            <div className="flex items-center gap-3 p-3 bg-indigo-950/10 border border-indigo-900/30 rounded-xl">
                                                <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1">
                                                    <img src={editImage} alt="Thumbnail" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-355 truncate">Image sélectionnée</p>
                                                    <p className="text-[10px] text-slate-500 truncate">
                                                        {editImage.startsWith('data:') ? 'Fichier importé (Base64)' : editImage}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditImage('')}
                                                    className="p-1.5 hover:bg-slate-50 text-rose-500 rounded-lg transition-colors cursor-pointer"
                                                    title="Supprimer l'image"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 border border-dashed border-slate-200 p-3 rounded-xl bg-slate-955/20 hover:bg-indigo-955/5 hover:border-red-100 transition-all duration-200 relative">
                                                    <Upload className="w-4 h-4 text-slate-500 pl-1" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileChange(e, true)}
                                                        className="w-full text-xs text-slate-500 file:mr-4 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-50 file:text-slate-950 hover:file:bg-slate-100 file:cursor-pointer cursor-pointer"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={editImage}
                                                    onChange={(e) => setEditImage(e.target.value)}
                                                    placeholder="Ou saisissez un chemin d'accès (ex: /certifications/az900.png)"
                                                    className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Description</label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            placeholder="Objectifs de la certification..."
                                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all resize-none"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-6 border-t border-slate-200/80 flex justify-end gap-3 bg-slate-50 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => { setIsEditModalOpen(false); setEditingCert(null); }}
                                            disabled={modalLoading}
                                            className="px-5 py-3 bg-slate-50 hover:bg-slate-855 text-slate-450 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs uppercase tracking-wider"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={modalLoading}
                                            className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md"
                                        >
                                            {modalLoading ? (
                                                <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                            ) : (
                                                'Sauvegarder les modifications'
                                            )}
                                        </button>
                                    </div>
                                </form>

                                {/* Prévisualisation (Droite) */}
                                <div className="p-8 md:w-1/2 bg-gradient-to-tr from-slate-955 to-indigo-955/10 flex flex-col items-center justify-center border-l border-slate-200/80 relative min-h-[450px]">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-red-50 blur-3xl pointer-events-none" />

                                    <div className="w-full max-w-xs space-y-5 relative z-10">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center">Aperçu en direct (Vue utilisateur)</span>

                                        <div className="w-full max-w-xs bg-white backdrop-blur-md border border-slate-200 rounded-[28px] overflow-hidden shadow-xl hover:shadow-2xl hover:border-red-100 transition-all duration-300 group flex flex-col relative">

                                            <div className="h-40 w-full bg-slate-50 border-b border-slate-200 relative flex items-center justify-center overflow-hidden p-3">
                                                <div className="absolute w-32 h-32 rounded-full bg-red-50 blur-xl group-hover:bg-red-600/15 transition-all duration-500" />

                                                {editImage && !editImageError ? (
                                                    <img
                                                        src={editImage}
                                                        alt={editNom || "Certification"}
                                                        className="max-w-full max-h-full object-contain relative z-10 filter drop-shadow-sm group-hover:scale-[1.02] transition-all duration-500"
                                                        onError={() => setEditImageError(true)}
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                                                        <div className="w-12 h-12 rounded-2xl border border-dashed border-slate-700/80 bg-white shadow-sm flex items-center justify-center mb-2">
                                                            <Award className="w-6 h-6 text-slate-600" />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
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

                                                    <div className="space-y-0.5 text-left">
                                                        {editCodeExamen && (
                                                            <span className="text-[10px] font-bold text-red-600 block uppercase tracking-wider">
                                                                {editCodeExamen}
                                                            </span>
                                                        )}
                                                        <h3 className="font-extrabold text-base text-slate-950 line-clamp-1 group-hover:text-red-600 transition-colors">
                                                            {editNom || 'Titre de la Certification'}
                                                        </h3>
                                                    </div>

                                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed text-left">
                                                        {editDescription || 'Aucune description rédigée pour le moment.'}
                                                    </p>
                                                </div>

                                                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-50/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-50 border border-slate-200/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[80vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-red-600" />
                                    <h3 className="font-extrabold text-sm text-slate-950 uppercase tracking-wider">Gérer les Fournisseurs</h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsFournModalOpen(false);
                                        setFournError(null);
                                        setFournNom('');
                                    }}
                                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Contenu */}
                            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-left">
                                {fournError && (
                                    <div className="p-3 bg-rose-500/5 border border-rose-500/25 text-rose-400 text-xs font-bold rounded-xl">
                                        {fournError}
                                    </div>
                                )}

                                {/* Formulaire d'ajout */}
                                <form onSubmit={handleCreateFournisseur} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={fournNom}
                                        onChange={(e) => setFournNom(e.target.value)}
                                        placeholder="Nom du fournisseur (ex: Microsoft)"
                                        className="flex-1 px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                                        disabled={fournLoading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={fournLoading || !fournNom.trim()}
                                        className="px-4 py-2 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 uppercase tracking-widest cursor-pointer"
                                    >
                                        {fournLoading ? (
                                            <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                        <span>Ajouter</span>
                                    </button>
                                </form>

                                {/* Liste des fournisseurs */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Fournisseurs actuels</p>

                                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                                        {fournisseurs.length === 0 ? (
                                            <div className="text-center py-6 text-sm text-slate-500 bg-white rounded-xl border border-dashed border-slate-200/80">
                                                Aucun fournisseur enregistré.
                                            </div>
                                        ) : (
                                            fournisseurs.map((f: any) => {
                                                const count = f.certificationCount || 0;
                                                const hasCerts = count > 0;
                                                return (
                                                    <div
                                                        key={f.id}
                                                        className="flex items-center justify-between p-3 bg-white border border-slate-200/80 rounded-xl transition-colors hover:border-slate-200"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-950 truncate">{f.nom}</p>
                                                            <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                                                {count} certification{count > 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteFournisseur(f.id.toString(), f.nom)}
                                                            disabled={fournLoading || hasCerts}
                                                            title={hasCerts ? "Ce fournisseur est lié à des certifications et ne peut pas être supprimé." : "Supprimer le fournisseur"}
                                                            className={`p-2 rounded-lg transition-all duration-200 ${hasCerts
                                                                ? 'text-slate-700 cursor-not-allowed opacity-50'
                                                                : 'text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer'
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

            {/* MODAL DE GESTION DES QUESTIONS D'EXAMENS */}
            <AnimatePresence>
                {isQuestionsModalOpen && selectedCertForQuestions && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { if (!questionLoading) { setIsQuestionsModalOpen(false); resetQuestionForm(); setIsQuestionFormOpen(false); } }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-slate-50 border border-slate-200/80 w-full max-w-4xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* En-tête */}
                            <div className="p-6 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/20">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                                        <HelpCircle className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-xl font-black text-slate-950 leading-tight">Questions d'examen</h2>
                                        <p className="text-xs text-slate-500">{selectedCertForQuestions.nom}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setIsQuestionsModalOpen(false); resetQuestionForm(); setIsQuestionFormOpen(false); }}
                                    className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-950 rounded-xl transition-all cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Contenu principal */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

                                {/* Formulaire d'ajout / Édition de Question */}
                                <AnimatePresence>
                                    {isQuestionFormOpen && (
                                        <motion.form
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            onSubmit={handleSaveQuestion}
                                            className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 overflow-hidden text-left animate-fadeIn"
                                        >
                                            <h3 className="font-extrabold text-sm text-slate-950 uppercase tracking-wider">{editingQuestion ? "Modifier la Question" : "Nouvelle Question"}</h3>

                                            {questionError && (
                                                <div className="p-3 bg-rose-500/5 border border-rose-500/25 text-rose-400 text-xs font-bold rounded-xl">
                                                    {questionError}
                                                </div>
                                            )}

                                            {/* Type de question, Catégorie */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Type de Question</label>
                                                    <select
                                                        value={questionType}
                                                        onChange={(e) => {
                                                            setQuestionType(e.target.value);
                                                            setQuestionReponseCorrecte(e.target.value === 'QCM' || e.target.value === 'VRAI_FAUX' ? 'A' : '');
                                                        }}
                                                        className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold"
                                                    >
                                                        <option value="QCM">QCM (Options A, B, C, D)</option>
                                                        <option value="VRAI_FAUX">Vrai / Faux</option>
                                                        <option value="OUVERTE">Question Ouverte (Correction IA)</option>
                                                        <option value="CAS_PRATIQUE">Cas Pratique (Scénario + Code IA)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Catégorie / Module</label>
                                                    <input
                                                        type="text"
                                                        value={questionCategorie}
                                                        onChange={(e) => setQuestionCategorie(e.target.value)}
                                                        placeholder="ex: Identité & IAM"
                                                        className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Énoncé (Toujours présent) */}
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Énoncé / Scénario</label>
                                                <textarea
                                                    required
                                                    rows={2}
                                                    value={questionEnonce}
                                                    onChange={(e) => setQuestionEnonce(e.target.value)}
                                                    placeholder="Saisissez la question..."
                                                    className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all resize-none"
                                                />
                                            </div>

                                            {/* Rendu dynamique selon le Type de Question */}
                                            {questionType === 'QCM' && (
                                                <div className="space-y-4">
                                                    {/* Sélecteur de bonne réponse */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Bonne Réponse</label>
                                                        <select
                                                            value={questionReponseCorrecte}
                                                            onChange={(e) => setQuestionReponseCorrecte(e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold"
                                                        >
                                                            <option value="A">Option A</option>
                                                            <option value="B">Option B</option>
                                                            <option value="C">Option C</option>
                                                            <option value="D">Option D</option>
                                                        </select>
                                                    </div>

                                                    {/* Options de textes */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Option A</label>
                                                            <input
                                                                type="text"
                                                                required={questionType === 'QCM'}
                                                                value={optA}
                                                                onChange={(e) => setOptA(e.target.value)}
                                                                className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Option B</label>
                                                            <input
                                                                type="text"
                                                                required={questionType === 'QCM'}
                                                                value={optB}
                                                                onChange={(e) => setOptB(e.target.value)}
                                                                className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Option C</label>
                                                            <input
                                                                type="text"
                                                                required={questionType === 'QCM'}
                                                                value={optC}
                                                                onChange={(e) => setOptC(e.target.value)}
                                                                className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Option D</label>
                                                            <input
                                                                type="text"
                                                                required={questionType === 'QCM'}
                                                                value={optD}
                                                                onChange={(e) => setOptD(e.target.value)}
                                                                className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {questionType === 'VRAI_FAUX' && (
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Bonne Réponse</label>
                                                    <select
                                                        value={questionReponseCorrecte}
                                                        onChange={(e) => setQuestionReponseCorrecte(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold"
                                                    >
                                                        <option value="A">Vrai</option>
                                                        <option value="B">Faux</option>
                                                    </select>
                                                </div>
                                            )}

                                            {(questionType === 'OUVERTE' || questionType === 'CAS_PRATIQUE') && (
                                                <div className="space-y-4">
                                                    {/* Réponse Modèle */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Réponse Modèle / Attendue</label>
                                                        <textarea
                                                            required
                                                            rows={3}
                                                            value={questionReponseCorrecte}
                                                            onChange={(e) => setQuestionReponseCorrecte(e.target.value)}
                                                            placeholder="Rédigez la réponse idéale qui servira de référence à l'apprenant..."
                                                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all resize-none"
                                                        />
                                                    </div>

                                                    {/* Grille de Notation IA */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Critères de correction (Pour l'IA)</label>
                                                        <textarea
                                                            required
                                                            rows={3}
                                                            value={questionGrilleNotation}
                                                            onChange={(e) => setQuestionGrilleNotation(e.target.value)}
                                                            placeholder="Décrivez les critères précis d'évaluation (ex: Attribuer 2 pts si le mot-clé 'A' est présent, etc.)..."
                                                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Explication commune */}
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Explication de correction (optionnel)</label>
                                                <textarea
                                                    rows={2}
                                                    value={questionExplication}
                                                    onChange={(e) => setQuestionExplication(e.target.value)}
                                                    placeholder="Expliquez en détail les notions de cours liées..."
                                                    className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-sm outline-none transition-all resize-none"
                                                />
                                            </div>

                                            <div className="flex justify-end gap-2 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsQuestionFormOpen(false); resetQuestionForm(); }}
                                                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 rounded-xl cursor-pointer"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={questionLoading}
                                                    className="px-4 py-2 bg-white text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl shadow-md cursor-pointer"
                                                >
                                                    {editingQuestion ? "Enregistrer les modifications" : "Enregistrer la question"}
                                                </button>
                                            </div>
                                        </motion.form>
                                    )}
                                </AnimatePresence>

                                {/* Section header de la liste */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-950 uppercase tracking-widest">
                                        {questionsList.length} Question{questionsList.length > 1 ? 's' : ''} enregistrée{questionsList.length > 1 ? 's' : ''}
                                    </span>
                                    {!isQuestionFormOpen && (
                                        <button
                                            onClick={() => setIsQuestionFormOpen(true)}
                                            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md cursor-pointer transition-all"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Ajouter une question</span>
                                        </button>
                                    )}
                                </div>

                                {/* Liste des questions */}
                                <div className="space-y-4">
                                    {loadingQuestions ? (
                                        <div className="text-center py-10 space-y-2">
                                            <span className="w-8 h-8 border-4 border-red-100 border-t-red-600 rounded-full animate-spin inline-block" />
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Chargement des questions...</p>
                                        </div>
                                    ) : questionsList.length === 0 ? (
                                        <div className="text-center py-12 text-slate-500 bg-white border border-dashed border-slate-200/80 rounded-2xl">
                                            Aucune question n'est configurée pour cet examen blanc.
                                        </div>
                                    ) : (
                                        questionsList.map((q, idx) => (
                                            <div
                                                key={q.id}
                                                className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 text-left space-y-4 relative group animate-fadeIn"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question {idx + 1}</span>
                                                        <span className="text-[9px] font-black text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                            {q.type || 'QCM'}
                                                        </span>
                                                        {q.categorie && (
                                                            <span className="text-[9px] font-black text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                {q.categorie}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleEditQuestion(q)}
                                                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-950 rounded-lg transition-colors cursor-pointer"
                                                            title="Modifier la question"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteQuestion(q.id)}
                                                            className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                                                            title="Supprimer la question"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="text-sm font-bold text-slate-950 leading-relaxed">{q.enonce}</p>

                                                {/* Rendu des choix (Seulement pour QCM et VRAI_FAUX) */}
                                                {(q.type === 'QCM' || q.type === 'VRAI_FAUX') && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                        {(q.options || []).map((opt: any) => {
                                                            const isCorrect = q.reponseCorrecte === opt.lettre;
                                                            return (
                                                                <div
                                                                    key={opt.id}
                                                                    className={`p-3 border rounded-xl flex items-center gap-3 text-xs font-semibold ${isCorrect
                                                                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-350'
                                                                        : 'border-slate-200/80 bg-slate-50/20 text-slate-600'
                                                                        }`}
                                                                >
                                                                    <span className={`w-5.5 h-5.5 rounded border text-[10px] font-bold flex items-center justify-center shrink-0 ${isCorrect
                                                                        ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400'
                                                                        : 'border-slate-200 bg-slate-50 text-slate-500'
                                                                        }`}>
                                                                        {opt.lettre}
                                                                    </span>
                                                                    <span className="truncate leading-snug">{opt.texte}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Rendu de la réponse modèle et du barème (Seulement pour OUVERTE et CAS_PRATIQUE) */}
                                                {(q.type === 'OUVERTE' || q.type === 'CAS_PRATIQUE') && (
                                                    <div className="space-y-3">
                                                        <div className="p-4 bg-indigo-950/10 border border-indigo-900/20 rounded-2xl text-xs leading-relaxed text-slate-700">
                                                            <p className="font-bold text-red-600 uppercase tracking-wider text-[9px] mb-1">Réponse modèle attendue :</p>
                                                            <p className="font-semibold whitespace-pre-wrap">{q.reponseCorrecte}</p>
                                                        </div>
                                                        {q.grilleNotation && (
                                                            <div className="p-4 bg-emerald-950/10 border border-emerald-900/20 rounded-2xl text-xs leading-relaxed text-slate-700">
                                                                <p className="font-bold text-emerald-400 uppercase tracking-wider text-[9px] mb-1">Barème & Critères IA :</p>
                                                                <p className="font-semibold whitespace-pre-wrap">{q.grilleNotation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {q.explication && (
                                                    <div className="p-3.5 bg-slate-50/40 border border-slate-200/80 rounded-xl text-xs leading-relaxed text-slate-600">
                                                        <p className="font-bold text-red-600 uppercase tracking-wider text-[9px] mb-0.5">Correction :</p>
                                                        <p className="font-medium">{q.explication}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}