import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Début du seeding...');

    const roles = ['SUPER_ADMIN', 'ADMIN', 'FORMATEUR', 'APPRENANT'];
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

    // Création de l'utilisateur Super Admin par défaut
    const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@ethicaldata.local';
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin_password_secure_2026';

    const existingAdmin = await prisma.utilisateur.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        const superAdminRole = createdRoles.find((role) => role.nom === 'SUPER_ADMIN');

        if (!superAdminRole) {
            throw new Error("Le rôle SUPER_ADMIN n'a pas été trouvé lors de la création du super admin.");
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

    const fournisseursData = [
        { nom: 'Microsoft', slug: 'microsoft', image: '/logos/microsoft.svg' },
        { nom: 'AWS', slug: 'aws', image: '/logos/aws.svg' },
        { nom: 'Google Cloud', slug: 'google-cloud', image: '/logos/gcp.svg' },
        { nom: 'Cisco', slug: 'cisco', image: '/logos/cisco.svg' },
    ];

    const createdFournisseurs = [];
    for (const f of fournisseursData) {
        const fournisseur = await prisma.fournisseur.upsert({
            where: { nom: f.nom },
            update: { image: f.image },
            create: f,
        });
        createdFournisseurs.push(fournisseur);
        console.log(`Fournisseur '${f.nom}' créé/vérifié.`);
    }

    const microsoft = createdFournisseurs.find(f => f.nom === 'Microsoft');
    if (microsoft) {
        const az900 = await prisma.certification.upsert({
            where: { slug: 'microsoft-azure-fundamentals-az900' },
            update: { image: '/certifications/az900.svg', deletedAt: null },
            create: {
                nom: 'Microsoft Azure Fundamentals (AZ-900)',
                slug: 'microsoft-azure-fundamentals-az900',
                codeExamen: 'AZ-900',
                description: 'Cette certification valide vos connaissances fondamentales sur les concepts du cloud, les services Azure, la sécurité, la confidentialité, la conformité et les tarifs Azure.',
                niveau: 'DEBUTANT',
                dureeIndicative: '15 heures',
                image: '/certifications/az900.svg',
                fournisseurId: microsoft.id,
            }
        });
        console.log(`Certification 'AZ-900' créée.`);

        // Nettoyer d'anciens modules de test s'il y en a pour éviter les doublons à la reexecution
        await prisma.module.deleteMany({ where: { certificationId: az900.id } });

        // Modules pour AZ-900
        const modulesAz900 = [
            { titre: 'Module 1 : Décrire les concepts du Cloud', ordre: 1 },
            { titre: 'Module 2 : Décrire l\'architecture et les services Azure', ordre: 2 },
            { titre: 'Module 3 : Décrire la gestion et la gouvernance d\'Azure', ordre: 3 },
        ];
        for (const m of modulesAz900) {
            await prisma.module.create({
                data: {
                    titre: m.titre,
                    ordre: m.ordre,
                    certificationId: az900.id,
                }
            });
        }
        console.log(`Modules pour AZ-900 créés.`);

        // Nettoyer d'anciennes ressources de test pour éviter les doublons
        await prisma.ressource.deleteMany({ where: { certificationId: az900.id } });

        // Ressources pour AZ-900
        const ressourcesAz900 = [
            { titre: 'Guide de préparation officiel AZ-900', type: 'PDF', url: '/prep-guides/az900-official.pdf', public: true },
            { titre: 'Slides du cours Fundamentals', type: 'SLIDES', url: '/slides/az900-slides.pdf', public: false },
            { titre: 'Exemples de questions d\'examen', type: 'PDF', url: '/quizzes/az900-sample-questions.pdf', public: false },
        ];
        for (const r of ressourcesAz900) {
            await prisma.ressource.create({
                data: {
                    titre: r.titre,
                    type: r.type,
                    url: r.url,
                    public: r.public,
                    certificationId: az900.id,
                }
            });
        }
        console.log(`Ressources pour AZ-900 créées.`);

        // Certification 2: AZ-104
        await prisma.certification.upsert({
            where: { slug: 'microsoft-azure-administrator-az104' },
            update: { image: '/certifications/az104.svg', deletedAt: null }, // <--- Ajouter "deletedAt: null" ici
            create: {
                nom: 'Microsoft Azure Administrator (AZ-104)',
                slug: 'microsoft-azure-administrator-az104',
                codeExamen: 'AZ-104',
                description: 'Cette certification valide vos compétences dans l\'implémentation, la gestion et la surveillance des identités, de la gouvernance, du stockage, du calcul et des réseaux virtuels dans Azure.',
                niveau: 'INTERMEDIAIRE',
                dureeIndicative: '40 heures',
                image: '/certifications/az104.svg',
                fournisseurId: microsoft.id,
            }
        });
        console.log(`Certification 'AZ-104' créée.`);
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