import React, { useState, useEffect } from 'react';
import { BookOpen, Play, CheckCircle, Clock, ChevronRight, Award, GraduationCap, ArrowRight } from '@/components/icons';
import Link from 'next/link';
import { getUserCourseEnrollments, UserCourseEnrollment } from '@/lib/course-enrollments-storage';
import { apiFetch } from '@/lib/api';

export default function CourseProgressSection() {
  const [courses, setCourses] = useState<UserCourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEnrollments = async () => {
      // 1. Try fetching from backend API
      try {
        const data = await apiFetch('/cours/mes-inscriptions');
        if (Array.isArray(data) && data.length > 0) {
          const mapped: UserCourseEnrollment[] = data.map((i: any) => ({
            id: i.id,
            courseId: i.cours?.id || i.id,
            title: i.cours?.titre || 'Cours',
            certificationCode: i.cours?.certification?.codeExamen || 'CERT',
            category: i.cours?.certification?.fournisseur?.nom || 'Formation IT',
            progressPercent: i.progression || 0,
            completedModules: Math.round(((i.progression || 0) / 100) * (i.cours?._count?.modules || 10)),
            totalModules: i.cours?._count?.modules || 10,
            durationLeft: i.progression >= 100 ? 'Formation Terminée' : 'En cours',
            lastLessonTitle: 'Module en cours de visionnage',
            trainerName: `${i.cours?.formateur?.prenom || 'Tariq'} ${i.cours?.formateur?.nom || 'Berrada'}`,
            deliveryType: 'E-learning 24/7',
            enrolledAt: i.dateInscription
          }));
          setCourses(mapped);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Fallback to local storage if API fails or empty
      }

      // 2. Read local storage
      const local = getUserCourseEnrollments();
      setCourses(local);
      setLoading(false);
    };

    loadEnrollments();

    const handleUpdate = () => loadEnrollments();
    window.addEventListener('enrollmentsUpdated', handleUpdate);
    return () => window.removeEventListener('enrollmentsUpdated', handleUpdate);
  }, []);

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

      {/* Progress Cards / Empty State */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold text-xs bg-[#080d1a] border border-slate-800 rounded-3xl">
          Chargement de vos cours...
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="text-base font-black text-white">Vous n&apos;avez rejoint aucun cours pour le moment</h4>
            <p className="text-xs text-slate-400">
              Parcourez notre catalogue complet de formations IT & Cybersécurité et inscrivez-vous pour suivre votre progression de visionnage vidéo en temps réel !
            </p>
          </div>
          <Link
            href="/dashboard/cours"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <span>Explorer le Catalogue des Cours</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
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
                    <span className="text-slate-300">Progression Visionnage</span>
                    <span className={isCompleted ? 'text-emerald-400' : 'text-cyan-400'}>
                      {c.progressPercent}% de vidéos vues ({c.completedModules}/{c.totalModules} leçons)
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
      )}
    </div>
  );
}
