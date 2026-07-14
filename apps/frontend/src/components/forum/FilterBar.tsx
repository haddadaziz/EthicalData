'use client';

import React from 'react';
import { Search, X, Plus, ChevronDown, Award } from '@/components/icons';
import { getProviderLogo, getCertificateBadgeLogo } from '@/lib/certification-utils';
import { THEMES, Fournisseur, Certification } from '@/lib/types';

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    selectedTheme: string;
    onThemeChange: (theme: string) => void;
    selectedProviderFilter: string;
    onProviderChange: (id: string) => void;
    selectedCert: string;
    onCertChange: (id: string) => void;
    fournisseurs: Fournisseur[];
    certifications: Certification[];
    providerFilterDropdownOpen: boolean;
    setProviderFilterDropdownOpen: (v: boolean) => void;
    certFilterDropdownOpen: boolean;
    setCertFilterDropdownOpen: (v: boolean) => void;
    onNewDiscussion: () => void;
}

export default function FilterBar({
    searchQuery,
    onSearchChange,
    selectedTheme,
    onThemeChange,
    selectedProviderFilter,
    onProviderChange,
    selectedCert,
    onCertChange,
    fournisseurs,
    certifications,
    providerFilterDropdownOpen,
    setProviderFilterDropdownOpen,
    certFilterDropdownOpen,
    setCertFilterDropdownOpen,
    onNewDiscussion,
}: FilterBarProps) {
    return (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 md:p-5 space-y-4 shadow-sm text-left">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <button
                    onClick={onNewDiscussion}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Nouvelle Discussion</span>
                </button>

                <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Rechercher un sujet, un mot-clé ou un auteur..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 focus:border-blue-600 rounded-2xl text-slate-950 text-xs font-semibold outline-none transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-950 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="relative w-full md:w-auto md:shrink-0">
                    <button
                        type="button"
                        onClick={() => setProviderFilterDropdownOpen(!providerFilterDropdownOpen)}
                        className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200/80 focus:border-blue-600 rounded-2xl text-slate-955 text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all md:min-w-[170px]"
                    >
                        {selectedProviderFilter && getProviderLogo(fournisseurs.find((f: Fournisseur) => f.id === selectedProviderFilter)?.slug || '') && (
                            <img src={getProviderLogo(fournisseurs.find((f: Fournisseur) => f.id === selectedProviderFilter)?.slug || '')} alt="" className="w-4 h-4 object-contain rounded shrink-0" />
                        )}
                        <span className="flex-1 text-left truncate">
                            {!selectedProviderFilter ? 'Tous les constructeurs' : fournisseurs.find((f: Fournisseur) => f.id === selectedProviderFilter)?.nom || 'Sélectionner'}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${providerFilterDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {providerFilterDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setProviderFilterDropdownOpen(false)} />
                            <div className="absolute left-0 md:left-auto md:right-0 mt-1.5 z-50 w-full md:w-64 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                                <button
                                    type="button"
                                    onClick={() => { onProviderChange(''); setProviderFilterDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                                        !selectedProviderFilter ? 'bg-slate-100 text-slate-955' : 'text-slate-600'
                                    }`}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                        <Award className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <span className="truncate">Tous les constructeurs</span>
                                </button>
                                <div className="border-t border-slate-100" />
                                <div className="max-h-48 overflow-y-auto">
                                    {fournisseurs.map((f: Fournisseur) => {
                                        const logo = getProviderLogo(f.slug || f.nom || '');
                                        return (
                                            <button
                                                key={f.id}
                                                type="button"
                                                onClick={() => { onProviderChange(f.id); setProviderFilterDropdownOpen(false); }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                                                    selectedProviderFilter === f.id ? 'bg-slate-100 text-slate-955' : 'text-slate-650'
                                                }`}
                                            >
                                                {logo ? (
                                                    <img src={logo} alt="" className="w-7 h-7 object-contain rounded shrink-0" />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                        <Award className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                )}
                                                <span className="block truncate font-bold text-left flex-1">{f.nom}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="relative w-full md:w-auto md:shrink-0">
                    <button
                        type="button"
                        disabled={!selectedProviderFilter}
                        onClick={() => setCertFilterDropdownOpen(!certFilterDropdownOpen)}
                        className={`w-full flex items-center gap-2 px-4 py-3 border focus:border-blue-600 rounded-2xl text-slate-955 text-xs font-bold outline-none transition-all md:min-w-[190px] text-left ${
                            !selectedProviderFilter 
                                ? 'bg-slate-100 border-slate-200/50 opacity-60 cursor-not-allowed' 
                                : 'bg-slate-50 border-slate-200 cursor-pointer hover:bg-slate-100'
                        }`}
                    >
                        {selectedProviderFilter && selectedCert && (
                            (() => {
                                const activeCertObj = certifications.find((c: Certification) => String(c.id) === String(selectedCert));
                                const logo = getCertificateBadgeLogo(activeCertObj);
                                return logo ? (
                                    <img src={logo} alt="" className="w-4.5 h-4.5 object-contain rounded shrink-0" />
                                ) : null;
                            })()
                        )}
                        <span className="flex-1 truncate">
                            {!selectedProviderFilter
                                ? "Sélectionnez un constructeur"
                                : !selectedCert
                                    ? "Toutes les certifications"
                                    : (() => {
                                        const activeCertObj = certifications.find((c: Certification) => String(c.id) === String(selectedCert));
                                        return activeCertObj ? `${activeCertObj.codeExamen ? `[${activeCertObj.codeExamen}] ` : ''}${activeCertObj.nom}` : "Sélectionner";
                                    })()
                            }
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${certFilterDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {certFilterDropdownOpen && selectedProviderFilter && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setCertFilterDropdownOpen(false)} />
                            <div className="absolute left-0 md:left-auto md:right-0 mt-1.5 z-50 w-full md:w-72 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                                <button
                                    type="button"
                                    onClick={() => { onCertChange(''); setCertFilterDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                                        !selectedCert ? 'bg-slate-100 text-slate-955' : 'text-slate-650'
                                    }`}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                        <Award className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <span className="truncate">Toutes les certifications</span>
                                </button>
                                <div className="border-t border-slate-100" />
                                <div className="max-h-48 overflow-y-auto">
                                    {certifications
                                        .filter(c => String(c.fournisseur?.id) === String(selectedProviderFilter) || String(c.fournisseurId) === String(selectedProviderFilter) || String(c.fournisseur?.slug) === String(selectedProviderFilter))
                                        .map((c: Certification) => {
                                            const logo = getCertificateBadgeLogo(c);
                                            return (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => { onCertChange(c.id); setCertFilterDropdownOpen(false); }}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                                                        String(selectedCert) === String(c.id) ? 'bg-slate-100 text-slate-955' : 'text-slate-600'
                                                    }`}
                                                >
                                                    {logo ? (
                                                        <img src={logo} alt="" className="w-7 h-7 object-contain rounded shrink-0" />
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                            <Award className="w-4 h-4 text-slate-500" />
                                                        </div>
                                                    )}
                                                    <span className="block truncate font-bold text-left flex-1">
                                                        {c.codeExamen ? `[${c.codeExamen}] ` : ''}{c.nom}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {THEMES.map((theme) => (
                    <button
                        key={theme}
                        onClick={() => onThemeChange(theme)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${selectedTheme === theme
                            ? 'bg-slate-950 text-white shadow-md'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                            }`}
                    >
                        {theme}
                    </button>
                ))}
            </div>
        </div>
    );
}
