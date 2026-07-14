export interface Utilisateur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  statut: 'ACTIF' | 'INACTIF' | 'BANNI';
  avatar?: string;
  bio?: string;
  dateInscription: string;
  roles: Role[];
  preferences?: any;
}

export interface Role {
  id: string;
  nom: string;
}

export interface Sujet {
  id: string;
  titre: string;
  contenu: string;
  theme: string;
  dateCreation: string;
  likesCount: number;
  commentairesCount: number;
  isLikedByUser?: boolean;
  auteur: Auteur;
  certification?: CertificationSimple | null;
}

export interface Auteur {
  id: string;
  prenom: string;
  nom: string;
  email?: string;
  avatar?: string | null;
  role: string;
}

export interface CommentaireItem {
  id: string;
  contenu: string;
  dateCreation: string;
  parentCommentaireId?: string | null;
  likesCount?: number;
  isLikedByUser?: boolean;
  auteur: Auteur;
  mentionUser?: { id: string; prenom: string; nom: string };
}

export interface DetailSujet extends Sujet {
  isLikedByUser: boolean;
  commentaires: CommentaireItem[];
}

export interface CertificationSimple {
  id: string;
  nom: string;
  codeExamen?: string | null;
  image?: string;
}

export interface Certification extends CertificationSimple {
  slug: string;
  description: string;
  niveau: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  dureeIndicative?: string;
  objectifs: string[];
  prerequis: string[];
  dateCreation: string;
  fournisseurId: string | number;
  fournisseur: Fournisseur;
}

export const THEMES = [
  'TOUS',
  'Azure & Cloud',
  'Data & AI',
  'Cybersécurité',
  'Microsoft 365',
  'Conseils Examen',
  'Carrière & Emploi',
] as const;

export interface Fournisseur {
  id: string;
  nom: string;
  slug: string;
  image?: string;
  certifications?: Certification[];
}

export interface ObtainedCertification extends CertificationSimple {
  bestScore?: number;
  logoUrl?: string;
}

export interface DashboardStats {
  sujetsCount: number;
  commentairesCount: number;
  likesCount: number;
  coursCount: number;
  certificationsCount: number;
  tentativesCount: number;
  inscriptionsCount: number;
}

export interface Cours {
  id: string;
  titre: string;
  slug: string;
  description?: string;
  statut: 'BROUILLON' | 'PUBLIE' | 'ARCHIVE';
  imageUrl?: string;
  modules: ModuleSimple[];
  formateur: Auteur;
  certification?: CertificationSimple | null;
}

export interface ModuleSimple {
  id: string;
  titre: string;
  ordre: number;
  dureeEstimee?: number;
}

export interface Question {
  id: string;
  enonce: string;
  explication?: string;
  reponseCorrecte?: string;
  categorie?: string;
  type: string;
  difficulte: number;
  options: Option[];
}

export interface Option {
  id: string;
  lettre: string;
  texte: string;
}

export interface Creneau {
  id: string;
  dateDebut: string;
  dateFin: string;
  estReserve: boolean;
  formateur: Auteur;
}

export interface RendezVous {
  id: string;
  type: string;
  motif?: string;
  statut: string;
  dateCreation: string;
  candidat: Auteur;
  formateur: Auteur;
  creneau: Creneau;
}
