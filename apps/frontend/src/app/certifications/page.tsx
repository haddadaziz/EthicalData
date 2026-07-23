"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Award, ArrowLeft, ArrowRight } from '@/components/icons';
import { getProviderLogo, getCertificateBadgeLogo } from '@/lib/certification-utils';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/landing/Navbar';

// Certifications de secours avec les vrais badges officiels si l'API est vide
const fallbackCertifications = [
    {
        id: 1,
        nom: "Microsoft Azure Fundamentals",
        codeExamen: "AZ-900",
        niveau: "DEBUTANT",
        dureeIndicative: "15h indicatives",
        description: "Maîtrisez les concepts fondamentaux du Cloud Microsoft Azure, la sécurité, la confidentialité et les tarifs officiels.",
        fournisseur: { nom: "Microsoft" },
        image: "/badges/az-900.svg",
        slug: "az-900"
    },
    {
        id: 2,
        nom: "PECB ISO 27001 Lead Implementer",
        codeExamen: "ISO-27001",
        niveau: "INTERMEDIAIRE",
        dureeIndicative: "30h indicatives",
        description: "Apprenez à mettre en œuvre et gérer un Système de Management de la Sécurité de l'Information (SMSI) selon ISO/IEC 27001.",
        fournisseur: { nom: "PECB" },
        image: "/badges/pecb-iso.svg",
        slug: "iso-27001"
    },
    {
        id: 3,
        nom: "AWS Certified Cloud Practitioner",
        codeExamen: "CLF-C02",
        niveau: "DEBUTANT",
        dureeIndicative: "20h indicatives",
        description: "Validez vos connaissances globales de la plateforme Cloud Amazon Web Services (AWS) et de sa sécurité.",
        fournisseur: { nom: "AWS" },
        image: "/badges/aws-clf.svg",
        slug: "clf-c02"
    },
    {
        id: 4,
        nom: "Palo Alto Networks Certified Network Security",
        codeExamen: "PCNSA",
        niveau: "INTERMEDIAIRE",
        dureeIndicative: "25h indicatives",
        description: "Concevez et configurez des pare-feu de nouvelle génération Palo Alto Networks pour protéger votre infrastructure.",
        fournisseur: { nom: "Palo Alto Networks" },
        image: "/logos/paloalto.png",
        slug: "pcnsa"
    },
    {
        id: 5,
        nom: "CompTIA Security+",
        codeExamen: "SY0-701",
        niveau: "DEBUTANT",
        dureeIndicative: "30h indicatives",
        description: "La référence internationale pour valider vos compétences de base en cybersécurité, réseaux et gestion des risques.",
        fournisseur: { nom: "CompTIA" },
        image: "/badges/comptia-sec.svg",
        slug: "sy0-701"
    },
    {
        id: 6,
        nom: "Fortinet Network Security Associate",
        codeExamen: "NSE 4",
        niveau: "AVANCE",
        dureeIndicative: "35h indicatives",
        description: "Sécurisez les réseaux d'entreprise avec les solutions FortiGate et maîtrisez l'administration avancée Fortinet.",
        fournisseur: { nom: "Fortinet" },
        image: "/logos/fortinet.png",
        slug: "nse-4"
    }
];

export default function CertificationsPublicPage() {
    const [isConnected, setIsConnected] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        apiFetch('/users/me/profile').then((profile) => {
            setIsConnected(true);
            const roles = profile?.roles?.map((r: any) => r.nom) || [];
            if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) {
                setIsAdmin(true);
            }
        }).catch(() => {
            setIsConnected(false);
        });
    }, []);
    const [certifications, setCertifications] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('TOUS');
    const [selectedLevel, setSelectedLevel] = useState('TOUS');
    const [selectedCategory, setSelectedCategory] = useState('TOUS');
    const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        document.title = "Catalogue des Certifications - Ethical Data Security";

        Promise.all([
            apiFetch('/certifications'),
            apiFetch('/certifications/categories').catch(() => []),
        ]).then(([certsData, catsData]) => {
            if (Array.isArray(certsData) && certsData.length > 0) {
                const enriched = certsData.map((cert: any) => ({
                    ...cert,
                    image: getCertificateBadgeLogo(cert)
                }));
                setCertifications(enriched);
            } else {
                setCertifications(fallbackCertifications);
            }
            if (Array.isArray(catsData)) setCategories(catsData);
        }).catch(() => setCertifications(fallbackCertifications))
        .finally(() => setLoading(false));
    }, []);

    const providers = ['TOUS', ...Array.from(new Set(certifications.map(c => c.fournisseur?.nom || 'Autre')))];

    const filteredCertifications = certifications.filter(cert => {
        const matchesSearch =
            cert.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (cert.codeExamen && cert.codeExamen.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (cert.fournisseur?.nom && cert.fournisseur.nom.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesProvider =
            selectedProvider === 'TOUS' || cert.fournisseur?.nom === selectedProvider || cert.fournisseur?.slug === selectedProvider;

        const matchesLevel =
            selectedLevel === 'TOUS' ||
            (cert.niveau && cert.niveau.toUpperCase() === selectedLevel.toUpperCase());

        const matchesCategory =
            selectedCategory === 'TOUS' ||
            (cert.categorie?.slug === selectedCategory);

        return matchesSearch && matchesProvider && matchesLevel && matchesCategory;
    });

    const totalPages = Math.ceil(filteredCertifications.length / ITEMS_PER_PAGE);
    const currentCerts = filteredCertifications.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedProvider, selectedLevel, selectedCategory]);

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
            
            {/* NAVBAR IDENTIQUE À LA LANDING PAGE (transparent en haut, blanc au scroll, disparaît en descendant) */}
            <Navbar />

            {/* HEADER HERO SECTION */}
            <section className="relative min-h-[115vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden border-b border-slate-800">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/logos/landing_page_logo_ethicaldata.jpeg" 
                        alt="Ethical Data Background Logo" 
                        className="w-full h-full object-cover opacity-80" 
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/50 via-[#020617]/30 to-[#020617]/70" />

                    <style dangerouslySetInnerHTML={{__html: `
                        @keyframes scan-laser {
                            0% { transform: translate3d(0, 0vh, 0); }
                            50% { transform: translate3d(0, 80vh, 0); }
                            100% { transform: translate3d(0, 0vh, 0); }
                        }
                        .animate-scan-laser {
                            animation: scan-laser 6s linear infinite;
                            will-change: transform;
                            backface-visibility: hidden;
                        }
                    `}} />

                    <div 
                        className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400/80 shadow-[0_0_15px_#06b6d4] animate-scan-laser pointer-events-none z-10"
                    />
                </div>

                {/* Hero content */}
                <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-4xl uppercase leading-none drop-shadow-lg"
                    >
                        Certifications & Préparations d&apos;Examen
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xs sm:text-sm md:text-base text-white/80 max-w-3xl mx-auto mt-6 font-semibold leading-relaxed drop-shadow-md"
                    >
                        Explorez nos programmes officiels de préparation Cloud & Cybersécurité et testez vos connaissances sur nos examens blancs interactifs.
                    </motion.p>
                </div>
            </section>

            {/* WRAPPER AVEC BACKGROUND */}
            <div className="relative flex-1 flex flex-col w-full">
                {/* Background image identique à la landing page */}
                <div className="absolute inset-0 z-0 pointer-events-none" style={{ contentVisibility: 'auto' }}>
                    <img 
                        src="/bg/cyber_hero_bg.png" 
                        alt="Cyber security background texture" 
                        className="w-full h-full object-cover opacity-65 transform-gpu" 
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
                </div>

                {/* CONTENU PRINCIPAL & FILTRES */}
                <main className="relative z-10 max-w-7xl mx-auto px-6 py-10 flex-1 w-full space-y-8">
                
                {/* BARRE DE RECHERCHE ET FILTRES D'ÉDITEURS */}
                <div className="bg-[#080d1a]/85 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 text-left">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        
                        {/* Champ de recherche */}
                        <div className="relative w-full md:w-96">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher ..."
                                className="w-full pl-10 pr-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-[#020617] text-white placeholder-slate-500 rounded-xl text-xs font-semibold outline-none transition-all shadow-sm"
                            />
                        </div>

                        {/* Filtre Niveau */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 w-[92px] text-right">Niveau :</span>
                            <div className="relative w-full sm:w-52">
                                <button
                                    type="button"
                                    onClick={() => setLevelDropdownOpen(!levelDropdownOpen)}
                                    className="flex items-center gap-2.5 px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-xl text-white text-xs font-bold outline-none cursor-pointer hover:bg-[#0a1224] transition-all w-full shadow-sm"
                                >
                                    <span className="flex-1 text-left truncate">
                                        {selectedLevel === 'TOUS' ? 'Tous les niveaux' : selectedLevel.charAt(0) + selectedLevel.slice(1).toLowerCase()}
                                    </span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${levelDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {levelDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setLevelDropdownOpen(false)} />
                                        <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-[#080d1a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                                            {['TOUS', 'DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => { setSelectedLevel(level); setLevelDropdownOpen(false); }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-[#020617] cursor-pointer ${
                                                        selectedLevel === level ? 'bg-[#020617] text-white' : 'text-slate-400'
                                                    }`}
                                                >
                                                    {level === 'TOUS' ? 'Tous les niveaux' : level.charAt(0) + level.slice(1).toLowerCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Filtre Rapide par Logos Fournisseurs (Fond Blanc) */}
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Filtrer par Fournisseur Officiels :</span>
                        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                            {providers.map((provider) => {
                                const logo = getProviderLogo(provider);
                                const isSelected = selectedProvider === provider;
                                return (
                                    <button
                                        key={provider}
                                        onClick={() => setSelectedProvider(provider)}
                                        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                                            isSelected
                                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                                                : 'bg-[#020617] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                                        }`}
                                    >
                                        {provider === 'TOUS' ? (
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-950 text-cyan-400 border border-blue-800/50'}`}>
                                                <Award className="w-3.5 h-3.5" />
                                            </div>
                                        ) : logo ? (
                                            <div className="w-7 h-7 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                                                <img src={logo} alt={provider} className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className="w-7 h-7 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                                                <Award className="w-3.5 h-3.5 text-blue-600" />
                                            </div>
                                        )}
                                        <span>{provider}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* GRILLE DES PETITES CARTES AVEC IMAGE + TITRE + NIVEAU + BOUTON VOIR */}
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
                        <span className="w-9 h-9 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement des certifications...</p>
                    </div>
                ) : filteredCertifications.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
                        <p className="text-base font-extrabold text-slate-700">Aucune certification ne correspond aux critères sélectionnés.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedProvider('TOUS'); setSelectedLevel('TOUS'); }}
                            className="px-5 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all cursor-pointer"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                ) : (
                    <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentCerts.map((cert) => {
                            const slug = cert.slug || `${cert.codeExamen?.toLowerCase() || cert.id}`;
                            return (
                            <Link key={cert.id} href={`/certifications/${slug}`} scroll={false}
                                className="bg-[#080d1a]/85 border border-slate-800 rounded-2xl p-4 flex flex-col group transition-all duration-300 hover:shadow-lg hover:border-slate-600 text-left">
                                <div className="relative w-full aspect-[4/3] sm:aspect-auto sm:h-[220px] rounded-xl overflow-hidden shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-blue-900/30 group-hover:shadow-2xl bg-white border border-slate-100">
                                    <img src="/images/cadre_certif.png" alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
                                    {cert.codeExamen && (
                                        <div className="absolute top-3 left-3 z-30">
                                            <div className="bg-slate-950 text-white font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-md border border-slate-800 shadow-sm flex items-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors">
                                                {cert.codeExamen}
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                        <div className="w-28 h-28 sm:w-28 sm:h-28 flex items-center justify-center transition-transform duration-500 -translate-y-3 group-hover:-translate-y-5">
                                            {cert.image ? (
                                                <img src={cert.image} alt={cert.nom} className="max-w-full max-h-full object-contain filter drop-shadow-xl" />
                                            ) : (
                                                <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                                                    <span className="text-xs font-bold text-slate-500">{cert.codeExamen || 'EDS'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-col gap-2 px-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-[13px] font-bold text-slate-100 leading-snug line-clamp-2 flex-1">
                                            {cert.nom}
                                        </h3>
                                        <div className="px-3 py-1.5 shrink-0 bg-[#020617] border border-slate-800 rounded-lg flex items-center justify-center text-slate-300 transition-colors shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 text-[10px] font-bold uppercase tracking-wider">
                                            Voir le détail
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-8 p-6 bg-[#080d1a]/85 border border-slate-800 rounded-3xl shadow-sm">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-[#020617] shadow-sm"
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
                                                    : 'bg-transparent text-slate-500 hover:bg-[#020617] hover:text-white'
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
                                className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-[#020617] shadow-sm"
                            >
                                <span>Suivant</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                    </>
                )}

                </main>
            </div>

            <Footer />
        </div>
    );
}
