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
  const itemsPerPage = 6;
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentCerts.map((cert) => (
              <motion.div key={cert.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center text-center group cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all duration-200"
                onClick={() => setSelectedCertModal(cert)}>
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-3 p-1">
                  {cert.image ? (
                    <img src={cert.image} alt={cert.nom}
                      className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <Award className="w-10 h-10 text-slate-300" />
                  )}
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider border mb-2 ${getLevelBadgeStyle(cert.niveau)}`}>
                  {cert.niveau}
                </span>
                <h3 className="text-xs font-extrabold text-slate-950 leading-snug line-clamp-2 min-h-[2.5em]">
                  {cert.nom}
                </h3>
                <p className="text-[9px] text-slate-400 font-bold mt-1">{cert.fournisseur?.nom}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <button onClick={(e) => { e.stopPropagation(); setSelectedCertModal(cert); }}
                    className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition-all cursor-pointer">
                    Voir
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toggleTargetCertification(cert.id.toString()); }}
                    className={`p-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer border ${
                      targetCertIds.includes(cert.id.toString())
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                    title={targetCertIds.includes(cert.id.toString()) ? "Retirer des objectifs" : "Ajouter aux objectifs"}>
                    {targetCertIds.includes(cert.id.toString()) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
                  </button>
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
                  className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
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
  const [imgError, setImgError] = useState(false);
  return (
    <div className="flex flex-col">
      <div className="relative flex items-start p-5 pb-0">
        {cert.image && !imgError ? (
          <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0">
            <img src={cert.image} alt={cert.nom} className="max-w-full max-h-full object-contain"
              onError={() => setImgError(true)} />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Award className="w-8 h-8 text-blue-500" />
          </div>
        )}
        <div className="ml-4 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {cert.codeExamen && (
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">{cert.codeExamen}</span>
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-black border ${getLevelBadgeStyle(cert.niveau)}`}>{cert.niveau}</span>
          </div>
          <h2 className="text-sm font-black text-slate-950 leading-snug">{cert.nom}</h2>
          <p className="text-[11px] text-slate-400 font-bold mt-0.5">{cert.fournisseur?.nom}</p>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          {cert.description || "Préparez-vous efficacement à l'examen officiel grâce à nos questionnaires actualisés."}
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Niveau</span>
            <p className="text-xs font-extrabold text-slate-900 mt-0.5">{cert.niveau}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Durée</span>
            <p className="text-xs font-extrabold text-slate-900 mt-0.5">{cert.dureeIndicative || '15h'}</p>
          </div>
        </div>

        {cert.objectifs && cert.objectifs.length > 0 && (
          <div className="p-3.5 bg-blue-50 rounded-xl space-y-2">
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> Objectifs
            </span>
            <ul className="space-y-1">
              {cert.objectifs.map((obj, i) => (
                <li key={i} className="text-[11px] text-slate-700 font-semibold flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        )}

        {cert.prerequis && cert.prerequis.length > 0 && (
          <div className="p-3.5 bg-amber-50 rounded-xl space-y-2">
            <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Prérequis
            </span>
            <ul className="space-y-1">
              {cert.prerequis.map((pr, i) => (
                <li key={i} className="text-[11px] text-slate-700 font-semibold flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  {pr}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 space-y-2">
        <button onClick={() => onPractice(cert)}
          className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]">
          <Play className="w-3.5 h-3.5 fill-white text-white" />
          Commencer la formation
        </button>
        {onToggleTarget && (
          <button onClick={() => onToggleTarget()}
            className={`w-full py-2 border font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] ${
              isTargeted
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300'
            }`}>
            {isTargeted ? <CheckCircle2 className="w-3 h-3" /> : <Target className="w-3 h-3" />}
            {isTargeted ? 'Dans mes objectifs' : 'Viser cet examen'}
          </button>
        )}
      </div>
    </div>
  );
}