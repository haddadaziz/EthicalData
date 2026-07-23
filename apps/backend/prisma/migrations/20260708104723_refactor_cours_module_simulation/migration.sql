/*
  Warnings:

  - You are about to drop the column `certificationId` on the `modules` table. All the data in the column will be lost.
  - You are about to drop the column `certificationId` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `certificationId` on the `ressources` table. All the data in the column will be lost.
  - You are about to drop the column `certificationId` on the `tentatives` table. All the data in the column will be lost.
  - You are about to drop the column `utilisateurId` on the `tentatives` table. All the data in the column will be lost.
  - Added the required column `cours_id` to the `modules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `certification_id` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `ressources` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `simulation_id` to the `tentatives` table without a default value. This is not possible if the table is not empty.
  - Added the required column `utilisateur_id` to the `tentatives` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatutCours" AS ENUM ('BROUILLON', 'PUBLIE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "TypeRessource" AS ENUM ('PDF', 'VIDEO', 'SLIDE', 'DATASET', 'LIEN_EXTERNE', 'EXERCICE', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeRendezVous" AS ENUM ('ORIENTATION', 'COACHING_TECHNIQUE', 'PREPARATION_EXAMEN', 'BILAN_CARRIERE');

-- CreateEnum
CREATE TYPE "StatutRendezVous" AS ENUM ('CONFIRME', 'ANNULE', 'TERMINE');

-- DropForeignKey
ALTER TABLE "modules" DROP CONSTRAINT "modules_certificationId_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_certificationId_fkey";

-- DropForeignKey
ALTER TABLE "ressources" DROP CONSTRAINT "ressources_certificationId_fkey";

-- DropForeignKey
ALTER TABLE "tentatives" DROP CONSTRAINT "tentatives_certificationId_fkey";

-- DropForeignKey
ALTER TABLE "tentatives" DROP CONSTRAINT "tentatives_utilisateurId_fkey";

-- AlterTable
ALTER TABLE "commentaires" ADD COLUMN     "parent_commentaire_id" BIGINT;

-- AlterTable
ALTER TABLE "modules" DROP COLUMN "certificationId",
ADD COLUMN     "cours_id" BIGINT NOT NULL,
ADD COLUMN     "dureeEstimee" INTEGER DEFAULT 30,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "certificationId",
ADD COLUMN     "certification_id" BIGINT NOT NULL,
ADD COLUMN     "difficulte" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "simulation_id" BIGINT;

-- AlterTable
ALTER TABLE "ressources" DROP COLUMN "certificationId",
ADD COLUMN     "certification_id" BIGINT,
ADD COLUMN     "module_id" BIGINT,
ADD COLUMN     "ordre" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "type",
ADD COLUMN     "type" "TypeRessource" NOT NULL;

-- AlterTable
ALTER TABLE "tentatives" DROP COLUMN "certificationId",
DROP COLUMN "utilisateurId",
ADD COLUMN     "dureePassage" INTEGER,
ADD COLUMN     "simulation_id" BIGINT NOT NULL,
ADD COLUMN     "utilisateur_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "bio" TEXT;

-- CreateTable
CREATE TABLE "cours" (
    "id" BIGSERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "statut" "StatutCours" NOT NULL DEFAULT 'BROUILLON',
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "objectifs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prerequis" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publicCible" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dureeEstimee" INTEGER,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datePublication" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "formateur_id" BIGINT NOT NULL,
    "certification_id" BIGINT NOT NULL,

    CONSTRAINT "cours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulations" (
    "id" BIGSERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "duree" INTEGER NOT NULL DEFAULT 60,
    "scoreMinimal" INTEGER NOT NULL DEFAULT 700,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cours_id" BIGINT,
    "certification_id" BIGINT NOT NULL,

    CONSTRAINT "simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes_commentaires" (
    "id" BIGSERIAL NOT NULL,
    "dateLike" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commentaire_id" BIGINT NOT NULL,
    "utilisateur_id" BIGINT NOT NULL,

    CONSTRAINT "likes_commentaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signalements_commentaires" (
    "id" BIGSERIAL NOT NULL,
    "motif" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traite" BOOLEAN NOT NULL DEFAULT false,
    "commentaire_id" BIGINT NOT NULL,
    "utilisateur_id" BIGINT NOT NULL,

    CONSTRAINT "signalements_commentaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "destinataire_id" BIGINT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lien" TEXT,
    "lue" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creneaux_disponibilite" (
    "id" BIGSERIAL NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "est_reserve" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formateur_id" BIGINT NOT NULL,

    CONSTRAINT "creneaux_disponibilite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rendez_vous" (
    "id" BIGSERIAL NOT NULL,
    "type" "TypeRendezVous" NOT NULL DEFAULT 'COACHING_TECHNIQUE',
    "motif" TEXT,
    "notes" TEXT,
    "statut" "StatutRendezVous" NOT NULL DEFAULT 'CONFIRME',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidat_id" BIGINT NOT NULL,
    "formateur_id" BIGINT NOT NULL,
    "creneau_id" BIGINT NOT NULL,

    CONSTRAINT "rendez_vous_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cours_slug_key" ON "cours"("slug");

-- CreateIndex
CREATE INDEX "cours_certification_id_statut_idx" ON "cours"("certification_id", "statut");

-- CreateIndex
CREATE INDEX "cours_formateur_id_statut_idx" ON "cours"("formateur_id", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "likes_commentaires_commentaire_id_utilisateur_id_key" ON "likes_commentaires"("commentaire_id", "utilisateur_id");

-- CreateIndex
CREATE UNIQUE INDEX "signalements_commentaires_commentaire_id_utilisateur_id_key" ON "signalements_commentaires"("commentaire_id", "utilisateur_id");

-- CreateIndex
CREATE INDEX "notifications_destinataire_id_lue_idx" ON "notifications"("destinataire_id", "lue");

-- CreateIndex
CREATE INDEX "creneaux_disponibilite_formateur_id_est_reserve_idx" ON "creneaux_disponibilite"("formateur_id", "est_reserve");

-- CreateIndex
CREATE UNIQUE INDEX "rendez_vous_creneau_id_key" ON "rendez_vous"("creneau_id");

-- CreateIndex
CREATE INDEX "certifications_fournisseurId_deleted_at_idx" ON "certifications"("fournisseurId", "deleted_at");

-- CreateIndex
CREATE INDEX "commentaires_sujetId_dateCreation_idx" ON "commentaires"("sujetId", "dateCreation");

-- CreateIndex
CREATE INDEX "modules_cours_id_ordre_idx" ON "modules"("cours_id", "ordre");

-- CreateIndex
CREATE INDEX "ressources_module_id_idx" ON "ressources"("module_id");

-- CreateIndex
CREATE INDEX "ressources_certification_id_idx" ON "ressources"("certification_id");

-- CreateIndex
CREATE INDEX "tentatives_utilisateur_id_simulation_id_idx" ON "tentatives"("utilisateur_id", "simulation_id");

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_formateur_id_fkey" FOREIGN KEY ("formateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "cours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ressources" ADD CONSTRAINT "ressources_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ressources" ADD CONSTRAINT "ressources_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "simulations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "cours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tentatives" ADD CONSTRAINT "tentatives_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tentatives" ADD CONSTRAINT "tentatives_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaires" ADD CONSTRAINT "commentaires_parent_commentaire_id_fkey" FOREIGN KEY ("parent_commentaire_id") REFERENCES "commentaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes_commentaires" ADD CONSTRAINT "likes_commentaires_commentaire_id_fkey" FOREIGN KEY ("commentaire_id") REFERENCES "commentaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes_commentaires" ADD CONSTRAINT "likes_commentaires_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements_commentaires" ADD CONSTRAINT "signalements_commentaires_commentaire_id_fkey" FOREIGN KEY ("commentaire_id") REFERENCES "commentaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements_commentaires" ADD CONSTRAINT "signalements_commentaires_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_destinataire_id_fkey" FOREIGN KEY ("destinataire_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creneaux_disponibilite" ADD CONSTRAINT "creneaux_disponibilite_formateur_id_fkey" FOREIGN KEY ("formateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_candidat_id_fkey" FOREIGN KEY ("candidat_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_formateur_id_fkey" FOREIGN KEY ("formateur_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_creneau_id_fkey" FOREIGN KEY ("creneau_id") REFERENCES "creneaux_disponibilite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
