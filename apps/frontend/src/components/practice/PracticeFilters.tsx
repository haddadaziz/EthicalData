import { ChevronDown, Award } from '@/components/icons';
import { getProviderLogo } from '@/lib/certification-utils';
import React from 'react';

interface PracticeFiltersProps {
  selectedProvider: string;
  onProviderChange: (id: string) => void;
  selectedCertId: string;
  onCertChange: (id: string) => void;
  fournisseurs: any[];
  certifications: any[];
  providerDropdownOpen: boolean;
  setProviderDropdownOpen: (v: boolean) => void;
  certDropdownOpen: boolean;
  setCertDropdownOpen: (v: boolean) => void;
}

export default function PracticeFilters({
  selectedProvider,
  onProviderChange,
  selectedCertId,
  onCertChange,
  fournisseurs,
  certifications,
  providerDropdownOpen,
  setProviderDropdownOpen,
  certDropdownOpen,
  setCertDropdownOpen,
}: PracticeFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-4">
      <div className="space-y-2.5 text-left">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Par Partenaire / Fournisseur</span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setProviderDropdownOpen(!providerDropdownOpen)}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200/80 focus:border-blue-600 rounded-xl text-slate-955 text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all min-w-[200px]"
          >
            {selectedProvider !== 'TOUS' && getProviderLogo(fournisseurs.find((f: any) => f.id === selectedProvider)?.slug || '') && (
              <img src={getProviderLogo(fournisseurs.find((f: any) => f.id === selectedProvider)?.slug || '')} alt="" className="w-5 h-5 object-contain rounded shrink-0" />
            )}
            <span className="flex-1 text-left truncate">
              {selectedProvider === 'TOUS' ? 'Tous les constructeurs' : fournisseurs.find((f: any) => f.id === selectedProvider)?.nom || 'Sélectionner'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${providerDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {providerDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProviderDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-1.5 z-50 w-72 bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden">
                <button
                  onClick={() => { onProviderChange('TOUS'); setProviderDropdownOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                    selectedProvider === 'TOUS' ? 'bg-slate-100 text-slate-955' : 'text-slate-600'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-slate-500" />
                  </div>
                  <span className="truncate">Tous les constructeurs</span>
                </button>
                <div className="border-t border-slate-100" />
                <div className="max-h-64 overflow-y-auto">
                  {fournisseurs.map((f: any) => {
                    const logo = getProviderLogo(f.slug || f.nom || '');
                    return (
                      <button
                        key={f.id}
                        onClick={() => { onProviderChange(f.id); setProviderDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left transition-colors hover:bg-slate-50 cursor-pointer ${
                          selectedProvider === f.id ? 'bg-slate-100 text-slate-955' : 'text-slate-600'
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
      </div>
    </div>
  );
}
