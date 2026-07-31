'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const googleReviews = [
  {
    initial: "N", bg: "bg-orange-700",
    name: "Nouhaila IJIKKI", date: "il y a 1 année",
    text: "Great experience!!! The staff was professional and welcoming, ensuring a smooth and stress-free process. The exam room wa...",
    fullText: "Great experience!!! The staff was professional and welcoming, ensuring a smooth and stress-free process. The exam room was very comfortable and well equipped. I would definitely recommend it to anyone.",
    stars: 5,
  },
  {
    initial: "R", bg: "bg-green-600",
    name: "Ruby Rust", date: "il y a 1 année",
    text: "Excellent experience! Great organization and helpful staff. Highly recommend.",
    stars: 5,
  },
  {
    initial: "A", bg: "bg-blue-500",
    name: "ABDELHAMID EL KREM", date: "il y a 1 année",
    text: "Je remercie vivement ce cabinet pour son professionnalisme.",
    stars: 5,
  },
  {
    initial: "M", bg: "bg-slate-400", 
    name: "Manal HAMMADI", date: "il y a 1 année",
    text: "Good experience with Good treatment",
    stars: 5,
  },
  {
    initial: "Y", bg: "bg-blue-500",
    name: "Yassine M.", date: "il y a 6 mois",
    text: "Grâce aux simulations d'Ethical Data, j'ai obtenu ma certification AZ-900 avec un score de 940/1000.",
    stars: 5
  },
  {
    initial: "S", bg: "bg-indigo-500",
    name: "Sanaa K.", date: "il y a 2 mois",
    text: "Très bon accompagnement. Les examens blancs sont très représentatifs. Merci à toute l'équipe.",
    stars: 5
  }
];

export function TestimonialsSection() {
  const { t } = useLanguage();
  const [reviewIndex, setReviewIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  const toggleReviewText = (idx: number) => {
    setExpandedReviews(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else if (window.innerWidth < 1280) setItemsPerView(3);
      else setItemsPerView(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, googleReviews.length - itemsPerView);

  const handlePrev = () => {
    setReviewIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setReviewIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe && reviewIndex < maxIndex) {
      handleNext();
    } else if (isRightSwipe && reviewIndex > 0) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section id="testimonials" className="relative z-10 w-full py-16 md:py-20 overflow-hidden bg-[#020617]">
      
      {/* Background cyber network image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/bg/testimonials_cyber_bg.png" 
          alt="Testimonials background" 
          className="w-full h-full object-cover opacity-20 transform-gpu" 
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 z-10">
        
        {/* En-tête Google */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">{t('testimonials_title')}</h2>
          
          <div className="flex flex-col items-center space-y-1">
            <span className="text-base sm:text-lg font-black text-white uppercase tracking-widest">{t('testimonials_excellent')}</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 sm:w-7 sm:h-7 text-[#FFC107] fill-current" viewBox="0 0 512 512">
                  <path d="M256 0c-11.4 0-21.8 7-25.7 17.7L171.1 143.5 29.8 163.6c-11.8 1.7-21.1 10.4-23.7 22-2.6 11.6 1.5 23.6 10.5 31.6l102.4 92-24.5 140.2c-2.1 11.8 3 23.9 13.1 30.5 10 6.6 23.1 6.5 33.1-.2L256 405.1l125.1 74.5c10 6.7 23 6.8 33.1 .2 10.1-6.6 15.2-18.7 13.1-30.5L402.9 309.2l102.4-92c9-8 13.1-20 10.5-31.6-2.6-11.6-11.9-20.3-23.7-22L340.9 143.5 281.7 17.7C277.8 7 267.4 0 256 0z"/>
                </svg>
              ))}
            </div>
            <p className="text-xs sm:text-[13px] text-slate-400 mt-0.5 font-semibold">Basé sur <strong className="text-slate-200">56 avis</strong></p>
            <img src="/logos/google.png" alt="Google" className="h-6 sm:h-7 object-contain mt-1.5" />
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative group px-1 sm:px-12 md:px-14">
          
          {/* Flèche Gauche */}
          <button 
            onClick={handlePrev} 
            className={`absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 bg-[#080d1a]/95 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 rounded-full flex items-center justify-center transition-all shadow-xl ${reviewIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'opacity-100 cursor-pointer hover:scale-105 active:scale-95'}`}
            disabled={reviewIndex === 0}
            aria-label="Avis précédent"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>

          {/* Carousel Viewport */}
          <div 
            className="overflow-hidden w-full py-2 px-1"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${reviewIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {googleReviews.map((test, idx) => {
                const isExpanded = expandedReviews.includes(idx);
                return (
                  <div 
                    key={idx} 
                    style={{ flex: `0 0 ${100 / itemsPerView}%` }} 
                    className="px-2 sm:px-3"
                  >
                    <div className="bg-[#080d1a]/90 border border-slate-800 hover:border-cyan-500/30 rounded-2xl p-5 sm:p-6 text-left flex flex-col space-y-4 shadow-xl transition-all duration-300 group cursor-default min-h-[220px] h-full">
                      
                      {/* Header de l'avis */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg ${test.bg} shrink-0`}>
                            {test.initial}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-[13px] font-bold text-white group-hover:text-cyan-400 transition-colors leading-tight line-clamp-1">
                              {test.name}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{test.date}</span>
                          </div>
                        </div>
                        {/* Small Google Logo */}
                        <img src="/logos/small_google.png" alt="Google" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0" />
                      </div>

                      {/* Étoiles + Verified */}
                      <div className="flex gap-1 items-center">
                        {[...Array(test.stars)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#FFC107] fill-current" viewBox="0 0 512 512">
                            <path d="M256 0c-11.4 0-21.8 7-25.7 17.7L171.1 143.5 29.8 163.6c-11.8 1.7-21.1 10.4-23.7 22-2.6 11.6 1.5 23.6 10.5 31.6l102.4 92-24.5 140.2c-2.1 11.8 3 23.9 13.1 30.5 10 6.6 23.1 6.5 33.1-.2L256 405.1l125.1 74.5c10 6.7 23 6.8 33.1 .2 10.1-6.6 15.2-18.7 13.1-30.5L402.9 309.2l102.4-92c9-8 13.1-20 10.5-31.6-2.6-11.6-11.9-20.3-23.7-22L340.9 143.5 281.7 17.7C277.8 7 267.4 0 256 0z"/>
                          </svg>
                        ))}
                        <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px] ml-1.5 drop-shadow-sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22.846L9.626 21.01L6.735 21.41L5.353 18.735L2.616 17.653L2.616 14.653L0.461 12.346L2.616 10.038L2.616 7.038L5.353 5.956L6.735 3.282L9.626 3.682L12 1.846L14.374 3.682L17.265 3.282L18.647 5.956L21.384 7.038L21.384 10.038L23.539 12.346L21.384 14.653L21.384 17.653L18.647 18.735L17.265 21.41L14.374 21.01L12 22.846Z" fill="#0095F6" />
                          <path fillRule="evenodd" clipRule="evenodd" d="M16.486 9.429L10.741 15.174L7.514 11.947L8.571 10.89L10.741 13.061L15.429 8.372L16.486 9.429Z" fill="white" />
                        </svg>
                      </div>

                      {/* Texte */}
                      <p className="text-xs sm:text-[13px] text-slate-300 group-hover:text-slate-200 transition-colors leading-relaxed font-medium flex-1">
                        {isExpanded && test.fullText ? test.fullText : test.text}
                      </p>
                      
                      {(test.text.endsWith('...') || isExpanded) && (
                        <button 
                          onClick={() => toggleReviewText(idx)} 
                          className="text-[11px] sm:text-[12px] text-cyan-400 hover:text-cyan-300 font-bold text-left mt-auto pt-1 transition-colors cursor-pointer hover:underline border-0 bg-transparent outline-none p-0"
                        >
                          {isExpanded ? 'Réduire' : 'Lire la suite'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flèche Droite */}
          <button 
            onClick={handleNext} 
            className={`absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 bg-[#080d1a]/95 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 rounded-full flex items-center justify-center transition-all shadow-xl ${reviewIndex >= maxIndex ? 'opacity-20 cursor-not-allowed' : 'opacity-100 cursor-pointer hover:scale-105 active:scale-95'}`}
            disabled={reviewIndex >= maxIndex}
            aria-label="Avis suivant"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        {/* Puces de navigation mobile */}
        <div className="flex justify-center items-center gap-1.5 mt-6 sm:hidden">
          {googleReviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setReviewIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${reviewIndex === i ? 'w-5 bg-cyan-400' : 'w-1.5 bg-slate-800'}`}
              aria-label={`Aller à l'avis ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
