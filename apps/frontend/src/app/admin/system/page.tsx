"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import {
  Save,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Link as LinkIcon,
  Globe,
  Lock,
  Mail,
  Phone,
  Users
} from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';

type TabId = 'general' | 'security' | 'ai' | 'integrations';

export default function SystemSettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<TabId, boolean>>({
    general: false,
    security: false,
    ai: false,
    integrations: false,
  });

  const [activeTab, setActiveTab] = useState<TabId>('general');

  // Form states
  const [general, setGeneral] = useState({
    siteName: 'Ethical Data Security',
    contactEmail: 'contact@ethicaldata.local',
    allowRegistrations: true,
    supportPhone: '+33 1 00 00 00 00',
  });

  const [security, setSecurity] = useState({
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireDigit: true,
    passwordRequireSpecialChar: true,
    downloadQuota: 10,
    antiSharingEnabled: true,
    bannedIps: [] as string[],
  });

  const [ai, setAi] = useState({
    activeModel: 'gemini-1.5-flash',
    apiKey: '',
    apiUrl: '',
    customPrompt: '',
    maxTokens: 2048,
  });

  const [integrations, setIntegrations] = useState({
    discordWebhookUrl: '',
    slackWebhookUrl: '',
    stripePublicKey: '',
    stripeSecretKey: '',
    ssoEnabled: false,
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
  });

  const [rawBannedIps, setRawBannedIps] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/settings/system');
      if (data) {
        if (data.general) setGeneral(data.general);
        if (data.security) {
          setSecurity(data.security);
          setRawBannedIps((data.security.bannedIps || []).join('\n'));
        }
        if (data.ai) setAi(data.ai);
        if (data.integrations) setIntegrations(data.integrations);
      }
    } catch (err: any) {
      showToast(err.message || 'Impossible de charger les paramètres système.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (tab: TabId, payload: any) => {
    setSaving((prev) => ({ ...prev, [tab]: true }));
    try {
      const updated = await apiFetch(`/settings/system/${tab}`, {
        method: 'PATCH',
        body: payload,
      });
      showToast('Paramètres enregistrés avec succès.', 'success');
      if (tab === 'general') setGeneral(updated);
      if (tab === 'security') {
        setSecurity(updated);
        setRawBannedIps((updated.bannedIps || []).join('\n'));
      }
      if (tab === 'ai') setAi(updated);
      if (tab === 'integrations') setIntegrations(updated);
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'enregistrement.", 'error');
    } finally {
      setSaving((prev) => ({ ...prev, [tab]: false }));
    }
  };

  const saveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave('general', general);
  };

  const saveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    const bannedIps = rawBannedIps
      .split('\n')
      .map((ip) => ip.trim())
      .filter((ip) => ip.length > 0);
    handleSave('security', { ...security, bannedIps });
  };

  const saveAi = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave('ai', ai);
  };

  const saveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave('integrations', integrations);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'general' as TabId, label: 'Général', icon: Globe },
    { id: 'security' as TabId, label: 'Sécurité', icon: ShieldCheck },
    { id: 'ai' as TabId, label: 'Configuration IA', icon: Sparkles },
    { id: 'integrations' as TabId, label: 'Intégrations', icon: LinkIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Barre d'onglets premium style capsule */}
      <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 overflow-x-auto gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-white text-blue-600 border-slate-200 shadow-sm'
                  : 'bg-transparent text-slate-500 border-transparent hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conteneur des formulaires animés */}
      <div className="relative min-h-[50vh]">
        <AnimatePresence mode="wait">
          {activeTab === 'general' && (
            <motion.form
              key="general"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              onSubmit={saveGeneral}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Paramètres Généraux</h3>
                  <p className="text-xs text-slate-500 font-semibold">Configurez l'identité visuelle et les accès publics de la plateforme.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nom du site *</label>
                  <input
                    type="text"
                    required
                    value={general.siteName}
                    onChange={(e) => setGeneral({ ...general, siteName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Adresse email de contact *</label>
                  <input
                    type="email"
                    required
                    value={general.contactEmail}
                    onChange={(e) => setGeneral({ ...general, contactEmail: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Téléphone de support</label>
                  <input
                    type="text"
                    value={general.supportPhone}
                    onChange={(e) => setGeneral({ ...general, supportPhone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="space-y-0.5 text-left">
                      <h4 className="text-xs font-bold text-slate-900">Autoriser les inscriptions publiques</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Permet aux nouveaux apprenants de créer leur compte.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={general.allowRegistrations}
                      onChange={(e) => setGeneral({ ...general, allowRegistrations: e.target.checked })}
                      className="accent-blue-600 w-5 h-5 cursor-pointer shrink-0"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving.general}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
                >
                  {saving.general ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Enregistrer les paramètres généraux</span>
                </button>
              </div>
            </motion.form>
          )}

          {activeTab === 'security' && (
            <motion.form
              key="security"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              onSubmit={saveSecurity}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Sécurité & Anti-Partage</h3>
                  <p className="text-xs text-slate-500 font-semibold">Définissez la politique de sécurité des accès et gérez le contrôle anti-partage.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Complexité des Mots de Passe</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Longueur minimale</label>
                      <input
                        type="number"
                        min={6}
                        max={30}
                        required
                        value={security.passwordMinLength}
                        onChange={(e) => setSecurity({ ...security, passwordMinLength: parseInt(e.target.value) || 8 })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-3 pt-3 md:pt-6">
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={security.passwordRequireUppercase}
                            onChange={(e) => setSecurity({ ...security, passwordRequireUppercase: e.target.checked })}
                            className="accent-blue-600 w-4 h-4 cursor-pointer"
                          />
                          <span>Exiger au moins une lettre majuscule</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={security.passwordRequireDigit}
                            onChange={(e) => setSecurity({ ...security, passwordRequireDigit: e.target.checked })}
                            className="accent-blue-600 w-4 h-4 cursor-pointer"
                          />
                          <span>Exiger au moins un chiffre</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={security.passwordRequireSpecialChar}
                            onChange={(e) => setSecurity({ ...security, passwordRequireSpecialChar: e.target.checked })}
                            className="accent-blue-600 w-4 h-4 cursor-pointer"
                          />
                          <span>Exiger au moins un caractère spécial</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Téléchargements & Session</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Quota de téléchargements par jour (par défaut)</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={security.downloadQuota}
                        onChange={(e) => setSecurity({ ...security, downloadQuota: parseInt(e.target.value) || 10 })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5 text-left">
                          <h4 className="text-xs font-bold text-slate-900">Règle anti-partage de compte</h4>
                          <p className="text-[10px] text-slate-500 font-medium">Empêche les connexions simultanées depuis des IPs différentes.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={security.antiSharingEnabled}
                          onChange={(e) => setSecurity({ ...security, antiSharingEnabled: e.target.checked })}
                          className="accent-blue-600 w-5 h-5 cursor-pointer shrink-0"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Liste noire d'adresses IP (une par ligne)</label>
                  <textarea
                    rows={4}
                    value={rawBannedIps}
                    onChange={(e) => setRawBannedIps(e.target.value)}
                    placeholder="Ex: 192.168.1.100"
                    className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all resize-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving.security}
                  className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
                >
                  {saving.security ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Enregistrer la sécurité</span>
                </button>
              </div>
            </motion.form>
          )}

          {activeTab === 'ai' && (
            <motion.form
              key="ai"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              onSubmit={saveAi}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-650 shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Configuration IA Universelle</h3>
                  <p className="text-xs text-slate-500 font-semibold">Gérez les modèles de langage (Gemini, OpenAI, etc.) et le prompt système pour la notation et l'assistant IA.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Modèle actif *</label>
                  <input
                    list="ai-models"
                    value={ai.activeModel}
                    onChange={(e) => setAi({ ...ai, activeModel: e.target.value })}
                    placeholder="ex: gpt-4o, gemini-1.5-flash, llama-3"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-bold outline-none transition-all"
                  />
                  <datalist id="ai-models">
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                    <option value="llama3-70b-8192">Llama 3 70B (Groq)</option>
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">URL de Base API (Optionnel)</label>
                  <input
                    type="url"
                    value={ai.apiUrl || ''}
                    onChange={(e) => setAi({ ...ai, apiUrl: e.target.value })}
                    placeholder="ex: https://api.openai.com/v1"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Laissez vide pour Google Gemini natif.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Clé d'API (OpenAI, Gemini, Groq...)</label>
                  <input
                    type="password"
                    value={ai.apiKey}
                    onChange={(e) => setAi({ ...ai, apiKey: e.target.value })}
                    placeholder="sk-... ou AIza..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Limite de jetons max (maxTokens)</label>
                  <input
                    type="number"
                    min={256}
                    max={16384}
                    value={ai.maxTokens}
                    onChange={(e) => setAi({ ...ai, maxTokens: parseInt(e.target.value) || 2048 })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Prompt système / Instructions d'évaluation</label>
                  <span className="text-[10px] text-slate-400 font-bold">Variables supportées : {"{{enonce}}"}, {"{{reponseCorrecte}}"}, {"{{grilleNotation}}"}, {"{{reponseCandidat}}"}</span>
                </div>
                <textarea
                  rows={8}
                  required
                  value={ai.customPrompt}
                  onChange={(e) => setAi({ ...ai, customPrompt: e.target.value })}
                  placeholder="Écrivez le prompt d'instructions système pour l'évaluation automatique..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all resize-none"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving.ai}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
                >
                  {saving.ai ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Enregistrer la config IA</span>
                </button>
              </div>
            </motion.form>
          )}

          {activeTab === 'integrations' && (
            <motion.form
              key="integrations"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              onSubmit={saveIntegrations}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <LinkIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Intégrations & Webhooks</h3>
                  <p className="text-xs text-slate-500 font-semibold">Configurez la liaison avec Stripe et les notifications sur vos salons de communication.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Salons de Communication (Logs & Alertes)</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Webhook Discord</label>
                      <input
                        type="url"
                        value={integrations.discordWebhookUrl}
                        onChange={(e) => setIntegrations({ ...integrations, discordWebhookUrl: e.target.value })}
                        placeholder="https://discord.com/api/webhooks/..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Webhook Slack</label>
                      <input
                        type="url"
                        value={integrations.slackWebhookUrl}
                        onChange={(e) => setIntegrations({ ...integrations, slackWebhookUrl: e.target.value })}
                        placeholder="https://hooks.slack.com/services/..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Passerelle de Paiement Stripe</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Clé Publique Stripe (Publishable Key)</label>
                      <input
                        type="text"
                        value={integrations.stripePublicKey}
                        onChange={(e) => setIntegrations({ ...integrations, stripePublicKey: e.target.value })}
                        placeholder="pk_test_..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Clé Secrète Stripe (Secret Key)</label>
                      <input
                        type="password"
                        value={integrations.stripeSecretKey}
                        onChange={(e) => setIntegrations({ ...integrations, stripeSecretKey: e.target.value })}
                        placeholder="sk_test_..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">Serveur SMTP (Emails transactionnels)</h4>
                  <p className="text-[10px] text-slate-500 font-medium mb-4">Configurez le serveur SMTP pour l'envoi d'emails (réinitialisation de mot de passe, notifications, etc.).</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Hôte SMTP</label>
                      <input
                        type="text"
                        value={integrations.smtpHost}
                        onChange={(e) => setIntegrations({ ...integrations, smtpHost: e.target.value })}
                        placeholder="smtp.gmail.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Port SMTP</label>
                      <input
                        type="number"
                        value={integrations.smtpPort}
                        onChange={(e) => setIntegrations({ ...integrations, smtpPort: parseInt(e.target.value) || 587 })}
                        placeholder="587"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Utilisateur SMTP</label>
                      <input
                        type="text"
                        value={integrations.smtpUser}
                        onChange={(e) => setIntegrations({ ...integrations, smtpUser: e.target.value })}
                        placeholder="noreply@ethicaldata.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Mot de passe SMTP</label>
                      <input
                        type="password"
                        value={integrations.smtpPass}
                        onChange={(e) => setIntegrations({ ...integrations, smtpPass: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email expéditeur</label>
                      <input
                        type="email"
                        value={integrations.smtpFrom}
                        onChange={(e) => setIntegrations({ ...integrations, smtpFrom: e.target.value })}
                        placeholder='"Ethical Data" <noreply@ethicaldata.com>'
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-none transition-all"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5 text-left">
                          <h4 className="text-xs font-bold text-slate-900">Connexion sécurisée (TLS)</h4>
                          <p className="text-[10px] text-slate-500 font-medium">Utiliser SSL/TLS pour la connexion SMTP.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={integrations.smtpSecure}
                          onChange={(e) => setIntegrations({ ...integrations, smtpSecure: e.target.checked })}
                          className="accent-blue-600 w-5 h-5 cursor-pointer shrink-0"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div className="flex items-center">
                  <label className="w-full flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="space-y-0.5 text-left">
                      <h4 className="text-xs font-bold text-slate-900">Activer l'Authentification Unique (SSO)</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Permet la connexion via Google/Microsoft Azure AD d'entreprise.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={integrations.ssoEnabled}
                      onChange={(e) => setIntegrations({ ...integrations, ssoEnabled: e.target.checked })}
                      className="accent-blue-600 w-5 h-5 cursor-pointer shrink-0"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving.integrations}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
                >
                  {saving.integrations ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Enregistrer les intégrations</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
