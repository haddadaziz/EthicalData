"use client";

import React, { useState } from 'react';
import { Mail, Phone, Globe, Send, RefreshCw } from '@/components/icons';
import { useToast } from '../../context/ToastContext';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function ContactSection() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulation d'envoi du formulaire de contact
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      showToast("Votre message a été envoyé avec succès. Notre équipe vous recontactera très bientôt.", "success");
      
      // Reset form
      setNom('');
      setEmail('');
      setSujet('');
      setMessage('');
    } catch (err: any) {
      showToast("Une erreur est survenue lors de l'envoi du message.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative z-10 w-full py-20 md:py-24 bg-white border-t border-slate-200/65">
      {/* Grille fine d'arrière-plan claire */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <AnimatedSection className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 uppercase leading-tight tracking-tight">
            NOUS CONTACTER
          </h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium max-w-2xl mx-auto">
            Une question sur nos formations, nos certifications ou nos prestations ? Écrivez-nous et nos experts vous répondront dans les plus brefs délais.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-8">
          {/* Infos de contact */}
          <AnimatedSection className="lg:col-span-5 space-y-8">
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 space-y-6">
              <h3 className="text-xl font-black text-slate-950 tracking-tight leading-none mb-2">
                Coordonnées
              </h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Ethical Data Security
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail</h4>
                    <p className="text-sm font-bold text-slate-800">contact@ethicaldata.ma</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Téléphone</h4>
                    <p className="text-sm font-bold text-slate-800">+212 (0) 5 22 22 22 22</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Adresse</h4>
                    <p className="text-sm font-bold text-slate-800">Technopark Casablanca, Maroc</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Formulaire de contact */}
          <AnimatedSection className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nom Complet *</label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Votre nom et prénom"
                    className="w-full p-3.5 bg-white border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Adresse E-mail *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    className="w-full p-3.5 bg-white border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Sujet *</label>
                <input
                  type="text"
                  required
                  value={sujet}
                  onChange={(e) => setSujet(e.target.value)}
                  placeholder="De quoi s'agit-il ?"
                  className="w-full p-3.5 bg-white border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre demande en détail..."
                  className="w-full p-3.5 bg-white border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Envoyer le Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
