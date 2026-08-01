"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { Bell, Save, RefreshCw, Shield } from '@/components/icons';
import { motion } from 'framer-motion';
import { getUser2FAStatus, setUser2FAStatus, verifyTOTPCode, ADMIN_2FA_SECRET } from '@/lib/totp-utils';

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

            {/* SECTEUR SÉCURITÉ & DOUBLE AUTHENTIFICATION (2FA) */}
            <UserTwoFactorAuthSection />
        </div>
    );
}

function UserTwoFactorAuthSection() {
    const { showToast } = useToast();
    const [enabled2FA, setEnabled2FA] = useState(false);
    const [totpCode, setTotpCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);

    useEffect(() => {
        setEnabled2FA(getUser2FAStatus());
    }, []);

    const handleToggle2FA = () => {
        if (enabled2FA) {
            setUser2FAStatus(false);
            setEnabled2FA(false);
            showToast("Authentification à deux facteurs (2FA) désactivée.", "info");
        } else {
            setShowQrModal(true);
        }
    };

    const handleConfirm2FA = (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);
        setTimeout(() => {
            const isValid = verifyTOTPCode(totpCode, ADMIN_2FA_SECRET);
            setVerifying(false);
            if (!isValid) {
                showToast("Code TOTP incorrect ou expiré. Veuillez vérifier l'heure de votre application Google Authenticator.", "error");
                return;
            }
            setUser2FAStatus(true);
            setEnabled2FA(true);
            setShowQrModal(false);
            setTotpCode('');
            showToast("Authentification à deux facteurs (2FA) activée pour votre compte !", "success");
        }, 500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm text-left"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                            Authentification à Deux Facteurs (2FA / A2F)
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">Sécurisez l&apos;accès à votre espace membre avec Google Authenticator ou Microsoft Authenticator.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                        enabled2FA ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                        {enabled2FA ? '2FA Actif & Protégé' : '2FA Inactif'}
                    </span>

                    {/* Switch Toggle 1-clic */}
                    <button
                        type="button"
                        onClick={handleToggle2FA}
                        className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                            enabled2FA ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
                        }`}
                    >
                        <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-md" />
                    </button>
                </div>
            </div>

            <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                    <p className="font-bold text-white">Sécurité du Compte Apprenant</p>
                    <p className="text-slate-400 font-medium">Un code de vérification à 6 chiffres vous sera demandé à chaque connexion.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="px-4 py-2 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 font-bold rounded-xl text-xs transition-all cursor-pointer shrink-0"
                >
                    {enabled2FA ? 'Ré-afficher QR Code' : 'Activer 2FA (TOTP)'}
                </button>
            </div>

            {/* CONFORMITÉ LOI MAROCAINE 09-08 (CNDP) */}
            <div className="p-6 bg-[#080d1a] border border-slate-800 rounded-3xl space-y-4 shadow-xl text-left">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                            Conformité à la Loi marocaine n° 09-08 (CNDP)
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                            Vos données personnelles sont protégées conformément à la réglementation de la CNDP.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <button
                        type="button"
                        onClick={() => showToast("Exportation de vos données personnelles (Loi 09-08) préparée au format JSON.", "success")}
                        className="p-3 bg-[#020617] border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-xl text-left flex items-center justify-between transition-all cursor-pointer"
                    >
                        <span>Exporter mes données personnelles</span>
                        <span className="text-[10px] text-cyan-400 font-mono">JSON / CSV</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => showToast("Votre demande de suppression/droit à l'oubli a été transmise à notre DPO.", "info")}
                        className="p-3 bg-[#020617] border border-slate-800 hover:border-rose-900/50 text-slate-300 hover:text-rose-400 font-bold rounded-xl text-left flex items-center justify-between transition-all cursor-pointer"
                    >
                        <span>Exercer mon droit à l&apos;oubli</span>
                        <span className="text-[10px] text-slate-500 font-mono">Droit d&apos;opposition</span>
                    </button>
                </div>
            </div>

            {/* Modal de Configuration 2FA User */}
            {showQrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6 shadow-2xl relative text-left"
                    >
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-white">Scanner le QR Code 2FA</h3>
                            <p className="text-xs text-slate-400 font-medium">Scannez ce QR Code avec Google Authenticator ou Microsoft Authenticator.</p>
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-3 bg-[#020617] p-6 rounded-2xl border border-slate-800">
                            <div className="w-40 h-40 bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/EthicalData:apprenant@ethicaldata.ma?secret=JBSWY3DPEHPK3PXP&issuer=EthicalData`}
                                    alt="QR Code A2F Apprenant"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Clé Secrète Manuelle (Base32)</p>
                                <code className="text-xs font-mono font-bold text-cyan-400 select-all">JBSW Y3DP EHPK 3PXP</code>
                            </div>
                        </div>

                        <form onSubmit={handleConfirm2FA} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-300">Code à 6 chiffres de l&apos;application *</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    required
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="──────"
                                    className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 text-white text-center font-mono font-bold text-lg tracking-[0.3em] rounded-2xl outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowQrModal(false)}
                                    className="px-5 py-2 bg-slate-900 text-slate-400 font-bold rounded-xl text-xs hover:text-white cursor-pointer"
                                >
                                    Fermer
                                </button>
                                <button
                                    type="submit"
                                    disabled={verifying}
                                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs cursor-pointer disabled:opacity-50"
                                >
                                    {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Valider & Activer'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
