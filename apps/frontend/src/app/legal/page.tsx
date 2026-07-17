"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Lock, Eye } from '@/components/icons';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const sections = [
    {
        icon: Shield,
        title: 'Responsable du Traitement',
        content: `Ethical Data Security est une société de formation basée au Maroc.
Adresse : Bureau 305, Technopark, Casablanca, Maroc
Email : contact@ethicaldatasecurity.ma
Tél : +212 664 244 343`,
    },
    {
        icon: FileText,
        title: 'Données Collectées',
        content: `Nous collectons les données suivantes dans le cadre de l'utilisation de notre plateforme :
• Données d'identification : nom, prénom, adresse email, numéro de téléphone
• Données de connexion : identifiants de connexion, logs d'accès, adresse IP
• Données de progression : historique des simulations, scores, readiness score
• Données de navigation : pages consultées, durée des sessions
Ces données sont collectées uniquement dans le but de fournir et améliorer nos services de formation.`,
    },
    {
        icon: Lock,
        title: 'Base Légale du Traitement',
        content: `Le traitement de vos données personnelles repose sur :
• L'exécution du contrat de formation auquel vous avez souscrit
• Votre consentement explicite pour les cookies et données de navigation
• Notre intérêt légitime à améliorer notre plateforme et détecter les fraudes
• Le respect de nos obligations légales et réglementaires`,
    },
    {
        icon: Eye,
        title: 'Vos Droits',
        content: `Conformément à la réglementation applicable (RGPD et loi marocaine 09-08), vous disposez des droits suivants :
• Droit d'accès : obtenir une copie de vos données personnelles
• Droit de rectification : corriger vos données inexactes
• Droit à l'effacement : demander la suppression de vos données
• Droit à la limitation du traitement
• Droit à la portabilité de vos données
• Droit d'opposition au traitement

Pour exercer vos droits, contactez-nous à : contact@ethicaldatasecurity.ma`,
    },
    {
        icon: Shield,
        title: 'Sécurité des Données',
        content: `Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées pour garantir la sécurité de vos données personnelles :
• Chiffrement des données en transit (TLS 1.3) et au repos
• Authentification forte (JWT avec tokens sécurisés)
• Contrôle d'accès basé sur les rôles (RBAC)
• Monitoring continu et détection d'intrusions
• Sauvegardes régulières et plan de reprise d'activité`,
    },
    {
        icon: FileText,
        title: 'Cookies',
        content: `Notre plateforme utilise des cookies strictement nécessaires à son fonctionnement (authentification, session utilisateur). 
Nous utilisons également des cookies analytiques pour améliorer votre expérience. 
Vous pouvez paramétrer vos préférences de cookies à tout moment depuis les paramètres de votre navigateur.`,
    },
];

export default function LegalPage() {
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
        document.title = "Mentions Légales & Confidentialité - Ethical Data Security";
    }, []);

    return (
        <main className="min-h-screen bg-slate-50 selection:bg-blue-600 selection:text-white">
            <Navbar mounted={mounted} isConnected={isConnected} isAdmin={isAdmin} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

            <div className="pt-32 pb-20 px-4 md:px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight">Mentions Légales & Confidentialité</h1>
                        <p className="text-slate-500 font-medium">Dernière mise à jour : Juillet 2026</p>
                    </div>

                    <div className="space-y-6">
                        {sections.map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                        <s.icon className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-base font-black text-slate-900">{s.title}</h2>
                                </div>
                                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                    {s.content}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
