# Étape 1 : Build de l'application
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers package.json et lock
COPY package*.json ./

# Installation propre des dépendances
RUN npm install

# Copie des sources
COPY . .

# Argument de build pour l'URL de l'API (nécessaire au build Next.js)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build de l'application Next.js
RUN npm run build

# Étape 2 : Image d'exécution
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Installation des dépendances de production
RUN npm install --omit=dev

# Copie des fichiers compilés depuis le builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Exposition du port du frontend (3001)
EXPOSE 3001

# Lancement de Next.js en production
CMD ["npm", "run", "start"]
