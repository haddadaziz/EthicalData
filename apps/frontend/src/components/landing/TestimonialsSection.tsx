import React, { useState, useEffect } from 'react';

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
    initial: "Y", bg: "bg-red-500",
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
  const [reviewIndex, setReviewIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);
  
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

  useEffect(() => {
    const timer = setInterval(() => {
      setReviewIndex((prev) => {
        const maxIndex = Math.max(0, googleReviews.length - itemsPerView);
        if (prev >= maxIndex) return 0;
        return prev + 1;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [itemsPerView]);

  return (
    <section id="testimonials" className="relative z-10 w-full py-20 overflow-hidden bg-[#020617]">
      
      {/* Background cyber network image - Stretching 100% edge-to-edge */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/bg/testimonials_cyber_bg.png" 
          alt="Testimonials background" 
          className="w-full h-full object-cover opacity-20 transform-gpu" 
          loading="lazy"
          decoding="async"
        />
        {/* Soft gradient fading perfectly to top/bottom sections to ensure smooth seamless flow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 z-10">
        
        {/* En-tête Google */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Ce que disent nos clients</h2>
          
          <div className="flex flex-col items-center space-y-1">
            <span className="text-lg font-black text-white uppercase tracking-widest">Excellent</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-7 h-7 text-[#FFC107] fill-current" viewBox="0 0 512 512">
                  <path d="M256 0c-11.4 0-21.8 7-25.7 17.7L171.1 143.5 29.8 163.6c-11.8 1.7-21.1 10.4-23.7 22-2.6 11.6 1.5 23.6 10.5 31.6l102.4 92-24.5 140.2c-2.1 11.8 3 23.9 13.1 30.5 10 6.6 23.1 6.5 33.1-.2L256 405.1l125.1 74.5c10 6.7 23 6.8 33.1 .2 10.1-6.6 15.2-18.7 13.1-30.5L402.9 309.2l102.4-92c9-8 13.1-20 10.5-31.6-2.6-11.6-11.9-20.3-23.7-22L340.9 143.5 281.7 17.7C277.8 7 267.4 0 256 0z"/>
                </svg>
              ))}
            </div>
            <p className="text-[13px] text-slate-400 mt-1 font-semibold">Basé sur <strong className="text-slate-200">56 avis</strong></p>
            <img src="/logos/google.png" alt="Google" className="h-7 object-contain mt-2" />
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative group flex items-center px-12 md:px-14">
          
          {/* Flèche Gauche */}
          <button 
            onClick={() => setReviewIndex(prev => Math.max(0, prev - 1))} 
            className={`absolute left-0 z-20 w-10 h-10 bg-[#080d1a]/95 border border-slate-900 text-slate-400 hover:text-white hover:bg-slate-950/80 rounded-full flex items-center justify-center transition-all ${reviewIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 cursor-pointer hover:scale-105 active:scale-95'}`}
            disabled={reviewIndex === 0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>

          <div className="overflow-hidden w-full py-4 px-2">
            <div 
              className="flex transition-transform duration-700 ease-in-out gap-6"
              style={{ transform: `translateX(-${reviewIndex * (100 / itemsPerView)}%)` }}
            >
              {googleReviews.map((test, idx) => {
                const isExpanded = expandedReviews.includes(idx);
                return (
                  <div 
                    key={idx} 
                    style={{ flex: `0 0 calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 24 / itemsPerView}px)` }} 
                    className="bg-[#080d1a]/85 backdrop-blur-sm border border-slate-900 hover:border-red-500/20 rounded-2xl p-6 text-left flex flex-col space-y-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-950/5 transition-all duration-300 group cursor-default"
                  >
                    {/* Header de l'avis */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${test.bg}`}>
                          {test.initial}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-white group-hover:text-red-500 transition-colors duration-300 leading-tight">
                            {test.name}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">{test.date}</span>
                        </div>
                      </div>
                      {/* Small Google Logo */}
                      <img src="/logos/small_google.png" alt="Google" className="w-5 h-5 object-contain shrink-0" />
                    </div>

                    {/* Etoiles + Verified */}
                    <div className="flex gap-1 items-center">
                      {[...Array(test.stars)].map((_, i) => (
                        <svg key={i} className="w-[18px] h-[18px] text-[#FFC107] fill-current" viewBox="0 0 512 512">
                          <path d="M256 0c-11.4 0-21.8 7-25.7 17.7L171.1 143.5 29.8 163.6c-11.8 1.7-21.1 10.4-23.7 22-2.6 11.6 1.5 23.6 10.5 31.6l102.4 92-24.5 140.2c-2.1 11.8 3 23.9 13.1 30.5 10 6.6 23.1 6.5 33.1-.2L256 405.1l125.1 74.5c10 6.7 23 6.8 33.1 .2 10.1-6.6 15.2-18.7 13.1-30.5L402.9 309.2l102.4-92c9-8 13.1-20 10.5-31.6-2.6-11.6-11.9-20.3-23.7-22L340.9 143.5 281.7 17.7C277.8 7 267.4 0 256 0z"/>
                        </svg>
                      ))}
                      <svg className="w-[18px] h-[18px] ml-1.5 drop-shadow-sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22.846L9.626 21.01L6.735 21.41L5.353 18.735L2.616 17.653L2.616 14.653L0.461 12.346L2.616 10.038L2.616 7.038L5.353 5.956L6.735 3.282L9.626 3.682L12 1.846L14.374 3.682L17.265 3.282L18.647 5.956L21.384 7.038L21.384 10.038L23.539 12.346L21.384 14.653L21.384 17.653L18.647 18.735L17.265 21.41L14.374 21.01L12 22.846Z" fill="#0095F6" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.486 9.429L10.741 15.174L7.514 11.947L8.571 10.89L10.741 13.061L15.429 8.372L16.486 9.429Z" fill="white" />
                      </svg>
                    </div>

                    {/* Texte */}
                    <p className="text-[13px] text-slate-300 group-hover:text-slate-200 transition-colors duration-300 leading-relaxed font-semibold">
                      {isExpanded && test.fullText ? test.fullText : test.text}
                    </p>
                    
                    {(test.text.endsWith('...') || isExpanded) && (
                      <button 
                        onClick={() => toggleReviewText(idx)} 
                        className="text-[12px] text-red-500 hover:text-red-400 font-bold text-left mt-auto pt-2 transition-colors cursor-pointer hover:underline border-0 bg-transparent outline-none p-0"
                      >
                        {isExpanded ? 'Réduire' : 'Lire la suite'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flèche Droite */}
          <button 
            onClick={() => setReviewIndex(prev => Math.max(0, Math.min(googleReviews.length - itemsPerView, prev + 1)))} 
            className={`absolute right-0 z-20 w-10 h-10 bg-[#080d1a]/95 border border-slate-900 text-slate-400 hover:text-white hover:bg-slate-950/80 rounded-full flex items-center justify-center transition-all ${reviewIndex >= googleReviews.length - itemsPerView ? 'opacity-30 cursor-not-allowed' : 'opacity-100 cursor-pointer hover:scale-105 active:scale-95'}`}
            disabled={reviewIndex >= googleReviews.length - itemsPerView}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
