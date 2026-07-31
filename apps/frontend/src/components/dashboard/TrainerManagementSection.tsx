"use client";

import React, { useState } from 'react';
import { Users, Calendar, CheckCircle, Upload, Video, ShieldCheck, Award, Clock, Star, FileText } from '@/components/icons';
import { useToast } from '@/context/ToastContext';

interface StudentEnrollment {
  id: string;
  studentName: string;
  email: string;
  courseTitle: string;
  sessionDate: string;
  attendanceValidated: boolean;
  scorePercent?: number;
  attestationGenerated: boolean;
}

interface LiveSession {
  id: string;
  title: string;
  date: string;
  time: string;
  enrolledCount: number;
  maxCapacity: number;
  teamsLink: string;
  status: 'A_VENIR' | 'EN_COURS' | 'TERMINEE';
}

const MOCK_STUDENTS: StudentEnrollment[] = [
  {
    id: "e1",
    studentName: "Karim Bennani",
    email: "karim.bennani@exemple.ma",
    courseTitle: "Palo Alto Networks PCNSA & Security Architecture",
    sessionDate: "28 Juillet 2026",
    attendanceValidated: true,
    scorePercent: 88,
    attestationGenerated: true
  },
  {
    id: "e2",
    studentName: "Siham Oufkir",
    email: "siham.oufkir@exemple.ma",
    courseTitle: "AWS Certified Security - Specialty",
    sessionDate: "30 Juillet 2026",
    attendanceValidated: false,
    attestationGenerated: false
  },
  {
    id: "e3",
    studentName: "Omar Tazi",
    email: "omar.tazi@entreprise.ma",
    courseTitle: "Palo Alto Networks PCNSA & Security Architecture",
    sessionDate: "28 Juillet 2026",
    attendanceValidated: true,
    scorePercent: 92,
    attestationGenerated: true
  }
];

const MOCK_SESSIONS: LiveSession[] = [
  {
    id: "s1",
    title: "Session Live #05 — Palo Alto PCNSA Next-Gen Firewall Practice",
    date: "31 Juillet 2026",
    time: "16:00 - 18:00",
    enrolledCount: 14,
    maxCapacity: 20,
    teamsLink: "https://teams.microsoft.com/l/meetup-join/eds-session-pcnsa",
    status: "A_VENIR"
  },
  {
    id: "s2",
    title: "Session Live #04 — Pentest Web & OWASP Top 10 Exploitation",
    date: "28 Juillet 2026",
    time: "14:00 - 16:00",
    enrolledCount: 18,
    maxCapacity: 20,
    teamsLink: "https://teams.microsoft.com/l/meetup-join/eds-session-pentest",
    status: "TERMINEE"
  }
];

export default function TrainerManagementSection() {
  const { showToast } = useToast();
  const [students, setStudents] = useState<StudentEnrollment[]>(MOCK_STUDENTS);
  const [sessions] = useState<LiveSession[]>(MOCK_SESSIONS);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([
    "Support_PaloAlto_PCNSA_v2.pdf",
    "TP_Lab_AWS_Security_Groups.pdf"
  ]);

  // Handle Manual Attendance Validation
  const handleValidateAttendance = (studentId: string) => {
    let studentName = '';
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          studentName = s.studentName;
          return { ...s, attendanceValidated: true, attestationGenerated: true };
        }
        return s;
      })
    );

    if (studentName) {
      showToast(`Présence validée pour ${studentName} ! Attestation de formation générée automatiquement.`, "success");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);

    setTimeout(() => {
      setUploading(false);
      setUploadedFiles(prev => [...prev, file.name]);
      showToast(`Support "${file.name}" importé avec succès pour vos apprenants !`, "success");
    }, 1000);
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* KPI STATS FORMATEUR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 space-y-1 shadow-xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Taux de Présence</span>
          <div className="text-3xl font-black text-emerald-400">96.4%</div>
          <span className="text-[10px] text-slate-500 font-bold">Calculé sur vos 10 dernières sessions</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 space-y-1 shadow-xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Taux de Réussite Examens</span>
          <div className="text-3xl font-black text-cyan-400">91.8%</div>
          <span className="text-[10px] text-slate-500 font-bold">Apprenants admis au score &gt; 70%</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 space-y-1 shadow-xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Attestations Générées</span>
          <div className="text-3xl font-black text-white">{students.filter(s => s.attestationGenerated).length}</div>
          <span className="text-[10px] text-slate-500 font-bold">Validations de présence effectuées</span>
        </div>

        <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 space-y-1 shadow-xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Note Formateur</span>
          <div className="text-3xl font-black text-amber-400">4.9 / 5 ★</div>
          <span className="text-[10px] text-slate-500 font-bold">Moyenne des évaluations apprenants</span>
        </div>
      </div>

      {/* SECTION 1: GESTION DES SESSIONS LIVE TEAMS & CALENDRIER */}
      <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full">
              Microsoft Teams Sync
            </span>
            <h3 className="text-xl font-black text-white pt-2">Sessions Live Visioconférence Planifiées</h3>
            <p className="text-xs text-slate-400">Liens de session Microsoft Teams générés automatiquement pour les apprenants inscrits.</p>
          </div>
        </div>

        <div className="space-y-4">
          {sessions.map((s) => (
            <div key={s.id} className="p-4 bg-[#030712] border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    s.status === 'A_VENIR' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {s.status === 'A_VENIR' ? 'Prochaine Session' : 'Terminée (Replay Dispo)'}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{s.date} ({s.time})</span>
                </div>
                <h4 className="text-base font-black text-white">{s.title}</h4>
                <p className="text-xs text-slate-400">Inscrits: <strong className="text-cyan-400">{s.enrolledCount} / {s.maxCapacity} Apprenants</strong> (Places Limitées)</p>
              </div>

              <a
                href={s.teamsLink}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 shrink-0"
              >
                <Video className="w-4 h-4" />
                <span>Ouvrir dans Teams</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: LISTE DES APPRENANTS & VALIDATION MANUELLE DE PRÉSENCE */}
      <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="border-b border-slate-800 pb-4 space-y-1">
          <h3 className="text-xl font-black text-white">Validation de Présence & Attestations</h3>
          <p className="text-xs text-slate-400">
            Validez la présence des apprenants à la fin d&apos;une session live pour déclencher automatiquement la génération de leur <strong className="text-white">Attestation de Formation</strong>.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#030712] border-b border-slate-800 text-slate-400 uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Apprenant</th>
                <th className="p-3.5">Formation Suivie</th>
                <th className="p-3.5">Date Session</th>
                <th className="p-3.5 text-center">Score Examen Blanc</th>
                <th className="p-3.5 text-center">Présence Validée</th>
                <th className="p-3.5 text-right">Action Formateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium text-slate-300">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-black text-white">{st.studentName}</div>
                    <div className="text-[10px] text-slate-400">{st.email}</div>
                  </td>
                  <td className="p-3.5 font-bold text-slate-200">{st.courseTitle}</td>
                  <td className="p-3.5 text-slate-400">{st.sessionDate}</td>
                  <td className="p-3.5 text-center">
                    {st.scorePercent ? (
                      <span className="font-black text-emerald-400">{st.scorePercent}%</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">En attente</span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {st.attendanceValidated ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[10px]">
                        ✓ Validée
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold text-[10px]">
                        Non Validée
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {st.attendanceValidated ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Attestation Transmise</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleValidateAttendance(st.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded-lg text-xs transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        Valider Présence
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: UPLOAD DE SUPPORTS DE COURS (PDF, SLIDES, TP) */}
      <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="border-b border-slate-800 pb-4 space-y-1">
          <h3 className="text-xl font-black text-white">Upload de Supports de Cours & Travaux Pratiques</h3>
          <p className="text-xs text-slate-400">Déposez les présentations, fiches récapitulatives et fichiers de lab pour vos étudiants.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <label className="p-8 border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl bg-[#030712] flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors text-center">
            <Upload className="w-8 h-8 text-cyan-400 animate-bounce" />
            <div>
              <span className="text-xs font-black text-white block">Glisser-déposer vos supports PDF/Slides</span>
              <span className="text-[10px] text-slate-400">Formats acceptés : PDF, ZIP, PPTX (Max 100 Mo)</span>
            </div>
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="space-y-3 bg-[#030712] p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Fichiers Déjà Mis en Ligne</span>
            <div className="space-y-2">
              {uploadedFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-[#080d1a] border border-slate-800 rounded-xl text-xs">
                  <span className="font-bold text-slate-200 truncate flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{file}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold shrink-0">Disponible</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
