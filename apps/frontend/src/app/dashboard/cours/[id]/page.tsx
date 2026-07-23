"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';
import {
  BookOpen, Clock, Users, ChevronLeft,
  CheckCircle, FileText, Target, ListChecks, DoorOpen, LogOut,
  ArrowLeft, ArrowRight, ExternalLink, Download, Trophy,
  Video, Link as LinkIcon
} from '@/components/icons';
import { useToast } from '../../../../context/ToastContext';
import { useConfirm } from '../../../../context/ConfirmContext';

interface Ressource {
  id: string; titre: string; description?: string; type: string; url: string; taille?: number;
}

interface Module {
  id: string; titre: string; description?: string; contenu?: string; ordre: number;
  dureeEstimee?: number; videoUrl?: string; ressources: Ressource[];
}

interface Cours {
  id: string; titre: string; description?: string; imageUrl?: string; videoUrl?: string;
  dureeEstimee?: number; datePublication: string; objectifs?: string[]; prerequis?: string[]; publicCible?: string[];
  certification: { nom: string; codeExamen?: string; fournisseur: { nom: string } };
  formateur?: { id: string; prenom: string; nom: string; avatar?: string };
  modules: Module[];
  _count?: { modules: number; inscriptions: number };
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [cours, setCours] = useState<Cours | null>(null);
  const [inscription, setInscription] = useState<any | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [quitting, setQuitting] = useState(false);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const coursId = params.id as string;

  useEffect(() => {
    (async () => {
      try {
        const [coursData, inscData, profileData] = await Promise.all([
          apiFetch(`/cours/${coursId}`),
          apiFetch('/cours/mes-inscriptions').catch(() => []),
          apiFetch('/users/me/profile').catch(() => null),
        ]);
        setCours(coursData);
        const insc = (Array.isArray(inscData) ? inscData : []).find((i: any) => i.cours?.id === coursId);
        setInscription(insc || null);
        if (profileData && profileData.roles) {
          setUserRoles(profileData.roles.map((r: any) => r.nom));
        }
      } catch {
        showToast("Impossible de charger le cours.", "error");
        router.push('/dashboard/cours');
      } finally { setLoading(false); }
    })();
  }, [coursId]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const insc = await apiFetch(`/cours/${coursId}/inscrire`, { method: 'POST' });
      setInscription(insc);
      showToast("Cours rejoint avec succès !", "success");
    } catch (err: any) {
      showToast(err.message || "Impossible de rejoindre ce cours.", "error");
    } finally { setJoining(false); }
  };

  const handleQuit = async () => {
    const confirmed = await confirm({
      title: "Quitter le cours",
      message: "Êtes-vous sûr de vouloir quitter ce cours ? Votre progression sera perdue.",
      confirmText: "Oui, quitter",
      cancelText: "Annuler",
      type: "danger",
    });
    if (!confirmed) return;
    setQuitting(true);
    try {
      await apiFetch(`/cours/${coursId}/inscrire`, { method: 'DELETE' });
      setInscription(null);
      showToast("Vous avez quitté le cours.", "info");
      router.push('/dashboard/cours');
    } catch (err: any) {
      showToast(err.message || "Erreur lors de la désinscription.", "error");
    } finally { setQuitting(false); }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400 gap-4">
        <span className="w-10 h-10 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-500">Chargement du cours...</p>
      </div>
    );
  }

  if (!cours) return null;

  const isEnrolled = !!inscription;
  const progression = inscription?.progression || 0;
  const modules = cours.modules || [];
  const activeModule = modules[activeModuleIdx];

  const renderContent = (() => {
    if (!activeModule?.contenu) return '';
    return renderMarkdown(activeModule.contenu);
  })();

  return (
    <div className="bg-[#020617]" style={{ overflowAnchor: 'none' }}>
      {/* Hero */}
      <div className="relative bg-[#020617] border-b border-slate-800/40">
        <div className="max-w-full mx-auto px-10 pt-8 pb-20">
          <button onClick={() => {
            const from = searchParams.get('from');
            if (from === 'explorer' || from === 'mes-cours' || from === 'termines') {
              router.push(`/dashboard/cours?tab=${from}`);
            } else { router.back(); }
          }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white font-bold transition-colors cursor-pointer mb-6">
            <ChevronLeft className="w-3.5 h-3.5" /> Retour
          </button>

          <div className="flex items-start gap-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded">{cours.certification?.fournisseur?.nom || 'Général'}</span>
                <span>{cours.certification?.nom || 'Certification'}</span>
              </div>

              <h1 className="text-3xl font-black text-white tracking-tight">{cours.titre}</h1>
              {cours.description && (
                <p className="text-sm text-slate-400 font-medium mt-2 max-w-2xl">{cours.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {cours.dureeEstimee || '?'} min</span>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {modules.length} module{modules.length > 1 ? 's' : ''}</span>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {cours._count?.inscriptions || 0} inscrits</span>
                {cours.formateur && (
                  <>
                    <span className="text-slate-700">•</span>
                    <span className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-blue-950/30 text-cyan-400 border border-blue-900/30 flex items-center justify-center text-[8px] font-black overflow-hidden">
                        {cours.formateur.avatar ? (
                          <img src={cours.formateur.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (cours.formateur.prenom?.[0] || 'F')}
                      </div>
                      Par {cours.formateur.prenom} {cours.formateur.nom}
                    </span>
                  </>
                )}
              </div>
            </div>
            {cours.imageUrl && (
              <div className="shrink-0 w-[280px] h-[180px] rounded-2xl overflow-hidden border border-slate-800/60 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <img src={cours.imageUrl} alt={cours.titre} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module timeline */}
      <div className="bg-[#020617] border-b border-slate-800/60">
        <div className="max-w-full mx-auto px-10 py-5">
          <div className="relative flex items-center justify-center gap-0 max-w-6xl mx-auto">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-slate-800 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-[width] duration-500"
                 style={{ width: modules.length > 1 ? `calc(${(activeModuleIdx / (modules.length - 1)) * 100}% - 0px)` : '0%' }} />

            <div className="relative flex justify-between items-center w-full">
              {modules.map((m, idx) => {
                const isActive = idx === activeModuleIdx;
                const isHovered = idx === hoveredIdx;
                return (
                  <div key={m.id} className="flex flex-col items-center relative">
                    <button
                      onClick={() => { setActiveModuleIdx(idx); if (contentRef.current) contentRef.current.scrollTop = 0; }}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className={`w-12 h-12 rounded-full border-[3px] font-black text-base flex items-center justify-center transition-[color,background-color,border-color,box-shadow,transform] duration-300 hover:scale-110 active:scale-95 shadow-md cursor-pointer relative z-30 ${
                        isActive
                          ? 'border-blue-600 bg-blue-600 text-white ring-8 ring-blue-950/50'
                          : 'border-slate-800 bg-[#020617] text-slate-500 hover:border-cyan-500 hover:text-cyan-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2">
                      Module {String(idx + 1).padStart(2, '0')}
                    </span>

                    {isHovered && (
                      <div
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        className="absolute bottom-[72px] left-1/2 -translate-x-1/2 w-64 bg-[#080d1a] border border-slate-700 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-4 z-50 text-left transition-opacity duration-150"
                      >
                        <div className="absolute bottom-[-7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#080d1a] border-r border-b border-slate-700 rotate-45" />
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Module {idx + 1}</span>
                          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {m.dureeEstimee || '?'} min
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white leading-snug">{m.titre}</h4>
                        {m.description && <p className="text-xs text-slate-400 font-medium mt-1 line-clamp-2">{m.description}</p>}
                        {m.ressources?.length > 0 && (
                          <p className="text-[10px] text-slate-500 font-semibold mt-2">{m.ressources.length} ressource{m.ressources.length > 1 ? 's' : ''}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div ref={contentRef} className="max-w-full mx-auto px-10 py-10 flex flex-col gap-8" style={{ overflowAnchor: 'none' }}>
        {isEnrolled || userRoles.includes('SUPER_ADMIN') ? (
          activeModule ? (
            <>
              {activeModule.videoUrl && (
                <div className="w-full bg-black rounded-2xl overflow-hidden"
                  style={{ aspectRatio: '16/9', transform: 'translateZ(0)', willChange: 'transform', contain: 'paint' }}>
                  <iframe src={activeModule.videoUrl} title={activeModule.titre}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              )}

              {activeModule.contenu ? (
                <div
                  className="prose prose-sm max-w-none
                    prose-headings:text-white prose-headings:font-black
                    prose-p:text-slate-400 prose-p:font-medium prose-p:leading-relaxed
                    prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-white
                    prose-code:text-cyan-300 prose-code:bg-blue-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs
                    prose-pre:bg-[#080d1a] prose-pre:text-slate-300 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl prose-pre:shadow-md
                    prose-li:text-slate-400 prose-li:font-medium
                    prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-950/20 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:text-slate-300 prose-blockquote:font-medium
                    prose-table:border-collapse prose-table:border prose-table:border-slate-800 prose-th:bg-slate-900 prose-th:text-slate-300 prose-th:font-bold prose-th:text-xs
                    prose-td:border prose-td:border-slate-800 prose-td:text-sm"
                  dangerouslySetInnerHTML={{ __html: renderContent }} />
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">Aucun contenu textuel pour ce module.</p>
                </div>
              )}

              {activeModule.ressources?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Ressources téléchargeables ({activeModule.ressources.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeModule.ressources.map((r, i) => (
                      <div key={r.id}
                        className="bg-[#020617] border border-slate-800 rounded-xl p-4 flex items-start gap-3 hover:border-slate-700 transition-[border-color] duration-200">
                        {(() => {
                          const imgMap: Record<string, string> = {
                            PDF: '/logos/pdf.webp', SLIDE: '/logos/slides.png',
                            EXERCICE: '/logos/exercice.png', DATASET: '/logos/dataset.png',
                          };
                          const iconMap: Record<string, React.ReactNode> = {
                            VIDEO: <Video className="w-5 h-5" />,
                            LIEN_EXTERNE: <LinkIcon className="w-5 h-5" />,
                          };
                          const bgMap: Record<string, string> = {
                            PDF: 'bg-blue-950/40', SLIDE: 'bg-amber-950/40',
                            EXERCICE: 'bg-indigo-950/40', DATASET: 'bg-green-950/40',
                            VIDEO: 'bg-purple-950/40', LIEN_EXTERNE: 'bg-blue-950/40',
                          };
                          if (imgMap[r.type]) {
                            return <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bgMap[r.type] || 'bg-slate-800'}`}>
                              <img src={imgMap[r.type]} alt={r.type} className="w-5 h-5 object-contain" />
                            </span>;
                          }
                          const iconEl = iconMap[r.type] || <FileText className="w-5 h-5" />;
                          const bg = bgMap[r.type] || 'bg-slate-800';
                          return <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>{iconEl}</span>;
                        })()}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-bold text-white truncate">{r.titre}</h4>
                          <div className="flex items-center gap-3 mt-2">
                            <a href={r.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                              {r.type === 'LIEN_EXTERNE' ? <><ExternalLink className="w-3 h-3" /> Ouvrir</> : <><Download className="w-3 h-3" /> Télécharger</>}
                            </a>
                            {r.taille && <span className="text-[9px] text-slate-500 font-semibold">{formatSize(r.taille)}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button onClick={() => { setActiveModuleIdx(p => Math.max(0, p - 1)); if (contentRef.current) contentRef.current.scrollTop = 0; }}
                  disabled={activeModuleIdx <= 0}
                  className="px-4 py-2 text-slate-400 hover:text-white bg-[#020617] border border-slate-800 hover:border-slate-700 text-xs font-black rounded-xl transition-[color,background-color,border-color] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" /> Précédent
                </button>

                {activeModuleIdx < modules.length - 1 ? (
                  <button onClick={() => { setActiveModuleIdx(p => Math.min(modules.length - 1, p + 1)); if (contentRef.current) contentRef.current.scrollTop = 0; }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-[background-color] cursor-pointer inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                    Suivant <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl px-4 py-2 text-emerald-500 text-xs font-black flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" /> Félicitations — Fin du cours
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 py-24">
              <BookOpen className="w-12 h-12 text-slate-800 mb-3" />
              <p className="text-sm font-semibold">Aucun module disponible.</p>
            </div>
          )
        ) : (
          <>
            {cours.objectifs && cours.objectifs.length > 0 && (
              <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" /> Objectifs d'apprentissage
                </h3>
                <ul className="space-y-2">
                  {cours.objectifs.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-slate-400 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cours.prerequis && cours.prerequis.length > 0 && (
              <div className="bg-[#080d1a] border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-amber-500" /> Prérequis
                </h3>
                <ul className="space-y-2">
                  {cours.prerequis.map((pre, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-slate-400 font-medium">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 shrink-0" />
                      {pre}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="bg-[#080d1a] border border-blue-900/40 rounded-2xl p-8 text-white text-center space-y-4 shadow-[0_0_20px_rgba(37,99,235,0.15)] overflow-hidden">
              <h2 className="text-xl font-black">Prêt à commencer ?</h2>
              <p className="text-sm text-slate-400 font-medium max-w-md mx-auto">
                Rejoignez ce cours et commencez votre formation dès maintenant.
              </p>
              <button onClick={handleJoin} disabled={joining}
                className="px-8 py-3 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-[background-color] cursor-pointer disabled:opacity-60 inline-flex items-center gap-2">
                {joining ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><DoorOpen className="w-4 h-4" /> Rejoindre le cours</>
                )}
              </button>
            </div>
          </>
        )}

        {isEnrolled && (
          <div className="text-center">
            <button onClick={handleQuit} disabled={quitting}
              className="text-[11px] font-bold text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5">
              {quitting ? (
                <span className="w-3.5 h-3.5 border-2 border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
              ) : (
                <><LogOut className="w-3.5 h-3.5" /> Quitter le cours</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───── Markdown Renderer ───── */
function renderMarkdown(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = escaped.split('\n');
  const html: string[] = [];
  let inList = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const closing = lines.indexOf('```', i + 1);
      if (closing !== -1) { html.push(`<pre><code>${lines.slice(i + 1, closing).join('\n')}</code></pre>`); i = closing; continue; }
    }
    const tableMatch = line.match(/^\|(.+)\|$/);
    if (tableMatch) {
      const cells = tableMatch[1].split('|').map(c => c.trim());
      if (cells.every(c => /^[-:\s]+$/.test(c))) continue;
      const nextLine = lines[i + 1];
      if (nextLine && /^\|[-:\s|]+\|$/.test(nextLine)) {
        html.push('<table><thead><tr>' + cells.map(c => `<th>${processInline(c)}</th>`).join('') + '</tr></thead><tbody>');
        i++;
        while (i + 1 < lines.length) { const dl = lines[i + 1]; if (!/^\|(.+)\|$/.test(dl)) break; i++; html.push('<tr>' + dl.slice(1, -1).split('|').map(c => `<td>${processInline(c.trim())}</td>`).join('') + '</tr>'); }
        html.push('</tbody></table>');
        continue;
      }
    }
    if (/^\{\{ressource:/.test(line.trim())) {
      const match = line.trim().match(/\{\{ressource:(.+?):(.+?):(.+?)\}\}/);
      if (match) {
        const [, resTitle, resType, resUrl] = match;
        const colors: Record<string, string> = { PDF: 'bg-blue-950/20 border-blue-900/50 text-cyan-400 hover:bg-blue-950/40', VIDEO: 'bg-purple-950/20 border-purple-900/50 text-purple-500 hover:bg-purple-950/40', SLIDE: 'bg-amber-950/20 border-amber-900/50 text-amber-500 hover:bg-amber-950/40', DATASET: 'bg-green-950/20 border-green-900/50 text-green-500 hover:bg-green-950/40', LIEN_EXTERNE: 'bg-blue-950/20 border-blue-900/50 text-blue-500 hover:bg-blue-950/40', EXERCICE: 'bg-indigo-950/20 border-indigo-900/50 text-indigo-500 hover:bg-indigo-950/40' };
        const icons: Record<string, string> = { PDF: '📄', VIDEO: '▶️', SLIDE: '📊', DATASET: '🗄️', LIEN_EXTERNE: '🔗', EXERCICE: '💻' };
        html.push(`<div class="my-4 inline-block"><a href="${resUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-3 px-4 py-3 rounded-xl border ${colors[resType] || 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'} transition-all duration-200 shadow-sm hover:shadow-md no-underline !text-inherit"><span class="text-lg">${icons[resType] || '📎'}</span><div class="flex flex-col"><span class="text-xs font-bold">${resTitle}</span><span class="text-[9px] font-semibold opacity-70">${resType} — ${resType === 'LIEN_EXTERNE' ? 'Ouvrir' : resType === 'EXERCICE' ? "Faire l'exercice" : 'Télécharger'}</span></div></a></div>`);
        continue;
      }
    }
    const bqMatch = line.match(/^>\s*(.+)/);
    if (bqMatch) {
      const bqLines: string[] = [bqMatch[1]];
      while (i + 1 < lines.length && lines[i + 1].startsWith('>')) { bqLines.push(lines[i + 1].slice(1).trim()); i++; }
      html.push(`<blockquote><p>${bqLines.map(l => processInline(l)).join('<br/>')}</p></blockquote>`);
      continue;
    }
    const hMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (hMatch) { html.push(`<h${hMatch[1].length}>${processInline(hMatch[2])}</h${hMatch[1].length}>`); continue; }
    const lMatch = line.match(/^[-*]\s+(.+)/);
    if (lMatch) { if (!inList) { html.push('<ul>'); inList = true; } html.push(`<li>${processInline(lMatch[1])}</li>`); continue; }
    if (inList) { html.push('</ul>'); inList = false; }
    const nlMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (nlMatch) { html.push(`<p class="flex items-baseline gap-2"><span class="w-5 h-5 rounded-full bg-blue-950/30 text-cyan-400 border border-blue-900/30 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">${nlMatch[1]}</span><span>${processInline(nlMatch[2])}</span></p>`); continue; }
    if (!line.trim()) continue;
    html.push(`<p>${processInline(line)}</p>`);
  }
  if (inList) html.push('</ul>');
  return html.join('\n');
}

function processInline(text: string): string {
  return text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/✅/g, '<span class="text-emerald-500">✅</span>').replace(/❌/g, '<span class="text-cyan-400">❌</span>');
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
}
