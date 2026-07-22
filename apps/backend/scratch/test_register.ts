import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'diag_test_' + Date.now() + '@ethicaldata.local';
  console.log('Testing registration for:', email);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('TestPass123!', salt);

  try {
    const rolesToConnect = ['APPRENANT'];
    const user = await prisma.utilisateur.create({
      data: {
        prenom: 'Test',
        nom: 'User',
        email: email,
        telephone: '+33600000000',
        motDePasse: hashedPassword,
        statut: 'ACTIF',
        roles: {
          connectOrCreate: rolesToConnect.map((roleNom) => ({
            where: { nom: roleNom },
            create: { nom: roleNom },
          })),
        },
      },
      include: {
        roles: true,
      },
    });
    console.log('User created successfully:', user.id, user.email, user.roles);
  } catch (err: any) {
    console.error('Prisma Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
