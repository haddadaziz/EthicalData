-- CreateEnum
CREATE TYPE "Statut" AS ENUM ('ACTIF', 'INACTIF', 'BANNI');

-- CreateEnum
CREATE TYPE "Niveau" AS ENUM ('DEBUTANT', 'INTERMEDIAIRE', 'AVANCE');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" BIGSERIAL NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "motDePasse" TEXT NOT NULL,
    "statut" "Statut" NOT NULL DEFAULT 'ACTIF',
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "avatar" TEXT,
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" BIGSERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,

    CONSTRAINT "fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" BIGSERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "codeExamen" TEXT,
    "description" TEXT NOT NULL,
    "niveau" "Niveau" NOT NULL,
    "dureeIndicative" TEXT,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "fournisseurId" BIGINT NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" BIGSERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificationId" BIGINT NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ressources" (
    "id" BIGSERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "taille" INTEGER,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "quotaTelechargement" INTEGER DEFAULT 10,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "certificationId" BIGINT,

    CONSTRAINT "ressources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telechargements" (
    "id" BIGSERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "ressourceId" BIGINT NOT NULL,
    "utilisateurId" BIGINT NOT NULL,

    CONSTRAINT "telechargements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UtilisateurRoles" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL,

    CONSTRAINT "_UtilisateurRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nom_key" ON "roles"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "fournisseurs_nom_key" ON "fournisseurs"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "fournisseurs_slug_key" ON "fournisseurs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_slug_key" ON "certifications"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_codeExamen_key" ON "certifications"("codeExamen");

-- CreateIndex
CREATE INDEX "_UtilisateurRoles_B_index" ON "_UtilisateurRoles"("B");

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ressources" ADD CONSTRAINT "ressources_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "certifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telechargements" ADD CONSTRAINT "telechargements_ressourceId_fkey" FOREIGN KEY ("ressourceId") REFERENCES "ressources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telechargements" ADD CONSTRAINT "telechargements_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UtilisateurRoles" ADD CONSTRAINT "_UtilisateurRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UtilisateurRoles" ADD CONSTRAINT "_UtilisateurRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
