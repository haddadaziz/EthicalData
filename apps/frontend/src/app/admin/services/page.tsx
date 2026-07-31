"use client";

import React, { useState } from 'react';
import { PlusCircle, Search, Edit, Trash2, Globe, Shield, Cpu, Server, Briefcase, CheckCircle } from '@/components/icons';
import { ServiceFormModal } from '@/components/admin/services/ServiceFormModal';
import { useToast } from '@/context/ToastContext';

interface ServiceItem {
  id: string;
  titre: string;
  titreAr: string;
  titreEn: string;
  description: string;
  descriptionAr: string;
  descriptionEn: string;
  categorie: string;
  statut: 'ACTIF' | 'INACTIF';
  icon: any;
}

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    titre: 'Infogérance & Supervision Cloud 24/7',
    titreAr: 'إدارة وتأمين البنية التحتية 24/7',
    titreEn: '24/7 Managed Cloud Services',
    description: 'Surveillance proactive, réponse aux incidents de sécurité et maintenance des serveurs Cloud hybrides.',
    descriptionAr: 'المراقبة الاستباقية والاستجابة للحوادث الأمنية وصيانة الخوادم السحابية.',
    descriptionEn: 'Proactive monitoring, security incident response, and hybrid cloud server maintenance.',
    categorie: 'INFOGERANCE',
    statut: 'ACTIF',
    icon: Server
  },
  {
    id: 'srv-2',
    titre: 'Intégration Systèmes & Réseaux Sécurisés',
    titreAr: 'تكامل الأنظمة والشبكات الآمنة',
    titreEn: 'Secure Network & Systems Integration',
    description: 'Déploiement de pare-feu Fortinet, Palo Alto, équipements réseau Cisco et architectures Zero Trust.',
    descriptionAr: 'نشر جدران الحماية وبنية الشبكات الآمنة من هندسة Zero Trust.',
    descriptionEn: 'Deployment of Fortinet, Palo Alto firewalls, Cisco network equipment, and Zero Trust architectures.',
    categorie: 'INTEGRATION',
    statut: 'ACTIF',
    icon: Shield
  },
  {
    id: 'srv-3',
    titre: 'Services Professionnels & Audit IT',
    titreAr: 'الخدمات المهنية وتدقيق تكنولوجيا المعلومات',
    titreEn: 'Professional Services & IT Audit',
    description: 'Audit ISO 27001, tests d intruion Pentest et accompagnement à la conformité CNDP/GDPR.',
    descriptionAr: 'تدقيق ISO 27001 واختبارات الاختراق والمرافقة للامتثال التنظيمي.',
    descriptionEn: 'ISO 27001 audit, Pentest penetration testing, and compliance support for CNDP/GDPR.',
    categorie: 'PROFESSIONNELS',
    statut: 'ACTIF',
    icon: Cpu
  },
  {
    id: 'srv-4',
    titre: 'Portage Salarial IT & Consultant Bookings',
    titreAr: 'المظلة الوظيفية وحجز المستشارين',
    titreEn: 'IT Umbrella Company & Consultant Bookings',
    description: 'Mise à disposition de consultants experts et portage salarial pour projets IT stratégiques.',
    descriptionAr: 'توفير مستشارين خبراء والمظلة الوظيفية للمشاريع الاستراتيجية.',
    descriptionEn: 'Provision of expert consultants and umbrella payroll services for strategic IT projects.',
    categorie: 'PORTAGE',
    statut: 'ACTIF',
    icon: Briefcase
  }
];

export default function AdminServicesPage() {
  const { showToast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const filteredServices = services.filter(s =>
    s.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.titreAr.includes(searchQuery) ||
    s.titreEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (service: ServiceItem) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const toggleStatut = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, statut: s.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF' } : s));
    showToast('Statut du service mis à jour en 1-click', 'success');
  };

  return (
    <div className="space-y-8 p-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Gestion des Services IT</h1>
            <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Édition Multilingue FR / AR / EN
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Éditez les fiches de services IT en 3 langues depuis une même interface</p>
        </div>

        <button
          onClick={handleCreate}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Créer un Service IT</span>
        </button>
      </div>

      {/* Barre de Recherche */}
      <div className="flex items-center gap-3 bg-[#080d1a] border border-slate-800 rounded-2xl px-4 py-2.5 max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un service (FR, AR, EN)..."
          className="bg-transparent text-white text-xs outline-none w-full placeholder:text-slate-500"
        />
      </div>

      {/* Grille des Services Multilingues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredServices.map((service) => {
          const IconComp = service.icon || Server;
          return (
            <div key={service.id} className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                      {service.categorie}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleStatut(service.id)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all cursor-pointer ${service.statut === 'ACTIF' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'}`}
                  >
                    {service.statut === 'ACTIF' ? 'Actif' : 'Inactif'}
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-1">
                    <span className="font-bold text-white">🇫🇷 FR: {service.titre}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-cyan-400 border-b border-slate-800/60 pb-1" dir="rtl">
                    <span className="font-bold">🇲🇦 AR: {service.titreAr}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-bold">🇬🇧 EN: {service.titreEn}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-medium pt-1 line-clamp-2">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  3 versions configurées
                </span>

                <button
                  onClick={() => handleEdit(service)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Éditer FR/AR/EN</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
        initialData={selectedService}
      />
    </div>
  );
}
