ALTER TABLE "categories_certifications" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';
ALTER TABLE "categories_certifications" ADD COLUMN "description" TEXT;
ALTER TABLE "categories_certifications" ADD COLUMN "image" TEXT;
ALTER TABLE "categories_certifications" ADD COLUMN "ordre" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "categories_certifications_slug_key" ON "categories_certifications"("slug");
