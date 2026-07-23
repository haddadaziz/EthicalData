-- CreateTable
CREATE TABLE "sujets" (
    "id" BIGSERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "auteurId" BIGINT NOT NULL,
    "certificationId" BIGINT,

    CONSTRAINT "sujets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commentaires" (
    "id" BIGSERIAL NOT NULL,
    "contenu" TEXT NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "sujetId" BIGINT NOT NULL,
    "auteurId" BIGINT NOT NULL,

    CONSTRAINT "commentaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes_sujets" (
    "id" BIGSERIAL NOT NULL,
    "dateLike" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sujetId" BIGINT NOT NULL,
    "utilisateurId" BIGINT NOT NULL,

    CONSTRAINT "likes_sujets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signalements_sujets" (
    "id" BIGSERIAL NOT NULL,
    "motif" TEXT,
    "dateCreation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traite" BOOLEAN NOT NULL DEFAULT false,
    "sujetId" BIGINT NOT NULL,
    "utilisateurId" BIGINT NOT NULL,

    CONSTRAINT "signalements_sujets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "likes_sujets_sujetId_utilisateurId_key" ON "likes_sujets"("sujetId", "utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "signalements_sujets_sujetId_utilisateurId_key" ON "signalements_sujets"("sujetId", "utilisateurId");

-- AddForeignKey
ALTER TABLE "sujets" ADD CONSTRAINT "sujets_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sujets" ADD CONSTRAINT "sujets_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "certifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaires" ADD CONSTRAINT "commentaires_sujetId_fkey" FOREIGN KEY ("sujetId") REFERENCES "sujets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaires" ADD CONSTRAINT "commentaires_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes_sujets" ADD CONSTRAINT "likes_sujets_sujetId_fkey" FOREIGN KEY ("sujetId") REFERENCES "sujets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes_sujets" ADD CONSTRAINT "likes_sujets_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements_sujets" ADD CONSTRAINT "signalements_sujets_sujetId_fkey" FOREIGN KEY ("sujetId") REFERENCES "sujets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements_sujets" ADD CONSTRAINT "signalements_sujets_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
