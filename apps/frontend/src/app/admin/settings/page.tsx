"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { Save, RefreshCw, Send, Bell, Users } from '@/components/icons';
import { motion } from 'framer-motion';

export default function AdminSettingsPage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userRole, setUserRole] = useState<'SUPER_ADMIN' | 'ADMIN' | null>(null);

    // Préférences (admin classique)
    const [notifReplies, setNotifReplies] = useState(true);
    const [notifLikes, setNotifLikes] = useState(true);
    const [notifSystem, setNotifSystem] = useState(true);


    // Envoi de notification (super admin)
    const [notifTitre, setNotifTitre] = useState('');
    const [notifMessage, setNotifMessage] = useState('');
    const [notifTarget, setNotifTarget] = useState<'FORMATEUR' | 'APPRENANT' | 'TOUS'>('TOUS');
    const [sendingNotif, setSendingNotif] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const profile = await apiFetch('/users/me/profile');
            const roles: string[] = profile?.roles?.map((r: any) => r.nom) || [];
            if (roles.includes('SUPER_ADMIN')) {
                setUserRole('SUPER_ADMIN');
            } else {
                setUserRole('ADMIN');
            }
            if (profile.preferences) {
                setNotifReplies(profile.preferences.notifReplies !== false);
                setNotifLikes(profile.preferences.notifLikes !== false);
                setNotifSystem(profile.preferences.notifSystem !== false);
            }
        } catch (err: any) {
            showToast(err.message || "Impossible de charger le profil.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSavePreferences = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const profile = await apiFetch('/users/me/profile');
            await apiFetch('/users/me/profile', {
                method: 'PATCH',
                body: {
                    preferences: {
                        notifReplies,
                        notifLikes,
                        notifSystem,
                        targetCertifications: profile.preferences?.targetCertifications || [],
                    },
                },
            });
            showToast("Préférences enregistrées.", "success");
        } catch (err: any) {
            showToast(err.message || "Erreur lors de l'enregistrement.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notifTitre.trim() || !notifMessage.trim()) {
            showToast("Veuillez remplir le titre et le message.", "error");
            return;
        }
        setSendingNotif(true);
        try {
            const result = await apiFetch('/notifications/send', {
                method: 'POST',
                body: { titre: notifTitre, message: notifMessage, target: notifTarget },
            });
            showToast(`Notification envoyée à ${result.count} utilisateur(s).`, "success");
            setNotifTitre('');
            setNotifMessage('');
        } catch (err: any) {
            showToast(err.message || "Erreur lors de l'envoi.", "error");
        } finally {
            setSendingNotif(false);
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
        <div className="max-w-3xl mx-auto space-y-8">
            {userRole === 'SUPER_ADMIN' && (
                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSendNotification}
                    className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-5 shadow-sm"
                >
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900 tracking-tight">Envoyer une notification</h3>
                            <p className="text-xs text-slate-500 font-medium">Créez et envoyez une notification à un groupe d'utilisateurs.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Titre *</label>
                            <input type="text" required value={notifTitre} onChange={(e) => setNotifTitre(e.target.value)}
                                placeholder="Ex: Maintenance plateforme"
                                className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-xl text-xs font-semibold outline-none transition-colors" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Message *</label>
                            <textarea required rows={4} value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)}
                                placeholder="Écrivez le contenu de votre notification..."
                                className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-xl text-xs font-semibold outline-none transition-colors resize-none" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Destinataires</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { val: 'APPRENANT', label: 'Apprenants', img: '/images/apprenant.png' },
                                    { val: 'FORMATEUR', label: 'Formateurs', img: '/images/formateur.png' },
                                    { val: 'TOUS', label: 'Tout le monde', icon: true },
                                ].map((opt: any) => (
                                    <button key={opt.val} type="button" onClick={() => setNotifTarget(opt.val as any)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                            notifTarget === opt.val
                                                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                        }`}>
                                        {opt.img ? (
                                            <img src={opt.img} alt="" className="w-4 h-4 object-contain" />
                                        ) : (
                                            <Users className="w-4 h-4" />
                                        )}
                                        <span>{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={sendingNotif}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50">
                            {sendingNotif ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            <span>{sendingNotif ? 'Envoi en cours...' : 'Envoyer la notification'}</span>
                        </button>
                    </div>
                </motion.form>
            )}

            <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSavePreferences}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
            >
                <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Préférences de notifications</h3>
                    <p className="text-xs text-slate-500 font-medium">Gérez vos préférences de messagerie et de notifications internes.</p>
                </div>

                <div className="space-y-4 max-w-xl">
                    <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-slate-950">Réponses au Forum</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Recevoir une alerte quand quelqu'un répond à vos sujets ou commentaires.</p>
                        </div>
                        <input type="checkbox" checked={notifReplies} onChange={(e) => setNotifReplies(e.target.checked)}
                            className="accent-indigo-650 w-5 h-5 cursor-pointer" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-slate-950">Mentions J'aime</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Recevoir une notification quand un apprenant aime votre sujet.</p>
                        </div>
                        <input type="checkbox" checked={notifLikes} onChange={(e) => setNotifLikes(e.target.checked)}
                            className="accent-indigo-650 w-5 h-5 cursor-pointer" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-slate-950">Alertes Plateforme & Système</h4>
                            <p className="text-[11px] text-slate-500 font-medium">Notifications de mise à jour, nouveaux contenus et rappels d'examens cibles.</p>
                        </div>
                        <input type="checkbox" checked={notifSystem} onChange={(e) => setNotifSystem(e.target.checked)}
                            className="accent-indigo-650 w-5 h-5 cursor-pointer" />
                    </label>

                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button type="submit" disabled={saving}
                        className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50">
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Enregistrer les préférences</span>
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
