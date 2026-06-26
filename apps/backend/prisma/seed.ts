import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding...');

  const roles = ['SUPER_ADMIN','ADMIN','FORMATEUR', 'APPRENANT'];
  const createdRoles = [];

  for (const r of roles) {
    const role = await prisma.role.upsert({
      where: { nom: r },
      update: {},
      create: { nom: r },
    });
    createdRoles.push(role);
    console.log(`Rôle '${r}' vérifié/créé.`);
  }

  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@ethicaldata.local';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin_password_secure_2026';

  // Vérifier si le compte administrateur par défaut existe déjà
  const existingAdmin = await prisma.utilisateur.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const superAdminRole = createdRoles.find((role) => role.nom === 'SUPER_ADMIN');

    if (!superAdminRole) {
      throw new Error("Le rôle SUPER_ADMIN n'a pas été trouvé lors de la création de l'admin.");
    }

    await prisma.utilisateur.create({
      data: {
        prenom: 'Super',
        nom: 'Admin',
        email: adminEmail,
        telephone: null,
        motDePasse: hashedPassword,
        statut: 'ACTIF',
        roles: {
          connect: { id: superAdminRole.id },
        },
      },
    });

    console.log(`Utilisateur Super Admin créé avec l'e-mail : ${adminEmail}`);
  } else {
    console.log("L'utilisateur Super Admin existe déjà.");
  }

  console.log('Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });