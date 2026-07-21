import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { Award, BookOpen, BookMarked, Clock, FileText, FilePen, Globe, Plus, Trash2, ChevronDown, ChevronUp, ChevronLeft, Upload, Link, FilePlus, Send, Save, X, Layers, PlusCircle, AlertTriangle, Crop, Play, HelpCircle, CheckCircle, AlertCircle } from '@/components/icons';

// ... (keep rest of types)

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────
interface Ressource {
    id: string;
    titre: string;
    type: string;
    url: string;
    public: boolean;
}

interface Module {
    id: string;
    titre: string;
    description?: string;
    contenu?: string;
    videoUrl?: string;
    dureeEstimee?: number;
    ordre: number;
    ressources: Ressource[];
}

interface Cours {
    id: string;
    titre: string;
    description?: string;
    statut: 'BROUILLON' | 'PUBLIE' | 'ARCHIVE';
    imageUrl?: string;
    videoUrl?: string;
    objectifs: string[];
    prerequis: string[];
    publicCible: string[];
    dureeEstimee?: number;
    dateCreation: string;
    datePublication?: string;
    certificationId: string;
    certification: {
        id: string;
        nom: string;
        codeExamen?: string;
        fournisseur: { nom: string };
    };
    formateur?: {
        id: string;
        prenom: string;
        nom: string;
        avatar?: string;
    };
    modules: Module[];
}

interface Certification {
    id: string;
    nom: string;
    codeExamen?: string;
    fournisseur: { nom: string };
}

// ─────────────────────────────────────────
// PAGE PRINCIPALE
// ─────────────────────────────────────────
// ─────────────────────────────────────────
// ÉDITEUR DE COURS
// ─────────────────────────────────────────
interface CourseEditorProps {
    certs: Certification[];
    editingCours: Cours | null;
    onClose: () => void;
    showToast: (msg: string, type?: any) => void;
    onSave: (data: any) => Promise<void>;
    onSaveDraft: (data: any) => Promise<void>;
    onPublish: (data: any) => Promise<void>;
}

type SectionId = 'ACCUEIL' | 'PARTICIPANTS' | 'MODULES' | 'SIMULATION';

export function CourseEditor({ certs, editingCours, onClose, showToast, onSave, onSaveDraft, onPublish }: CourseEditorProps) {
    const [activeSection, setActiveSection] = useState<SectionId>('ACCUEIL');
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [exitAction, setExitAction] = useState<'prompt' | 'save' | 'discard' | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const form = formRef.current;
        if (!form) return;
        const handler = () => setHasChanges(true);
        form.addEventListener('input', handler);
        return () => form.removeEventListener('input', handler);
    }, []);

    const handleCloseAttempt = () => {
        if (hasChanges) {
            setExitAction('prompt');
        } else {
            onClose();
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) handleCloseAttempt();
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleCloseAttempt();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    });

    const handleExitSave = async () => {
        setExitAction('save');
        const data = collectFormData();
        if (!data || !data.titre) {
            showToast("Le titre est obligatoire pour sauvegarder.", "error");
            setExitAction(null);
            return;
        }
        setSaving(true);
        try {
            await onSave(data);
            setExitAction(null);
            onClose();
        } catch { setExitAction(null); } finally { setSaving(false); }
    };

    const handleExitDiscard = () => {
        setExitAction('discard');
        setExitAction(null);
        onClose();
    };

    // Champs dynamiques
    const [objectifsKeys, setObjectifsKeys] = useState<string[]>(
        editingCours?.objectifs.length
            ? editingCours.objectifs.map((_, i) => `obj-${i}`)
            : ['obj-0', 'obj-1', 'obj-2', 'obj-3']
    );
    const [prerequisKeys, setPrerequisKeys] = useState<string[]>(
        editingCours?.prerequis.length
            ? editingCours.prerequis.map((_, i) => `pre-${i}`)
            : ['pre-0']
    );
    const [publicCibleKeys, setPublicCibleKeys] = useState<string[]>(
        editingCours?.publicCible.length
            ? editingCours.publicCible.map((_, i) => `pub-${i}`)
            : ['pub-0']
    );

    // Modules locaux (pour affichage dans l'éditeur)
    // Création silencieuse du cours si nécessaire (pour modules/simulation)
    const [localCoursId, setLocalCoursId] = useState<string | null>(null);
    const coursId = localCoursId || editingCours?.id || null;

    const ensureCours = async (): Promise<string | null> => {
        if (coursId) return coursId;
        const data = collectFormData();
        if (!data || !data.titre) return null;
        try {
            const created = await apiFetch('/cours', {
                method: 'POST',
                body: { ...data, statut: 'BROUILLON' },
            });
            setLocalCoursId(created.id);
            return created.id;
        } catch {
            return null;
        }
    };

    const [modules, setModules] = useState<Module[]>(editingCours?.modules || []);
    const [addingModule, setAddingModule] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [moduleForm, setModuleForm] = useState({ titre: '', dureeEstimee: 30, contenu: '' });

    const handleDeleteModule = async (moduleId: string) => {
        if (!window.confirm("Voulez-vous supprimer ce module ?")) return;
        try {
            await apiFetch(`/cours/modules/${moduleId}`, { method: 'DELETE' });
            setModules(prev => prev.filter(m => m.id !== moduleId));
            showToast("Module supprimé.", "success");
        } catch (err: any) {
            showToast(err.message || "Erreur.", "error");
        }
    };

    // Simulation de cours
    const [courseSim, setCourseSim] = useState<any>(null);
    const [simLoading, setSimLoading] = useState(false);
    const [simForm, setSimForm] = useState({ titre: '', description: '', duree: 30, scoreMinimal: 70 });
    const [simQuestions, setSimQuestions] = useState<any[]>([]);
    const [creatingSim, setCreatingSim] = useState(false);
    const [addingQuestion, setAddingQuestion] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
    const [qForm, setQForm] = useState({ enonce: '', type: 'QCM', reponseCorrecte: '', explication: '', options: [{ lettre: 'A', texte: '' }, { lettre: 'B', texte: '' }] });

    // Image upload & crop
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | null>(
        editingCours?.imageUrl || null
    );
    const [cropStage, setCropStage] = useState<'idle' | 'uploaded' | 'cropped'>(
        editingCours?.imageUrl ? 'cropped' : 'idle'
    );
    const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
    const [cropRect, setCropRect] = useState({ x: 0, y: 0, w: 300, h: 169 });
    const [imgContainerSize, setImgContainerSize] = useState({ w: 0, h: 0 });
    const [isDraggingRect, setIsDraggingRect] = useState(false);
    const [dragRectStart, setDragRectStart] = useState({ mx: 0, my: 0, rx: 0, ry: 0 });
    const [imgError, setImgError] = useState<string | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<string>('');
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const providers = [...new Set(certs.map(c => c.fournisseur?.nom).filter(Boolean))].sort();
    const filteredCerts = selectedProvider
        ? certs.filter(c => c.fournisseur?.nom === selectedProvider)
        : certs;

    const TARGET_W = 750, TARGET_H = 422;

    const initCropRect = (containerW: number, containerH: number) => {
        const ratio = TARGET_W / TARGET_H;
        let rw = containerW * 0.8;
        let rh = rw / ratio;
        if (rh > containerH * 0.8) {
            rh = containerH * 0.8;
            rw = rh * ratio;
        }
        const rx = (containerW - rw) / 2;
        const ry = (containerH - rh) / 2;
        setCropRect({ x: rx, y: ry, w: rw, h: rh });
    };

    const handleFileSelect = (file: File | undefined) => {
        setImgError(null);
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setImgError('Seules les images sont acceptées.');
            return;
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!ext || !['jpg', 'jpeg', 'gif', 'png'].includes(ext)) {
            setImgError('Formats acceptés : .jpg, .jpeg, .gif, .png uniquement.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setImgError('L\'image ne doit pas dépasser 5 Mo.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const img = new Image();
            img.onload = () => {
                const minW = TARGET_W, minH = TARGET_H;
                if (img.naturalWidth < minW || img.naturalHeight < minH) {
                    setImgError(`L'image est trop petite. Minimum : ${minW}x${minH}px (actuelle : ${img.naturalWidth}x${img.naturalHeight}px).`);
                    return;
                }
                setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
                setUploadedImage(dataUrl);
                setCropStage('uploaded');
            };
            img.onerror = () => {
                setImgError('Impossible de charger l\'image. Fichier corrompu ou format non supporté.');
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (cropStage === 'uploaded' && imageContainerRef.current) {
            const c = imageContainerRef.current;
            const w = c.clientWidth;
            const h = c.clientHeight;
            if (w > 0 && h > 0) {
                setImgContainerSize({ w, h });
                initCropRect(w, h);
            }
        }
    }, [cropStage, uploadedImage]);

    const handleCrop = () => {
        if (!uploadedImage) return;
        const cw = imgContainerSize.w, ch = imgContainerSize.h;
        if (!cw || !ch) return;

        const scaleX = imgNatural.w / cw;
        const scaleY = imgNatural.h / ch;

        const sx = cropRect.x * scaleX;
        const sy = cropRect.y * scaleY;
        const sw = cropRect.w * scaleX;
        const sh = cropRect.h * scaleY;

        const canvas = document.createElement('canvas');
        canvas.width = TARGET_W;
        canvas.height = TARGET_H;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(imageRef.current!, sx, sy, sw, sh, 0, 0, TARGET_W, TARGET_H);

        setCroppedImage(canvas.toDataURL('image/jpeg', 0.92));
        setCropStage('cropped');
    };

    const handleRemoveImage = () => {
        setUploadedImage(null);
        setCroppedImage(null);
        setCropStage('idle');
        setImgError(null);
    };

    const handleResetCrop = () => {
        if (imgContainerSize.w && imgContainerSize.h) initCropRect(imgContainerSize.w, imgContainerSize.h);
        setCropStage('uploaded');
    };

    const handleRectMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDraggingRect(true);
        setDragRectStart({ mx: e.clientX, my: e.clientY, rx: cropRect.x, ry: cropRect.y });
    };

    useEffect(() => {
        if (!isDraggingRect) return;
        const onMove = (e: MouseEvent) => {
            const dx = e.clientX - dragRectStart.mx;
            const dy = e.clientY - dragRectStart.my;
            const cw = imgContainerSize.w, ch = imgContainerSize.h;
            let nx = dragRectStart.rx + dx;
            let ny = dragRectStart.ry + dy;
            nx = Math.max(0, Math.min(nx, cw - cropRect.w));
            ny = Math.max(0, Math.min(ny, ch - cropRect.h));
            setCropRect(prev => ({ ...prev, x: nx, y: ny }));
        };
        const onUp = () => setIsDraggingRect(false);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    }, [isDraggingRect, dragRectStart, imgContainerSize, cropRect.w, cropRect.h]);

    // Charger la simulation existante
    useEffect(() => {
        const id = coursId;
        if (!id) return;
        (async () => {
            setSimLoading(true);
            try {
                const sim = await apiFetch(`/simulations/cours/${id}`, { method: 'GET' });
                if (sim) {
                    setCourseSim(sim);
                    const qs = await apiFetch(`/simulations/cours/${id}/questions`, { method: 'GET' });
                    setSimQuestions(qs);
                }
            } catch { /* pas de simulation */ }
            finally { setSimLoading(false); }
        })();
    }, [coursId]);

    useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }, []);

    const collectFormData = () => {
        if (!formRef.current) return null;
        const fd = new FormData(formRef.current);
        return {
            titre: (fd.get('titre') as string) || '',
            description: (fd.get('description') as string) || '',
            imageUrl: croppedImage || undefined,
            videoUrl: (fd.get('videoUrl') as string) || undefined,
            dureeEstimee: Number(fd.get('dureeEstimee') || 60),
            certificationId: Number(fd.get('certificationId') || certs[0]?.id),
            objectifs: (fd.getAll('objectifs') as string[]).filter(v => v.trim()),
            prerequis: (fd.getAll('prerequis') as string[]).filter(v => v.trim()),
            publicCible: (fd.getAll('publicCible') as string[]).filter(v => v.trim()),
        };
    };

    const handleAddDynamic = (
        ref: React.MutableRefObject<HTMLFormElement | null>,
        name: string,
        setter: React.Dispatch<React.SetStateAction<string[]>>,
        prefix: string,
        label: string
    ) => {
        if (!ref.current) return;
        const inputs = ref.current.querySelectorAll(`input[name="${name}"]`) as NodeListOf<HTMLInputElement>;
        if (inputs.length > 0 && inputs[inputs.length - 1].value.trim() === '') {
            showToast(`Remplissez d'abord le dernier champ "${label}".`, "error");
            return;
        }
        setter(prev => [...prev, `${prefix}-${Date.now()}`]);
    };

    const handleSaveDraft = async () => {
        const data = collectFormData();
        if (!data || !data.titre) { showToast("Le titre est obligatoire.", "error"); return; }
        setSaving(true);
        try { await onSaveDraft(data); } finally { setSaving(false); }
    };

    const handleSave = async () => {
        const data = collectFormData();
        if (!data || !data.titre) { showToast("Le titre est obligatoire.", "error"); return; }
        setSaving(true);
        try { await onSave(data); } finally { setSaving(false); }
    };

    const handlePublish = async () => {
        const data = collectFormData();
        if (!data || !data.titre) { showToast("Le titre est obligatoire.", "error"); return; }
        if (!data.description) { showToast("La description est obligatoire.", "error"); return; }
        setSaving(true);
        try { await onPublish(data); } finally { setSaving(false); }
    };

    const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
        { id: 'ACCUEIL', label: 'Accueil du cours', icon: <BookOpen className="w-3.5 h-3.5" /> },
        { id: 'PARTICIPANTS', label: 'Participants cibles', icon: <Award className="w-3.5 h-3.5" /> },
        { id: 'MODULES', label: 'Modules', icon: <Layers className="w-3.5 h-3.5" /> },
        { id: 'SIMULATION', label: 'Simulation', icon: <Play className="w-3.5 h-3.5" /> },
    ];

    return (
        <div className="w-full text-left">
            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl w-full min-h-[calc(100vh-130px)] flex flex-col shadow-xl overflow-hidden">

                {/* HEADER */}
                <header className="h-16 bg-[#020617] border-b border-slate-800 text-white flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={handleCloseAttempt}
                            className="px-3.5 py-1.5 bg-[#080d1a] hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs">
                            <ChevronLeft className="w-4 h-4 text-cyan-400" />
                            <span>Retour aux cours</span>
                        </button>
                        <div className="h-5 w-px bg-white/10" />
                        <h1 className="text-xs font-black uppercase tracking-wider text-slate-200 truncate max-w-xs">
                            {editingCours ? `Modifier : ${editingCours.titre}` : 'Nouveau cours'}
                        </h1>
                        {editingCours && (
                            <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider border ${editingCours.statut === 'PUBLIE'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                }`}>
                                {editingCours.statut === 'PUBLIE' ? 'Publié' : 'Brouillon'}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={handleSave} disabled={saving}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60">
                            <Save className="w-3.5 h-3.5" />
                            {saving ? 'Sauvegarde...' : 'Enregistrer'}
                        </button>
                        <button type="button" onClick={handleSaveDraft} disabled={saving}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60">
                            <Save className="w-3.5 h-3.5" />
                            Brouillon
                        </button>
                        <button type="button" onClick={handlePublish} disabled={saving}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60">
                            <Send className="w-3.5 h-3.5" />
                            Publier
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden bg-[#020617]">
                    {/* SIDEBAR */}
                    <aside className="w-60 border-r border-slate-800 bg-[#080d1a] p-5 shrink-0 flex flex-col gap-1.5">
                        {SECTIONS.map(s => (
                            <button key={s.id} type="button" onClick={() => setActiveSection(s.id)}
                                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left text-xs font-black transition-all cursor-pointer ${activeSection === s.id
                                    ? 'bg-blue-600/10 text-cyan-400 border border-blue-900/40 shadow-xs'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900/20'
                                    }`}>
                                {s.icon}
                                {s.label}
                            </button>
                        ))}
                    </aside>

                    {/* CONTENU */}
                    <form ref={formRef} className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#020617] text-white space-y-8">

                        {/* ── ACCUEIL ── */}
                        <div className={activeSection === 'ACCUEIL' ? 'block space-y-5' : 'hidden'}>
                            <div className="border-b border-slate-800 pb-3">
                                <h2 className="text-sm font-black text-white">Accueil du cours</h2>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                    Ces informations seront visibles par les apprenants sur la fiche du cours.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-300">Titre du cours *</label>
                                <input type="text" name="titre" required
                                    defaultValue={editingCours?.titre}
                                    placeholder="Ex : Sécurité avancée Azure (AZ-500)"
                                    className="w-full px-4 py-2.5 bg-[#080d1a] border border-slate-800 focus:border-blue-600 text-white rounded-xl text-xs font-semibold outline-none transition-all" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-300">Fournisseur</label>
                                    <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#080d1a] border border-slate-800 focus:border-blue-600 text-white rounded-xl text-xs font-bold outline-none cursor-pointer">
                                        <option value="">Tous les fournisseurs</option>
                                        {providers.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-300">Certification associée *</label>
                                    <select name="certificationId" required
                                        defaultValue={editingCours?.certificationId}
                                        className="w-full px-4 py-2.5 bg-[#080d1a] border border-slate-800 focus:border-blue-600 text-white rounded-xl text-xs font-bold outline-none cursor-pointer">
                                        {filteredCerts.length === 0 ? (
                                            <option value="" disabled>Aucune certification</option>
                                        ) : (
                                            filteredCerts.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.codeExamen && !c.nom.includes(c.codeExamen) ? `[${c.codeExamen}] ${c.nom}` : c.nom}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-300">Durée totale (minutes)</label>
                                    <input type="number" name="dureeEstimee" min={0}
                                        defaultValue={editingCours?.dureeEstimee || 60}
                                        className="w-full px-4 py-2.5 bg-[#080d1a] border border-slate-800 focus:border-blue-600 text-white rounded-xl text-xs font-bold outline-none transition-all" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-300">Description *</label>
                                <textarea rows={4} name="description" required
                                    defaultValue={editingCours?.description}
                                    placeholder="Décrivez les objectifs généraux de ce cours..."
                                    className="w-full px-4 py-2.5 bg-[#080d1a] border border-slate-800 focus:border-blue-600 text-white rounded-xl text-xs font-semibold outline-none resize-none transition-all" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                                        <Upload className="w-3.5 h-3.5 text-slate-400" /> Image de couverture
                                    </label>

                                    {cropStage === 'idle' && (
                                        <div onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-32 border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all bg-[#080d1a] hover:bg-blue-950/20">
                                            <Upload className="w-6 h-6 text-slate-300" />
                                            <span className="text-[10px] font-bold text-slate-400">Cliquez pour uploader</span>
                                            <span className="text-[8px] text-slate-300 font-semibold">750×422px · .jpg .jpeg .gif .png · 5 Mo max</span>
                                        </div>
                                    )}

                                    {cropStage === 'uploaded' && uploadedImage && (
                                        <div className="space-y-3">
                                            <div ref={imageContainerRef}
                                                className="relative w-full overflow-hidden rounded-xl border-2 border-blue-900/50 bg-[#020617] select-none"
                                                style={{ maxHeight: '420px' }}>
                                                <img ref={imageRef} src={uploadedImage} alt="Aperçu"
                                                    draggable={false} className="w-full block" />

                                                {/* Crop rectangle overlay */}
                                                <div onMouseDown={handleRectMouseDown}
                                                    className="absolute cursor-grab active:cursor-grabbing border-2 border-blue-500 bg-blue-500/10"
                                                    style={{
                                                        left: cropRect.x,
                                                        top: cropRect.y,
                                                        width: cropRect.w,
                                                        height: cropRect.h,
                                                    }}>
                                                    {/* Coin indicators */}
                                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
                                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
                                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
                                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />
                                                </div>
                                            </div>

                                            <div className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                                                Faites glisser le rectangle bleu pour sélectionner la zone à garder (750×422px).
                                            </div>

                                            {imgError && (
                                                <p className="text-[10px] font-bold text-rose-600">{imgError}</p>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={handleCrop}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
                                                    <Crop className="w-3.5 h-3.5" />
                                                    Appliquer le recadrage
                                                </button>
                                                <button type="button" onClick={() => { handleRemoveImage(); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-[10px] font-bold rounded-xl transition-all cursor-pointer">
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {cropStage === 'cropped' && croppedImage && (
                                        <div className="space-y-2">
                                            <div className="relative w-full aspect-[750/422] rounded-xl overflow-hidden border border-slate-800 bg-[#080d1a]">
                                                <img src={croppedImage} alt="Image recadrée"
                                                    className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={handleResetCrop}
                                                    className="px-3 py-1.5 bg-[#020617] hover:bg-slate-900 border border-slate-800 text-slate-200 text-[10px] font-bold rounded-xl transition-all cursor-pointer">
                                                    Recadrer à nouveau
                                                </button>
                                                <button type="button" onClick={handleRemoveImage}
                                                    className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 text-[10px] font-bold rounded-xl transition-all cursor-pointer">
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                                        onChange={(e) => {
                                            handleFileSelect(e.target.files?.[0]);
                                            e.target.value = '';
                                        }} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                                        <Link className="w-3.5 h-3.5 text-slate-400" /> Vidéo de présentation (URL)
                                    </label>
                                    <input type="url" name="videoUrl"
                                        defaultValue={editingCours?.videoUrl}
                                        placeholder="https://youtube.com/..."
                                        className="w-full px-4 py-2.5 bg-[#080d1a] border border-slate-800 focus:border-blue-600 text-white rounded-xl text-xs font-semibold outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* ── PARTICIPANTS ── */}
                        <div className={activeSection === 'PARTICIPANTS' ? 'block space-y-6' : 'hidden'}>
                            <div className="border-b border-slate-800 pb-3">
                                <h2 className="text-sm font-black text-white">Participants cibles</h2>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                    Décrivez à qui s'adresse ce cours et ce que les apprenants vont acquérir.
                                </p>
                            </div>

                            {/* Objectifs */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-300">Objectifs d'apprentissage</label>
                                <div className="space-y-2">
                                    {objectifsKeys.map((key, i) => (
                                        <div key={key} className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <input type="text" name="objectifs" maxLength={140}
                                                    defaultValue={editingCours?.objectifs[i]}
                                                    onInput={(e) => {
                                                        const t = e.currentTarget;
                                                        const s = t.nextElementSibling as HTMLSpanElement;
                                                        if (s) s.innerText = (140 - t.value.length).toString();
                                                    }}
                                                    placeholder="Ex : Maîtriser le déploiement d'architectures hybrides"
                                                    className="w-full pl-4 pr-12 py-2.5 bg-[#080d1a] border border-slate-800 focus:border-blue-600 text-white rounded-xl text-xs font-semibold outline-none transition-all" />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 pointer-events-none">140</span>
                                            </div>
                                            {objectifsKeys.length > 1 && (
                                                <button type="button"
                                                    onClick={() => setObjectifsKeys(prev => prev.filter(k => k !== key))}
                                                    className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer shrink-0">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button type="button"
                                    onClick={() => handleAddDynamic(formRef, 'objectifs', setObjectifsKeys, 'obj', 'objectif')}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-black cursor-pointer flex items-center gap-1">
                                    <PlusCircle className="w-3.5 h-3.5" /> Ajouter un objectif
                                </button>
                            </div>

                            {/* Prérequis */}
                            <div className="space-y-3 border-t border-slate-800 pt-5">
                                <label className="text-xs font-black text-slate-300">Prérequis</label>
                                <div className="space-y-2">
                                    {prerequisKeys.map((key, i) => (
                                        <div key={key} className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <input type="text" name="prerequis" maxLength={140}
                                                    defaultValue={editingCours?.prerequis[i]}
                                                    onInput={(e) => {
                                                        const t = e.currentTarget;
                                                        const s = t.nextElementSibling as HTMLSpanElement;
                                                        if (s) s.innerText = (140 - t.value.length).toString();
                                                    }}
                                                    placeholder="Ex : Connaissances de base en administration réseau"
                                                    className="w-full pl-4 pr-12 py-2.5 bg-[#080d1a] border border-slate-800 focus:border-blue-600 text-white rounded-xl text-xs font-semibold outline-none transition-all" />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 pointer-events-none">140</span>
                                            </div>
                                            {prerequisKeys.length > 1 && (
                                                <button type="button"
                                                    onClick={() => setPrerequisKeys(prev => prev.filter(k => k !== key))}
                                                    className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer shrink-0">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button type="button"
                                    onClick={() => handleAddDynamic(formRef, 'prerequis', setPrerequisKeys, 'pre', 'prérequis')}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-black cursor-pointer flex items-center gap-1">
                                    <PlusCircle className="w-3.5 h-3.5" /> Ajouter un prérequis
                                </button>
                            </div>

                            {/* Public cible */}
                            <div className="space-y-3 border-t border-slate-800 pt-5">
                                <label className="text-xs font-black text-slate-300">Public cible</label>
                                <div className="space-y-2">
                                    {publicCibleKeys.map((key, i) => (
                                        <div key={key} className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <input type="text" name="publicCible" maxLength={140}
                                                    defaultValue={editingCours?.publicCible[i]}
                                                    onInput={(e) => {
                                                        const t = e.currentTarget;
                                                        const s = t.nextElementSibling as HTMLSpanElement;
                                                        if (s) s.innerText = (140 - t.value.length).toString();
                                                    }}
                                                    placeholder="Ex : Administrateurs systèmes souhaitant passer AZ-500"
                                                    className="w-full pl-4 pr-12 py-2.5 bg-[#080d1a] border border-slate-800 focus:border-blue-600 text-white rounded-xl text-xs font-semibold outline-none transition-all" />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 pointer-events-none">140</span>
                                            </div>
                                            {publicCibleKeys.length > 1 && (
                                                <button type="button"
                                                    onClick={() => setPublicCibleKeys(prev => prev.filter(k => k !== key))}
                                                    className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer shrink-0">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button type="button"
                                    onClick={() => handleAddDynamic(formRef, 'publicCible', setPublicCibleKeys, 'pub', 'public cible')}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-black cursor-pointer flex items-center gap-1">
                                    <PlusCircle className="w-3.5 h-3.5" /> Ajouter un public cible
                                </button>
                            </div>
                        </div>

                        {/* ── MODULES ── */}
                        <div className={activeSection === 'MODULES' ? 'block space-y-5' : 'hidden'}>
                            <div className="border-b border-slate-800 pb-3">
                                <h2 className="text-sm font-black text-white">Modules du cours</h2>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                    Gérez les chapitres de votre cours. Si le cours n'est pas encore créé, il le sera automatiquement à l'ajout du premier module.
                                </p>
                            </div>
                            <div className="space-y-3">
                                    {modules.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic text-center py-4">Aucun module pour l'instant.</p>
                                    ) : (
                                        modules.map((m, idx) => (
                                            <div key={m.id} className="flex items-center gap-3 p-4 bg-[#080d1a] border border-slate-800 rounded-2xl">
                                                <span className="w-6 h-6 rounded-lg bg-blue-950/40 text-cyan-400 text-[10px] font-black flex items-center justify-center border border-blue-900/35 shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-slate-300 truncate">{m.titre}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 flex-wrap">
                                                        {m.dureeEstimee && <span>{m.dureeEstimee} min</span>}
                                                        {m.contenu && <span className="text-blue-500">· Leçon</span>}
                                                        {m.videoUrl && <span className="text-purple-500">· Vidéo</span>}
                                                        <span>· {m.ressources.length} ressource{m.ressources.length > 1 ? 's' : ''}</span>
                                                    </p>
                                                </div>
                                                <button type="button" onClick={() => {
                                                    setEditingModule(m);
                                                    setModuleForm({ titre: m.titre, dureeEstimee: m.dureeEstimee || 30, contenu: m.contenu || '' });
                                                }}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all cursor-pointer shrink-0"
                                                    title="Modifier le module">
                                                    <FileText className="w-3.5 h-3.5" />
                                                </button>
                                                <button type="button" onClick={() => handleDeleteModule(m.id)}
                                                    className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shrink-0"
                                                    title="Supprimer">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))
                                    )}

                                    {/* Ajouter / Modifier un module */}
                                    {(addingModule || editingModule) && (
                                        <div className="p-4 bg-blue-950/20 border border-blue-900/40 rounded-2xl space-y-3">
                                            <p className="text-xs font-black text-cyan-400">
                                                {editingModule ? 'Modifier le module' : 'Nouveau module'}
                                            </p>
                                            <input type="text" value={moduleForm.titre}
                                                onChange={e => setModuleForm(p => ({ ...p, titre: e.target.value }))}
                                                placeholder="Titre du module"
                                                className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-xl text-xs font-semibold text-white outline-none" />
                                            <textarea rows={4} value={moduleForm.contenu}
                                                onChange={e => setModuleForm(p => ({ ...p, contenu: e.target.value }))}
                                                placeholder="Contenu du module (markdown ou texte)"
                                                className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-xl text-xs font-semibold text-white outline-none resize-none" />
                                            <input type="number" value={moduleForm.dureeEstimee}
                                                onChange={e => setModuleForm(p => ({ ...p, dureeEstimee: Number(e.target.value) }))}
                                                placeholder="Durée estimée (minutes)" min={1}
                                                className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-xl text-xs font-bold text-white outline-none" />
                                            <div className="flex items-center gap-2">
                                                <button type="button"
                                                    onClick={async () => {
                                                        if (!moduleForm.titre.trim()) { showToast("Titre requis.", "error"); return; }
                                                        const cId = await ensureCours();
                                                        if (!cId) { showToast("Remplissez d'abord le titre du cours dans l'onglet Accueil.", "error"); return; }
                                                        try {
                                                            const body = {
                                                                titre: moduleForm.titre,
                                                                contenu: moduleForm.contenu || undefined,
                                                                dureeEstimee: moduleForm.dureeEstimee || 30,
                                                            }
                                                            if (editingModule) {
                                                                const res = await apiFetch(`/cours/modules/${editingModule.id}`, {
                                                                    method: 'PATCH', body,
                                                                });
                                                                setModules(prev => prev.map(m => m.id === editingModule.id ? { ...m, ...body } : m));
                                                                showToast("Module mis à jour.", "success");
                                                            } else {
                                                                const res = await apiFetch(`/cours/${cId}/modules`, {
                                                                    method: 'POST', body,
                                                                });
                                                                setModules(prev => [...prev, res]);
                                                                showToast("Module ajouté.", "success");
                                                            }
                                                            setModuleForm({ titre: '', dureeEstimee: 30, contenu: '' });
                                                            setAddingModule(false);
                                                            setEditingModule(null);
                                                        } catch (err: any) {
                                                            showToast(err.message || "Erreur.", "error");
                                                        }
                                                    }}
                                                    className="px-4 py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl cursor-pointer hover:bg-blue-700 transition-all">
                                                    {editingModule ? 'Enregistrer' : 'Ajouter'}
                                                </button>
                                                <button type="button" onClick={() => { setAddingModule(false); setEditingModule(null); setModuleForm({ titre: '', dureeEstimee: 30, contenu: '' }); }}
                                                    className="px-3 py-2.5 text-slate-400 text-xs font-bold cursor-pointer hover:text-slate-300">
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!addingModule && !editingModule && (
                                        <button type="button" onClick={() => setAddingModule(true)}
                                            className="w-full py-3 border-2 border-dashed border-slate-800 hover:border-blue-500/50 text-slate-400 hover:text-white text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2">
                                            <Plus className="w-4 h-4" />
                                            Ajouter un module
                                        </button>
                                    )}
                                 </div>
                        </div>

                        {/* ── SIMULATION ── */}
                        <div className={activeSection === 'SIMULATION' ? 'block space-y-5' : 'hidden'}>
                            <div className="border-b border-slate-800 pb-3">
                                <h2 className="text-sm font-black text-white flex items-center gap-2">
                                    <Play className="w-4 h-4 text-purple-600" />
                                    Simulation de fin de cours
                                </h2>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                    Créez un quiz de validation que les apprenants devront réussir après avoir terminé tous les modules.
                                </p>
                            </div>

                            {simLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="animate-spin w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full" />
                                </div>
                            ) : !courseSim ? (
                                <div className="space-y-4">
                                    <div className="p-6 bg-[#080d1a] border border-slate-800 rounded-2xl text-center">
                                        <HelpCircle className="w-8 h-8 text-purple-500/60 mx-auto mb-2" />
                                        <p className="text-xs font-bold text-slate-300 mb-1">
                                            Aucune simulation configurée pour ce cours.
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-semibold mb-4">
                                            Les apprenants ne pourront pas valider le cours sans simulation.
                                        </p>
                                    </div>

                                    {!creatingSim ? (
                                        <button type="button" onClick={() => setCreatingSim(true)}
                                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2">
                                            <Play className="w-4 h-4" />
                                            Créer la simulation
                                        </button>
                                    ) : (
                                        <div className="p-4 bg-purple-950/20 border border-purple-900/40 rounded-2xl space-y-3">
                                            <p className="text-xs font-black text-cyan-400">Nouvelle simulation</p>
                                            <input type="text" value={simForm.titre}
                                                onChange={e => setSimForm(p => ({ ...p, titre: e.target.value }))}
                                                placeholder="Titre de la simulation"
                                                className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-semibold text-white outline-none" />
                                            <textarea rows={2} value={simForm.description}
                                                onChange={e => setSimForm(p => ({ ...p, description: e.target.value }))}
                                                placeholder="Description (optionnelle)"
                                                className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-semibold text-white outline-none resize-none" />
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400">Durée (min)</label>
                                                    <input type="number" value={simForm.duree}
                                                        onChange={e => setSimForm(p => ({ ...p, duree: Number(e.target.value) }))} min={1}
                                                        className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-bold text-white outline-none" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400">Score min. (%)</label>
                                                    <input type="number" value={simForm.scoreMinimal}
                                                        onChange={e => setSimForm(p => ({ ...p, scoreMinimal: Number(e.target.value) }))} min={0} max={100}
                                                        className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-bold text-white outline-none" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={async () => {
                                                    if (!simForm.titre.trim()) { showToast("Titre requis.", "error"); return; }
                                                    const cId = await ensureCours();
                                                    if (!cId) { showToast("Remplissez d'abord le titre du cours dans l'onglet Accueil.", "error"); return; }
                                                    try {
                                                        const fd = new FormData(formRef.current!);
                                                        const certId = Number(fd.get('certificationId') || certs[0]?.id);
                                                        const sim = await apiFetch(`/simulations/cours/${cId}`, {
                                                            method: 'POST',
                                                            body: {
                                                                titre: simForm.titre,
                                                                description: simForm.description || undefined,
                                                                duree: simForm.duree,
                                                                scoreMinimal: simForm.scoreMinimal,
                                                                certificationId: certId,
                                                            },
                                                        });
                                                        setCourseSim(sim);
                                                        setCreatingSim(false);
                                                        showToast("Simulation créée.", "success");
                                                    } catch (err: any) {
                                                        showToast(err.message || "Erreur.", "error");
                                                    }
                                                }}
                                                    className="px-4 py-2.5 bg-purple-600 text-white text-xs font-black rounded-xl cursor-pointer hover:bg-purple-700 transition-all">
                                                    Créer
                                                </button>
                                                <button type="button" onClick={() => setCreatingSim(false)}
                                                    className="px-3 py-2.5 text-slate-400 text-xs font-bold cursor-pointer hover:text-slate-300">
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* Infos simulation */}
                                    <div className="p-4 bg-[#080d1a] border border-slate-800 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-black text-purple-400">{courseSim.titre}</p>
                                            {courseSim.description && (
                                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{courseSim.description}</p>
                                            )}
                                            <p className="text-[10px] text-slate-400 font-bold mt-1">
                                                {courseSim.duree} min · Score min. {courseSim.scoreMinimal}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Questions */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-xs font-black text-slate-300">
                                                Questions ({simQuestions.length})
                                            </h3>
                                            {!addingQuestion && !editingQuestion && (
                                                <button type="button" onClick={() => {
                                                    setAddingQuestion(true);
                                                    setQForm({ enonce: '', type: 'QCM', reponseCorrecte: '', explication: '', options: [{ lettre: 'A', texte: '' }, { lettre: 'B', texte: '' }] });
                                                }}
                                                    className="px-3 py-1.5 bg-purple-600 text-white text-[10px] font-black rounded-lg cursor-pointer hover:bg-purple-700 transition-all flex items-center gap-1">
                                                    <Plus className="w-3 h-3" />
                                                    Ajouter
                                                </button>
                                            )}
                                        </div>

                                        {simQuestions.length === 0 && !addingQuestion && (
                                            <p className="text-xs text-slate-400 italic text-center py-4">Aucune question pour l'instant.</p>
                                        )}

                                        <div className="space-y-2">
                                            {simQuestions.map((q, idx) => (
                                                <div key={q.id} className="flex items-start gap-3 p-3 bg-[#080d1a] border border-slate-800 rounded-xl">
                                                    <span className="w-5 h-5 rounded-lg bg-purple-950/40 text-purple-400 text-[9px] font-black flex items-center justify-center border border-purple-900/35 shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-300">{q.enonce}</p>
                                                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-2 flex-wrap">
                                                            <span className={q.type === 'QCM' ? 'text-blue-500' : q.type === 'VRAI_FAUX' ? 'text-emerald-500' : 'text-amber-500'}>
                                                                {q.type}
                                                            </span>
                                                            {q.options?.length > 0 && <span>{q.options.length} options</span>}
                                                            <span className="text-xs">· Rép: <strong className="text-slate-400">{q.reponseCorrecte}</strong></span>
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button type="button" onClick={() => {
                                                            setEditingQuestion(q);
                                                            setQForm({
                                                                enonce: q.enonce,
                                                                type: q.type,
                                                                reponseCorrecte: q.reponseCorrecte,
                                                                explication: q.explication || '',
                                                                options: q.options?.map((o: any) => ({ lettre: o.lettre, texte: o.texte })) || [],
                                                            });
                                                        }}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all cursor-pointer"
                                                            title="Modifier">
                                                            <FileText className="w-3 h-3" />
                                                        </button>
                                                        <button type="button" onClick={async () => {
                                                            try {
                                                                await apiFetch(`/simulations/questions/${q.id}`, { method: 'DELETE' });
                                                                setSimQuestions(prev => prev.filter(x => x.id !== q.id));
                                                                showToast("Question supprimée.", "success");
                                                            } catch (err: any) {
                                                                showToast(err.message || "Erreur.", "error");
                                                            }
                                                        }}
                                                            className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                                            title="Supprimer">
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Ajouter / Modifier question */}
                                        {(addingQuestion || editingQuestion) && (
                                            <div className="p-4 bg-purple-950/20 border border-purple-900/40 rounded-2xl space-y-3 mt-3">
                                                <p className="text-xs font-black text-cyan-400">
                                                    {editingQuestion ? 'Modifier la question' : 'Nouvelle question'}
                                                </p>
                                                <input type="text" value={qForm.enonce}
                                                    onChange={e => setQForm(p => ({ ...p, enonce: e.target.value }))}
                                                    placeholder="Énoncé de la question"
                                                    className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-semibold text-white outline-none" />
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400">Type</label>
                                                    <select value={qForm.type} onChange={e => setQForm(p => ({ ...p, type: e.target.value, options: e.target.value === 'VRAI_FAUX' ? [{ lettre: 'V', texte: 'Vrai' }, { lettre: 'F', texte: 'Faux' }] : e.target.value === 'QCM' ? [{ lettre: 'A', texte: '' }, { lettre: 'B', texte: '' }] : [] }))}
                                                        className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-bold text-white outline-none cursor-pointer">
                                                        <option value="QCM">QCM (choix multiple)</option>
                                                        <option value="VRAI_FAUX">Vrai / Faux</option>
                                                        <option value="REDACTION">Rédaction</option>
                                                    </select>
                                                </div>

                                                {qForm.type === 'QCM' && (
                                                    <div className="space-y-2">
                                                        {qForm.options.map((opt, oi) => (
                                                            <div key={oi} className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-slate-400 w-4 shrink-0">{opt.lettre}</span>
                                                                <input type="text" value={opt.texte}
                                                                    onChange={e => {
                                                                        const newOpts = [...qForm.options];
                                                                        newOpts[oi] = { ...newOpts[oi], texte: e.target.value };
                                                                        setQForm(p => ({ ...p, options: newOpts }));
                                                                    }}
                                                                    placeholder={`Option ${opt.lettre}`}
                                                                    className="flex-1 px-3 py-2 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-lg text-xs font-semibold text-white outline-none" />
                                                                {oi === qForm.options.length - 1 && qForm.options.length < 6 && (
                                                                    <button type="button" onClick={() => {
                                                                        const nextLetter = String.fromCharCode(65 + qForm.options.length);
                                                                        setQForm(p => ({ ...p, options: [...p.options, { lettre: nextLetter, texte: '' }] }));
                                                                    }}
                                                                        className="p-1.5 text-purple-400 hover:text-purple-600 cursor-pointer">
                                                                        <Plus className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                                {qForm.options.length > 2 && (
                                                                    <button type="button" onClick={() => {
                                                                        setQForm(p => ({ ...p, options: p.options.filter((_, i) => i !== oi) }));
                                                                    }}
                                                                        className="p-1.5 text-rose-400 hover:text-rose-600 cursor-pointer">
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400">Réponse correcte</label>
                                                    {qForm.type === 'VRAI_FAUX' ? (
                                                        <select value={qForm.reponseCorrecte} onChange={e => setQForm(p => ({ ...p, reponseCorrecte: e.target.value }))}
                                                            className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-bold text-white outline-none cursor-pointer">
                                                            <option value="">Sélectionner...</option>
                                                            <option value="V">Vrai</option>
                                                            <option value="F">Faux</option>
                                                        </select>
                                                    ) : qForm.type === 'QCM' ? (
                                                        <select value={qForm.reponseCorrecte} onChange={e => setQForm(p => ({ ...p, reponseCorrecte: e.target.value }))}
                                                            className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-bold text-white outline-none cursor-pointer">
                                                            <option value="">Sélectionner...</option>
                                                            {qForm.options.filter(o => o.texte.trim()).map(o => (
                                                                <option key={o.lettre} value={o.lettre}>{o.lettre}. {o.texte}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input type="text" value={qForm.reponseCorrecte}
                                                            onChange={e => setQForm(p => ({ ...p, reponseCorrecte: e.target.value }))}
                                                            placeholder="Réponse attendue (ou mots-clés)"
                                                            className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-semibold text-white outline-none" />
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-400">Explication (optionnelle)</label>
                                                    <textarea rows={2} value={qForm.explication}
                                                        onChange={e => setQForm(p => ({ ...p, explication: e.target.value }))}
                                                        placeholder="Expliquer pourquoi cette réponse est correcte..."
                                                        className="w-full px-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 rounded-xl text-xs font-semibold text-white outline-none resize-none" />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button type="button"
                                                        onClick={async () => {
                                                            if (!qForm.enonce.trim()) { showToast("Énoncé requis.", "error"); return; }
                                                            if (!qForm.reponseCorrecte.trim() && qForm.type !== 'REDACTION') { showToast("Réponse correcte requise.", "error"); return; }
                                                            try {
                                                                const body = {
                                                                    enonce: qForm.enonce,
                                                                    type: qForm.type,
                                                                    reponseCorrecte: qForm.reponseCorrecte,
                                                                    explication: qForm.explication || undefined,
                                                                    options: qForm.type === 'QCM' || qForm.type === 'VRAI_FAUX' ? qForm.options.filter(o => o.texte.trim()).map(o => ({ lettre: o.lettre, texte: o.texte })) : [],
                                                                };
                                                                if (editingQuestion) {
                                                                    const res = await apiFetch(`/simulations/questions/${editingQuestion.id}`, { method: 'PATCH', body });
                                                                    setSimQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...res } : q));
                                                                    showToast("Question mise à jour.", "success");
                                                                } else {
                                                                    const res = await apiFetch(`/simulations/cours/${coursId}/questions`, { method: 'POST', body });
                                                                    setSimQuestions(prev => [...prev, res]);
                                                                    showToast("Question ajoutée.", "success");
                                                                }
                                                                setAddingQuestion(false);
                                                                setEditingQuestion(null);
                                                                setQForm({ enonce: '', type: 'QCM', reponseCorrecte: '', explication: '', options: [{ lettre: 'A', texte: '' }, { lettre: 'B', texte: '' }] });
                                                            } catch (err: any) {
                                                                showToast(err.message || "Erreur.", "error");
                                                            }
                                                        }}
                                                        className="px-4 py-2.5 bg-purple-600 text-white text-xs font-black rounded-xl cursor-pointer hover:bg-purple-700 transition-all">
                                                        {editingQuestion ? 'Enregistrer' : 'Ajouter'}
                                                    </button>
                                                    <button type="button" onClick={() => { setAddingQuestion(false); setEditingQuestion(null); setQForm({ enonce: '', type: 'QCM', reponseCorrecte: '', explication: '', options: [{ lettre: 'A', texte: '' }, { lettre: 'B', texte: '' }] }); }}
                                                        className="px-3 py-2.5 text-slate-400 text-xs font-bold cursor-pointer hover:text-slate-300">
                                                        Annuler
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                    </form>
                </div>
            </div>

            {/* Confirmation de sortie avec modifications non sauvegardées */}
            {exitAction === 'prompt' && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-xs"
                    onClick={(e) => { if (e.target === e.currentTarget) setExitAction(null); }}>
                    <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 text-left relative overflow-hidden">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-amber-950/20 border-amber-900/40 text-amber-500 shrink-0">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-white">Modifications non sauvegardées</h3>
                                <p className="text-xs font-semibold text-slate-400">
                                    Vous avez des changements qui n'ont pas encore été enregistrés.
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                            Que souhaitez-vous faire ? Vous pouvez enregistrer vos modifications en tant que brouillon,
                            ou les ignorer.
                        </p>

                        <div className="flex flex-col gap-2 pt-2">
                            <button onClick={handleExitSave} disabled={saving}
                                className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">
                                <Save className="w-3.5 h-3.5" />
                                {saving ? 'Sauvegarde...' : 'Enregistrer'}
                            </button>
                            <button onClick={handleExitDiscard}
                                className="w-full px-5 py-3 bg-rose-950/30 hover:bg-rose-900/30 border border-rose-900/40 text-rose-500 font-bold rounded-xl text-xs transition-all cursor-pointer">
                                Ne pas enregistrer
                            </button>
                            <button onClick={() => setExitAction(null)}
                                className="w-full px-5 py-3 bg-[#020617] hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer">
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
