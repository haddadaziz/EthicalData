'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BookOpen, Clock, Users, ShieldCheck, Award, CheckCircle, Video, ArrowRight, ArrowLeft, Star, FileText, Check } from '@/components/icons';
import { useParams } from 'next/navigation';

interface CourseDetail {
  id: string;
  titre: string;
  category: string;
  description: string;
  deliveryType: 'E-learning 24/7' | 'Visioconférence Live';
  priceMad: number;
  dureeHeures: number;
  certificationCode: string;
  prerequis: string[];
  programme: { title: string; duration: string; lessonsCount: number; topics: string[] }[];
  trainer: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
  liveMetadata?: {
    nextSessionDate: string;
    timeSlot: string;
    enrolledSeats: number;
    maxSeats: number;
    teamsMeetingAvailable: boolean;
  };
}

const MOCK_COURSE_DETAILS: Record<string, CourseDetail> = {
  "az900-course-seed": {
    id: "az900-course-seed",
    titre: "Microsoft Azure Fundamentals (AZ-900) - Le Guide Complet",
    category: "Cloud Infrastructure",
    description: "Maîtrisez les concepts fondamentaux du Cloud Microsoft Azure, de la gestion des identités Entra ID jusqu'à la sécurisation des architectures IaaS/PaaS.",
    deliveryType: "E-learning 24/7",
    priceMad: 1800,
    dureeHeures: 35,
    certificationCode: "AZ-900",
    prerequis: [
      "Notions de base en informatique et réseaux TCP/IP",
      "Aucune expérience préalable du Cloud requise"
    ],
    programme: [
      { title: "Module 1 : Introduction & Concepts Généraux Cloud Azure", duration: "4h", lessonsCount: 6, topics: ["IaaS vs PaaS vs SaaS", "Régions & Zones de disponibilité", "Calcul de TCO"] },
      { title: "Module 2 : Services de Calcul & Stockage Azure", duration: "8h", lessonsCount: 10, topics: ["Virtual Machines & App Services", "Blob Storage & Disk Encryption", "Azure Virtual Networks"] },
      { title: "Module 3 : Sécurité, Identités (Entra ID) & Gouvernance", duration: "12h", lessonsCount: 14, topics: ["Microsoft Entra ID (Azure AD)", "RBAC & Management Groups", "Azure Key Vault & Defender"] },
      { title: "Module 4 : Préparation à l'Examen & Examens Blancs Corriger", duration: "11h", lessonsCount: 8, topics: ["Simulations d'Examen blanc chronométrées", "Revue détaillée des questions pièges"] }
    ],
    trainer: {
      id: "t2",
      name: "Leila Naciri",
      role: "Architecte Cloud Azure & AWS Certified",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=350&q=75"
    }
  },
  "paloalto-pcnsa": {
    id: "paloalto-pcnsa",
    titre: "Palo Alto Networks PCNSA — Administration Next-Gen Firewall",
    category: "Cybersécurité Périmétrique",
    description: "Formation certifiante interactive avec travaux pratiques sur Firewall Palo Alto PAN-OS 11, règles de filtrage App-ID, inspection SSL et prévention des menaces WildFire.",
    deliveryType: "Visioconférence Live",
    priceMad: 3500,
    dureeHeures: 45,
    certificationCode: "PCNSA",
    prerequis: [
      "Solides connaissances en réseaux TCP/IP (Routing & Switching)",
      "Bases sur les principes de pare-feu réseau et VPN IPSec"
    ],
    programme: [
      { title: "Module 1 : Déploiement & Configuration Initiale PAN-OS", duration: "10h", lessonsCount: 8, topics: ["Interfaces & Zones de sécurité", "Service Route & Virtual Routers", "High Availability HA-Active/Passive"] },
      { title: "Module 2 : Politiques de Sécurité App-ID & User-ID", duration: "15h", lessonsCount: 12, topics: ["Applications & App-ID matching", "Intégration Active Directory User-ID", "Decryption SSL Inbound & Outbound"] },
      { title: "Module 3 : Antivirus, Anti-Spyware & WildFire Analysis", duration: "10h", lessonsCount: 8, topics: ["Threat Prevention profiles", "WildFire Cloud sandbox analysis", "URL Filtering & DNS Security"] },
      { title: "Module 4 : TP Labs & Simulation d'Examen Officiel PCNSA", duration: "10h", lessonsCount: 6, topics: ["Labs pratiques sur GNS3/EVE-NG", "Correction des annales d'examen"] }
    ],
    trainer: {
      id: "t1",
      name: "Dr. Tariq Berrada",
      role: "Expert Cybersécurité & Instructor Certified",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=75"
    },
    liveMetadata: {
      nextSessionDate: "Mercredi 12 Août 2026",
      timeSlot: "18:00 - 21:00 GMT+1",
      enrolledSeats: 16,
      maxSeats: 20,
      teamsMeetingAvailable: true
    }
  }
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const course = MOCK_COURSE_DETAILS[id] || MOCK_COURSE_DETAILS["paloalto-pcnsa"];

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <Navbar />

      <section className="pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 text-left">
          
          {/* Back button */}
          <Link
            href="/formations"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#080d1a] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au catalogue des cours</span>
          </Link>

          {/* MAIN HEADER CARD */}
          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-3 py-1 bg-cyan-950 border border-cyan-800 rounded-full">
                  {course.category}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 px-3 py-1 bg-emerald-950 border border-emerald-800 rounded-full">
                  Code Examen : {course.certificationCode}
                </span>
              </div>

              {/* FORMAT BADGE */}
              {course.deliveryType === 'E-learning 24/7' ? (
                <div className="px-3.5 py-1.5 bg-blue-950/80 border border-blue-800/80 rounded-xl text-cyan-400 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>💻 E-learning (Autoformation 24/7)</span>
                </div>
              ) : (
                <div className="px-3.5 py-1.5 bg-rose-950/80 border border-rose-800/80 rounded-xl text-rose-400 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <Video className="w-4 h-4 text-rose-400" />
                  <span>🎥 Formation Visioconférence Live (Teams)</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {course.titre}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {course.description}
            </p>

            {/* KEY METRICS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs font-semibold">
              <div className="bg-[#030712] border border-slate-800 p-3.5 rounded-2xl space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Durée Totale</span>
                <span className="text-white font-black text-sm">{course.dureeHeures} Heures</span>
              </div>

              <div className="bg-[#030712] border border-slate-800 p-3.5 rounded-2xl space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Format d&apos;Apprentissage</span>
                <span className="text-cyan-400 font-black text-sm">{course.deliveryType}</span>
              </div>

              <div className="bg-[#030712] border border-slate-800 p-3.5 rounded-2xl space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Formateur Assigné</span>
                <span className="text-emerald-400 font-black text-sm">{course.trainer.name}</span>
              </div>

              <div className="bg-[#030712] border border-slate-800 p-3.5 rounded-2xl space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Tarif Formation</span>
                <span className="text-emerald-400 font-black text-base">{course.priceMad} MAD</span>
              </div>
            </div>

            {/* LIVE SESSIONS METADATA IF VISIO */}
            {course.deliveryType === 'Visioconférence Live' && course.liveMetadata && (
              <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 px-2.5 py-0.5 bg-rose-950 border border-rose-800 rounded">
                    Session Live Teams Planifiée
                  </span>
                  <p className="text-xs font-bold text-white">
                    Prochaine classe virtuelle : <strong className="text-rose-400">{course.liveMetadata.nextSessionDate} ({course.liveMetadata.timeSlot})</strong>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-amber-400 block">
                    {course.liveMetadata.enrolledSeats} / {course.liveMetadata.maxSeats} Inscrits (Places limitées)
                  </span>
                  <div className="w-36 h-2 bg-slate-900 rounded-full overflow-hidden mt-1 border border-slate-800">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(course.liveMetadata.enrolledSeats / course.liveMetadata.maxSeats) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TWO COLUMNS BODY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* PROGRAMME & PRÉREQUIS (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* PRÉREQUIS */}
              <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span>Prérequis Indispensables</span>
                </h3>
                <div className="space-y-2">
                  {course.prerequis.map((req, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 bg-[#030712] border border-slate-800 p-3 rounded-xl">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PROGRAMME DÉTAILLÉ */}
              <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <span>Programme Officiel de la Formation</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-bold">{course.programme.length} Modules Détaillés</span>
                </div>

                <div className="space-y-4">
                  {course.programme.map((mod, idx) => (
                    <div key={idx} className="bg-[#030712] border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <h4 className="text-xs font-black text-white">{mod.title}</h4>
                        <span className="text-[10px] font-bold text-cyan-400 px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded">
                          {mod.duration} • {mod.lessonsCount} Leçons
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mod.topics.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-400">
                            <span className="text-emerald-400">•</span>
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* FORMATEUR ASSIGNÉ & INSCRIPTION (1/3) */}
            <div className="space-y-6">
              
              {/* FICHE FORMATEUR ASSIGNÉ */}
              <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-4 text-center">
                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest block">Formateur Référent</span>
                <img
                  src={course.trainer.avatar}
                  alt={course.trainer.name}
                  className="w-24 h-24 rounded-2xl object-cover mx-auto border-2 border-cyan-500/40 shadow-lg"
                />
                <div>
                  <h4 className="text-base font-black text-white">{course.trainer.name}</h4>
                  <p className="text-xs text-cyan-400 font-bold">{course.trainer.role}</p>
                </div>
                <Link
                  href={`/formateurs/${course.trainer.id}`}
                  className="inline-block w-full py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  Voir la fiche formateur publique
                </Link>
              </div>

              {/* ACTION REJOINDRE COURS */}
              <div className="bg-gradient-to-br from-[#080d1a] to-[#030712] border border-blue-900/50 rounded-3xl p-6 space-y-4 text-center shadow-xl">
                <div className="text-xs font-bold text-slate-400">Accès immédiat au contenu</div>
                <div className="text-3xl font-black text-white">{course.priceMad} MAD</div>
                <Link
                  href="/dashboard/courses"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <span>S&apos;inscrire à la formation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
