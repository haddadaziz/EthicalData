"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { Award, BookOpen, Clock, FileText, Search, Play, ArrowRight, ArrowLeft, Users, CheckCircle2, Target, Check, X, ChevronDown } from '@/components/icons';
import { getProviderLogo } from '@/lib/certification-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../context/ToastContext';
import { useMutationGuard } from '../../../hooks/useMutationGuard';

function getLevelBadgeStyle(niv: string) {
  switch (niv) {
    case 'AVANCE': return 'bg-blue-950/20 text-cyan-400 border border-blue-900/40';
    case 'INTERMEDIAIRE': return 'bg-amber-950/20 text-amber-500 border border-amber-900/40';
    case 'DEBUTANT':
    default: return 'bg-emerald-950/20 text-emerald-500 border border-emerald-900/40';
  }
}

interface Fournisseur {
  id: string;
  nom: string;
  slug: string;
  image?: string | null;
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
  fournisseur: Fournisseur;
  modules: any[];
  ressources: any[];
  objectifs?: string[];
  prerequis?: string[];
}

export default function LearnerCertificationsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { guard } = useMutationGuard(1000);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [targetCertIds, setTargetCertIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour les filtres
  const [selectedLevel, setSelectedLevel] = useState<'TOUS' | 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE'>('TOUS');
  const [selectedProvider, setSelectedProvider] = useState<string>('TOUS');
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
  const [onlyTargeted, setOnlyTargeted] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedCertModal, setSelectedCertModal] = useState<Certification | null>(null);

  useEffect(() => {
    const loadCatalogData = async () => {
      try {
        const [certsData, providersData, profileData] = await Promise.all([
          apiFetch('/certifications'),
          apiFetch('/certifications/fournisseurs'),
          apiFetch('/users/me/profile').catch(() => null),
        ]);
        const listCerts = Array.isArray(certsData) ? certsData : (certsData?.data || []);
        const listProviders = Array.isArray(providersData) ? providersData : (providersData?.data || []);
        setCerts(listCerts);
        setFournisseurs(listProviders);
        if (profileData) {
          setUserProfile(profileData);
          const tIds = (profileData.preferences?.targetCertifications || []).map((id: any) => id.toString());
          setTargetCertIds(tIds);
        }
      } catch (err) {
        console.error("Erreur chargement catalogue certifications:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCatalogData();
  }, []);

  const toggleTargetCertification = async (certId: string) => {
    await guard(async () => {
      const isTargeted = targetCertIds.includes(certId);
      const newTargetIds = isTargeted
        ? targetCertIds.filter((id) => id !== certId)
        : [...targetCertIds, certId];

      setTargetCertIds(newTargetIds);

      try {
        const currentPrefs = userProfile?.preferences || {};
        const updatedPrefs = {
          ...currentPrefs,
          targetCertifications: newTargetIds,
        };
        await apiFetch('/users/me/profile', {
          method: 'PATCH',
          body: { preferences: updatedPrefs },
        });
        setUserProfile((prev: any) => ({
          ...prev,
          preferences: updatedPrefs,
        }));
        showToast(isTargeted ? "Certificat retiré de vos objectifs avec succès" : "Certificat ajouté à vos objectifs avec succès");
      } catch (e: any) {
        if (e.message?.includes('429') || e.message?.includes('Too Many Requests')) {
          showToast("Trop de requêtes, veuillez patienter un instant", "info");
        } else {
          showToast("Une erreur est survenue", "error");
        }
        setTargetCertIds(targetCertIds);
      }
    });
  };

  // Remettre à la page 1 si les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, selectedProvider, onlyTargeted]);

  // Filtrage
  const filteredCerts = certs.filter((cert) => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch = !search || cert.nom.toLowerCase().includes(search) || 
                          (cert.codeExamen && cert.codeExamen.toLowerCase().includes(search));
    const matchesLevel = selectedLevel === 'TOUS' || cert.niveau === selectedLevel;
    const matchesProvider = selectedProvider === 'TOUS' || cert.fournisseur.id === selectedProvider;
    const matchesTargeted = !onlyTargeted || targetCertIds.includes(cert.id.toString());

    return matchesSearch && matchesLevel && matchesProvider && matchesTargeted;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCerts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCerts = filteredCerts.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-550 gap-4">
        <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement des certifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white text-left animate-fadeIn">

      {/* Barre de Recherche et Filtres */}
      <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Rechercher ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-xl text-white placeholder-slate-500 transition-all text-sm outline-none font-semibold"
            />
          </div>
          <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => setOnlyTargeted(!onlyTargeted)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
                onlyTargeted 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.15)]' 
                  : 'bg-[#020617] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Objectifs visés ({targetCertIds.length})</span>
            </button>
            <div className="text-xs text-slate-500 font-bold shrink-0">
              {filteredCerts.length} disponible{filteredCerts.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Niveau */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 shrink-0 w-[92px] text-right">Niveau :</span>
              <div className="relative w-full sm:w-52">
                <button
                  type="button"
                  onClick={() => setLevelDropdownOpen(!levelDropdownOpen)}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-xl text-white text-xs font-bold outline-none cursor-pointer hover:bg-slate-900/50 transition-all w-full"
                >
                  <span className="flex-1 text-left truncate">
                    {selectedLevel === 'TOUS' ? 'Tous les niveaux' : selectedLevel === 'DEBUTANT' ? 'Débutant' : selectedLevel === 'INTERMEDIAIRE' ? 'Intermédiaire' : 'Avancé'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${levelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {levelDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setLevelDropdownOpen(false)} />
                    <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-[#080d1a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                      {[
                        { val: 'TOUS', label: 'Tous les niveaux' },
                        { val: 'DEBUTANT', label: 'Débutant' },
                        { val: 'INTERMEDIAIRE', label: 'Intermédiaire' },
                        { val: 'AVANCE', label: 'Avancé' }
                      ].map((niv) => (
                        <button
                          key={niv.val}
                          onClick={() => { setSelectedLevel(niv.val as any); setLevelDropdownOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-[#020617] cursor-pointer ${
                            selectedLevel === niv.val ? 'bg-[#020617] text-white' : 'text-slate-400'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            niv.val === 'TOUS' ? 'bg-slate-800' :
                            niv.val === 'DEBUTANT' ? 'bg-emerald-950/20' :
                            niv.val === 'INTERMEDIAIRE' ? 'bg-amber-950/20' : 'bg-blue-950/20'
                          }`}>
                            <span className={`text-[9px] font-black uppercase ${
                              niv.val === 'TOUS' ? 'text-slate-400' :
                              niv.val === 'DEBUTANT' ? 'text-emerald-500' :
                              niv.val === 'INTERMEDIAIRE' ? 'text-amber-500' : 'text-cyan-400'
                            }`}>
                              {niv.val === 'TOUS' ? 'T' : niv.val === 'DEBUTANT' ? 'D' : niv.val === 'INTERMEDIAIRE' ? 'I' : 'A'}
                            </span>
                          </div>
                          <span className="truncate">{niv.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Fournisseur */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 shrink-0 w-[92px] text-right">Fournisseur :</span>
              <div className="relative w-full sm:w-52">
                <button
                  type="button"
                  onClick={() => setProviderDropdownOpen(!providerDropdownOpen)}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-xl text-white text-xs font-bold outline-none cursor-pointer hover:bg-slate-900/50 transition-all w-full"
                >
                  {selectedProvider !== 'TOUS' && getProviderLogo(fournisseurs.find((f: any) => f.id === selectedProvider)?.slug || '') && (
                    <img src={getProviderLogo(fournisseurs.find((f: any) => f.id === selectedProvider)?.slug || '')} alt="" className="w-5 h-5 object-contain rounded shrink-0" />
                  )}
                  <span className="flex-1 text-left truncate">
                    {selectedProvider === 'TOUS' ? 'Tous les constructeurs' : fournisseurs.find((f: any) => f.id === selectedProvider)?.nom || 'Sélectionner'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${providerDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {providerDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProviderDropdownOpen(false)} />
                    <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-[#080d1a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                      <button
                        onClick={() => { setSelectedProvider('TOUS'); setProviderDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-[#020617] cursor-pointer ${
                          selectedProvider === 'TOUS' ? 'bg-[#020617] text-white' : 'text-slate-400'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                          <Award className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="truncate">Tous les constructeurs</span>
                      </button>
                      <div className="border-t border-slate-800" />
                      <div className="max-h-64 overflow-y-auto">
                        {fournisseurs.map((f: any) => {
                          const logo = getProviderLogo(f.slug || f.nom || '');
                          return (
                            <button
                              key={f.id}
                              onClick={() => { setSelectedProvider(f.id); setProviderDropdownOpen(false); }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-[#020617] cursor-pointer ${
                                selectedProvider === f.id ? 'bg-[#020617] text-white' : 'text-slate-400'
                              }`}
                            >
                              {logo ? (
                                <img src={logo} alt="" className="w-7 h-7 object-contain rounded shrink-0" />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
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
            </div>
          </div>
        </div>
      </div>

      {/* Grille de Certifications */}
      {filteredCerts.length === 0 ? (
        <div className="p-12 text-center bg-[#080d1a] border border-slate-800 rounded-3xl text-slate-400 font-semibold shadow-sm">
          Aucune certification ne correspond aux critères sélectionnés.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentCerts.map((cert) => (
              <motion.div key={cert.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
                className="bg-[#080d1a] border border-blue-900/40 rounded-2xl p-4 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/30 hover:border-blue-600 text-left"
              >
                {/* Visual Box (Landing Page Style) */}
                <div onClick={() => setSelectedCertModal(cert)} className="relative w-full aspect-[4/3] sm:aspect-auto sm:h-[240px] rounded-xl overflow-hidden shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-blue-900/20 group-hover:shadow-2xl bg-[#020617] border border-slate-800 cursor-pointer">
                  {/* Background Template */}
                  <img src="/images/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0 opacity-50 mix-blend-screen" />

                  {/* Examen code overlay */}
                  {cert.codeExamen && (
                    <div className="absolute top-3 left-3 z-30">
                      <div className="bg-[#020617] text-white font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-md border border-slate-800 shadow-sm flex items-center group-hover:bg-blue-600 group-hover:border-cyan-500 transition-colors">
                        {cert.codeExamen}
                      </div>
                    </div>
                  )}

                  {/* Floating Badge Logo */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="w-32 h-32 lg:w-24 lg:h-24 flex items-center justify-center transition-transform duration-500 -translate-y-3 group-hover:-translate-y-5">
                      {cert.image ? (
                        <img src={cert.image} alt={cert.nom} className="max-w-full max-h-full object-contain filter drop-shadow-xl" />
                      ) : (
                        <div className="w-16 h-16 bg-[#080d1a]/95 rounded-full flex items-center justify-center border border-slate-800 shadow-sm">
                          <Award className="w-8 h-8 text-slate-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Title & Info & Actions */}
                <div className="mt-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 onClick={() => setSelectedCertModal(cert)} className="text-sm font-black text-white leading-snug line-clamp-2 cursor-pointer hover:text-cyan-400 transition-colors">
                      {cert.nom}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {cert.fournisseur?.nom || 'Officiel'} • {cert.niveau} • {cert.dureeIndicative || '15h'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center gap-2 mt-4">
                    <button
                      onClick={() => setSelectedCertModal(cert)}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] active:scale-[0.98]"
                    >
                      <span>Consulter</span>
                    </button>

                    <button
                      onClick={() => toggleTargetCertification(cert.id.toString())}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                        targetCertIds.includes(cert.id.toString())
                          ? 'bg-emerald-950/20 text-emerald-500 border-emerald-900/50 hover:bg-emerald-950/40'
                          : 'bg-[#020617] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                      title={targetCertIds.includes(cert.id.toString()) ? "Retirer des objectifs" : "Ajouter aux objectifs"}
                    >
                      {targetCertIds.includes(cert.id.toString()) ? <Check className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
                      <span>{targetCertIds.includes(cert.id.toString()) ? 'Visé' : 'Viser'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Modal détail */}
          <AnimatePresence>
            {selectedCertModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-[#020617]/90"
                onClick={(e) => { if (e.target === e.currentTarget) setSelectedCertModal(null); }}>
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-[#080d1a] border border-blue-900/50 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-[0_0_40px_rgba(30,58,138,0.15)] overflow-hidden flex flex-col">
                  <CertDetailModal cert={selectedCertModal} onClose={() => setSelectedCertModal(null)} onPractice={(c: Certification) => { setSelectedCertModal(null); router.push(`/dashboard/practice?cert=${c.slug}`); }} isTargeted={targetCertIds.includes(selectedCertModal.id.toString())} onToggleTarget={() => toggleTargetCertification(selectedCertModal.id.toString())} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 p-6 bg-[#080d1a] border border-slate-800 rounded-3xl shadow-sm">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-[#020617] shadow-sm"
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
                      className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white'
                          : 'bg-transparent text-slate-400 hover:bg-[#020617] hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-[#020617] shadow-sm"
              >
                <span>Suivant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ───── MODAL DÉTAIL CERTIFICATION ───── */
function CertDetailModal({ cert, onClose, onPractice, isTargeted, onToggleTarget }: { cert: Certification; onClose: () => void; onPractice: (cert: Certification) => void; isTargeted?: boolean; onToggleTarget?: () => void }) {
  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      {/* HEADER FIXE */}
      <div className="shrink-0 p-6 md:px-8 md:py-6 border-b border-slate-800 bg-[#080d1a] flex items-start justify-between gap-4 z-10 shadow-sm">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-black border ${getLevelBadgeStyle(cert.niveau)}`}>{cert.niveau}</span>
            {cert.fournisseur && (
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cert.fournisseur.nom}</span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white leading-tight">{cert.nom}</h2>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-xl bg-slate-800/50 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* CORPS DE LA MODALE */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden bg-[#050b14]">
        
        {/* PANNEAU IMAGE (Fixe à gauche sur desktop) */}
        <div className="w-full md:w-[340px] shrink-0 p-6 flex flex-col items-center justify-start bg-gradient-to-b from-[#050b14] to-[#020617] border-b md:border-b-0 md:border-r border-slate-800 overflow-y-auto md:overflow-hidden">
          <div className="relative w-full max-w-[280px] h-[340px] rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(30,58,138,0.1)] border border-blue-900/50 bg-[#080d1a] flex items-center justify-center p-6">
            <img src="/images/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0 opacity-50 mix-blend-screen" />
            <div className="relative z-20 flex items-center justify-center w-full h-full">
              {cert.image ? (
                <img src={cert.image} alt={cert.nom} className="max-w-full max-h-full object-contain filter drop-shadow-xl" />
              ) : (
                <div className="w-16 h-16 bg-[#080d1a]/95 rounded-full flex items-center justify-center border border-slate-800 shadow-sm">
                  <Award className="w-8 h-8 text-slate-500" />
                </div>
              )}
            </div>
          </div>

          <div className="w-full max-w-[280px] mt-6 flex flex-col gap-3">
            {cert.codeExamen && (
              <div className="bg-[#020617] text-cyan-400 font-bold uppercase text-[10px] tracking-widest px-3 py-2 rounded-xl border border-cyan-900/30 shadow-sm text-center">
                Code : {cert.codeExamen}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#080d1a] border border-blue-900/50 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Niveau Requis</span>
                <p className="text-xs font-bold text-white mt-1">{cert.niveau}</p>
              </div>
              <div className="p-3 bg-[#080d1a] border border-blue-900/50 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Durée Estimée</span>
                <p className="text-xs font-bold text-white mt-1">{cert.dureeIndicative || '15h'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* PANNEAU DÉTAILS (Scrollable) */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-6 md:p-8 space-y-6 text-left">
            
            {/* Description */}
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              {cert.description || "Préparez-vous efficacement à l'examen officiel grâce à nos questionnaires actualisés."}
            </p>

            {cert.objectifs && cert.objectifs.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" /> Objectifs de l'examen
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cert.objectifs.map((obj, i) => (
                    <li key={i} className="text-xs text-slate-300 bg-[#020617] p-3 rounded-lg border border-slate-800/50 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cert.prerequis && cert.prerequis.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" /> Prérequis recommandés
                </h4>
                <ul className="space-y-2">
                  {cert.prerequis.map((pr, i) => (
                    <li key={i} className="text-xs text-slate-400 font-medium flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-amber-500/50 mt-1.5 shrink-0" />
                      <span>{pr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="pt-4 pb-2">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => onPractice(cert)}
                className="flex-1 py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-[0.98]">
                <Play className="w-4 h-4 fill-white text-white" />
                S'entraîner
              </button>
              {onToggleTarget && (
                <button onClick={() => onToggleTarget()}
                  className={`flex-1 py-3.5 px-4 border font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] ${
                    isTargeted
                      ? 'border-emerald-900 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/50'
                      : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}>
                  {isTargeted ? <Check className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                  <span>{isTargeted ? 'Objectif fixé' : 'Viser cet examen'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
