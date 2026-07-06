"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { User, ShieldCheck, KeyRound, Bell, CheckCircle, Save, RefreshCw, Sparkles, MessageSquare, Heart, Camera, Phone, Mail, FileText, Lock, Eye, EyeOff, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfileData {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone?: string | null;
    avatar?: string | null;
    bio?: string | null;
    dateInscription: string;
    preferences?: any;
    roles: { id: string; nom: string }[];
    stats: {
        sujetsCount: number;
        commentairesCount: number;
        likesCount: number;
    };
}

export default function ProfilePage() {
    const { showToast } = useToast();
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'INFO' | 'SECURITY' | 'PREFERENCES'>('INFO');

    // Formulaire d'informations personnelles
    const [prenom, setPrenom] = useState('');
    const [nom, setNom] = useState('');
    const [telephone, setTelephone] = useState('');
    const [avatar, setAvatar] = useState('');
    const [bio, setBio] = useState('');
    const [infoLoading, setInfoLoading] = useState(false);

    // Formulaire de mot de passe
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Préférences de notification
    const [notifReplies, setNotifReplies] = useState(true);
    const [notifLikes, setNotifLikes] = useState(true);
    const [notifSystem, setNotifSystem] = useState(true);
    const [prefLoading, setPrefLoading] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/users/me/profile');
            setProfile(data);
            setPrenom(data.prenom || '');
            setNom(data.nom || '');
            setTelephone(data.telephone || '');
            setAvatar(data.avatar || '');
            setBio(data.bio || '');

            if (data.preferences) {
                setNotifReplies(data.preferences.notifReplies !== false);
                setNotifLikes(data.preferences.notifLikes !== false);
                setNotifSystem(data.preferences.notifSystem !== false);
            }
        } catch (err: any) {
            console.error("Erreur chargement profil:", err);
            showToast(err.message || "Impossible de charger les informations du profil.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast("La taille de l'image ne doit pas dépasser 5 Mo.", "error");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
                showToast("Photo importée avec succès. N'oubliez pas d'enregistrer !", "info");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setInfoLoading(true);

        try {
            const updated = await apiFetch('/users/me/profile', {
                method: 'PATCH',
                body: {
                    prenom,
                    nom,
                    telephone,
                    avatar,
                    bio,
                },
            });

            setProfile(updated);
            showToast("Vos informations personnelles ont été mises à jour !", "success");
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la mise à jour des informations.", "error");
        } finally {
            setInfoLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast("Le nouveau mot de passe et sa confirmation ne correspondent pas.", "error");
            return;
        }

        setPasswordLoading(true);
        try {
            await apiFetch('/users/me/password', {
                method: 'PATCH',
                body: {
                    oldPassword,
                    newPassword,
                },
            });

            showToast("Votre mot de passe a été mis à jour avec succès !", "success");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la modification du mot de passe.", "error");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleSavePreferences = async (e: React.FormEvent) => {
        e.preventDefault();
        setPrefLoading(true);

        try {
            const newPrefs = {
                notifReplies,
                notifLikes,
                notifSystem,
            };

            const updated = await apiFetch('/users/me/profile', {
                method: 'PATCH',
                body: {
                    preferences: newPrefs,
                },
            });

            setProfile(updated);
            showToast("Vos préférences de notifications ont été sauvegardées.", "success");
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la sauvegarde des préférences.", "error");
        } finally {
            setPrefLoading(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric',
        });
    };

    const getPasswordStrength = (pass: string) => {
        if (!pass) return { label: 'Non renseigné', color: 'bg-slate-200' };
        if (pass.length < 6) return { label: 'Trop court', color: 'bg-rose-500' };
        if (pass.length < 9) return { label: 'Moyen', color: 'bg-amber-500' };
        return { label: 'Robuste', color: 'bg-emerald-500' };
    };

    if (loading || !profile) {
        return (
            <div className="p-16 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl max-w-5xl mx-auto">
                <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement de votre profil...</p>
            </div>
        );
    }

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <div className="space-y-8 max-w-6xl mx-auto text-left">
            {/* CARTE D'EN-TÊTE DU PROFIL */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    {/* AVATAR INTERACTIF */}
                    <div className="relative group cursor-pointer shrink-0">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={`${prenom} ${nom}`}
                                className="w-24 h-24 rounded-3xl object-cover border-2 border-white/20 shadow-xl group-hover:opacity-90 transition-all"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-white/20 flex items-center justify-center text-white font-black text-3xl shadow-xl">
                                {prenom[0]}{nom[0]}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-slate-950/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    {/* INFOS NOM ET STATUT */}
                    <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                                {profile.prenom} {profile.nom}
                            </h1>
                            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                                Apprenant
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{profile.email}</span>
                            <span className="text-slate-600">•</span>
                            <span>Membre depuis {formatDate(profile.dateInscription)}</span>
                        </p>
                        {profile.bio && (
                            <p className="text-xs text-slate-300 font-medium italic max-w-lg line-clamp-2 pt-1">
                                "{profile.bio}"
                            </p>
                        )}
                    </div>
                </div>

                {/* BADGES STATISTIQUES */}
                <div className="grid grid-cols-3 gap-3 w-full md:w-auto relative z-10">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-1">
                        <div className="flex items-center justify-center text-blue-400 gap-1">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-lg font-black">{profile.stats.sujetsCount}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Discussions</span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-1">
                        <div className="flex items-center justify-center text-blue-400 gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-lg font-black">{profile.stats.commentairesCount}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Réponses</span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-1">
                        <div className="flex items-center justify-center text-rose-400 gap-1">
                            <Heart className="w-4 h-4" />
                            <span className="text-lg font-black">{profile.stats.likesCount}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">J'aime</span>
                    </div>
                </div>
            </div>

            {/* ONGLETS DE NAVIGATION PROFIL */}
            <div className="flex items-center gap-3 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
                <button
                    onClick={() => setActiveTab('INFO')}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'INFO'
                        ? 'bg-slate-950 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                >
                    <User className="w-4 h-4" />
                    <span>Informations Personnelles</span>
                </button>

                <button
                    onClick={() => setActiveTab('SECURITY')}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'SECURITY'
                        ? 'bg-slate-950 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                >
                    <KeyRound className="w-4 h-4" />
                    <span>Sécurité & Mot de Passe</span>
                </button>

                <button
                    onClick={() => setActiveTab('PREFERENCES')}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'PREFERENCES'
                        ? 'bg-slate-950 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                >
                    <Bell className="w-4 h-4" />
                    <span>Préférences & Notifications</span>
                </button>
            </div>

            {/* CONTENU DE L'ONGLET SÉLECTIONNÉ */}
            <AnimatePresence mode="wait">
                {/* ONGLET 1 : INFORMATIONS PERSONNELLES */}
                {activeTab === 'INFO' && (
                    <motion.form
                        key="info"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleSaveInfo}
                        className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-base font-black text-slate-950">Informations du Compte</h3>
                                <p className="text-xs text-slate-500 font-medium">Mettez à jour vos identifiants et votre présentation publique.</p>
                            </div>
                        </div>

                        {/* GESTION DE LA PHOTO DE PROFIL : IMPORT LOCAL OU LIEN URL */}
                        <div className="space-y-3 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                            <label className="text-xs font-bold text-slate-900 block">Photo de Profil</label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 hover:border-blue-600 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 transition-all shadow-sm">
                                    <Upload className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>Importer une photo depuis votre appareil</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </label>
                                
                                <span className="text-[11px] text-slate-400 font-bold text-center shrink-0">ou</span>

                                <div className="flex-1 relative">
                                    <input
                                        type="url"
                                        placeholder="Lien/URL direct de la photo (https://...)"
                                        value={avatar}
                                        onChange={(e) => setAvatar(e.target.value)}
                                        className="w-full p-3 bg-white border border-slate-200 focus:border-blue-600 rounded-xl text-slate-950 text-xs font-semibold outline-none pr-8"
                                    />
                                    {avatar && (
                                        <button
                                            type="button"
                                            onClick={() => setAvatar('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600"
                                            title="Effacer la photo"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Prénom *</label>
                                <input
                                    type="text"
                                    required
                                    value={prenom}
                                    onChange={(e) => setPrenom(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Nom *</label>
                                <input
                                    type="text"
                                    required
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Adresse E-mail (Non modifiable)</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        disabled
                                        value={profile.email}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 text-xs font-bold outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Téléphone (Optionnel)</label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="tel"
                                        placeholder="+212 600 000 000"
                                        value={telephone}
                                        onChange={(e) => setTelephone(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Bio & Objectifs de Certification</label>
                            <textarea
                                rows={3}
                                placeholder="Présentez votre parcours, vos certifications cibles (ex: AZ-104, SC-900) ou vos domaines d'expertise..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none resize-none"
                            />
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={infoLoading}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                            >
                                {infoLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>Enregistrer les modifications</span>
                            </button>
                        </div>
                    </motion.form>
                )}

                {/* ONGLET 2 : SÉCURITÉ & MOT DE PASSE */}
                {activeTab === 'SECURITY' && (
                    <motion.form
                        key="security"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleChangePassword}
                        className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-base font-black text-slate-950">Sécurité du Compte</h3>
                                <p className="text-xs text-slate-500 font-medium">Modifiez votre mot de passe d'accès à la plateforme.</p>
                            </div>
                        </div>

                        <div className="space-y-5 max-w-md">
                            {/* ANCIEN MOT DE PASSE */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Ancien Mot de Passe *</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        required
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                    >
                                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* NOUVEAU MOT DE PASSE */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Nouveau Mot de Passe *</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        required
                                        minLength={6}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {newPassword && (
                                    <div className="flex items-center gap-2 pt-1">
                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${passwordStrength.color} transition-all`} style={{ width: newPassword.length < 6 ? '33%' : newPassword.length < 9 ? '66%' : '100%' }} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500">{passwordStrength.label}</span>
                                    </div>
                                )}
                            </div>

                            {/* CONFIRMATION */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Confirmer le Nouveau Mot de Passe *</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={passwordLoading || !oldPassword || !newPassword}
                                className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
                            >
                                {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                <span>Mettre à jour le mot de passe</span>
                            </button>
                        </div>
                    </motion.form>
                )}

                {/* ONGLET 3 : PRÉFÉRENCES & NOTIFICATIONS */}
                {activeTab === 'PREFERENCES' && (
                    <motion.form
                        key="preferences"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleSavePreferences}
                        className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-base font-black text-slate-950">Préférences de Notifications</h3>
                                <p className="text-xs text-slate-500 font-medium">Choisissez les événements pour lesquels vous souhaitez recevoir une notification.</p>
                            </div>
                        </div>

                        <div className="space-y-4 max-w-xl">
                            <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-black text-slate-950">Réponses au Forum</h4>
                                    <p className="text-[11px] text-slate-500 font-medium">Recevoir une alerte quand quelqu'un répond à vos publications ou commentaires.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notifReplies}
                                    onChange={(e) => setNotifReplies(e.target.checked)}
                                    className="accent-blue-600 w-5 h-5 cursor-pointer"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-black text-slate-950">Mention J'aime</h4>
                                    <p className="text-[11px] text-slate-500 font-medium">Recevoir une notification quand un apprenant aime votre sujet.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notifLikes}
                                    onChange={(e) => setNotifLikes(e.target.checked)}
                                    className="accent-blue-600 w-5 h-5 cursor-pointer"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-black text-slate-950">Alertes Plateforme & Système</h4>
                                    <p className="text-[11px] text-slate-500 font-medium">Notifications de mise à jour, nouveaux contenus de cours et rappels d'examen.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={notifSystem}
                                    onChange={(e) => setNotifSystem(e.target.checked)}
                                    className="accent-blue-600 w-5 h-5 cursor-pointer"
                                />
                            </label>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={prefLoading}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                            >
                                {prefLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>Enregistrer les préférences</span>
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
