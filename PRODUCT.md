# Ethical Data Security — Product Context

## Vision
Plateforme e-learning spécialisée dans la préparation aux certifications Cloud & Cybersécurité (Microsoft Azure, AWS, CompTIA, Google Cloud). Offre des cours structurés, des examens blancs interactifs et un coaching personnalisé.

## Utilisateurs

### Apprenant
- Étudiant ou professionnel IT cherchant à se certifier
- Veut un parcours clair : cours → ressources → examens blancs → certification
- Suit sa progression, télécharge des ressources, passe des simulations
- Accède à son historique de téléchargements et ses quotas

### Formateur
- Crée et gère des cours, ressources et simulations
- Suit les inscriptions et la progression des apprenants

### Super Admin / Admin
- Gère l'intégralité de la plateforme : utilisateurs, rôles, certifications, cours, ressources, simulations
- Accède à l'historique global des téléchargements avec logs (IP, date, utilisateur)
- Configure les quotas et règles anti-partage

## Marque
- Tone : professionnel, moderne, technique, sécurisé
- Couleurs : bleu (#2563eb) comme primaire, rouge (#dc2626) pour les CTAs landing, slate (#0f172a) comme neutre sombre
- Typographie : Poppins (google font) en uppercase tracking-wider pour les éléments de navigation
- Iconographie : Font Awesome (solid) — cohérente sur toute la plateforme

## Principes de conception
1. **Hiérarchie visuelle claire** — titres en font-black, uppercase; corps en font-semibold
2. **Consistance des composants** — mêmes classes de base pour cartes, boutons, inputs partout
3. **Feedback immédiat** — hover/scale sur les interactifs, toast pour les actions
4. **Mobile d'abord** — grilles responsive (sm/md/lg/xl), menus hamburger, dropdowns adaptatifs
5. **Sécurité** — authentification par cookies httpOnly, logs de téléchargement, quota et anti-partage
