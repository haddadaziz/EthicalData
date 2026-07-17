"use client";

import React, { useState } from 'react';
import { ChevronDown, Search, MessageCircle, BookOpen, Award, Activity, HelpCircle } from '@/components/icons';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
    {
        category: 'Inscription & Compte',
        icon: BookOpen,
        questions: [
            { q: 'Comment créer un compte ?', r: 'Cliquez sur "S\'inscrire" en haut de page, remplissez le formulaire avec vos informations (nom, email, mot de passe) et validez. Vous recevrez un email de confirmation.' },
            { q: 'Puis-je modifier mes informations personnelles ?', r: 'Oui, depuis votre Dashboard, allez dans "Profil" pour modifier votre nom, email, avatar ou mot de passe.' },
            { q: 'J\'ai oublié mon mot de passe, que faire ?', r: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Saisissez votre email et vous recevrez un lien de réinitialisation valable 1 heure.' },
        ],
    },
    {
        category: 'Certifications & Formation',
        icon: Award,
        questions: [
            { q: 'Quelles certifications sont disponibles ?', r: 'Nous proposons des formations pour Microsoft Azure (AZ-900, AZ-104...), AWS (CLF-C02, SAA-C03...), Cisco (CCNA), CompTIA (Security+), PECB (ISO 27001), Palo Alto Networks, Fortinet et bien d\'autres.' },
            { q: 'Comment s\'inscrire à une certification ?', r: 'Depuis le catalogue, cliquez sur une certification pour voir le détail. Vous pouvez vous inscrire directement depuis la page de détail avec le bouton "S\'inscrire".' },
            { q: 'Qu\'est-ce que le Readiness Score ?', r: 'Le Readiness Score est un indicateur sur 100 qui mesure votre niveau de préparation pour un examen. Il est calculé à partir de vos résultats aux simulations, de votre progression dans les cours et de votre historique.' },
            { q: 'Puisz passer une simulation plusieurs fois ?', r: 'Oui, vous pouvez refaire les simulations autant de fois que vous le souhaitez. Chaque tentative est enregistrée dans votre historique pour suivre votre progression.' },
        ],
    },
    {
        category: 'Plateforme & Technique',
        icon: MessageCircle,
        questions: [
            { q: 'Comment fonctionne la correction par IA ?', r: 'Pour les questions ouvertes, notre IA analyse votre réponse, la compare au corrigé officiel et vous attribue un score avec des commentaires personnalisés. L\'IA utilise Gemini 2.5 Flash par défaut.' },
            { q: 'Puis-je télécharger les ressources ?', r: 'Oui, depuis la section "Téléchargements" de votre Dashboard, vous pouvez accéder à vos cours et ressources. Un quota quotidien peut s\'appliquer selon la configuration.' },
            { q: 'Comment réserver un rendez-vous avec un formateur ?', r: 'Depuis la section "Rendez-vous" de votre Dashboard, choisissez un créneau disponible et le type de séance (Coaching, Préparation Examen, Orientation, Bilan Carrière).' },
            { q: 'L\'application est-elle responsive ?', r: 'Oui, la plateforme est entièrement responsive et fonctionne sur tous les supports : ordinateur, tablette et mobile.' },
        ],
    },
    {
        category: 'Paiement',
        icon: Activity,
        questions: [
            { q: 'Combien coûte l\'accès à la plateforme ?', r: 'Pour le moment, l\'accès à la plateforme est en phase MVP. Les tarifs seront communiqués ultérieurement. Contactez-nous pour plus d\'informations.' },
            { q: 'Y a-t-il des frais pour les simulations ?', r: 'Les simulations d\'entraînement sont incluses dans votre accès à la plateforme. Aucun frais supplémentaire n\'est facturé pour les passer.' },
        ],
    },
    {
        category: 'Communauté',
        icon: HelpCircle,
        questions: [
            { q: 'Comment participer au forum ?', r: 'Connectez-vous et allez dans la section "Communauté" de votre Dashboard. Vous pouvez créer des sujets, répondre aux discussions et interagir avec les autres apprenants.' },
            { q: 'Puis-je signaler un abus ?', r: 'Oui, chaque sujet et commentaire peut être signalé. Les signalements sont modérés par notre équipe administrative.' },
        ],
    },
];

export default function FaqPage() {
    const [search, setSearch] = useState('');
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const allQuestions = faqData.flatMap((cat) => cat.questions.map((q, i) => ({ ...q, cat: cat.category, globalIdx: i })));
    const filtered = search
        ? allQuestions.filter((q) => q.q.toLowerCase().includes(search.toLowerCase()) || q.r.toLowerCase().includes(search.toLowerCase()))
        : null;
    return (
        <main className="min-h-screen bg-[#020617] text-white selection:bg-blue-600 selection:text-white relative overflow-hidden">
            <Navbar />

            <div className="pt-32 pb-20 px-4 md:px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-10">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Foire Aux Questions</h1>
                        <p className="text-slate-400 font-medium">Tout ce que vous devez savoir sur Ethical Data Security</p>
                        <div className="relative max-w-lg mx-auto mt-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une question..." className="w-full pl-11 pr-4 py-3 bg-[#080d1a] border border-slate-800 focus:border-blue-600 focus:bg-[#080d1a] text-white placeholder-slate-500 rounded-xl text-xs font-semibold outline-none transition-all shadow-sm" />
                        </div>
                    </div>

                    {filtered ? (
                        <div className="space-y-3">
                            {filtered.length === 0 ? (
                                <p className="text-center text-slate-400 font-medium py-10">Aucun résultat trouvé pour "{search}"</p>
                            ) : (
                                filtered.map((item, i) => (
                                    <div key={i} className="bg-[#080d1a]/85 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-slate-700 transition-colors">
                                        <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-[#0a1224] transition-colors">
                                            <span className="text-sm font-bold text-slate-100 pr-4">{item.q}</span>
                                            <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {openIndex === i && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                    <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800 pt-4">{item.r}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        faqData.map((cat, ci) => (
                            <div key={ci} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                                        <cat.icon className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg font-black text-white">{cat.category}</h2>
                                </div>
                                <div className="space-y-2">
                                    {cat.questions.map((item, qi) => (
                                        <div key={qi} className="bg-[#080d1a]/85 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-slate-700 transition-colors">
                                            <button onClick={() => setOpenIndex(openIndex === ci * 100 + qi ? null : ci * 100 + qi)} className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-[#0a1224] transition-colors">
                                                <span className="text-sm font-bold text-slate-100 pr-4">{item.q}</span>
                                                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openIndex === ci * 100 + qi ? 'rotate-180' : ''}`} />
                                            </button>
                                            <AnimatePresence>
                                                {openIndex === ci * 100 + qi && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                        <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800 pt-4">{item.r}</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
