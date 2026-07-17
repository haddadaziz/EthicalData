"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Users, Award, Eye, Activity } from '@/components/icons';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';

const stats = [
    { label: 'Certifications', value: '50+' },
    { label: 'Apprenants', value: '500+' },
    { label: 'Formateurs', value: '25+' },
    { label: 'Années d\'expérience', value: '10+' },
];

const values = [
    { icon: ShieldCheck, title: 'Excellence', desc: 'Des programmes conçus par des experts certifiés, alignés sur les référentiels officiels.' },
    { icon: Target, title: 'Pédagogie active', desc: 'Une approche pratique avec des mises en situation réelles et des simulations chronométrées.' },
    { icon: Users, title: 'Accompagnement', desc: 'Un suivi personnalisé avec des formateurs dédiés pour maximiser votre réussite.' },
    { icon: Eye, title: 'Innovation', desc: 'L\'intelligence artificielle au service de votre apprentissage pour une correction intelligente.' },
    { icon: Activity, title: 'Progression', desc: 'Un dashboard complet pour suivre votre readiness score et votre évolution en temps réel.' },
    { icon: Award, title: 'Certification', desc: 'Préparez-vous efficacement aux examens les plus reconnus du marché (Microsoft, AWS, CISCO...).' },
];

export default function AboutPage() {
    const [mounted, setMounted] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('access_token');
        if (token) {
            setIsConnected(true);
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setIsAdmin(payload.roles?.includes('ADMIN') || payload.roles?.includes('SUPER_ADMIN'));
            } catch { }
        }
        document.title = "À propos - Ethical Data Security";
    }, []);

    return (
        <main className="min-h-screen bg-[#020617] text-white selection:bg-blue-600 selection:text-white relative overflow-hidden">
            <Navbar mounted={mounted} isConnected={isConnected} isAdmin={isAdmin} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

            <div className="pt-32 pb-20 px-4 md:px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Qui Sommes-Nous</h1>
                        <p className="text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed">
                            <strong className="text-white">Ethical Data Security</strong> est un centre de formation agréé spécialisé dans 
                            la cybersécurité, le cloud computing et les infrastructures réseau. Depuis plus de 10 ans, 
                            nous accompagnons les professionnels et les entreprises dans leur montée en compétences 
                            sur les technologies les plus critiques du marché.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {stats.map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-[#080d1a]/85 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 text-center shadow-sm">
                                <p className="text-3xl md:text-4xl font-black text-blue-500">{s.value}</p>
                                <p className="text-xs font-bold text-slate-400 mt-1">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-white tracking-tight text-center">Nos Valeurs</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {values.map((v, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-[#080d1a]/85 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 hover:border-slate-700 transition-colors">
                                    <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                                        <v.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-100">{v.title}</h3>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{v.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#080d1a]/85 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 md:p-10 shadow-sm space-y-6">
                        <h2 className="text-2xl font-black text-white tracking-tight">Notre Mission</h2>
                        <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                            <p>
                                Dans un monde où les menaces cyber évoluent chaque jour, la formation continue est la meilleure défense. 
                                Notre mission est de <strong className="text-slate-100">rendre l'expertise en cybersécurité accessible à tous</strong>, 
                                grâce à une plateforme d'apprentissage innovante alliant pédagogie traditionnelle et intelligence artificielle.
                            </p>
                            <p>
                                Nous croyons en une approche <strong className="text-slate-100">pratique et orientée examen</strong> : 
                                chaque programme est structuré pour vous préparer efficacement aux certifications les plus exigeantes 
                                (Microsoft Azure, AWS, CISCO, CompTIA, PECB, Palo Alto Networks, Fortinet...).
                            </p>
                            <p>
                                Avec notre dashboard intelligent, votre readiness score, et nos simulations chronométrées corrigées par IA, 
                                vous savez exactement où vous en êtes et ce qu'il vous reste à travailler pour réussir.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
