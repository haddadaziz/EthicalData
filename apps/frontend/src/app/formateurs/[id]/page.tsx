'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Award, GraduationCap, Star, BookOpen, Calendar, ArrowRight, CheckCircle, Mail, Phone } from '@/components/icons';

interface TrainerProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  totalStudents: number;
  totalCourses: number;
  averageRating: number;
  experienceYears: number;
}

const MOCK_TRAINERS: Record<string, TrainerProfile> = {
  "t1": {
    id: "t1",
    name: "Dr. Tariq Berrada",
    role: "Expert Cybersécurité & Pentest Specialist",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=350&q=75",
    bio: "Docteur en Sécurité des Systèmes d'Information et consultant auditeur depuis plus de 12 ans. Formateur certifié PECB et Palo Alto Networks, il a accompagné plus de 1500 professionnels sur les architectures réseau hautement sécurisées.",
    specialties: ["Pentesting & Ethical Hacking", "Sécurité Périmétrique Fortinet/Palo Alto", "Conformité ISO 27001", "Audit des Systèmes D'Information"],
    certifications: ["PECB Certified ISO 27001 Lead Auditor", "Palo Alto Networks PCNSA / PCNSE", "CEH (Certified Ethical Hacker)", "CISSP Certified"],
    totalStudents: 1450,
    totalCourses: 8,
    averageRating: 4.9,
    experienceYears: 12
  },
  "t2": {
    id: "t2",
    name: "Leila Naciri",
    role: "Architecte Cloud & Hybride Solutions",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=350&q=75",
    bio: "Ingénieure Senior certifiée AWS et Microsoft Azure avec 10 ans d'expérience dans la conception d'infrastructures cloud hautement disponibles et le plan de reprise d'activité (Disaster Recovery).",
    specialties: ["AWS Cloud Architecture", "Microsoft Azure Infrastructure", "Disaster Recovery (Veeam / SRM)", "Virtualisation VMware vSphere"],
    certifications: ["AWS Certified Security - Specialty", "Microsoft Certified: Azure Solutions Architect", "VCP-DCV (VMware Certified Professional)", "Veeam Certified Engineer"],
    totalStudents: 980,
    totalCourses: 6,
    averageRating: 4.8,
    experienceYears: 10
  }
};

export default function TrainerPublicProfilePage({ params }: { params: { id: string } }) {
  const trainer = MOCK_TRAINERS[params.id] || MOCK_TRAINERS["t1"];

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-[#020617]">
        {/* Background Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
          <div
            className="w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)' }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-left">
            
            {/* Top Info Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <img
                src={trainer.avatar}
                alt={trainer.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-2 border-cyan-500/40 shadow-xl shrink-0"
              />

              <div className="space-y-3 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Formateur Agrée Ethical Data Security</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  {trainer.name}
                </h1>
                <p className="text-sm font-bold text-cyan-400">{trainer.role}</p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 font-medium pt-1">
                  <span className="flex items-center gap-1.5 bg-[#030712] border border-slate-800 px-3 py-1.5 rounded-xl">
                    <Star className="w-4 h-4 text-amber-400" />
                    <strong>{trainer.averageRating} / 5.0</strong> (Avis Apprenants)
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#030712] border border-slate-800 px-3 py-1.5 rounded-xl">
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    <strong>{trainer.totalStudents}+</strong> Apprenants Formés
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#030712] border border-slate-800 px-3 py-1.5 rounded-xl">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <strong>{trainer.experienceYears} Ans</strong> d&apos;Expérience
                  </span>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-3 border-t border-slate-800 pt-6">
              <h2 className="text-base font-black text-white uppercase tracking-wider">Biographie & Parcours</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{trainer.bio}</p>
            </div>

            {/* Specialties & Certifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-6">
              
              {/* Spécialités */}
              <div className="space-y-3 bg-[#030712] border border-slate-800 p-5 rounded-2xl">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Domaines d&apos;Expertise & Spécialités</span>
                </h3>
                <div className="space-y-2">
                  {trainer.specialties.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications Détenues */}
              <div className="space-y-3 bg-[#030712] border border-slate-800 p-5 rounded-2xl">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Certifications Officiellement Détenues</span>
                </h3>
                <div className="space-y-2">
                  {trainer.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Action CTA */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Vous souhaitez suivre une formation ou planifier une session de coaching avec <strong className="text-white">{trainer.name}</strong> ?
              </span>

              <Link
                href="/contact"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>Réserver un créneau de coaching</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
