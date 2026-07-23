-- AlterTable
ALTER TABLE "commentaires" ADD COLUMN     "mention_user_id" BIGINT;

-- AddForeignKey
ALTER TABLE "commentaires" ADD CONSTRAINT "commentaires_mention_user_id_fkey" FOREIGN KEY ("mention_user_id") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
