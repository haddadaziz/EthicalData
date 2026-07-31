"use client";

import React, { useState } from 'react';
import { BookOpen, Play, CheckCircle, Clock, ChevronRight, Award, GraduationCap } from '@/components/icons';
import Link from 'next/link';

interface CourseProgress {
  id: string;
  title: string;
  certificationCode: string;
  category: string;
  progressPercent: number;
  completedModules: number;
  totalModules: number;
  durationLeft: string;
  lastLessonTitle: string;
  trainerName: string;
  deliveryType: 'E-learning 24/7' | 'Visioconférence Live';
}

const MOCK_COURSE_PROGRESS: CourseProgress[] = [
  {
    id: "cp-1",
    title: "Palo Alto Networks PCNSA — Architecture & Administration Next-Gen Firewall",
    certificationCode: "PCNSA",
    category: "Cybersécurité Périmétrique",
    progressPercent: 75,
    completedModules: 12,
    totalModules: 16,
    durationLeft: "3h 30m restantes",
    lastLessonTitle: "Module 12 : Politiques de Sécurité WildFire & Profils Anti-Threats",
    trainerName: "Dr. Tariq Berrada",
    deliveryType: "E-learning 24/7"
  },
  {
    id: "cp-2",
    title: "AWS Certified Security - Specialty — Cloud Infrastructure Protection",
    certificationCode: "SCS-C02",
    category: "Cloud Security",
    progressPercent: 40,
    completedModules: 6,
    totalModules: 15,
    durationLeft: "8h 15m restantes",
    lastLessonTitle: "Module 6 : KMS Key Policies & S3 Bucket Encryption Rules",
    trainerName: "Leila Naciri",
    deliveryType: "Visioconférence Live"
  },
  {
    id: "cp-3",
    title: "PECB ISO 27001 Lead Implementer — Management de la Sécurité de l'Information",
    certificationCode: "ISO-27001",
    category: "Gouvernance & Conformité",
    progressPercent: 100,
    completedModules: 10,
    totalModules: 10,
    durationLeft: "Formation Terminée",
    lastLessonTitle: "Examen de validation des compétences ISO 27001",
    trainerName: "Dr. Tariq Berrada",
    deliveryType: "E-learning 24/7"
  }
];

export default function CourseProgressSection() {
  const [courses] = useState<CourseProgress[]>(MOCK_COURSE_PROGRESS);

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <span>Progression par Cours & Formations en Cours</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Suivi en temps réel de votre avancement dans chaque module e-learning et visioconférence.
          </p>
        </div>

        <div className="px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full text-cyan-400 text-xs font-bold w-max">
          {courses.length} Cours Inscrits
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((c) => {
          const isCompleted = c.progressPercent === 100;

          return (
            <div
              key={c.id}
              className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div className="space-y-3">
                {/* Header Tag */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-2.5 py-0.5 bg-cyan-950 border border-cyan-800/60 rounded-full">
                    {c.certificationCode}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{c.deliveryType}</span>
                </div>

                <h4 className="text-sm font-black text-white leading-snug line-clamp-2">
                  {c.title}
                </h4>

                {/* Progress Bar */}
                <div className="space-y-1.5 bg-[#030712] p-3 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">Progression</span>
                    <span className={isCompleted ? 'text-emerald-400' : 'text-cyan-400'}>
                      {c.progressPercent}% ({c.completedModules}/{c.totalModules} modules)
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                      }`}
                      style={{ width: `${c.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{c.durationLeft}</span>
                    </span>
                    <span>Formateur : <strong className="text-slate-200">{c.trainerName}</strong></span>
                  </div>
                </div>

                {/* Last Lesson */}
                <div className="text-[11px] text-slate-400 space-y-0.5 border-t border-slate-800/80 pt-2.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Dernier Module Accédé</span>
                  <p className="font-bold text-slate-200 truncate">{c.lastLessonTitle}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href="/dashboard/cours"
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    isCompleted
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-900/60'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Revoir le Cours</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Continuer le cours</span>
                    </>
                  )}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
