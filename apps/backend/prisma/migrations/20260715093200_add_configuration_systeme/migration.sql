-- CreateTable
CREATE TABLE "configuration_systeme" (
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuration_systeme_pkey" PRIMARY KEY ("cle")
);
