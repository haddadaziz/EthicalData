-- CreateEnum
CREATE TYPE "StatutInscription" AS ENUM ('INSCRIT', 'EN_COURS', 'VALIDE', 'ABANDON');

-- CreateTable
CREATE TABLE "inscriptions_certifications" (
    "id" BIGSERIAL NOT NULL,
    "statut" "StatutInscription" NOT NULL DEFAULT 'INSCRIT',
    "progression" INTEGER NOT NULL DEFAULT 0,
    "readiness_score" INTEGER,
    "date_inscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_validation" TIMESTAMP(3),
    "apprenant_id" BIGINT NOT NULL,
    "certification_id" BIGINT NOT NULL,

    CONSTRAINT "inscriptions_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inscriptions_certifications_apprenant_id_certification_id_key" ON "inscriptions_certifications"("apprenant_id", "certification_id");

-- AddForeignKey
ALTER TABLE "inscriptions_certifications" ADD CONSTRAINT "inscriptions_certifications_apprenant_id_fkey" FOREIGN KEY ("apprenant_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions_certifications" ADD CONSTRAINT "inscriptions_certifications_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
