"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { Save, RefreshCw, Send, Bell, Users } from '@/components/icons';
import { motion } from 'framer-motion';
import { getAdmin2FAStatus, setAdmin2FAStatus, verifyTOTPCode, ADMIN_2FA_SECRET } from '@/lib/totp-utils';

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
        <div className="max-w-3xl mx-auto space-y-8 text-left bg-[#020617]">
            {(userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') && (
                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSendNotification}
                    className="bg-[#080d1a] border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-5 shadow-sm"
                >
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-blue-950/30 border border-blue-900/50 flex items-center justify-center text-cyan-400 shrink-0">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-white tracking-tight">Envoyer une notification</h3>
                            <p className="text-xs text-slate-400 font-medium">Créez et envoyez une notification à un groupe d'utilisateurs.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300">Titre *</label>
                            <input type="text" required value={notifTitre} onChange={(e) => setNotifTitre(e.target.value)}
                                placeholder="Ex: Maintenance plateforme"
                                className="w-full p-3 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-xl text-xs font-semibold text-white placeholder:text-slate-500 outline-none transition-colors" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300">Message *</label>
                            <textarea required rows={4} value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)}
                                placeholder="Écrivez le contenu de votre notification..."
                                className="w-full p-3 bg-[#020617] border border-slate-800 focus:border-blue-600 rounded-xl text-xs font-semibold text-white placeholder:text-slate-500 outline-none transition-colors resize-none" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300">Destinataires</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { val: 'APPRENANT', label: 'Apprenants', img: '/images/apprenant.png' },
                                    { val: 'FORMATEUR', label: 'Formateurs', img: '/images/formateur.png' },
                                    { val: 'TOUS', label: 'Tout le monde', icon: true },
                                ].map((opt: any) => (
                                    <button key={opt.val} type="button" onClick={() => setNotifTarget(opt.val as any)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                            notifTarget === opt.val
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                : 'bg-[#020617] text-slate-400 border-slate-800 hover:border-slate-700'
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
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50">
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
                className="bg-[#080d1a] border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
            >
                <div className="border-b border-slate-800 pb-4">
                    <h3 className="text-base font-black text-white tracking-tight">Préférences de notifications</h3>
                    <p className="text-xs text-slate-400 font-medium">Gérez vos préférences de messagerie et de notifications internes.</p>
                </div>

                <div className="space-y-4 max-w-xl">
                    <label className="flex items-center justify-between p-4 bg-[#020617] border border-slate-800/80 rounded-2xl cursor-pointer hover:bg-slate-900/50 transition-colors">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-white">Réponses au Forum</h4>
                            <p className="text-[11px] text-slate-400 font-medium">Recevoir une alerte quand quelqu'un répond à vos sujets ou commentaires.</p>
                        </div>
                        <input type="checkbox" checked={notifReplies} onChange={(e) => setNotifReplies(e.target.checked)}
                            className="accent-blue-650 w-5 h-5 cursor-pointer" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-[#020617] border border-slate-800/80 rounded-2xl cursor-pointer hover:bg-slate-900/50 transition-colors">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-white">Mentions J'aime</h4>
                            <p className="text-[11px] text-slate-400 font-medium">Recevoir une notification quand un apprenant aime votre sujet.</p>
                        </div>
                        <input type="checkbox" checked={notifLikes} onChange={(e) => setNotifLikes(e.target.checked)}
                            className="accent-blue-650 w-5 h-5 cursor-pointer" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-[#020617] border border-slate-800/80 rounded-2xl cursor-pointer hover:bg-slate-900/50 transition-colors">
                        <div className="space-y-0.5 text-left">
                            <h4 className="text-xs font-black text-white">Alertes Plateforme & Système</h4>
                            <p className="text-[11px] text-slate-400 font-medium">Notifications de mise à jour, nouveaux contenus et rappels d'examens cibles.</p>
                        </div>
                        <input type="checkbox" checked={notifSystem} onChange={(e) => setNotifSystem(e.target.checked)}
                            className="accent-blue-650 w-5 h-5 cursor-pointer" />
                    </label>

                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button type="submit" disabled={saving}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50">
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Enregistrer les préférences</span>
                    </button>
                </div>
            </motion.form>

            {/* BLOC AUTHENTIFICATION À DEUX FACTEURS (2FA / A2F) */}
            <TwoFactorAuthSection />
        </div>
    );
}

function TwoFactorAuthSection() {
    const { showToast } = useToast();
    const [enabled2FA, setEnabled2FA] = useState(false);
    const [totpCode, setTotpCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);

    useEffect(() => {
        setEnabled2FA(getAdmin2FAStatus());
    }, []);

    const handleToggle2FA = () => {
        if (enabled2FA) {
            setAdmin2FAStatus(false);
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
            setAdmin2FAStatus(true);
            setEnabled2FA(true);
            setShowQrModal(false);
            setTotpCode('');
            showToast("Authentification à deux facteurs (2FA) activée et vérifiée avec succès !", "success");
        }, 500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#080d1a] border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-center text-purple-400 shrink-0">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                            Authentification à Deux Facteurs (2FA / A2F)
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">Sécurisez votre compte administrateur avec un deuxième niveau de vérification TOTP.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                        enabled2FA ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                        {enabled2FA ? 'A2F Actif & Protégé' : 'A2F Inactif'}
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

            <div className="p-4 bg-[#020617] border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                    <p className="font-bold text-white">Validation Google Authenticator / Authy / Email</p>
                    <p className="text-slate-400 font-medium">Un code temporaire à 6 chiffres vous sera demandé à chaque connexion administrative.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="px-4 py-2 bg-purple-950/60 hover:bg-purple-900 border border-purple-800/60 text-purple-300 font-bold rounded-xl text-xs transition-all cursor-pointer shrink-0"
                >
                    {enabled2FA ? 'Ré-afficher QR Code' : 'Configurer 2FA (TOTP)'}
                </button>
            </div>

            {/* Modal de Configuration 2FA */}
            {showQrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6 shadow-2xl relative text-left"
                    >
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-white">Scanner le QR Code A2F</h3>
                            <p className="text-xs text-slate-400 font-medium">Ouvrez Google Authenticator ou Authy et scannez ce QR Code.</p>
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-3 bg-[#020617] p-6 rounded-2xl border border-slate-800">
                            {/* QR Code Canvas Representation */}
                            <div className="w-40 h-40 bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/EthicalData:admin@ethicaldata.ma?secret=JBSWY3DPEHPK3PXP&issuer=EthicalData`}
                                    alt="QR Code A2F"
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
                                    placeholder="123456"
                                    className="w-full p-3.5 bg-[#020617] border border-slate-800 focus:border-cyan-500 text-white text-center font-mono font-bold text-lg tracking-[0.3em] rounded-2xl outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowQrModal(false)}
                                    className="px-4 py-2.5 bg-slate-900 text-slate-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition-all cursor-pointer"
                                >
                                    Fermer
                                </button>
                                <button
                                    type="submit"
                                    disabled={verifying}
                                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                                    <span>Activer A2F</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
