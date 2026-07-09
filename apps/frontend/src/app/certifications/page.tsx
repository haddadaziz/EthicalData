"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, Users, Clock, Sparkles, CheckCircle2, Award, FileText, Menu, X, Target } from '@/components/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useMutationGuard } from '../../hooks/useMutationGuard';

const TriangleLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={`${className} text-red-600`} viewBox="0 0 100 100" fill="currentColor">
        <polygon points="50,15 15,85 85,85" className="fill-none stroke-red-600 stroke-[6]" />
        <polygon points="50,30 28,75 72,75" className="fill-none stroke-slate-900 stroke-[4]" />
        <polygon points="50,45 40,65 60,65" className="fill-red-600" />
    </svg>
);

const getCertificateBadgeLogo = (cert: any) => {
    if (cert.image && (cert.image.endsWith('.svg') || cert.image.endsWith('.png'))) return cert.image;
    const code = (cert.codeExamen || cert.code || '').toLowerCase();
    const nom = (cert.nom || cert.title || '').toLowerCase();

    if (code.includes('az-900') || nom.includes('az-900') || nom.includes('azure fundamentals')) return '/badges/az-900.svg';
    if (code.includes('clf') || nom.includes('cloud practitioner')) return '/badges/aws-clf.svg';
    if (code.includes('saa') || nom.includes('solutions architect')) return '/badges/aws-saa.svg';
    if (code.includes('iso-27001') || nom.includes('iso 27001') || nom.includes('pecb')) return '/badges/pecb-iso.svg';
    if (code.includes('sy0') || nom.includes('security+')) return '/badges/comptia-sec.svg';
    if (code.includes('sc-900') || nom.includes('sc-900')) return '/badges/sc-900.svg';

    return cert.image || cert.logoUrl || '/badges/az-900.svg';
};

function getLevelBadgeStyle(niveau: string) {
    switch (niveau?.toUpperCase()) {
        case 'DEBUTANT': return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
        case 'INTERMEDIAIRE': return 'bg-amber-50 text-amber-700 border-amber-200/80';
        case 'AVANCE':
        case 'EXPERT': return 'bg-rose-50 text-rose-700 border-rose-200/80';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
}

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
    const router = useRouter();
    const { showToast } = useToast();
    const { guard } = useMutationGuard(1000);
    const [isConnected, setIsConnected] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [targetCertIds, setTargetCertIds] = useState<string[]>([]);

    useEffect(() => {
        setMounted(true);
        const connected = !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
        setIsConnected(connected);
        if (connected) {
            apiFetch('/users/me/profile').then((profile) => {
                setUserProfile(profile);
                const tIds = (profile.preferences?.targetCertifications || []).map((id: any) => id.toString());
                setTargetCertIds(tIds);
            }).catch(() => {});
        }
    }, []);
    const [certifications, setCertifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('TOUS');
    const [selectedLevel, setSelectedLevel] = useState('TOUS');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedCertModal, setSelectedCertModal] = useState<any | null>(null);

    useEffect(() => {
        document.title = "Catalogue des Certifications - Ethical Data Security";

        apiFetch('/certifications')
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    const enriched = data.map((cert: any) => ({
                        ...cert,
                        image: getCertificateBadgeLogo(cert)
                    }));
                    setCertifications(enriched);
                } else {
                    setCertifications(fallbackCertifications);
                }
            })
            .catch(() => setCertifications(fallbackCertifications))
            .finally(() => setLoading(false));
    }, []);

    const providers = ['TOUS', ...Array.from(new Set(certifications.map(c => c.fournisseur?.nom || 'Autre')))];

    const filteredCertifications = certifications.filter(cert => {
        const matchesSearch =
            cert.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (cert.codeExamen && cert.codeExamen.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (cert.fournisseur?.nom && cert.fournisseur.nom.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesProvider =
            selectedProvider === 'TOUS' || cert.fournisseur?.nom === selectedProvider;

        const matchesLevel =
            selectedLevel === 'TOUS' ||
            (cert.niveau && cert.niveau.toUpperCase() === selectedLevel.toUpperCase());

        return matchesSearch && matchesProvider && matchesLevel;
    });

    const toggleTargetCertification = async (certId: string) => {
        await guard(async () => {
            const isTargeted = targetCertIds.includes(certId);
            const newTargetIds = isTargeted
                ? targetCertIds.filter((id: string) => id !== certId)
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

    const handlePracticeClick = (cert: any) => {
        if (isConnected) {
            window.location.href = cert.slug ? `/dashboard/practice?cert=${cert.slug}` : '/dashboard/practice';
        } else {
            window.location.href = '/login';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
            
            {/* BARRE DE NAVIGATION CAPSULE GLASSMORPHIC (IDENTIQUE À LA LANDING PAGE) */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/85 backdrop-blur-xl transition-all">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    
                    {/* Logo Brand avec triangle officiel */}
                    <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                        <div className="flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <TriangleLogo className="w-7 h-7" />
                        </div>
                        <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-950 uppercase">
                            Ethical Data Security
                        </span>
                    </Link>

                    {/* Navigation PC : Capsule Pill Flottante Ultra Stylée */}
                    <nav className="hidden md:flex items-center gap-1 bg-slate-950/[0.04] border border-slate-200/80 rounded-full px-3 py-1.5 shadow-sm backdrop-blur-xl">
                        <Link href="/#about" className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-650 hover:text-blue-600 hover:bg-white rounded-full transition-all duration-200 hover:shadow-xs">
                            Qui Sommes-Nous
                        </Link>
                        <Link href="/certifications" className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-blue-600 bg-white shadow-xs rounded-full transition-all duration-200">
                            Certifications
                        </Link>
                        <Link href="/#services" className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-650 hover:text-blue-600 hover:bg-white rounded-full transition-all duration-200 hover:shadow-xs">
                            Nos Services
                        </Link>
                        <Link href="/#testimonials" className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-650 hover:text-blue-600 hover:bg-white rounded-full transition-all duration-200 hover:shadow-xs">
                            Avis
                        </Link>
                        <Link href="/#faq" className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-650 hover:text-blue-600 hover:bg-white rounded-full transition-all duration-200 hover:shadow-xs">
                            FAQ
                        </Link>
                    </nav>

                    {/* Actions à droite */}
                    <div className="flex items-center gap-3">
                        {!mounted ? (
                            <div className="flex items-center gap-3">
                                <div className="w-[80px] h-[36px]" />
                                <div className="w-[110px] h-[40px] rounded-xl bg-slate-200 animate-pulse" />
                            </div>
                        ) : isConnected ? (
                            <Link
                                href="/dashboard"
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-650 hover:to-blue-750 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer hover:scale-105 active:scale-95"
                            >
                                Mon Espace
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-blue-600 transition-colors cursor-pointer">
                                    Connexion
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                                >
                                    S&apos;inscrire
                                </Link>
                            </>
                        )}

                        {/* Menu Hamburger réservé UNIQUEMENT aux mobiles (<768px) */}
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-slate-700 hover:text-slate-950 cursor-pointer rounded-xl bg-slate-100/80 border border-slate-200/80"
                            aria-label="Menu mobile"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Menu Mobile Coulissant */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl overflow-hidden"
                        >
                            <nav className="flex flex-col p-4 gap-1 text-xs font-black uppercase tracking-widest">
                                <Link href="/#about" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">Qui Sommes-Nous</Link>
                                <Link href="/certifications" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-blue-600 bg-blue-50 rounded-xl font-black">Certifications</Link>
                                <Link href="/#services" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">Nos Services</Link>
                                <Link href="/#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">Avis</Link>
                                <Link href="/#faq" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl">FAQ</Link>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* HEADER HERO SECTION */}
            <section className="relative bg-white border-b border-slate-200/60 py-12 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center space-y-3 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Catalogue Officiel des Examens</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight">
                        Certifications & Préparations d&apos;Examen
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-semibold leading-relaxed">
                        Explorez nos programmes officiels de préparation Cloud & Cybersécurité et testez vos connaissances sur nos examens blancs interactifs.
                    </p>
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
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">Niveau :</span>
                            <div className="flex items-center gap-1.5 overflow-x-auto">
                                {['TOUS', 'DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setSelectedLevel(level)}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                            selectedLevel === level
                                                ? 'bg-slate-950 text-white shadow-sm'
                                                : 'bg-slate-100 text-slate-650 hover:bg-slate-200'
                                        }`}
                                    >
                                        {level === 'TOUS' ? 'Tous' : level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Onglets des Éditeurs (Microsoft, PECB, AWS...) */}
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">Éditeur :</span>
                        {providers.map((provider) => (
                            <button
                                key={provider}
                                onClick={() => setSelectedProvider(provider)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    selectedProvider === provider
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                        : 'bg-slate-50 border border-slate-200/80 text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                {provider}
                            </button>
                        ))}
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredCertifications.map((cert) => (
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
                                    {cert.niveau || 'DEBUTANT'}
                                </span>
                                <h3 className="text-xs font-extrabold text-slate-950 leading-snug line-clamp-2 min-h-[2.5em]">
                                    {cert.nom}
                                </h3>
                                <p className="text-[9px] text-slate-400 font-bold mt-1">{cert.fournisseur?.nom}</p>
                                <button onClick={(e) => { e.stopPropagation(); setSelectedCertModal(cert); }}
                                    className="mt-3 px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition-all cursor-pointer">
                                    Voir
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* MODAL DÉTAIL CERTIFICATION */}
                <AnimatePresence>
                    {selectedCertModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 overflow-y-auto"
                            onClick={(e) => { if (e.target === e.currentTarget) setSelectedCertModal(null); }}>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
                                {selectedCertModal && <CertDetailModal cert={selectedCertModal} onClose={() => setSelectedCertModal(null)} onPractice={handlePracticeClick} isTargeted={targetCertIds.includes(String(selectedCertModal.id))} onToggleTarget={isConnected ? () => toggleTargetCertification(String(selectedCertModal.id)) : undefined} />}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* FOOTER */}
            <footer className="w-full border-t border-slate-200/80 bg-white py-6 text-center text-xs font-bold text-slate-400">
                © {new Date().getFullYear()} Ethical Data Security. Tous droits réservés.
            </footer>
        </div>
    );
}

/* ───── MODAL DÉTAIL CERTIFICATION ───── */
function CertDetailModal({ cert, onClose, onPractice, isTargeted, onToggleTarget }: { cert: any; onClose: () => void; onPractice: (cert: any) => void; isTargeted?: boolean; onToggleTarget?: () => void }) {
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
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-black border ${getLevelBadgeStyle(cert.niveau)}`}>{cert.niveau || 'DEBUTANT'}</span>
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
                        <p className="text-xs font-extrabold text-slate-900 mt-0.5">{cert.niveau || 'Débutant'}</p>
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
                            {cert.objectifs.map((obj: string, i: number) => (
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
                            {cert.prerequis.map((pr: string, i: number) => (
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
                <button onClick={() => { onClose(); onPractice(cert); }}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]">
                    <Play className="w-3.5 h-3.5 fill-white text-white" />
                    Commencer la formation
                </button>
                {onToggleTarget ? (
                    <button onClick={() => { onClose(); onToggleTarget(); }}
                        className={`w-full py-2 border font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                            isTargeted
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300'
                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300'
                        }`}>
                        {isTargeted ? <CheckCircle2 className="w-3 h-3" /> : <Target className="w-3 h-3" />}
                        {isTargeted ? 'Dans mes objectifs' : 'Viser cet examen'}
                    </button>
                ) : (
                    <button onClick={() => { onClose(); window.location.href = '/login'; }}
                        className="w-full py-2 border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]">
                        <Target className="w-3 h-3" />
                        Viser cet examen
                    </button>
                )}
            </div>
        </div>
    );
}
