'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Send, CheckCircle, RefreshCw, Calendar, Building, Users, Shield, ArrowRight } from '@/components/icons';
import { useToast } from '@/context/ToastContext';

export function SolutionITDevisFormSection() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [societe, setSociete] = useState('');
  const [nbLicences, setNbLicences] = useState('10-50');
  const [typeAbonnement, setTypeAbonnement] = useState('Microsoft 365 Enterprise');
  const [besoinMigration, setBesoinMigration] = useState(true);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !prenom || !nom || !societe) {
      showToast("Veuillez renseigner tous les champs obligatoires.", "error");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast("Votre demande de devis a été transmise avec succès au pôle commercial !", "success");
    }, 1200);
  };

  return (
    <section id="devis-online" className="py-20 md:py-24 relative z-10 bg-[#020617] border-t border-slate-900 text-left">
      <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-10">

        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-black uppercase tracking-widest">
            <Shield className="w-3.5 h-3.5" />
            <span>Demande de Devis Abonnements & Licences Cloud</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
              Demande de Devis en Ligne
            </span>
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
            Formulaire dédié aux abonnements Microsoft 365, Azure, matériels IT et solutions Cloud/Security. Recevez votre chiffrage sous 24h et échangez directement avec nos consultants commerciaux.
          </p>
        </div>

        {/* FORM CONTAINER */}
        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          {submitted ? (
            /* SUCCESS & MICROSOFT BOOKINGS LINK */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-900/60 border border-emerald-500/60 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <h3 className="text-2xl font-black text-white">Demande de Devis Transmise au Pôle Commercial !</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Merci <strong className="text-white">{prenom} {nom}</strong> ({societe}). Votre demande d&apos;estimation pour <strong className="text-cyan-400">{typeAbonnement}</strong> ({nbLicences} utilisateurs) a été transmise à nos ingénieurs commerciaux.
                </p>
              </div>

              <div className="p-6 bg-[#020617] border border-cyan-900/80 rounded-2xl space-y-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Option Réclamation Rapide & Échange Direct</span>
                </div>
                <p className="text-xs text-slate-300">
                  Vous souhaitez présenter votre projet directement à un consultant commercial dédié ? Choisissez votre créneau en direct via Microsoft Bookings.
                </p>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-900/40 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Réserver un RDV Microsoft Bookings</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Effectuer une autre demande
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SECTION 1: INFORMATIONS SOCIÉTÉ & LICENCES */}
              <div className="space-y-4 border-b border-slate-800/80 pb-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>1. Informations Société & Périmètre Solution</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Nom de la Société / Entreprise <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={societe}
                      onChange={(e) => setSociete(e.target.value)}
                      placeholder="Ex: Ethical Tech & Data SARL"
                      className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Nombre d&apos;utilisateurs / Licences <span className="text-red-500">*</span></label>
                    <select
                      value={nbLicences}
                      onChange={(e) => setNbLicences(e.target.value)}
                      className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none"
                    >
                      <option value="1-10">1 à 10 utilisateurs</option>
                      <option value="10-50">10 à 50 utilisateurs</option>
                      <option value="50-150">50 à 150 utilisateurs</option>
                      <option value="150-500">150 à 500 utilisateurs</option>
                      <option value="500+">Plus de 500 utilisateurs (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Type d&apos;Abonnement / Solution Visée <span className="text-red-500">*</span></label>
                    <select
                      value={typeAbonnement}
                      onChange={(e) => setTypeAbonnement(e.target.value)}
                      className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none"
                    >
                      <option value="Microsoft 365 Enterprise">Microsoft 365 Enterprise (Business Premium / E3 / E5)</option>
                      <option value="Azure Cloud Credits">Azure Cloud & Virtual Machines</option>
                      <option value="Cybersécurité Hardware & Software">Cybersécurité (Fortinet, Palo Alto, Sophos, F5)</option>
                      <option value="Veeam Backup & Disaster Recovery">Veeam Backup & Disaster Recovery</option>
                      <option value="Dolibarr ERP/CRM">Dolibarr ERP/CRM (Déploiement sur-mesure)</option>
                      <option value="Odoo ERP Integration">Odoo ERP (Suite intégrée)</option>
                      <option value="Équipements Hardware Datacenter">Matériel Hardware (Serveurs, Racks, Switche, Laptops)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Accompagnement Migration & Déploiement</label>
                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="migration"
                          checked={besoinMigration === true}
                          onChange={() => setBesoinMigration(true)}
                          className="accent-cyan-500 w-4 h-4"
                        />
                        <span>Oui (Besoin de migration & installation)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="migration"
                          checked={besoinMigration === false}
                          onChange={() => setBesoinMigration(false)}
                          className="accent-cyan-500 w-4 h-4"
                        />
                        <span>Non (Achat direct de licences)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: COORDONNÉES DE CONTACT */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>2. Coordonnées du Responsable</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Prénom <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      placeholder="Votre prénom"
                      className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none"
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
                      className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Adresse E-mail Professionnelle <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@societe.ma"
                      className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Numéro de Téléphone <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="+212 600-000000"
                      className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Détails du besoin & Message complémentaire</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Précisez votre infrastructure actuelle, vos délais souhaités..."
                    className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-2xl text-white text-xs font-semibold outline-none resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transmission en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Envoyer la demande de devis</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </section>
  );
}
