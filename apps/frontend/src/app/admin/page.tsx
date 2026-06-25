"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Users, UserCheck, ShieldAlert, Award, Search, Plus, RefreshCw, X, Eye, EyeOff } from 'lucide-react';
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
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['APPRENANT']); // Tableau pour sélection multiple

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

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    const prenomVal = (user.prenom || '').toLowerCase();
    const nomVal = (user.nom || '').toLowerCase();
    const emailVal = (user.email || '').toLowerCase();
    const telephoneVal = (user.telephone || '').toLowerCase();
    
    const fullName1 = `${prenomVal} ${nomVal}`;
    const fullName2 = `${nomVal} ${prenomVal}`;

    return (
      fullName1.includes(search) || 
      fullName2.includes(search) || 
      emailVal.includes(search) ||
      telephoneVal.includes(search)
    );
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
      // Empêche de désélectionner s'il ne reste qu'un seul rôle
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter(r => r !== roleNom));
      }
    } else {
      setSelectedRoles([...selectedRoles, roleNom]);
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

      // Fermeture du modal et réinitialisation du formulaire
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
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20';
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
      case 'FORMATEUR':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'APPRENANT':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80';
    }
  };

  const getStatutBadgeStyle = (statut: string) => {
    switch (statut) {
      case 'ACTIF':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
      case 'INACTIF':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
      case 'BANNI':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tableau de bord</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez les comptes et suivez l'activité de la plateforme.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-2xl cursor-pointer disabled:opacity-50 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl cursor-pointer shadow-lg shadow-indigo-600/15 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvel Utilisateur</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 animate-pulse space-y-4" />
          ))
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex items-center justify-between transition-colors duration-300"
            >
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Utilisateurs</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Users className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex items-center justify-between transition-colors duration-300"
            >
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Comptes Actifs</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{activeUsers}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <UserCheck className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex items-center justify-between transition-colors duration-300"
            >
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Admins / Super</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{adminUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex items-center justify-between transition-colors duration-300"
            >
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Formateurs</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{trainerUsers}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Award className="w-6 h-6" />
              </div>
            </motion.div>
          </>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 rounded-[24px] overflow-hidden transition-colors duration-300">
        
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 dark:text-slate-500">
              <Search className="w-5 h-5" />
            </span>
            <input 
              type="text"
              placeholder="Rechercher par nom ou adresse e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm outline-none"
            />
          </div>
          
          <div className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/20 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-rose-500 dark:text-rose-400 font-semibold mb-2">Une erreur est survenue</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">{error}</p>
              <button 
                onClick={fetchUsers}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold rounded-xl cursor-pointer transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              Aucun utilisateur ne correspond à votre recherche.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-5 px-6">Nom</th>
                  <th className="py-5 px-6">Adresse e-mail</th>
                  <th className="py-5 px-6">Rôles</th>
                  <th className="py-5 px-6">Statut</th>
                  <th className="py-5 px-6">Date d'inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 text-sm">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold">
                        {user.prenom.charAt(0).toUpperCase()}{user.nom.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {user.prenom} {user.nom}
                        </span>
                        {user.telephone && (
                          <span className="block text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{user.telephone}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-400">
                      {user.email}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.length === 0 ? (
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded-md font-semibold">Aucun</span>
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
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getStatutBadgeStyle(user.statut)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.statut === 'ACTIF' ? 'bg-emerald-500' : user.statut === 'INACTIF' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        {user.statut}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(user.dateInscription).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

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
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-[28px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Créer un nouvel utilisateur</h2>
                <button
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  disabled={modalLoading}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 overflow-y-auto space-y-5 flex-1">
                {modalError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-semibold">
                    {modalError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Prénom</label>
                    <input
                      type="text"
                      required
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      placeholder="Jean"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Nom</label>
                    <input
                      type="text"
                      required
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Dupont"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Adresse e-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean.dupont@ethicaldata.local"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Téléphone <span className="text-[10px] text-slate-400/80 dark:text-slate-500 lowercase">(optionnel)</span></label>
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Mot de passe temporaire</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-900 dark:text-slate-200 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Attribution des Rôles (Multi-sélection) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Attribuer des Rôles (Sélection multiple)</label>
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
                          className={`p-4 border rounded-2xl text-center font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {role.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/10 dark:bg-slate-950/10 mt-6">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                    disabled={modalLoading}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-600/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {modalLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
    </div>
  );
}