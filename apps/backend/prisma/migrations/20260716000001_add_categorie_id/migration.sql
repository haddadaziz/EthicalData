ALTER TABLE "certifications" ADD COLUMN "categorieId" BIGINT;

ALTER TABLE "certifications" ADD CONSTRAINT "certifications_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "categories_certifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "certifications_categorieId_idx" ON "certifications"("categorieId");
