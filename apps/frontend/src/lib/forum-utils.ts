export const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Date inconnue';
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getInitial = (str?: string) => (str && str.length > 0 ? str[0].toUpperCase() : '');

export const getAuthorInitials = (auteur?: { prenom?: string; nom?: string }) => {
    const p = getInitial(auteur?.prenom) || 'U';
    const n = getInitial(auteur?.nom);
    return `${p}${n}`;
};

export const getAuthorFullName = (auteur?: { prenom?: string; nom?: string }) => {
    if (!auteur) return 'Utilisateur anonyme';
    const p = auteur.prenom || '';
    const n = auteur.nom || '';
    const full = `${p} ${n}`.trim();
    return full || 'Utilisateur anonyme';
};

export const getAuthorHandle = (auteur?: { prenom?: string; nom?: string }) => {
    if (!auteur) return 'user';
    const p = (auteur.prenom || 'user').toLowerCase().replace(/\s+/g, '');
    const n = (auteur.nom || '').toLowerCase().replace(/\s+/g, '');
    return n ? `${p}_${n}` : p;
};

export const getThemeColor = (theme: string) => {
    switch (theme) {
        case 'Azure & Cloud': return 'bg-sky-50 text-sky-700 border-sky-200';
        case 'Data & AI': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'Cybersécurité': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'Microsoft 365': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'Conseils Examen': return 'bg-rose-50 text-rose-700 border-rose-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
};
