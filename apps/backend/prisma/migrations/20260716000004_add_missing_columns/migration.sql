ALTER TABLE "ressources" ADD COLUMN "cours_id" BIGINT;

CREATE INDEX "ressources_cours_id_idx" ON "ressources"("cours_id");

ALTER TABLE "ressources" ADD CONSTRAINT "ressources_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "cours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "contact_messages" (
    "id" BIGSERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sujet" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);
