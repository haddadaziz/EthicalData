'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ChevronDown, Award, Send, RefreshCw } from '@/components/icons';
import { getProviderLogo, getCertificateBadgeLogo } from '@/lib/certification-utils';
import { THEMES } from '@/lib/types';

interface NewSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        titre: string;
        theme: string;
        contenu: string;
        certificationId?: number;
    }) => Promise<void>;
    fournisseurs: any[];
    certifications: any[];
    loading: boolean;
}

export default function NewSubjectModal({
    isOpen,
    onClose,
    onSubmit,
    fournisseurs,
    certifications,
    loading,
}: NewSubjectModalProps) {
    const [newTitre, setNewTitre] = useState('');
    const [newTheme, setNewTheme] = useState('Azure & Cloud');
    const [newCertId, setNewCertId] = useState('');
    const [newContenu, setNewContenu] = useState('');
    const [selectedProviderInModal, setSelectedProviderInModal] = useState('');
    const [modalProviderDropdownOpen, setModalProviderDropdownOpen] = useState(false);
    const [modalCertDropdownOpen, setModalCertDropdownOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setNewTitre('');
            setNewTheme('Azure & Cloud');
            setNewContenu('');
            setNewCertId('');
            setSelectedProviderInModal('');
            setModalProviderDropdownOpen(false);
            setModalCertDropdownOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        setNewCertId('');
    }, [selectedProviderInModal]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitre.trim() || !newContenu.trim()) return;
        await onSubmit({
            titre: newTitre,
            theme: newTheme,
            contenu: newContenu,
            certificationId: newCertId ? parseInt(newCertId) : undefined,
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 15 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 15 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6 text-left"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2.5">
                                <MessageSquare className="w-5 h-5 text-blue-600 shrink-0" />
                                <h3 className="text-lg font-black text-slate-955">Nouvelle Discussion</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-955 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-slate-700">Titre de la discussion *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Conseils pour réussir l'examen AZ-900..."
                                    value={newTitre}
                                    onChange={(e) => setNewTitre(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-955 text-xs font-semibold outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-bold text-slate-700">Thématique *</label>
                                    <select
                                        value={newTheme}
                                        onChange={(e) => setNewTheme(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-955 text-xs font-bold outline-none cursor-pointer"
                                    >
                                        {THEMES.filter(t => t !== 'TOUS').map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-bold text-slate-700">Constructeur / Partenaire (Optionnel)</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setModalProviderDropdownOpen(!modalProviderDropdownOpen)}
                                            className="w-full flex items-center gap-2.5 px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-955 text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all text-left"
                                        >
                                            {selectedProviderInModal && getProviderLogo(fournisseurs.find((f: any) => f.id === selectedProviderInModal)?.slug || '') && (
                                                <img src={getProviderLogo(fournisseurs.find((f: any) => f.id === selectedProviderInModal)?.slug || '')} alt="" className="w-5 h-5 object-contain rounded shrink-0" />
                                            )}
                                            <span className="flex-1 truncate">
                                                {!selectedProviderInModal ? 'Aucun constructeur' : fournisseurs.find((f: any) => f.id === selectedProviderInModal)?.nom || 'Sélectionner'}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${modalProviderDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {modalProviderDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setModalProviderDropdownOpen(false)} />
                                                <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setSelectedProviderInModal(''); setModalProviderDropdownOpen(false); }}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                                                            !selectedProviderInModal ? 'bg-slate-100 text-slate-955' : 'text-slate-600'
                                                        }`}
                                                    >
                                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                            <Award className="w-4 h-4 text-slate-500" />
                                                        </div>
                                                        <span className="truncate">Aucun constructeur</span>
                                                    </button>
                                                    <div className="border-t border-slate-100" />
                                                    <div className="max-h-48 overflow-y-auto">
                                                        {fournisseurs.map((f: any) => {
                                                            const logo = getProviderLogo(f.slug || f.nom || '');
                                                            return (
                                                                <button
                                                                    key={f.id}
                                                                    type="button"
                                                                    onClick={() => { setSelectedProviderInModal(f.id); setModalProviderDropdownOpen(false); }}
                                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                                                                        selectedProviderInModal === f.id ? 'bg-slate-100 text-slate-955' : 'text-slate-600'
                                                                    }`}
                                                                >
                                                                    {logo ? (
                                                                        <img src={logo} alt="" className="w-7 h-7 object-contain rounded shrink-0" />
                                                                    ) : (
                                                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                                            <Award className="w-4 h-4 text-slate-500" />
                                                                        </div>
                                                                    )}
                                                                    <span className="block truncate font-bold text-left flex-1">{f.nom}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-slate-700">Certification liée (Optionnel)</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        disabled={!selectedProviderInModal}
                                        onClick={() => setModalCertDropdownOpen(!modalCertDropdownOpen)}
                                        className={`w-full flex items-center gap-2.5 px-4 py-3.5 border focus:border-blue-600 rounded-2xl text-slate-955 text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all text-left ${
                                            !selectedProviderInModal 
                                                ? 'bg-slate-100 border-slate-200/50 opacity-60 cursor-not-allowed' 
                                                : 'bg-slate-50 border-slate-200'
                                        }`}
                                    >
                                        {selectedProviderInModal && newCertId && (
                                            (() => {
                                                const activeCertObj = certifications.find((c: any) => c.id === newCertId);
                                                const logo = getCertificateBadgeLogo(activeCertObj);
                                                return logo ? (
                                                    <img src={logo} alt="" className="w-5 h-5 object-contain rounded shrink-0" />
                                                ) : null;
                                            })()
                                        )}
                                        <span className="flex-1 truncate">
                                            {!selectedProviderInModal
                                                ? "Sélectionnez d'abord un constructeur"
                                                : !newCertId
                                                    ? "Aucune certification"
                                                    : (() => {
                                                        const activeCertObj = certifications.find((c: any) => c.id === newCertId);
                                                        return activeCertObj ? `${activeCertObj.codeExamen ? `[${activeCertObj.codeExamen}] ` : ''}${activeCertObj.nom}` : "Sélectionner";
                                                    })()
                                            }
                                        </span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${modalCertDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {modalCertDropdownOpen && selectedProviderInModal && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setModalCertDropdownOpen(false)} />
                                            <div className="absolute top-full left-0 mt-1.5 z-50 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                                                <button
                                                    type="button"
                                                    onClick={() => { setNewCertId(''); setModalCertDropdownOpen(false); }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                                                        !newCertId ? 'bg-slate-100 text-slate-955' : 'text-slate-600'
                                                    }`}
                                                >
                                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                        <Award className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                    <span className="truncate">Aucune certification</span>
                                                </button>
                                                <div className="border-t border-slate-100" />
                                                <div className="max-h-48 overflow-y-auto">
                                                    {certifications
                                                        .filter(c => c.fournisseur?.id === selectedProviderInModal || c.fournisseurId === Number(selectedProviderInModal) || c.fournisseur?.slug === selectedProviderInModal)
                                                        .map((c: any) => {
                                                            const logo = getCertificateBadgeLogo(c);
                                                            return (
                                                                <button
                                                                    key={c.id}
                                                                    type="button"
                                                                    onClick={() => { setNewCertId(c.id); setModalCertDropdownOpen(false); }}
                                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                                                                        newCertId === c.id ? 'bg-slate-100 text-slate-955' : 'text-slate-600'
                                                                    }`}
                                                                >
                                                                    {logo ? (
                                                                        <img src={logo} alt="" className="w-7 h-7 object-contain rounded shrink-0" />
                                                                    ) : (
                                                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                                            <Award className="w-4 h-4 text-slate-500" />
                                                                        </div>
                                                                    )}
                                                                    <span className="block truncate font-bold text-left flex-1">
                                                                        {c.codeExamen ? `[${c.codeExamen}] ` : ''}{c.nom}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Contenu / Question *</label>
                                <textarea
                                    required
                                    rows={5}
                                    placeholder="Décrivez précisément votre question ou votre retour d'expérience..."
                                    value={newContenu}
                                    onChange={(e) => setNewContenu(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-955 text-xs font-semibold outline-none resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                                >
                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    <span>Publier la discussion</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
