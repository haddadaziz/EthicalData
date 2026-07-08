# Rapport de Suivi de Stage — Projet de Tuteurage : EthicalData

**Stagiaire :** Aziz Haddad  
**Projet :** Plateforme d'Entraînement et de Mentorat aux Certifications (EthicalData)  
**Destinataire :** Formateur référent / Tuteur d'école  
**Dépôt du projet :** `c:\DevAziz`  

---

## 1. Contexte du Projet & Architecture Globale

**EthicalData** est une plateforme web d'apprentissage et de coaching visant à accompagner les apprenants dans la préparation et l'obtention de certifications professionnelles (ex: AWS, Azure, ISO 27001). 

L'application est structurée selon une architecture **Full-Stack monorepo** découplée :
*   **Backend (Dossier `/apps/backend`) :** Conçu avec **NestJS** (TypeScript). Il expose une API REST structurée, sécurisée par des gardes JWT et des gardes basés sur les rôles (`APPRENANT`, `FORMATEUR`, `ADMIN`, `SUPER_ADMIN`). L'accès à la base de données est géré par **Prisma ORM**.
*   **Frontend (Dossier `/apps/frontend`) :** Développé avec **Next.js** (React, TypeScript, App Router) et stylisé avec TailwindCSS et du CSS sur mesure.
*   **Base de Données :** **PostgreSQL** hébergé dans un conteneur **Docker** (`coaching_platform_postgres`).

---

## 2. Conception & Modélisation (Diagramme de Classes UML)

Avant d'entamer le développement de fonctionnalités, la première étape chronologique a consisté à modéliser la structure relationnelle de l'application. Cette conception garantit la modularité du code et l'intégrité des données stockées.

### 2.1 Entités modélisées
Le modèle s'articule autour des concepts clés suivants :
*   **Utilisateur (Utilisateur) :** Gère le double rôle (Formateur / Apprenant), le profil (bio, avatar) et ses préférences de confidentialité.
*   **Créneaux & Rendez-vous (CreneauDisponibilite, RendezVous) :** Assurent l'organisation temporelle des séances de mentorat individuel.
*   **Entraînement & Forum (Sujet, Commentaire) :** Centralisent les questions communautaires et les réponses.
*   **Signalements (SignalementSujet, SignalementCommentaire) :** Permettent aux utilisateurs de signaler les dérives pour la modération.

> **🖼️ EMPLACEMENT CAPTURE D'ÉCRAN N°1 : DIAGRAMME DE CLASSES (UML)**
> *   **Où l'insérer :** Section 2 (Conception & Modélisation).
> *   **Que capturer :** Ton schéma de base de données relationnelle ou diagramme de classes UML montrant les cardinalités (ex: un Utilisateur a plusieurs Sujets, un Commentaire appartient à un Sujet).
> *   **Légende suggérée :** *Figure 1 : Diagramme de classes UML détaillant la structure relationnelle du modèle de données.*

---

## 3. Synthèse des Fonctionnalités Implémentées

Durant cette période d'intégration et de développement, nous avons conçu et implémenté plusieurs fonctionnalités complexes de niveau production :

### 3.1 Espace Dynamique de Double Rôle (Apprenant / Formateur)
Pour éviter de forcer l'utilisateur à créer deux comptes séparés, le système prend en charge un double rôle. Un bouton dans l'en-tête permet à un utilisateur qualifié de permuter instantanément entre son tableau de bord d'apprentissage et ses outils de formateur.
*   **Optimisation de la performance (Anti-Flicker) :** Initialisation synchrone des états de rôle et de vue directement depuis le token JWT décodé et le stockage local lors du montage des layouts. Cela supprime tout effet de clignotement ou d'affichage temporaire de l'interface apprenant lors de la navigation en mode formateur.

### 3.2 Gestion des Créneaux de Coaching & Calendrier (Espace Formateur)
Mise en place d'un outil complet de planification pour les formateurs :
*   Déclaration de créneaux de disponibilité horaires en base de données.
*   Suivi des sessions réservées par les apprenants (sujets abordés, horaires, type de coaching).
*   Annulation de créneaux en un clic avec suppression instantanée des plannings respectifs du candidat et du formateur.

### 3.3 Profils Publics Apprenants & Paramètres de Confidentialité
*   **Profils Publics (`/dashboard/profile/[id]`) :** Visualisation détaillée du parcours d'un apprenant (bio, date d'inscription, statistiques de participation au forum, objectifs de certifications visés et certifications effectivement obtenues avec un score $\ge 80\%$).
*   **Gestion fine de la confidentialité :** Intégration de boutons à bascule (Toggle Switches) dans les préférences de l'utilisateur pour activer/désactiver la visibilité publique de ses certifications obtenues et visées. Les états sont sérialisés dans la colonne JSON `Utilisateur.preferences` sous PostgreSQL.

### 3.4 Système de Notification Ciblé
Développement d'un service d'aiguillage des notifications lors de l'annulation d'un rendez-vous :
*   Si le formateur annule la séance, l'apprenant est notifié du motif.
*   Si l'apprenant annule, le formateur est informé de la libération de son créneau.
*   Le système de routage a été fiabilisé pour rediriger correctement le formateur vers `/dashboard/appointments` (son espace de travail) au lieu de l'ancienne zone administrative sécurisée qui provoquait des erreurs d'accès.

### 3.5 Réservations Ciblées sur Objectifs Visés
Dans la modale de prise de rendez-vous de coaching, le champ de sélection de la certification concernée est automatiquement filtré selon les objectifs ciblés par l'apprenant. Si aucun objectif n'est visé, le sélecteur se désactive et affiche un message d'appel à l'action.

### 3.6 Modération Avancée & Signalement de Commentaires
Extension de la modération des publications (sujets) aux commentaires du forum :
*   **Schéma DB :** Création du modèle `SignalementCommentaire` lié aux tables `Commentaire` et `Utilisateur`.
*   **Interface Admin :** Intégration dans le tableau de bord Super Admin des signalements de commentaires de manière unifiée avec les sujets. Le modérateur peut instantanément inspecter, ignorer ou supprimer le commentaire incriminé en un clic.

---

## 4. Focus Technique & Implémentation du Code

### 4.1 Initialisation Synchrone du Rôle (Anti-Flicker)
Pour garantir une expérience utilisateur fluide lors de la bascule de rôle sans clignotement de la barre latérale, le layout Next.js effectue une extraction synchrone des rôles du token d'authentification :

```typescript
// Rôles et mode de vue initialisés de façon synchrone pour éviter le clignotement
const [userRoles, setUserRoles] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payloadBase64 = token.split('.')[1];
                const decodedPayload = JSON.parse(atob(payloadBase64));
                return decodedPayload.roles || [];
            } catch (e) {
                return [];
            }
        }
    }
    return [];
});

const [viewMode, setViewMode] = useState<'APPRENANT' | 'FORMATEUR'>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('viewMode');
        if (saved === 'FORMATEUR' || saved === 'APPRENANT') {
            return saved as 'APPRENANT' | 'FORMATEUR';
        }
    }
    return 'APPRENANT';
});
```

### 4.2 Modèle de Signalement de Commentaires (schema.prisma)
```prisma
model SignalementCommentaire {
  id            BigInt      @id @default(autoincrement())
  motif         String?
  dateCreation  DateTime    @default(now()) @map("date_creation")
  traite        Boolean     @default(false)

  // Relations
  commentaireId BigInt      @map("commentaire_id")
  commentaire   Commentaire @relation(fields: [commentaireId], references: [id], onDelete: Cascade)
  utilisateurId BigInt      @map("utilisateur_id")
  utilisateur   Utilisateur @relation(fields: [utilisateurId], references: [id], onDelete: Cascade)

  @@map("signalements_commentaires")
}
```

---

## 5. Guide d'Insertion des Captures d'Écran pour le Google Docs

> **🖼️ EMPLACEMENT CAPTURE D'ÉCRAN N°1 : DIAGRAMME DE CLASSES (UML)**
> *(Voir Section 2 ci-dessus pour les instructions détaillées).*

> **🖼️ EMPLACEMENT CAPTURE D'ÉCRAN N°2 : LA BASCULE DE VUE (DASHBOARD)**
> *   **Où l'insérer :** Section 3.1 (Espace Double Rôle).
> *   **Que capturer :** Ton écran du dashboard avec le Header ouvert affichant le bouton vert/indigo "Mode Formateur / Mode Apprenant". Fais une capture de la sidebar qui change de structure selon le mode sélectionné.
> *   **Légende suggérée :** *Figure 2 : Interface utilisateur avec interrupteur dynamique du mode d'affichage (Apprenant / Formateur).*

> **🖼️ EMPLACEMENT CAPTURE D'ÉCRAN N°3 : LE CALENDRIER FORMATEUR**
> *   **Où l'insérer :** Section 3.2 (Gestion des créneaux).
> *   **Que capturer :** La page `/dashboard/appointments` en mode Formateur affichant le calendrier des disponibilités, le formulaire de création de créneaux horaires, et la liste des rendez-vous planifiés avec les élèves.
> *   **Légende suggérée :** *Figure 3 : Calendrier interactif de gestion des disponibilités et suivi des séances de tutorat.*

> **🖼️ EMPLACEMENT CAPTURE D'ÉCRAN N°4 : PROFIL PUBLIC APPRENANT**
> *   **Où l'insérer :** Section 3.3 (Profils Publics).
> *   **Que capturer :** La page `/dashboard/profile/[id]` affichant un profil avec son bandeau de statistiques épuré (Discussions, Réponses, Likes), sa biographie, et ses cartes de certifications visées/obtenues stylisées en dégradés bleu et émeraude.
> *   **Légende suggérée :** *Figure 4 : Page de profil public d'un apprenant valorisant ses certifications cibles et validées.*

> **🖼️ EMPLACEMENT CAPTURE D'ÉCRAN N°5 : MODALE DE RÉSERVATION FILTRÉE**
> *   **Où l'insérer :** Section 3.5 (Réservations ciblées).
> *   **Que capturer :** La modale de réservation ouverte lorsqu'un élève clique sur un créneau disponible, montrant le champ "Certification concernée" affichant uniquement ses objectifs visés ou grisé s'il n'en a pas.
> *   **Légende suggérée :** *Figure 5 : Sélecteur de certification filtré selon les objectifs de l'apprenant pour la séance de coaching.*

> **🖼️ EMPLACEMENT CAPTURE D'ÉCRAN N°6 : MODÉRATION ADMIN (SIGNALEMENTS)**
> *   **Où l'insérer :** Section 3.6 (Signalement de Commentaires).
> *   **Que capturer :** L'espace de modération admin (`/admin/community`) montrant la liste des signalements en attente, dont un signalement étiqueté `[Commentaire]` affichant l'auteur, le motif, le contenu du commentaire et les options "Ignorer" / "Supprimer le commentaire".
> *   **Légende suggérée :** *Figure 6 : Tableau de bord de modération du Super Admin affichant les signalements de publications et de commentaires.*

---

## 6. Bilan, Taux d'Achèvement & Difficultés Rencontrées

### 6.1 Pourcentage Global d'Achèvement des Missions : 95%
Les objectifs principaux de développement full-stack fixés pour ce projet d'intégration ont été atteints et testés avec succès :
*   Modélisation de la base de données et migrations (100%)
*   Logique API backend & modération de commentaires/sujets sous NestJS (100%)
*   Interface utilisateur Next.js avec double rôle synchrone et filtres intelligents (95% - seuls les tests de charge et le déploiement en production restent à finaliser).

### 6.2 Difficultés Rencontrées & Solutions Apportées
*   **Effet de Clignotement au Rendu (Flicker UI) :** Lors du basculement entre le mode apprenant et le mode formateur, l'interface affichait brièvement la mauvaise barre latérale.
    *   *Solution :* Remplacement de l'initialisation asynchrone par une extraction synchrone des rôles du token JWT stocké au montage initial du composant.
*   **Collision d'Identifiants (Prisma auto-increment) :** Dans la page de modération unifiée du Super Admin, les tables `SignalementSujet` et `SignalementCommentaire` possédaient des IDs séquentiels identiques (ex: ID 1 pour un sujet et ID 1 pour un commentaire).
    *   *Solution :* Ajout d'un paramètre de requête `?type=COMMENTAIRE|SUJET` sur les routes de résolution et de suppression d'API pour aiguiller précisément la modification vers la bonne table PostgreSQL.
*   **Aiguillage et synchronisation des rôles obsolètes :** Erreurs d'accès ("Accès refusé") lorsque les formateurs cliquaient sur d'anciennes notifications redirigeant vers l'ancienne URL administrative `/admin/coaching`.
    *   *Solution :* Écriture d'un script de migration de base de données pour mettre à jour les anciens liens vers `/dashboard/appointments` et refonte dynamique des redirections lors des actions d'annulation.

### 6.3 Compétences Développées & Consolidées
Ce projet d'intégration sur **EthicalData** m'a permis de consolider plusieurs compétences fondamentales d'un développeur full-stack :
1.  **Gestion de Base de Données (PostgreSQL / Prisma) :** Modélisation de schémas complexes, relations multi-tables, migrations contrôlées et utilisation efficace de types JSON relationnels.
2.  **Architecture Modulaire Backend (NestJS) :** Structuration de modules découplés (Users, Forum, Appointments), sécurité avec gardes d'authentification et gardes de rôles personnalisés.
3.  **Routage & Cycle de Vie Frontend (Next.js 14+) :** Maîtrise du Next.js App Router, synchronisation fluide des états locaux avec le stockage persistant, et élimination des goulets d'étranglement de rendu.
