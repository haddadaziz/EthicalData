"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { Users, Search, ShieldCheck, Plus, Edit, Trash2, X, RefreshCw, Mail, Phone, Calendar, Lock, Eye, EyeOff } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';

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
}

export default function AdminUsersPage() {
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Modale de Création d'utilisateur
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPrenom, setNewPrenom] = useState('');
    const [newNom, setNewNom] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('APPRENANT');
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
    const [updateLoading, setUpdateLoading] = useState(false);

    const [currentUserRoles, setCurrentUserRoles] = useState<string[]>([]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/users');
            const listUsers = Array.isArray(data) ? data : (data?.data || []);
            setUsers(listUsers);
        } catch (err: any) {
            console.error("Erreur chargement utilisateurs:", err);
            showToast(err.message || "Erreur lors du chargement des utilisateurs.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            try {
                const payloadBase64 = token.split('.')[1];
                const decodedPayload = JSON.parse(atob(payloadBase64));
                setCurrentUserRoles(decodedPayload.roles || []);
            } catch (e) {}
        }
        fetchUsers();
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
                },
            });

            showToast(`L'utilisateur ${newPrenom} ${newNom} a été créé avec succès !`, "success");
            setIsCreateModalOpen(false);
            setNewPrenom('');
            setNewNom('');
            setNewEmail('');
            setNewPhone('');
            setNewPassword('');
            fetchUsers();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la création de l'utilisateur.", "error");
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
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setUpdateLoading(true);
        try {
            const body: any = {
                roles: [editRole],
                statut: editStatut,
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

            showToast(`Le compte de ${selectedUser.prenom} ${selectedUser.nom} a été mis à jour.`, "success");
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
            message: `Êtes-vous sûr de vouloir supprimer/désactiver le compte de ${user.prenom} ${user.nom} ?`,
            confirmText: "Oui, désactiver",
            cancelText: "Annuler",
            type: "danger",
        });

        if (!isConfirmed) return;

        try {
            await apiFetch(`/users/${user.id}`, { method: 'DELETE' });
            showToast("Compte utilisateur désactivé.", "success");
            fetchUsers();
        } catch (err: any) {
            showToast(err.message || "Erreur lors de la suppression.", "error");
        }
    };

    const filteredUsers = React.useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());

            const hasRole =
                roleFilter === 'ALL' || (user.roles && user.roles.some((r) => r.nom === roleFilter));

            const matchesStatus = statusFilter === 'ALL' || user.statut === statusFilter;

            return matchesSearch && hasRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const UserGrid = React.useMemo(() => {
        if (filteredUsers.length === 0) {
            return (
                <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl text-slate-400 font-medium">
                    Aucun utilisateur ne correspond à votre recherche.
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredUsers.map((user) => {
                    const mainRole = user.roles && user.roles.length > 0 ? user.roles[0].nom : 'APPRENANT';

                    return (
                        <div
                            key={user.id}
                            className="bg-white border border-slate-200/90 hover:border-slate-350 hover:shadow-md rounded-3xl p-5 md:p-6 space-y-4 flex flex-col justify-between transition-all"
                        >
                            {/* En-tête de la Carte */}
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.prenom} className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                                        ) : (
                                            <div className="w-11 h-11 rounded-2xl bg-slate-950 text-white font-black text-sm flex items-center justify-center shadow-sm">
                                                {user.prenom[0]}{user.nom[0]}
                                            </div>
                                        )}
                                        <div className="space-y-0.5">
                                            <h3 className="text-sm font-black text-slate-950 leading-tight">
                                                {user.prenom} {user.nom}
                                            </h3>
                                            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[170px]">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Badges Rôle et Statut */}
                                <div className="flex items-center gap-2 pt-1">
                                    <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase tracking-wider ${mainRole === 'SUPER_ADMIN' || mainRole === 'ADMIN' ? 'bg-purple-100 text-purple-700' : mainRole === 'FORMATEUR' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                        {mainRole}
                                    </span>

                                    <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase tracking-wider ${user.statut === 'ACTIF' ? 'bg-emerald-100 text-emerald-700' : user.statut === 'BANNI' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {user.statut}
                                    </span>
                                </div>
                            </div>

                            {/* Infos Inscription & Téléphone */}
                            <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs font-medium text-slate-500">
                                <p className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Inscrit le {formatDate(user.dateInscription)}</span>
                                </p>
                                {user.telephone && (
                                    <p className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{user.telephone}</span>
                                    </p>
                                )}
                            </div>

                            {/* Actions sur le Compte */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    onClick={() => handleOpenEditModal(user)}
                                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <Edit className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Modifier</span>
                                </button>

                                <button
                                    onClick={() => handleDeleteUser(user)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                    title="Désactiver ce compte"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }, [filteredUsers]); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <div className="p-16 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl max-w-5xl mx-auto">
                <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Chargement des utilisateurs...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto text-left">

            {/* BARRE DE RECHERCHE, FILTRES ET BOUTON CRÉATION */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/20 cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter un utilisateur</span>
                    </button>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-950 text-xs font-bold outline-none cursor-pointer"
                    >
                        <option value="ALL">Tous les Rôles</option>
                        <option value="APPRENANT">Apprenants</option>
                        <option value="FORMATEUR">Formateurs</option>
                        <option value="ADMIN">Administrateurs</option>
                        <option value="SUPER_ADMIN">Super Admins</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-950 text-xs font-bold outline-none cursor-pointer"
                    >
                        <option value="ALL">Tous les Statuts</option>
                        <option value="ACTIF">Actifs</option>
                        <option value="INACTIF">Inactifs</option>
                        <option value="BANNI">Bannis</option>
                    </select>
                </div>
            </div>

            {/* GRILLE RESPONSIVE DE CARTES UTILISATEURS */}
            {UserGrid}

            {/* MODALE DE CRÉATION D'UTILISATEUR */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div
                        onClick={() => setIsCreateModalOpen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80"
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-left relative"
                        >
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-950 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-slate-950">Créer un nouvel utilisateur</h3>
                                <p className="text-xs text-slate-500 font-medium">Ajoutez un candidat, formateur ou administrateur.</p>
                            </div>

                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">Prénom *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newPrenom}
                                            onChange={(e) => setNewPrenom(e.target.value)}
                                            className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700">Nom *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newNom}
                                            onChange={(e) => setNewNom(e.target.value)}
                                            className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Adresse E-mail *</label>
                                    <input
                                        type="email"
                                        required
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Mot de Passe *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full p-3.5 pr-11 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Rôle *</label>
                                    <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none cursor-pointer"
                                    >
                                        <option value="APPRENANT">APPRENANT (Candidat)</option>
                                        <option value="FORMATEUR">FORMATEUR (Accompagnement)</option>
                                        <option value="ADMIN">ADMIN (Gestion contenu)</option>
                                        <option value="SUPER_ADMIN">SUPER ADMIN</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
                                    >
                                        {createLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        <span>Créer l'utilisateur</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODALE D'ÉDITION D'UTILISATEUR */}
            <AnimatePresence>
                {selectedUser && (
                    <div
                        onClick={() => setSelectedUser(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80"
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-left relative"
                        >
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-950 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-slate-950">Modifier le Compte</h3>
                                <p className="text-xs text-slate-500 font-medium">{selectedUser.prenom} {selectedUser.nom}</p>
                            </div>

                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                {currentUserRoles.includes('SUPER_ADMIN') && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-700">Prénom *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={editPrenom}
                                                    onChange={(e) => setEditPrenom(e.target.value)}
                                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-700">Nom *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={editNom}
                                                    onChange={(e) => setEditNom(e.target.value)}
                                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-700">Adresse E-mail *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={editEmail}
                                                    onChange={(e) => setEditEmail(e.target.value)}
                                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-700">Téléphone</label>
                                                <input
                                                    type="tel"
                                                    value={editPhone}
                                                    onChange={(e) => setEditPhone(e.target.value)}
                                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Attribuer un Rôle *</label>
                                    <select
                                        value={editRole}
                                        onChange={(e) => setEditRole(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none cursor-pointer"
                                    >
                                        <option value="APPRENANT">APPRENANT (Candidat)</option>
                                        <option value="FORMATEUR">FORMATEUR (Coach)</option>
                                        <option value="ADMIN">ADMIN (Gestionnaire)</option>
                                        <option value="SUPER_ADMIN">SUPER ADMIN</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Statut du Compte *</label>
                                    <select
                                        value={editStatut}
                                        onChange={(e) => setEditStatut(e.target.value as any)}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-red-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none cursor-pointer"
                                    >
                                        <option value="ACTIF">ACTIF (Accès autorisé)</option>
                                        <option value="INACTIF">INACTIF (Accès suspendu)</option>
                                        <option value="BANNI">BANNI (Accès verrouillé)</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUser(null)}
                                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
                                    >
                                        {updateLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                        <span>Enregistrer</span>
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