import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from '@/components/icons';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function FaqSection() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const toggleFaq = (idx: number) => setActiveFaq(activeFaq === idx ? null : idx);

  const faqData = [
    {
      q: "Les simulations sont-elles conformes aux examens officiels ?",
      a: "Oui. Nos questionnaires sont rédigés par des ingénieurs certifiés et suivent scrupuleusement les référentiels officiels de Microsoft et AWS. Ils simulent le format, la difficulté et la limite de temps réels de l'examen officiel."
    },
    {
      q: "Qu'est-ce que le Readiness Score et comment garantit-il ma réussite ?",
      a: "Le Readiness Score est un indicateur intelligent calculé en fonction de vos performances sur vos 3 dernières tentatives stables. Notre algorithme a démontré qu'un score de préparation supérieur à 85% assure la réussite de l'examen officiel."
    },
    {
      q: "Les cours et questions sont-ils mis à jour lors de changements de programmes ?",
      a: "Absolument. Nous surveillons en continu les programmes des certificateurs (Microsoft, AWS, CompTIA). En cas de mise à jour d'un référentiel d'examen, notre base de questions et nos fiches mémos sont adaptées sous 48 heures."
    },
    {
      q: "Puis-je réinitialiser mes tentatives pour recommencer ma préparation ?",
      a: "Oui, vous pouvez réinitialiser vos statistiques et votre progression de simulation à tout moment depuis votre tableau de bord. Cela vous permet de repartir sur un nouveau cycle d'apprentissage à blanc si nécessaire."
    }
  ];

  return (
    <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-20 border-t border-slate-200/60">

      <AnimatedSection className="text-center mb-16">
        <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Support</span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 mt-3 uppercase tracking-tight">Questions Fréquentes</h2>
      </AnimatedSection>

      <div className="space-y-3">
        {faqData.map((item, idx) => {
          const isOpen = activeFaq === idx;
          return (
            <AnimatedSection key={idx} delay={idx * 0.08}>
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-200 shadow-sm">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-xs sm:text-sm text-slate-800 outline-none cursor-pointer"
                >
                  <span className="pr-4 uppercase tracking-wider">{item.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-slate-500 shrink-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimatedSection>
          );
        })}
      </div>
    </section>
  );
}
