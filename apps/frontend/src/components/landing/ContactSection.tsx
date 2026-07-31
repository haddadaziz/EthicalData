"use client";

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, RefreshCw, Calendar, Clock, CheckCircle, ShieldCheck } from '@/components/icons';
import { useToast } from '../../context/ToastContext';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { motion } from 'framer-motion';

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

export function ContactSection() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'form' | 'booking'>('form');

  // Form State
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

  // Booking State
  const [bookingCategory, setBookingCategory] = useState<'commercial' | 'tech'>('commercial');
  const [selectedConsultant, setSelectedConsultant] = useState<any>(CONSULTANT_CATEGORIES[0].consultants[0]);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

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
    <section id="contact" className="relative z-10 w-full py-20 md:py-24 overflow-hidden bg-[#020617]">
      
      {/* Background Cyber Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/bg/contact_cyber_bg.png" 
          alt="Contact background" 
          className="w-full h-full object-cover opacity-20 transform-gpu" 
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
        
        {/* Section Header */}
        <AnimatedSection className="text-center space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black uppercase leading-tight tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
              Nous Contacter
            </span>
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed font-medium max-w-2xl mx-auto">
            Formulaire complet d&apos;assistance ou prise de rendez-vous directe avec nos 8 consultants via Microsoft Bookings.
          </p>

          {/* TAB SWITCHER BUTTONS */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 ${
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
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeTab === 'booking'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25 border border-cyan-400/40'
                  : 'bg-[#080d1a] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Microsoft Bookings</span>
            </button>
          </div>
        </AnimatedSection>

        {/* TAB 1: FORMULAIRE DE CONTACT (NOUVELLE VERSION REFRAPPÉE) */}
        {activeTab === 'form' && (
          <AnimatedSection>
            <div className="bg-[#080d1a]/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-left max-w-4xl mx-auto">
              <div className="border-b border-slate-800 pb-4 space-y-1">
                <h3 className="text-2xl font-black text-white">Comment pouvons-nous vous aider ?</h3>
                <p className="text-xs text-slate-400">Veuillez renseigner le formulaire ci-dessous pour que nos équipes traitent votre demande.</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Prénom & Nom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
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

                  <div className="space-y-1.5">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
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

                  <div className="space-y-1.5">
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

                {/* Moment & Date de contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Quel est le meilleur moment pour vous contacter ?</label>
                    <input
                      type="text"
                      value={heureContact}
                      onChange={(e) => setHeureContact(e.target.value)}
                      placeholder="12:00 PM"
                      className="w-full p-3.5 bg-[#030712] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Quelle est la meilleure date pour vous contacter ?</label>
                    <input
                      type="date"
                      value={dateContact}
                      onChange={(e) => setDateContact(e.target.value)}
                      className="w-full p-3.5 bg-[#030712] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Motifs Checkboxes */}
                <div className="space-y-2.5 pt-1">
                  <label className="text-xs font-bold text-slate-300">En quoi pourrions-nous vous aider ?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {MOTIFS.map((motif, i) => {
                      const isChecked = selectedMotifs.includes(motif);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleMotifToggle(motif)}
                          className={`p-3 rounded-xl border text-xs font-medium text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
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

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Parlez-nous de votre besoin <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tapez votre message ici..."
                    className="w-full p-3.5 bg-[#030712] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none transition-colors resize-none"
                  />
                </div>

                {/* Captcha */}
                <div className="p-3.5 bg-[#030712] border border-slate-800 rounded-2xl inline-flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCaptchaChecked(!captchaChecked)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                      captchaChecked ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    {captchaChecked && <CheckCircle className="w-3.5 h-3.5 text-black font-bold" />}
                  </button>
                  <span className="text-xs font-bold text-slate-300">Je ne suis pas un robot</span>
                  <span className="text-[10px] text-slate-500 ml-4">reCAPTCHA</span>
                </div>

                {/* Submit */}
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
          </AnimatedSection>
        )}

        {/* TAB 2: MICROSOFT BOOKINGS (8 CONSULTANTS, 2 CATÉGORIES) */}
        {activeTab === 'booking' && (
          <AnimatedSection>
            <div className="bg-[#080d1a]/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-left max-w-5xl mx-auto">
              
              <div className="border-b border-slate-800 pb-4 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full">
                  Microsoft 365 Bookings Sync
                </span>
                <h3 className="text-2xl font-black text-white pt-2">Prise de Rendez-vous en Direct</h3>
                <p className="text-xs text-slate-400">Sélectionnez le pôle d&apos;expertise et réservez un créneau avec l&apos;un de nos 8 consultants.</p>
              </div>

              {/* ÉTAPE 1: CHOIX CATÉGORIE */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px] text-cyan-400 font-bold">1</span>
                  <span>Étape 1 : Choisir le Pôle</span>
                </h4>

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
                        className={`p-4 rounded-2xl border text-left space-y-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#0c1938] to-[#040e24] border-cyan-500/70 shadow-lg'
                            : 'bg-[#030712] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-2.5 py-0.5 bg-cyan-950 border border-cyan-800/60 rounded-full">
                            {cat.badge}
                          </span>
                          {isSelected && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <h5 className="text-sm font-black text-white">{cat.title}</h5>
                        <p className="text-xs text-slate-400">{cat.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ÉTAPE 2: CHOIX CONSULTANT */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px] text-cyan-400 font-bold">2</span>
                  <span>Étape 2 : Sélectionner un Consultant</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {CONSULTANT_CATEGORIES.find(c => c.id === bookingCategory)?.consultants.map((c) => {
                    const isSelected = selectedConsultant.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedConsultant(c)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-[#0c1833] border-cyan-500 shadow-xl'
                            : 'bg-[#030712] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <img src={c.photo} alt={c.name} className="w-10 h-10 rounded-xl object-cover border border-cyan-500/30 shrink-0" />
                            <div>
                              <h6 className="text-xs font-black text-white">{c.name}</h6>
                              <p className="text-[10px] font-bold text-cyan-400">{c.role}</p>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400">{c.desc}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" />
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

              {/* ÉTAPE 3: RÉSERVATION */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px] text-cyan-400 font-bold">3</span>
                  <span>Étape 3 : Choisir Créneau & Confirmer</span>
                </h4>

                {bookingSuccess ? (
                  <div className="p-6 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl text-center space-y-3">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h5 className="text-lg font-black text-white">Rendez-vous Registré !</h5>
                    <p className="text-xs text-slate-300">
                      Créneau réservé avec <strong className="text-cyan-400">{selectedConsultant.name}</strong> le <strong className="text-white">{bookingDate}</strong> à <strong className="text-white">{bookingTime}</strong>.
                    </p>
                    <button
                      onClick={() => setBookingSuccess(false)}
                      className="px-5 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl hover:text-white cursor-pointer"
                    >
                      Nouveau RDV
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="p-5 bg-[#030712] border border-slate-800 rounded-2xl space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Date <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          required
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full p-3 bg-[#080d1a] border border-slate-800 focus:border-cyan-500 rounded-xl text-white text-xs font-semibold outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Créneau Horaire <span className="text-red-500">*</span></label>
                        <select
                          required
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full p-3 bg-[#080d1a] border border-slate-800 focus:border-cyan-500 rounded-xl text-white text-xs font-semibold outline-none"
                        >
                          <option value="">Sélectionner une heure...</option>
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:30 AM">10:30 AM</option>
                          <option value="02:00 PM">02:00 PM</option>
                          <option value="04:00 PM">04:00 PM</option>
                          <option value="05:30 PM">05:30 PM</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-400">
                        Consultant : <strong className="text-white">{selectedConsultant.name}</strong> ({selectedConsultant.duration})
                      </span>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-600/20 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Confirmer le RDV</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </AnimatedSection>
        )}

      </div>
    </section>
  );
}
