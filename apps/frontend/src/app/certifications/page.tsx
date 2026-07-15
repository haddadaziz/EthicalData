"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Award, ArrowLeft, ArrowRight } from '@/components/icons';
import { getProviderLogo, getCertificateBadgeLogo } from '@/lib/certification-utils';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

const TriangleLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={`${className} text-red-600`} viewBox="0 0 100 100" fill="currentColor">
        <polygon points="50,15 15,85 85,85" className="fill-none stroke-red-600 stroke-[6]" />
        <polygon points="50,30 28,75 72,75" className="fill-none stroke-slate-900 stroke-[4]" />
        <polygon points="50,45 40,65 60,65" className="fill-red-600" />
    </svg>
);

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
    const [scrolled, setScrolled] = useState(false);
    const [navVisible, setNavVisible] = useState(true);
    const lastScrollY = useRef(0);

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

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentY = window.scrollY;
                    const isScrolled = currentY > 60;
                    const isNavVisible = currentY <= 60 || currentY < lastScrollY.current;
                    setScrolled(prev => prev !== isScrolled ? isScrolled : prev);
                    setNavVisible(prev => prev !== isNavVisible ? isNavVisible : prev);
                    lastScrollY.current = currentY;
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
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
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
            
            {/* NAVBAR IDENTIQUE À LA LANDING PAGE (transparent en haut, blanc au scroll, disparaît en descendant) */}
            <Navbar
                scrolled={scrolled}
                navVisible={navVisible}
                mounted={mounted}
                isConnected={isConnected}
                isAdmin={isAdmin}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* HEADER HERO SECTION */}
            <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden border-b border-slate-200/60">
                {/* Background image */}
                <div className="absolute inset-0">
                    <img src="/landing_page_logo_ethicaldata.jpeg" alt=""
                        className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/70" />
                </div>

                {/* Hero content */}
                <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 flex flex-col items-center text-center">
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

            {/* CONTENU PRINCIPAL & FILTRES */}
            <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full space-y-8">
                
                {/* BARRE DE RECHERCHE ET FILTRES D'ÉDITEURS */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5 text-left">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        
                        {/* Champ de recherche */}
                        <div className="relative w-full md:w-96">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher par nom, code (AZ-900, ISO-27001...)"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/5 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all"
                            />
                        </div>

                        {/* Filtre Niveau */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 w-[92px] text-right">Niveau :</span>
                            <div className="relative w-full sm:w-52">
                                <button
                                    type="button"
                                    onClick={() => setLevelDropdownOpen(!levelDropdownOpen)}
                                    className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all w-full"
                                >
                                    <span className="flex-1 text-left truncate">
                                        {selectedLevel === 'TOUS' ? 'Tous les niveaux' : selectedLevel.charAt(0) + selectedLevel.slice(1).toLowerCase()}
                                    </span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${levelDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {levelDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setLevelDropdownOpen(false)} />
                                        <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden">
                                            {['TOUS', 'DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => { setSelectedLevel(level); setLevelDropdownOpen(false); }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                                                        selectedLevel === level ? 'bg-slate-100 text-slate-950' : 'text-slate-600'
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

                    {/* Filtres Catégorie & Fournisseur (côte à côte) */}
                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {/* Catégorie */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 w-[92px] text-right">Catégorie :</span>
                                <div className="relative w-full sm:w-52">
                                    <button
                                        type="button"
                                        onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                                        className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all w-full"
                                    >
                                        <span className="flex-1 text-left truncate">
                                            {selectedCategory === 'TOUS' ? 'Toutes les catégories' : categories.find(c => c.slug === selectedCategory)?.nom || 'Sélectionner'}
                                        </span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {categoryDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setCategoryDropdownOpen(false)} />
                                            <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden">
                                                <button
                                                    onClick={() => { setSelectedCategory('TOUS'); setCategoryDropdownOpen(false); }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                                                        selectedCategory === 'TOUS' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                                                    }`}
                                                >
                                                    Toutes les catégories
                                                </button>
                                                <div className="border-t border-slate-100" />
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat.slug}
                                                        onClick={() => { setSelectedCategory(cat.slug); setCategoryDropdownOpen(false); }}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                                                            selectedCategory === cat.slug ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                                                        }`}
                                                    >
                                                        {cat.nom}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Fournisseur */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 w-[92px] text-right">Fournisseur :</span>
                                <div className="relative w-full sm:w-52">
                                    <button
                                        type="button"
                                        onClick={() => setProviderDropdownOpen(!providerDropdownOpen)}
                                        className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all w-full"
                                    >
                                        {selectedProvider !== 'TOUS' && getProviderLogo(selectedProvider) && (
                                            <img src={getProviderLogo(selectedProvider)} alt="" className="w-5 h-5 object-contain rounded shrink-0" />
                                        )}
                                        <span className="flex-1 text-left truncate">
                                            {selectedProvider === 'TOUS' ? 'Tous les fournisseurs' : providers.find(p => p !== 'TOUS' && (p === selectedProvider)) || 'Sélectionner'}
                                        </span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${providerDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {providerDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setProviderDropdownOpen(false)} />
                                            <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden">
                                                <button
                                                    onClick={() => { setSelectedProvider('TOUS'); setProviderDropdownOpen(false); }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                                                        selectedProvider === 'TOUS' ? 'bg-slate-100 text-slate-950' : 'text-slate-600'
                                                    }`}
                                                >
                                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                        <Award className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                    Tous les fournisseurs
                                                </button>
                                                <div className="border-t border-slate-100" />
                                                {providers.filter(p => p !== 'TOUS').map((provider) => {
                                                    const logo = getProviderLogo(provider);
                                                    return (
                                                        <button
                                                            key={provider}
                                                            onClick={() => { setSelectedProvider(provider); setProviderDropdownOpen(false); }}
                                                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                                                                selectedProvider === provider ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
                                                            }`}
                                                        >
                                                            {logo ? (
                                                                <img src={logo} alt="" className="w-7 h-7 object-contain rounded shrink-0" />
                                                            ) : (
                                                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                                    <Award className="w-3.5 h-3.5 text-slate-400" />
                                                                </div>
                                                            )}
                                                            {provider}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
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
                                className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col group transition-all duration-300 hover:shadow-lg hover:border-slate-300 text-left">
                                <div className="relative w-full aspect-[4/3] sm:aspect-auto sm:h-[220px] rounded-xl overflow-hidden shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-blue-900/30 group-hover:shadow-2xl bg-white border border-slate-100">
                                    <img src="/logos/cadre_certif.png" alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
                                    {cert.codeExamen && (
                                        <div className="absolute top-3 left-3 z-30">
                                            <div className="bg-slate-950 text-white font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 rounded-md border border-slate-800 shadow-sm flex items-center group-hover:bg-red-600 group-hover:border-red-500 transition-colors">
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
                                        <h3 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-2 flex-1">
                                            {cert.nom}
                                        </h3>
                                        <div className="px-3 py-1.5 shrink-0 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-700 transition-colors shadow-sm group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 text-[10px] font-bold uppercase tracking-wider">
                                            Voir le détail
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            );
                        })}
                    </div>

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

            </main>

            <Footer />
        </div>
    );
}
