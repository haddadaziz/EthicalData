-- DropForeignKey
ALTER TABLE "cours" DROP CONSTRAINT "cours_certification_id_fkey";

-- AlterTable
ALTER TABLE "cours" ALTER COLUMN "certification_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
