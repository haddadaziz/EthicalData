const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const sujet = await prisma.sujet.findFirst();
  const commAuthor = await prisma.utilisateur.findFirst({ where: { prenom: 'TestUser' } }) || await prisma.utilisateur.findFirst();
  
  if (sujet) {
    const parentComm = await prisma.commentaire.create({
      data: {
        contenu: "Parent test comment",
        sujetId: sujet.id,
        auteurId: commAuthor.id
      }
    });
    console.log("Parent created", parentComm.id);
  }
}
main().finally(() => prisma.$disconnect());
