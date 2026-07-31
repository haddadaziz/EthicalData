"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { Users, Search, ShieldCheck, Plus, Edit, Trash2, X, RefreshCw, Mail, Phone, Calendar, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Award, Briefcase, CheckCircle, Clock } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { addObtainedCertification } from '@/lib/certificate-storage';

interface Role {
    id: string;
    nom: string;
}

interface UserData {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone?: string | null;
    statut: 'ACTIF' | 'INACTIF' | 'BANNI';
    avatar?: string | null;
    dateInscription: string;
    roles: Role[];
    specialite?: string | null;
    tarifHoraireMad?: number | null;
    disponibilite?: 'DISPONIBLE' | 'EN_MISSION' | 'OCCUPE';
}

export default function AdminUsersPage() {
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'ALL' | 'APPRENANT' | 'FORMATEUR' | 'CONSULTANT_BOOKINGS'>('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Modale de Création d'utilisateur
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPrenom, setNewPrenom] = useState('');
    const [newNom, setNewNom] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('APPRENANT');
    const [newSpecialite, setNewSpecialite] = useState('');
    const [newTarif, setNewTarif] = useState<number>(800);
    const [newDisponibilite, setNewDisponibilite] = useState<'DISPONIBLE' | 'EN_MISSION'>('DISPONIBLE');
    const [createLoading, setCreateLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Modale d'Édition d'utilisateur
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [editRole, setEditRole] = useState<string>('APPRENANT');
    const [editStatut, setEditStatut] = useState<'ACTIF' | 'INACTIF' | 'BANNI'>('ACTIF');
    const [editPrenom, setEditPrenom] = useState('');
    const [editNom, setEditNom] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editSpecialite, setEditSpecialite] = useState('');
    const [editTarif, setEditTarif] = useState<number>(800);
    const [editDisponibilite, setEditDisponibilite] = useState<'DISPONIBLE' | 'EN_MISSION' | 'OCCUPE'>('DISPONIBLE');
    const [updateLoading, setUpdateLoading] = useState(false);

    // Modale Attribution de Certification (Admin)
    const [grantCertUser, setGrantCertUser] = useState<UserData | null>(null);
    const [grantCertName, setGrantCertName] = useState('Palo Alto Networks PCNSA Certified');
    const [grantCertCode, setGrantCertCode] = useState('PCNSA-2026');
    const [grantCertScore, setGrantCertScore] = useState<number>(90);

    const [currentUserRoles, setCurrentUserRoles] = useState<string[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(1);

    const handleGrantCertSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!grantCertUser) return;
        addObtainedCertification({
            nom: grantCertName,
            code: grantCertCode,
            score: Number(grantCertScore),
            studentName: `${grantCertUser.prenom} ${grantCertUser.nom}`
        });
        showToast(`Certification "${grantCertName}" attribuée avec succès à ${grantCertUser.prenom} ${grantCertUser.nom} !`, "success");
        setGrantCertUser(null);
    };

    const fetchUsers = async (excludeId?: string | null) => {
        const idToExclude = excludeId ?? currentUserId;
        setLoading(true);
        try {
            const data = await apiFetch('/users');
            const listUsers = Array.isArray(data) ? data : (data?.data || []);
            const filteredUsers = idToExclude
                ? listUsers.filter((u: any) => String(u.id) !== String(idToExclude))
                : listUsers;
            setUsers(filteredUsers);
        } catch (err: any) {
            console.error("Erreur chargement utilisateurs:", err);
            showToast(err.message || "Erreur lors du chargement des utilisateurs.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        apiFetch('/users/me/profile').then((profile) => {
            if (profile?.roles) {
                setCurrentUserRoles(profile.roles.map((r: any) => r.nom));
            }
            if (profile?.id) {
                setCurrentUserId(profile.id);
            }
            fetchUsers(profile?.id || null);
        }).catch(() => {
            fetchUsers();
        });
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);

        try {
            await apiFetch('/users', {
                method: 'POST',
                body: {
                    prenom: newPrenom,
                    nom: newNom,
                    email: newEmail,
                    telephone: newPhone || undefined,
                    motDePasse: newPassword,
                    roles: [newRole],
                    specialite: newSpecialite || undefined,
                    tarifHoraireMad: newTarif || undefined,
                    disponibilite: newDisponibilite,
                },
            });

            showToast(`Le compte ${newRole} de ${newPrenom} ${newNom} a été créé avec succès !`, "success");
            setIsCreateModalOpen(false);
            setNewPrenom('');
            setNewNom('');
            setNewEmail('');
            setNewPhone('');
            setNewPassword('');
            setNewSpecialite('');
            fetchUsers();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la création du compte.", "error");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleOpenEditModal = (user: UserData) => {
        setSelectedUser(user);
        const mainRole = user.roles && user.roles.length > 0 ? user.roles[0].nom : 'APPRENANT';
        setEditRole(mainRole);
        setEditStatut(user.statut);
        setEditPrenom(user.prenom);
        setEditNom(user.nom);
        setEditEmail(user.email);
        setEditPhone(user.telephone || '');
        setEditSpecialite(user.specialite || '');
        setEditTarif(user.tarifHoraireMad || 800);
        setEditDisponibilite(user.disponibilite || 'DISPONIBLE');
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setUpdateLoading(true);
        try {
            const body: any = {
                roles: [editRole],
                statut: editStatut,
                specialite: editSpecialite || undefined,
                tarifHoraireMad: editTarif || undefined,
                disponibilite: editDisponibilite,
            };
            if (currentUserRoles.includes('SUPER_ADMIN')) {
                body.prenom = editPrenom;
                body.nom = editNom;
                body.email = editEmail;
                body.telephone = editPhone || undefined;
            }

            await apiFetch(`/users/${selectedUser.id}`, {
                method: 'PATCH',
                body,
            });

            showToast(`Le profil de ${selectedUser.prenom} ${selectedUser.nom} a été mis à jour.`, "success");
            setSelectedUser(null);
            fetchUsers();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la mise à jour.", "error");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDeleteUser = async (user: UserData) => {
        const isConfirmed = await confirm({
            title: "Désactiver cet utilisateur ?",
            message: `Êtes-vous sûr de vouloir désactiver le profil de ${user.prenom} ${user.nom} ?`,
            confirmText: "Oui, désactiver",
            cancelText: "Annuler",
            type: "danger",
        });

        if (!isConfirmed) return;

        try {
            await apiFetch(`/users/${user.id}`, { method: 'DELETE' });
            showToast("Profil désactivé avec succès.", "success");
            fetchUsers();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la désactivation.", "error");
        }
    };

    const handleToggleStatus = async (user: UserData) => {
        const newStatus = user.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
        try {
            await apiFetch(`/users/${user.id}`, {
                method: 'PATCH',
                body: { statut: newStatus }
            });
            showToast(`Profil de ${user.prenom} ${user.nom} passé à ${newStatus === 'ACTIF' ? 'Actif' : 'Désactivé'}.`, "success");
            fetchUsers();
        } catch (err: any) {
            showToast(err.message || "Erreur lors du changement de statut.", "error");
        }
    };

    // Compteurs par rôle pour les onglets
    const counts = React.useMemo(() => {
        return {
            ALL: users.length,
            APPRENANT: users.filter(u => u.roles?.some(r => r.nom === 'APPRENANT')).length,
            FORMATEUR: users.filter(u => u.roles?.some(r => r.nom === 'FORMATEUR')).length,
            CONSULTANT_BOOKINGS: users.filter(u => u.roles?.some(r => r.nom === 'CONSULTANT_BOOKINGS' || r.nom === 'CONSULTANT')).length,
        };
    }, [users]);

    const filteredUsers = React.useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.specialite && user.specialite.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesTab =
                activeTab === 'ALL' ||
                (activeTab === 'CONSULTANT_BOOKINGS'
                    ? user.roles?.some((r) => r.nom === 'CONSULTANT_BOOKINGS' || r.nom === 'CONSULTANT')
                    : user.roles?.some((r) => r.nom === activeTab));

            const matchesStatus = statusFilter === 'ALL' || user.statut === statusFilter;

            return matchesSearch && matchesTab && matchesStatus;
        });
    }, [users, searchQuery, activeTab, statusFilter]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedUsers = React.useMemo(() => filteredUsers.slice(indexOfFirstItem, indexOfLastItem), [filteredUsers, indexOfFirstItem, indexOfLastItem]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeTab, statusFilter]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const UserGrid = React.useMemo(() => {
        if (paginatedUsers.length === 0) {
            return (
                <div className="p-12 text-center bg-[#080d1a] border border-slate-800 rounded-3xl text-slate-400 font-medium">
                    Aucun utilisateur trouvé dans cette catégorie.
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedUsers.map((user) => {
                    const mainRole = user.roles && user.roles.length > 0 ? user.roles[0].nom : 'APPRENANT';
                    const isConsultant = mainRole === 'CONSULTANT_BOOKINGS' || mainRole === 'CONSULTANT';
                    const isFormateur = mainRole === 'FORMATEUR';
                    const isApprenant = mainRole === 'APPRENANT';

                    return (
                        <div
                            key={user.id}
                            className={`bg-[#080d1a] border rounded-3xl p-5 md:p-6 space-y-4 flex flex-col justify-between transition-all hover:shadow-xl ${isConsultant ? 'border-cyan-900/60 hover:border-cyan-500' : isFormateur ? 'border-blue-900/60 hover:border-blue-500' : 'border-slate-800 hover:border-slate-700'}`}
                        >
                            {/* En-tête de la Carte */}
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.prenom} className="w-12 h-12 rounded-2xl object-cover border border-slate-800 shadow-sm" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center border border-slate-800 shadow-sm">
                                                {user.prenom[0]}{user.nom[0]}
                                            </div>
                                        )}
                                        <div className="space-y-0.5 min-w-0">
                                            <h3 className="text-sm font-black text-white leading-tight truncate">
                                                {user.prenom} {user.nom}
                                            </h3>
                                            <p className="text-[11px] text-slate-400 font-medium truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Badges Rôle et Statut */}
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase tracking-wider ${
                                        isConsultant ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60' :
                                        isFormateur ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60' :
                                        mainRole === 'SUPER_ADMIN' || mainRole === 'ADMIN' ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60' :
                                        'bg-slate-900 text-slate-300 border border-slate-800'
                                    }`}>
                                        {isConsultant ? '💼 Consultant Bookings' : isFormateur ? '👨‍🏫 Formateur' : isApprenant ? '🎓 Apprenant' : mainRole}
                                    </span>

                                    <button
                                        onClick={() => handleToggleStatus(user)}
                                        className={`px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                                            user.statut === 'ACTIF' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' :
                                            user.statut === 'BANNI' ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60' :
                                            'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                                        }`}
                                    >
                                        {user.statut === 'ACTIF' ? '● Actif' : '○ Inactif'}
                                    </button>
                                </div>
                            </div>

                            {/* Attributs Spécifiques (Consultant / Formateur) */}
                            {(isConsultant || isFormateur) && (
                                <div className="space-y-2 pt-3 border-t border-slate-800/80 bg-slate-950/40 p-3 rounded-2xl border border-slate-900 text-xs">
                                    <p className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                        <span>{user.specialite || (isConsultant ? 'Expert Audit & Conseil IT' : 'Formateur Expert IT')}</span>
                                    </p>
                                    {isConsultant && (
                                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 pt-1 border-t border-slate-800/40">
                                            <span className="text-emerald-400 font-bold">{user.tarifHoraireMad || 800} MAD / heure</span>
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${user.disponibilite === 'EN_MISSION' ? 'bg-amber-950/80 text-amber-300' : 'bg-emerald-950/80 text-emerald-300'}`}>
                                                {user.disponibilite === 'EN_MISSION' ? 'En mission' : 'Disponible'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Infos Inscription & Téléphone */}
                            <div className="space-y-1.5 pt-2 text-xs font-medium text-slate-400">
                                <p className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Inscrit le {formatDate(user.dateInscription)}</span>
                                </p>
                                {user.telephone && (
                                    <p className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                                        <span>{user.telephone}</span>
                                    </p>
                                )}
                            </div>

                            {/* Actions sur le Compte */}
                            <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                                {isApprenant && (
                                    <button
                                        onClick={() => {
                                            setGrantCertUser(user);
                                            setGrantCertName('Palo Alto Networks PCNSA Certified');
                                            setGrantCertCode('PCNSA-2026');
                                        }}
                                        className="py-2 px-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                                    >
                                        <Award className="w-3.5 h-3.5" />
                                        <span>Certif</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => handleOpenEditModal(user)}
                                    className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-600/20"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Éditer Profil</span>
                                </button>

                                <button
                                    onClick={() => handleDeleteUser(user)}
                                    className="p-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-400 font-bold rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer"
                                    title="Désactiver le compte"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }, [paginatedUsers]);  

    if (loading) {
        return (
            <div className="p-16 text-center text-slate-400 bg-[#080d1a] border border-slate-800 rounded-3xl max-w-5xl mx-auto">
                <span className="w-10 h-10 border-4 border-blue-800/50 border-t-cyan-400 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Chargement de l'annuaire utilisateurs...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto text-left p-4 sm:p-6">

            {/* SEPARATED TABS: APPRENANTS, FORMATEURS, CONSULTANTS BOOKINGS */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                        onClick={() => setActiveTab('ALL')}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'ALL'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-[#080d1a] border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        <span>⚡ Tous les Utilisateurs</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900/80 text-cyan-300 font-black">{counts.ALL}</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('APPRENANT')}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'APPRENANT'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-[#080d1a] border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        <span>🎓 Apprenants</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900/80 text-cyan-300 font-black">{counts.APPRENANT}</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('FORMATEUR')}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'FORMATEUR'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-[#080d1a] border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        <span>👨‍🏫 Formateurs</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900/80 text-cyan-300 font-black">{counts.FORMATEUR}</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('CONSULTANT_BOOKINGS')}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'CONSULTANT_BOOKINGS'
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20'
                                : 'bg-[#080d1a] border border-cyan-900/40 text-cyan-400 hover:text-white'
                        }`}
                    >
                        <span>💼 Consultants Bookings</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-950 text-cyan-300 font-black">{counts.CONSULTANT_BOOKINGS}</span>
                    </button>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-2xl text-xs font-bold cursor-pointer transition-all shadow-lg shadow-blue-600/20 active:scale-95 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter un Profil</span>
                </button>
            </div>

            {/* BARRE DE RECHERCHE ET FILTRES */}
            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, spécialité..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-[#020617] border border-slate-800 focus:border-blue-600 text-white placeholder:text-slate-500 rounded-2xl text-xs font-semibold outline-none"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-2.5 bg-[#020617] border border-slate-800 rounded-2xl text-white text-xs font-bold outline-none cursor-pointer w-full md:w-auto"
                    >
                        <option value="ALL">Tous les Statuts</option>
                        <option value="ACTIF">Profils Actifs</option>
                        <option value="INACTIF">Profils Inactifs</option>
                        <option value="BANNI">Comptes Bannis</option>
                    </select>
                </div>
            </div>

            {/* GRILLE RESPONSIVE DE CARTES UTILISATEURS */}
            {UserGrid}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-[#080d1a] border border-slate-800 rounded-2xl p-3 shadow-sm">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-[#080d1a]"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Précédent</span>
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, index) => {
                            const pageNum = index + 1;
                            const isActive = currentPage === pageNum;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${isActive ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md' : 'bg-transparent text-slate-400 hover:bg-slate-800/30'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 bg-[#080d1a]"
                    >
                        <span>Suivant</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* MODALE DE CRÉATION D'UTILISATEUR (AVEC ATTRIBUTS CONSULTANT BOOKINGS) */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div
                        onClick={() => setIsCreateModalOpen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="w-full max-w-lg bg-[#080d1a] border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-left relative my-8"
                        >
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-white rounded-2xl bg-slate-900 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-white">Ajouter un nouveau profil</h3>
                                <p className="text-xs text-slate-400 font-medium">Créer un profil d'Apprenant, Formateur ou Consultant Bookings.</p>
                            </div>

                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Rôle du Compte *</label>
                                    <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        className="w-full p-3 bg-[#020617] border border-cyan-900/60 text-cyan-300 font-bold rounded-2xl text-xs outline-none cursor-pointer"
                                    >
                                        <option value="APPRENANT">🎓 Apprenant</option>
                                        <option value="FORMATEUR">👨‍🏫 Formateur</option>
                                        <option value="CONSULTANT_BOOKINGS">💼 Consultant Bookings</option>
                                        <option value="ADMIN">⚡ Administrateur</option>
                                        <option value="SUPER_ADMIN">👑 Super Admin</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Prénom *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newPrenom}
                                            onChange={(e) => setNewPrenom(e.target.value)}
                                            className="w-full p-3 bg-[#020617] border border-slate-800 text-white rounded-2xl text-xs font-semibold outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Nom *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newNom}
                                            onChange={(e) => setNewNom(e.target.value)}
                                            className="w-full p-3 bg-[#020617] border border-slate-800 text-white rounded-2xl text-xs font-semibold outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Adresse E-mail *</label>
                                        <input
                                            type="email"
                                            required
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="w-full p-3 bg-[#020617] border border-slate-800 text-white rounded-2xl text-xs font-semibold outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Téléphone</label>
                                        <input
                                            type="tel"
                                            value={newPhone}
                                            onChange={(e) => setNewPhone(e.target.value)}
                                            className="w-full p-3 bg-[#020617] border border-slate-800 text-white rounded-2xl text-xs font-semibold outline-none"
                                        />
                                    </div>
                                </div>

                                {/* ATTRIBUTS SPÉCIFIQUES CONSULTANTS & FORMATEURS */}
                                {(newRole === 'CONSULTANT_BOOKINGS' || newRole === 'FORMATEUR') && (
                                    <div className="p-4 bg-slate-950/80 border border-cyan-900/60 rounded-2xl space-y-3 text-left">
                                        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Spécifications du profil Consultant / Formateur</h4>
                                        
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-300">Spécialité & Domaine d'Expertise</label>
                                            <input
                                                type="text"
                                                value={newSpecialite}
                                                onChange={(e) => setNewSpecialite(e.target.value)}
                                                placeholder="Ex: Architecte Cloud Azure & AWS, Lead Auditor ISO 27001..."
                                                className="w-full p-2.5 bg-[#020617] border border-slate-800 text-white rounded-xl text-xs outline-none"
                                            />
                                        </div>

                                        {newRole === 'CONSULTANT_BOOKINGS' && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-300">Tarif Horaire MAD</label>
                                                    <input
                                                        type="number"
                                                        value={newTarif}
                                                        onChange={(e) => setNewTarif(Number(e.target.value))}
                                                        className="w-full p-2.5 bg-[#020617] border border-slate-800 text-emerald-400 font-bold rounded-xl text-xs outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-300">Disponibilité</label>
                                                    <select
                                                        value={newDisponibilite}
                                                        onChange={(e) => setNewDisponibilite(e.target.value as any)}
                                                        className="w-full p-2.5 bg-[#020617] border border-slate-800 text-white rounded-xl text-xs outline-none"
                                                    >
                                                        <option value="DISPONIBLE">Disponible pour RDV</option>
                                                        <option value="EN_MISSION">En mission client</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Mot de Passe *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full p-3 pr-11 bg-[#020617] border border-slate-800 text-white rounded-2xl text-xs font-semibold outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-5 py-2.5 bg-slate-900 text-slate-400 font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-800"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                                    >
                                        {createLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        <span>Créer le profil</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODALE D'ÉDITION DE PROFIL */}
            <AnimatePresence>
                {selectedUser && (
                    <div
                        onClick={() => setSelectedUser(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="w-full max-w-md bg-[#080d1a] border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-left relative my-8"
                        >
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-white rounded-2xl bg-slate-900 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-white">Éditer le profil</h3>
                                <p className="text-xs text-slate-400 font-medium">{selectedUser.prenom} {selectedUser.nom}</p>
                            </div>

                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Rôle du Compte *</label>
                                    <select
                                        value={editRole}
                                        onChange={(e) => setEditRole(e.target.value)}
                                        className="w-full p-3 bg-[#020617] border border-cyan-900/60 text-cyan-300 font-bold rounded-2xl text-xs outline-none cursor-pointer"
                                    >
                                        <option value="APPRENANT">🎓 Apprenant</option>
                                        <option value="FORMATEUR">👨‍🏫 Formateur</option>
                                        <option value="CONSULTANT_BOOKINGS">💼 Consultant Bookings</option>
                                        <option value="ADMIN">⚡ Administrateur</option>
                                        <option value="SUPER_ADMIN">👑 Super Admin</option>
                                    </select>
                                </div>

                                {/* ATTRIBUTS CONSULTANT BOOKINGS / FORMATEUR */}
                                {(editRole === 'CONSULTANT_BOOKINGS' || editRole === 'FORMATEUR') && (
                                    <div className="p-3.5 bg-slate-950/80 border border-cyan-900/60 rounded-2xl space-y-2.5">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-300">Spécialité & Expertise</label>
                                            <input
                                                type="text"
                                                value={editSpecialite}
                                                onChange={(e) => setEditSpecialite(e.target.value)}
                                                className="w-full p-2.5 bg-[#020617] border border-slate-800 text-white rounded-xl text-xs outline-none"
                                            />
                                        </div>

                                        {editRole === 'CONSULTANT_BOOKINGS' && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-300">Tarif Horaire MAD</label>
                                                    <input
                                                        type="number"
                                                        value={editTarif}
                                                        onChange={(e) => setEditTarif(Number(e.target.value))}
                                                        className="w-full p-2.5 bg-[#020617] border border-slate-800 text-emerald-400 font-bold rounded-xl text-xs outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-slate-300">Disponibilité</label>
                                                    <select
                                                        value={editDisponibilite}
                                                        onChange={(e) => setEditDisponibilite(e.target.value as any)}
                                                        className="w-full p-2.5 bg-[#020617] border border-slate-800 text-white rounded-xl text-xs outline-none"
                                                    >
                                                        <option value="DISPONIBLE">Disponible</option>
                                                        <option value="EN_MISSION">En mission</option>
                                                        <option value="OCCUPE">Occupé</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Statut du Compte *</label>
                                    <select
                                        value={editStatut}
                                        onChange={(e) => setEditStatut(e.target.value as any)}
                                        className="w-full p-3 bg-[#020617] border border-slate-800 text-white rounded-2xl text-xs font-semibold outline-none cursor-pointer"
                                    >
                                        <option value="ACTIF">ACTIF (Accès autorisé)</option>
                                        <option value="INACTIF">INACTIF (Désactivé)</option>
                                        <option value="BANNI">BANNI (Bloqué)</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUser(null)}
                                        className="px-5 py-2.5 bg-slate-900 text-slate-400 font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-800"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                                    >
                                        {updateLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                        <span>Enregistrer les modifications</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODALE ATTRIBUTION DE CERTIFICATION (ADMIN) */}
            <AnimatePresence>
                {grantCertUser && (
                    <div
                        onClick={() => setGrantCertUser(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="w-full max-w-md bg-[#080d1a] border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-left relative"
                        >
                            <button
                                onClick={() => setGrantCertUser(null)}
                                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-white rounded-2xl bg-slate-900 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    <Award className="w-5 h-5 text-emerald-400" />
                                    <span>Attribuer une Certification</span>
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">Bénéficiaire : {grantCertUser.prenom} {grantCertUser.nom}</p>
                            </div>

                            <form onSubmit={handleGrantCertSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-300">Nom de la Certification *</label>
                                    <input
                                        type="text"
                                        required
                                        value={grantCertName}
                                        onChange={(e) => setGrantCertName(e.target.value)}
                                        className="w-full p-3 bg-[#020617] border border-slate-800 text-white rounded-2xl text-xs outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Code Examen</label>
                                        <input
                                            type="text"
                                            required
                                            value={grantCertCode}
                                            onChange={(e) => setGrantCertCode(e.target.value)}
                                            className="w-full p-3 bg-[#020617] border border-slate-800 text-white rounded-2xl text-xs outline-none"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-300">Score Obtenu (%)</label>
                                        <input
                                            type="number"
                                            required
                                            min={50}
                                            max={100}
                                            value={grantCertScore}
                                            onChange={(e) => setGrantCertScore(Number(e.target.value))}
                                            className="w-full p-3 bg-[#020617] border border-slate-800 text-emerald-400 font-bold rounded-2xl text-xs outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setGrantCertUser(null)}
                                        className="px-5 py-2.5 bg-slate-900 text-slate-400 font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-800"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Attribuer la certification</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
