import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from '@/components/icons';

export function AboutSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const slides = [
    {
      title: "Qui sommes-nous ?",
      text: "Ethical Data Security est un centre de formation de référence en cybersécurité et cloud computing, situé au cœur du Technopark de Casablanca.",
      image: "/cyber_hand.png",
      isRed: true
    },
    {
      title: "Solution IT",
      text: "Nous vous offrons des opportunités en développant des solutions spécialisées et nous vous proposons plusieurs produits qui accélèrent la transformation numérique sur n'importe quelle application, n'importe quel cloud et n'importe quel appareil pour réduire les dépenses informatiques......",
      image: "/logos/expertises-integrations-scaled-434x358.webp",
      isRed: true
    },
    {
      title: "Notre priorité",
      text: "Notre missions est de vous accompagner tout au long du cycle de vie de votre infrastructure réseau et sécurité. Nos domaines d'intervention couvrent la conception, la mise en oeuvre, la gestion et le support de solutions réseau, cloud et sécurité",
      image: "/logos/avantages-1-434x358.webp",
      isRed: true
    },
    {
      title: "Une expérience d'une décennie",
      text: "Une équipe enthousiaste, composée de consultants en cybersécurité et infrasctructure, reconnus sur le marché local et international à travers leur participation réussie à des projets de grande envergure (ISP,gouvernemental,finance...). Chacun d'entre nous apporte le meilleur de son expertise pour assurer le succès et la fiabilité de vos projets.",
      image: "/logos/experiences-scaled-434x358.webp",
      isRed: true
    },
    {
      title: "Certification",
      text: "Ethical Data Security met à votre disposition plus de 500 certifications pour renforcer votre expertise et valider vos compétences aux standards les plus élevés. Reconnues et prisées par les recruteurs, nos certifications vous ouvrent les portes des opportunités professionnelles les plus exigeantes",
      image: "/logos/certifications-scaled-434x358.webp",
      isRed: true,
      isTransparent: true
    }
  ];

  const nextSlide = useCallback(() => setCurrentSlide((prev) => (prev + 1) % slides.length), [slides.length]);
  const prevSlide = useCallback(() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000); // 6 secondes par slide
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <div 
      className="relative w-full max-w-5xl mx-auto mt-4 md:mt-12 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Le conteneur du slider */}
      <div className="w-full relative flex flex-col items-center">
        {/* L'image de fond (Technopark) */}
        <div className="w-full h-[300px] md:h-[450px] overflow-hidden rounded-2xl md:rounded-[40px] shadow-lg relative">
          <img 
            src="/technopark.jpeg" 
            alt="Technopark" 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* La Carte Blanche qui chevauche le bas de l'image */}
        <div className="relative -mt-24 md:-mt-32 w-[90%] md:w-10/12 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-5 md:p-10 z-20 flex flex-col md:flex-row gap-6 md:gap-10 items-center min-h-[200px] transition-all duration-500">
          
          {/* Flèches de navigation (Parfaitement centrées par rapport à la carte) */}
          <button 
            onClick={prevSlide}
            className="cursor-pointer absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:scale-110 rounded-full flex items-center justify-center transition-all z-30 shadow-md"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 ml-[-2px]" />
          </button>
          <button 
            onClick={nextSlide}
            className="cursor-pointer absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:scale-110 rounded-full flex items-center justify-center transition-all z-30 shadow-md"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 mr-[-2px]" />
          </button>

          <div className="w-full md:w-5/12 shrink-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentSlide}
                src={slides[currentSlide].image} 
                alt={slides[currentSlide].title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`w-full ${
                  slides[currentSlide].isTransparent 
                    ? "h-40 md:h-56 object-contain" 
                    : "h-40 md:h-56 object-cover rounded-xl shadow-md"
                }`} 
              />
            </AnimatePresence>
          </div>

          <div className="w-full md:w-7/12 text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 md:space-y-4"
              >
                <h3 className="text-lg md:text-2xl font-bold text-slate-900">
                  {slides[currentSlide].isRed ? <span className="text-red-600">{slides[currentSlide].title}</span> : slides[currentSlide].title}
                </h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
                  {slides[currentSlide].text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          
        </div>
      </div>
    </div>
  );
}
