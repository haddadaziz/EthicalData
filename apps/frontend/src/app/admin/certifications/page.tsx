'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import { Search, Plus, ChevronDown, Award } from '@/components/icons';
import { getProviderLogo } from '@/lib/certification-utils';
import { useCertifications } from '@/hooks/useCertifications';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { CertificationsGrid } from '@/components/admin/certifications/CertificationsGrid';

const CertificationFormModal = dynamic(
  () => import('@/components/admin/certifications/CertificationFormModal').then(mod => mod.CertificationFormModal),
  { ssr: false }
);
const QuestionsManagerModal = dynamic(
  () => import('@/components/admin/certifications/QuestionsManagerModal').then(mod => mod.QuestionsManagerModal),
  { ssr: false }
);
const FournisseurModal = dynamic(
  () => import('@/components/admin/certifications/FournisseurModal').then(mod => mod.FournisseurModal),
  { ssr: false }
);

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
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);

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

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProviderDropdownOpen(!providerDropdownOpen)}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-950 text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all min-w-[200px]"
                >
                  {selectedProvider !== 'TOUS' && getProviderLogo(selectedProvider) && (
                    <img src={getProviderLogo(selectedProvider)} alt="" className="w-5 h-5 object-contain rounded shrink-0" />
                  )}
                  <span className="flex-1 text-left truncate">
                    {selectedProvider === 'TOUS' ? 'Tous les constructeurs' : fournisseurs.find((f: any) => f.slug === selectedProvider)?.nom || 'Sélectionner'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${providerDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {providerDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProviderDropdownOpen(false)} />
                    <div className="absolute top-full left-0 mt-1.5 z-50 w-72 bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden">
                      <button
                        onClick={() => { setSelectedProvider('TOUS'); setProviderDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                          selectedProvider === 'TOUS' ? 'bg-slate-100 text-slate-950' : 'text-slate-600'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Award className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="truncate">Tous les constructeurs</span>
                      </button>
                      <div className="border-t border-slate-100" />
                      <div className="max-h-64 overflow-y-auto">
                        {fournisseurs.map((f: any) => {
                          const logo = getProviderLogo(f.slug || f.nom || '');
                          return (
                            <button
                              key={f.id}
                              onClick={() => { setSelectedProvider(f.slug); setProviderDropdownOpen(false); }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                                selectedProvider === f.slug ? 'bg-slate-100 text-slate-950' : 'text-slate-600'
                              }`}
                            >
                              {logo ? (
                                <img src={logo} alt="" className="w-7 h-7 object-contain rounded shrink-0" />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                  <Award className="w-4 h-4 text-slate-500" />
                                </div>
                              )}
                              <span className="block truncate font-bold">{f.nom}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto shrink-0 md:ml-auto">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvelle certification</span>
                </button>
                <span className="text-xs text-slate-500 font-bold">
                  {filteredCerts.length} certification{filteredCerts.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <CertificationsGrid
            filteredCerts={filteredCerts}
            loading={loading}
            error={error}
            onRetry={fetchInitialData}
            onEdit={handleOpenEditModal}
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