import React from 'react';

export function Footer() {
  return (
    <footer className="relative z-10 bg-[#212121] text-[#A3A3A3]">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-12">
        
        <div className="max-w-xl space-y-4 text-left">
          <img src="/ethicaldata_white_logo.png" alt="Ethical Data Security" className="h-10 w-auto object-contain" />
          <p className="text-sm leading-relaxed">
            Dynamisme, réactivité et innovation sont au cœur de nos engagements. Nos solutions,<br className="hidden md:block" />
            conçues par des experts, visent à surpasser vos attentes.
          </p>
        </div>

        <div className="text-left space-y-4 md:min-w-[400px]">
          <h4 className="text-base font-bold text-[#E5E5E5]">Contact</h4>
          <div className="text-sm space-y-3">
            <p><span className="font-bold text-[#D4D4D4]">Email :</span> contact@ethicaldatasecurity.ma</p>
            <p><span className="font-bold text-[#D4D4D4]">Tél :</span> +212 664 244 343 // +212 520 572 631</p>
            <p><span className="font-bold text-[#D4D4D4]">Adresse :</span> Bureau 305, Technopark Casablanca</p>
          </div>
        </div>
        
      </div>

      {/* BOTTOM COPYRIGHT STRIP */}
      <div className="w-full bg-[#181818] py-5">
        <div className="max-w-7xl mx-auto px-6 flex items-center">
          <p className="text-sm">© {new Date().getFullYear()} Ethical Data Security - Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
