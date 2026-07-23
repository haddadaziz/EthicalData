-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "grilleNotation" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'QCM';
