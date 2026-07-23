/*
  Warnings:

  - You are about to drop the column `logo` on the `fournisseurs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "fournisseurs" DROP COLUMN "logo",
ADD COLUMN     "image" TEXT;

-- CreateTable
CREATE TABLE "questions" (
    "id" BIGSERIAL NOT NULL,
    "enonce" TEXT NOT NULL,
    "explication" TEXT,
    "reponseCorrecte" TEXT NOT NULL,
    "categorie" TEXT,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificationId" BIGINT NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options" (
    "id" BIGSERIAL NOT NULL,
    "lettre" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "questionId" BIGINT NOT NULL,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tentatives" (
    "id" BIGSERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "datePassage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateurId" BIGINT NOT NULL,
    "certificationId" BIGINT NOT NULL,

    CONSTRAINT "tentatives_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tentatives" ADD CONSTRAINT "tentatives_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tentatives" ADD CONSTRAINT "tentatives_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
