export const getProviderLogo = (slugOrName: string) => {
  const name = (slugOrName || '').toLowerCase();
  if (name.includes('microsoft')) return '/logos/microsoft.png';
  if (name.includes('aws') || name.includes('amazon')) return '/logos/aws.png';
  if (name.includes('gcp') || name.includes('google') || name.includes('googlecloud')) return '/logos/googlecloud.webp';
  if (name.includes('cisco')) return '/logos/cisco.png';
  if (name.includes('comptia')) return '/logos/comptia.png';
  if (name.includes('fortinet')) return '/logos/fortinet.png';
  if (name.includes('paloalto') || name.includes('palo alto')) return '/logos/paloalto.png';
  if (name.includes('pecb')) return '/logos/pecb.png';
  return '';
};

export const getCertificateBadgeLogo = (cert: any) => {
    if (!cert) return '';
    if (cert.image && (cert.image.endsWith('.svg') || cert.image.endsWith('.png'))) return cert.image;
    const code = (cert.codeExamen || cert.code || '').toLowerCase();
    const nom = (cert.nom || cert.title || '').toLowerCase();

    if (code.includes('az-900') || nom.includes('az-900') || nom.includes('azure fundamentals')) return '/badges/az-900.svg';
    if (code.includes('clf') || nom.includes('cloud practitioner')) return '/badges/aws-clf.svg';
    if (code.includes('saa') || nom.includes('solutions architect')) return '/badges/aws-saa.svg';
    if (code.includes('iso-27001') || nom.includes('iso 27001') || nom.includes('pecb')) return '/badges/pecb-iso.svg';
    if (code.includes('sy0') || nom.includes('security+')) return '/badges/comptia-sec.svg';
    if (code.includes('sc-900') || nom.includes('sc-900')) return '/badges/sc-900.svg';

    return cert.image || cert.logoUrl || '/badges/az-900.svg';
};

export const getLevelBadgeStyle = (niveau: string) => {
  switch (niveau) {
    case 'DEBUTANT': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'INTERMEDIAIRE': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'AVANCE': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};
