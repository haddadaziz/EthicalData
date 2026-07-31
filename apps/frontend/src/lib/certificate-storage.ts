"use client";

export interface GrantedCertificate {
  id: string;
  nom: string;
  code: string;
  score: number;
  date: string;
  studentName?: string;
}

const STORAGE_KEY = 'eds_obtained_certifications_v1';

export function getObtainedCertifications(): GrantedCertificate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultCerts: GrantedCertificate[] = [
        { id: "obt-1", nom: "Palo Alto Networks PCNSA Certified", code: "PCNSA-2026", score: 88, date: "25 Juil 2026" },
        { id: "obt-2", nom: "PECB ISO 27001 Lead Implementer", code: "ISO-27001-LI", score: 92, date: "10 Juil 2026" },
        { id: "obt-3", nom: "Microsoft Azure Fundamentals AZ-900", code: "AZ-900", score: 95, date: "01 Juin 2026" }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCerts));
      return defaultCerts;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading obtained certs:", err);
    return [];
  }
}

export function addObtainedCertification(cert: Partial<GrantedCertificate> & { nom: string; code: string; score: number }) {
  if (typeof window === 'undefined') return;
  const existing = getObtainedCertifications();
  const newCert: GrantedCertificate = {
    id: cert.id || `obt-${Date.now()}`,
    nom: cert.nom,
    code: cert.code,
    score: cert.score,
    date: cert.date || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    studentName: cert.studentName
  };

  const filtered = existing.filter(c => c.code !== newCert.code);
  const updated = [newCert, ...filtered];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('certificationsUpdated'));
  return newCert;
}
