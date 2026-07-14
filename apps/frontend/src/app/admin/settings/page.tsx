"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { Save, RefreshCw } from '@/components/icons';
import { motion } from 'framer-motion';

export default function AdminSettingsPage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [notifReplies, setNotifReplies] = useState(true);
    const [notifLikes, setNotifLikes] = useState(true);
    const [notifSystem, setNotifSystem] = useState(true);
    const [showTargetedCerts, setShowTargetedCerts] = useState(true);
    const [showObtainedCerts, setShowObtainedCerts] = useState(true);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        setLoading(true);
        try {
            const profile = await apiFetch('/users/me/profile');
            if (profile.preferences) {
                setNotifReplies(profile.preferences.notifReplies !== false);
                setNotifLikes(profile.preferences.notifLikes !== false);
                setNotifSystem(profile.preferences.notifSystem !== false);
                setShowTargetedCerts(profile.preferences.showTargetedCerts !== false);
                setShowObtainedCerts(profile.preferences.showObtainedCerts !== false);
            }
        } catch (err: any) {
            showToast(err.message || "Impossible de charger les préférences.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const profile = await apiFetch('/users/me/profile');
            const newPrefs = {
                notifReplies,
                notifLikes,
                notifSystem,
                showTargetedCerts,
                showObtainedCerts,
                targetCertifications: profile.preferences?.targetCertifications || [],
            };
            await apiFetch('/users/me/profile', {
                method: 'PATCH',
                body: { preferences: newPrefs },
            });
            showToast("Préférences enregistrées.", "success");
        } catch (err: any) {
            showToast(err.message || "Erreur lors de l'enregistrement.", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <span className="w-10 h-10 border-4 border-slate-100 border-t-slate-950 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSave}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
            >
                <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Alertes et Système</h3>
                    <p className="text-xs text-slate-500 font-medium">Gérez vos préférences de messagerie et de notifications internes.</p>
                </div>

                <div className="space-y-4 max-w-xl">
                    <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-slate-950">Réponses au Forum</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Recevoir une alerte quand quelqu'un répond à vos sujets ou commentaires.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifReplies}
                            onChange={(e) => setNotifReplies(e.target.checked)}
                            className="accent-indigo-650 w-5 h-5 cursor-pointer"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-slate-950">Mentions J'aime</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Recevoir une notification quand un apprenant aime votre sujet.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifLikes}
                            onChange={(e) => setNotifLikes(e.target.checked)}
                            className="accent-indigo-650 w-5 h-5 cursor-pointer"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-slate-950">Alertes Plateforme & Système</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Notifications de mise à jour, nouveaux contenus et rappels d'examens cibles.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifSystem}
                            onChange={(e) => setNotifSystem(e.target.checked)}
                            className="accent-indigo-650 w-5 h-5 cursor-pointer"
                        />
                    </label>

                    <div className="border-t border-slate-100 pt-4 mt-6">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">Visibilité du Profil Public</h4>
                    </div>

                    <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-slate-950">Afficher mes certifications visées</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Rendre visibles vos objectifs de certification sur votre page de profil public.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={showTargetedCerts}
                            onChange={(e) => setShowTargetedCerts(e.target.checked)}
                            className="accent-indigo-650 w-5 h-5 cursor-pointer"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-slate-950">Afficher mes certifications obtenues</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Rendre visibles vos examens réussis (score ≥ 80%) sur votre profil public.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={showObtainedCerts}
                            onChange={(e) => setShowObtainedCerts(e.target.checked)}
                            className="accent-indigo-650 w-5 h-5 cursor-pointer"
                        />
                    </label>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Enregistrer les préférences</span>
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
