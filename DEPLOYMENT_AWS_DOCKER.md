# 🐳 Guide de Déploiement AWS / Docker - Ethical Data Security

Ce document explique comment déployer l'intégralité du projet **Ethical Data Security** sur une instance AWS (EC2, ECS, App Runner ou Lightsail) en utilisant **Docker Compose**.

---

## 🏗️ 1. Architecture du projet conteneurisé

L'application est découpée en 4 conteneurs indépendants orchestrés par `docker-compose.yml` :

1. **`postgres`** : Base de données relationnelle PostgreSQL 16 (Alpine).
2. **`pgadmin`** : Interface d'administration web de la base de données.
3. **`backend`** : API REST NestJS avec ORM Prisma (auto-migration & seed au démarrage).
4. **`frontend`** : Application web Next.js 16 (React 19 + Tailwind CSS).

---

## 📦 2. Fichiers nécessaires pour le déploiement

Votre ami doit simplement cloner le dépôt Git officiel :
```bash
git clone https://github.com/MNH-TECHNOLOGIE/ethical-data.git
cd ethical-data
git checkout dev # ou main pour la version de production
```

Tous les fichiers requis sont déjà inclus dans le dépôt :
- `docker-compose.yml` (Fichier d'orchestration)
- `apps/backend/Dockerfile` & `apps/frontend/Dockerfile` (Fichiers de construction d'images Docker)
- `.env.example` (Modèle de variables d'environnement à personnaliser)

---

## ⚡ 3. Étapes de lancement sur AWS (EC2 / Lightsail)

### Étape A : Préparer les variables d'environnement
À la racine du projet cloné sur le serveur AWS, créer le fichier `.env` à partir du modèle :
```bash
cp .env.example .env
```

Modifier les valeurs secrètes dans le fichier `.env` (mots de passe DB, JWT Secret, URL de domaine public) :
```env
POSTGRES_PASSWORD=VotreMotDePasseBaseDeDonneesSecurise
JWT_SECRET=VotreCleSecreteJWTSuperLongueEtSecurisee
FRONTEND_URL=https://votre-domaine-aws.com
NEXT_PUBLIC_API_URL=https://api.votre-domaine-aws.com
GEMINI_API_KEY=VotreCleAPIGemini
```

### Étape B : Lancer les conteneurs Docker
Exécuter la commande unique de build et de lancement en tâche de fond (*detached mode*) :
```bash
docker compose up --build -d
```

### Étape C : Vérifier l'état des conteneurs
```bash
docker compose ps
```

Pour consulter les logs du backend et s'assurer que Prisma a appliqué les migrations et inséré les données initiales (*seed*) :
```bash
docker compose logs -f backend
```

---

## 🌐 4. Ports & Configuration Réseau (AWS Security Groups)

Assurez-vous d'ouvrir les ports suivants dans les **Règles Inbound de votre Security Group AWS** :

| Port | Service | Description | Accessibilité |
| :--- | :--- | :--- | :--- |
| `80` / `443` | Nginx / Reverse Proxy | Accès web HTTPS public | Public (0.0.0.0/0) |
| `3001` | Frontend Next.js | Application Web | Public ou via Proxy |
| `3000` | Backend NestJS | API REST | Public ou via Proxy |
| `5050` | pgAdmin | Interface d'administration DB | Restreint (IP Admin) |
| `5433` (ou 5432) | PostgreSQL DB | Base de données | Interne / Restreint |

---

## 🔄 5. Mises à jour ultérieures (CI/CD / Déploiement continu)

Lorsque de nouvelles fonctionnalités sont poussées sur le dépôt Git, la mise à jour sur le serveur AWS se fait en 2 commandes :
```bash
git pull origin dev
docker compose up --build -d
```

---

*Projet prêt pour la production !*
