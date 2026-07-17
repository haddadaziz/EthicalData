"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Compass, Send, Clock } from '@/components/icons';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { apiFetch } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export default function ContactPage() {
    const { showToast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [formData, setFormData] = useState({ nom: '', email: '', sujet: '', message: '' });
    const [sending, setSending] = useState(false);

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
        document.title = "Contact - Ethical Data Security";
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            await apiFetch('/contact', {
                method: 'POST',
                body: formData,
            });
            showToast('Votre message a été envoyé avec succès.', 'success');
            setFormData({ nom: '', email: '', sujet: '', message: '' });
        } catch (err: any) {
            showToast(err.message || 'Erreur lors de l\'envoi.', 'error');
        } finally {
            setSending(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#020617] text-white selection:bg-blue-600 selection:text-white relative overflow-hidden">
            <Navbar mounted={mounted} isConnected={isConnected} isAdmin={isAdmin} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

            <div className="pt-32 pb-20 px-4 md:px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Contactez-nous</h1>
                        <p className="text-slate-400 font-medium max-w-2xl mx-auto">
                            Une question, un projet, une demande de partenariat ? Notre équipe est à votre écoute.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="bg-[#080d1a]/85 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Nom complet *</label>
                                        <input type="text" required value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} placeholder="Votre nom" className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-[#020617] text-white placeholder-slate-500 rounded-xl text-xs font-semibold outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Email *</label>
                                        <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="vous@exemple.com" className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-[#020617] text-white placeholder-slate-500 rounded-xl text-xs font-semibold outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Sujet *</label>
                                    <input type="text" required value={formData.sujet} onChange={(e) => setFormData({ ...formData, sujet: e.target.value })} placeholder="Objet de votre message" className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-[#020617] text-white placeholder-slate-500 rounded-xl text-xs font-semibold outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Message *</label>
                                    <textarea rows={6} required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Décrivez votre demande en détail..." className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 focus:bg-[#020617] text-white placeholder-slate-500 rounded-xl text-xs font-semibold outline-none transition-all resize-none" />
                                </div>
                                <button type="submit" disabled={sending} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-md">
                                    {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                                    <span>Envoyer le message</span>
                                </button>
                            </form>
                        </div>

                        <div className="space-y-5">
                            {[
                                { icon: Mail, label: 'Email', value: 'contact@ethicaldatasecurity.ma', href: 'mailto:contact@ethicaldatasecurity.ma' },
                                { icon: Phone, label: 'Téléphone', value: '+212 664 244 343', href: 'tel:+212664244343' },
                                { icon: Compass, label: 'Adresse', value: 'Bureau 305, Technopark Casablanca' },
                                { icon: Clock, label: 'Horaires', value: 'Lun-Ven : 9h00 - 18h00' },
                            ].map((item, i) => (
                                <div key={i} className="bg-[#080d1a]/85 backdrop-blur-sm border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider">{item.label}</h3>
                                    {item.href ? (
                                        <a href={item.href} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">{item.value}</a>
                                    ) : (
                                        <p className="text-sm font-semibold text-slate-300">{item.value}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
