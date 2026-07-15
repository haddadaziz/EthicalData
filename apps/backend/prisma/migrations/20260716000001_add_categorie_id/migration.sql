CREATE TABLE "categories_certifications" (
    "id" BIGSERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categories_certifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categories_certifications_slug_key" ON "categories_certifications"("slug");

ALTER TABLE "certifications" ADD COLUMN "categorieId" BIGINT;

ALTER TABLE "certifications" ADD CONSTRAINT "certifications_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "categories_certifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "certifications_categorieId_idx" ON "certifications"("categorieId");
