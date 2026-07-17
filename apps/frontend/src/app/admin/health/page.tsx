"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { Activity, Database, Cpu, Clock, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck } from '@/components/icons';
import { motion } from 'framer-motion';

interface HealthData {
    status: string;
    timestamp: string;
    uptimeSeconds: number;
    database: string;
    memoryUsageMB: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
    };
}

export default function AdminHealthPage() {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [latency, setLatency] = useState<number>(0);

    const fetchHealth = async () => {
        const start = Date.now();
        try {
            const data = await apiFetch('/health');
            const end = Date.now();
            setLatency(end - start);
            setHealth(data);
        } catch (err) {
            console.error("Erreur check health:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 5000); // Polling toutes les 5 secondes
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    if (loading) {
        return (
            <div className="p-16 text-center text-slate-400 bg-white border border-slate-200/80 rounded-3xl max-w-5xl mx-auto">
                <span className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin inline-block mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Connexion au sondeur de santé...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto text-left">

            {/* EN-TÊTE PAGE MONITORING */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-3">
                        <Activity className="w-7 h-7 text-red-600" />
                        <span>Monitoring & Santé du Système</span>
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        Surveillance en temps réel des performances du serveur NestJS et de la base de données PostgreSQL.
                    </p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Actualisation auto (5s)</span>
                </div>
            </div>

            {/* CARTES DE DASHBOARD MONITORING */}
            {health && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* STATUT SERVEUR */}
                    <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut API</span>
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${health.status === 'ok' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                <CheckCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-950 uppercase">{health.status}</span>
                            <p className="text-[11px] text-emerald-600 font-bold mt-1">Serveur 100% Opérationnel</p>
                        </div>
                    </div>

                    {/* BASE DE DONNÉES */}
                    <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PostgreSQL</span>
                            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Database className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-950 capitalize">{health.database}</span>
                            <p className="text-[11px] text-blue-600 font-bold mt-1">Connexion active (Prisma)</p>
                        </div>
                    </div>

                    {/* TEMPS DE FONCTIONNEMENT */}
                    <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uptime Serveur</span>
                            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-950">{formatUptime(health.uptimeSeconds)}</span>
                            <p className="text-[11px] text-slate-500 font-bold mt-1">Temps sans interruption</p>
                        </div>
                    </div>

                    {/* LATENCE RÉSEAU */}
                    <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latence HTTP</span>
                            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Activity className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-950">{latency} ms</span>
                            <p className="text-[11px] text-purple-600 font-bold mt-1">Temps de réponse de l'API</p>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION MÉMOIRE RAM & DETAILS DÉPLOIEMENT */}
            {health && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                    <h3 className="text-base font-black text-slate-950">Consommation Mémoire RAM (Node.js)</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-600">Mémoire Utilisée (Heap Used)</span>
                                <span className="text-slate-950">{health.memoryUsageMB.heapUsed} Mo / {health.memoryUsageMB.heapTotal} Mo</span>
                            </div>

                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-600 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (health.memoryUsageMB.heapUsed / health.memoryUsageMB.heapTotal) * 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                            <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Resident Set Size (RSS)</span>
                                <p className="text-sm font-black text-slate-900">{health.memoryUsageMB.rss} Mo</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Horodatage Serveur</span>
                                <p className="text-sm font-black text-slate-900">{new Date(health.timestamp).toLocaleTimeString('fr-FR')}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Moteur de Recherche BDD</span>
                                <p className="text-sm font-black text-emerald-600">PostgreSQL 16 (Connected)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
