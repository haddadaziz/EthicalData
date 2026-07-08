-- CreateTable
CREATE TABLE "inscriptions_cours" (
    "id" BIGSERIAL NOT NULL,
    "progression" INTEGER NOT NULL DEFAULT 0,
    "date_inscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMP(3),
    "cours_id" BIGINT NOT NULL,
    "apprenant_id" BIGINT NOT NULL,

    CONSTRAINT "inscriptions_cours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inscriptions_cours_cours_id_apprenant_id_key" ON "inscriptions_cours"("cours_id", "apprenant_id");

-- AddForeignKey
ALTER TABLE "inscriptions_cours" ADD CONSTRAINT "inscriptions_cours_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "cours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions_cours" ADD CONSTRAINT "inscriptions_cours_apprenant_id_fkey" FOREIGN KEY ("apprenant_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
