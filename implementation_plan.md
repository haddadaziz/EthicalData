# Plan d'Implémentation MVP - Ethical Data Platform

## Analyse des Écarts (Gap Analysis)

Après analyse du code source existant (Frontend Next.js et Backend NestJS + Prisma) et comparaison avec le Cahier des Charges, voici l'état des lieux :

**✅ Déjà implémenté ou bien entamé :**
- **Base de données & Schéma Prisma** : Excellent état. Les tables pour les utilisateurs, rôles, certifications, cours, ressources, simulations, rendez-vous et forum sont déjà définies de façon très complète.
- **Site public dynamique** : La landing page est en grande partie construite (Hero, Services, Contact, Avis, etc.) avec un design moderne et responsive.
- **Structure Backend** : Les différents modules métier (auth, users, certifications, simulations, etc.) sont instanciés dans NestJS.

**❌ Manquant ou nécessitant une implémentation majeure pour le MVP :**
- **Logique Métier & Intégration IA** : La correction intelligente par IA, l'analyse des lacunes, et le calcul du *Readiness Score* ne sont pas encore connectés.
- **Moteur de Simulation Frontend** : L'interface pour passer des tests chronométrés et voir ses résultats corrigés.
- **Espace Apprenant (Dashboard)** : Le tableau de bord nécessite d'être finalisé pour afficher la progression, l'accès aux ressources téléchargeables, et la réservation de rendez-vous.
- **Back-Office Administrateur** : Interface de gestion (CRUD) pour les contenus (certifications, banque de questions, utilisateurs).
- **Liaison API** : Connecter l'authentification (JWT) et finaliser la communication API entre le frontend et le backend.

---

## Plan d'Action MVP (Tâches à réaliser)

### 1. Finalisation de l'Authentification & Sécurité
- [ ] Connecter les pages `login` et `register` au backend NestJS.
- [ ] Mettre en place les guards/middlewares de vérification de rôles (Admin, Formateur, Apprenant).
- [ ] Implémenter le flux "Mot de passe oublié / Réinitialisation".

### 2. Catalogue et Fiches Certifications
- [ ] Développer la page Catalogue (`/certifications`) avec filtres par fournisseur, domaine et niveau.
- [ ] Créer la vue détaillée (`/certifications/[slug]`) affichant le programme, les prérequis, et permettant l'inscription.

### 3. Espace Apprenant (Dashboard & Progression)
- [ ] Créer la page d'accueil du Dashboard affichant la progression globale et le *Readiness Score*.
- [ ] Implémenter la "Bibliothèque" pour le téléchargement sécurisé des supports (PDF, slides).
- [ ] Développer l'historique des résultats de simulations et le suivi des compétences.

### 4. Moteur de Tests & Simulations (Cœur du MVP)
- [ ] Développer l'interface de passage de quiz sur Next.js (gestion du chronomètre, affichage des questions).
- [ ] Intégrer l'IA dans le backend pour :
  - Corriger automatiquement les réponses (avec grille d'évaluation).
  - Générer des explications pédagogiques personnalisées.
  - Établir un plan de révision.
- [ ] Calculer dynamiquement le statut ("Non prêt", "À renforcer", "Prêt") selon le *Readiness Score*.

### 5. Module de Prise de Rendez-vous
- [ ] Interface formateur pour gérer son calendrier et ses disponibilités.
- [ ] Interface apprenant pour choisir un motif (ex: audit de niveau) et réserver un créneau avec un expert.
- [ ] Configuration des emails transactionnels de confirmation (Rappels).

### 6. Back-Office Administrateur & Formateur
- [ ] Créer une zone d'administration sécurisée pour :
  - Gérer les comptes utilisateurs et leurs accès.
  - Ajouter/Modifier les certifications, les modules de cours et uploader les ressources.
  - Gérer la banque de questions pour les simulations.

### 7. Communauté (MVP)
- [ ] Développer un module forum simple au sein du dashboard (Sujets par thème, réponses).

---

## Open Questions

> [!IMPORTANT]
> **Choix du fournisseur IA** : Avez-vous déjà une clé API (ex: OpenAI GPT-4, Azure OpenAI) à disposition pour développer le module de correction intelligente, ou devrons-nous utiliser un "mock" (fausses données) pour simuler la correction dans un premier temps ?

> [!WARNING]
> **Paiement et monétisation** : Le MVP demande-t-il l'intégration d'un système de paiement comme Stripe (pour l'achat d'abonnements ou de certifications), ou les accès seront-ils débloqués manuellement par l'admin pour le lancement ? (Le cahier des charges met le paiement en V2).

> [!TIP]
> **Back-office** : Préférez-vous que le panel d'administration soit développé sur mesure dans l'application, ou souhaitez-vous utiliser un outil de génération rapide de dashboard admin pour gagner du temps de développement ?
