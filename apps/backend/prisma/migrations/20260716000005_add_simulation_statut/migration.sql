CREATE TYPE "StatutSimulation" AS ENUM ('BROUILLON', 'PUBLIE');

ALTER TABLE "simulations" ADD COLUMN "statut" "StatutSimulation" NOT NULL DEFAULT 'BROUILLON';
