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

  // Services / Priorités Section
  priorities_tag: { fr: "Engagements & Piliers", ar: "التزاماتنا وركائزنا", en: "Commitments & Pillars" },
  priorities_title: { fr: "Notre Priorité", ar: "أولويتنا", en: "Our Priority" },
  card1_title: { fr: "Notre Mission", ar: "مهمتنا", en: "Our Mission" },
  card1_desc: {
    fr: "Accompagner les entreprises et professionnels dans la sécurisation, l'optimisation et la transformation digitale de leurs infrastructures stratégiques.",
    ar: "مرافقة الشركات والمهنيين في تأمين وتحسين التحول الرقمي للبنى التحتية الاستراتيجية.",
    en: "Support companies and professionals in securing, optimizing, and digitally transforming their strategic IT infrastructure."
  },
  card2_title: { fr: "Notre Expérience", ar: "خبرتنا", en: "Our Experience" },
  card2_desc: {
    fr: "Plus de 10 ans d'expertise dans le conseil IT, l'audit de cybersécurité, le cloud hybride et la formation certifiante de haut niveau.",
    ar: "أكثر من 10 سنوات من الخبرة في الاستشارات وتدقيق الأمن السبراني والدورات التدريبية المعتمدة.",
    en: "Over 10 years of expertise in IT consulting, cybersecurity audit, hybrid cloud, and high-level certified training."
  },
  card3_title: { fr: "Formations & Vouchers", ar: "التدريب والقسائم", en: "Training & Vouchers" },
  card3_desc: {
    fr: "Plus de 500 cursus qualifiants et vouchers officiels (Microsoft, AWS, Palo Alto, PECB) pour propulser votre carrière internationale.",
    ar: "أكثر من 500 دورة تدريبية وقسائم امتحانات رسمية (Microsoft, AWS, Palo Alto, PECB) لتطوير حياتك المهنية.",
    en: "Over 500 qualifying courses and official vouchers (Microsoft, AWS, Palo Alto, PECB) to boost your global career."
  },
  card4_title: { fr: "Solutions IT Sur Mesure", ar: "حلول تكنولوجيا مخصصة", en: "Custom IT Solutions" },
  card4_desc: {
    fr: "Infogérance 24/7, intégration de systèmes complexes et portage salarial pour répondre avec réactivité aux exigences de votre entreprise.",
    ar: "إدارة البنية التحتية 24/7 وتكامل الأنظمة المعقدة لتلبية متطلبات مؤسستك بسرعة واستجابة عالية.",
    en: "24/7 Managed services, complex system integration, and umbrella services to responsively meet your business needs."
  },

  // Open Sessions Section
  open_sessions_title: { fr: "Sessions de Formation Ouvertes", ar: "دورات تدريبية مفتوحة", en: "Open Training Sessions" },
  open_sessions_desc: {
    fr: "Réservez votre place pour nos prochaines sessions de formation en visioconférence ou bootcamp intensif avec formateurs certifiés.",
    ar: "احجز مقعدك في دوراتنا التدريبية القادمة عبر الإنترنت أو المعسكرات المكثفة مع مدربين معتمدين.",
    en: "Book your seat for our upcoming live online sessions or intensive bootcamps with certified instructors."
  },
  places_left: { fr: "places restantes", ar: "أماكن متبقية", en: "seats remaining" },
  btn_register_session: { fr: "S'inscrire à cette session", ar: "التسجيل في هذه الدورة", en: "Register for Session" },

  // Certifications Section
  certifications_title: { fr: "Certifications", ar: "الشهادات الدولية", en: "Certifications" },
  certifications_desc: {
    fr: "Sélectionnez votre parcours, entraînez-vous sur nos simulateurs et décrochez votre certification internationale.",
    ar: "اختر مسارك التدريبي، وتدرب على منصات المحاكاة واحصل على شهادتك الدولية.",
    en: "Select your track, practice on our simulators, and earn your official international certification."
  },

  // Community & Mentoring Section
  coaching_headline: {
    fr: "Maximisez vos chances de réussite :",
    ar: "ضاعف فرصك في النجاح:",
    en: "Maximize your chances of success:"
  },
  coaching_gradient_text: {
    fr: "Examens Blancs IA, Vouchers & Mentoring",
    ar: "امتحانات الذكاء الاصطناعي وقسائم الامتحانات والتوجيه",
    en: "AI Mock Exams, Vouchers & Mentoring"
  },
  coaching_subtext: {
    fr: "Entraînez-vous avec nos simulations chronométrées avec correction IA (Readiness Score), achetez vos vouchers d'examen officiel avec réductions EDS et planifiez un coaching 1-on-1 avec un formateur expert.",
    ar: "تدرب مع امتحانات المحاكاة الموقوتة بالتصحيح الذكي، واشترِ قسائم الامتحانات الرسمية بخصومات ممتازة، واحجز جلسات توجيه خاصة.",
    en: "Practice with timed exam simulations with AI scoring, purchase official exam vouchers at discounted rates, and schedule 1-on-1 coaching with expert mentors."
  },
  card_exam_ia: { fr: "Examens Blancs IA", ar: "امتحانات تجريبية بالذكاء الاصطناعي", en: "AI Mock Exams" },
  card_vouchers: { fr: "Vouchers Examen", ar: "قسائم الامتحانات", en: "Exam Vouchers" },
  card_coaching: { fr: "Coaching 1-on-1", ar: "توجيه فردي", en: "1-on-1 Coaching" },
  btn_discover_exams: { fr: "Découvrir les Examens Blancs", ar: "استكشف الامتحانات التجريبية", en: "Discover Mock Exams" },
  btn_view_vouchers: { fr: "Voir les Vouchers", ar: "عرض القسائم المتاحة", en: "View Vouchers" },

  // Courses Preview Section
  courses_preview_title: { fr: "Formations Populaires & Certifiantes", ar: "دورات تدريبية شائعة ومشهورة", en: "Popular & Certified Courses" },
  courses_preview_desc: {
    fr: "Préparez et réussissez vos certifications IT officielles grâce à nos programmes immersifs avec cours, labs et examens blancs IA.",
    ar: "استعد وانجح في شهادات تكنولوجيا المعلومات الرسمية من خلال برامجنا مع المختبرات والامتحانات المحاكاة.",
    en: "Prepare and pass your official IT certifications with our immersive courses, labs, and AI mock exams."
  },
  btn_all_courses: { fr: "Voir tout le catalogue des formations", ar: "عرض جميع الدورات التدريبية", en: "View All Courses" },

  // Testimonials Section
  testimonials_tag: { fr: "Témoignages & Avis", ar: "آراء وشهادات الطلاب", en: "Testimonials & Reviews" },
  testimonials_title: { fr: "Ce que disent nos apprenants", ar: "ما يقوله طلابنا", en: "What Our Learners Say" },
  testimonials_subtitle: {
    fr: "Retours d'expérience et réussites de nos diplômés et professionnels certifiés.",
    ar: "تجارب وقصص نجاح خريجينا والمهنيين المعتمدين.",
    en: "Success stories and feedback from our certified graduates and professionals."
  },

  // FAQ Section
  faq_tag: { fr: "Questions Fréquentes", ar: "الأسئلة الشائعة", en: "Frequently Asked Questions" },
  faq_title: { fr: "Tout ce que vous devez savoir", ar: "كل ما تحتاج إلى معرفته", en: "Everything You Need to Know" },
  faq_subtitle: {
    fr: "Trouvez des réponses claires sur nos formations, certifications, vouchers et accompagnement IA.",
    ar: "إجابات واضحة حول دوراتنا وشهاداتنا وقسائم الامتحانات والمرافقة.",
    en: "Find clear answers about our courses, certifications, vouchers, and AI support."
  },

  // Contact Section
  contact_title: { fr: "Contactez Nos Experts IT", ar: "تواصل مع خبراء تكنولوجيا المعلومات", en: "Contact Our IT Experts" },
  contact_subtitle: {
    fr: "Besoin d'un conseil personnalisé, d'un devis entreprise ou d'une information sur un voucher ? Notre équipe est à votre écoute.",
    ar: "هل تحتاج إلى استشارة خاصة، أو عرض سعر للشركة، أو معلومات حول القسائم؟ فريقنا في خدمتك.",
    en: "Need personalized advice, a corporate quote, or information on vouchers? Our team is at your service."
  },
  contact_btn_send: { fr: "Envoyer le message", ar: "إرسال الرسالة", en: "Send Message" },

  // Footer & Miscellaneous
  footer_tagline: {
    fr: "Plateforme leader de formation et certification officielle Cloud, Cybersécurité & IA au Maroc et en Afrique.",
    ar: "المنصة الرائدة للتدريب والشهادات الرسمية في السحابة والأمن السبراني والذكاء الاصطناعي في المغرب وإفريقيا.",
    en: "Leading platform for official Cloud, Cybersecurity & AI training and certification in Morocco & Africa."
  },
  footer_col1: { fr: "Formations", ar: "الدورات", en: "Courses" },
  footer_col2: { fr: "Services IT", ar: "خدمات التكنولوجيا", en: "IT Services" },
  footer_col3: { fr: "Contact & Support", ar: "التواصل والدعم", en: "Contact & Support" },
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
