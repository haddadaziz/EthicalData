"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Users, UserCheck, ShieldAlert, Award, Search, Plus, RefreshCw, X, Eye, EyeOff, Edit, Trash2, SlidersHorizontal, User as UserIcon, Mail, Phone, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Role {
  id: string;
  nom: string;
}

interface Utilisateur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string | null;
  statut: 'ACTIF' | 'INACTIF' | 'BANNI';
  dateInscription: string;
  roles: Role[];
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // États pour les Filtres
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'TOUS' | 'APPRENANT' | 'FORMATEUR' | 'ADMIN' | 'SUPER_ADMIN'>('TOUS');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'TOUS' | 'ACTIF' | 'INACTIF' | 'BANNI'>('TOUS');

  // États pour le modal de création d'utilisateur
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Formulaire de création
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['APPRENANT']);

  // États pour le modal de modification d'utilisateur
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Utilisateur | null>(null);
  const [editPrenom, setEditPrenom] = useState('');
  const [editNom, setEditNom] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTelephone, setEditTelephone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editSelectedRoles, setEditSelectedRoles] = useState<string[]>([]);
  const [editStatut, setEditStatut] = useState<'ACTIF' | 'INACTIF' | 'BANNI'>('ACTIF');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/users');
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Impossible de récupérer la liste des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrage combiné (Texte + Rôle + Statut)
  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch = !search || (() => {
      const prenomVal = (user.prenom || '').toLowerCase();
      const nomVal = (user.nom || '').toLowerCase();
      const emailVal = (user.email || '').toLowerCase();
      const telephoneVal = (user.telephone || '').toLowerCase();
      return (
        prenomVal.includes(search) ||
        nomVal.includes(search) ||
        emailVal.includes(search) ||
        telephoneVal.includes(search) ||
        `${prenomVal} ${nomVal}`.includes(search)
      );
    })();

    const matchesRole = selectedRoleFilter === 'TOUS' || user.roles.some(r => r.nom === selectedRoleFilter);
    const matchesStatus = selectedStatusFilter === 'TOUS' || user.statut === selectedStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calcul des statistiques
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.statut === 'ACTIF').length;
  const adminUsers = users.filter(u =>
    u.roles.some(r => r.nom === 'SUPER_ADMIN' || r.nom === 'ADMIN')
  ).length;
  const trainerUsers = users.filter(u =>
    u.roles.some(r => r.nom === 'FORMATEUR')
  ).length;

  const toggleRoleSelection = (roleNom: string) => {
    if (selectedRoles.includes(roleNom)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter(r => r !== roleNom));
      }
    } else {
      setSelectedRoles([...selectedRoles, roleNom]);
    }
  };

  const toggleEditRoleSelection = (roleNom: string) => {
    if (editSelectedRoles.includes(roleNom)) {
      if (editSelectedRoles.length > 1) {
        setEditSelectedRoles(editSelectedRoles.filter(r => r !== roleNom));
      }
    } else {
      setEditSelectedRoles([...editSelectedRoles, roleNom]);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    try {
      await apiFetch('/users', {
        method: 'POST',
        body: {
          prenom,
          nom,
          email,
          telephone: telephone || undefined,
          motDePasse: password,
          roles: selectedRoles
        }
      });

      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || 'Une erreur est survenue lors de la création.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenEditModal = (user: Utilisateur) => {
    setEditingUser(user);
    setEditPrenom(user.prenom);
    setEditNom(user.nom);
    setEditEmail(user.email);
    setEditTelephone(user.telephone || '');
    setEditPassword('');
    setEditSelectedRoles(user.roles.map(r => r.nom));
    setEditStatut(user.statut);
    setModalError(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setModalLoading(true);
    setModalError(null);

    try {
      const body: any = {
        prenom: editPrenom,
        nom: editNom,
        email: editEmail,
        telephone: editTelephone || null,
        roles: editSelectedRoles,
        statut: editStatut
      };

      if (editPassword) {
        body.motDePasse = editPassword;
      }

      await apiFetch(`/users/${editingUser.id}`, {
        method: 'PATCH',
        body
      });

      setIsEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || 'Une erreur est survenue lors de la modification.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${name}" ?`)) {
      return;
    }

    try {
      await apiFetch(`/users/${id}`, {
        method: 'DELETE'
      });
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Une erreur est survenue lors de la suppression.");
    }
  };

  const resetForm = () => {
    setPrenom('');
    setNom('');
    setEmail('');
    setTelephone('');
    setPassword('');
    setSelectedRoles(['APPRENANT']);
    setModalError(null);
    setShowPassword(false);
  };

  const getRoleBadgeStyle = (roleNom: string) => {
    switch (roleNom) {
      case 'SUPER_ADMIN':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'FORMATEUR':
        return 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20';
      case 'APPRENANT':
      default:
        return 'bg-slate-950/40 border border-slate-800 text-slate-400';
    }
  };

  const getStatutBadgeStyle = (statut: string) => {
    switch (statut) {
      case 'ACTIF':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'INACTIF':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'BANNI':
        return 'bg-rose-500/10 text-rose-450 border border-rose-500/20';
      default:
        return 'bg-slate-900 text-slate-400 border border-slate-800';
    }
  };

  const hasActiveFilters = selectedRoleFilter !== 'TOUS' || selectedStatusFilter !== 'TOUS';

  const resetFilters = () => {
    setSelectedRoleFilter('TOUS');
    setSelectedStatusFilter('TOUS');
  };

  return (
    <div className="space-y-10 text-slate-100">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="text-left">
          <h1 className="text-3xl font-black text-white tracking-tight">Utilisateurs</h1>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Gérez les comptes et suivez l'activité de la plateforme.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-white/5 transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Nouvel Utilisateur</span>
          </button>
        </div>
      </div>

      {/* Cartes Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-900/20 border border-slate-900 rounded-2xl p-6 animate-pulse space-y-4" />
          ))
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/20 backdrop-blur-xl border border-slate-900 rounded-2xl p-6 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Utilisateurs</p>
                <p className="text-3xl font-black text-white mt-2">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                <Users className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/20 backdrop-blur-xl border border-slate-900 rounded-2xl p-6 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Comptes Actifs</p>
                <p className="text-3xl font-black text-white mt-2">{activeUsers}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                <UserCheck className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/20 backdrop-blur-xl border border-slate-900 rounded-2xl p-6 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Admins & Super</p>
                <p className="text-3xl font-black text-white mt-2">{adminUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/20 backdrop-blur-xl border border-slate-900 rounded-2xl p-6 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Formateurs</p>
                <p className="text-3xl font-black text-white mt-2">{trainerUsers}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                <Award className="w-6 h-6" />
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Conteneur principal du tableau */}
      <div className="bg-slate-900/10 backdrop-blur-xl border border-slate-900 rounded-3xl overflow-hidden">

        {/* Entête avec Recherche & Filtres */}
        <div className="p-6 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3 w-full max-w-xl">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Rechercher par nom ou adresse e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-900 focus:border-indigo-500 rounded-xl text-slate-200 placeholder-slate-600 transition-all text-sm outline-none"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${showFilters || hasActiveFilters
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                  : 'border-slate-900 hover:border-slate-800 text-slate-400 bg-slate-900/20'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtres</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-550 animate-pulse" />
              )}
            </button>
          </div>

          <div className="text-xs text-slate-450 font-bold flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-400 hover:text-rose-350 hover:underline cursor-pointer font-bold"
              >
                Réinitialiser
              </button>
            )}
            <span>
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Section extensible des Filtres */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-b border-slate-900 bg-slate-950/20"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rôle */}
                <div className="space-y-2.5 text-left">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Filtrer par Rôle</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { val: 'TOUS', label: 'Tous' },
                      { val: 'APPRENANT', label: 'Apprenant' },
                      { val: 'FORMATEUR', label: 'Formateur' },
                      { val: 'ADMIN', label: 'Admin' },
                      { val: 'SUPER_ADMIN', label: 'Super Admin' }
                    ].map((role) => (
                      <button
                        key={role.val}
                        onClick={() => setSelectedRoleFilter(role.val as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedRoleFilter === role.val
                            ? 'bg-white text-slate-950 shadow-md'
                            : 'bg-slate-950 border border-slate-900 hover:bg-slate-900 text-slate-400'
                          }`}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Statut */}
                <div className="space-y-2.5 text-left">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Filtrer par Statut</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { val: 'TOUS', label: 'Tous' },
                      { val: 'ACTIF', label: 'Actif' },
                      { val: 'INACTIF', label: 'Inactif' },
                      { val: 'BANNI', label: 'Banni' }
                    ].map((status) => (
                      <button
                        key={status.val}
                        onClick={() => setSelectedStatusFilter(status.val as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedStatusFilter === status.val
                            ? 'bg-white text-slate-950 shadow-md'
                            : 'bg-slate-950 border border-slate-900 hover:bg-slate-900 text-slate-400'
                          }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tableau / Cartes */}
        <div>
          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-900/10 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-rose-450 font-bold mb-2">Une erreur est survenue</p>
              <p className="text-xs text-slate-500 mb-6">{error}</p>
              <button
                onClick={fetchUsers}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-bold rounded-xl cursor-pointer transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              Aucun utilisateur ne correspond aux critères sélectionnés.
            </div>
          ) : (
            <>
              {/* Version Mobile : Cartes Dépolies */}
              <div className="block lg:hidden space-y-4 p-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-slate-900/10 border border-slate-900 rounded-2xl p-5 space-y-4 transition-all duration-300 hover:border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-black shrink-0 text-sm">
                        {user.prenom.charAt(0).toUpperCase()}{user.nom.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <span className="font-extrabold text-white text-base block truncate">
                          {user.prenom} {user.nom}
                        </span>
                        {user.telephone && (
                          <span className="text-xs text-slate-500 font-semibold mt-0.5 block">{user.telephone}</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">E-mail</span>
                        <span className="font-bold text-slate-300">{user.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Statut</span>
                        <span className={`inline-flex items-center gap-1.5 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatutBadgeStyle(user.statut)}`}>
                          <span className={`w-1 h-1 rounded-full ${user.statut === 'ACTIF' ? 'bg-emerald-400 animate-pulse' : user.statut === 'INACTIF' ? 'bg-amber-400' : 'bg-rose-450'}`} />
                          {user.statut}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-500 font-medium mt-0.5">Rôles</span>
                        <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                          {user.roles.length === 0 ? (
                            <span className="text-[9px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded-md font-semibold">Aucun</span>
                          ) : (
                            user.roles.map((role) => (
                              <span
                                key={role.id}
                                className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getRoleBadgeStyle(role.nom)}`}
                              >
                                {role.nom}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-900">
                      <span className="text-xs text-slate-500 font-semibold">
                        Inscrit le {new Date(user.dateInscription).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2.5 bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, `${user.prenom} ${user.nom}`)}
                          className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Version Desktop : Tableau Épuré */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <th className="py-5 px-6">Nom</th>
                      <th className="py-5 px-6">Adresse e-mail</th>
                      <th className="py-5 px-6">Rôles</th>
                      <th className="py-5 px-6">Statut</th>
                      <th className="py-5 px-6">Date d'inscription</th>
                      <th className="py-5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 text-slate-300 text-sm">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-900/20 transition-colors group"
                      >
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold">
                            {user.prenom.charAt(0).toUpperCase()}{user.nom.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                              {user.prenom} {user.nom}
                            </span>
                            {user.telephone && (
                              <span className="block text-xs text-slate-500 font-semibold mt-0.5">{user.telephone}</span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 font-bold text-slate-400">
                          {user.email}
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1.5">
                            {user.roles.length === 0 ? (
                              <span className="text-xs bg-slate-900 text-slate-550 px-2 py-0.5 rounded-md font-semibold">Aucun</span>
                            ) : (
                              user.roles.map((role) => (
                                <span
                                  key={role.id}
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getRoleBadgeStyle(role.nom)}`}
                                >
                                  {role.nom}
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getStatutBadgeStyle(user.statut)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.statut === 'ACTIF' ? 'bg-emerald-450 animate-pulse' : user.statut === 'INACTIF' ? 'bg-amber-400' : 'bg-rose-450'}`} />
                            {user.statut}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-slate-500 font-semibold">
                          {new Date(user.dateInscription).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(user)}
                              className="p-2 hover:bg-slate-950 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                              title="Modifier"
                            >
                              <Edit className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, `${user.prenom} ${user.nom}`)}
                              className="p-2 hover:bg-slate-950 text-slate-400 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL DE CRÉATION */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!modalLoading) { setIsModalOpen(false); resetForm(); } }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-950 border border-slate-900 w-full max-w-xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-900 flex items-center justify-between bg-slate-950/20">
                <h2 className="text-xl font-black text-white">Créer un nouvel utilisateur</h2>
                <button
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  disabled={modalLoading}
                  className="p-1.5 hover:bg-slate-900 text-slate-500 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 overflow-y-auto space-y-5 flex-1 text-left">
                {modalError && (
                  <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 text-rose-450 rounded-xl text-xs font-bold">
                    {modalError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Prénom</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                        <UserIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        placeholder="Jean"
                        className="w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-slate-900 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Nom</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                        <UserIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        placeholder="Dupont"
                        className="w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-slate-900 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Adresse e-mail</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jean.dupont@ethicaldata.local"
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-slate-900 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Téléphone <span className="text-[9px] text-slate-650 lowercase">(optionnel)</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-slate-900 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Mot de passe temporaire</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 bg-slate-900/40 border border-slate-900 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Attribuer des Rôles (Sélection multiple)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { nom: 'APPRENANT', label: 'Apprenant' },
                      { nom: 'FORMATEUR', label: 'Formateur' },
                      { nom: 'ADMIN', label: 'Admin' },
                      { nom: 'SUPER_ADMIN', label: 'Super Admin' }
                    ].map((role) => {
                      const isSelected = selectedRoles.includes(role.nom);
                      return (
                        <button
                          key={role.nom}
                          type="button"
                          onClick={() => toggleRoleSelection(role.nom)}
                          className={`p-3.5 border rounded-2xl text-center font-bold text-xs uppercase transition-all cursor-pointer ${isSelected
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-sm'
                              : 'border-slate-900 hover:border-slate-800 bg-transparent text-slate-400'
                            }`}
                        >
                          {role.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-900 flex justify-end gap-3 bg-slate-950 mt-6">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                    disabled={modalLoading}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-850 text-slate-450 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs uppercase tracking-wider"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md"
                  >
                    {modalLoading ? (
                      <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    ) : (
                      'Créer le compte'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE MODIFICATION */}
      <AnimatePresence>
        {isEditModalOpen && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!modalLoading) { setIsEditModalOpen(false); setEditingUser(null); } }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-950 border border-slate-900 w-full max-w-xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-900 flex items-center justify-between bg-slate-950/20">
                <h2 className="text-xl font-black text-white">Modifier l'utilisateur</h2>
                <button
                  onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }}
                  disabled={modalLoading}
                  className="p-1.5 hover:bg-slate-900 text-slate-500 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="p-6 overflow-y-auto space-y-5 flex-1 text-left">
                {modalError && (
                  <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 text-rose-455 rounded-xl text-xs font-bold">
                    {modalError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Prénom</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                        <UserIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={editPrenom}
                        onChange={(e) => setEditPrenom(e.target.value)}
                        placeholder="Jean"
                        className="w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-slate-900 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Nom</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                        <UserIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={editNom}
                        onChange={(e) => setEditNom(e.target.value)}
                        placeholder="Dupont"
                        className="w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-slate-900 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Adresse e-mail</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="jean.dupont@ethicaldata.local"
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-slate-900 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Téléphone <span className="text-[9px] text-slate-650 lowercase">(optionnel)</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={editTelephone}
                      onChange={(e) => setEditTelephone(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/40 border border-slate-900 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Statut du compte</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: 'ACTIF', label: 'Actif', style: 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm' },
                      { val: 'INACTIF', label: 'Inactif', style: 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-sm' },
                      { val: 'BANNI', label: 'Banni', style: 'border-rose-500 bg-rose-500/10 text-rose-450 shadow-sm' }
                    ].map((statusObj) => {
                      const isSelected = editStatut === statusObj.val;
                      return (
                        <button
                          key={statusObj.val}
                          type="button"
                          onClick={() => setEditStatut(statusObj.val as any)}
                          className={`p-3 border rounded-2xl text-center font-bold text-xs uppercase transition-all cursor-pointer ${isSelected
                              ? statusObj.style
                              : 'border-slate-900 hover:border-slate-800 bg-transparent text-slate-400'
                            }`}
                        >
                          {statusObj.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Mot de passe <span className="text-[9px] text-slate-650 lowercase">(laisser vide pour ne pas changer)</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 bg-slate-900/40 border border-slate-900 focus:border-indigo-500 rounded-xl text-white text-sm outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Rôles attribués (Sélection multiple)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { nom: 'APPRENANT', label: 'Apprenant' },
                      { nom: 'FORMATEUR', label: 'Formateur' },
                      { nom: 'ADMIN', label: 'Admin' },
                      { nom: 'SUPER_ADMIN', label: 'Super Admin' }
                    ].map((role) => {
                      const isSelected = editSelectedRoles.includes(role.nom);
                      return (
                        <button
                          key={role.nom}
                          type="button"
                          onClick={() => toggleEditRoleSelection(role.nom)}
                          className={`p-3.5 border rounded-2xl text-center font-bold text-xs uppercase transition-all cursor-pointer ${isSelected
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-sm'
                              : 'border-slate-900 hover:border-slate-800 bg-transparent text-slate-400'
                            }`}
                        >
                          {role.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-900 flex justify-end gap-3 bg-slate-950 mt-6">
                  <button
                    type="button"
                    onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }}
                    disabled={modalLoading}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-850 text-slate-450 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50 text-xs uppercase tracking-wider"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md"
                  >
                    {modalLoading ? (
                      <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    ) : (
                      'Sauvegarder'
                    )}
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