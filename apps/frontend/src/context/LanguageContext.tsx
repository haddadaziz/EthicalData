"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'ar' | 'en';

type Translations = {
  [key: string]: {
    fr: string;
    ar: string;
    en: string;
  };
};

export const dictionary: Translations = {
  // Navbar & Global
  nav_home: { fr: "Accueil", ar: "الرئيسية", en: "Home" },
  nav_formations: { fr: "Formation", ar: "التدريب", en: "Training" },
  nav_certifications: { fr: "Certifications", ar: "الشهادات", en: "Certifications" },
  nav_services: { fr: "Services", ar: "الخدمات", en: "Services" },
  nav_blog: { fr: "Blog", ar: "المدونة", en: "Blog" },
  nav_about: { fr: "À Propos", ar: "من نحن", en: "About Us" },
  nav_contact: { fr: "Contact", ar: "اتصل بنا", en: "Contact" },
  nav_login: { fr: "Connexion", ar: "تسجيل الدخول", en: "Login" },
  nav_register: { fr: "Inscription", ar: "إنشاء حساب", en: "Register" },
  nav_dashboard: { fr: "Mon Espace", ar: "لوحة التحكم", en: "Dashboard" },

  // Submenu Formations
  sub_cat_formations: { fr: "Catalogue Formations", ar: "كتالوج الدورات", en: "Courses Catalog" },
  sub_all_certs: { fr: "Tous les Certificats", ar: "جميع الشهادات", en: "All Certifications" },
  sub_exam_ia: { fr: "Examens Blancs & IA", ar: "امتحانات تجريبية والذكاء الاصطناعي", en: "Mock Exams & AI" },
  sub_vouchers: { fr: "Vouchers d'Examen", ar: "قسائم الامتحانات", en: "Exam Vouchers" },
  sub_coaching: { fr: "Coaching & Mentoring", ar: "التوجيه والتدريب", en: "Coaching & Mentoring" },

  // Submenu Services
  sub_infogerance: { fr: "Infogérance", ar: "الإدارة السحابية", en: "Managed Services" },
  sub_integration: { fr: "Intégration", ar: "تكامل الأنظمة", en: "Integration" },
  sub_prof_services: { fr: "Services Professionnels", ar: "الخدمات المهنية", en: "Professional Services" },
  sub_solution_it: { fr: "Solution IT", ar: "حلول تكنولوجيا المعلومات", en: "IT Solution" },
  sub_portage: { fr: "Portage Salarial", ar: "المظلة الوظيفية", en: "Umbrella Company" },

  // Hero Section
  hero_title: {
    fr: "Ethical Data Security – L'essentiel en un clic !",
    ar: "Ethical Data Security – كل ما تحتاجه بنقرة واحدة!",
    en: "Ethical Data Security – Essential Security in One Click!"
  },
  hero_subtitle: {
    fr: "Dynamisme, réactivité et innovation sont au cœur de nos engagements. Nous vous accompagnons dans la mise en place, l'évolution et la sécurisation de votre infrastructure IT.",
    ar: "الديناميكية والاستجابة والابتكار هي في قلب التزاماتنا. نرافقكم في إنشاء وتطوير وتأمين البنية التحتية لتكنولوجيا المعلومات.",
    en: "Dynamism, responsiveness, and innovation are at the heart of our commitments. We support you in setting up, evolving, and securing your IT infrastructure."
  },
  hero_cta: { fr: "Réserver un diagnostic", ar: "حجز تشخيص مجاني", en: "Book a Diagnostic" },

  // Sections Headings
  priorities_tag: { fr: "Engagements & Piliers", ar: "التزاماتنا وركائزنا", en: "Commitments & Pillars" },
  priorities_title: { fr: "Notre Priorité", ar: "أولويتنا", en: "Our Priority" },
  open_sessions_title: { fr: "Sessions de Formation Ouvertes", ar: "دورات تدريبية مفتوحة", en: "Open Training Sessions" },
  certifications_title: { fr: "Certifications", ar: "الشهادات الدولية", en: "Certifications" },

  // Footer & Miscellaneous
  rights_reserved: { fr: "Tous droits réservés.", ar: "جميع الحقوق محفوظة.", en: "All rights reserved." },
  select_lang: { fr: "Langue", ar: "اللغة", en: "Language" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved && (saved === 'fr' || saved === 'ar' || saved === 'en')) {
      setLanguageState(saved);
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const item = dictionary[key];
    if (!item) return key;
    return item[language] || item.fr || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
