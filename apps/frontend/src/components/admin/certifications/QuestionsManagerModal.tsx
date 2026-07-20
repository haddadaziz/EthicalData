import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Edit, Trash2, Plus } from '@/components/icons';

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

export interface QuestionPayload {
  type: string;
  enonce: string;
  reponseCorrecte: string;
  explication?: string;
  categorie?: string;
  grilleNotation?: string;
  options?: QuestionOption[];
}

interface QuestionsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  certification: any;
  questionsList: Question[];
  loadingQuestions: boolean;
  onSaveQuestion: (payload: QuestionPayload, editingId?: string) => Promise<void>;
  onDeleteQuestion: (questionId: string) => Promise<void>;
}

export function QuestionsManagerModal({
  isOpen, onClose, certification, questionsList, loadingQuestions, onSaveQuestion, onDeleteQuestion
}: QuestionsManagerModalProps) {
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  const [questionType, setQuestionType] = useState('QCM');
  const [questionEnonce, setQuestionEnonce] = useState('');
  const [questionReponseCorrecte, setQuestionReponseCorrecte] = useState('A');
  const [questionExplication, setQuestionExplication] = useState('');
  const [questionCategorie, setQuestionCategorie] = useState('');
  const [questionGrilleNotation, setQuestionGrilleNotation] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');

  const resetForm = () => {
    setEditingQuestion(null);
    setQuestionType('QCM');
    setQuestionEnonce('');
    setQuestionReponseCorrecte('A');
    setQuestionExplication('');
    setQuestionCategorie('');
    setQuestionGrilleNotation('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setQuestionError(null);
  };

  const handleEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQuestionType(q.type || 'QCM');
    setQuestionEnonce(q.enonce || '');
    setQuestionReponseCorrecte(q.reponseCorrecte || '');
    setQuestionExplication(q.explication || '');
    setQuestionCategorie(q.categorie || '');
    setQuestionGrilleNotation(q.grilleNotation || '');

    if ((q.type === 'QCM' || q.type === 'VRAI_FAUX') && q.options) {
      const a = q.options.find((o) => o.lettre === 'A');
      const b = q.options.find((o) => o.lettre === 'B');
      const c = q.options.find((o) => o.lettre === 'C');
      const d = q.options.find((o) => o.lettre === 'D');

      setOptA(a?.texte || '');
      setOptB(b?.texte || '');
      setOptC(c?.texte || '');
      setOptD(d?.texte || '');
    } else {
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
    }
    setIsQuestionFormOpen(true);
    setQuestionError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionError(null);

    try {
      setQuestionLoading(true);

      let options: QuestionOption[] | undefined;

      if (questionType === 'QCM') {
        if (!optA || !optB || !optC || !optD) {
          throw new Error('Veuillez remplir toutes les options A, B, C et D.');
        }
        options = [
          { lettre: 'A', texte: optA },
          { lettre: 'B', texte: optB },
          { lettre: 'C', texte: optC },
          { lettre: 'D', texte: optD },
        ];
      } else if (questionType === 'VRAI_FAUX') {
        options = [
          { lettre: 'A', texte: 'Vrai' },
          { lettre: 'B', texte: 'Faux' },
        ];
      }

      if ((questionType === 'OUVERTE' || questionType === 'CAS_PRATIQUE') && !questionGrilleNotation) {
        throw new Error('La grille de notation est requise pour ce type de question.');
      }

      await onSaveQuestion({
        type: questionType,
        enonce: questionEnonce,
        reponseCorrecte: questionReponseCorrecte,
        explication: questionExplication || undefined,
        categorie: questionCategorie || undefined,
        grilleNotation: questionType === 'OUVERTE' || questionType === 'CAS_PRATIQUE' ? questionGrilleNotation : undefined,
        options,
      }, editingQuestion?.id);

      resetForm();
      setIsQuestionFormOpen(false);
    } catch (err: any) {
      setQuestionError(err.message || "Une erreur est survenue.");
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette question ?')) return;
    try {
      setQuestionLoading(true);
      await onDeleteQuestion(questionId);
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression.");
    } finally {
      setQuestionLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {(isOpen && certification) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { if (!questionLoading) { onClose(); resetForm(); setIsQuestionFormOpen(false); } }}
            className="absolute inset-0 bg-slate-900/80"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-slate-50 border border-slate-200/80 w-full max-w-4xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] will-change-transform"
          >
          {/* En-tête */}
          <div className="p-6 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-cyan-500">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-black text-slate-950 leading-tight">Questions d'examen</h2>
                <p className="text-xs text-slate-500">{certification.nom}</p>
              </div>
            </div>
            <button
              onClick={() => { onClose(); resetForm(); setIsQuestionFormOpen(false); }}
              className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-950 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

            {/* Formulaire d'ajout / Édition de Question */}
            <AnimatePresence>
              {isQuestionFormOpen && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 overflow-hidden text-left animate-fadeIn"
                >
                  <h3 className="font-extrabold text-sm text-slate-950 uppercase tracking-wider">{editingQuestion ? "Modifier la Question" : "Nouvelle Question"}</h3>

                  {questionError && (
                    <div className="p-3 bg-rose-500/5 border border-rose-500/25 text-rose-400 text-xs font-bold rounded-xl">
                      {questionError}
                    </div>
                  )}

                  {/* Type de question, Catégorie */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Type de Question</label>
                      <select
                        value={questionType}
                        onChange={(e) => {
                          setQuestionType(e.target.value);
                          setQuestionReponseCorrecte(e.target.value === 'QCM' || e.target.value === 'VRAI_FAUX' ? 'A' : '');
                        }}
                        className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold"
                      >
                        <option value="QCM">QCM (Options A, B, C, D)</option>
                        <option value="VRAI_FAUX">Vrai / Faux</option>
                        <option value="OUVERTE">Question Ouverte (Correction IA)</option>
                        <option value="CAS_PRATIQUE">Cas Pratique (Scénario + Code IA)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Catégorie / Module</label>
                      <input
                        type="text"
                        value={questionCategorie}
                        onChange={(e) => setQuestionCategorie(e.target.value)}
                        placeholder="ex: Identité & IAM"
                        className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Énoncé (Toujours présent) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Énoncé / Scénario</label>
                    <textarea
                      required
                      rows={2}
                      value={questionEnonce}
                      onChange={(e) => setQuestionEnonce(e.target.value)}
                      placeholder="Saisissez la question..."
                      className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Rendu dynamique selon le Type de Question */}
                  {questionType === 'QCM' && (
                    <div className="space-y-4">
                      {/* Sélecteur de bonne réponse */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Bonne Réponse</label>
                        <select
                          value={questionReponseCorrecte}
                          onChange={(e) => setQuestionReponseCorrecte(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold"
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>

                      {/* Options de textes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Option A</label>
                          <input
                            type="text"
                            required={questionType === 'QCM'}
                            value={optA}
                            onChange={(e) => setOptA(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Option B</label>
                          <input
                            type="text"
                            required={questionType === 'QCM'}
                            value={optB}
                            onChange={(e) => setOptB(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Option C</label>
                          <input
                            type="text"
                            required={questionType === 'QCM'}
                            value={optC}
                            onChange={(e) => setOptC(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Option D</label>
                          <input
                            type="text"
                            required={questionType === 'QCM'}
                            value={optD}
                            onChange={(e) => setOptD(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {questionType === 'VRAI_FAUX' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Bonne Réponse</label>
                      <select
                        value={questionReponseCorrecte}
                        onChange={(e) => setQuestionReponseCorrecte(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all font-semibold"
                      >
                        <option value="A">Vrai</option>
                        <option value="B">Faux</option>
                      </select>
                    </div>
                  )}

                  {(questionType === 'OUVERTE' || questionType === 'CAS_PRATIQUE') && (
                    <div className="space-y-4">
                      {/* Réponse Modèle */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Réponse Modèle / Attendue</label>
                        <textarea
                          required
                          rows={3}
                          value={questionReponseCorrecte}
                          onChange={(e) => setQuestionReponseCorrecte(e.target.value)}
                          placeholder="Rédigez la réponse idéale qui servira de référence à l'apprenant..."
                          className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all resize-none"
                        />
                      </div>

                      {/* Grille de Notation IA */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Critères de correction (Pour l'IA)</label>
                        <textarea
                          required
                          rows={3}
                          value={questionGrilleNotation}
                          onChange={(e) => setQuestionGrilleNotation(e.target.value)}
                          placeholder="Décrivez les critères précis d'évaluation (ex: Attribuer 2 pts si le mot-clé 'A' est présent, etc.)..."
                          className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Explication commune */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Explication de correction (optionnel)</label>
                    <textarea
                      rows={2}
                      value={questionExplication}
                      onChange={(e) => setQuestionExplication(e.target.value)}
                      placeholder="Expliquez en détail les notions de cours liées..."
                      className="w-full px-4 py-2.5 bg-white shadow-sm border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-950 text-sm outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsQuestionFormOpen(false); resetForm(); }}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 rounded-xl cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={questionLoading}
                      className="px-4 py-2 bg-white text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl shadow-md cursor-pointer"
                    >
                      {editingQuestion ? "Enregistrer les modifications" : "Enregistrer la question"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Section header de la liste */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-950 uppercase tracking-widest">
                {questionsList.length} Question{questionsList.length > 1 ? 's' : ''} enregistrée{questionsList.length > 1 ? 's' : ''}
              </span>
              {!isQuestionFormOpen && (
                <button
                  onClick={() => setIsQuestionFormOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une question</span>
                </button>
              )}
            </div>

            {/* Liste des questions */}
            <div className="space-y-4">
              {loadingQuestions ? (
                <div className="text-center py-10 space-y-2">
                  <span className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin inline-block" />
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Chargement des questions...</p>
                </div>
              ) : questionsList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-white border border-dashed border-slate-200/80 rounded-2xl">
                  Aucune question n'est configurée pour cet examen blanc.
                </div>
              ) : (
                questionsList.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 text-left space-y-4 relative group animate-fadeIn"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question {idx + 1}</span>
                        <span className="text-[9px] font-black text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {q.type || 'QCM'}
                        </span>
                        {q.categorie && (
                          <span className="text-[9px] font-black text-cyan-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {q.categorie}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditQuestion(q)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-950 rounded-lg transition-colors cursor-pointer"
                          title="Modifier la question"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer la question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-bold text-slate-950 leading-relaxed">{q.enonce}</p>

                    {/* Rendu des choix (Seulement pour QCM et VRAI_FAUX) */}
                    {(q.type === 'QCM' || q.type === 'VRAI_FAUX') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(q.options || []).map((opt: any) => {
                          const isCorrect = q.reponseCorrecte === opt.lettre;
                          return (
                            <div
                              key={opt.id || opt.lettre}
                              className={`p-3 border rounded-xl flex items-center gap-3 text-xs font-semibold ${isCorrect
                                ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600'
                                : 'border-slate-200/80 bg-slate-50/20 text-slate-600'
                                }`}
                            >
                              <span className={`w-5.5 h-5.5 rounded border text-[10px] font-bold flex items-center justify-center shrink-0 ${isCorrect
                                ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400'
                                : 'border-slate-200 bg-slate-50 text-slate-500'
                                }`}>
                                {opt.lettre}
                              </span>
                              <span className="truncate leading-snug">{opt.texte}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Rendu de la réponse modèle et du barème (Seulement pour OUVERTE et CAS_PRATIQUE) */}
                    {(q.type === 'OUVERTE' || q.type === 'CAS_PRATIQUE') && (
                      <div className="space-y-3">
                        <div className="p-4 bg-indigo-950/10 border border-indigo-900/20 rounded-2xl text-xs leading-relaxed text-slate-700">
                          <p className="font-bold text-cyan-500 uppercase tracking-wider text-[9px] mb-1">Réponse modèle attendue :</p>
                          <p className="font-semibold whitespace-pre-wrap">{q.reponseCorrecte}</p>
                        </div>
                        {q.grilleNotation && (
                          <div className="p-4 bg-emerald-950/10 border border-emerald-900/20 rounded-2xl text-xs leading-relaxed text-slate-700">
                            <p className="font-bold text-emerald-400 uppercase tracking-wider text-[9px] mb-1">Barème & Critères IA :</p>
                            <p className="font-semibold whitespace-pre-wrap">{q.grilleNotation}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {q.explication && (
                      <div className="p-3.5 bg-slate-50/40 border border-slate-200/80 rounded-xl text-xs leading-relaxed text-slate-600">
                        <p className="font-bold text-cyan-500 uppercase tracking-wider text-[9px] mb-0.5">Correction :</p>
                        <p className="font-medium">{q.explication}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
