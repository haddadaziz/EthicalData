"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { FileText, Download, Search, Layers, Clock, Award, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DownloadsPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertFilter, setSelectedCertFilter] = useState<string>('TOUS');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await apiFetch('/certifications');
        setCerts(data);
      } catch (err) {
        console.error("Erreur de chargement des ressources:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Extraction à plat de toutes les ressources avec les détails de leur certification parente
  const allResources = certs.flatMap(cert => 
    (cert.ressources || []).map((res: any) => ({
      ...res,
      certName: cert.nom,
      certSlug: cert.slug,
      certCode: cert.codeExamen
    }))
  );

  // Filtrage combiné (Recherche textuelle + Onglet de Certification)
  const filteredResources = allResources.filter(res => {
    const matchesSearch = res.titre.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                          (res.description && res.description.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    const matchesCert = selectedCertFilter === 'TOUS' || res.certSlug === selectedCertFilter;
    return matchesSearch && matchesCert;
  });

  const handleDownload = (url: string) => {
    if (!url) return;
    // Ouvre le fichier ou déclenche le téléchargement dans un nouvel onglet
    window.open(url, '_blank');
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return 'Taille N/A';
    if (bytes < 1024) return `${bytes} Octets`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1048576).toFixed(1)} Mo`;
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400 gap-4">
        <span className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Chargement de la bibliothèque...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-slate-100 text-left">
      
      {/* En-tête de la page */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Fiches & Guides de Cours</h1>
        <p className="text-slate-400 text-xs mt-1.5 font-semibold uppercase tracking-wider">
          Téléchargez vos fiches de révision condensées et vos mémas d'examens.
        </p>
      </div>

      {/* Barre de Recherche & Filtres */}
      <div className="bg-slate-900/10 border border-slate-900 rounded-3xl p-6 space-y-6">
        
        {/* Recherche et Statistiques */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <Search className="w-5 h-5" />
            </span>
            <input 
              type="text"
              placeholder="Rechercher une fiche ou un cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-900 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-650 transition-all text-sm outline-none"
            />
          </div>
          <div className="text-xs text-slate-500 font-bold">
            {filteredResources.length} document{filteredResources.length > 1 ? 's' : ''} disponible{filteredResources.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Sélections des Filtres par Certification */}
        <div className="space-y-2.5 text-left border-t border-slate-900/60 pt-4">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Trier par examen</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCertFilter('TOUS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCertFilter === 'TOUS'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'bg-slate-950 border border-slate-900 hover:bg-slate-900 text-slate-400'
              }`}
            >
              Tous les documents
            </button>
            {certs.map((cert) => (
              <button
                key={cert.id}
                onClick={() => setSelectedCertFilter(cert.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCertFilter === cert.slug
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'bg-slate-950 border border-slate-900 hover:bg-slate-900 text-slate-400'
                }`}
              >
                {cert.codeExamen || cert.nom}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Grid de Documents */}
      <AnimatePresence mode="wait">
        {filteredResources.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-12 text-center bg-slate-900/10 border border-slate-900 rounded-3xl text-slate-500 font-semibold"
          >
            Aucun support de cours ne correspond à votre recherche.
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredResources.map((res: any) => {
              const fileType = res.type?.toUpperCase() || 'PDF';
              
              return (
                <div 
                  key={res.id}
                  className="bg-slate-900/10 hover:bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group text-left relative overflow-hidden"
                >
                  <div className="space-y-4">
                    
                    {/* Badge de Certification */}
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {res.certCode || 'Général'}
                      </span>
                      <span className="text-[9px] font-black text-slate-500 bg-slate-950/40 border border-slate-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {fileType}
                      </span>
                    </div>

                    {/* Titre & Description */}
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-white text-base group-hover:text-indigo-400 transition-colors leading-tight">
                        {res.titre}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                        Lié à : {res.certName}
                      </p>
                    </div>

                    <p className="text-xs text-slate-450 line-clamp-3 leading-relaxed">
                      {res.description || "Pas de description fournie pour ce fichier. Ce guide fait office de support pédagogique officiel."}
                    </p>
                  </div>

                  {/* Actions & Métriques du fichier */}
                  <div className="pt-6 mt-6 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                    <span className="text-slate-500 font-bold uppercase">{formatBytes(res.taille)}</span>
                    
                    <button
                      onClick={() => handleDownload(res.url)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-950" />
                      <span>Télécharger</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}