"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { Award, BookOpen, Clock, FileText, Search, Play, ArrowRight, ArrowLeft, Users, CheckCircle2, Target, Check, X } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../context/ToastContext';
import { useMutationGuard } from '../../../hooks/useMutationGuard';

function getLevelBadgeStyle(niv: string) {
  switch (niv) {
    case 'AVANCE': return 'bg-rose-50 text-rose-700 border border-rose-150';
    case 'INTERMEDIAIRE': return 'bg-amber-50 text-amber-700 border border-amber-150';
    case 'DEBUTANT':
    default: return 'bg-emerald-50 text-emerald-700 border border-emerald-150';
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
    <div className="space-y-8 text-slate-800 text-left animate-fadeIn">

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom ou code d'examen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl text-slate-900 placeholder-slate-400 transition-all text-sm outline-none font-semibold"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOnlyTargeted(!onlyTargeted)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
                onlyTargeted 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
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

        {/* Filtres par Niveau et Fournisseur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-4">
          <div className="space-y-2.5 text-left">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Par Niveau</span>
            <div className="flex flex-wrap gap-2">
              {[
                { val: 'TOUS', label: 'Tous' },
                { val: 'DEBUTANT', label: 'Débutant' },
                { val: 'INTERMEDIAIRE', label: 'Intermédiaire' },
                { val: 'AVANCE', label: 'Avancé' }
              ].map((niv) => (
                <button
                  key={niv.val}
                  onClick={() => setSelectedLevel(niv.val as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedLevel === niv.val
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {niv.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 text-left">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Par Partenaire / Fournisseur</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedProvider('TOUS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedProvider === 'TOUS'
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-slate-650'
                }`}
              >
                Tous
              </button>
              {fournisseurs.map((prov) => (
                <button
                  key={prov.id}
                  onClick={() => setSelectedProvider(prov.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedProvider === prov.id
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-slate-650'
                  }`}
                >
                  {prov.nom}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grille de Certifications */}
      {filteredCerts.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl text-slate-550 font-semibold shadow-sm">
          Aucune certification ne correspond aux critères sélectionnés.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentCerts.map((cert) => (
              <motion.div key={cert.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between group transition-all duration-300 hover:shadow-lg hover:border-slate-300 text-left"
              >
                {/* Visual Box (Landing Page Style) */}
                <div className="relative w-full h-[240px] rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 bg-white border border-slate-100">
                  {/* Background Template */}
                  <img src="/logos/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0" />

                  {/* Examen code overlay */}
                  {cert.codeExamen && (
                    <div className="absolute top-3 left-3 z-30">
                      <div className="bg-slate-900/80 text-white font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-md border border-slate-700/50 shadow-sm flex items-center gap-1.5 group-hover:bg-red-600 group-hover:border-red-500 transition-colors">
                        <span className="w-1 h-1 rounded-full bg-red-500 group-hover:bg-white animate-pulse transition-colors"></span>
                        {cert.codeExamen}
                      </div>
                    </div>
                  )}

                  {/* Floating Badge Logo */}
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 w-24 flex justify-center">
                    {cert.image ? (
                      <img src={cert.image} alt={cert.nom} className="w-full h-auto object-contain filter drop-shadow-xl" />
                    ) : (
                      <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                        <Award className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Title & Info & Actions */}
                <div className="mt-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-950 leading-snug line-clamp-2">
                      {cert.nom}
                    </h3>
                    <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                      {cert.fournisseur?.nom || 'Officiel'} • {cert.niveau} • {cert.dureeIndicative || '15h'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2 mt-4">
                    <button
                      onClick={() => setSelectedCertModal(cert)}
                      className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                    >
                      <span>Consulter</span>
                    </button>

                    <button
                      onClick={() => toggleTargetCertification(cert.id.toString())}
                      className={`p-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        targetCertIds.includes(cert.id.toString())
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                      title={targetCertIds.includes(cert.id.toString()) ? "Retirer des objectifs" : "Ajouter aux objectifs"}
                    >
                      {targetCertIds.includes(cert.id.toString()) ? <Check className="w-4 h-4" /> : <Target className="w-4 h-4" />}
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
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 overflow-y-auto"
                onClick={(e) => { if (e.target === e.currentTarget) setSelectedCertModal(null); }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden">
                  <CertDetailModal cert={selectedCertModal} onClose={() => setSelectedCertModal(null)} onPractice={(c: Certification) => { setSelectedCertModal(null); router.push(`/dashboard/practice?cert=${c.slug}`); }} isTargeted={targetCertIds.includes(selectedCertModal.id.toString())} onToggleTarget={() => toggleTargetCertification(selectedCertModal.id.toString())} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 p-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-650 hover:text-slate-950 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-white shadow-sm"
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
                          ? 'bg-slate-950 text-white shadow-md'
                          : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950'
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
                className="px-4 py-2 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-650 hover:text-slate-950 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-white shadow-sm"
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
    <div className="flex flex-col md:flex-row-reverse bg-white overflow-hidden rounded-2xl">
      {/* Côté Droit (Desktop) / Haut (Mobile) : Le cadre de la certification */}
      <div className="w-full md:w-[340px] p-5 flex flex-col items-center justify-center bg-slate-50 border-b md:border-b-0 md:border-l border-slate-200/80 shrink-0">
        <div className="relative w-full max-w-[280px] h-[340px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
          {/* Background Template */}
          <img src="/logos/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0" />

          {/* Examen code overlay */}
          {cert.codeExamen && (
            <div className="absolute top-4 left-4 z-30">
              <div className="bg-slate-900/80 text-white font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-md border border-slate-700/50 shadow-sm flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></span>
                {cert.codeExamen}
              </div>
            </div>
          )}

          {/* Floating Badge Logo */}
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 w-28 flex justify-center">
            {cert.image ? (
              <img src={cert.image} alt={cert.nom} className="w-full h-auto object-contain filter drop-shadow-xl" />
            ) : (
              <div className="w-18 h-18 bg-white/95 rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                <Award className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Côté Gauche (Desktop) / Bas (Mobile) : Les Détails de la Certification */}
      <div className="flex-1 flex flex-col justify-between p-6 md:p-8 space-y-6 text-left">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {cert.codeExamen && (
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">{cert.codeExamen}</span>
              )}
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-black border ${getLevelBadgeStyle(cert.niveau)}`}>{cert.niveau}</span>
            </div>
            <h2 className="text-xl font-black text-slate-950 leading-snug">{cert.nom}</h2>
            <p className="text-xs text-slate-450 font-bold uppercase tracking-wider">{cert.fournisseur?.nom || 'Officiel'}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-650 transition-all cursor-pointer shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description et métriques */}
        <div className="space-y-4">
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            {cert.description || "Préparez-vous efficacement à l'examen officiel grâce à nos questionnaires actualisés."}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider">Niveau</span>
              <p className="text-xs font-extrabold text-slate-900 mt-0.5">{cert.niveau}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider">Durée</span>
              <p className="text-xs font-extrabold text-slate-900 mt-0.5">{cert.dureeIndicative || '15h'}</p>
            </div>
          </div>

          {cert.objectifs && cert.objectifs.length > 0 && (
            <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-xl space-y-2">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Objectifs
              </span>
              <ul className="space-y-1.5">
                {cert.objectifs.map((obj, i) => (
                  <li key={i} className="text-xs text-slate-750 font-semibold flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cert.prerequis && cert.prerequis.length > 0 && (
            <div className="p-4 bg-amber-50/50 border border-amber-100/50 rounded-xl space-y-2">
              <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Prérequis
              </span>
              <ul className="space-y-1.5">
                {cert.prerequis.map((pr, i) => (
                  <li key={i} className="text-xs text-slate-750 font-semibold flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{pr}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button onClick={() => onPractice(cert)}
            className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]">
            <Play className="w-3.5 h-3.5 fill-white text-white" />
            Commencer la formation
          </button>
          {onToggleTarget && (
            <button onClick={() => onToggleTarget()}
              className={`px-4 py-3 border font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                isTargeted
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300'
              }`}>
              {isTargeted ? <Check className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
              <span>{isTargeted ? 'Dans mes objectifs' : 'Viser cet examen'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}