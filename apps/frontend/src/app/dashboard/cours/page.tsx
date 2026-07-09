"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Clock, Users, Award, ChevronRight, Search, Play, CheckCircle, FileText } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface Cours {
    id: string;
    titre: string;
    description?: string;
    imageUrl?: string;
    dureeEstimee?: number;
    datePublication: string;
    certification: {
        nom: string;
        codeExamen?: string;
        fournisseur: { nom: string };
    };
    formateur?: {
        prenom: string;
        nom: string;
        avatar?: string;
    };
    modules: any[];
    _count?: { modules: number; inscriptions: number };
}

interface Inscription {
    id: string;
    progression: number;
    dateInscription: string;
    dateFin: string | null;
    cours: Cours;
}

type TabId = 'explorer' | 'mes-cours' | 'termines';

export default function LearnerCoursesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [cours, setCours] = useState<Cours[]>([]);
    const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabId>('explorer');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'mes-cours' || tab === 'termines') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserRoles(payload.roles || []);
            } catch {}
        }
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [coursData, inscData] = await Promise.all([
                    apiFetch('/cours'),
                    apiFetch('/cours/mes-inscriptions').catch((err) => {
                        console.error('Erreur API mes-inscriptions:', err);
                        return [];
                    }),
                ]);
                setCours(Array.isArray(coursData) ? coursData : []);
                setInscriptions(Array.isArray(inscData) ? inscData : []);
            } catch (err: any) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, [userRoles]);

    const inscritsIds = new Set(inscriptions.map(i => i.cours?.id));
    const coursTermines = inscriptions.filter(i => i.progression >= 100);
    const coursEnCours = inscriptions.filter(i => i.progression < 100);
    const coursDisponibles = cours.filter(c => !inscritsIds.has(c.id));

    const filteredDisponibles = coursDisponibles.filter(c =>
        !searchTerm.trim() || c.titre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEnCours = coursEnCours.filter(i =>
        !searchTerm.trim() || i.cours.titre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTermines = coursTermines.filter(i =>
        !searchTerm.trim() || i.cours.titre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-600 gap-4">
                <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement des cours...</p>
            </div>
        );
    }

    const tabs: { id: TabId; label: string; count: number }[] = [
        { id: 'explorer', label: 'Explorer', count: filteredDisponibles.length },
        { id: 'mes-cours', label: 'Mes cours', count: filteredEnCours.length },
        { id: 'termines', label: 'Terminés', count: filteredTermines.length },
    ];

    return (
        <div className="space-y-8 text-slate-800 text-left max-w-7xl mx-auto">

            {/* Barre de recherche */}
            <div className="relative max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Search className="w-4 h-4" />
                </span>
                <input type="text" value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un cours..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 focus:border-blue-600 rounded-xl text-sm outline-none font-semibold" />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-0">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 ${activeTab === tab.id
                            ? 'border-blue-600 text-slate-950'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}>
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Explorer */}
            {activeTab === 'explorer' && (
                <AnimatePresence mode="wait">
                    {filteredDisponibles.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl text-slate-500 font-semibold">
                            {searchTerm ? 'Aucun cours trouvé.' : 'Aucun cours disponible pour le moment.'}
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDisponibles.map(c => (
                                <div key={c.id} className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col">
                                    {/* Image */}
                                    <div className="relative aspect-[750/422] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                        {c.imageUrl ? (
                                            <img src={c.imageUrl} alt={c.titre}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen className="w-10 h-10 text-slate-300" />
                                            </div>
                                        )}
                                        <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-slate-900/70 text-white text-[8px] font-extrabold rounded-md uppercase tracking-wider backdrop-blur-sm">
                                            {c.certification?.codeExamen || c.certification?.nom || 'Certification'}
                                        </span>
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                                {c.certification?.fournisseur?.nom || 'Général'}
                                            </span>
                                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                                {c._count?.modules || c.modules?.length || 0} modules
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {c.titre}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                            {c.description}
                                        </p>
                                        <div className="flex items-center gap-3 mt-auto pt-2 text-[10px] text-slate-400 font-bold">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {c.dureeEstimee || '?'} min
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {c._count?.inscriptions || 0} inscrits
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold pt-1">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-black shrink-0">
                                                {c.formateur?.avatar ? (
                                                    <img src={c.formateur.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    c.formateur?.prenom?.[0] || 'F'
                                                )}
                                            </div>
                                            <span className="truncate">Par {c.formateur?.prenom || 'Un formateur'}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 p-3">
                                        <button onClick={() => router.push(`/dashboard/cours/${c.id}?from=explorer`)}
                                            className="w-full px-3 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                                            <Play className="w-3.5 h-3.5" /> Voir le cours
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Mes cours */}
            {activeTab === 'mes-cours' && (
                <AnimatePresence mode="wait">
                    {filteredEnCours.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl text-slate-500 font-semibold">
                            {searchTerm ? 'Aucun cours trouvé.' : 'Vous n\'êtes inscrit à aucun cours pour le moment.'}
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEnCours.map(insc => {
                                const c = insc.cours;
                                return (
                                    <div key={insc.id} className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col">
                                        <div className="relative aspect-[750/422] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                            {c.imageUrl ? (
                                                <img src={c.imageUrl} alt={c.titre}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="w-10 h-10 text-slate-300" />
                                                </div>
                                            )}
                                            <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-slate-900/70 text-white text-[8px] font-extrabold rounded-md uppercase tracking-wider backdrop-blur-sm">
                                                {c.certification?.codeExamen || c.certification?.nom || 'Certification'}
                                            </span>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col gap-2">
                                            <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {c.titre}
                                            </h3>
                                            <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                                {c.description}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold pt-1">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-black shrink-0">
                                                {c.formateur?.avatar ? (
                                                    <img src={c.formateur.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    c.formateur?.prenom?.[0] || 'F'
                                                )}
                                            </div>
                                            <span className="truncate">Par {c.formateur?.prenom || 'Un formateur'}</span>
                                        </div>
                                        <div className="mt-auto pt-2 space-y-2">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                                <span>Progression</span>
                                                <span>{insc.progression}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${insc.progression}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-100 p-3">
                                            <button onClick={() => router.push(`/dashboard/cours/${c.id}/apprendre?from=mes-cours`)}
                                                className="w-full px-3 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                                                Continuer le cours <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Terminés */}
            {activeTab === 'termines' && (
                <AnimatePresence mode="wait">
                    {filteredTermines.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl text-slate-500 font-semibold">
                            Aucun cours terminé pour le moment.
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTermines.map(insc => {
                                const c = insc.cours;
                                return (
                                    <div key={insc.id} className="group bg-white border border-emerald-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col">
                                        <div className="relative aspect-[750/422] bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                            {c.imageUrl ? (
                                                <img src={c.imageUrl} alt={c.titre}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <CheckCircle className="w-10 h-10 text-emerald-300" />
                                                </div>
                                            )}
                                            <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-600/90 text-white text-[8px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Terminé
                                            </span>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col gap-2">
                                            <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                                {c.titre}
                                            </h3>
                                            <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                                {c.description}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-black shrink-0">
                                                    {c.formateur?.avatar ? (
                                                        <img src={c.formateur.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        c.formateur?.prenom?.[0] || 'F'
                                                    )}
                                                </div>
                                                <span className="truncate">Par {c.formateur?.prenom || 'Un formateur'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold pt-1">
                                                <FileText className="w-3 h-3" />
                                                <span>{c._count?.modules || c.modules?.length || 0} modules</span>
                                            </div>
                                        </div>
                                        <div className="border-t border-slate-100 p-3">
                                            <button onClick={() => router.push(`/dashboard/cours/${c.id}/apprendre?from=termines`)}
                                                className="w-full px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                                                <BookOpen className="w-3.5 h-3.5" /> Revoir le cours
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}
