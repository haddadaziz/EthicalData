"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Edit, Trash2, Activity, BookOpen, Award, Sparkles, Clock } from '@/components/icons';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { apiFetch } from '../../../lib/api';

interface CertificationInfo {
    id: string;
    nom: string;
    codeExamen: string;
    image?: string;
}

interface CourseInfo {
    id: string;
    titre: string;
}

interface QuestionOption {
    id?: string;
    lettre: string;
    texte: string;
}

interface Question {
    id: string;
    type: string;
    enonce: string;
    reponseCorrecte: string;
    explication?: string;
    categorie?: string;
    grilleNotation?: string;
    options?: QuestionOption[];
}

interface SimulationData {
    id: string;
    titre: string;
    description?: string | null;
    duree: number;
    scoreMinimal: number;
    certificationId: string;
    certification?: { id: string; nom: string; codeExamen: string } | null;
    coursId?: string | null;
    cours?: { id: string; titre: string } | null;
    statut?: string;
    _count: { questions: number; tentatives: number };
    questions?: Question[];
}

interface SimulationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    editingSim?: SimulationData | null;
    certifications: CertificationInfo[];
    coursesList: CourseInfo[];
}

export function SimulationFormModal({ isOpen, onClose, onSaved, editingSim, certifications, coursesList }: SimulationFormModalProps) {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<'DETAILS' | 'QUESTIONS'>('DETAILS');

    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [duree, setDuree] = useState('60');
    const [scoreMinimal, setScoreMinimal] = useState('700');
    const [certificationId, setCertificationId] = useState('');
    const [coursId, setCoursId] = useState('');

    const [questionsList, setQuestionsList] = useState<Question[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [editingQ, setEditingQ] = useState<Question | null>(null);
    const [qType, setQType] = useState('QCM');
    const [qEnonce, setQEnonce] = useState('');
    const [qReponse, setQReponse] = useState('A');
    const [qExplication, setQExplication] = useState('');
    const [qCategorie, setQCategorie] = useState('');
    const [qGrille, setQGrille] = useState('');
    const [qOptA, setQOptA] = useState('');
    const [qOptB, setQOptB] = useState('');
    const [qOptC, setQOptC] = useState('');
    const [qOptD, setQOptD] = useState('');
    const [qError, setQError] = useState<string | null>(null);
    const [qLoading, setQLoading] = useState(false);

    const isEditing = !!editingSim;
    const selectedCert = certifications.find(c => c.id === certificationId);
    const selectedCourse = coursesList.find(c => c.id === coursId);
    const certImage = (selectedCert as any)?.image || '';

    useEffect(() => {
        if (isOpen && editingSim) {
            setTitre(editingSim.titre);
            setDescription(editingSim.description || '');
            setDuree(editingSim.duree.toString());
            setScoreMinimal(editingSim.scoreMinimal.toString());
            setCertificationId(editingSim.certificationId);
            setCoursId(editingSim.coursId || '');
            loadQuestions(editingSim.id);
        } else if (isOpen) {
            resetForm();
        }
    }, [isOpen, editingSim]);

    const resetForm = () => {
        setTitre('');
        setDescription('');
        setDuree('60');
        setScoreMinimal('700');
        setCertificationId('');
        setCoursId('');
        setQuestionsList([]);
        setError(null);
        setActiveSection('DETAILS');
        setShowQuestionForm(false);
        setEditingQ(null);
        resetQForm();
    };

    const resetQForm = () => {
        setQType('QCM');
        setQEnonce('');
        setQReponse('A');
        setQExplication('');
        setQCategorie('');
        setQGrille('');
        setQOptA('');
        setQOptB('');
        setQOptC('');
        setQOptD('');
        setQError(null);
    };

    const loadQuestions = async (simId: string) => {
        setLoadingQuestions(true);
        try {
            const data = await apiFetch(`/simulations/${simId}/questions`);
            setQuestionsList(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const handleSave = async (statut: string) => {
        if (!certificationId) { setError('Veuillez sélectionner une certification.'); return; }
        if (statut === 'PUBLIE' && questionsList.length < 5) { setError('Minimum 5 questions requises pour publier.'); return; }
        setSaving(true); setError(null);
        try {
            const body = { titre, description: description || undefined, duree: parseInt(duree), scoreMinimal: parseInt(scoreMinimal), certificationId: Number(certificationId), coursId: coursId ? Number(coursId) : undefined, statut };
            if (isEditing && editingSim) await apiFetch(`/simulations/${editingSim.id}`, { method: 'PATCH', body });
            else await apiFetch('/simulations', { method: 'POST', body });
            onSaved(); onClose();
        } catch (err: any) { setError(err.message || 'Erreur.'); }
        finally { setSaving(false); }
    };

    const handleSaveQuestion = async (e: React.FormEvent) => {
        e.preventDefault(); setQError(null);
        if (!qEnonce.trim()) { setQError('Veuillez saisir un énoncé.'); return; }
        if (qType === 'QCM' && (!qOptA || !qOptB || !qOptC || !qOptD)) { setQError('Remplissez les options A, B, C et D.'); return; }
        if ((qType === 'OUVERTE' || qType === 'CAS_PRATIQUE') && !qGrille.trim()) { setQError('Grille de notation requise.'); return; }
        setQLoading(true);
        try {
            const options = qType === 'QCM' ? [{ lettre: 'A', texte: qOptA }, { lettre: 'B', texte: qOptB }, { lettre: 'C', texte: qOptC }, { lettre: 'D', texte: qOptD }] : qType === 'VRAI_FAUX' ? [{ lettre: 'A', texte: 'Vrai' }, { lettre: 'B', texte: 'Faux' }] : undefined;
            const payload = { type: qType, enonce: qEnonce, reponseCorrecte: (qType === 'OUVERTE' || qType === 'CAS_PRATIQUE') ? undefined : qReponse, explication: qExplication || undefined, categorie: qCategorie || undefined, grilleNotation: (qType === 'OUVERTE' || qType === 'CAS_PRATIQUE') ? qGrille : undefined, options };
            if (editingQ) { await apiFetch(`/simulations/questions/${editingQ.id}`, { method: 'PATCH', body: payload }); if (editingSim) await loadQuestions(editingSim.id); }
            else if (editingSim) { await apiFetch(`/simulations/${editingSim.id}/questions`, { method: 'POST', body: payload }); await loadQuestions(editingSim.id); }
            else {
                const created = await apiFetch('/simulations', { method: 'POST', body: { titre: titre || 'Brouillon', description: description || undefined, duree: parseInt(duree), scoreMinimal: parseInt(scoreMinimal), certificationId: Number(certificationId), coursId: coursId ? Number(coursId) : undefined, statut: 'BROUILLON' } });
                if (created?.id) { await apiFetch(`/simulations/${created.id}/questions`, { method: 'POST', body: payload }); await loadQuestions(created.id); onSaved(); }
            }
            resetQForm(); setShowQuestionForm(false); setEditingQ(null);
            showToast('Question enregistrée avec succès', 'success');
        } catch (err: any) { setQError(err.message || 'Erreur.'); }
        finally { setQLoading(false); }
    };

    const handleEditQuestion = (q: Question) => {
        setEditingQ(q); setQType(q.type || 'QCM'); setQEnonce(q.enonce || ''); setQReponse(q.reponseCorrecte || 'A');
        setQExplication(q.explication || ''); setQCategorie(q.categorie || ''); setQGrille(q.grilleNotation || '');
        if (q.options) { setQOptA(q.options.find(o => o.lettre === 'A')?.texte || ''); setQOptB(q.options.find(o => o.lettre === 'B')?.texte || ''); setQOptC(q.options.find(o => o.lettre === 'C')?.texte || ''); setQOptD(q.options.find(o => o.lettre === 'D')?.texte || ''); }
        else { setQOptA(''); setQOptB(''); setQOptC(''); setQOptD(''); }
        setShowQuestionForm(true); setQError(null);
    };

    const handleDeleteQuestion = async (qId: string) => {
        const ok = await confirm({
            title: 'Supprimer cette question ?',
            message: 'Voulez-vous vraiment supprimer cette question ? Cette action est irréversible.',
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            type: 'danger',
        });
        if (!ok) return;
        try { await apiFetch(`/simulations/questions/${qId}`, { method: 'DELETE' }); setQuestionsList(prev => prev.filter(q => q.id !== qId)); }
        catch (err: any) { alert(err.message || 'Erreur.'); }
    };

    const getTypeBadge = (type: string) => {
        if (type === 'QCM') return 'bg-blue-100 text-blue-700';
        if (type === 'VRAI_FAUX') return 'bg-amber-100 text-amber-700';
        if (type === 'OUVERTE') return 'bg-emerald-100 text-emerald-700';
        if (type === 'CAS_PRATIQUE') return 'bg-purple-100 text-purple-700';
        return 'bg-slate-100 text-slate-700';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { if (!saving && !qLoading) onClose(); }}
                className="fixed inset-0 bg-slate-900/80 will-change-auto"
            />
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="bg-slate-50 border border-slate-200/80 w-full max-w-5xl rounded-[32px] shadow-2xl relative z-10 flex flex-col md:max-h-[90vh] max-h-none overflow-visible md:overflow-hidden will-change-auto my-auto"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white relative z-20">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border-blue-100 text-blue-600 flex items-center justify-center">
                            {isEditing ? <Edit className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                        </div>
                        <div className="text-left">
                            <h2 className="text-xl font-black text-slate-950 leading-tight">
                                {isEditing ? 'Modifier la simulation' : 'Nouvelle simulation'}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {isEditing ? 'Modifiez les paramètres et gérez les questions.' : 'Configurez une nouvelle simulation et ajoutez ses questions.'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => { if (!saving && !qLoading) { onClose(); resetForm(); } }} disabled={saving || qLoading}
                        className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-950 rounded-xl transition-all cursor-pointer disabled:opacity-50">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden">
                    {/* GAUCHE : onglets et formulaire */}
                    <div className="p-5 md:p-8 w-full md:w-1/2 md:overflow-y-auto text-left">
                        {error && (
                            <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold mb-5">{error}</div>
                        )}

                        {/* Tabs */}
                        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3 mb-6">
                            <button
                                onClick={() => setActiveSection('DETAILS')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider ${activeSection === 'DETAILS' ? 'bg-slate-950 text-white shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200/80'}`}
                            >
                                Détails
                            </button>
                            <button
                                onClick={() => { setActiveSection('QUESTIONS'); if (isEditing && editingSim && questionsList.length === 0) loadQuestions(editingSim.id); }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider ${activeSection === 'QUESTIONS' ? 'bg-slate-950 text-white shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200/80'}`}
                            >
                                Questions
                            </button>
                        </div>

                        {activeSection === 'DETAILS' && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Titre *</label>
                                    <input type="text" required value={titre} onChange={e => setTitre(e.target.value)}
                                        placeholder="Simulation AZ-900"
                                        className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Description</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                                        placeholder="Description de la simulation..."
                                        className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all resize-none h-16" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Certification *</label>
                                        <select value={certificationId} onChange={e => setCertificationId(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold cursor-pointer">
                                            <option value="">Sélectionner...</option>
                                            {certifications.map(c => (
                                                <option key={c.id} value={c.id}>{c.codeExamen || c.nom}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Cours (optionnel)</label>
                                        <select value={coursId} onChange={e => setCoursId(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold cursor-pointer">
                                            <option value="">Aucun cours</option>
                                            {coursesList.map(c => (
                                                <option key={c.id} value={c.id}>{c.titre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Durée (minutes)</label>
                                        <input type="number" required min={1} value={duree} onChange={e => setDuree(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Score minimal</label>
                                        <input type="number" required min={0} max={100} value={scoreMinimal} onChange={e => setScoreMinimal(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'QUESTIONS' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {questionsList.length} question{questionsList.length > 1 ? 's' : ''}
                                    </h3>
                                    <button onClick={() => { resetQForm(); setEditingQ(null); setShowQuestionForm(true); }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer">
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Ajouter</span>
                                    </button>
                                </div>

                                {loadingQuestions ? (
                                    <div className="text-center py-6 text-slate-400 text-xs font-bold">Chargement...</div>
                                ) : questionsList.length === 0 ? (
                                    <div className="text-center py-6 text-slate-400 text-xs font-bold italic">Aucune question pour le moment.</div>
                                ) : (
                                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                                        {questionsList.map((q, idx) => (
                                            <div key={q.id} className="flex items-center gap-2 p-2.5 bg-white border border-slate-200/80 rounded-xl group hover:border-slate-300 transition-all">
                                                <span className="text-[9px] font-black text-slate-400 w-4 shrink-0">#{idx + 1}</span>
                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${getTypeBadge(q.type)}`}>{q.type === 'VRAI_FAUX' ? 'V/F' : q.type === 'CAS_PRATIQUE' ? 'CAS' : q.type}</span>
                                                <p className="flex-1 text-[11px] font-semibold text-slate-700 truncate min-w-0">{q.enonce}</p>
                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                    <button onClick={() => handleEditQuestion(q)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"><Edit className="w-3 h-3" /></button>
                                                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-1 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {questionsList.length > 0 && questionsList.length < 5 && (
                                    <p className="text-[9px] text-amber-600 font-bold">⚠ Minimum 5 questions pour publier ({questionsList.length}/5).</p>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-6 border-t border-slate-200/80 flex justify-between gap-3 bg-slate-50 mt-6">
                            <button type="button" onClick={() => { if (!saving) onClose(); }} disabled={saving}
                                className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs uppercase tracking-wider">Annuler</button>
                            <div className="flex items-center gap-2">
                                {!isEditing ? (
                                    <button onClick={() => handleSave('BROUILLON')} disabled={saving || !titre || !certificationId}
                                        className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl cursor-pointer transition-all text-xs disabled:opacity-40 flex items-center gap-1.5">
                                        Brouillon
                                    </button>
                                ) : (
                                    <button onClick={() => handleSave('BROUILLON')} disabled={saving || !titre || !certificationId}
                                        className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl cursor-pointer transition-all text-xs disabled:opacity-40 flex items-center gap-1.5">
                                        Enregistrer
                                    </button>
                                )}
                                <button onClick={() => handleSave('PUBLIE')} disabled={saving || !titre || !certificationId || questionsList.length < 5}
                                    className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl cursor-pointer transition-all disabled:opacity-40 flex items-center gap-2 text-xs uppercase tracking-wider shadow-md">
                                    {saving ? <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" /> : null}
                                    Publier
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DROITE : Prévisualisation */}
                    <div className="p-5 md:p-8 w-full md:w-1/2 bg-gradient-to-tr from-slate-950 to-indigo-950/15 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-200/80 relative min-h-[400px] md:overflow-y-auto shrink-0">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-blue-50 opacity-20 pointer-events-none" />

                        <div className="w-full max-w-xs space-y-5 relative z-10">
                            <div className="w-full max-w-xs flex flex-col group relative">
                                <div className="relative w-full h-[340px] rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                                    <img src="/images/cadre_certif.png" alt="Template" className="absolute inset-0 w-full h-full object-cover z-0" />

                                    <div className="absolute top-4 left-4 z-30 flex flex-col gap-1">
                                        {selectedCert?.codeExamen && (
                                            <div className="bg-blue-600 text-white font-extrabold uppercase text-[8px] tracking-wider px-2 py-0.5 rounded-md border border-cyan-500/50 shadow-sm w-fit hover:bg-blue-700 transition-colors">
                                                {selectedCert.codeExamen}
                                            </div>
                                        )}
                                        {isEditing && editingSim?.statut && (
                                            <div className={`px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider w-fit shadow-sm ${editingSim.statut === 'PUBLIE' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                                                {editingSim.statut === 'PUBLIE' ? 'Publié' : 'Brouillon'}
                                            </div>
                                        )}
                                        <div className="bg-blue-600 text-white font-extrabold uppercase text-[8px] tracking-wider px-2 py-0.5 rounded-md border border-blue-500/50 shadow-sm w-fit hover:bg-blue-700 transition-colors">
                                            {questionsList.length} Question{questionsList.length > 1 ? 's' : ''}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 w-28 flex justify-center">
                                        <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                                            <Activity className="w-8 h-8 text-blue-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-col gap-1.5 px-1 text-left">
                                    <h3 className="text-[13px] font-black text-slate-950 leading-snug line-clamp-2">
                                        {titre || 'Titre de la simulation'}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-black uppercase flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" />
                                            {duree || '60'}min
                                        </span>
                                        <span className="text-[8px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-black uppercase">
                                            Score ≥ {scoreMinimal || '700'}
                                        </span>
                                        {selectedCourse && (
                                            <span className="text-[8px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded font-black uppercase truncate max-w-[120px]">
                                                {selectedCourse.titre}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Modal */}
                {showQuestionForm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { if (!qLoading) { setShowQuestionForm(false); setEditingQ(null); resetQForm(); } }}
                            className="fixed inset-0 bg-slate-900/80 z-[60] will-change-auto"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.97 }}
                            className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-4 overflow-y-auto"
                        >
                            <form onSubmit={handleSaveQuestion} className="bg-white border border-slate-200/80 w-full max-w-lg rounded-[32px] shadow-2xl p-6 space-y-4 my-auto max-h-none sm:max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-slate-950">{editingQ ? 'Modifier la question' : 'Nouvelle question'}</h3>
                                    <button type="button" onClick={() => { if (!qLoading) { setShowQuestionForm(false); setEditingQ(null); resetQForm(); } }} disabled={qLoading}
                                        className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-950 rounded-xl transition-all cursor-pointer disabled:opacity-50">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {qError && <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-[10px] font-bold">{qError}</div>}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Type</label>
                                        <select value={qType} onChange={e => { setQType(e.target.value); setQReponse(e.target.value === 'QCM' || e.target.value === 'VRAI_FAUX' ? 'A' : ''); }}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-blue-600 rounded-lg text-[11px] font-semibold outline-none">
                                            <option value="QCM">QCM</option>
                                            <option value="VRAI_FAUX">V/F</option>
                                            <option value="OUVERTE">Ouverte</option>
                                            <option value="CAS_PRATIQUE">Cas Pratique</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Catégorie</label>
                                        <input type="text" value={qCategorie} onChange={e => setQCategorie(e.target.value)} placeholder="IAM"
                                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-blue-600 rounded-lg text-[11px] font-semibold outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Énoncé</label>
                                    <textarea required rows={2} value={qEnonce} onChange={e => setQEnonce(e.target.value)} placeholder="Saisissez la question..."
                                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-blue-600 rounded-lg text-[11px] font-semibold outline-none resize-none" />
                                </div>

                                {qType === 'QCM' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest shrink-0">Bonne réponse</label>
                                            <select value={qReponse} onChange={e => setQReponse(e.target.value)}
                                                className="px-2 py-1 bg-white border border-slate-200 focus:border-blue-600 rounded-lg text-[10px] font-semibold outline-none">
                                                <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['A', 'B', 'C', 'D'].map(lettre => {
                                                const val = lettre === 'A' ? qOptA : lettre === 'B' ? qOptB : lettre === 'C' ? qOptC : qOptD;
                                                const setVal = lettre === 'A' ? setQOptA : lettre === 'B' ? setQOptB : lettre === 'C' ? setQOptC : setQOptD;
                                                return (
                                                    <div key={lettre} className="space-y-0.5">
                                                        <label className="text-[9px] font-black text-slate-500 pl-1">{lettre}</label>
                                                        <input type="text" required value={val} onChange={e => setVal(e.target.value)} placeholder={`Option ${lettre}`}
                                                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 focus:border-blue-600 rounded-lg text-[11px] font-semibold outline-none" />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {qType === 'VRAI_FAUX' && (
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Bonne réponse</label>
                                        <select value={qReponse} onChange={e => setQReponse(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-blue-600 rounded-lg text-[11px] font-semibold outline-none">
                                            <option value="A">Vrai</option><option value="B">Faux</option>
                                        </select>
                                    </div>
                                )}

                                {(qType === 'OUVERTE' || qType === 'CAS_PRATIQUE') && (
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Grille de notation IA</label>
                                        <textarea required rows={2} value={qGrille} onChange={e => setQGrille(e.target.value)} placeholder="Critères d'évaluation..."
                                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-blue-600 rounded-lg text-[11px] font-semibold outline-none resize-none" />
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Explication (opt.)</label>
                                    <textarea rows={1} value={qExplication} onChange={e => setQExplication(e.target.value)} placeholder="Explication de la réponse..."
                                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-blue-600 rounded-lg text-[11px] font-semibold outline-none resize-none" />
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => { if (!qLoading) { setShowQuestionForm(false); setEditingQ(null); resetQForm(); } }} disabled={qLoading}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50">Annuler</button>
                                    <button type="submit" disabled={qLoading}
                                        className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
                                        {qLoading ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editingQ ? 'Modifier' : 'Ajouter'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
