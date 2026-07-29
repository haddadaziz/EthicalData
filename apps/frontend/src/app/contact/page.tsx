'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, RefreshCw, Calendar, Clock, CheckCircle, ShieldCheck, User, Building, ChevronRight, Award } from '@/components/icons';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const MOTIFS = [
  "Besoin d'une formation ?",
  "Besoin de passer un examen ?",
  "Consultation",
  "Pentest ou audit de sécurité",
  "Mise en conformité ISO 27001",
  "Intégration ou configuration de solution microsoft, Veeam Backup..",
  "Autres.."
];

const CONSULTANT_CATEGORIES = [
  {
    id: "commercial",
    title: "Commercial (5 consultants)",
    subtitle: "Premier contact, devis et présentation des offres IT & Formations",
    badge: "Commercial & Offres",
    consultants: [
      {
        id: "c1",
        name: "Amina El Amrani",
        role: "Commercial Senior — Solutions IT & Formations",
        photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=75",
        duration: "30 min",
        desc: "Accompagnement personnalisé pour le choix des cursus certifiants et contrats de maintenance."
      },
      {
        id: "c2",
        name: "Youssef Benali",
        role: "Chargé de Compte — Grands Comptes & Enterprise",
        photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=75",
        duration: "45 min",
        desc: "Gestion de projets d'envergure et contrats cadres sur-mesure pour grandes structures."
      },
      {
        id: "c3",
        name: "Sarah Mansouri",
        role: "Conseillère Client — Audit & Devis Rapides",
        photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=75",
        duration: "30 min",
        desc: "Analyse de vos besoins urgents et chiffrage express en moins de 24h."
      },
      {
        id: "c4",
        name: "Karim Tazi",
        role: "Responsable Partenariats & Vouchers Pearson/PECB",
        photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=75",
        duration: "30 min",
        desc: "Conseil pour l'achat de vauchers officiels et packs d'examens à tarifs préférentiels."
      },
      {
        id: "c5",
        name: "Nadia Chraibi",
        role: "Chargée d'Affaires — PME & Solutions IT",
        photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=250&q=75",
        duration: "45 min",
        desc: "Optimisation de votre parc informatique et solutions SaaS (Microsoft 365, Odoo, Dolibarr)."
      }
    ]
  },
  {
    id: "tech",
    title: "Architecture & Sécurité (3 consultants)",
    subtitle: "Expertise technique avancée, audit de sécurité, pentest et architectures cloud",
    badge: "Tech & Sécurité",
    consultants: [
      {
        id: "c6",
        name: "Dr. Tariq Berrada",
        role: "Expert Cybersécurité — Pentest, Audit & ISO 27001",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=75",
        duration: "60 min",
        desc: "Spécialiste dédié à l'évaluation des vulnérabilités, tests d'intrusion et conformité."
      },
      {
        id: "c7",
        name: "Mehdi Kabbaj",
        role: "Architecte Infrastructure & Virtualisation (vSphere/Hyper-V)",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=75",
        duration: "45 min",
        desc: "Conception et optimisation de datacenters hautement disponibles et hyperconvergés."
      },
      {
        id: "c8",
        name: "Leila Naciri",
        role: "Architecte Cloud & Hybrid Solutions (AWS/Azure/GCP)",
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=75",
        duration: "45 min",
        desc: "Stratégies de migration cloud, Disaster Recovery (Veeam/SRM) et conteneurisation."
      }
    ]
  }
];

export default function ContactPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'form' | 'booking'>('form');

  // Form State (Legacy Refonte)
  const [loading, setLoading] = useState(false);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [heureContact, setHeureContact] = useState('12:00 PM');
  const [dateContact, setDateContact] = useState('');
  const [selectedMotifs, setSelectedMotifs] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);

  // Booking Flow State (3 Steps)
  const [bookingCategory, setBookingCategory] = useState<'commercial' | 'tech'>('commercial');
  const [selectedConsultant, setSelectedConsultant] = useState<any>(CONSULTANT_CATEGORIES[0].consultants[0]);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    document.title = "Contact & Prise de Rendez-vous — Ethical Data Security";
  }, []);

  const handleMotifToggle = (motif: string) => {
    setSelectedMotifs(prev =>
      prev.includes(motif) ? prev.filter(m => m !== motif) : [...prev, motif]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaChecked) {
      showToast("Veuillez cocher la case reCAPTCHA de vérification.", "error");
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      showToast("Votre message a été transmis avec succès ! Nos équipes vous recontacteront sous 24h.", "success");
      setPrenom('');
      setNom('');
      setEmail('');
      setTelephone('');
      setMessage('');
      setSelectedMotifs([]);
      setCaptchaChecked(false);
    }, 1200);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) {
      showToast("Veuillez sélectionner une date et un créneau horaire.", "error");
      return;
    }
    setBookingSuccess(true);
    showToast(`Rendez-vous confirmé avec ${selectedConsultant.name} le ${bookingDate} à ${bookingTime} !`, "success");
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <Navbar />

      {/* HERO HEADER */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 text-center overflow-hidden bg-[#020617]">
        {/* Background Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
          <div
            className="w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }}
          />
          <span className="absolute text-6xl sm:text-8xl md:text-9xl font-black text-slate-800/10 tracking-tighter uppercase select-none whitespace-nowrap">
            ETHICAL DATA SECURITY
          </span>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-black uppercase tracking-widest">
            <span>ETHICAL DATA SECURITY — l&apos;essentiel en un clic !</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
              Contactez-Nous
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Une question sur nos services, un projet matériel IT ou un besoin d&apos;accompagnement ? Envoyez-nous un message ou réservez directement un créneau avec l&apos;un de nos consultants.
          </p>

          {/* MAIN NAVIGATION TAB SWITCHER */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 border border-blue-400/40'
                  : 'bg-[#080d1a] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Formulaire de Contact</span>
            </button>

            <button
              onClick={() => setActiveTab('booking')}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                activeTab === 'booking'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25 border border-cyan-400/40'
                  : 'bg-[#080d1a] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Réserver avec Microsoft Bookings</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION CONTENT BASED ON SELECTED TAB */}
      <section className="py-12 md:py-20 relative z-10 bg-[#030712] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">

          {/* TAB 1: FORMULAIRE DE CONTACT REPRIS DU SITE ANCIEN */}
          {activeTab === 'form' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto space-y-10 text-left"
            >
              <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
                <div className="border-b border-slate-800 pb-4 space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Comment pouvons-nous vous aider ?
                  </h2>
                  <p className="text-xs text-slate-400">Remplissez le formulaire ci-dessous et nos experts reviendront vers vous rapidement.</p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Prénom & Nom */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Prénom <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        placeholder="Votre prénom"
                        className="w-full p-3.5 bg-[#030712] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Nom <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        placeholder="Votre nom"
                        className="w-full p-3.5 bg-[#030712] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email & Téléphone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Adresse email <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre.adresse@email.com"
                        className="w-full p-3.5 bg-[#030712] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Numéro téléphone <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        required
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        placeholder="+212 6XX XX XX XX"
                        className="w-full p-3.5 bg-[#030712] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Heure et Date de contact souhaitées */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Quel est le meilleur moment pour vous contacter ?</label>
                      <input
                        type="text"
                        value={heureContact}
                        onChange={(e) => setHeureContact(e.target.value)}
                        placeholder="12:00 PM"
                        className="w-full p-3.5 bg-[#030712] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300">Quelle est la meilleure date pour vous contacter ?</label>
                      <input
                        type="date"
                        value={dateContact}
                        onChange={(e) => setDateContact(e.target.value)}
                        className="w-full p-3.5 bg-[#030712] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* En quoi pourrions-nous vous aider ? (Checkboxes Motifs) */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-300">En quoi pourrions-nous vous aider ?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {MOTIFS.map((motif, i) => {
                        const isChecked = selectedMotifs.includes(motif);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleMotifToggle(motif)}
                            className={`p-3 rounded-xl border text-xs font-medium text-left flex items-start gap-3 transition-colors cursor-pointer ${
                              isChecked
                                ? 'bg-cyan-950/60 border-cyan-500 text-white'
                                : 'bg-[#030712] border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                              isChecked ? 'bg-cyan-500 border-cyan-400' : 'border-slate-600 bg-slate-900'
                            }`}>
                              {isChecked && <CheckCircle className="w-3.5 h-3.5 text-black font-black" />}
                            </div>
                            <span>{motif}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Parlez-nous de votre besoin */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">Parlez-nous de votre besoin <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tapez votre message ici..."
                      className="w-full p-3.5 bg-[#030712] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Simulé reCAPTCHA Google Checkbox */}
                  <div className="p-4 bg-[#030712] border border-slate-800 rounded-2xl inline-flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setCaptchaChecked(!captchaChecked)}
                      className={`w-6 h-6 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                        captchaChecked ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-900 border-slate-700'
                      }`}
                    >
                      {captchaChecked && <CheckCircle className="w-4 h-4 text-black font-bold" />}
                    </button>
                    <span className="text-xs font-bold text-slate-300">Je ne suis pas un robot</span>
                    <span className="text-[10px] text-slate-500 ml-4">reCAPTCHA</span>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Envoyer</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 2: INTÉGRATION MICROSOFT BOOKINGS (8 CONSULTANTS, 2 CATÉGORIES) */}
          {activeTab === 'booking' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto space-y-10 text-left"
            >
              <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
                
                {/* Stepper Header */}
                <div className="border-b border-slate-800 pb-6 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                    <span>Microsoft 365 Bookings Sync</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Prise de Rendez-vous Directe avec nos Consultants
                  </h2>
                  <p className="text-xs text-slate-400">
                    Parcours client en 3 étapes : Choisissez la catégorie d&apos;expertise, sélectionnez votre consultant dédié, puis réservez votre créneau en direct.
                  </p>
                </div>

                {/* ÉTAPE 1: CHOIX DE LA CATÉGORIE (Commercial vs Architecture & Sécurité) */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px] text-cyan-400 font-bold">1</span>
                    <span>Étape 1 : Choisir la Catégorie d&apos;Expertise</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CONSULTANT_CATEGORIES.map((cat) => {
                      const isSelected = bookingCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setBookingCategory(cat.id as any);
                            setSelectedConsultant(cat.consultants[0]);
                          }}
                          className={`p-5 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#0c1938] to-[#040e24] border-cyan-500/70 shadow-lg shadow-cyan-950/40'
                              : 'bg-[#030712] border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-2.5 py-0.5 bg-cyan-950 border border-cyan-800/60 rounded-full">
                              {cat.badge}
                            </span>
                            {isSelected && <CheckCircle className="w-5 h-5 text-cyan-400" />}
                          </div>
                          <h4 className="text-base font-black text-white">{cat.title}</h4>
                          <p className="text-xs text-slate-400 leading-normal">{cat.subtitle}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ÉTAPE 2: CHOIX DU CONSULTANT */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px] text-cyan-400 font-bold">2</span>
                    <span>Étape 2 : Sélectionner un Consultant (Licence M365 Active)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {CONSULTANT_CATEGORIES.find(c => c.id === bookingCategory)?.consultants.map((c) => {
                      const isSelected = selectedConsultant.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedConsultant(c)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                            isSelected
                              ? 'bg-[#0c1833] border-cyan-500 shadow-xl'
                              : 'bg-[#030712] border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <img src={c.photo} alt={c.name} className="w-12 h-12 rounded-xl object-cover border border-cyan-500/30 shrink-0" />
                              <div>
                                <h5 className="text-sm font-black text-white">{c.name}</h5>
                                <p className="text-[11px] font-bold text-cyan-400 leading-tight">{c.role}</p>
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{c.desc}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{c.duration}</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full ${isSelected ? 'bg-cyan-500 text-black font-black' : 'bg-slate-900 text-slate-400'}`}>
                              {isSelected ? 'Sélectionné' : 'Choisir'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ÉTAPE 3: SÉLECTION DU CRÉNEAU & CONFIRMATION */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px] text-cyan-400 font-bold">3</span>
                    <span>Étape 3 : Choisir la Date et l&apos;Heure (Microsoft Bookings)</span>
                  </h3>

                  {bookingSuccess ? (
                    <div className="p-8 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                        <CheckCircle className="w-7 h-7" />
                      </div>
                      <h4 className="text-xl font-black text-white">Rendez-vous Confirmé !</h4>
                      <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                        Votre rendez-vous de <strong className="text-white">{selectedConsultant.duration}</strong> avec <strong className="text-cyan-400">{selectedConsultant.name}</strong> a bien été réservé dans Microsoft Bookings pour le <strong className="text-white">{bookingDate}</strong> à <strong className="text-white">{bookingTime}</strong>.
                      </p>
                      <button
                        onClick={() => setBookingSuccess(false)}
                        className="px-6 py-2.5 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl hover:text-white cursor-pointer"
                      >
                        Réserver un autre rdv
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit} className="p-6 bg-[#030712] border border-slate-800 rounded-2xl space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-300">Date du Rendez-vous <span className="text-red-500">*</span></label>
                          <input
                            type="date"
                            required
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full p-3.5 bg-[#080d1a] border border-slate-800 focus:border-cyan-500 rounded-xl text-white text-xs font-semibold outline-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-300">Heure Souhaitée <span className="text-red-500">*</span></label>
                          <select
                            required
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="w-full p-3.5 bg-[#080d1a] border border-slate-800 focus:border-cyan-500 rounded-xl text-white text-xs font-semibold outline-none"
                          >
                            <option value="">Sélectionner un créneau...</option>
                            <option value="09:00 AM">09:00 AM</option>
                            <option value="10:30 AM">10:30 AM</option>
                            <option value="02:00 PM">02:00 PM</option>
                            <option value="04:00 PM">04:00 PM</option>
                            <option value="05:30 PM">05:30 PM</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <div className="text-xs text-slate-400">
                          Consultant sélectionné : <span className="font-bold text-white">{selectedConsultant.name}</span> ({selectedConsultant.duration})
                        </div>

                        <button
                          type="submit"
                          className="px-8 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-600/20 cursor-pointer"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Confirmer le RDV Bookings</span>
                        </button>
                      </div>
                    </form>
                  )}

                </div>

              </div>
            </motion.div>
          )}

        </div>
      </section>

      {/* COORDONNÉES DE CONTACT FIXES AU BAS DE LA PAGE */}
      <section className="py-16 relative z-10 bg-[#020617] border-t border-slate-900 text-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Adresse</h4>
              <p className="text-xs text-slate-300 font-bold">Bureau 305, Technopark Casablanca, Maroc</p>
              <p className="text-[10px] text-cyan-400 font-bold">📍 Nouvelle adresse Soon !</p>
            </div>

            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Téléphone</h4>
              <p className="text-xs text-slate-300 font-bold">+212 664 244 343 // +212 520 572 631</p>
              <p className="text-[10px] text-slate-400 font-bold">Support 24/7 pour nos clients sous infogérance</p>
            </div>

            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">E-mail</h4>
              <p className="text-xs text-slate-300 font-bold">contact@ethicaldatasecurity.ma</p>
              <p className="text-[10px] text-slate-400 font-bold">Réponse garantie sous 24 heures ouvrées</p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
