'use client';

import React, { useState, useEffect } from 'react';

import { Search, Plus } from '@/components/icons';
import { useCertifications } from '@/hooks/useCertifications';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { CertificationsGrid } from '@/components/admin/certifications/CertificationsGrid';
import { CertificationFormModal } from '@/components/admin/certifications/CertificationFormModal';
import { QuestionsManagerModal } from '@/components/admin/certifications/QuestionsManagerModal';
import { FournisseurModal } from '@/components/admin/certifications/FournisseurModal';

export default function AdminCertificationsPage() {
  const {
    certs, fournisseurs, loading, error, fetchInitialData,
    createCert, updateCert, deleteCert,
    createFournisseur, deleteFournisseur,
    fetchQuestions, saveQuestion, deleteQuestion
  } = useCertifications();

  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('TOUS');
  const [selectedProvider, setSelectedProvider] = useState('TOUS');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<any>(null);

  const [isFournModalOpen, setIsFournModalOpen] = useState(false);

  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [selectedCertForQuestions, setSelectedCertForQuestions] = useState<any>(null);
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const filteredCerts = React.useMemo(() => {
    return certs.filter(c => {
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
  }, [certs, searchTerm, selectedLevel, selectedProvider]);

  // Handlers for Certs
  const handleCreateCert = async (payload: any) => {
    setModalLoading(true);
    setModalError(null);
    try {
      await createCert(payload);
      showToast(`La certification "${payload.nom}" a été créée avec succès.`, "success");
      setIsModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Erreur lors de la création');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateCert = async (payload: any) => {
    if (!editingCert) return;
    setModalLoading(true);
    setModalError(null);
    try {
      await updateCert(editingCert.id, payload);
      showToast(`La certification "${payload.nom}" a été modifiée avec succès.`, "success");
      setIsEditModalOpen(false);
      setEditingCert(null);
    } catch (err: any) {
      setModalError(err.message || 'Erreur lors de la modification');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteCert = async (id: string, name: string) => {
    const ok = await confirm({
      title: "Supprimer la certification ?",
      message: `Êtes-vous sûr de vouloir supprimer la certification "${name}" ? Cette action est irréversible et supprimera toutes ses ressources et questions associées.`,
      confirmText: "Supprimer",
      cancelText: "Annuler",
      type: "danger"
    });
    if (!ok) return;
    try {
      await deleteCert(id);
      showToast("La certification a été supprimée avec succès.", "success");
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression', "error");
    }
  };

  const handleOpenEditModal = (cert: any) => {
    setEditingCert(cert);
    setIsEditModalOpen(true);
  };

  // Handlers for Questions
  const handleOpenQuestionsModal = async (cert: any) => {
    setSelectedCertForQuestions(cert);
    setIsQuestionsModalOpen(true);
    setLoadingQuestions(true);
    try {
      const data = await fetchQuestions(cert.id);
      setQuestionsList(data || []);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du chargement des questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSaveQuestion = async (payload: any, questionId?: string) => {
    await saveQuestion(selectedCertForQuestions.id, payload, questionId);
    const data = await fetchQuestions(selectedCertForQuestions.id);
    setQuestionsList(data || []);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestion(questionId);
    const data = await fetchQuestions(selectedCertForQuestions.id);
    setQuestionsList(data || []);
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Container Principal */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm relative overflow-hidden group">
          {/* Effects */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">

              <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">Catalogue de Certifications</h1>
              <p className="text-slate-500 font-medium max-w-xl text-sm leading-relaxed">
                Gérez le catalogue officiel des certifications proposées sur la plateforme. Ajoutez de nouvelles offres, configurez les examens blancs et suivez les statistiques globales.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer shrink-0 uppercase tracking-wider text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle certification</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200/80 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
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

              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-xs font-bold outline-none transition-all cursor-pointer"
              >
                <option value="TOUS">Tous les constructeurs</option>
                {fournisseurs.map((f: any) => (
                  <option key={f.id} value={f.slug}>{f.nom}</option>
                ))}
              </select>

              <div className="text-xs text-slate-500 font-bold ml-auto shrink-0">
                {filteredCerts.length} certification{filteredCerts.length > 1 ? 's' : ''} trouvée{filteredCerts.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <CertificationsGrid
            filteredCerts={filteredCerts}
            loading={loading}
            error={error}
            onRetry={fetchInitialData}
            onEdit={handleOpenEditModal}
            onManageQuestions={handleOpenQuestionsModal}
            onDelete={handleDeleteCert}
          />
        </div>
      </div>

      <CertificationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCert}
        fournisseurs={fournisseurs}
        modalLoading={modalLoading}
        modalError={modalError}
        onManageFournisseurs={() => setIsFournModalOpen(true)}
      />

      <CertificationFormModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingCert(null); }}
        onSubmit={handleUpdateCert}
        initialData={editingCert}
        fournisseurs={fournisseurs}
        modalLoading={modalLoading}
        modalError={modalError}
        onManageFournisseurs={() => setIsFournModalOpen(true)}
      />

      <QuestionsManagerModal
        isOpen={isQuestionsModalOpen}
        onClose={() => setIsQuestionsModalOpen(false)}
        certification={selectedCertForQuestions}
        questionsList={questionsList}
        loadingQuestions={loadingQuestions}
        onSaveQuestion={handleSaveQuestion}
        onDeleteQuestion={handleDeleteQuestion}
      />

      <FournisseurModal
        isOpen={isFournModalOpen}
        onClose={() => setIsFournModalOpen(false)}
        fournisseurs={fournisseurs}
        onCreate={createFournisseur}
        onDelete={deleteFournisseur}
      />
    </div>
  );
}