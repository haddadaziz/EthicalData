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

    // Paramètres administratifs
    const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@ethicaldata.local';
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin_password_secure_2026';

    // Nettoyage des anciens utilisateurs pour éviter les conflits
    console.log('Nettoyage des anciens utilisateurs...');
    await prisma.utilisateur.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    const superAdminRole = createdRoles.find((role) => role.nom === 'SUPER_ADMIN');
    const adminRole = createdRoles.find((role) => role.nom === 'ADMIN');
    const formateurRole = createdRoles.find((role) => role.nom === 'FORMATEUR');
    const apprenantRole = createdRoles.find((role) => role.nom === 'APPRENANT');

    if (!superAdminRole || !adminRole || !formateurRole || !apprenantRole) {
        throw new Error("Un ou plusieurs rôles n'ont pas été trouvés lors du seed.");
    }

    // Création du Super Admin principal
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
    console.log(`Utilisateur Super Admin principal créé.`);

    // Générer 20 utilisateurs de test supplémentaires
    const statuts = ['ACTIF', 'INACTIF', 'BANNI'] as const;
    const prenomsTest = ['Aziz', 'Karim', 'Sarah', 'Leila', 'Thomas', 'Yassine', 'Sofia', 'Omar', 'Lucas', 'Emma'];
    const nomsTest = ['Haddad', 'El Amrani', 'Benjelloun', 'Rami', 'Dupont', 'Alaoui', 'Mansouri', 'Tazi', 'Martin', 'Bernard'];

    console.log('Génération de 20 utilisateurs de test...');
    for (let i = 1; i <= 20; i++) {
        const prenomUser = prenomsTest[(i - 1) % prenomsTest.length];
        const nomUser = nomsTest[(i - 1) % nomsTest.length];
        const emailUser = `${prenomUser.toLowerCase()}.${nomUser.toLowerCase()}.${i}@ethicaldata.local`;
        const statutUser = statuts[(i - 1) % statuts.length];

        // Assigner des rôles variés
        let roleToConnect = apprenantRole;
        if (i % 5 === 0) roleToConnect = formateurRole;
        else if (i % 9 === 0) roleToConnect = adminRole;

        await prisma.utilisateur.create({
            data: {
                prenom: prenomUser,
                nom: nomUser,
                email: emailUser,
                telephone: `+212 6 12 34 56 ${i < 10 ? '0' + i : i}`,
                motDePasse: hashedPassword, // même mot de passe d'administration pour les tests
                statut: statutUser,
                roles: {
                    connect: { id: roleToConnect.id }
                }
            }
        });
    }
    console.log('20 utilisateurs de test créés avec succès.');

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
    const aws = createdFournisseurs.find(f => f.nom === 'AWS');
    const gcp = createdFournisseurs.find(f => f.nom === 'Google Cloud');
    const cisco = createdFournisseurs.find(f => f.nom === 'Cisco');

    const levels = ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'] as const;

    // Nettoyer toutes les anciennes certifications pour éviter les conflits de contrainte unique
    console.log('Nettoyage des anciennes certifications...');
    await prisma.certification.deleteMany({});

    // 1. Création de AZ-900 réelle avec ses questions de test
    if (microsoft) {
        const az900 = await prisma.certification.create({
            data: {
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

        const modulesAz900 = [
            { titre: 'Module 1 : Décrire les concepts du Cloud', ordre: 1 },
            { titre: 'Module 2 : Décrire l\'architecture et les services Azure', ordre: 2 },
            { titre: 'Module 3 : Décrire la gestion et la gouvernance d\'Azure', ordre: 3 },
        ];
        for (const m of modulesAz900) {
            await prisma.module.create({
                data: { titre: m.titre, ordre: m.ordre, certificationId: az900.id }
            });
        }

        const ressourcesAz900 = [
            { titre: 'Guide de préparation officiel AZ-900', type: 'PDF', url: '/prep-guides/az900-official.pdf', public: true },
            { titre: 'Slides du cours Fundamentals', type: 'SLIDES', url: '/slides/az900-slides.pdf', public: false },
        ];
        for (const r of ressourcesAz900) {
            await prisma.ressource.create({
                data: { titre: r.titre, type: r.type, url: r.url, public: r.public, certificationId: az900.id }
            });
        }

        const questionsAz900 = [
            {
                enonce: "Quel service Azure permet de centraliser la gestion des identités, d'activer le Single Sign-On (SSO) et d'appliquer l'authentification multifacteur (MFA) ?",
                explication: "Microsoft Entra ID est la solution cloud de gestion des identités et des accès d'Azure. Elle gère le SSO, le MFA, et les accès conditionnels.",
                reponseCorrecte: "B",
                categorie: "Identité & IAM",
                options: [
                    { lettre: "A", texte: "Azure Key Vault" },
                    { lettre: "B", texte: "Microsoft Entra ID (anciennement Azure Active Directory)" },
                    { lettre: "C", texte: "Azure Bastion" },
                    { lettre: "D", texte: "Azure Policy" }
                ]
            }
        ];
        for (const q of questionsAz900) {
            await prisma.question.create({
                data: {
                    enonce: q.enonce,
                    explication: q.explication,
                    reponseCorrecte: q.reponseCorrecte,
                    categorie: q.categorie,
                    certificationId: az900.id,
                    options: { create: q.options }
                }
            });
        }
    }

    // 2. Génération automatique de certifications supplémentaires
    const testProviders = [
        { provider: microsoft, prefix: 'AZ', name: 'Microsoft Azure' },
        { provider: aws, prefix: 'AWS', name: 'AWS Cloud' },
        { provider: gcp, prefix: 'GCP', name: 'Google Cloud' },
        { provider: cisco, prefix: 'CC', name: 'Cisco Networks' }
    ];

    console.log('Génération de certifications de test supplémentaires...');
    for (const p of testProviders) {
        if (!p.provider) continue;

        for (let i = 1; i <= 9; i++) {
            const niveau = levels[(i - 1) % 3];
            const codeExamen = `${p.prefix}-${100 + i * 10}`;
            const slug = `${p.provider.slug}-${codeExamen.toLowerCase()}`;

            // Éviter de recréer l'AZ-900
            if (codeExamen === 'AZ-900') continue;

            await prisma.certification.create({
                data: {
                    nom: `${p.name} ${niveau === 'DEBUTANT' ? 'Fundamentals' : niveau === 'INTERMEDIAIRE' ? 'Administrator' : 'Solutions Architect'} (${codeExamen})`,
                    slug: slug,
                    codeExamen: codeExamen,
                    description: `Cette formation et certification valide vos compétences de niveau ${niveau.toLowerCase()} sur l'environnement de solutions ${p.name}.`,
                    niveau: niveau,
                    dureeIndicative: `${12 + i * 4} heures`,
                    image: p.provider.image,
                    fournisseurId: p.provider.id,
                }
            });
        }
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