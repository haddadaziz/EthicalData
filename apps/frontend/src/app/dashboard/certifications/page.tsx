"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { Award, BookOpen, Clock, FileText, Search, Play, ArrowRight, ArrowLeft } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour les filtres
  const [selectedLevel, setSelectedLevel] = useState<'TOUS' | 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE'>('TOUS');
  const [selectedProvider, setSelectedProvider] = useState<string>('TOUS');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const loadCatalogData = async () => {
      try {
        const [certsData, providersData] = await Promise.all([
          apiFetch('/certifications'),
          apiFetch('/certifications/fournisseurs'),
        ]);
        setCerts(certsData);
        setFournisseurs(providersData);
      } catch (err) {
        console.error("Erreur chargement catalogue certifications:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCatalogData();
  }, []);

  // Remettre à la page 1 si les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, selectedProvider]);

  // Filtrage
  const filteredCerts = certs.filter((cert) => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch = !search || cert.nom.toLowerCase().includes(search) || 
                          (cert.codeExamen && cert.codeExamen.toLowerCase().includes(search));
    const matchesLevel = selectedLevel === 'TOUS' || cert.niveau === selectedLevel;
    const matchesProvider = selectedProvider === 'TOUS' || cert.fournisseur.id === selectedProvider;

    return matchesSearch && matchesLevel && matchesProvider;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCerts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCerts = filteredCerts.slice(indexOfFirstItem, indexOfLastItem);

  const getLevelBadgeStyle = (niv: string) => {
    switch (niv) {
      case 'AVANCE':
        return 'bg-red-50 text-red-700 border border-red-150';
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
        <span className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-red-600">Chargement des certifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-slate-800 text-left animate-fadeIn">
      
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">Catalogue des Certifications</h1>
        <p className="text-slate-500 text-xs mt-1.5 font-bold uppercase tracking-wider">
          Explorez les certifications, étudiez les modules et préparez-vous aux examens officiels.
        </p>
      </div>

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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-xl text-slate-900 placeholder-slate-400 transition-all text-sm outline-none font-semibold"
            />
          </div>
          <div className="text-xs text-slate-500 font-bold shrink-0">
            {filteredCerts.length} certification{filteredCerts.length > 1 ? 's' : ''} disponible{filteredCerts.length > 1 ? 's' : ''}
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentCerts.map((cert) => (
              <div
                key={cert.id}
                className="bg-white border border-slate-200/80 hover:border-slate-350 hover:shadow-md rounded-3xl overflow-hidden flex flex-col justify-between group transition-all duration-300"
              >
                {/* Entête Visuelle */}
                <div className="w-full h-32 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-6 relative">
                  {cert.image ? (
                    <img src={cert.image} alt={cert.nom} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <Award className="w-10 h-10 text-slate-300" />
                  )}
                  
                  <div className="absolute top-3 left-3">
                    <span className="font-bold text-red-650 text-[9px] px-2.5 py-0.5 bg-red-50 border border-red-100 rounded-lg">
                      {cert.codeExamen || 'Examen'}
                    </span>
                  </div>
                  
                  <div className="absolute top-3 right-3">
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getLevelBadgeStyle(cert.niveau)}`}>
                      {cert.niveau}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>{cert.fournisseur.nom}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {cert.dureeIndicative || '15h'}</span>
                    </div>

                    <h3 className="font-extrabold text-slate-950 text-base leading-snug group-hover:text-red-600 transition-colors line-clamp-1">
                      {cert.nom}
                    </h3>
                    
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-semibold">
                      {cert.description}
                    </p>
                  </div>

                  {/* Compteurs de Modules / Ressources */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-950">{(cert.modules || []).length} Modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-950">{(cert.ressources || []).length} Supports</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/practice?cert=${cert.slug}`)}
                      className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                    >
                      <Play className="w-2.5 h-2.5 fill-white text-white" />
                      <span>S'entraîner</span>
                    </button>
                    
                    <button
                      onClick={() => router.push(`/dashboard/downloads?cert=${cert.slug}`)}
                      className="px-4 py-3 border border-slate-200/80 hover:border-slate-350 text-slate-650 hover:text-slate-950 font-bold rounded-xl text-[10px] uppercase tracking-wider bg-white shadow-sm transition-all"
                    >
                      Cours
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