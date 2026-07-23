# Étape 1 : Build de l'application
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de configuration et des schémas
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances (y compris devDependencies pour le compilateur NestJS)
RUN npm install

# Copie du reste des sources
COPY . .

# Génération du client Prisma et compilation du code NestJS
RUN npx prisma generate
RUN npm run build

# Étape 2 : Image d'exécution en production
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Installation uniquement des dépendances de production
RUN npm install --omit=dev

# Régénération du client Prisma pour l'environnement de production
RUN npx prisma generate

# Copie des fichiers compilés depuis l'étape de build
COPY --from=builder /app/dist ./dist

# Port sur lequel le backend écoute
EXPOSE 3000

# Commande de démarrage
CMD ["sh", "-c", "npm run start:prod"]
