"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, AlertTriangle, X, BookOpen } from '@/components/icons';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';

const sections = [
    {
        icon: FileText,
        title: '1. Objet',
        content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Ethical Data Security, accessible depuis le site ethical-data.vercel.app.
En créant un compte et en utilisant nos services, vous acceptez sans réserve l'intégralité des présentes conditions.`,
    },
    {
        icon: CheckCircle,
        title: '2. Inscription & Compte',
        content: `• L'inscription est réservée aux personnes majeures capables juridiquement
• Vous devez fournir des informations exactes et à jour
• Vous êtes seul responsable de la confidentialité de vos identifiants
• Un seul compte par personne est autorisé
• Le partage de compte est strictement interdit et peut entraîner la suspension de votre accès`,
    },
    {
        icon: AlertTriangle,
        title: '3. Utilisation du Service',
        content: `La plateforme Ethical Data Security propose :
• Des programmes de formation aux certifications IT (Cloud, Cybersécurité, Réseaux)
• Des simulations d'examen chronométrées avec correction par IA
• Un suivi personnalisé avec dashboard et readiness score
• Des ressources pédagogiques téléchargeables (PDF, slides, vidéos)
• Un forum d'entraide communautaire
• La réservation de séances de coaching avec des formateurs experts

L'utilisation de la plateforme doit être conforme à sa destination et respecter les droits des autres utilisateurs.`,
    },
    {
        icon: X,
        title: '4. Obligations de l\'Utilisateur',
        content: `Il est interdit de :
• Utiliser la plateforme à des fins frauduleuses ou illicites
• Tenter d'accéder aux comptes d'autres utilisateurs
• Publier du contenu injurieux, diffamatoire ou contraire aux bonnes mœurs sur le forum
• Utiliser des robots ou scripts pour automatiser des actions
• Contourner les mesures de sécurité de la plateforme
• Partager, revendre ou diffuser les ressources pédagogiques protégées`,
    },
    {
        icon: BookOpen,
        title: '5. Propriété Intellectuelle',
        content: `L'ensemble du contenu de la plateforme (textes, images, vidéos, questionnaires, supports de cours) est la propriété exclusive d'Ethical Data Security ou de ses partenaires. Toute reproduction, distribution ou exploitation sans autorisation est interdite et peut faire l'objet de poursuites.

Les marques et logos des fournisseurs de certification (Microsoft, AWS, Cisco, CompTIA, etc.) sont la propriété de leurs détenteurs respectifs.`,
    },
    {
        icon: FileText,
        title: '6. Responsabilité',
        content: `Ethical Data Security s'engage à fournir un service de qualité et à maintenir la plateforme accessible. Cependant :
• Nous ne pouvons garantir une disponibilité ininterrompue du service
• Nous ne sommes pas responsables des résultats obtenus aux examens de certification officiels
• L'utilisation de l'IA pour la correction est fournie à titre indicatif et ne constitue pas une garantie de réussite à l'examen
• Notre responsabilité ne saurait être engagée en cas de force majeure ou de fait d'un tiers`,
    },
    {
        icon: AlertTriangle,
        title: '7. Suspension & Résiliation',
        content: `Nous nous réservons le droit de suspendre ou résilier votre accès à la plateforme en cas de :
• Non-respect des présentes CGU
• Utilisation frauduleuse de la plateforme
• Inactivité prolongée (plus de 12 mois)
• Demande de votre part

En cas de résiliation, vos données seront conservées conformément à notre politique de confidentialité.`,
    },
    {
        icon: FileText,
        title: '8. Modification des CGU',
        content: `Nous nous réservons le droit de modifier les présentes conditions à tout moment. Les modifications vous seront notifiées par email ou lors de votre prochaine connexion. L'utilisation continue de la plateforme après modification vaut acceptation des nouvelles conditions.`,
    },
];

export default function CguPage() {
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
        document.title = "Conditions Générales d'Utilisation - Ethical Data Security";
    }, []);

    return (
        <main className="min-h-screen bg-[#020617] text-white selection:bg-blue-600 selection:text-white relative overflow-hidden">
            <Navbar mounted={mounted} isConnected={isConnected} isAdmin={isAdmin} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

            <div className="pt-32 pb-20 px-4 md:px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Conditions Générales d&apos;Utilisation</h1>
                        <p className="text-slate-400 font-medium">Dernière mise à jour : Juillet 2026</p>
                    </div>

                    <div className="space-y-6">
                        {sections.map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-[#080d1a]/85 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4 hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                                        <s.icon className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-base font-black text-slate-100">{s.title}</h2>
                                </div>
                                <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
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
