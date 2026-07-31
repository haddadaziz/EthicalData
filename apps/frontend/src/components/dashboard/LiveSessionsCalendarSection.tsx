"use client";

import React, { useState } from 'react';
import { Calendar, Filter, Video, Clock, User, CheckCircle, Play, ChevronRight, Award, Search, Sparkles, BookOpen } from '@/components/icons';
import { useToast } from '@/context/ToastContext';

interface LiveSession {
  id: string;
  title: string;
  certification: string;
  theme: string;
  trainerName: string;
  trainerRole: string;
  date: string;
  time: string;
  durationMinutes: number;
  availableSeats: number;
  totalSeats: number;
  teamsLink: string;
  status: 'A_VENIR' | 'EN_DIRECT' | 'TERMINE';
  replayVideoUrl?: string;
  isRegistered: boolean;
}

const MOCK_LIVE_SESSIONS: LiveSession[] = [
  {
    id: "live-1",
    title: "Session Live : WildFire & Profils Anti-Threats Advanced",
    certification: "Palo Alto Networks PCNSA",
    theme: "Cybersécurité Périmétrique",
    trainerName: "Dr. Tariq Berrada",
    trainerRole: "Lead Expert Palo Alto Certified",
    date: "Aujourd'hui, 31 Juillet 2026",
    time: "15:00 - 17:00 (GMT+1)",
    durationMinutes: 120,
    availableSeats: 3,
    totalSeats: 25,
    teamsLink: "https://teams.microsoft.com",
    status: "EN_DIRECT",
    replayVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isRegistered: true
  },
  {
    id: "live-[#2]",
    title: "Session Live : KMS Key Policies & S3 Bucket Encryption Rules",
    certification: "AWS Certified Security",
    theme: "Cloud Security & Governance",
    trainerName: "Leila Naciri",
    trainerRole: "AWS Cloud Architect & Trainer",
    date: "Demain, 01 Août 2026",
    time: "10:00 - 12:00 (GMT+1)",
    durationMinutes: 120,
    availableSeats: 8,
    totalSeats: 30,
    teamsLink: "https://teams.microsoft.com",
    status: "A_VENIR",
    isRegistered: true
  },
  {
    id: "live-3",
    title: "Session Live : Atelier Pratique ISO 27001 - Rédaction du SMSI",
    certification: "PECB ISO 27001 Lead Implementer",
    theme: "Gouvernance & Conformité",
    trainerName: "Dr. Tariq Berrada",
    trainerRole: "Senior Auditor & PECB Trainer",
    date: "03 Août 2026",
    time: "14:00 - 16:30 (GMT+1)",
    durationMinutes: 150,
    availableSeats: 12,
    totalSeats: 20,
    teamsLink: "https://teams.microsoft.com",
    status: "A_VENIR",
    isRegistered: false
  },
  {
    id: "live-4",
    title: "Replay Session Pasée : Architecture Palo Alto Next-Gen Firewall",
    certification: "Palo Alto Networks PCNSA",
    theme: "Cybersécurité Périmétrique",
    trainerName: "Mehdi Kabbaj",
    trainerRole: "Network Security Specialist",
    date: "25 Juillet 2026",
    time: "Session Terminée (Enregistrée en HD)",
    durationMinutes: 110,
    availableSeats: 0,
    totalSeats: 25,
    teamsLink: "https://teams.microsoft.com",
    status: "TERMINE",
    replayVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    isRegistered: true
  }
];

export default function LiveSessionsCalendarSection() {
  const [sessions, setSessions] = useState<LiveSession[]>(MOCK_LIVE_SESSIONS);
  const [selectedCert, setSelectedCert] = useState<string>('TOUS');
  const [selectedTheme, setSelectedTheme] = useState<string>('TOUS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeReplayVideo, setActiveReplayVideo] = useState<{ title: string; url: string } | null>(null);

  const { showToast } = useToast();

  const uniqueCerts = Array.from(new Set(sessions.map(s => s.certification)));
  const uniqueThemes = Array.from(new Set(sessions.map(s => s.theme)));

  const filteredSessions = sessions.filter(s => {
    const matchesCert = selectedCert === 'TOUS' || s.certification === selectedCert;
    const matchesTheme = selectedTheme === 'TOUS' || s.theme === selectedTheme;
    const matchesSearch = !searchTerm || s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.trainerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCert && matchesTheme && matchesSearch;
  });

  const handleRegister = (sessionId: string) => {
    let actionType: 'REGISTER' | 'UNREGISTER' = 'REGISTER';

    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const newRegistered = !s.isRegistered;
        actionType = newRegistered ? 'REGISTER' : 'UNREGISTER';
        return {
          ...s,
          isRegistered: newRegistered,
          availableSeats: newRegistered ? s.availableSeats - 1 : s.availableSeats + 1
        };
      }
      return s;
    }));

    if (actionType === 'REGISTER') {
      showToast(`Inscription réussie à la session live ! Un lien Teams automatique vous a été attribué.`, 'success');
    } else {
      showToast(`Désinscription effectuée pour cette session.`, 'info');
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span>Calendrier des Sessions Live & Replays Automatiques</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Rejoignez les visioconférences Teams interactives ou visionnez l&apos;enregistrement automatique mis à disposition après chaque session.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#030712] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-slate-400" />
        
        {/* Certification Filter */}
        <select
          value={selectedCert}
          onChange={(e) => setSelectedCert(e.target.value)}
          className="bg-[#080d1a] border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
        >
          <option value="TOUS">Toutes les Certifications</option>
          {uniqueCerts.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Theme Filter */}
        <select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          className="bg-[#080d1a] border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer"
        >
          <option value="TOUS">Tous les Thèmes</option>
          {uniqueThemes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par titre ou formateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#080d1a] border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSessions.map((session) => {
          const isLiveNow = session.status === 'EN_DIRECT';
          const isFinished = session.status === 'TERMINE';

          return (
            <div
              key={session.id}
              className={`bg-[#080d1a] border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden text-left flex flex-col justify-between transition-all ${
                isLiveNow
                  ? 'border-cyan-500/80 shadow-cyan-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-2.5 py-0.5 bg-cyan-950 border border-cyan-800/60 rounded-full">
                    {session.certification}
                  </span>

                  {isLiveNow ? (
                    <span className="px-3 py-0.5 bg-red-950/90 text-red-400 font-extrabold text-[10px] rounded-full border border-red-800/80">
                      SESSION EN DIRECT TEAMS
                    </span>
                  ) : isFinished ? (
                    <span className="px-2.5 py-0.5 bg-emerald-950/80 text-emerald-400 font-extrabold text-[10px] rounded-full border border-emerald-800/60">
                      Session Enregistrée (Replay Dispo)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-blue-950/80 text-blue-400 font-extrabold text-[10px] rounded-full border border-blue-800/60">
                      Session Live Planifiée
                    </span>
                  )}
                </div>

                <h4 className="text-base font-black text-white leading-snug">
                  {session.title}
                </h4>

                <div className="text-xs text-slate-400 space-y-1">
                  <p>
                    <span><strong>Date & Horaire :</strong> {session.date} • {session.time}</span>
                  </p>
                  <p>
                    <span><strong>Formateur :</strong> {session.trainerName} ({session.trainerRole})</span>
                  </p>
                </div>

                {/* Places & Details */}
                <div className="flex items-center justify-between text-xs bg-[#030712] border border-slate-800 p-3 rounded-2xl">
                  <span className="text-slate-300 font-medium">Thème : <strong className="text-white">{session.theme}</strong></span>
                  {!isFinished && (
                    <span className="text-cyan-400 font-bold text-[11px]">
                      {session.availableSeats} places restantes / {session.totalSeats}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
                {isLiveNow ? (
                  <a
                    href={session.teamsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/25"
                  >
                    <Video className="w-4 h-4" />
                    <span>Rejoindre la Visio Direct Teams</span>
                  </a>
                ) : isFinished ? (
                  session.replayVideoUrl && (
                    <button
                      type="button"
                      onClick={() => setActiveReplayVideo({ title: session.title, url: session.replayVideoUrl! })}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                    >
                      <Play className="w-4 h-4" />
                      <span>Visionner le Replay Vidéo HD</span>
                    </button>
                  )
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRegister(session.id)}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        session.isRegistered
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-900/50'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                      }`}
                    >
                      {session.isRegistered ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Inscrit • Lien Teams Généré</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          <span>S&apos;inscrire à la Session</span>
                        </>
                      )}
                    </button>

                    {session.isRegistered && (
                      <a
                        href={session.teamsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 rounded-xl text-xs font-bold transition-all text-center shrink-0"
                      >
                        Rejoindre Teams
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Replay Modal */}
      {activeReplayVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-4 text-left shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-black text-white truncate pr-4">
                Replay Vidéo : {activeReplayVideo.title}
              </h4>
              <button
                onClick={() => setActiveReplayVideo(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800">
              <video
                src={activeReplayVideo.url}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
