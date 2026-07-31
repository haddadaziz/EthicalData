"use client";

import React, { useState } from 'react';
import { Play, Calendar, Clock, User, Star, Video, CheckCircle, MessageSquare } from '@/components/icons';
import EvaluateTrainerModal from './EvaluateTrainerModal';

interface VisioSession {
  id: string;
  title: string;
  courseName: string;
  date: string;
  duration: string;
  trainerName: string;
  replayUrl: string;
  evaluated: boolean;
  userRating?: number;
}

const MOCK_REPLAYS: VisioSession[] = [
  {
    id: "v1",
    title: "Session Live #04 — Architecture & Déploiement Palo Alto Next-Gen Firewall",
    courseName: "Palo Alto Networks PCNSA Certification",
    date: "14 Juillet 2026",
    duration: "1h 45m",
    trainerName: "Dr. Tariq Berrada",
    replayUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    evaluated: true,
    userRating: 5
  },
  {
    id: "v2",
    title: "Session Live #02 — Configuration Pratique AWS VPC & Security Groups Advanced",
    courseName: "AWS Certified Security - Specialty",
    date: "22 Juillet 2026",
    duration: "2h 10m",
    trainerName: "Leila Naciri",
    replayUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    evaluated: false
  },
  {
    id: "v3",
    title: "Session Live #01 — Stratégies Pentest Web & OWASP Top 10 Hands-on",
    courseName: "Ethical Hacking & Pentest Specialist",
    date: "28 Juillet 2026",
    duration: "1h 30m",
    trainerName: "Dr. Tariq Berrada",
    replayUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    evaluated: false
  }
];

export default function ReplaysSection() {
  const [sessions, setSessions] = useState<VisioSession[]>(MOCK_REPLAYS);
  const [selectedVideo, setSelectedVideo] = useState<VisioSession | null>(null);
  const [evaluateSession, setEvaluateSession] = useState<VisioSession | null>(null);

  const handleRatingSubmitted = (sessionId: string, rating: number) => {
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, evaluated: true, userRating: rating } : s))
    );
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            <span>Replays Vidéo des Sessions Visioconférence</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Visionnez à tout moment les réplays intégraux de vos cours en direct et évaluez vos formateurs.
          </p>
        </div>

        <div className="px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full text-cyan-400 text-xs font-bold w-max">
          {sessions.length} Replays Disponibles
        </div>
      </div>

      {/* Grid of Replay Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            <div className="space-y-3">
              {/* Thumbnail / Video Preview Trigger */}
              <div
                onClick={() => setSelectedVideo(s)}
                className="relative h-40 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer group-hover:border-cyan-500/50 transition-all flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
                <div className="w-12 h-12 rounded-full bg-cyan-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative z-10">
                  <Play className="w-5 h-5 ml-0.5" />
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-[10px] font-bold text-slate-200 rounded">
                  {s.duration}
                </span>
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-cyan-950/90 border border-cyan-800/60 text-[10px] font-bold text-cyan-400 rounded">
                  Replay HD
                </span>
              </div>

              {/* Details */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 block">
                  {s.courseName}
                </span>
                <h4 className="text-sm font-black text-white leading-snug line-clamp-2">
                  {s.title}
                </h4>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Formateur : <strong className="text-slate-200">{s.trainerName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Session du {s.date}</span>
                </div>
              </div>
            </div>

            {/* Footer Action: Trainer Evaluation Status */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              {s.evaluated ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Formateur Évalué ({s.userRating}/5 ★)</span>
                </div>
              ) : (
                <button
                  onClick={() => setEvaluateSession(s)}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>Évaluer le Formateur</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-black text-white">{selectedVideo.title}</h4>
                <p className="text-xs text-cyan-400 font-bold">{selectedVideo.trainerName} — {selectedVideo.courseName}</p>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center relative shadow-inner">
              <video
                controls
                autoPlay
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80"
              >
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
                Votre navigateur ne prend pas en charge le lecteur vidéo HTML5.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      {evaluateSession && (
        <EvaluateTrainerModal
          isOpen={!!evaluateSession}
          onClose={() => setEvaluateSession(null)}
          session={evaluateSession}
          onSubmitted={(rating) => handleRatingSubmitted(evaluateSession.id, rating)}
        />
      )}
    </div>
  );
}
