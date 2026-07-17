import React from 'react';

const partnerLogos = [
  { name: "Microsoft", path: "/logos/microsoft.png" },
  { name: "AWS", path: "/logos/aws.png" },
  { name: "CompTIA", path: "/logos/comptia.png" },
  { name: "Cisco", path: "/logos/cisco.png" },
  { name: "Fortinet", path: "/logos/fortinet.png" },
  { name: "Palo Alto Networks", path: "/logos/paloalto.png" },
  { name: "PECB", path: "/logos/pecb.png" },
  { name: "Pearson VUE", path: "/logos/pearsonvue.png" },
  { name: "Google Cloud", path: "/logos/google.png" }
];

export function PartnersSection() {
  return (
    <section className="relative z-10 w-full bg-white border-t border-slate-200/60 py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10 text-left">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Nos Partenaires Certifications</h3>
      </div>
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        <div className="flex gap-12 animate-marquee whitespace-nowrap items-center">
          {[...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos].map((partner, idx) => (
            <div key={idx} className="inline-flex items-center justify-center bg-white border border-slate-100 rounded-xl px-4 py-1.5 shrink-0 shadow-sm">
              <img 
                src={partner.path} 
                alt={partner.name} 
                className="h-5 sm:h-6 object-contain block max-w-[90px]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const parent = (e.target as HTMLElement).parentElement;
                  if (parent && !parent.querySelector('.fallback-text')) {
                    const textSpan = document.createElement('span');
                    textSpan.className = "fallback-text text-[10px] font-black text-slate-400 uppercase tracking-widest";
                    textSpan.innerText = partner.name;
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
