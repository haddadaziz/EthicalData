"use client";

import React, { useEffect, useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { apiFetch } from '../lib/api';

import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ClientsSection } from '@/components/landing/ClientsSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { CertificationsSection } from '@/components/landing/CertificationsSection';
import { CoursesPreviewSection } from '@/components/landing/CoursesPreviewSection';
import { ServicesSection } from '@/components/landing/ServicesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { BlogPreviewSection } from '@/components/landing/BlogPreviewSection';
import { CommunityCoachingBanner } from '@/components/landing/CommunityCoachingBanner';
import { PartnersSection } from '@/components/landing/PartnersSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { ContactSection } from '@/components/landing/ContactSection';


const cleanTitle = (nom: string, code: string) => {
  if (!code || !nom) return nom;
  const safeCode = code.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`[\\s\\-:\\(]*${safeCode}[\\)]*`, 'gi');
  let cleaned = nom.replace(regex, '').trim();
  cleaned = cleaned.replace(/^[\-:\s]+/, '');
  cleaned = cleaned.replace(/[\-:\s]+$/, '');
  return cleaned;
};

const courses = [
  {
    title: "Microsoft Azure Fundamentals",
    code: "AZ-900",
    provider: "Microsoft",
    successRate: "98%",
    badge: "Offre",
    badgeClass: "bg-red-600 text-white",
    logo: "/logos/microsoft.png"
  },
  {
    title: "PECB ISO 27001 Lead Implementer",
    code: "ISO-27001",
    provider: "PECB",
    successRate: "95%",
    badge: "Hot",
    badgeClass: "bg-amber-500 text-slate-900",
    logo: "/logos/pecb.png"
  },
  {
    title: "AWS Certified Cloud Practitioner",
    code: "CLF-C02",
    provider: "AWS",
    successRate: "97%",
    badge: "Nouveau",
    badgeClass: "bg-blue-600 text-white",
    logo: "/logos/aws.png"
  },
  {
    title: "Palo Alto Networks Certified Network Security",
    code: "PCNSA",
    provider: "Palo Alto Networks",
    successRate: "96%",
    badge: "Plus Vendu",
    badgeClass: "bg-emerald-600 text-white",
    logo: "/logos/paloalto.png"
  }
];

export default function LandingPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [realCertifications, setRealCertifications] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    apiFetch('/users/me/profile').then((profile) => {
      setIsConnected(true);
      const roles = profile?.roles?.map((r: any) => r.nom) || [];
      if (roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')) {
        setIsAdmin(true);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    apiFetch('/certifications')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRealCertifications(data);
        }
      })
      .catch((err) => console.warn("Impossible de charger le catalogue public :", err));
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden font-sans selection:bg-cyan-600 selection:text-white">
      {/* Fine background grid lines - Fixed to viewport for performance */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(37,99,235,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

      <HeroSection isConnected={isConnected}>
        <Navbar />
      </HeroSection>

      <ClientsSection />
      <AboutSection />
      
      <CertificationsSection 
        realCertifications={realCertifications} 
        courses={courses} 
        cleanTitle={cleanTitle} 
      />
      
      <CoursesPreviewSection />
      
      <ServicesSection />
      <TestimonialsSection />
      <BlogPreviewSection />
      <CommunityCoachingBanner />
      <PartnersSection />
      <FaqSection />
      <ContactSection />

      <Footer />
    </main>
  );
}