import React from 'react';

export function ClientsSection() {
  const clients = [
    { name: "AXA", logo: "/logos/axa.png" },
    { name: "Heuris", logo: "/logos/heuris.png" },
    { name: "CTM", logo: "/logos/ctm.png" },
    { name: "TCS", logo: "/logos/tcs.png" },
    { name: "Zen Networks", logo: "/logos/zennetworks.png" },
    { name: "Adaptive IT", logo: "/logos/adaptiveit.png" }
  ];

  return (
    <section className="relative z-10 w-full border-y border-slate-200/60 py-5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-3 text-left">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ils nous font confiance :</span>
      </div>
      <div className="relative w-full overflow-hidden">
        {/* Floutage des bords */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none" />
        
        <div className="flex gap-12 animate-marquee-reverse whitespace-nowrap items-center">
          {[...clients, ...clients, ...clients, ...clients].map((client, idx) => (
            <div key={idx} className="inline-flex items-center justify-center bg-white border border-slate-100 rounded-xl px-4 py-1.5 shrink-0 shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.99)', colorScheme: 'light' }}>
              <img 
                src={client.logo} 
                alt={client.name} 
                className="h-5 sm:h-6 object-contain block max-w-[90px]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const parent = (e.target as HTMLElement).parentElement;
                  if (parent && !parent.querySelector('.fallback-text')) {
                    const textSpan = document.createElement('span');
                    textSpan.className = "fallback-text text-[10px] font-black text-slate-400 uppercase tracking-widest";
                    textSpan.innerText = client.name;
                    parent.appendChild(textSpan);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
