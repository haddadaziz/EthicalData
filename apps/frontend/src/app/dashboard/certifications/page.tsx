"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { Award, BookOpen, Clock, FileText, Search, Play, ArrowRight, ArrowLeft, Users, CheckCircle2, Target, Check } from 'lucide-react';
import { motion } from 'framer-motion';

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
}

export default function LearnerCertificationsPage() {
  const router = useRouter();
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
    } catch (e) {
      console.error("Erreur mise à jour des objectifs visés:", e);
      setTargetCertIds(targetCertIds);
    }
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

  const getLevelBadgeStyle = (niv: string) => {
    switch (niv) {
      case 'AVANCE':
        return 'bg-rose-50 text-rose-700 border border-rose-150';
      case 'INTERMEDIAIRE':
        return 'bg-amber-50 text-amber-700 border border-amber-150';
      case 'DEBUTANT':
      default:
        return 'bg-emerald-50 text-emerald-700 border border-emerald-150';
    }
  };

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentCerts.map((cert) => (
              <div
                key={cert.id}
                className="bg-white border border-slate-200/90 hover:border-slate-350 hover:shadow-xl rounded-3xl p-6 sm:p-7 flex flex-col justify-between group transition-all duration-300 text-left space-y-5"
              >
                {/* PARTIE SUPÉRIEURE : EN-TÊTE STYLE UDEMY */}
                <div className="flex items-start justify-between gap-4">
                  {/* Côté Gauche : Badges, Titre & Description */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-[10px] uppercase tracking-wider px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg">
                        {cert.fournisseur?.nom || 'Éditeur'}
                      </span>
                      {cert.codeExamen && (
                        <span className="font-black text-blue-600 text-[10px] uppercase tracking-wider px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg">
                          {cert.codeExamen}
                        </span>
                      )}
                      <span className={`text-[9px] px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-wider border ${getLevelBadgeStyle(cert.niveau)}`}>
                        {cert.niveau}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-950 text-lg leading-snug group-hover:text-blue-600 transition-colors">
                        {cert.nom}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1.5 leading-relaxed">
                        {cert.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Candidats en préparation</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{cert.dureeIndicative || '15h indicatives'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Côté Droit : Écusson/Badge Officiel Flottant (Style Udemy sans bordure) */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0 p-1">
                    {cert.image ? (
                      <img
                        src={cert.image}
                        alt={cert.nom}
                        className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <Award className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                </div>

                {/* BAS DE CARTE : ACTIONS & CTAS DISCRETS */}
                <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                  <button
                    onClick={() => toggleTargetCertification(cert.id.toString())}
                    className={`px-3.5 py-2 font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border shadow-2xs ${
                      targetCertIds.includes(cert.id.toString())
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90 hover:bg-emerald-100'
                        : 'bg-blue-50 text-blue-700 border-blue-200/90 hover:bg-blue-100'
                    }`}
                    title={targetCertIds.includes(cert.id.toString()) ? "Objectif actuellement visé (cliquez pour retirer)" : "Ajouter cette certification à vos objectifs visés"}
                  >
                    {targetCertIds.includes(cert.id.toString()) ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Objectif visé</span>
                      </>
                    ) : (
                      <>
                        <Target className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Viser cet examen</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/downloads?cert=${cert.slug}`)}
                      className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Cours</span>
                    </button>

                    <button
                      onClick={() => router.push(`/dashboard/practice?cert=${cert.slug}`)}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-md"
                    >
                      <Play className="w-3 h-3 fill-white text-white" />
                      <span>S'entraîner</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

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