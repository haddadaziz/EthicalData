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
        // Nettoyer d'anciennes questions pour éviter les doublons à la réexécution
        await prisma.question.deleteMany({ where: { certificationId: az900.id } });

        // Questions de simulation pour AZ-900
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
            },
            {
                enonce: "Quelle solution Azure devez-vous utiliser pour stocker de manière hautement sécurisée des secrets, des clés de chiffrement et des certificats SSL ?",
                explication: "Azure Key Vault centralise le stockage des secrets (mots de passe, tokens API), des clés de chiffrement de clés et des certificats SSL.",
                reponseCorrecte: "C",
                categorie: "Chiffrement & Sécurité",
                options: [
                    { lettre: "A", texte: "Azure Storage Service Encryption (SSE)" },
                    { lettre: "B", texte: "Azure Information Protection (AIP)" },
                    { lettre: "C", texte: "Azure Key Vault" },
                    { lettre: "D", texte: "Azure Application Gateway" }
                ]
            },
            {
                enonce: "Quel service fournit une connexion RDP/SSH privée, sécurisée et sans adresse IP publique directement via le portail Azure dans un navigateur web ?",
                explication: "Azure Bastion est un service PaaS qui permet d'accéder de manière sécurisée à vos machines virtuelles via SSL/TLS sans exposer d'adresse IP publique.",
                reponseCorrecte: "C",
                categorie: "Réseau Virtuel",
                options: [
                    { lettre: "A", texte: "Azure Virtual Network Gateway (VPN)" },
                    { lettre: "B", texte: "Azure ExpressRoute" },
                    { lettre: "C", texte: "Azure Bastion" },
                    { lettre: "D", texte: "Azure Firewall" }
                ]
            },
            {
                enonce: "Quelle solution permet de filtrer le trafic entrant ou sortant vers des ressources d'un réseau virtuel Azure à l'aide de règles de sécurité basées sur l'IP source/destination ?",
                explication: "Un Network Security Group (NSG) permet d'autoriser ou de refuser le trafic réseau vers des sous-réseaux ou des interfaces réseau de machines virtuelles.",
                reponseCorrecte: "A",
                categorie: "Réseau Virtuel",
                options: [
                    { lettre: "A", texte: "Network Security Group (NSG)" },
                    { lettre: "B", texte: "Azure DDoS Protection" },
                    { lettre: "C", texte: "Azure Firewall" },
                    { lettre: "D", texte: "Azure Route Table" }
                ]
            },
            {
                enonce: "Comment pouvez-vous empêcher la suppression accidentelle d'une ressource Azure critique, même par un administrateur ayant des droits complets ?",
                explication: "Les verrous de ressources (Resource Locks) permettent de verrouiller des abonnements ou des ressources pour empêcher leur suppression ou leur modification.",
                reponseCorrecte: "B",
                categorie: "Gouvernance",
                options: [
                    { lettre: "A", texte: "En appliquant des Azure Tags" },
                    { lettre: "B", texte: "En configurant un verrou de ressource (Resource Lock) avec le statut ReadOnly ou CanNotDelete" },
                    { lettre: "C", texte: "En modifiant le groupe de ressources" },
                    { lettre: "D", texte: "En utilisant Azure Service Health" }
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
                    options: {
                        create: q.options
                    }
                }
            });
        }
        console.log('Questions pour AZ-900 créées.');
        // Certification 2: AZ-104
        await prisma.certification.upsert({
            where: { slug: 'microsoft-azure-administrator-az104' },
            update: { image: '/certifications/az104.svg', deletedAt: null },
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