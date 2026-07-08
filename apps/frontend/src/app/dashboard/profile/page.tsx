"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { User, ShieldCheck, KeyRound, Bell, CheckCircle, Save, RefreshCw, Sparkles, MessageSquare, Heart, Camera, Phone, Mail, FileText, Lock, Eye, EyeOff, Upload, Award, ChevronRight } from 'lucide-react';
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
    obtainedCertifications?: any[];
}

const getCertificateBadgeLogo = (cert: any) => {
    if (cert.image && (cert.image.endsWith('.svg') || cert.image.endsWith('.png'))) return cert.image;
    const code = (cert.codeExamen || cert.code || '').toLowerCase();
    const nom = (cert.nom || cert.title || '').toLowerCase();

    if (code.includes('az-900') || nom.includes('az-900') || nom.includes('azure fundamentals')) return '/badges/az-900.svg';
    if (code.includes('clf') || nom.includes('cloud practitioner')) return '/badges/aws-clf.svg';
    if (code.includes('saa') || nom.includes('solutions architect')) return '/badges/aws-saa.svg';
    if (code.includes('iso-27001') || nom.includes('iso 27001') || nom.includes('pecb')) return '/badges/pecb-iso.svg';
    if (code.includes('sy0') || nom.includes('security+')) return '/badges/comptia-sec.svg';
    if (code.includes('sc-900') || nom.includes('sc-900')) return '/badges/sc-900.svg';

    return cert.image || cert.logoUrl || '/badges/az-900.svg';
};

export default function ProfilePage() {
    const { showToast } = useToast();
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [certs, setCerts] = useState<any[]>([]);
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

    // Préférences de notification et visibilité
    const [notifReplies, setNotifReplies] = useState(true);
    const [notifLikes, setNotifLikes] = useState(true);
    const [notifSystem, setNotifSystem] = useState(true);
    const [showTargetedCerts, setShowTargetedCerts] = useState(true);
    const [showObtainedCerts, setShowObtainedCerts] = useState(true);
    const [prefLoading, setPrefLoading] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const [profileData, certsData] = await Promise.all([
                apiFetch('/users/me/profile'),
                apiFetch('/certifications').catch(() => []),
            ]);
            
            setProfile(profileData);
            console.log('Profile roles fetched:', profileData?.roles);
            setPrenom(profileData.prenom || '');
            setNom(profileData.nom || '');
            setTelephone(profileData.telephone || '');
            setAvatar(profileData.avatar || '');
            setBio(profileData.bio || '');

            const listCerts = Array.isArray(certsData) ? certsData : (certsData?.data || []);
            setCerts(listCerts);

            if (profileData.preferences) {
                setNotifReplies(profileData.preferences.notifReplies !== false);
                setNotifLikes(profileData.preferences.notifLikes !== false);
                setNotifSystem(profileData.preferences.notifSystem !== false);
                setShowTargetedCerts(profileData.preferences.showTargetedCerts !== false);
                setShowObtainedCerts(profileData.preferences.showObtainedCerts !== false);
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
                showTargetedCerts,
                showObtainedCerts,
                targetCertifications: profile?.preferences?.targetCertifications || [],
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

    const handleBecomeTrainer = async () => {
        try {
            const result = await apiFetch('/users/become-trainer', {
                method: 'POST',
            });

            // Remplacer silencieusement l'ancien token par le nouveau (sans déco/reco)
            if (result.accessToken) {
                if (localStorage.getItem('token')) {
                    localStorage.setItem('token', result.accessToken);
                } else {
                    sessionStorage.setItem('token', result.accessToken);
                }
            }

            // Passer en mode formateur immédiatement
            localStorage.setItem('viewMode', 'FORMATEUR');

            showToast("Félicitations ! Vous êtes maintenant formateur. Votre accès est activé.", "success");

            // Rafraîchir uniquement le profil affiché (pas toute la page)
            fetchProfile();
        } catch (err: any) {
            showToast(err.message || "Erreur lors du passage au rôle de formateur.", "error");
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

    const getUserRoleLabel = (roles?: { nom: string }[]) => {
        if (!roles || roles.length === 0) return 'Apprenant';
        const name = roles[0].nom;
        if (name === 'SUPER_ADMIN' || name === 'ADMIN') return 'Administrateur';
        if (name === 'FORMATEUR') return 'Formateur';
        return 'Apprenant';
    };

    const targetCertIds = (profile?.preferences?.targetCertifications || []).map((id: any) => id.toString());
    const targetedCerts = certs.filter(c => targetCertIds.includes(c.id.toString()));

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <div className="space-y-8 max-w-6xl mx-auto text-left">
            {/* CARTE D'EN-TÊTE DU PROFIL - Bannière Premium */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 flex-1">
                    {/* AVATAR INTERACTIF */}
                    <div className="relative group cursor-pointer shrink-0">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={`${prenom} ${nom}`}
                                className="w-24 h-24 rounded-3xl object-cover border-2 border-white/20 shadow-xl group-hover:opacity-90 transition-all ring-4 ring-indigo-500/10"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-white/20 flex items-center justify-center text-white font-black text-3xl shadow-xl ring-4 ring-indigo-500/10">
                                {prenom[0]}{nom[0]}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-slate-950/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    {/* INFOS NOM ET STATUT */}
                    <div className="space-y-2 text-center md:text-left flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white truncate">
                                {profile.prenom} {profile.nom}
                            </h1>
                            <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                                {getUserRoleLabel(profile.roles)}
                            </span>
                            {!profile.roles.some(r => r.nom === 'FORMATEUR' || r.nom === 'SUPER_ADMIN' || r.nom === 'ADMIN') && (
                                <button
                                    onClick={handleBecomeTrainer}
                                    className="px-3.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[9px] rounded-full uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-95"
                                >
                                    Devenir Formateur
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
                            <span className="flex items-center gap-1.5 text-indigo-400">
                                <Mail className="w-3.5 h-3.5" />
                                <span>{profile.email}</span>
                            </span>
                            <span className="hidden md:inline text-slate-700">•</span>
                            <span>Membre depuis {formatDate(profile.dateInscription)}</span>
                        </p>
                        {profile.bio && (
                            <p className="text-xs text-slate-355 font-medium italic max-w-xl line-clamp-2 pt-1 leading-relaxed">
                                "{profile.bio}"
                            </p>
                        )}
                    </div>
                </div>

                {/* STATISTIQUES INTEGRÉES DANS LA BANNIÈRE */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto relative z-10 shrink-0">
                    <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 text-center space-y-1 transition-all duration-350 group">
                        <div className="flex items-center justify-center text-indigo-400 gap-1.5 group-hover:scale-105 transition-transform">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xl font-black">{profile.stats.sujetsCount}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Discussions</span>
                    </div>

                    <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 text-center space-y-1 transition-all duration-350 group">
                        <div className="flex items-center justify-center text-blue-400 gap-1.5 group-hover:scale-105 transition-transform">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xl font-black">{profile.stats.commentairesCount}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Réponses</span>
                    </div>

                    <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 text-center space-y-1 transition-all duration-350 group">
                        <div className="flex items-center justify-center text-rose-450 gap-1.5 group-hover:scale-105 transition-transform">
                            <Heart className="w-4 h-4" />
                            <span className="text-xl font-black">{profile.stats.likesCount}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">J'aime</span>
                    </div>
                </div>
            </div>

            {/* GRILLE D'INTERFACE DE PROFIL (2 COLONNES) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLONNE DE GAUCHE : FORMULAIRES DE CONFIGURATION (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* ONGLETS DE NAVIGATION PROFIL */}
                    <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
                        <button
                            onClick={() => setActiveTab('INFO')}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'INFO'
                                ? 'bg-slate-950 text-white shadow-md'
                                : 'bg-white text-slate-650 hover:bg-slate-100 border border-slate-200/80'
                                }`}
                        >
                            <User className="w-4 h-4" />
                            <span>Informations</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('SECURITY')}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'SECURITY'
                                ? 'bg-slate-950 text-white shadow-md'
                                : 'bg-white text-slate-650 hover:bg-slate-100 border border-slate-200/80'
                                }`}
                        >
                            <KeyRound className="w-4 h-4" />
                            <span>Sécurité</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('PREFERENCES')}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'PREFERENCES'
                                ? 'bg-slate-950 text-white shadow-md'
                                : 'bg-white text-slate-650 hover:bg-slate-100 border border-slate-200/80'
                                }`}
                        >
                            <Bell className="w-4 h-4" />
                            <span>Notifications</span>
                        </button>
                    </div>

                    {/* CONTENU DES FORMULAIRES */}
                    <AnimatePresence mode="wait">
                        {/* ONGLET 1 : INFORMATIONS PERSONNELLES */}
                        {activeTab === 'INFO' && (
                            <motion.form
                                key="info"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                onSubmit={handleSaveInfo}
                                className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs"
                            >
                                <div className="border-b border-slate-100 pb-4">
                                    <h3 className="text-base font-black text-slate-900 tracking-tight">Informations Générales</h3>
                                    <p className="text-xs text-slate-500 font-medium">Configurez vos données publiques et vos informations de contact.</p>
                                </div>

                                {/* GESTION DE LA PHOTO DE PROFIL */}
                                <div className="space-y-3 p-4.5 bg-slate-50/60 border border-slate-250/30 rounded-2xl">
                                    <label className="text-xs font-bold text-slate-900 block">Photo de profil</label>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                        <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-3.5 bg-white border border-dashed border-slate-300 hover:border-indigo-600 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-650 transition-all shadow-2xs">
                                            <Upload className="w-4 h-4 text-indigo-600 shrink-0" />
                                            <span>Téléverser un fichier</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-750">Prénom *</label>
                                        <input
                                            type="text"
                                            required
                                            value={prenom}
                                            onChange={(e) => setPrenom(e.target.value)}
                                            className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-indigo-650 focus:ring-2 focus:ring-indigo-100 rounded-2xl text-slate-950 text-xs font-semibold outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-750">Nom *</label>
                                        <input
                                            type="text"
                                            required
                                            value={nom}
                                            onChange={(e) => setNom(e.target.value)}
                                            className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-indigo-650 focus:ring-2 focus:ring-indigo-100 rounded-2xl text-slate-950 text-xs font-semibold outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-750">Adresse e-mail (Non modifiable)</label>
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
                                        <label className="text-xs font-bold text-slate-750">Téléphone (Optionnel)</label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="tel"
                                                placeholder="+212 600 000 000"
                                                value={telephone}
                                                onChange={(e) => setTelephone(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-indigo-650 focus:ring-2 focus:ring-indigo-100 rounded-2xl text-slate-950 text-xs font-semibold outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-750">Bio & Objectifs professionnels</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Présentez votre parcours, vos certifications cibles ou vos compétences clés..."
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-indigo-650 focus:ring-2 focus:ring-indigo-100 rounded-2xl text-slate-950 text-xs font-semibold outline-none resize-none transition-all"
                                    />
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-100">
                                    <button
                                        type="submit"
                                        disabled={infoLoading}
                                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
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
                                className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs"
                            >
                                <div className="border-b border-slate-100 pb-4">
                                    <h3 className="text-base font-black text-slate-900 tracking-tight">Mot de Passe</h3>
                                    <p className="text-xs text-slate-500 font-medium">Modifiez votre mot de passe d'accès pour sécuriser votre compte.</p>
                                </div>

                                <div className="space-y-5 max-w-md">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-750">Ancien mot de passe *</label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                            <input
                                                type={showOldPassword ? "text" : "password"}
                                                required
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 focus:border-indigo-650 focus:ring-2 focus:ring-indigo-100 rounded-2xl text-slate-950 text-xs font-semibold outline-none transition-all"
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

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-750">Nouveau mot de passe *</label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                required
                                                minLength={6}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 focus:border-indigo-650 focus:ring-2 focus:ring-indigo-100 rounded-2xl text-slate-950 text-xs font-semibold outline-none transition-all"
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
                                                <span className="text-[10px] font-extrabold text-slate-500">{passwordStrength.label}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-750">Confirmer le nouveau mot de passe *</label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-indigo-650 focus:ring-2 focus:ring-indigo-100 rounded-2xl text-slate-950 text-xs font-semibold outline-none transition-all"
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
                                        <span>Modifier le mot de passe</span>
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
                                className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs"
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
                                        disabled={prefLoading}
                                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
                                    >
                                        {prefLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        <span>Enregistrer les préférences</span>
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* COLONNE DE DROITE : STATISTIQUES ET CERTIFICATIONS CIBLES (1/3) */}
                <div className="space-y-6">
                    {/* CERTIFICATIONS OBTENUES */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-650" />
                                <span>Certifications obtenues</span>
                            </h3>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold text-[9px] rounded-full">
                                {profile.obtainedCertifications?.length || 0}
                            </span>
                        </div>
                        
                        {(profile.obtainedCertifications && profile.obtainedCertifications.length > 0) ? (
                            <div className="space-y-3">
                                {profile.obtainedCertifications.map((cert: any) => {
                                    const logo = getCertificateBadgeLogo(cert);
                                    return (
                                        <div key={cert.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                            {logo.endsWith('.svg') || logo.endsWith('.png') ? (
                                                <img src={logo} alt={cert.nom} className="w-9 h-9 object-contain" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-black">
                                                    {(cert.codeExamen || 'CERT').slice(0, 3)}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-tight leading-none">
                                                    Score IA : {cert.bestScore}%
                                                </p>
                                                <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
                                                    {cert.nom}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-xs text-slate-400 font-bold italic">Aucune certification validée pour le moment.</p>
                            </div>
                        )}
                    </div>

                    {/* ENCARD CERTIFICATIONS VISÉES */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Award className="w-4 h-4 text-indigo-600" />
                                <span>Certifications visées</span>
                            </h3>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-[9px] rounded-full">
                                {targetedCerts.length}
                            </span>
                        </div>
                        
                        {targetedCerts.length > 0 ? (
                            <div className="space-y-3">
                                {targetedCerts.map((cert: any) => {
                                    const logo = getCertificateBadgeLogo(cert);
                                    return (
                                        <div key={cert.id} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50/20 border border-slate-100 hover:border-indigo-100 rounded-2xl transition-all group">
                                            {logo.endsWith('.svg') || logo.endsWith('.png') ? (
                                                <img src={logo} alt={cert.nom} className="w-9 h-9 object-contain" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-black">
                                                    {(cert.codeExamen || 'CERT').slice(0, 3)}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-tight leading-none">
                                                    {cert.codeExamen || 'Examen'}
                                                </p>
                                                <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-950 transition-colors mt-0.5">
                                                    {cert.nom}
                                                </p>
                                            </div>
                                            <a 
                                                href={`/dashboard/practice?cert=${cert.slug}`} 
                                                className="p-1.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl hover:bg-indigo-600 text-slate-400 hover:text-white transition-all shadow-2xs"
                                                title="S'entraîner"
                                            >
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6 space-y-3">
                                <p className="text-xs text-slate-400 font-bold">Aucune certification ciblée pour le moment.</p>
                                <a 
                                    href="/dashboard/certifications" 
                                    className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded-xl transition-all shadow-2xs"
                                >
                                    <span>Découvrir le catalogue</span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
