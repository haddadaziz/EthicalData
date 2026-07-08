-- CreateTable
CREATE TABLE "progressions_modules" (
    "id" BIGSERIAL NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "dateCompletion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inscription_cours_id" BIGINT NOT NULL,
    "module_id" BIGINT NOT NULL,

    CONSTRAINT "progressions_modules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "progressions_modules_inscription_cours_id_module_id_key" ON "progressions_modules"("inscription_cours_id", "module_id");

-- AddForeignKey
ALTER TABLE "progressions_modules" ADD CONSTRAINT "progressions_modules_inscription_cours_id_fkey" FOREIGN KEY ("inscription_cours_id") REFERENCES "inscriptions_cours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progressions_modules" ADD CONSTRAINT "progressions_modules_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
