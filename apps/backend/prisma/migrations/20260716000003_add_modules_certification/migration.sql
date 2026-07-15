CREATE TABLE "modules_certification" (
    "id" BIGSERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "certificationId" BIGINT NOT NULL,
    "parentId" BIGINT,

    CONSTRAINT "modules_certification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "modules_certification_certificationId_ordre_idx" ON "modules_certification"("certificationId", "ordre");
CREATE INDEX "modules_certification_parentId_idx" ON "modules_certification"("parentId");

ALTER TABLE "modules_certification" ADD CONSTRAINT "modules_certification_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "modules_certification" ADD CONSTRAINT "modules_certification_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "modules_certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
