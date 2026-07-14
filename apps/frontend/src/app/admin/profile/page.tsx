"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { User, ShieldCheck, KeyRound, Save, RefreshCw, Camera, Phone, Mail, Lock, Eye, EyeOff, Upload, MessageCircle, Reply, Heart } from '@/components/icons';
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

export default function AdminProfilePage() {
    const { showToast } = useToast();
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'INFO' | 'SECURITY'>('INFO');

    const [prenom, setPrenom] = useState('');
    const [nom, setNom] = useState('');
    const [telephone, setTelephone] = useState('');
    const [avatar, setAvatar] = useState('');
    const [bio, setBio] = useState('');
    const [infoLoading, setInfoLoading] = useState(false);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const [profileData] = await Promise.all([
                apiFetch('/users/me/profile'),
            ]);

            setProfile(profileData);
            setPrenom(profileData.prenom || '');
            setNom(profileData.nom || '');
            setTelephone(profileData.telephone || '');
            setAvatar(profileData.avatar || '');
            setBio(profileData.bio || '');
        } catch (err: any) {
            console.error("Erreur chargement profil admin:", err);
            showToast(err.message || "Impossible de charger votre profil.", "error");
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
            showToast("Vos informations ont été mises à jour !", "success");
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la mise à jour.", "error");
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

            showToast("Mot de passe mis à jour avec succès !", "success");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la modification du mot de passe.", "error");
        } finally {
            setPasswordLoading(false);
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
        if (!pass) return { label: 'Non renseigné', color: 'bg-slate-200', level: 0 };
        if (pass.length < 6) return { label: 'Trop court', color: 'bg-rose-500', level: 1 };
        if (pass.length < 9) return { label: 'Moyen', color: 'bg-amber-500', level: 2 };
        return { label: 'Robuste', color: 'bg-emerald-500', level: 3 };
    };

    const getUserRoleLabel = (roles?: { nom: string }[]) => {
        if (!roles || roles.length === 0) return 'Apprenant';
        const name = roles[0].nom;
        if (name === 'SUPER_ADMIN') return 'Super Administrateur';
        if (name === 'ADMIN') return 'Administrateur';
        if (name === 'FORMATEUR') return 'Formateur';
        return 'Apprenant';
    };

    if (loading || !profile) {
        return (
            <div className="p-16 text-center bg-white border border-slate-200/60 rounded-3xl max-w-5xl mx-auto">
                <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement de votre profil...</p>
            </div>
        );
    }

    const passwordStrength = getPasswordStrength(newPassword);



    return (
        <div className="space-y-8 max-w-6xl mx-auto text-left">
            {/* ═══ BANNIÈRE PREMIUM ═══ */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border border-slate-800/50 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl"
            >
                {/* Décorations statiques optimisées */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
                    {/* Avatar avec anneau lumineux */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="relative group cursor-pointer shrink-0"
                    >
                        {/* Anneau lumineux statique */}
                        <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-sm" />
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={`${prenom} ${nom}`}
                                className="w-28 h-28 rounded-full object-cover border-3 border-white/20 shadow-2xl ring-4 ring-blue-500/30 relative z-10 group-hover:ring-blue-400/50 transition-all duration-300"
                            />
                        ) : (
                            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 border-3 border-white/20 flex items-center justify-center text-white font-black text-3xl shadow-2xl ring-4 ring-blue-500/30 relative z-10">
                                {prenom[0]}{nom[0]}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-slate-950/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 z-20">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                    </motion.div>

                    {/* Infos nom et statut */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-2.5 text-center lg:text-left flex-1 min-w-0"
                    >
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white truncate">
                                {profile.prenom} {profile.nom}
                            </h1>
                            <span className="px-3.5 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                                {getUserRoleLabel(profile.roles)}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1">
                            <span className="flex items-center gap-1.5 text-blue-400">
                                <Mail className="w-3.5 h-3.5" />
                                <span>{profile.email}</span>
                            </span>
                            <span className="hidden md:inline text-slate-700">•</span>
                            <span>Membre depuis {formatDate(profile.dateInscription)}</span>
                        </p>
                        {profile.bio && (
                            <p className="text-xs text-slate-400/80 font-medium italic max-w-xl line-clamp-2 pt-0.5 leading-relaxed">
                                {`"${profile.bio}"`}
                            </p>
                        )}
                    </motion.div>

                    {/* Stats glassmorphism */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.35 }}
                        className="grid grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto relative z-10 shrink-0"
                    >
                        {[
                            { icon: <MessageCircle className="w-4 h-4" />, value: profile.stats.sujetsCount, label: 'Discussions', color: 'text-blue-400' },
                            { icon: <Reply className="w-4 h-4" />, value: profile.stats.commentairesCount, label: 'Réponses', color: 'text-blue-300' },
                            { icon: <Heart className="w-4 h-4" />, value: profile.stats.likesCount, label: "J'aime", color: 'text-rose-400' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                                className="bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] rounded-2xl p-4 text-center space-y-1.5 transition-all duration-200 group hover:-translate-y-0.5"
                            >
                                <div className={`flex items-center justify-center ${stat.color} gap-1.5 group-hover:scale-110 transition-transform duration-300`}>
                                    {stat.icon}
                                    <span className="text-xl font-black">{stat.value}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{stat.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* ═══ FORMULAIRES ═══ */}
            <div className="space-y-6">
                {/* Onglets segmentés */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="bg-slate-100/80 p-1.5 rounded-2xl inline-flex items-center gap-1"
                >
                    <button
                        onClick={() => setActiveTab('INFO')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer ${activeTab === 'INFO'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        <span>Informations</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('SECURITY')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer ${activeTab === 'SECURITY'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                            }`}
                    >
                        <KeyRound className="w-4 h-4" />
                        <span>Sécurité</span>
                    </button>
                </motion.div>

                <AnimatePresence mode="wait">
                    {activeTab === 'INFO' && (
                        <motion.form
                            key="info"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            onSubmit={handleSaveInfo}
                            className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                <div className="w-1 h-8 bg-blue-600 rounded-full" />
                                <div>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight">Informations Générales</h3>
                                    <p className="text-xs text-slate-500 font-medium">Configurez vos données publiques et vos informations de contact.</p>
                                </div>
                            </div>

                            {/* Photo de profil */}
                            <div className="space-y-3 p-5 bg-slate-50/60 border border-slate-200/40 rounded-2xl">
                                <label className="text-xs font-bold text-slate-900 block">Photo de profil</label>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                    <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-4 bg-white border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 transition-all duration-300 shadow-sm group">
                                        <Upload className="w-4 h-4 text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
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
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Prénom *</label>
                                    <input
                                        type="text"
                                        required
                                        value={prenom}
                                        onChange={(e) => setPrenom(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50/80 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-slate-950 text-xs font-semibold outline-none transition-all duration-200"
                                    />
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Nom *</label>
                                    <input
                                        type="text"
                                        required
                                        value={nom}
                                        onChange={(e) => setNom(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50/80 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-slate-950 text-xs font-semibold outline-none transition-all duration-200"
                                    />
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Adresse e-mail (Non modifiable)</label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            disabled
                                            value={profile.email}
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs font-bold outline-none cursor-not-allowed"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Téléphone (Optionnel)</label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="tel"
                                            placeholder="+212 600 000 000"
                                            value={telephone}
                                            onChange={(e) => setTelephone(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-slate-950 text-xs font-semibold outline-none transition-all duration-200"
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Bio & Objectifs professionnels</label>
                                <textarea
                                    rows={4}
                                    placeholder="Présentez votre parcours, vos compétences ou vos missions..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50/80 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-slate-950 text-xs font-semibold outline-none resize-none transition-all duration-200"
                                />
                            </motion.div>

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={infoLoading}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {infoLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>Enregistrer les modifications</span>
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {activeTab === 'SECURITY' && (
                        <motion.form
                            key="security"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            onSubmit={handleChangePassword}
                            className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                <div className="w-1 h-8 bg-slate-900 rounded-full" />
                                <div>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight">Mot de Passe</h3>
                                    <p className="text-xs text-slate-500 font-medium">Modifiez votre mot de passe d'accès pour sécuriser votre compte.</p>
                                </div>
                            </div>

                            <div className="space-y-5 max-w-md">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Ancien mot de passe *</label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input
                                            type={showOldPassword ? "text" : "password"}
                                            required
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="w-full pl-11 pr-11 py-3.5 bg-slate-50/80 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-slate-950 text-xs font-semibold outline-none transition-all duration-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                        >
                                            {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Nouveau mot de passe *</label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            required
                                            minLength={6}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-11 pr-11 py-3.5 bg-slate-50/80 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-slate-950 text-xs font-semibold outline-none transition-all duration-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {newPassword && (
                                        <div className="flex items-center gap-2 pt-1.5">
                                            <div className="flex gap-1 flex-1">
                                                <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${passwordStrength.level >= 1 ? 'bg-rose-500' : 'bg-slate-200'}`} />
                                                <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${passwordStrength.level >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                                                <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${passwordStrength.level >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                            </div>
                                            <span className="text-[10px] font-extrabold text-slate-500 whitespace-nowrap">{passwordStrength.label}</span>
                                        </div>
                                    )}
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Confirmer le nouveau mot de passe *</label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-slate-950 text-xs font-semibold outline-none transition-all duration-200"
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={passwordLoading || !oldPassword || !newPassword}
                                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all duration-200 shadow-lg disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    <span>Modifier le mot de passe</span>
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
