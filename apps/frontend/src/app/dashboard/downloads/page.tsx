"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { FileText, Download, Search, Layers, Clock, Award, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DownloadsPage() {
    const [certs, setCerts] = useState<any[]>([]);
    const [quotas, setQuotas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCertFilter, setSelectedCertFilter] = useState<string>('TOUS');

    useEffect(() => {
        const fetchResourcesAndQuotas = async () => {
            try {
                const [certsData, quotasData] = await Promise.all([
                    apiFetch('/certifications'),
                    apiFetch('/certifications/ressources/mes-quotas')
                ]);
                setCerts(certsData);
                setQuotas(quotasData);
            } catch (err) {
                console.error("Erreur de chargement des ressources:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResourcesAndQuotas();
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

    const handleDownload = async (resourceId: string, isPublic: boolean, defaultUrl: string) => {
        if (isPublic) {
            window.open(defaultUrl, '_blank');
            return;
        }

        try {
            const response = await apiFetch(`/certifications/ressources/${resourceId}/telecharger`, {
                method: 'POST'
            });

            // Lancer le téléchargement
            window.open(response.url, '_blank');

            // Mettre à jour les quotas dans l'état local
            const updatedQuotas = await apiFetch('/certifications/ressources/mes-quotas');
            setQuotas(updatedQuotas);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Action refusée. Quota de téléchargement possiblement expiré.");
        }
    };

    const formatBytes = (bytes: number | null) => {
        if (!bytes) return 'Taille N/A';
        if (bytes < 1024) return `${bytes} Octets`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} Ko`;
        return `${(bytes / 1048576).toFixed(1)} Mo`;
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-600 gap-4">
                <span className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-red-600">Chargement de la bibliothèque...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 text-slate-800 text-left">

            {/* En-tête de la page */}
            <div>
                <h1 className="text-3xl font-black text-slate-950 tracking-tight">Fiches & Guides de Cours</h1>
                <p className="text-slate-600 text-xs mt-1.5 font-semibold uppercase tracking-wider">
                    Téléchargez vos fiches de révision condensées et vos mémas d'examens.
                </p>
            </div>

            {/* Barre de Recherche & Filtres */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-6">

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
                            className="w-full pl-11 pr-4 py-3 bg-slate-50/40 border border-slate-200/80 focus:border-red-600 rounded-xl text-slate-200 placeholder-slate-400 transition-all text-sm outline-none"
                        />
                    </div>
                    <div className="text-xs text-slate-500 font-bold">
                        {filteredResources.length} document{filteredResources.length > 1 ? 's' : ''} disponible{filteredResources.length > 1 ? 's' : ''}
                    </div>
                </div>

                {/* Sélections des Filtres par Certification */}
                <div className="space-y-2.5 text-left border-t border-slate-200/80/60 pt-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Trier par examen</span>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCertFilter('TOUS')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedCertFilter === 'TOUS'
                                ? 'bg-white text-slate-950 shadow-md'
                                : 'bg-slate-50 border border-slate-200/80 hover:bg-slate-50 text-slate-600'
                                }`}
                        >
                            Tous les documents
                        </button>
                        {certs.map((cert) => (
                            <button
                                key={cert.id}
                                onClick={() => setSelectedCertFilter(cert.slug)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedCertFilter === cert.slug
                                    ? 'bg-white text-slate-950 shadow-md'
                                    : 'bg-slate-50 border border-slate-200/80 hover:bg-slate-50 text-slate-600'
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
                        className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl text-slate-500 font-semibold"
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
                            
                            // Déterminer les quotas restants
                            const quotaInfo = quotas.find(q => q.resourceId === res.id);
                            const remaining = quotaInfo ? quotaInfo.remaining : (res.quotaTelechargement ?? 10);
                            const isOutOfQuota = !res.public && remaining === 0;

                            return (
                                <div 
                                    key={res.id}
                                    className="bg-white shadow-sm border border-slate-200/80 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group text-left relative overflow-hidden"
                                >
                                    <div className="space-y-4">
                                        
                                        {/* Badge de Certification */}
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-[9px] font-black text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                {res.certCode || 'Général'}
                                            </span>
                                            <span className="text-[9px] font-black text-slate-500 bg-slate-50/40 border border-slate-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                {fileType}
                                            </span>
                                        </div>

                                        {/* Titre & Description */}
                                        <div className="space-y-1">
                                            <h3 className="font-extrabold text-slate-950 text-base group-hover:text-red-600 transition-colors leading-tight">
                                                {res.titre}
                                            </h3>
                                            <p className="text-[10px] text-slate-500 font-bold truncate mt-0.5">
                                                Lié à : {res.certName}
                                            </p>
                                        </div>

                                        <p className="text-xs text-slate-550 line-clamp-3 leading-relaxed font-semibold">
                                            {res.description || "Pas de description fournie pour ce fichier. Ce guide fait office de support pédagogique officiel."}
                                        </p>
                                    </div>

                                    {/* Actions & Métriques du fichier */}
                                    <div className="pt-6 mt-6 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                                        <div className="flex flex-col text-left">
                                            <span className="text-slate-500 font-bold uppercase">{formatBytes(res.taille)}</span>
                                            {!res.public && (
                                                <span className={`text-[8px] font-black tracking-widest uppercase mt-0.5 ${
                                                    isOutOfQuota ? 'text-red-650 animate-pulse' : 'text-slate-400'
                                                }`}>
                                                    {isOutOfQuota ? 'Quota épuisé' : `${remaining} restants`}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <button
                                            onClick={() => handleDownload(res.id, res.public, res.url)}
                                            disabled={isOutOfQuota}
                                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                                                isOutOfQuota 
                                                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                                    : 'bg-white hover:bg-slate-100 text-slate-950 border border-slate-200/80 shadow-md cursor-pointer'
                                            }`}
                                        >
                                            <Download className={`w-3.5 h-3.5 ${isOutOfQuota ? 'text-slate-400' : 'text-slate-950'}`} />
                                            <span>{isOutOfQuota ? 'Bloqué' : 'Télécharger'}</span>
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