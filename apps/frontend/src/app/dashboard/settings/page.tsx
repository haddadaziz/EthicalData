"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { Bell, Save, RefreshCw } from '@/components/icons';
import { motion } from 'framer-motion';

export default function SettingsPage() {
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
                <span className="w-10 h-10 border-4 border-[#080d1a] border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-8 text-white">
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Paramètres</h1>
                <p className="text-sm text-slate-400 font-medium mt-1">Gérez vos préférences de notification et la visibilité de votre profil.</p>
            </div>

            <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSave}
                className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm hover:shadow-lg hover:border-slate-700 transition-all duration-300"
            >
                <div className="border-b border-slate-800 pb-4">
                    <h3 className="text-base font-black text-white tracking-tight">Alertes et Système</h3>
                    <p className="text-xs text-slate-400 font-medium">Gérez vos préférences de messagerie et de notifications internes.</p>
                </div>

                <div className="space-y-4 max-w-xl">
                    <label className="flex items-center justify-between p-4 bg-[#020617] border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition-colors group">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">Réponses au Forum</h4>
                            <p className="text-[11px] text-slate-400 font-medium">Recevoir une alerte quand quelqu'un répond à vos sujets ou commentaires.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifReplies}
                            onChange={(e) => setNotifReplies(e.target.checked)}
                            className="accent-blue-600 w-5 h-5 cursor-pointer rounded bg-slate-800 border-slate-700 focus:ring-blue-600/20"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-[#020617] border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition-colors group">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">Mentions J'aime</h4>
                            <p className="text-[11px] text-slate-400 font-medium">Recevoir une notification quand un apprenant aime votre sujet.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifLikes}
                            onChange={(e) => setNotifLikes(e.target.checked)}
                            className="accent-blue-600 w-5 h-5 cursor-pointer rounded bg-slate-800 border-slate-700 focus:ring-blue-600/20"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-[#020617] border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition-colors group">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">Alertes Plateforme & Système</h4>
                            <p className="text-[11px] text-slate-400 font-medium">Notifications de mise à jour, nouveaux contenus et rappels d'examens cibles.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifSystem}
                            onChange={(e) => setNotifSystem(e.target.checked)}
                            className="accent-blue-600 w-5 h-5 cursor-pointer rounded bg-slate-800 border-slate-700 focus:ring-blue-600/20"
                        />
                    </label>

                    <div className="border-t border-slate-800 pt-4 mt-6">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Visibilité du Profil Public</h4>
                    </div>

                    <label className="flex items-center justify-between p-4 bg-[#020617] border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition-colors group">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">Afficher mes certifications visées</h4>
                            <p className="text-[11px] text-slate-400 font-medium">Rendre visibles vos objectifs de certification sur votre page de profil public.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={showTargetedCerts}
                            onChange={(e) => setShowTargetedCerts(e.target.checked)}
                            className="accent-blue-600 w-5 h-5 cursor-pointer rounded bg-slate-800 border-slate-700 focus:ring-blue-600/20"
                        />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-[#020617] border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900 transition-colors group">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">Afficher mes certifications obtenues</h4>
                            <p className="text-[11px] text-slate-400 font-medium">Rendre visibles vos examens réussis (score ≥ 80%) sur votre profil public.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={showObtainedCerts}
                            onChange={(e) => setShowObtainedCerts(e.target.checked)}
                            className="accent-blue-600 w-5 h-5 cursor-pointer rounded bg-slate-800 border-slate-700 focus:ring-blue-600/20"
                        />
                    </label>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Enregistrer les préférences</span>
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
