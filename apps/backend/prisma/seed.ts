import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Début du Seeding complet avec visuels HD...');

    // 1. Gestion des Rôles
    const roles = ['SUPER_ADMIN', 'ADMIN', 'FORMATEUR', 'APPRENANT'];
    const createdRoles: any[] = [];

    for (const r of roles) {
        const role = await prisma.role.upsert({
            where: { nom: r },
            update: {},
            create: { nom: r },
        });
        createdRoles.push(role);
    }

    const superAdminRole = createdRoles.find((r) => r.nom === 'SUPER_ADMIN');
    const adminRole = createdRoles.find((r) => r.nom === 'ADMIN');
    const formateurRole = createdRoles.find((r) => r.nom === 'FORMATEUR');
    const apprenantRole = createdRoles.find((r) => r.nom === 'APPRENANT');

    // 2. Nettoyage de la base de données
    console.log('🧹 Nettoyage des anciennes données...');
    await prisma.rendezVous.deleteMany({});
    await prisma.creneauDisponibilite.deleteMany({});
    await prisma.commentaire.deleteMany({});
    await prisma.likeSujet.deleteMany({});
    await prisma.signalementSujet.deleteMany({});
    await prisma.sujet.deleteMany({});
    await prisma.notification.deleteMany({});
    if ((prisma as any).telechargement) await (prisma as any).telechargement.deleteMany({});
    await prisma.ressource.deleteMany({});
    await prisma.tentative.deleteMany({});
    await prisma.option.deleteMany({});
    await prisma.question.deleteMany({});
    await prisma.module.deleteMany({});
    await prisma.certification.deleteMany({});
    await prisma.fournisseur.deleteMany({});
    await prisma.utilisateur.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin_password_secure_2026', salt);

    // 3. Avatars Unsplash Professionnels
    const avatars = [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    ];

    // 4. Création des Utilisateurs
    console.log('👤 Création des utilisateurs avec photos...');

    const superAdmin = await prisma.utilisateur.create({
        data: {
            prenom: 'Thomas',
            nom: 'Dupont',
            email: 'thomas.dupont.5@ethicaldata.local',
            telephone: '+212 6 61 12 34 56',
            motDePasse: hashedPassword,
            statut: 'ACTIF',
            avatar: avatars[1],
            roles: { connect: { id: superAdminRole.id } },
        },
    });

    const apprenantPrincipal = await prisma.utilisateur.create({
        data: {
            prenom: 'Aziz',
            nom: 'Haddad',
            email: 'aziz.haddad.1@ethicaldata.local',
            telephone: '+212 6 62 98 76 54',
            motDePasse: hashedPassword,
            statut: 'ACTIF',
            avatar: avatars[7],
            roles: { connect: { id: apprenantRole.id } },
        },
    });

    const formateur = await prisma.utilisateur.create({
        data: {
            prenom: 'Sarah',
            nom: 'Mansouri',
            email: 'sarah.mansouri@ethicaldata.local',
            telephone: '+212 6 63 45 67 89',
            motDePasse: hashedPassword,
            statut: 'ACTIF',
            avatar: avatars[4],
            roles: { connect: { id: formateurRole.id } },
        },
    });

    // Générer d'autres utilisateurs
    const prenoms = ['Karim', 'Leila', 'Yassine', 'Sofia', 'Omar', 'Lucas', 'Emma', 'Amine'];
    const noms = ['El Amrani', 'Benjelloun', 'Rami', 'Alaoui', 'Tazi', 'Martin', 'Bernard', 'Kabbaj'];

    const otherUsers: any[] = [];
    for (let i = 0; i < prenoms.length; i++) {
        const u = await prisma.utilisateur.create({
            data: {
                prenom: prenoms[i],
                nom: noms[i],
                email: `${prenoms[i].toLowerCase()}.${noms[i].toLowerCase().replace(/\s+/g, '')}@ethicaldata.local`,
                telephone: `+212 6 10 20 30 0${i}`,
                motDePasse: hashedPassword,
                statut: 'ACTIF',
                avatar: avatars[i % avatars.length],
                roles: { connect: { id: i % 3 === 0 ? formateurRole.id : apprenantRole.id } },
            },
        });
        otherUsers.push(u);
    }

    const formateur2 = otherUsers[0]; // Karim El Amrani (Formateur)
    const formateur3 = otherUsers[3]; // Sofia Alaoui (Formatrice)

    // 5. Fournisseurs avec logos
    console.log('🏢 Création des fournisseurs...');
    const fournisseursData = [
        { nom: 'Microsoft', slug: 'microsoft', image: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&w=300&q=80' },
        { nom: 'AWS Cloud', slug: 'aws', image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=300&q=80' },
        { nom: 'Google Cloud Platform', slug: 'gcp', image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=300&q=80' },
        { nom: 'CompTIA & Security', slug: 'comptia', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=300&q=80' },
    ];

    const createdFournisseurs: any[] = [];
    for (const f of fournisseursData) {
        const fournisseur = await prisma.fournisseur.create({ data: f });
        createdFournisseurs.push(fournisseur);
    }

    // 6. Certifications avec bannières visuelles
    console.log('📜 Création des certifications visuelles...');
    const ms = createdFournisseurs.find(f => f.slug === 'microsoft');
    const aws = createdFournisseurs.find(f => f.slug === 'aws');
    const comptia = createdFournisseurs.find(f => f.slug === 'comptia');

    const certAz900 = await prisma.certification.create({
        data: {
            nom: 'Microsoft Azure Fundamentals (AZ-900)',
            slug: 'microsoft-azure-fundamentals-az900',
            codeExamen: 'AZ-900',
            description: 'Validez vos connaissances fondamentales sur les services Cloud Azure, la sécurité, la confidentialité et la gouvernance.',
            niveau: 'DEBUTANT',
            dureeIndicative: '15 heures',
            objectifs: [
                'Comprendre les concepts fondamentaux du cloud computing',
                'Décrire les principaux services Azure (compute, stockage, réseau, base de données)',
                'Expliquer la sécurité, la confidentialité et la gouvernance sur Azure',
                'Identifier les solutions de gestion des coûts et des budgets Azure',
                'Distinguer les modèles de déploiement (IaaS, PaaS, SaaS)'
            ],
            prerequis: [
                'Aucune expérience technique requise',
                'Curiosité pour les technologies cloud',
                'Compréhension de base des concepts IT'
            ],
            image: '/badges/az-900.svg',
            fournisseurId: ms.id,
        },
    });

    const certAws = await prisma.certification.create({
        data: {
            nom: 'AWS Certified Solutions Architect Associate (SAA-C03)',
            slug: 'aws-certified-solutions-architect-saa-c03',
            codeExamen: 'SAA-C03',
            description: 'Concevez des architectures hautement disponibles, optimisées en coûts et sécurisées sur Amazon Web Services.',
            niveau: 'INTERMEDIAIRE',
            dureeIndicative: '35 heures',
            objectifs: [
                'Concevoir des architectures résilientes et hautement disponibles sur AWS',
                'Optimiser les coûts et les performances des solutions AWS',
                'Mettre en œuvre la sécurité et la conformité sur AWS',
                'Sélectionner les services AWS appropriés selon les besoins métier',
                'Maîtriser les patterns architecturaux (microservices, serverless, hybrides)'
            ],
            prerequis: [
                'Expérience pratique d\'au moins 1 an sur AWS',
                'Connaissances en réseau et sécurité de base',
                'Compréhension des bases de données et du stockage',
                'Notions de Linux/Windows et scripting'
            ],
            image: '/badges/aws-saa.svg',
            fournisseurId: aws.id,
        },
    });

    const certSecurity = await prisma.certification.create({
        data: {
            nom: 'CompTIA Security+ (SY0-701)',
            slug: 'comptia-security-sy0701',
            codeExamen: 'SY0-701',
            description: 'La référence mondiale pour valider vos compétences de base en cybersécurité, gestion des risques et réponse aux incidents.',
            niveau: 'INTERMEDIAIRE',
            dureeIndicative: '40 heures',
            objectifs: [
                'Comprendre les menaces, vulnérabilités et attaques courantes',
                'Maîtriser les concepts d\'architecture et de conception sécurisées',
                'Mettre en œuvre des solutions de gestion des identités et des accès',
                'Savoir répondre aux incidents et assurer la continuité d\'activité',
                'Appliquer les bonnes pratiques de gouvernance et de conformité'
            ],
            prerequis: [
                'Certification Network+ ou connaissances réseau équivalentes',
                'Expérience de 2 ans en administration IT recommandée',
                'Compréhension des concepts de base en sécurité'
            ],
            image: '/badges/comptia-sec.svg',
            fournisseurId: comptia.id,
        },
    });

    const gcp = createdFournisseurs.find(f => f.slug === 'gcp');

    const certGcpDigitalLeader = await prisma.certification.create({
        data: {
            nom: 'Google Cloud Digital Leader',
            slug: 'google-cloud-digital-leader',
            codeExamen: 'GCLD',
            description: 'Certification d\'entrée de gamme Google Cloud qui valide votre capacité à comprendre les concepts du cloud, les produits Google Cloud et leur valeur commerciale.',
            niveau: 'DEBUTANT',
            dureeIndicative: '20 heures',
            objectifs: [
                'Comprendre les concepts et la terminologie de Google Cloud',
                'Identifier les cas d\'usage des principaux produits GCP',
                'Expliquer la transformation digitale et la data sur Google Cloud',
                'Distinguer les modèles de déploiement et de tarification GCP'
            ],
            prerequis: [
                'Aucune expérience cloud requise',
                'Intérêt pour la transformation numérique et l\'innovation'
            ],
            image: '/badges/gcp-digital-leader.svg',
            fournisseurId: gcp.id,
        },
    });

    const certAwsCp = await prisma.certification.create({
        data: {
            nom: 'AWS Cloud Practitioner (CLF-C02)',
            slug: 'aws-cloud-practitioner-clf-c02',
            codeExamen: 'CLF-C02',
            description: 'La certification Cloud Practitioner valide une compréhension globale du cloud AWS, des services principaux, de la tarification, de la sécurité et de l\'architecture.',
            niveau: 'DEBUTANT',
            dureeIndicative: '15 heures',
            objectifs: [
                'Comprendre les fondamentaux du cloud AWS et sa valeur métier',
                'Identifier les services AWS principaux et leurs cas d\'usage',
                'Expliquer les concepts de sécurité et de conformité AWS',
                'Décrire les modèles de tarification et de support AWS',
                'Distinguer les piliers du Well-Architected Framework'
            ],
            prerequis: [
                'Aucune expérience technique requise',
                'Compréhension de base des concepts IT',
                'Curiosité pour les technologies cloud'
            ],
            image: '/badges/aws-cp.svg',
            fournisseurId: aws.id,
        },
    });

    // 7. Categories des certifications
    console.log('📂 Creation des categories...');
    const categoriesData = [
        { nom: 'Cloud Computing', slug: 'cloud-computing', description: 'CertificationsCloud (AWS, Azure, GCP)', ordre: 1 },
        { nom: 'Cybersecurite', slug: 'cybersecurite', description: 'Certifications en securite informatique', ordre: 2 },
        { nom: 'Data & IA', slug: 'data-ia', description: 'Certifications Data, Big Data et Intelligence Artificielle', ordre: 3 },
        { nom: 'Reseau & Infrastructure', slug: 'reseau-infrastructure', description: 'Certifications reseau et infrastructure IT', ordre: 4 },
        { nom: 'DevOps & Agilite', slug: 'devops-agilite', description: 'Certifications DevOps, CI/CD et methodologies agiles', ordre: 5 },
    ];
    const createdCategories: any[] = [];
    for (const c of categoriesData) {
        const cat = await prisma.categorieCertification.upsert({
            where: { slug: c.slug },
            update: {},
            create: c,
        });
        createdCategories.push(cat);
    }

    const cloudCat = createdCategories.find(c => c.slug === 'cloud-computing');
    const cyberCat = createdCategories.find(c => c.slug === 'cybersecurite');

    // Lier les certifications aux categories
    if (cloudCat) {
        await prisma.certification.update({ where: { id: certAz900.id }, data: { categorieId: cloudCat.id } });
        await prisma.certification.update({ where: { id: certAws.id }, data: { categorieId: cloudCat.id } });
        await prisma.certification.update({ where: { id: certAwsCp.id }, data: { categorieId: cloudCat.id } });
        await prisma.certification.update({ where: { id: certGcpDigitalLeader.id }, data: { categorieId: cloudCat.id } });
    }
    if (cyberCat) {
        await prisma.certification.update({ where: { id: certSecurity.id }, data: { categorieId: cyberCat.id } });
    }

    // 8. Modules de certification (AZ-900)
    console.log('📚 Creation des modules de certification...');
    const modulesAz900 = [
        {
            titre: 'Jour 1 : Concepts fondamentaux du cloud',
            description: 'Comprendre les bases du cloud computing et les modeles de service',
            ordre: 1,
            sousModules: [
                'Introduction au cloud computing',
                'Modeles de service : IaaS, PaaS, SaaS',
                'Modeles de deploiement : public, prive, hybride',
                'Avantages du cloud : scalabilite, elasticite, haute disponibilite',
                'Le modele de responsabilite partagee',
            ],
        },
        {
            titre: 'Jour 2 : Securite dans le cloud Azure',
            description: 'Maitriser les concepts de securite et de gouvernance Azure',
            ordre: 2,
            sousModules: [
                'Azure Security Center et Microsoft Defender',
                'Gestion des identites avec Microsoft Entra ID',
                'Azure Policy et RBAC (controle d\'acces)',
                'Chiffrement des donnees au repos et en transit',
                'Azure Key Vault et gestion des secrets',
            ],
        },
        {
            titre: 'Jour 3 : Services Azure principaux',
            description: 'Decouvrir les services de calcul, stockage, reseau et base de donnees',
            ordre: 3,
            sousModules: [
                'Calcul : Machines Virtuelles, App Services, Functions',
                'Stockage : Blob, Disk, Files, Archive',
                'Reseau : VNet, Load Balancer, VPN Gateway',
                'Base de donnees : Azure SQL, Cosmos DB',
                'Azure Marketplace et solutions pre-construites',
            ],
        },
        {
            titre: 'Jour 4 : Gestion des couts et support Azure',
            description: 'Optimiser les depenses et maitriser les outils de gestion',
            ordre: 4,
            sousModules: [
                'Azure Pricing Calculator et TCO Calculator',
                'Azure Cost Management + Billing',
                'Reservations et Azure Hybrid Benefit',
                'Plans de support Azure',
                'Service Level Agreements (SLA) et disponibilite',
            ],
        },
        {
            titre: 'Jour 5 : Gouvernance et conformite',
            description: 'Appliquer les bonnes pratiques de gouvernance Azure',
            ordre: 5,
            sousModules: [
                'Azure Blueprints et initiatives',
                'Management Groups et subscriptions',
                'Azure Policy en profondeur',
                'Conformite : Azure Compliance Center',
                'Azure Monitor et alerts',
            ],
        },
        {
            titre: 'Jour 6 : Revision et examens blancs',
            description: 'Reviser et se preparer a l\'examen officiel AZ-900',
            ordre: 6,
            sousModules: [
                'Resume des concepts cles',
                'Questions types et pieges de l\'examen',
                'Simulation d\'examen blanc (30 questions)',
                'Analyse des resultats et axes d\'amelioration',
                'Conseils pour le jour de l\'examen',
            ],
        },
    ];

    for (const modData of modulesAz900) {
        const parent = await prisma.moduleCertification.create({
            data: {
                titre: modData.titre,
                description: modData.description,
                ordre: modData.ordre,
                certificationId: certAz900.id,
            },
        });
        for (let i = 0; i < modData.sousModules.length; i++) {
            await prisma.moduleCertification.create({
                data: {
                    titre: modData.sousModules[i],
                    ordre: i + 1,
                    certificationId: certAz900.id,
                    parentId: parent.id,
                },
            });
        }
    }

    // Modules AWS SAA-C03
    const modulesAwsSaa = [
        {
            titre: 'Jour 1 : Fondamentaux de l\'architecture AWS',
            description: 'Comprendre les principes de base de l\'architecture cloud AWS',
            ordre: 1,
            sousModules: [
                'Le Well-Architected Framework : les 6 piliers',
                'Regions, Zones de disponibilite et Edge Locations',
                'AWS Global Infrastructure',
                'Modeles de conception : microservices, monolithe, serverless',
                'AWS Organizations et gestion multi-comptes',
            ],
        },
        {
            titre: 'Jour 2 : Calcul et mise a l\'echelle',
            description: 'Maitriser les services de calcul AWS',
            ordre: 2,
            sousModules: [
                'EC2 : types d\'instances, placement groups, dedicated hosts',
                'Auto Scaling : policies, health checks, lifecycle hooks',
                'Elastic Load Balancing : ALB, NLB, Gateway LB',
                'AWS Lambda et serverless computing',
                'Elastic Beanstalk et conteneurs (ECS, EKS, Fargate)',
            ],
        },
        {
            titre: 'Jour 3 : Stockage et bases de donnees',
            description: 'Choisir et optimiser les solutions de stockage AWS',
            ordre: 3,
            sousModules: [
                'S3 : classes de stockage, versioning, lifecycle policies',
                'EBS : types de volumes, snapshots, encryption',
                'EFS et FSx : stockage de fichiers partage',
                'RDS : Multi-AZ, Read Replicas, Aurora',
                'DynamoDB : tables globales, DAX, auto-scaling',
            ],
        },
        {
            titre: 'Jour 4 : Reseau et securite',
            description: 'Concevoir une architecture reseau securisee sur AWS',
            ordre: 4,
            sousModules: [
                'VPC : subnets, route tables, NAT Gateway, VPC Peering',
                'Security Groups vs NACLs',
                'AWS WAF, Shield, Network Firewall',
                'Site-to-Site VPN et Direct Connect',
                'AWS PrivateLink et VPC Endpoints',
            ],
        },
        {
            titre: 'Jour 5 : Optimisation des couts et performance',
            description: 'Maitriser les strategies d\'optimisation AWS',
            ordre: 5,
            sousModules: [
                'AWS Pricing Calculator et Cost Explorer',
                'Reserved Instances et Savings Plans',
                'Strategies de migration cloud',
                'AWS Trusted Advisor et Well-Architected Tool',
                'AWS CloudFormation et Infrastructure as Code',
            ],
        },
    ];

    for (const modData of modulesAwsSaa) {
        const parent = await prisma.moduleCertification.create({
            data: {
                titre: modData.titre,
                description: modData.description,
                ordre: modData.ordre,
                certificationId: certAws.id,
            },
        });
        for (let i = 0; i < modData.sousModules.length; i++) {
            await prisma.moduleCertification.create({
                data: {
                    titre: modData.sousModules[i],
                    ordre: i + 1,
                    certificationId: certAws.id,
                    parentId: parent.id,
                },
            });
        }
    }

    // Modules Security+ SY0-701
    const modulesSecurityPlus = [
        {
            titre: 'Jour 1 : Menaces, attaques et vulnrabilites',
            description: 'Identifier les principales menaces et techniques d\'attaque',
            ordre: 1,
            sousModules: [
                'Types de malwares et vecteurs d\'infection',
                'Attaques sociales : phishing, pretexting, tailgating',
                'Attaques reseau : DDoS, MitM, DNS poisoning',
                'Vulnerabilites des applications : injection XSS, SQLi',
                'Indicateurs de compromission (IoC)',
            ],
        },
        {
            titre: 'Jour 2 : Architecture et conception securisees',
            description: 'Mettre en oeuvre des architectures de securite robustes',
            ordre: 2,
            sousModules: [
                'Principes de defense en profondeur',
                'Segmentation reseau et zero trust',
                'Securite des environnements cloud et hybrides',
                'Embedded systems et IoT security',
                'Securite physique et environnementale',
            ],
        },
        {
            titre: 'Jour 3 : Gestion des identites et des acces',
            description: 'Implementer des solutions IAM completes',
            ordre: 3,
            sousModules: [
                'Authentification multifacteur (MFA) et SSO',
                'Gestion des certificats et PKI',
                'Controle d\'acces : DAC, MAC, RBAC, ABAC',
                'Identity Federation et LDAP',
                'Gouvernance des identites et recertification',
            ],
        },
        {
            titre: 'Jour 4 : Reponse aux incidents et continuite',
            description: 'Savoir reagir aux incidents et assurer la resilience',
            ordre: 4,
            sousModules: [
                'Phases de la reponse aux incidents',
                'Digital forensics et collecte de preuves',
                'Plan de reprise d\'activite (PRA) et PCA',
                'Sauvegardes et replication',
                'Tests de penetration et red teaming',
            ],
        },
    ];

    for (const modData of modulesSecurityPlus) {
        const parent = await prisma.moduleCertification.create({
            data: {
                titre: modData.titre,
                description: modData.description,
                ordre: modData.ordre,
                certificationId: certSecurity.id,
            },
        });
        for (let i = 0; i < modData.sousModules.length; i++) {
            await prisma.moduleCertification.create({
                data: {
                    titre: modData.sousModules[i],
                    ordre: i + 1,
                    certificationId: certSecurity.id,
                    parentId: parent.id,
                },
            });
        }
    }

    // 8b. Simulations officielles
    console.log('🎯 Création des simulations...');
    const simuAz900 = await prisma.simulation.create({
        data: { titre: 'Simulation AZ-900 - Examen Blanc', description: 'Examen blanc officiel Microsoft Azure Fundamentals', duree: 45, scoreMinimal: 700, statut: 'PUBLIE', certificationId: certAz900.id },
    });
    const simuAws = await prisma.simulation.create({
        data: { titre: 'Simulation AWS SAA-C03 - Examen Blanc', description: 'Examen blanc officiel AWS Certified Solutions Architect', duree: 60, scoreMinimal: 720, statut: 'PUBLIE', certificationId: certAws.id },
    });
    const simuSecurity = await prisma.simulation.create({
        data: { titre: 'Simulation CompTIA Security+ - Examen Blanc', description: 'Examen blanc officiel CompTIA Security+ SY0-701', duree: 90, scoreMinimal: 750, statut: 'PUBLIE', certificationId: certSecurity.id },
    });
    const simuGcp = await prisma.simulation.create({
        data: { titre: 'Simulation GCP Digital Leader - Examen Blanc', description: 'Examen blanc officiel Google Cloud Digital Leader', duree: 45, scoreMinimal: 700, statut: 'PUBLIE', certificationId: certGcpDigitalLeader.id },
    });
    const simuAwsCp = await prisma.simulation.create({
        data: { titre: 'Simulation AWS Cloud Practitioner - Examen Blanc', description: 'Examen blanc officiel AWS Cloud Practitioner CLF-C02', duree: 45, scoreMinimal: 700, statut: 'PUBLIE', certificationId: certAwsCp.id },
    });

    // 9. Questions d'examen reelles (QCM, Vrai/Faux, Ouvertes & Cas Pratiques avec IA)
    console.log('Question ajout des questions de simulation reelles & banque evaluation IA...');

    // --- QUESTIONS AZ-900 ---
    await prisma.question.create({
        data: {
            enonce: "Quel service Azure permet de centraliser la gestion des identités et de configurer l'authentification multifacteur (MFA) ?",
            explication: "Microsoft Entra ID (anciennement Azure Active Directory) est le service cloud de gestion des accès et des identités.",
            reponseCorrecte: "B",
            categorie: "Identité & IAM",
            type: "QCM",
            certificationId: certAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "Azure Key Vault" },
                    { lettre: "B", texte: "Microsoft Entra ID (Azure AD)" },
                    { lettre: "C", texte: "Azure Bastion" },
                    { lettre: "D", texte: "Azure Policy" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Dans le modèle de responsabilité partagée (Shared Responsibility Model) en SaaS, qui est responsable de la sécurité des données clientes ?",
            explication: "Dans tous les modèles cloud (IaaS, PaaS, SaaS), le client conserve TOUJOURS la responsabilité de la sécurité de ses données.",
            reponseCorrecte: "A",
            categorie: "Sécurité & Conforme",
            type: "QCM",
            certificationId: certAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "Le client uniquement" },
                    { lettre: "B", texte: "Microsoft uniquement" },
                    { lettre: "C", texte: "Partagé à 50/50 entre Microsoft et le client" },
                    { lettre: "D", texte: "L'organisme de certification" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Expliquez la différence entre les modèles IaaS, PaaS et SaaS dans Microsoft Azure. Proposez une stratégie de migration pour une application Web monolithique.",
            explication: "IaaS fournit l'infrastructure brute (VMs, Réseau). PaaS fournit une plateforme managée (App Service, Azure SQL). SaaS fournit l'application clé en main. La migration peut se faire via Lift-and-Shift (IaaS) puis modernisation PaaS.",
            reponseCorrecte: "IaaS fournit des machines virtuelles et du réseau (ex: Azure VMs). PaaS fournit un environnement d'exécution géré (ex: Azure App Service, Azure SQL Database). SaaS est une application managée clé en main (ex: Microsoft 365). Pour une migration Web, on peut migrer en IaaS (VM) puis migrer la base vers Azure SQL (PaaS).",
            grilleNotation: "100 pts: Définition des 3 modèles + Exemples Azure exacts + Stratégie de migration cohérente.",
            categorie: "Concepts Cloud & Architecture",
            type: "OUVERTE",
            certificationId: certAz900.id,
        },
    });

    // --- QUESTIONS AWS SAA-C03 ---
    await prisma.question.create({
        data: {
            enonce: "Quel service de stockage AWS offre un stockage d'objets hautement durable (11 nines) pour sauvegarder des fichiers et sauvegardes ?",
            explication: "Amazon S3 (Simple Storage Service) est un service de stockage d'objets offrant une durabilité de 99.999999999%.",
            reponseCorrecte: "C",
            categorie: "Stockage Cloud",
            type: "QCM",
            certificationId: certAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "Amazon EBS" },
                    { lettre: "B", texte: "Amazon EFS" },
                    { lettre: "C", texte: "Amazon S3" },
                    { lettre: "D", texte: "AWS Storage Gateway" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Comment concevoir une architecture AWS résiliente et à haute disponibilité distribuée sur plusieurs zones de disponibilité (Multi-AZ) pour une application Web ?",
            explication: "Utiliser un Application Load Balancer (ALB), un groupe Auto Scaling pour EC2 sur plusieurs AZs, et Amazon RDS Multi-AZ avec basculement automatique.",
            reponseCorrecte: "Utiliser un Application Load Balancer (ALB) pour répartir le trafic sur un groupe Auto Scaling d'instances EC2 réparties sur au moins 2 Zones de Disponibilité (AZ). Pour la base de données, déployer Amazon RDS Multi-AZ avec réplication synchrone et basculement automatique.",
            grilleNotation: "100 pts: Mention de l'ALB + Auto Scaling EC2 Multi-AZ + RDS Multi-AZ.",
            categorie: "Architecture Resiliente",
            type: "CAS_PRATIQUE",
            certificationId: certAws.id,
        },
    });

    // --- QUESTIONS CompTIA Security+ SY0-701 ---
    await prisma.question.create({
        data: {
            enonce: "Quel principe de sécurité stipule qu'un utilisateur ne doit posséder que les autorisations strictement nécessaires à l'accomplissement de ses tâches ?",
            explication: "Le principe du moindre privilège (Least Privilege) réduit la surface d'attaque en limitant les droits des utilisateurs.",
            reponseCorrecte: "B",
            categorie: "Gestion des Accès",
            type: "QCM",
            certificationId: certSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "Défense en profondeur" },
                    { lettre: "B", texte: "Moindre Privilège (Least Privilege)" },
                    { lettre: "C", texte: "Séparation des pouvoirs" },
                    { lettre: "D", texte: "Non-répudiation" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Décrivez les 3 piliers du modèle de sécurité Zero Trust et expliquez leur mise en œuvre pour sécuriser des accès distants.",
            explication: "1. Vérifier explicitement 2. Moindre privilège 3. Supposer une violation (Assume Breach). Pour les accès distants : MFA obligatoire, évaluation de conformité de l'appareil et accès conditionnel.",
            reponseCorrecte: "1. Vérifier explicitement : Toujours authentifier et autoriser en fonction de l'identité, l'appareil et le contexte. 2. Moindre privilège : Limiter les accès au strict minimum nécessaire avec JIT/JEA. 3. Supposer la violation : Segmenter les réseaux. Pour les accès distants, on applique l'accès conditionnel et le MFA obligatoire.",
            grilleNotation: "100 pts: Citation des 3 piliers Zero Trust + Exemple d'accès distant avec MFA et accès conditionnel.",
            categorie: "Architecture Zero Trust",
            type: "OUVERTE",
            certificationId: certSecurity.id,
        },
    });

    // t

    // --- QUESTIONS AZ-900 (Batch 2) ---
    await prisma.question.create({
        data: {
            enonce: "Quel est le principal avantage d'utiliser des Zones de DisponibilitÃ© (Availability Zones) dans Azure ?",
            explication: "Les Zones de DisponibilitÃ© protÃ¨gent les applications contre les pannes de centre de donnÃ©es en les rÃ©partissant sur des emplacements physiquement sÃ©parÃ©s au sein d'une mÃªme rÃ©gion.",
            reponseCorrecte: "C",
            categorie: "Haute DisponibilitÃ©",
            type: "QCM",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "RÃ©duire la latence rÃ©seau entre les utilisateurs" },
                    { lettre: "B", texte: "Augmenter la puissance de calcul disponible" },
                    { lettre: "C", texte: "ProtÃ©ger contre les pannes d'un centre de donnÃ©es entier" },
                    { lettre: "D", texte: "Simplifier la gestion des identitÃ©s" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service Azure permet d'exÃ©cuter du code sans avoir Ã  gÃ©rer l'infrastructure serveur sous-jacente ?",
            explication: "Azure Functions est un service serverless qui exÃ©cute du code en rÃ©ponse Ã  des Ã©vÃ©nements, sans gestion de serveurs.",
            reponseCorrecte: "A",
            categorie: "Calcul Serverless",
            type: "QCM",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "Azure Functions" },
                    { lettre: "B", texte: "Azure Virtual Machines" },
                    { lettre: "C", texte: "Azure App Service" },
                    { lettre: "D", texte: "Azure Kubernetes Service" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel outil Microsoft permet d'estimer le coÃ»t des services Azure avant leur dÃ©ploiement ?",
            explication: "Le Azure Pricing Calculator est un outil web gratuit qui permet de configurer et d'estimer le coÃ»t des services Azure.",
            reponseCorrecte: "D",
            categorie: "Gestion des CoÃ»ts",
            type: "QCM",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "Azure Cost Management" },
                    { lettre: "B", texte: "Azure TCO Calculator" },
                    { lettre: "C", texte: "Azure Migrate" },
                    { lettre: "D", texte: "Azure Pricing Calculator" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service Azure offre une solution de base de donnÃ©es relationnelle entiÃ¨rement gÃ©rÃ©e avec une haute disponibilitÃ© intÃ©grÃ©e ?",
            explication: "Azure SQL Database est un service PaaS de base de donnÃ©es relationnelle qui assure automatiquement la haute disponibilitÃ©, les sauvegardes et les mises Ã  jour.",
            reponseCorrecte: "B",
            categorie: "Bases de DonnÃ©es",
            type: "QCM",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "Azure Cosmos DB" },
                    { lettre: "B", texte: "Azure SQL Database" },
                    { lettre: "C", texte: "Azure Database pour MySQL" },
                    { lettre: "D", texte: "Azure Cache for Redis" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Qu'est-ce qu'un abonnement (subscription) Azure ?",
            explication: "Un abonnement Azure est un conteneur logique qui regroupe les ressources Azure et dÃ©finit les limites de facturation, d'accÃ¨s et de gestion.",
            reponseCorrecte: "C",
            categorie: "Gouvernance",
            type: "QCM",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "Un contrat de support technique Azure" },
                    { lettre: "B", texte: "Un groupe de ressources contenant des machines virtuelles" },
                    { lettre: "C", texte: "Un conteneur logique qui regroupe des ressources et dÃ©finit les limites de facturation" },
                    { lettre: "D", texte: "Un niveau de performance pour Azure SQL Database" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel modÃ¨le de service cloud Azure fournit une plateforme de dÃ©veloppement dÃ©diÃ©e avec un environnement d'exÃ©cution gÃ©rÃ©, sans gestion de l'OS ?",
            explication: "Le PaaS (Platform as a Service) fournit une plateforme gÃ©rÃ©e incluant le runtime, la base de donnÃ©es et les outils de dÃ©veloppement. Azure App Service est un exemple de PaaS.",
            reponseCorrecte: "B",
            categorie: "Concepts Cloud",
            type: "QCM",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "IaaS (Infrastructure as a Service)" },
                    { lettre: "B", texte: "PaaS (Platform as a Service)" },
                    { lettre: "C", texte: "SaaS (Software as a Service)" },
                    { lettre: "D", texte: "FaaS (Function as a Service)" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Dans le cadre du modÃ¨le de responsabilitÃ© partagÃ©e Azure, Microsoft est responsable de la sÃ©curitÃ© physique des centres de donnÃ©es.",
            explication: "Vrai. Microsoft est responsable de la sÃ©curitÃ© physique, du rÃ©seau physique et de l'infrastructure des centres de donnÃ©es dans le cadre du modÃ¨le de responsabilitÃ© partagÃ©e.",
            reponseCorrecte: "A",
            categorie: "SÃ©curitÃ© & ConformitÃ©",
            type: "VRAI_FAUX",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Azure Marketplace permet uniquement d'acheter des licences Microsoft et ne propose pas de solutions tierces.",
            explication: "Faux. Azure Marketplace propose des milliers de solutions tierces certifiÃ©es, y compris des VM prÃ©-configurÃ©es, des conteneurs, et des services SaaS provenant d'Ã©diteurs partenaires.",
            reponseCorrecte: "B",
            categorie: "Services Azure",
            type: "VRAI_FAUX",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Comparez les trois modÃ¨les de cloud computing (public, privÃ©, hybride). Pour chaque modÃ¨le, donnez un cas d'usage concret et expliquez pourquoi Azure est particuliÃ¨rement adaptÃ© au modÃ¨le hybride.",
            explication: "Le cloud public (Azure) offre des ressources partagÃ©es via Internet. Le cloud privÃ© (Azure Stack) est dÃ©diÃ© Ã  une organisation. Le cloud hybride combine les deux. Azure est idÃ©al pour l'hybride grÃ¢ce Ã  Azure Arc, Azure Stack et VPN Gateway.",
            reponseCorrecte: "Cloud public : ressources partagÃ©es sur Internet, idÃ©al pour les startups (ex: hÃ©bergement d'un site Web). Cloud privÃ© : infrastructure dÃ©diÃ©e, adaptÃ© aux banques (ex: donnÃ©es rÃ©glementÃ©es). Cloud hybride : combinaison des deux, idÃ©al pour les entreprises avec des donnÃ©es sensibles en local (ex: banque avec App Web sur Azure + donnÃ©es clients en local). Azure se distingue par Azure Stack (cloud privÃ© sur site), Azure Arc (gestion unifiÃ©e) et une connectivitÃ© hybride native via VPN/ExpressRoute.",
            grilleNotation: "100 pts: DÃ©finition prÃ©cise des 3 modÃ¨les + 1 cas d'usage par modÃ¨le + Explication spÃ©cifique des outils hybrides Azure (Azure Stack, Arc, VPN).",
            categorie: "Concepts Cloud",
            type: "OUVERTE",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Une startup de e-commerce souhaite migrer son application Web monolithique vers Azure. Elle prÃ©voit 10 000 utilisateurs simultanÃ©s en pÃ©riode de soldes. Proposez une architecture Azure robuste en utilisant des services PaaS et IaaS, avec une estimation des coÃ»ts et des recommandations de scalabilitÃ©.",
            explication: "Utiliser Azure App Service (PaaS) pour l'application Web avec un plan de scaling automatique, Azure SQL Database pour la base de donnÃ©es avec un niveau premium, Azure Front Door pour le routage global, Azure Redis Cache pour les sessions et le cache, et Azure CDN pour les assets statiques. Activer le scaling automatique basÃ© sur le CPU et la mÃ©moire.",
            reponseCorrecte: "Architecture proposÃ©e : 1. Azure Front Door pour la terminaison SSL et le routage global 2. Azure App Service (PaaS) avec plan Premium V3 pour l'application Web, Auto-Scaling de 1 Ã  20 instances basÃ© sur CPU > 70% 3. Azure Redis Cache Premium pour le cache de session et les donnÃ©es temporaires 4. Azure SQL Database (niveau Business Critical, 2 replicas) 5. Azure CDN pour les images et assets statiques 6. Azure Key Vault pour les secrets Estimation : environ 2500-3000 â‚¬/mois en pointe. ScalabilitÃ© : Auto-Scaling App Service + Read Replicas SQL + caching Redis.",
            grilleNotation: "100 pts: Utilisation d'Azure App Service avec Auto-Scaling + Azure SQL Database + Cache (Redis) + Front Door ou CDN + Estimation cohÃ©rente des coÃ»ts.",
            categorie: "Architecture & ScalabilitÃ©",
            type: "CAS_PRATIQUE",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
        },
    });

    // --- QUESTIONS AWS SAA-C03 (Batch 2) ---
    await prisma.question.create({
        data: {
            enonce: "Quel service AWS permet de crÃ©er et de gÃ©rer des conteneurs Docker de maniÃ¨re orchestrÃ©e et scalable ?",
            explication: "Amazon ECS (Elastic Container Service) est un service d'orchestration de conteneurs entiÃ¨rement gÃ©rÃ©, prenant en charge Docker.",
            reponseCorrecte: "A",
            categorie: "Conteneurs & Orchestration",
            type: "QCM",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "Amazon ECS" },
                    { lettre: "B", texte: "Amazon EC2" },
                    { lettre: "C", texte: "AWS Lambda" },
                    { lettre: "D", texte: "AWS Batch" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service AWS fournit un pare-feu distribuÃ© pour protÃ©ger les applications Web contre les attaques courantes comme SQL injection et XSS ?",
            explication: "AWS WAF (Web Application Firewall) protÃ¨ge les applications Web en filtrant et surveillant le trafic HTTP/HTTPS.",
            reponseCorrecte: "B",
            categorie: "SÃ©curitÃ© Applicative",
            type: "QCM",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "AWS Shield" },
                    { lettre: "B", texte: "AWS WAF" },
                    { lettre: "C", texte: "AWS Network Firewall" },
                    { lettre: "D", texte: "AWS GuardDuty" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quelle solution AWS permet d'Ã©tablir une connexion rÃ©seau privÃ©e et dÃ©diÃ©e entre un centre de donnÃ©es sur site et AWS ?",
            explication: "AWS Direct Connect Ã©tablit une connexion rÃ©seau privÃ©e dÃ©diÃ©e entre votreæ•°æ®ä¸­å¿ƒ et AWS, contournant Internet pour offrir une bande passante constante et une latence rÃ©duite.",
            reponseCorrecte: "C",
            categorie: "RÃ©seau & ConnectivitÃ©",
            type: "QCM",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "AWS Site-to-Site VPN" },
                    { lettre: "B", texte: "AWS Client VPN" },
                    { lettre: "C", texte: "AWS Direct Connect" },
                    { lettre: "D", texte: "AWS Transit Gateway" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service de base de donnÃ©es AWS est conÃ§u pour les charges de travail NoSQL haute performance Ã  l'Ã©chelle mondiale avec une latence en millisecondes ?",
            explication: "Amazon DynamoDB est une base de donnÃ©es NoSQL clÃ©-valeur et document qui offre des performances <10ms Ã  n'importe quelle Ã©chelle, avec des tables globales pour le dÃ©ploiement multi-rÃ©gion.",
            reponseCorrecte: "D",
            categorie: "Bases de DonnÃ©es NoSQL",
            type: "QCM",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "Amazon RDS" },
                    { lettre: "B", texte: "Amazon Aurora" },
                    { lettre: "C", texte: "Amazon Redshift" },
                    { lettre: "D", texte: "Amazon DynamoDB" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service AWS permet de surveiller les performances, de collecter des mÃ©triques et de configurer des alertes pour les ressources AWS ?",
            explication: "Amazon CloudWatch est le service central de surveillance et d'observabilitÃ© d'AWS. Il collecte des mÃ©triques, des logs et permet de dÃ©clencher des alertes basÃ©es sur des seuils.",
            reponseCorrecte: "A",
            categorie: "Surveillance & ObservabilitÃ©",
            type: "QCM",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "Amazon CloudWatch" },
                    { lettre: "B", texte: "AWS CloudTrail" },
                    { lettre: "C", texte: "AWS Config" },
                    { lettre: "D", texte: "AWS Trusted Advisor" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quelle stratÃ©gie de migration AWS consiste Ã  dÃ©placer une application existante vers le cloud sans modification de son code ?",
            explication: "Le Lift-and-Shift (ou Rehost) consiste Ã  migrer l'application existante vers AWS sans aucune modification, souvent via la crÃ©ation d'images VM (AMI) ou l'utilisation de AWS MGN.",
            reponseCorrecte: "B",
            categorie: "Migration Cloud",
            type: "QCM",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "Replatform (Lift, Tinker and Shift)" },
                    { lettre: "B", texte: "Rehost (Lift and Shift)" },
                    { lettre: "C", texte: "Refactor (Re-architect)" },
                    { lettre: "D", texte: "Retire" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Les Security Groups AWS sont stateful, ce qui signifie que le trafic de retour est automatiquement autorisÃ© quelle que soit la rÃ¨gle de sortie.",
            explication: "Vrai. Les Security Groups sont stateful : si une rÃ¨gle d'entrÃ©e autorise le trafic entrant, le trafic de rÃ©ponse sortant est automatiquement autorisÃ©, mÃªme sans rÃ¨gle de sortie explicite.",
            reponseCorrecte: "A",
            categorie: "SÃ©curitÃ© RÃ©seau",
            type: "VRAI_FAUX",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Amazon S3 offre une cohÃ©rence forte (strong consistency) pour toutes les opÃ©rations de lecture, Ã©criture et listage depuis 2020.",
            explication: "Vrai. Depuis dÃ©cembre 2020, Amazon S3 offre une cohÃ©rence forte pour toutes les requÃªtes GET, PUT, LIST et DELETE, y compris pour les objets crÃ©Ã©s par des opÃ©rations simultanÃ©es.",
            reponseCorrecte: "A",
            categorie: "Stockage & CohÃ©rence",
            type: "VRAI_FAUX",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Expliquez en dÃ©tail les 6 piliers du AWS Well-Architected Framework. Pour chaque pilier, donnez un exemple concret de service AWS qui permet de le mettre en Å“uvre.",
            explication: "1. Excellence opÃ©rationnelle (AWS Systems Manager, CloudFormation) 2. SÃ©curitÃ© (IAM, KMS, WAF) 3. FiabilitÃ© (RDS Multi-AZ, Route 53) 4. EfficacitÃ© des performances (Auto Scaling, CloudFront) 5. Optimisation des coÃ»ts (Cost Explorer, Savings Plans) 6. DurabilitÃ© (S3 Intelligent-Tiering, rÃ©gions desservies par de l'Ã©nergie verte)",
            reponseCorrecte: "1. Excellence opÃ©rationnelle : automatiser les opÃ©rations avec CloudFormation et Systems Manager. 2. SÃ©curitÃ© : protÃ©ger les donnÃ©es avec IAM, KMS, AWS WAF. 3. FiabilitÃ© : RDS Multi-AZ, Route 53 health checks, Auto Scaling. 4. EfficacitÃ© des performances : Auto Scaling ELB, CloudFront, selection du bon type de stockage. 5. Optimisation des coÃ»ts : AWS Cost Explorer, Savings Plans, instances spot. 6. DurabilitÃ© : S3 Intelligent-Tiering, infrastructure Ã©co-responsable.",
            grilleNotation: "100 pts: 6 piliers nommÃ©s correctement + 1 service AWS pertinent par pilier + explication brÃ¨ve de l'application.",
            categorie: "Architecture & Bonnes Pratiques",
            type: "OUVERTE",
            certificationId: certAws.id,
            simulationId: simuAws.id,
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Une entreprise financiÃ¨re doit dÃ©ployer une application web rÃ©glementÃ©e (PCI-DSS) sur AWS avec les exigences suivantes : (1) Haute disponibilitÃ© sur 3 AZs, (2) Chiffrement des donnÃ©es au repos et en transit, (3) Isolation rÃ©seau stricte, (4) Journalisation complÃ¨te des accÃ¨s. Proposez une architecture dÃ©taillÃ©e avec les services AWS Ã  utiliser.",
            explication: "Utiliser un VPC avec 3 subnets publics/privÃ©s sur 3 AZs. ALB public, Auto Scaling EC2 (instances privÃ©es), RDS Multi-AZ (dans subnets privÃ©s), KMS pour le chiffrement, CloudTrail + CloudWatch Logs pour l'audit, Security Groups restrictifs, AWS WAF, AWS Config pour la conformitÃ©.",
            reponseCorrecte: "Architecture : 1. VPC avec 3 AZs, subnets publics (ALB, NAT Gateway) et privÃ©s (EC2, RDS) 2. ALB public avec WAF en protection des applications Web 3. Auto Scaling Group EC2 (instances dans subnets privÃ©s) avec AMI chiffrÃ©e via KMS 4. RDS PostgreSQL Multi-AZ avec chiffrement KMS et TLS pour les connexions 5. AWS CloudTrail + CloudWatch Logs pour la journalisation 6. Amazon GuardDuty + AWS Config rules PCI-DSS 7. Security Groups permettant uniquement le trafic nÃ©cessaire 8. VPC Flow Logs activÃ©s pour l'analyse rÃ©seau",
            grilleNotation: "100 pts: VPC multi-AZ avec subnets privÃ©s/publics + ALB + Auto Scaling + RDS Multi-AZ avec chiffrement KMS + CloudTrail pour audit + Security Groups + mention GuardDuty/Config.",
            categorie: "Architecture SÃ©curisÃ©e",
            type: "CAS_PRATIQUE",
            certificationId: certAws.id,
            simulationId: simuAws.id,
        },
    });

    // --- QUESTIONS CompTIA Security+ SY0-701 (Batch 2) ---
    await prisma.question.create({
        data: {
            enonce: "Quel type d'attaque consiste Ã  envoyer des requÃªtes DNS falsifiÃ©es pour rediriger les utilisateurs vers un site malveillant ?",
            explication: "L'empoisonnement du cache DNS (DNS cache poisoning ou DNS spoofing) corrompt le cache d'un serveur DNS avec des informations fausses, redirigeant le trafic vers des sites malveillants.",
            reponseCorrecte: "C",
            categorie: "Menaces RÃ©seau",
            type: "QCM",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "DNS tunneling" },
                    { lettre: "B", texte: "DNS amplification" },
                    { lettre: "C", texte: "DNS cache poisoning" },
                    { lettre: "D", texte: "DNS zone transfer" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel est l'objectif principal d'un plan de reprise d'activitÃ© (PRA / Disaster Recovery Plan) ?",
            explication: "Le PRA dÃ©finit les procÃ©dures pour restaurer les systÃ¨mes informatiques critiques aprÃ¨s une interruption majeure, avec des objectifs de temps de restauration (RTO) et de perte de donnÃ©es acceptable (RPO).",
            reponseCorrecte: "B",
            categorie: "ContinuitÃ© d'ActivitÃ©",
            type: "QCM",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "PrÃ©venir toutes les cyberattaques possibles" },
                    { lettre: "B", texte: "Restaurer les systÃ¨mes critiques dans un dÃ©lai dÃ©fini aprÃ¨s un sinistre" },
                    { lettre: "C", texte: "Assurer la conformitÃ© aux normes ISO 27001" },
                    { lettre: "D", texte: "Former les employÃ©s Ã  la cybersÃ©curitÃ©" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quelle technologie d'authentification utilise un facteur supplÃ©mentaire basÃ© sur quelque chose que l'utilisateur possÃ¨de physiquement ?",
            explication: "L'authentification multifacteur (MFA) basÃ©e sur un token matÃ©riel ou une clÃ© de sÃ©curitÃ© (FIDO2/WebAuthn) utilise quelque chose que l'utilisateur possÃ¨de (possession) en plus de quelque chose qu'il connaÃ®t (mot de passe).",
            reponseCorrecte: "B",
            categorie: "Authentification & IAM",
            type: "QCM",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "Authentification par certificat logiciel" },
                    { lettre: "B", texte: "Token matÃ©riel ou clÃ© de sÃ©curitÃ© FIDO2" },
                    { lettre: "C", texte: "Code OTP envoyÃ© par SMS" },
                    { lettre: "D", texte: "Question de sÃ©curitÃ© personnalisÃ©e" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel concept de sÃ©curitÃ© consiste Ã  segmenter le rÃ©seau en zones distinctes avec des contrÃ´les d'accÃ¨s diffÃ©rents ?",
            explication: "La segmentation rÃ©seau (network segmentation) divise le rÃ©seau en zones distinctes (DMZ, interne, administration) avec des contrÃ´les d'accÃ¨s spÃ©cifiques pour limiter la propagation des menaces.",
            reponseCorrecte: "D",
            categorie: "SÃ©curitÃ© RÃ©seau",
            type: "QCM",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "Micro-segmentation Zero Trust" },
                    { lettre: "B", texte: "DÃ©fense en profondeur" },
                    { lettre: "C", texte: "PÃ©rimÃ¨tre de sÃ©curitÃ©" },
                    { lettre: "D", texte: "Segmentation rÃ©seau" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel type de malware chiffre les fichiers d'un systÃ¨me et exige une ranÃ§on pour les dÃ©chiffrer ?",
            explication: "Le ransomware est un logiciel malveillant qui chiffre les donnÃ©es de la victime et demande un paiement (ranÃ§on) en Ã©change de la clÃ© de dÃ©chiffrement.",
            reponseCorrecte: "A",
            categorie: "Malware & Menaces",
            type: "QCM",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "Ransomware" },
                    { lettre: "B", texte: "Spyware" },
                    { lettre: "C", texte: "Rootkit" },
                    { lettre: "D", texte: "Adware" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quelle norme de sÃ©curitÃ© est spÃ©cifiquement dÃ©diÃ©e Ã  la protection des donnÃ©es bancaires et des informations de carte de crÃ©dit ?",
            explication: "PCI DSS (Payment Card Industry Data Security Standard) est la norme de sÃ©curitÃ© qui s'applique Ã  toutes les organisations qui traitent, stockent ou transmettent des donnÃ©es de cartes de crÃ©dit.",
            reponseCorrecte: "C",
            categorie: "ConformitÃ© & RÃ©glementation",
            type: "QCM",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "ISO 27001" },
                    { lettre: "B", texte: "GDPR (RGPD)" },
                    { lettre: "C", texte: "PCI DSS" },
                    { lettre: "D", texte: "HIPAA" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Le chiffrement symÃ©trique utilise une seule clÃ© pour le chiffrement et le dÃ©chiffrement, ce qui le rend plus rapide que le chiffrement asymÃ©trique.",
            explication: "Vrai. Le chiffrement symÃ©trique (AES, DES) utilise la mÃªme clÃ© pour chiffrer et dÃ©chiffrer. Il est beaucoup plus rapide que le chiffrement asymÃ©trique (RSA, ECC) qui utilise une paire de clÃ©s publique/privÃ©e.",
            reponseCorrecte: "A",
            categorie: "Cryptographie",
            type: "VRAI_FAUX",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Le RPO (Recovery Point Objective) dÃ©finit le temps maximum acceptable pour restaurer un service aprÃ¨s une interruption.",
            explication: "Faux. Le RPO (Recovery Point Objective) dÃ©finit la perte de donnÃ©es maximale acceptable (en temps), pas le temps de restauration. Le RTO (Recovery Time Objective) dÃ©finit le temps de restauration acceptable.",
            reponseCorrecte: "B",
            categorie: "ContinuitÃ© d'ActivitÃ©",
            type: "VRAI_FAUX",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "DÃ©crivez les 6 phases du processus de rÃ©ponse aux incidents (Incident Response Process) selon le NIST. Pour chaque phase, donnez une action concrÃ¨te Ã  rÃ©aliser.",
            explication: "Les 6 phases NIST sont : 1. Preparation 2. Detection & Analysis 3. Containment, Eradication & Recovery 4. Post-Incident Activity. (Le framework NIST SP 800-61 en dÃ©finit 4 principales). La version Ã©tendue ajoute Identification et Lessons Learned.",
            reponseCorrecte: "1. Preparation : Former l'Ã©quipe, dÃ©ployer des outils de dÃ©tection (SIEM, EDR). 2. Identification (Detection) : Analyser les alertes, confirmer l'incident via les logs. 3. Containment : Isoler les systÃ¨mes compromis du rÃ©seau. 4. Eradication : Supprimer le malware et corriger la vulnÃ©rabilitÃ©. 5. Recovery : Restaurer les systÃ¨mes Ã  partir de sauvegardes saines. 6. Lessons Learned : RÃ©aliser un post-mortem et mettre Ã  jour les procÃ©dures.",
            grilleNotation: "100 pts: 6 phases nommÃ©es + 1 action concrÃ¨te par phase + mention du framework NIST.",
            categorie: "RÃ©ponse aux Incidents",
            type: "OUVERTE",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Une PME de 200 employÃ©s souhaite mettre en place une stratÃ©gie de cybersÃ©curitÃ© complÃ¨te avec un budget limitÃ©. Elle utilise Microsoft 365, a un site e-commerce et des employÃ©s en tÃ©lÃ©travail. Proposez un plan de sÃ©curisation incluant : la protection des endpoints, la sÃ©curisation des accÃ¨s distants, la protection des donnÃ©es, et un plan de rÃ©ponse aux incidents.",
            explication: "Mettre en place MFA pour tous les utilisateurs, EDR (Microsoft Defender for Business), VPN/WPA3-Enterprise pour le tÃ©lÃ©travail, DLP Microsoft 365, sauvegardes automatisÃ©es avec versioning, politique de mots de passe robuste, formation des employÃ©s, et un plan de rÃ©ponse aux incidents documentÃ©.",
            reponseCorrecte: "Plan de sÃ©curisation : 1. AccÃ¨s distant : MFA obligatoire + VPN avec accÃ¨s conditionnel basÃ© sur la conformitÃ© de l'appareil. 2. Endpoints : DÃ©ploiement de Microsoft Defender for Business (EDR) sur tous les postes. 3. E-mail : Anti-phishing, DKIM/SPF/DMARC, filtrage avancÃ©. 4. Site e-commerce : WAF + certificat TLS + scan de vulnÃ©rabilitÃ©s mensuel. 5. DonnÃ©es : DLP Microsoft 365 + chiffrement BitLocker + sauvegardes 3-2-1. 6. Sensibilisation : Formation trimestelle + simulations de phishing. 7. Incident Response : Playbook documentÃ© avec contacts, procÃ©dures d'escalade et sauvegardes hors ligne.",
            grilleNotation: "100 pts: MFA + EDR + VPN/acces conditionnel + DLP/chiffrement + sauvegardes 3-2-1 + plan de rÃ©ponse + mention de la formation.",
            categorie: "StratÃ©gie de SÃ©curitÃ©",
            type: "CAS_PRATIQUE",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
        },
    });

    // --- QUESTIONS GCP Digital Leader ---
    await prisma.question.create({
        data: {
            enonce: "Quel service Google Cloud permet d'exÃ©cuter des machines virtuelles avec des charges de travail gÃ©nÃ©ralistes ?",
            explication: "Google Compute Engine est le service IaaS de GCP qui permet de crÃ©er et gÃ©rer des machines virtuelles (VM) sur l'infrastructure Google.",
            reponseCorrecte: "A",
            categorie: "Calcul IaaS",
            type: "QCM",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Google Compute Engine" },
                    { lettre: "B", texte: "Google Kubernetes Engine" },
                    { lettre: "C", texte: "Google App Engine" },
                    { lettre: "D", texte: "Google Cloud Functions" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service GCP est utilisÃ© pour l'entreposage de donnÃ©es (data warehousing) et l'analyse de gros volumes de donnÃ©es avec SQL ?",
            explication: "BigQuery est le service d'entreposage de donnÃ©es serverless et hautement scalable de Google Cloud, permettant d'exÃ©cuter des requÃªtes SQL sur des pÃ©taoctets de donnÃ©es.",
            reponseCorrecte: "D",
            categorie: "Data & Analytics",
            type: "QCM",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Cloud SQL" },
                    { lettre: "B", texte: "Cloud Spanner" },
                    { lettre: "C", texte: "Firestore" },
                    { lettre: "D", texte: "BigQuery" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service Google Cloud offre un rÃ©seau de diffusion de contenu (CDN) mondial pour accÃ©lÃ©rer la livraison de contenu ?",
            explication: "Cloud CDN utilise le rÃ©seau global de Google (le mÃªme rÃ©seau qui alimente YouTube et Google Search) pour mettre en cache et diffuser le contenu Ã  proximitÃ© des utilisateurs.",
            reponseCorrecte: "B",
            categorie: "RÃ©seau & Distribution",
            type: "QCM",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Cloud Load Balancing" },
                    { lettre: "B", texte: "Cloud CDN" },
                    { lettre: "C", texte: "Cloud Armor" },
                    { lettre: "D", texte: "Cloud NAT" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel produit Google Cloud fournit une base de donnÃ©es relationnelle distribuÃ©e Ã  l'Ã©chelle mondiale avec une cohÃ©rence forte et une disponibilitÃ© de 99,999 % ?",
            explication: "Cloud Spanner est la base de donnÃ©es relationnelle distribuÃ©e de Google qui offre une cohÃ©rence forte, une scalabilitÃ© horizontale et une disponibilitÃ© de 99,999% pour les applications critiques.",
            reponseCorrecte: "C",
            categorie: "Bases de DonnÃ©es",
            type: "QCM",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Cloud SQL" },
                    { lettre: "B", texte: "Bigtable" },
                    { lettre: "C", texte: "Cloud Spanner" },
                    { lettre: "D", texte: "Firestore" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service Google Cloud permet de dÃ©ployer et gÃ©rer des applications conteneurisÃ©es avec Kubernetes sans gÃ©rer le plan de contrÃ´le ?",
            explication: "Google Kubernetes Engine (GKE) gÃ¨re automatiquement le plan de contrÃ´le Kubernetes, les mises Ã  jour et la rÃ©paration. La version Autopilot va encore plus loin en gÃ©rant aussi les nÅ“uds.",
            reponseCorrecte: "A",
            categorie: "Conteneurs & Orchestration",
            type: "QCM",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Google Kubernetes Engine (GKE)" },
                    { lettre: "B", texte: "Google Compute Engine" },
                    { lettre: "C", texte: "Cloud Run" },
                    { lettre: "D", texte: "App Engine Flexible Environment" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quelle est la principale fonction de Google Cloud IAM ?",
            explication: "Cloud IAM (Identity and Access Management) permet de gÃ©rer de maniÃ¨re centralisÃ©e les autorisations d'accÃ¨s aux ressources GCP en dÃ©finissant qui (utilisateur) a quel accÃ¨s (rÃ´le) sur quelle ressource.",
            reponseCorrecte: "B",
            categorie: "Gestion des AccÃ¨s",
            type: "QCM",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Surveiller les coÃ»ts et la consommation des ressources" },
                    { lettre: "B", texte: "GÃ©rer les autorisations d'accÃ¨s aux ressources GCP" },
                    { lettre: "C", texte: "Fournir un stockage d'objets scalable" },
                    { lettre: "D", texte: "Analyser les logs en temps rÃ©el" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Google Cloud Storage (Cloud Storage) offre une cohÃ©rence forte pour les opÃ©rations de lecture aprÃ¨s Ã©criture.",
            explication: "Vrai. Cloud Storage offre une cohÃ©rence forte (strong consistency) pour toutes les opÃ©rations : une fois qu'une Ã©criture est confirmÃ©e, toutes les lectures ultÃ©rieures retournent la valeur Ã©crite.",
            reponseCorrecte: "A",
            categorie: "Stockage",
            type: "VRAI_FAUX",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Les rÃ©seaux VPC (Virtual Private Cloud) sur Google Cloud sont limitÃ©s Ã  une seule rÃ©gion et ne peuvent pas s'Ã©tendre globalement.",
            explication: "Faux. Les VPC networks sur Google Cloud sont globaux. Un seul VPC peut s'Ã©tendre Ã  toutes les rÃ©gions du monde sans avoir besoin de peering ou de VPN inter-rÃ©gion.",
            reponseCorrecte: "B",
            categorie: "RÃ©seau",
            type: "VRAI_FAUX",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Expliquez comment Google Cloud accompagne la transformation digitale des entreprises Ã  travers les donnÃ©es et l'intelligence artificielle. Citez au moins 3 services GCP spÃ©cifiques et leur cas d'usage.",
            explication: "Google Cloud propose BigQuery pour l'analyse de donnÃ©es, Vertex AI pour le ML, Looker pour la BI, Pub/Sub pour les flux de donnÃ©es en temps rÃ©el, et Dataflow pour le traitement de flux. Les entreprises peuvent ainsi bÃ¢tir une stratÃ©gie data-driven complÃ¨te.",
            reponseCorrecte: "Google Cloud transforme les entreprises via : 1. BigQuery (data warehouse serverless) pour analyser les donnÃ©es clients en temps rÃ©el, 2. Vertex AI pour crÃ©er et dÃ©ployer des modÃ¨les ML sans expertise approfondie, 3. Looker pour la visualisation et la BI en self-service, 4. Pub/Sub + Dataflow pour les pipelines de donnÃ©es temps rÃ©el. Ces services permettent aux entreprises de passer d'une approche rÃ©active Ã  une approche prÃ©dictive, d'optimiser les coÃ»ts, de personnaliser l'expÃ©rience client et de crÃ©er de nouveaux revenus grÃ¢ce aux donnÃ©es.",
            grilleNotation: "100 pts: Au moins 3 services GCP nommÃ©s (BigQuery, Vertex AI, Looker, Pub/Sub, Dataflow) + cas d'usage mÃ©tier concret par service + mention de la transformation data-driven.",
            categorie: "Transformation Digitale & Data",
            type: "OUVERTE",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Une chaÃ®ne de magasins de 500 points de vente souhaite moderniser son infrastructure IT. Actuellement, chaque magasin a un serveur local qui tombe frÃ©quemment en panne. Les donnÃ©es de vente sont consolidÃ©es manuellement chaque soir. Objectifs : (1) Centraliser les donnÃ©es en temps rÃ©el, (2) Analyser les tendances de vente, (3) DÃ©ployer une application de gestion des stocks en cloud. Proposez une architecture GCP complÃ¨te.",
            explication: "DÃ©ployer Cloud VPN ou Private Google Access pour connecter chaque magasin. Utiliser Cloud Pub/Sub pour collecter les Ã©vÃ©nements de vente en temps rÃ©el. Dataflow pour le traitement des flux. BigQuery pour l'analyse. App Engine ou Cloud Run pour l'application de gestion des stocks. Looker pour les tableaux de bord.",
            reponseCorrecte: "Architecture proposÃ©e : 1. ConnectivitÃ© : Cloud VPN ou SD-WAN avec Cloud Interconnect pour relier les magasins Ã  GCP. 2. Collecte des donnÃ©es : Les PDV envoient les transactions via Cloud Pub/Sub (ingestion temps rÃ©el). 3. Traitement : Dataflow ou Dataproc pour transformer et nettoyer les donnÃ©es. 4. Stockage et analyse : BigQuery pour le data warehouse avec des tables partitionnÃ©es par date. 5. Application : Cloud Run (serverless) pour l'application de gestion des stocks, avec Cloud SQL comme base de donnÃ©es. 6. Dashboard : Looker pour les analyses et reporting aux dirigeants. 7. SÃ©curitÃ© : Cloud Armor + IAM + Cloud KMS pour le chiffrement. Avantages : donnÃ©es en temps rÃ©el, scalabilitÃ© automatique, coÃ»ts rÃ©duits de maintenance.",
            grilleNotation: "100 pts: Cloud Pub/Sub pour ingestion temps rÃ©el + BigQuery pour analyse + Cloud Run/App Engine pour app + Looker pour BI + ConnectivitÃ© (VPN/Interconnect) + Mention de la scalabilitÃ©.",
            categorie: "Architecture Data & Applications",
            type: "CAS_PRATIQUE",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
        },
    });

    // --- QUESTIONS AWS Cloud Practitioner (CLF-C02) ---
    await prisma.question.create({
        data: {
            enonce: "Quel est le principal avantage financier d'utiliser AWS plutÃ´t qu'une infrastructure sur site traditionnelle ?",
            explication: "AWS permet de remplacer des dÃ©penses d'investissement (CAPEX) par des dÃ©penses variables (OPEX), en payant uniquement pour ce que vous utilisez, sans engagement initial.",
            reponseCorrecte: "B",
            categorie: "ModÃ¨le de CoÃ»ts Cloud",
            type: "QCM",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "AWS offre une licence Ã  vie pour tous ses services" },
                    { lettre: "B", texte: "Paiement Ã  l'utilisation (Pay-as-you-go) sans coÃ»ts fixes initiaux" },
                    { lettre: "C", texte: "AWS rembourse les coÃ»ts de migration" },
                    { lettre: "D", texte: "Le cloud public est toujours moins cher que le cloud privÃ©" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service AWS permet de distribuer du trafic entrant sur plusieurs cibles (EC2, Lambda, conteneurs) de maniÃ¨re hautement disponible ?",
            explication: "Elastic Load Balancing (ELB) rÃ©partit automatiquement le trafic des applications entrantes sur plusieurs cibles et plusieurs Zones de DisponibilitÃ©.",
            reponseCorrecte: "D",
            categorie: "Haute DisponibilitÃ© & RÃ©partition",
            type: "QCM",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Amazon Route 53" },
                    { lettre: "B", texte: "AWS Global Accelerator" },
                    { lettre: "C", texte: "Amazon CloudFront" },
                    { lettre: "D", texte: "Elastic Load Balancing (ELB)" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel est l'objectif du pilier 'FiabilitÃ©' (Reliability) dans le AWS Well-Architected Framework ?",
            explication: "Le pilier FiabilitÃ© vise Ã  garantir qu'une charge de travail fonctionne de maniÃ¨re correcte et cohÃ©rente tout au long de son cycle de vie, avec une rÃ©cupÃ©ration rapide aprÃ¨s les interruptions.",
            reponseCorrecte: "B",
            categorie: "Well-Architected Framework",
            type: "QCM",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Minimiser les coÃ»ts d'infrastructure" },
                    { lettre: "B", texte: "Garantir la continuitÃ© et la rÃ©cupÃ©ration rapide aprÃ¨s un incident" },
                    { lettre: "C", texte: "SÃ©curiser les accÃ¨s et les donnÃ©es" },
                    { lettre: "D", texte: "Optimiser les performances des ressources" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quelle est la principale diffÃ©rence entre une RÃ©gion AWS et une Zone de DisponibilitÃ© (Availability Zone) ?",
            explication: "Une RÃ©gion AWS est une zone gÃ©ographique distincte composÃ©e de plusieurs AZs isolÃ©es (gÃ©nÃ©ralement 3). Une AZ est un ou plusieurs centres de donnÃ©es distincts au sein d'une rÃ©gion, avec une alimentation et un rÃ©seau indÃ©pendants.",
            reponseCorrecte: "A",
            categorie: "Infrastructure Globale",
            type: "QCM",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Une RÃ©gion contient plusieurs AZs isolÃ©es ; une AZ est un centre de donnÃ©es distinct" },
                    { lettre: "B", texte: "Une AZ contient plusieurs RÃ©gions ; une RÃ©gion est un centre de donnÃ©es" },
                    { lettre: "C", texte: "Il n'y a pas de diffÃ©rence, les termes sont interchangeables" },
                    { lettre: "D", texte: "Les AZs sont privÃ©es, les RÃ©gions sont publiques" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service AWS permet de suivre et de visualiser les coÃ»ts et l'utilisation des services AWS ?",
            explication: "AWS Cost Explorer est un outil de visualisation qui permet de comprendre, analyser et gÃ©rer vos coÃ»ts AWS avec des rapports personnalisables.",
            reponseCorrecte: "C",
            categorie: "Gestion des CoÃ»ts",
            type: "QCM",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "AWS Budgets" },
                    { lettre: "B", texte: "AWS Pricing Calculator" },
                    { lettre: "C", texte: "AWS Cost Explorer" },
                    { lettre: "D", texte: "AWS Trusted Advisor" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel modÃ¨le de dÃ©ploiement cloud AWS combine l'utilisation d'une infrastructure sur site avec les services cloud AWS ?",
            explication: "Le dÃ©ploiement hybride (Hybrid Cloud) permet de connecter l'infrastructure sur site au cloud AWS via AWS Direct Connect ou VPN, offrant une flexibilitÃ© maximale.",
            reponseCorrecte: "A",
            categorie: "ModÃ¨les de DÃ©ploiement",
            type: "QCM",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Cloud hybride" },
                    { lettre: "B", texte: "Cloud public uniquement" },
                    { lettre: "C", texte: "Cloud privÃ© uniquement" },
                    { lettre: "D", texte: "Multicloud" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Dans le modÃ¨le de responsabilitÃ© partagÃ©e AWS, le client est responsable de la sÃ©curitÃ© physique des centres de donnÃ©es AWS.",
            explication: "Faux. AWS est responsable de la sÃ©curitÃ© du cloud (sÃ©curitÃ© physique des centres de donnÃ©es, matÃ©riel, rÃ©seau). Le client est responsable de la sÃ©curitÃ© dans le cloud (donnÃ©es, configuration, IAM, OS).",
            reponseCorrecte: "B",
            categorie: "ModÃ¨le de ResponsabilitÃ© PartagÃ©e",
            type: "VRAI_FAUX",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Amazon CloudFront est un service de base de donnÃ©es en mÃ©moire entiÃ¨rement gÃ©rÃ©, permettant de rÃ©duire la latence des applications.",
            explication: "Faux. Amazon CloudFront est un service CDN (Content Delivery Network) qui accÃ©lÃ¨re la distribution de contenu statique et dynamique via un rÃ©seau mondial de points de prÃ©sence (Edge Locations).",
            reponseCorrecte: "B",
            categorie: "Services AWS Principaux",
            type: "VRAI_FAUX",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Expliquez le modÃ¨le de responsabilitÃ© partagÃ©e (Shared Responsibility Model) d'AWS. Donnez 3 exemples de responsabilitÃ©s qui incombent Ã  AWS et 3 exemples de responsabilitÃ©s qui incombent au client.",
            explication: "AWS est responsable de la sÃ©curitÃ© DU cloud (matÃ©riel, rÃ©seau, centres de donnÃ©es). Le client est responsable de la sÃ©curitÃ© DANS le cloud (donnÃ©es, IAM, OS, pare-feu applicatif).",
            reponseCorrecte: "AWS est responsable de : 1. La sÃ©curitÃ© physique des centres de donnÃ©es (contrÃ´le d'accÃ¨s, climatisation, alimentation). 2. L'infrastructure matÃ©rielle et virtualisÃ©e (hÃ´tes, hyperviseur, rÃ©seau physique). 3. Les services gÃ©rÃ©s (RDS, S3, DynamoDB) pour la couche sous-jacente. Le client est responsable de : 1. La sÃ©curitÃ© de ses donnÃ©es client (chiffrement, classification). 2. La configuration des services (Security Groups, IAM roles, buckets S3 publics/privÃ©s). 3. Les correctifs de sÃ©curitÃ© du systÃ¨me d'exploitation (pour EC2) et la gestion des identitÃ©s.",
            grilleNotation: "100 pts: Distinction claire sÃ©curitÃ© DU cloud vs DANS le cloud + 3 responsabilitÃ©s AWS (physique, matÃ©riel, services gÃ©rÃ©s) + 3 responsabilitÃ©s client (donnÃ©es, configuration, OS/IAM).",
            categorie: "SÃ©curitÃ© & ConformitÃ©",
            type: "OUVERTE",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Une PME de 50 employÃ©s souhaite migrer son infrastructure sur site vers AWS. Elle exÃ©cute actuellement : un serveur de fichiers (2 To), un serveur de base de donnÃ©es MySQL (500 Go), un serveur Web Apache (PHP), et un serveur de messagerie Exchange. Proposez une stratÃ©gie de migration complÃ¨te pour chaque composant avec les services AWS adaptÃ©s et une estimation des Ã©conomies potentielles.",
            explication: "Migrer le serveur de fichiers vers Amazon EFS ou S3 avec Storage Gateway, la base de donnÃ©es vers Amazon RDS for MySQL, le serveur Web vers Elastic Beanstalk ou EC2 + ALB, la messagerie vers Amazon WorkMail ou M365. Estimer les Ã©conomies via AWS TCO Calculator.",
            reponseCorrecte: "StratÃ©gie de migration : 1. Serveur de fichiers : AWS Storage Gateway (File Gateway) pour le cache local + Amazon S3 pour le stockage principal. 2. Base de donnÃ©es MySQL : AWS Database Migration Service (DMS) vers Amazon RDS for MySQL Multi-AZ. 3. Serveur Web : AWS Elastic Beanstalk ou EC2 Auto Scaling avec ALB pour la haute disponibilitÃ©. 4. Messagerie : Migrer vers Amazon WorkMail ou Microsoft 365 (option SaaS). Estimation des Ã©conomies : Ã‰limination des coÃ»ts matÃ©riels (serveurs, climatisation, Ã©lectricitÃ©) = environ 40% d'Ã©conomies sur 3 ans d'aprÃ¨s AWS TCO Calculator. Avantages supplÃ©mentaires : ScalabilitÃ©, sauvegardes automatiques, haute disponibilitÃ© intÃ©grÃ©e.",
            grilleNotation: "100 pts: Storage Gateway/S3 pour fichiers + RDS pour MySQL + Elastic Beanstalk/EC2+ALB pour Web + Solution de messagerie + Mention des Ã©conomies (TCO) et de la scalabilitÃ©.",
            categorie: "Migration & Architecture",
            type: "CAS_PRATIQUE",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
        },
    });

    // --- QUESTIONS AZ-900 (Batch 2) ---
    await prisma.question.create({
        data: {
            enonce: "Quel est le principal avantage d'utiliser des Zones de DisponibilitÃ© (Availability Zones) dans Azure ?",
            explication: "Les Zones de DisponibilitÃ© protÃ¨gent les applications contre les pannes de centre de donnÃ©es en les rÃ©partissant sur des emplacements physiquement sÃ©parÃ©s au sein d'une mÃªme rÃ©gion.",
            reponseCorrecte: "C",
            categorie: "Haute DisponibilitÃ©",
            type: "QCM",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "RÃ©duire la latence rÃ©seau entre les utilisateurs" },
                    { lettre: "B", texte: "Augmenter la puissance de calcul disponible" },
                    { lettre: "C", texte: "ProtÃ©ger contre les pannes d'un centre de donnÃ©es entier" },
                    { lettre: "D", texte: "Simplifier la gestion des identitÃ©s" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service Azure permet d'exÃ©cuter du code sans avoir Ã  gÃ©rer l'infrastructure serveur sous-jacente ?",
            explication: "Azure Functions est un service serverless qui exÃ©cute du code en rÃ©ponse Ã  des Ã©vÃ©nements, sans gestion de serveurs.",
            reponseCorrecte: "A",
            categorie: "Calcul Serverless",
            type: "QCM",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "Azure Functions" },
                    { lettre: "B", texte: "Azure Virtual Machines" },
                    { lettre: "C", texte: "Azure App Service" },
                    { lettre: "D", texte: "Azure Kubernetes Service" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel outil Microsoft permet d'estimer le coÃ»t des services Azure avant leur dÃ©ploiement ?",
            explication: "Le Azure Pricing Calculator est un outil web gratuit qui permet de configurer et d'estimer le coÃ»t des services Azure.",
            reponseCorrecte: "D",
            categorie: "Gestion des CoÃ»ts",
            type: "QCM",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "Azure Cost Management" },
                    { lettre: "B", texte: "Azure TCO Calculator" },
                    { lettre: "C", texte: "Azure Migrate" },
                    { lettre: "D", texte: "Azure Pricing Calculator" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service Azure offre une solution de base de donnÃ©es relationnelle entiÃ¨rement gÃ©rÃ©e avec une haute disponibilitÃ© intÃ©grÃ©e ?",
            explication: "Azure SQL Database est un service PaaS de base de donnÃ©es relationnelle qui assure automatiquement la haute disponibilitÃ©, les sauvegardes et les mises Ã  jour.",
            reponseCorrecte: "B",
            categorie: "Bases de DonnÃ©es",
            type: "QCM",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "Azure Cosmos DB" },
                    { lettre: "B", texte: "Azure SQL Database" },
                    { lettre: "C", texte: "Azure Database pour MySQL" },
                    { lettre: "D", texte: "Azure Cache for Redis" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Qu'est-ce qu'un abonnement (subscription) Azure ?",
            explication: "Un abonnement Azure est un conteneur logique qui regroupe les ressources Azure et dÃ©finit les limites de facturation, d'accÃ¨s et de gestion.",
            reponseCorrecte: "C",
            categorie: "Gouvernance",
            type: "QCM",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "Un contrat de support technique Azure" },
                    { lettre: "B", texte: "Un groupe de ressources contenant des machines virtuelles" },
                    { lettre: "C", texte: "Un conteneur logique qui regroupe des ressources et dÃ©finit les limites de facturation" },
                    { lettre: "D", texte: "Un niveau de performance pour Azure SQL Database" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel modÃ¨le de service cloud Azure fournit une plateforme de dÃ©veloppement dÃ©diÃ©e avec un environnement d'exÃ©cution gÃ©rÃ©, sans gestion de l'OS ?",
            explication: "Le PaaS (Platform as a Service) fournit une plateforme gÃ©rÃ©e incluant le runtime, la base de donnÃ©es et les outils de dÃ©veloppement. Azure App Service est un exemple de PaaS.",
            reponseCorrecte: "B",
            categorie: "Concepts Cloud",
            type: "QCM",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "IaaS (Infrastructure as a Service)" },
                    { lettre: "B", texte: "PaaS (Platform as a Service)" },
                    { lettre: "C", texte: "SaaS (Software as a Service)" },
                    { lettre: "D", texte: "FaaS (Function as a Service)" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Dans le cadre du modÃ¨le de responsabilitÃ© partagÃ©e Azure, Microsoft est responsable de la sÃ©curitÃ© physique des centres de donnÃ©es.",
            explication: "Vrai. Microsoft est responsable de la sÃ©curitÃ© physique, du rÃ©seau physique et de l'infrastructure des centres de donnÃ©es dans le cadre du modÃ¨le de responsabilitÃ© partagÃ©e.",
            reponseCorrecte: "A",
            categorie: "SÃ©curitÃ© & ConformitÃ©",
            type: "VRAI_FAUX",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Azure Marketplace permet uniquement d'acheter des licences Microsoft et ne propose pas de solutions tierces.",
            explication: "Faux. Azure Marketplace propose des milliers de solutions tierces certifiÃ©es, y compris des VM prÃ©-configurÃ©es, des conteneurs, et des services SaaS provenant d'Ã©diteurs partenaires.",
            reponseCorrecte: "B",
            categorie: "Services Azure",
            type: "VRAI_FAUX",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Comparez les trois modÃ¨les de cloud computing (public, privÃ©, hybride). Pour chaque modÃ¨le, donnez un cas d'usage concret et expliquez pourquoi Azure est particuliÃ¨rement adaptÃ© au modÃ¨le hybride.",
            explication: "Le cloud public (Azure) offre des ressources partagÃ©es via Internet. Le cloud privÃ© (Azure Stack) est dÃ©diÃ© Ã  une organisation. Le cloud hybride combine les deux. Azure est idÃ©al pour l'hybride grÃ¢ce Ã  Azure Arc, Azure Stack et VPN Gateway.",
            reponseCorrecte: "Cloud public : ressources partagÃ©es sur Internet, idÃ©al pour les startups (ex: hÃ©bergement d'un site Web). Cloud privÃ© : infrastructure dÃ©diÃ©e, adaptÃ© aux banques (ex: donnÃ©es rÃ©glementÃ©es). Cloud hybride : combinaison des deux, idÃ©al pour les entreprises avec des donnÃ©es sensibles en local (ex: banque avec App Web sur Azure + donnÃ©es clients en local). Azure se distingue par Azure Stack (cloud privÃ© sur site), Azure Arc (gestion unifiÃ©e) et une connectivitÃ© hybride native via VPN/ExpressRoute.",
            grilleNotation: "100 pts: DÃ©finition prÃ©cise des 3 modÃ¨les + 1 cas d'usage par modÃ¨le + Explication spÃ©cifique des outils hybrides Azure (Azure Stack, Arc, VPN).",
            categorie: "Concepts Cloud",
            type: "OUVERTE",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Une startup de e-commerce souhaite migrer son application Web monolithique vers Azure. Elle prÃ©voit 10 000 utilisateurs simultanÃ©s en pÃ©riode de soldes. Proposez une architecture Azure robuste en utilisant des services PaaS et IaaS, avec une estimation des coÃ»ts et des recommandations de scalabilitÃ©.",
            explication: "Utiliser Azure App Service (PaaS) pour l'application Web avec un plan de scaling automatique, Azure SQL Database pour la base de donnÃ©es avec un niveau premium, Azure Front Door pour le routage global, Azure Redis Cache pour les sessions et le cache, et Azure CDN pour les assets statiques. Activer le scaling automatique basÃ© sur le CPU et la mÃ©moire.",
            reponseCorrecte: "Architecture proposÃ©e : 1. Azure Front Door pour la terminaison SSL et le routage global 2. Azure App Service (PaaS) avec plan Premium V3 pour l'application Web, Auto-Scaling de 1 Ã  20 instances basÃ© sur CPU > 70% 3. Azure Redis Cache Premium pour le cache de session et les donnÃ©es temporaires 4. Azure SQL Database (niveau Business Critical, 2 replicas) 5. Azure CDN pour les images et assets statiques 6. Azure Key Vault pour les secrets Estimation : environ 2500-3000 â‚¬/mois en pointe. ScalabilitÃ© : Auto-Scaling App Service + Read Replicas SQL + caching Redis.",
            grilleNotation: "100 pts: Utilisation d'Azure App Service avec Auto-Scaling + Azure SQL Database + Cache (Redis) + Front Door ou CDN + Estimation cohÃ©rente des coÃ»ts.",
            categorie: "Architecture & ScalabilitÃ©",
            type: "CAS_PRATIQUE",
            certificationId: certAz900.id,
            simulationId: simuAz900.id,
        },
    });

    // --- QUESTIONS AWS SAA-C03 (Batch 2) ---
    await prisma.question.create({
        data: {
            enonce: "Quel service AWS permet de crÃ©er et de gÃ©rer des conteneurs Docker de maniÃ¨re orchestrÃ©e et scalable ?",
            explication: "Amazon ECS (Elastic Container Service) est un service d'orchestration de conteneurs entiÃ¨rement gÃ©rÃ©, prenant en charge Docker.",
            reponseCorrecte: "A",
            categorie: "Conteneurs & Orchestration",
            type: "QCM",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "Amazon ECS" },
                    { lettre: "B", texte: "Amazon EC2" },
                    { lettre: "C", texte: "AWS Lambda" },
                    { lettre: "D", texte: "AWS Batch" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service AWS fournit un pare-feu distribuÃ© pour protÃ©ger les applications Web contre les attaques courantes comme SQL injection et XSS ?",
            explication: "AWS WAF (Web Application Firewall) protÃ¨ge les applications Web en filtrant et surveillant le trafic HTTP/HTTPS.",
            reponseCorrecte: "B",
            categorie: "SÃ©curitÃ© Applicative",
            type: "QCM",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "AWS Shield" },
                    { lettre: "B", texte: "AWS WAF" },
                    { lettre: "C", texte: "AWS Network Firewall" },
                    { lettre: "D", texte: "AWS GuardDuty" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quelle solution AWS permet d'Ã©tablir une connexion rÃ©seau privÃ©e et dÃ©diÃ©e entre un centre de donnÃ©es sur site et AWS ?",
            explication: "AWS Direct Connect Ã©tablit une connexion rÃ©seau privÃ©e dÃ©diÃ©e entre votre datacenter et AWS, contournant Internet pour offrir une bande passante constante et une latence rÃ©duite.",
            reponseCorrecte: "C",
            categorie: "RÃ©seau & ConnectivitÃ©",
            type: "QCM",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "AWS Site-to-Site VPN" },
                    { lettre: "B", texte: "AWS Client VPN" },
                    { lettre: "C", texte: "AWS Direct Connect" },
                    { lettre: "D", texte: "AWS Transit Gateway" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service de base de donnÃ©es AWS est conÃ§u pour les charges de travail NoSQL haute performance Ã  l'Ã©chelle mondiale avec une latence en millisecondes ?",
            explication: "Amazon DynamoDB est une base de donnÃ©es NoSQL clÃ©-valeur et document qui offre des performances <10ms Ã  n'importe quelle Ã©chelle, avec des tables globales pour le dÃ©ploiement multi-rÃ©gion.",
            reponseCorrecte: "D",
            categorie: "Bases de DonnÃ©es NoSQL",
            type: "QCM",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "Amazon RDS" },
                    { lettre: "B", texte: "Amazon Aurora" },
                    { lettre: "C", texte: "Amazon Redshift" },
                    { lettre: "D", texte: "Amazon DynamoDB" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service AWS permet de surveiller les performances, de collecter des mÃ©triques et de configurer des alertes pour les ressources AWS ?",
            explication: "Amazon CloudWatch est le service central de surveillance et d'observabilitÃ© d'AWS. Il collecte des mÃ©triques, des logs et permet de dÃ©clencher des alertes basÃ©es sur des seuils.",
            reponseCorrecte: "A",
            categorie: "Surveillance & ObservabilitÃ©",
            type: "QCM",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "Amazon CloudWatch" },
                    { lettre: "B", texte: "AWS CloudTrail" },
                    { lettre: "C", texte: "AWS Config" },
                    { lettre: "D", texte: "AWS Trusted Advisor" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quelle stratÃ©gie de migration AWS consiste Ã  dÃ©placer une application existante vers le cloud sans modification de son code ?",
            explication: "Le Lift-and-Shift (ou Rehost) consiste Ã  migrer l'application existante vers AWS sans aucune modification, souvent via la crÃ©ation d'images VM (AMI) ou l'utilisation de AWS MGN.",
            reponseCorrecte: "B",
            categorie: "Migration Cloud",
            type: "QCM",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "Replatform (Lift, Tinker and Shift)" },
                    { lettre: "B", texte: "Rehost (Lift and Shift)" },
                    { lettre: "C", texte: "Refactor (Re-architect)" },
                    { lettre: "D", texte: "Retire" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Les Security Groups AWS sont stateful, ce qui signifie que le trafic de retour est automatiquement autorisÃ© quelle que soit la rÃ¨gle de sortie.",
            explication: "Vrai. Les Security Groups sont stateful : si une rÃ¨gle d'entrÃ©e autorise le trafic entrant, le trafic de rÃ©ponse sortant est automatiquement autorisÃ©, mÃªme sans rÃ¨gle de sortie explicite.",
            reponseCorrecte: "A",
            categorie: "SÃ©curitÃ© RÃ©seau",
            type: "VRAI_FAUX",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Amazon S3 offre une cohÃ©rence forte (strong consistency) pour toutes les opÃ©rations de lecture, Ã©criture et listage depuis 2020.",
            explication: "Vrai. Depuis dÃ©cembre 2020, Amazon S3 offre une cohÃ©rence forte pour toutes les requÃªtes GET, PUT, LIST et DELETE, y compris pour les objets crÃ©Ã©s par des opÃ©rations simultanÃ©es.",
            reponseCorrecte: "A",
            categorie: "Stockage & CohÃ©rence",
            type: "VRAI_FAUX",
            certificationId: certAws.id,
            simulationId: simuAws.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Expliquez en dÃ©tail les 6 piliers du AWS Well-Architected Framework. Pour chaque pilier, donnez un exemple concret de service AWS qui permet de le mettre en Å“uvre.",
            explication: "1. Excellence opÃ©rationnelle (AWS Systems Manager, CloudFormation) 2. SÃ©curitÃ© (IAM, KMS, WAF) 3. FiabilitÃ© (RDS Multi-AZ, Route 53) 4. EfficacitÃ© des performances (Auto Scaling, CloudFront) 5. Optimisation des coÃ»ts (Cost Explorer, Savings Plans) 6. DurabilitÃ© (S3 Intelligent-Tiering, rÃ©gions desservies par de l'Ã©nergie verte)",
            reponseCorrecte: "1. Excellence opÃ©rationnelle : automatiser les opÃ©rations avec CloudFormation et Systems Manager. 2. SÃ©curitÃ© : protÃ©ger les donnÃ©es avec IAM, KMS, AWS WAF. 3. FiabilitÃ© : RDS Multi-AZ, Route 53 health checks, Auto Scaling. 4. EfficacitÃ© des performances : Auto Scaling ELB, CloudFront, selection du bon type de stockage. 5. Optimisation des coÃ»ts : AWS Cost Explorer, Savings Plans, instances spot. 6. DurabilitÃ© : S3 Intelligent-Tiering, infrastructure Ã©co-responsable.",
            grilleNotation: "100 pts: 6 piliers nommÃ©s correctement + 1 service AWS pertinent par pilier + explication brÃ¨ve de l'application.",
            categorie: "Architecture & Bonnes Pratiques",
            type: "OUVERTE",
            certificationId: certAws.id,
            simulationId: simuAws.id,
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Une entreprise financiÃ¨re doit dÃ©ployer une application web rÃ©glementÃ©e (PCI-DSS) sur AWS avec les exigences suivantes : (1) Haute disponibilitÃ© sur 3 AZs, (2) Chiffrement des donnÃ©es au repos et en transit, (3) Isolation rÃ©seau stricte, (4) Journalisation complÃ¨te des accÃ¨s. Proposez une architecture dÃ©taillÃ©e avec les services AWS Ã  utiliser.",
            explication: "Utiliser un VPC avec 3 subnets publics/privÃ©s sur 3 AZs. ALB public, Auto Scaling EC2 (instances privÃ©es), RDS Multi-AZ (dans subnets privÃ©s), KMS pour le chiffrement, CloudTrail + CloudWatch Logs pour l'audit, Security Groups restrictifs, AWS WAF, AWS Config pour la conformitÃ©.",
            reponseCorrecte: "Architecture : 1. VPC avec 3 AZs, subnets publics (ALB, NAT Gateway) et privÃ©s (EC2, RDS) 2. ALB public avec WAF en protection des applications Web 3. Auto Scaling Group EC2 (instances dans subnets privÃ©s) avec AMI chiffrÃ©e via KMS 4. RDS PostgreSQL Multi-AZ avec chiffrement KMS et TLS pour les connexions 5. AWS CloudTrail + CloudWatch Logs pour la journalisation 6. Amazon GuardDuty + AWS Config rules PCI-DSS 7. Security Groups permettant uniquement le trafic nÃ©cessaire 8. VPC Flow Logs activÃ©s pour l'analyse rÃ©seau",
            grilleNotation: "100 pts: VPC multi-AZ avec subnets privÃ©s/publics + ALB + Auto Scaling + RDS Multi-AZ avec chiffrement KMS + CloudTrail pour audit + Security Groups + mention GuardDuty/Config.",
            categorie: "Architecture SÃ©curisÃ©e",
            type: "CAS_PRATIQUE",
            certificationId: certAws.id,
            simulationId: simuAws.id,
        },
    });

    // --- QUESTIONS CompTIA Security+ SY0-701 (Batch 2) ---
    await prisma.question.create({
        data: {
            enonce: "Quel type d'attaque consiste Ã  envoyer des requÃªtes DNS falsifiÃ©es pour rediriger les utilisateurs vers un site malveillant ?",
            explication: "L'empoisonnement du cache DNS (DNS cache poisoning ou DNS spoofing) corrompt le cache d'un serveur DNS avec des informations fausses, redirigeant le trafic vers des sites malveillants.",
            reponseCorrecte: "C",
            categorie: "Menaces RÃ©seau",
            type: "QCM",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "DNS tunneling" },
                    { lettre: "B", texte: "DNS amplification" },
                    { lettre: "C", texte: "DNS cache poisoning" },
                    { lettre: "D", texte: "DNS zone transfer" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel est l'objectif principal d'un plan de reprise d'activitÃ© (PRA / Disaster Recovery Plan) ?",
            explication: "Le PRA dÃ©finit les procÃ©dures pour restaurer les systÃ¨mes informatiques critiques aprÃ¨s une interruption majeure, avec des objectifs de temps de restauration (RTO) et de perte de donnÃ©es acceptable (RPO).",
            reponseCorrecte: "B",
            categorie: "ContinuitÃ© d'ActivitÃ©",
            type: "QCM",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "PrÃ©venir toutes les cyberattaques possibles" },
                    { lettre: "B", texte: "Restaurer les systÃ¨mes critiques dans un dÃ©lai dÃ©fini aprÃ¨s un sinistre" },
                    { lettre: "C", texte: "Assurer la conformitÃ© aux normes ISO 27001" },
                    { lettre: "D", texte: "Former les employÃ©s Ã  la cybersÃ©curitÃ©" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quelle technologie d'authentification utilise un facteur supplÃ©mentaire basÃ© sur quelque chose que l'utilisateur possÃ¨de physiquement ?",
            explication: "L'authentification multifacteur (MFA) basÃ©e sur un token matÃ©riel ou une clÃ© de sÃ©curitÃ© (FIDO2/WebAuthn) utilise quelque chose que l'utilisateur possÃ¨de (possession) en plus de quelque chose qu'il connaÃ®t (mot de passe).",
            reponseCorrecte: "B",
            categorie: "Authentification & IAM",
            type: "QCM",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "Authentification par certificat logiciel" },
                    { lettre: "B", texte: "Token matÃ©riel ou clÃ© de sÃ©curitÃ© FIDO2" },
                    { lettre: "C", texte: "Code OTP envoyÃ© par SMS" },
                    { lettre: "D", texte: "Question de sÃ©curitÃ© personnalisÃ©e" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel concept de sÃ©curitÃ© consiste Ã  segmenter le rÃ©seau en zones distinctes avec des contrÃ´les d'accÃ¨s diffÃ©rents ?",
            explication: "La segmentation rÃ©seau (network segmentation) divise le rÃ©seau en zones distinctes (DMZ, interne, administration) avec des contrÃ´les d'accÃ¨s spÃ©cifiques pour limiter la propagation des menaces.",
            reponseCorrecte: "D",
            categorie: "SÃ©curitÃ© RÃ©seau",
            type: "QCM",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "Micro-segmentation Zero Trust" },
                    { lettre: "B", texte: "DÃ©fense en profondeur" },
                    { lettre: "C", texte: "PÃ©rimÃ¨tre de sÃ©curitÃ©" },
                    { lettre: "D", texte: "Segmentation rÃ©seau" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel type de malware chiffre les fichiers d'un systÃ¨me et exige une ranÃ§on pour les dÃ©chiffrer ?",
            explication: "Le ransomware est un logiciel malveillant qui chiffre les donnÃ©es de la victime et demande un paiement (ranÃ§on) en Ã©change de la clÃ© de dÃ©chiffrement.",
            reponseCorrecte: "A",
            categorie: "Malware & Menaces",
            type: "QCM",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "Ransomware" },
                    { lettre: "B", texte: "Spyware" },
                    { lettre: "C", texte: "Rootkit" },
                    { lettre: "D", texte: "Adware" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quelle norme de sÃ©curitÃ© est spÃ©cifiquement dÃ©diÃ©e Ã  la protection des donnÃ©es bancaires et des informations de carte de crÃ©dit ?",
            explication: "PCI DSS (Payment Card Industry Data Security Standard) est la norme de sÃ©curitÃ© qui s'applique Ã  toutes les organisations qui traitent, stockent ou transmettent des donnÃ©es de cartes de crÃ©dit.",
            reponseCorrecte: "C",
            categorie: "ConformitÃ© & RÃ©glementation",
            type: "QCM",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "ISO 27001" },
                    { lettre: "B", texte: "GDPR (RGPD)" },
                    { lettre: "C", texte: "PCI DSS" },
                    { lettre: "D", texte: "HIPAA" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Le chiffrement symÃ©trique utilise une seule clÃ© pour le chiffrement et le dÃ©chiffrement, ce qui le rend plus rapide que le chiffrement asymÃ©trique.",
            explication: "Vrai. Le chiffrement symÃ©trique (AES, DES) utilise la mÃªme clÃ© pour chiffrer et dÃ©chiffrer. Il est beaucoup plus rapide que le chiffrement asymÃ©trique (RSA, ECC) qui utilise une paire de clÃ©s publique/privÃ©e.",
            reponseCorrecte: "A",
            categorie: "Cryptographie",
            type: "VRAI_FAUX",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Le RPO (Recovery Point Objective) dÃ©finit le temps maximum acceptable pour restaurer un service aprÃ¨s une interruption.",
            explication: "Faux. Le RPO (Recovery Point Objective) dÃ©finit la perte de donnÃ©es maximale acceptable (en temps), pas le temps de restauration. Le RTO (Recovery Time Objective) dÃ©finit le temps de restauration acceptable.",
            reponseCorrecte: "B",
            categorie: "ContinuitÃ© d'ActivitÃ©",
            type: "VRAI_FAUX",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "DÃ©crivez les 6 phases du processus de rÃ©ponse aux incidents (Incident Response Process) selon le NIST. Pour chaque phase, donnez une action concrÃ¨te Ã  rÃ©aliser.",
            explication: "Les phases NIST sont : 1. Preparation 2. Detection & Analysis 3. Containment, Eradication & Recovery 4. Post-Incident Activity. La version Ã©tendue ajoute Identification et Lessons Learned.",
            reponseCorrecte: "1. Preparation : Former l'Ã©quipe, dÃ©ployer des outils de dÃ©tection (SIEM, EDR). 2. Identification (Detection) : Analyser les alertes, confirmer l'incident via les logs. 3. Containment : Isoler les systÃ¨mes compromis du rÃ©seau. 4. Eradication : Supprimer le malware et corriger la vulnÃ©rabilitÃ©. 5. Recovery : Restaurer les systÃ¨mes Ã  partir de sauvegardes saines. 6. Lessons Learned : RÃ©aliser un post-mortem et mettre Ã  jour les procÃ©dures.",
            grilleNotation: "100 pts: 6 phases nommÃ©es + 1 action concrÃ¨te par phase + mention du framework NIST.",
            categorie: "RÃ©ponse aux Incidents",
            type: "OUVERTE",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Une PME de 200 employÃ©s souhaite mettre en place une stratÃ©gie de cybersÃ©curitÃ© complÃ¨te avec un budget limitÃ©. Elle utilise Microsoft 365, a un site e-commerce et des employÃ©s en tÃ©lÃ©travail. Proposez un plan de sÃ©curisation incluant : la protection des endpoints, la sÃ©curisation des accÃ¨s distants, la protection des donnÃ©es, et un plan de rÃ©ponse aux incidents.",
            explication: "Mettre en place MFA pour tous les utilisateurs, EDR (Microsoft Defender for Business), VPN/WPA3-Enterprise pour le tÃ©lÃ©travail, DLP Microsoft 365, sauvegardes automatisÃ©es avec versioning, politique de mots de passe robuste, formation des employÃ©s, et un plan de rÃ©ponse aux incidents documentÃ©.",
            reponseCorrecte: "Plan de sÃ©curisation : 1. AccÃ¨s distant : MFA obligatoire + VPN avec accÃ¨s conditionnel basÃ© sur la conformitÃ© de l'appareil. 2. Endpoints : DÃ©ploiement de Microsoft Defender for Business (EDR) sur tous les postes. 3. E-mail : Anti-phishing, DKIM/SPF/DMARC, filtrage avancÃ©. 4. Site e-commerce : WAF + certificat TLS + scan de vulnÃ©rabilitÃ©s mensuel. 5. DonnÃ©es : DLP Microsoft 365 + chiffrement BitLocker + sauvegardes 3-2-1. 6. Sensibilisation : Formation trimestrelle + simulations de phishing. 7. Incident Response : Playbook documentÃ© avec contacts, procÃ©dures d'escalade et sauvegardes hors ligne.",
            grilleNotation: "100 pts: MFA + EDR + VPN/acces conditionnel + DLP/chiffrement + sauvegardes 3-2-1 + plan de rÃ©ponse + mention de la formation.",
            categorie: "StratÃ©gie de SÃ©curitÃ©",
            type: "CAS_PRATIQUE",
            certificationId: certSecurity.id,
            simulationId: simuSecurity.id,
        },
    });

    // --- QUESTIONS GCP Digital Leader ---
    await prisma.question.create({
        data: {
            enonce: "Quel service Google Cloud permet d'exÃ©cuter des machines virtuelles avec des charges de travail gÃ©nÃ©ralistes ?",
            explication: "Google Compute Engine est le service IaaS de GCP qui permet de crÃ©er et gÃ©rer des machines virtuelles (VM) sur l'infrastructure Google.",
            reponseCorrecte: "A",
            categorie: "Calcul IaaS",
            type: "QCM",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Google Compute Engine" },
                    { lettre: "B", texte: "Google Kubernetes Engine" },
                    { lettre: "C", texte: "Google App Engine" },
                    { lettre: "D", texte: "Google Cloud Functions" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service GCP est utilisÃ© pour l'entreposage de donnÃ©es (data warehousing) et l'analyse de gros volumes de donnÃ©es avec SQL ?",
            explication: "BigQuery est le service d'entreposage de donnÃ©es serverless et hautement scalable de Google Cloud, permettant d'exÃ©cuter des requÃªtes SQL sur des pÃ©taoctets de donnÃ©es.",
            reponseCorrecte: "D",
            categorie: "Data & Analytics",
            type: "QCM",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Cloud SQL" },
                    { lettre: "B", texte: "Cloud Spanner" },
                    { lettre: "C", texte: "Firestore" },
                    { lettre: "D", texte: "BigQuery" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service Google Cloud offre un rÃ©seau de diffusion de contenu (CDN) mondial pour accÃ©lÃ©rer la livraison de contenu ?",
            explication: "Cloud CDN utilise le rÃ©seau global de Google (le mÃªme rÃ©seau qui alimente YouTube et Google Search) pour mettre en cache et diffuser le contenu Ã  proximitÃ© des utilisateurs.",
            reponseCorrecte: "B",
            categorie: "RÃ©seau & Distribution",
            type: "QCM",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Cloud Load Balancing" },
                    { lettre: "B", texte: "Cloud CDN" },
                    { lettre: "C", texte: "Cloud Armor" },
                    { lettre: "D", texte: "Cloud NAT" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel produit Google Cloud fournit une base de donnÃ©es relationnelle distribuÃ©e Ã  l'Ã©chelle mondiale avec une cohÃ©rence forte et une disponibilitÃ© de 99,999 % ?",
            explication: "Cloud Spanner est la base de donnÃ©es relationnelle distribuÃ©e de Google qui offre une cohÃ©rence forte, une scalabilitÃ© horizontale et une disponibilitÃ© de 99,999% pour les applications critiques.",
            reponseCorrecte: "C",
            categorie: "Bases de DonnÃ©es",
            type: "QCM",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Cloud SQL" },
                    { lettre: "B", texte: "Bigtable" },
                    { lettre: "C", texte: "Cloud Spanner" },
                    { lettre: "D", texte: "Firestore" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service Google Cloud permet de dÃ©ployer et gÃ©rer des applications conteneurisÃ©es avec Kubernetes sans gÃ©rer le plan de contrÃ´le ?",
            explication: "Google Kubernetes Engine (GKE) gÃ¨re automatiquement le plan de contrÃ´le Kubernetes, les mises Ã  jour et la rÃ©paration. La version Autopilot va encore plus loin en gÃ©rant aussi les nÅ“uds.",
            reponseCorrecte: "A",
            categorie: "Conteneurs & Orchestration",
            type: "QCM",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Google Kubernetes Engine (GKE)" },
                    { lettre: "B", texte: "Google Compute Engine" },
                    { lettre: "C", texte: "Cloud Run" },
                    { lettre: "D", texte: "App Engine Flexible Environment" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quelle est la principale fonction de Google Cloud IAM ?",
            explication: "Cloud IAM (Identity and Access Management) permet de gÃ©rer de maniÃ¨re centralisÃ©e les autorisations d'accÃ¨s aux ressources GCP en dÃ©finissant qui (utilisateur) a quel accÃ¨s (rÃ´le) sur quelle ressource.",
            reponseCorrecte: "B",
            categorie: "Gestion des AccÃ¨s",
            type: "QCM",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Surveiller les coÃ»ts et la consommation des ressources" },
                    { lettre: "B", texte: "GÃ©rer les autorisations d'accÃ¨s aux ressources GCP" },
                    { lettre: "C", texte: "Fournir un stockage d'objets scalable" },
                    { lettre: "D", texte: "Analyser les logs en temps rÃ©el" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Google Cloud Storage (Cloud Storage) offre une cohÃ©rence forte pour les opÃ©rations de lecture aprÃ¨s Ã©criture.",
            explication: "Vrai. Cloud Storage offre une cohÃ©rence forte (strong consistency) pour toutes les opÃ©rations : une fois qu'une Ã©criture est confirmÃ©e, toutes les lectures ultÃ©rieures retournent la valeur Ã©crite.",
            reponseCorrecte: "A",
            categorie: "Stockage",
            type: "VRAI_FAUX",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Les rÃ©seaux VPC (Virtual Private Cloud) sur Google Cloud sont limitÃ©s Ã  une seule rÃ©gion et ne peuvent pas s'Ã©tendre globalement.",
            explication: "Faux. Les VPC networks sur Google Cloud sont globaux. Un seul VPC peut s'Ã©tendre Ã  toutes les rÃ©gions du monde sans avoir besoin de peering ou de VPN inter-rÃ©gion.",
            reponseCorrecte: "B",
            categorie: "RÃ©seau",
            type: "VRAI_FAUX",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Expliquez comment Google Cloud accompagne la transformation digitale des entreprises Ã  travers les donnÃ©es et l'intelligence artificielle. Citez au moins 3 services GCP spÃ©cifiques et leur cas d'usage.",
            explication: "Google Cloud propose BigQuery pour l'analyse de donnÃ©es, Vertex AI pour le ML, Looker pour la BI, Pub/Sub pour les flux de donnÃ©es en temps rÃ©el, et Dataflow pour le traitement de flux. Les entreprises peuvent ainsi bÃ¢tir une stratÃ©gie data-driven complÃ¨te.",
            reponseCorrecte: "Google Cloud transforme les entreprises via : 1. BigQuery (data warehouse serverless) pour analyser les donnÃ©es clients en temps rÃ©el, 2. Vertex AI pour crÃ©er et dÃ©ployer des modÃ¨les ML sans expertise approfondie, 3. Looker pour la visualisation et la BI en self-service, 4. Pub/Sub + Dataflow pour les pipelines de donnÃ©es temps rÃ©el. Ces services permettent aux entreprises de passer d'une approche rÃ©active Ã  une approche prÃ©dictive, d'optimiser les coÃ»ts, de personnaliser l'expÃ©rience client et de crÃ©er de nouveaux revenus grÃ¢ce aux donnÃ©es.",
            grilleNotation: "100 pts: Au moins 3 services GCP nommÃ©s (BigQuery, Vertex AI, Looker, Pub/Sub, Dataflow) + cas d'usage mÃ©tier concret par service + mention de la transformation data-driven.",
            categorie: "Transformation Digitale & Data",
            type: "OUVERTE",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Une chaÃ®ne de magasins de 500 points de vente souhaite moderniser son infrastructure IT. Actuellement, chaque magasin a un serveur local qui tombe frÃ©quemment en panne. Les donnÃ©es de vente sont consolidÃ©es manuellement chaque soir. Objectifs : (1) Centraliser les donnÃ©es en temps rÃ©el, (2) Analyser les tendances de vente, (3) DÃ©ployer une application de gestion des stocks en cloud. Proposez une architecture GCP complÃ¨te.",
            explication: "DÃ©ployer Cloud VPN ou Private Google Access pour connecter chaque magasin. Utiliser Cloud Pub/Sub pour collecter les Ã©vÃ©nements de vente en temps rÃ©el. Dataflow pour le traitement des flux. BigQuery pour l'analyse. App Engine ou Cloud Run pour l'application de gestion des stocks. Looker pour les tableaux de bord.",
            reponseCorrecte: "Architecture proposÃ©e : 1. ConnectivitÃ© : Cloud VPN ou SD-WAN avec Cloud Interconnect pour relier les magasins Ã  GCP. 2. Collecte des donnÃ©es : Les PDV envoient les transactions via Cloud Pub/Sub (ingestion temps rÃ©el). 3. Traitement : Dataflow ou Dataproc pour transformer et nettoyer les donnÃ©es. 4. Stockage et analyse : BigQuery pour le data warehouse avec des tables partitionnÃ©es par date. 5. Application : Cloud Run (serverless) pour l'application de gestion des stocks, avec Cloud SQL comme base de donnÃ©es. 6. Dashboard : Looker pour les analyses et reporting aux dirigeants. 7. SÃ©curitÃ© : Cloud Armor + IAM + Cloud KMS pour le chiffrement. Avantages : donnÃ©es en temps rÃ©el, scalabilitÃ© automatique, coÃ»ts rÃ©duits de maintenance.",
            grilleNotation: "100 pts: Cloud Pub/Sub pour ingestion temps rÃ©el + BigQuery pour analyse + Cloud Run/App Engine pour app + Looker pour BI + ConnectivitÃ© (VPN/Interconnect) + Mention de la scalabilitÃ©.",
            categorie: "Architecture Data & Applications",
            type: "CAS_PRATIQUE",
            certificationId: certGcpDigitalLeader.id,
            simulationId: simuGcp.id,
        },
    });

    // --- QUESTIONS AWS Cloud Practitioner (CLF-C02) ---
    await prisma.question.create({
        data: {
            enonce: "Quel est le principal avantage financier d'utiliser AWS plutÃ´t qu'une infrastructure sur site traditionnelle ?",
            explication: "AWS permet de remplacer des dÃ©penses d'investissement (CAPEX) par des dÃ©penses variables (OPEX), en payant uniquement pour ce que vous utilisez, sans engagement initial.",
            reponseCorrecte: "B",
            categorie: "ModÃ¨le de CoÃ»ts Cloud",
            type: "QCM",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "AWS offre une licence Ã  vie pour tous ses services" },
                    { lettre: "B", texte: "Paiement Ã  l'utilisation (Pay-as-you-go) sans coÃ»ts fixes initiaux" },
                    { lettre: "C", texte: "AWS rembourse les coÃ»ts de migration" },
                    { lettre: "D", texte: "Le cloud public est toujours moins cher que le cloud privÃ©" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service AWS permet de distribuer du trafic entrant sur plusieurs cibles (EC2, Lambda, conteneurs) de maniÃ¨re hautement disponible ?",
            explication: "Elastic Load Balancing (ELB) rÃ©partit automatiquement le trafic des applications entrantes sur plusieurs cibles et plusieurs Zones de DisponibilitÃ©.",
            reponseCorrecte: "D",
            categorie: "Haute DisponibilitÃ© & RÃ©partition",
            type: "QCM",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Amazon Route 53" },
                    { lettre: "B", texte: "AWS Global Accelerator" },
                    { lettre: "C", texte: "Amazon CloudFront" },
                    { lettre: "D", texte: "Elastic Load Balancing (ELB)" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel est l'objectif du pilier 'FiabilitÃ©' (Reliability) dans le AWS Well-Architected Framework ?",
            explication: "Le pilier FiabilitÃ© vise Ã  garantir qu'une charge de travail fonctionne de maniÃ¨re correcte et cohÃ©rente tout au long de son cycle de vie, avec une rÃ©cupÃ©ration rapide aprÃ¨s les interruptions.",
            reponseCorrecte: "B",
            categorie: "Well-Architected Framework",
            type: "QCM",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Minimiser les coÃ»ts d'infrastructure" },
                    { lettre: "B", texte: "Garantir la continuitÃ© et la rÃ©cupÃ©ration rapide aprÃ¨s un incident" },
                    { lettre: "C", texte: "SÃ©curiser les accÃ¨s et les donnÃ©es" },
                    { lettre: "D", texte: "Optimiser les performances des ressources" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quelle est la principale diffÃ©rence entre une RÃ©gion AWS et une Zone de DisponibilitÃ© (Availability Zone) ?",
            explication: "Une RÃ©gion AWS est une zone gÃ©ographique distincte composÃ©e de plusieurs AZs isolÃ©es (gÃ©nÃ©ralement 3). Une AZ est un ou plusieurs centres de donnÃ©es distincts au sein d'une rÃ©gion, avec une alimentation et un rÃ©seau indÃ©pendants.",
            reponseCorrecte: "A",
            categorie: "Infrastructure Globale",
            type: "QCM",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Une RÃ©gion contient plusieurs AZs isolÃ©es ; une AZ est un centre de donnÃ©es distinct" },
                    { lettre: "B", texte: "Une AZ contient plusieurs RÃ©gions ; une RÃ©gion est un centre de donnÃ©es" },
                    { lettre: "C", texte: "Il n'y a pas de diffÃ©rence, les termes sont interchangeables" },
                    { lettre: "D", texte: "Les AZs sont privÃ©es, les RÃ©gions sont publiques" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel service AWS permet de suivre et de visualiser les coÃ»ts et l'utilisation des services AWS ?",
            explication: "AWS Cost Explorer est un outil de visualisation qui permet de comprendre, analyser et gÃ©rer vos coÃ»ts AWS avec des rapports personnalisables.",
            reponseCorrecte: "C",
            categorie: "Gestion des CoÃ»ts",
            type: "QCM",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "AWS Budgets" },
                    { lettre: "B", texte: "AWS Pricing Calculator" },
                    { lettre: "C", texte: "AWS Cost Explorer" },
                    { lettre: "D", texte: "AWS Trusted Advisor" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Quel modÃ¨le de dÃ©ploiement cloud AWS combine l'utilisation d'une infrastructure sur site avec les services cloud AWS ?",
            explication: "Le dÃ©ploiement hybride (Hybrid Cloud) permet de connecter l'infrastructure sur site au cloud AWS via AWS Direct Connect ou VPN, offrant une flexibilitÃ© maximale.",
            reponseCorrecte: "A",
            categorie: "ModÃ¨les de DÃ©ploiement",
            type: "QCM",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Cloud hybride" },
                    { lettre: "B", texte: "Cloud public uniquement" },
                    { lettre: "C", texte: "Cloud privÃ© uniquement" },
                    { lettre: "D", texte: "Multicloud" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Dans le modÃ¨le de responsabilitÃ© partagÃ©e AWS, le client est responsable de la sÃ©curitÃ© physique des centres de donnÃ©es AWS.",
            explication: "Faux. AWS est responsable de la sÃ©curitÃ© du cloud (sÃ©curitÃ© physique des centres de donnÃ©es, matÃ©riel, rÃ©seau). Le client est responsable de la sÃ©curitÃ© dans le cloud (donnÃ©es, configuration, IAM, OS).",
            reponseCorrecte: "B",
            categorie: "ModÃ¨le de ResponsabilitÃ© PartagÃ©e",
            type: "VRAI_FAUX",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Amazon CloudFront est un service de base de donnÃ©es en mÃ©moire entiÃ¨rement gÃ©rÃ©, permettant de rÃ©duire la latence des applications.",
            explication: "Faux. Amazon CloudFront est un service CDN (Content Delivery Network) qui accÃ©lÃ¨re la distribution de contenu statique et dynamique via un rÃ©seau mondial de points de prÃ©sence (Edge Locations).",
            reponseCorrecte: "B",
            categorie: "Services AWS Principaux",
            type: "VRAI_FAUX",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
            options: {
                create: [
                    { lettre: "A", texte: "Vrai" },
                    { lettre: "B", texte: "Faux" },
                ],
            },
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Expliquez le modÃ¨le de responsabilitÃ© partagÃ©e (Shared Responsibility Model) d'AWS. Donnez 3 exemples de responsabilitÃ©s qui incombent Ã  AWS et 3 exemples de responsabilitÃ©s qui incombent au client.",
            explication: "AWS est responsable de la sÃ©curitÃ© DU cloud (matÃ©riel, rÃ©seau, centres de donnÃ©es). Le client est responsable de la sÃ©curitÃ© DANS le cloud (donnÃ©es, IAM, OS, pare-feu applicatif).",
            reponseCorrecte: "AWS est responsable de : 1. La sÃ©curitÃ© physique des centres de donnÃ©es (contrÃ´le d'accÃ¨s, climatisation, alimentation). 2. L'infrastructure matÃ©rielle et virtualisÃ©e (hÃ´tes, hyperviseur, rÃ©seau physique). 3. Les services gÃ©rÃ©s (RDS, S3, DynamoDB) pour la couche sous-jacente. Le client est responsable de : 1. La sÃ©curitÃ© de ses donnÃ©es client (chiffrement, classification). 2. La configuration des services (Security Groups, IAM roles, buckets S3 publics/privÃ©s). 3. Les correctifs de sÃ©curitÃ© du systÃ¨me d'exploitation (pour EC2) et la gestion des identitÃ©s.",
            grilleNotation: "100 pts: Distinction claire sÃ©curitÃ© DU cloud vs DANS le cloud + 3 responsabilitÃ©s AWS (physique, matÃ©riel, services gÃ©rÃ©s) + 3 responsabilitÃ©s client (donnÃ©es, configuration, OS/IAM).",
            categorie: "SÃ©curitÃ© & ConformitÃ©",
            type: "OUVERTE",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
        },
    });

    await prisma.question.create({
        data: {
            enonce: "Une PME de 50 employÃ©s souhaite migrer son infrastructure sur site vers AWS. Elle exÃ©cute actuellement : un serveur de fichiers (2 To), un serveur de base de donnÃ©es MySQL (500 Go), un serveur Web Apache (PHP), et un serveur de messagerie Exchange. Proposez une stratÃ©gie de migration complÃ¨te pour chaque composant avec les services AWS adaptÃ©s et une estimation des Ã©conomies potentielles.",
            explication: "Migrer le serveur de fichiers vers Amazon EFS ou S3 avec Storage Gateway, la base de donnÃ©es vers Amazon RDS for MySQL, le serveur Web vers Elastic Beanstalk ou EC2 + ALB, la messagerie vers Amazon WorkMail ou M365. Estimer les Ã©conomies via AWS TCO Calculator.",
            reponseCorrecte: "StratÃ©gie de migration : 1. Serveur de fichiers : AWS Storage Gateway (File Gateway) pour le cache local + Amazon S3 pour le stockage principal. 2. Base de donnÃ©es MySQL : AWS Database Migration Service (DMS) vers Amazon RDS for MySQL Multi-AZ. 3. Serveur Web : AWS Elastic Beanstalk ou EC2 Auto Scaling avec ALB pour la haute disponibilitÃ©. 4. Messagerie : Migrer vers Amazon WorkMail ou Microsoft 365 (option SaaS). Estimation des Ã©conomies : Ã‰limination des coÃ»ts matÃ©riels (serveurs, climatisation, Ã©lectricitÃ©) = environ 40% d'Ã©conomies sur 3 ans d'aprÃ¨s AWS TCO Calculator. Avantages supplÃ©mentaires : ScalabilitÃ©, sauvegardes automatiques, haute disponibilitÃ© intÃ©grÃ©e.",
            grilleNotation: "100 pts: Storage Gateway/S3 pour fichiers + RDS pour MySQL + Elastic Beanstalk/EC2+ALB pour Web + Solution de messagerie + Mention des Ã©conomies (TCO) et de la scalabilitÃ©.",
            categorie: "Migration & Architecture",
            type: "CAS_PRATIQUE",
            certificationId: certAwsCp.id,
            simulationId: simuAwsCp.id,
        },
    });


    // 8. Ressources Téléchargeables
    console.log('📁 Ajout des ressources et fiches téléchargeables...');
    await prisma.ressource.create({
        data: {
            titre: 'Guide de Révision Officiel AZ-900 PDF',
            description: 'Synthèse complète de toutes les notions fondamentales Azure avec schémas.',
            type: 'PDF',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            public: true,
            certificationId: certAz900.id,
        },
    });

    await prisma.ressource.create({
        data: {
            titre: 'Fiche Mnémonique AWS Services & Architecture',
            description: 'Mémo visuel des 30 services AWS indispensables pour réussir SAA-C03.',
            type: 'SLIDE',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            public: true,
            certificationId: certAws.id,
        },
    });

    // 9. Cours avec Modules structurés (contenu markdown, vidéos, ressources)
    console.log('📚 Création des cours avec modules et ressources...');

    // ───── COURS 1 : Azure Fundamentals (AZ-900) ─────
    const coursAz900 = await prisma.cours.create({
        data: {
            titre: 'Microsoft Azure Fundamentals (AZ-900) - Préparation Complète',
            slug: 'azure-fundamentals-az900-preparation-complete',
            description: 'Maîtrisez les fondamentaux du Cloud Microsoft Azure et préparez efficacement l\'examen AZ-900. Ce cours couvre l\'ensemble des concepts du Cloud, les services Azure, la sécurité, la gouvernance et la gestion des coûts.',
            statut: 'PUBLIE',
            imageUrl: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&w=800&q=80',
            videoUrl: 'https://www.youtube.com/embed/NPEsD6n9A_I',
            objectifs: [
                'Comprendre les concepts fondamentaux du Cloud Computing',
                'Connaître les principaux services Azure (Compute, Stockage, Réseau)',
                'Maîtriser les concepts de sécurité et de gouvernance sur Azure',
                'Savoir gérer les coûts et optimiser les ressources Azure',
                'Être prêt pour l\'examen AZ-900',
            ],
            prerequis: [
                'Aucun prérequis technique spécifique',
                'Une connaissance de base en informatique est recommandée',
                'Une souscription Azure gratuite (optionnelle mais recommandée)',
            ],
            publicCible: [
                'Débutants en Cloud Computing',
                'Professionnels IT souhaitant se certifier AZ-900',
                'Étudiants en informatique',
                'Chefs de projet et non-techniciens',
            ],
            dureeEstimee: 480,
            datePublication: new Date(),
            formateurId: formateur.id,
            certificationId: certAz900.id,
        },
    });

    // Modules AZ-900
    const azModule1 = await prisma.module.create({
        data: {
            titre: 'Introduction au Cloud Computing',
            description: 'Découvrez les concepts fondamentaux du Cloud Computing et les modèles de déploiement.',
            ordre: 0,
            dureeEstimee: 60,
            videoUrl: 'https://www.youtube.com/embed/NPEsD6n9A_I',
            contenu: `## Introduction

Bienvenue dans ce premier module dédié aux fondamentaux du Cloud Computing. Avant de plonger dans les services Azure, il est essentiel de comprendre ce qu'est le cloud, pourquoi il a révolutionné l'industrie IT, et quels sont les différents modèles qui le composent. Ce module pose les bases nécessaires pour aborder sereinement la suite du cours et, in fine, l'examen AZ-900.

---

## Qu'est-ce que le Cloud Computing ?

Le Cloud Computing est la fourniture de services informatiques — serveurs, stockage, bases de données, mise en réseau, logiciels, analytique et intelligence artificielle — via Internet, communément appelé "le Cloud". Plutôt que de posséder et maintenir ses propres centres de données, vous louez ces ressources à un fournisseur tiers comme Microsoft Azure, AWS ou Google Cloud.

Cette approche transforme les dépenses d'investissement (CAPEX) en dépenses opérationnelles (OPEX) : au lieu d'acheter du matériel coûteux et de le maintenir sur plusieurs années, vous payez à l'usage. Cela libère les équipes IT des tâches de maintenance pour se concentrer sur l'innovation.

{{ressource:Fiche récapitulative - Modèles Cloud:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Les Modèles de Déploiement

Tous les clouds ne se ressemblent pas. Il existe trois grandes familles de déploiement, chacune adaptée à des besoins spécifiques :

### Cloud Public

Dans un cloud public, les ressources sont gérées par un fournisseur tiers (Microsoft, AWS, Google) et partagées entre plusieurs clients (multi-tenant). L'infrastructure est entièrement externalisée :
- **Avantages** : Aucun investissement initial, scalabilité illimitée, paiement à l'usage
- **Inconvénients** : Moins de contrôle sur l'infrastructure, dépendance au fournisseur
- **Exemple** : Une startup qui déploie son application sur Azure App Service sans posséder de serveur

### Cloud Privé

Le cloud privé est dédié à une seule organisation, hébergé sur site ou chez un hébergeur :
- **Avantages** : Contrôle total, conformité renforcée (secteurs réglementés)
- **Inconvénients** : Coûts élevés, maintenance interne, scalabilité limitée
- **Exemple** : Une banque qui conserve ses données sensibles dans son propre centre de données

### Cloud Hybride

Le cloud hybride combine les deux modèles précédents, avec des données et applications partagées entre l'environnement public et privé :
- **Avantages** : Flexibilité maximale, conservation des données sensibles sur site, burst dans le cloud public pour les pics de charge
- **Inconvénients** : Complexité de gestion, latence réseau entre les deux environnements
- **Exemple** : Une entreprise de e-commerce qui garde sa base clients sur site mais déploie son catalogue sur Azure pour gérer les pics de Noël

{{ressource:Comparaison des modèles de déploiement:SLIDE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Les Modèles de Service

Si les modèles de déploiement décrivent *où* se trouve votre infrastructure, les modèles de service décriment *ce que vous gérez* et *ce que le fournisseur gère*.

### IaaS (Infrastructure as a Service)

L'IaaS fournit l'infrastructure de base : machines virtuelles, stockage, réseaux. Vous êtes responsable de la configuration et de la maintenance de l'OS, des middlewares et des applications.
- **Azure correspondant** : Azure Virtual Machines, Azure Virtual Network
- **Usage typique** : Migration Lift-and-Shift d'un serveur sur site vers le cloud

### PaaS (Platform as a Service)

Le PaaS fournit une plateforme gérée pour déployer vos applications sans vous soucier de l'infrastructure sous-jacente. Le fournisseur gère l'OS, les mises à jour et la scalabilité.
- **Azure correspondant** : Azure App Service, Azure SQL Database, Azure Functions
- **Usage typique** : Déploiement d'une application Web sans gérer de serveur

### SaaS (Software as a Service)

Le SaaS fournit une application clé en main. Vous l'utilisez sans vous préoccuper ni de l'infrastructure ni de la plateforme.
- **Azure correspondant** : Microsoft 365, Dynamics 365, Power BI
- **Usage typique** : Utilisation d'Outlook ou Teams au quotidien

{{ressource:Azure Free Account - Guide d'inscription:LIEN_EXTERNE:https://azure.microsoft.com/fr-fr/free/}}

---

## Les Avantages Fondamentaux du Cloud

Le succès du cloud repose sur cinq avantages clés, systématiquement évalués à l'examen AZ-900 :

1. **Haute disponibilité** : Grâce à la redondance globale des centres de données, vos applications restent accessibles même en cas de panne d'un site
2. **Scalabilité (Scale Out)** : Ajoutez ou retirez automatiquement des ressources en fonction de la demande, sans intervention manuelle
3. **Élasticité (Scale Up/Down)** : Adaptez la puissance de vos ressources à la volée (plus de RAM, plus de CPU) sans redéploiement
4. **Paiement à l'utilisation** : Vous ne payez que ce que vous consommez, sans engagement ni coût fixe
5. **Agilité** : Déployez des ressources en quelques minutes au lieu de plusieurs semaines

> *"Le Cloud n'est pas un lieu, c'est une façon de faire de l'informatique."*

---

## Points Clés à Retenir

- Le cloud transforme le CAPEX en OPEX et libère les équipes IT des tâches de maintenance
- Trois modèles de déploiement : Public, Privé, Hybride — chacun avec ses avantages spécifiques
- Trois modèles de service : IaaS (vous gérez tout sauf le hardware), PaaS (vous gérez juste l'app), SaaS (tout est géré)
- Cinq avantages fondamentaux : haute disponibilité, scalabilité, élasticité, paiement à l'usage, agilité
- Ces concepts sont la base de l'examen AZ-900 — ils doivent être parfaitement maîtrisés`,

            coursId: coursAz900.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Fiche récapitulative - Modèles Cloud', description: 'Tableau comparatif IaaS/PaaS/SaaS avec exemples Azure', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 245000, public: true, ordre: 0, moduleId: azModule1.id },
            { titre: 'Comparaison des modèles de déploiement', description: 'Infographie interactive Cloud Public/Privé/Hybride', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 1200000, public: true, ordre: 1, moduleId: azModule1.id },
            { titre: 'Azure Free Account - Guide d\'inscription', description: 'Étape par étape pour créer votre compte Azure gratuit', type: 'LIEN_EXTERNE', url: 'https://azure.microsoft.com/fr-fr/free/', public: true, ordre: 2, moduleId: azModule1.id },
        ],
    });

    const azModule2 = await prisma.module.create({
        data: {
            titre: 'Services Principaux Azure',
            description: 'Explorez les services de calcul, de stockage et de réseau dans Azure.',
            ordre: 1,
            dureeEstimee: 90,
            videoUrl: 'https://www.youtube.com/embed/Jh9w9F45A_0',
            contenu: `## Introduction

Maintenant que nous maîtrisons les concepts fondamentaux du cloud, plongeons dans l'écosystème technique d'Azure. Ce module vous présente les services de calcul, de stockage, de base de données et de réseau proposés par Microsoft Azure. L'objectif est de comprendre à quoi sert chaque service et dans quel contexte l'utiliser — une compétence clé pour l'examen AZ-900.

---

## Services de Calcul

Le calcul est le cœur de toute infrastructure cloud. Azure propose plusieurs options, du contrôle total au tout-géré :

### Azure Virtual Machines (IaaS)

Les machines virtuelles Azure offrent la flexibilité de la virtualisation sans acheter le matériel physique. Vous choisissez l'OS (Windows Server, Ubuntu, CentOS, etc.), la puissance (vCPU, RAM), et le stockage associé.
- **Haute disponibilité** : Déployez vos VMs dans des *Availability Sets* (groupe de machines réparties sur plusieurs racks) ou des *Availability Zones* (centres de données distincts dans une même région)
- **Scale Sets** : Déployez et gérez un ensemble de VMs identiques avec auto-scaling intégré — le nombre d'instances augmente ou diminue automatiquement selon la charge
- **Cas d'usage** : Migration lift-and-shift, applications legacy, contrôle total nécessaire

{{ressource:Catalogue complet des services Azure:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

### Azure App Service (PaaS)

Azure App Service est une plateforme gérée pour héberger des applications Web, des API RESTful et des applications mobiles backend. Vous déployez votre code, Azure gère l'infrastructure, la mise à l'échelle et la haute disponibilité.
- **Langages supportés** : .NET, Java, Node.js, Python, PHP, Ruby
- **Déploiement continu** : Intégration native avec GitHub Actions, Azure DevOps, Bitbucket
- **Slots de déploiement** : Testez une nouvelle version en production avant de basculer le trafic
- **Cas d'usage** : Applications Web modernes, API, sites vitrine

### Azure Functions (Serverless)

Azure Functions exécute votre code en réponse à des événements, sans que vous ayez à provisionner ou gérer un serveur. Vous écrivez une fonction, vous définissez un déclencheur, et Azure s'occupe du reste.
- **Déclencheurs** : Requête HTTP, minuteur (CRON), message dans une queue (Azure Queue Storage), modification d'un blob, événement Event Grid
- **Facturation** : Vous payez uniquement le temps d'exécution et le nombre d'exécutions
- **Cas d'usage** : Traitement d'images uploadées, nettoyage programmé, webhooks, microservices légers

{{ressource:Lab : Déployer une VM Azure:EXERCICE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Services de Stockage

Azure propose plusieurs solutions de stockage, adaptées à différents types de données :

### Azure Blob Storage

Blob Storage est le service de stockage d'objets d'Azure, conçu pour les données non structurées : images, vidéos, documents, sauvegardes, logs.
- **Conteneurs** : Organisez vos blobs dans des conteneurs (comme des dossiers)
- **Niveaux d'accès** :
  - *Chaud* (Hot) : Accès fréquent, coût de stockage plus élevé, coût d'accès faible
  - *Froid* (Cool) : Accès peu fréquent (30+ jours), coût de stockage réduit
  - *Archive* : Données archivées (180+ jours), coût le plus bas, latence de réhydratation
- **Hiérarchie** : Compte de stockage → Conteneur → Blob
- **Cas d'usage** : Hébergement de contenu statique, sauvegarde, data lake

### Azure SQL Database

Azure SQL Database est un service de base de données relationnelle entièrement managé basé sur SQL Server. Microsoft gère l'infrastructure, les patches, les sauvegardes et la réplication.
- **Intelligence intégrée** : Indexation automatique, tuning des performances, recommendations
- **Sécurité avancée** : Transparent Data Encryption (TDE), Advanced Threat Protection, Azure AD Authentication
- **Serverless** : Option serverless qui met la base en pause en l'absence d'activité (économies)
- **Cas d'usage** : Applications transactionnelles, SaaS, migration SQL Server

### Azure Cosmos DB

Cosmos DB est une base de données NoSQL globalement distribuée, avec une prise en charge multi-modèle (document, clé-valeur, graphe, colonne).
- **Distribution multi-région** : Réplication en temps réel dans n'importe quelle région Azure (latence < 10ms au 99e percentile)
- **SLAs** : 99,999% de disponibilité en écriture, débit garanti
- **Moteurs d'API** : Core (SQL) API, MongoDB API, Cassandra API, Gremlin API, Table API
- **Cas d'usage** : Applications mondiales, IoT, e-commerce, personalisation temps réel

---

## Services Réseau

Azure met à disposition une gamme complète de services réseau :

| Service | Rôle | Usage typique |
|---------|------|---------------|
| **Azure Virtual Network (VNet)** | Réseau privé virtuel isolé | Connecter vos ressources Azure entre elles |
| **Azure Load Balancer** | Répartition de charge couche 4 | Distribuer le trafic entre plusieurs VMs |
| **Application Gateway** | WAF + répartition couche 7 | Protéger et router le trafic HTTP/HTTPS |
| **Azure VPN Gateway** | Connexion site-à-site chiffrée | Connecter votre réseau on-premise à Azure |
| **Azure DNS** | Résolution de noms de domaine | Héberger vos domaines DNS |
| **Azure CDN** | Réseau de diffusion de contenu | Accélérer la livraison de contenu statique |

---

## Points Clés à Retenir

- Azure propose trois grands types de calcul : VMs (IaaS, contrôle total), App Service (PaaS, facilité), Functions (serverless, événementiel)
- Blob Storage est le service d'objets avec trois niveaux : Hot, Cool, Archive
- Azure SQL Database est le service relationnel managé, Cosmos DB est le NoSQL global
- Le VNet est le socle réseau : tout déploiement Azure commence par un réseau virtuel
- Pour l'examen AZ-900 : retenez les cas d'usage de chaque service plutôt que les détails techniques`,

            coursId: coursAz900.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Catalogue complet des services Azure', description: 'Liste exhaustive de tous les services Azure par catégorie', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 890000, public: true, ordre: 0, moduleId: azModule2.id },
            { titre: 'Lab : Déployer une VM Azure', description: 'Exercice pratique de déploiement d\'une machine virtuelle', type: 'EXERCICE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 350000, public: true, ordre: 1, moduleId: azModule2.id },
        ],
    });

    const azModule3 = await prisma.module.create({
        data: {
            titre: 'Sécurité et Identité sur Azure',
            description: 'Protégez vos ressources avec Microsoft Entra ID, Azure Policy et Defender.',
            ordre: 2,
            dureeEstimee: 75,
            videoUrl: 'https://www.youtube.com/embed/8H2BY7n7dr4',
            contenu: `## Introduction

La sécurité est une préoccupation majeure dans le cloud. Ce module vous présente les services de sécurité et de gestion des identités d'Azure, un domaine qui pèse lourd dans l'examen AZ-900. Vous découvrirez comment Microsoft Entra ID gère les accès, comment Azure Policy impose la gouvernance, et comment le modèle de responsabilité partagée répartit les obligations entre Microsoft et vous.

---

## Microsoft Entra ID (Azure Active Directory)

Microsoft Entra ID est le service de gestion des identités et des accès (IAM) dans le cloud Microsoft. C'est l'annuaire qui fait le lien entre les utilisateurs, les applications et les ressources.

### Concepts Fondamentaux

- **Locataire (Tenant)** : Instance dédiée d'Entra ID pour votre organisation, créée automatiquement avec votre abonnement Azure ou Microsoft 365
- **Utilisateurs** : Comptes d'employés, partenaires externes (B2B) ou clients (B2C)
- **Groupes** : Collections d'utilisateurs facilitant l'assignation des permissions en masse
- **Applications** : Chaque application (interne ou SaaS) est enregistrée dans Entra ID pour gérer les accès

{{ressource:Guide MFA - Configuration pas à pas:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

### Authentification Multi-Facteur (MFA)

Le MFA est la première ligne de défense contre le vol d'identifiants. Il exige deux vérifications ou plus parmi :
- **Quelque chose que vous savez** : un mot de passe
- **Quelque chose que vous avez** : un téléphone (notification push, code TOTP), une carte à puce, une clé FIDO2
- **Quelque chose que vous êtes** : empreinte digitale, reconnaissance faciale

> **Chiffre clé** : Le MFA bloque 99,9% des attaques par compromission de mot de passe (source : Microsoft).

### Accès Conditionnel

L'accès conditionnel est le moteur de politique d'Entra ID. Il évalue en temps réel chaque tentative de connexion selon :
- **Qui** : l'utilisateur et son groupe
- **Quoi** : l'application consultée
- **Où** : l'adresse IP, le pays
- **Comment** : l'appareil (conforme ou non, géré ou BYOD)
- **Risque** : niveau de risque détecté par Entra ID Protection

Si le contexte est inhabituel (connexion depuis un pays étranger, nouvel appareil), l'accès conditionnel peut exiger une étape supplémentaire (MFA) ou blocar la connexion.

### SSO (Single Sign-On)

Le SSO permet à un utilisateur de se connecter une seule fois pour accéder à toutes ses applications, qu'elles soient dans le cloud (SaaS comme Salesforce, SAP) ou sur site. Entra ID fait office de fournisseur d'identité central.

### B2B et B2C

- **B2B** : Invitez des partenaires externes à accéder à vos applications avec leur propre identité (Azure AD, Google, Microsoft)
- **B2C** : Gérez l'authentification de vos clients (inscription, connexion, profils) avec Azure AD B2C

---

## Azure Policy

Azure Policy est un service de gouvernance qui permet de créer, assigner et gérer des règles de conformité pour vos ressources Azure :

- **Application automatique** : Les politiques sont évaluées lors de la création ou modification de ressources
- **Effets** : Les politiques peuvent *auditer* (alerter), *deny* (bloquer), ou *modify* (corriger automatiquement)
- **Initiatives** : Regroupement de plusieurs politiques pour un objectif métier (ex : "Sécurité renforcée")
- **Conformité continue** : Le tableau de bord de conformité montre l'état de toutes vos ressources en temps réel

**Exemples de politiques** : "Tous les comptes de stockage doivent activer le chiffrement", "Les VMs doivent utiliser une taille autorisée uniquement", "Bloquer le déploiement dans une région non autorisée"

{{ressource:Azure Policy - Exemples de règles:DATASET:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Microsoft Defender for Cloud

Defender for Cloud (anciennement Azure Security Center) est une plateforme unifiée de sécurité des charges de travail, qu'elles soient dans Azure, sur site ou chez un autre fournisseur cloud :

- **Secure Score** : Note de sécurité de 0 à 100% avec des recommandations hiérarchisées
- **Recommandations** : Actions concrètes pour améliorer votre posture de sécurité (ex : "Activer MFA", "Chiffrer les disques VMs")
- **Détection des menaces** : Alertes en temps réel basées sur l'apprentissage automatique et le Threat Intelligence de Microsoft
- **Just-In-Time (JIT) VM Access** : Réduisez l'exposition RDP/SSH en n'ouvrant les ports que lorsque nécessaire

---

## Le Modèle de Responsabilité Partagée

Ce concept est **central pour l'examen AZ-900** (et pour tout professionnel cloud). Il définit ce que le fournisseur sécurise et ce que le client doit sécuriser :

\`\`\`
On-Premises  → Client : Tout (matériel, réseau, OS, données, applications)
IaaS         → Client : OS + Applications + Données
              Azure   : Matériel + Réseau physique + Centres de données
PaaS         → Client : Applications + Données
              Azure   : OS + Matériel + Réseau + Plateforme
SaaS         → Client : Données uniquement
              Azure   : OS + Applications + Matériel + Réseau + Plateforme
\`\`\`

> **Règle d'or** : Quel que soit le modèle de service, la sécurité des **données** et la **gestion des accès** restent toujours de la responsabilité du client. Azure ne peut pas protéger vos données si vous ne configurez pas correctement l'authentification et le chiffrement.

---

## Points Clés à Retenir

- Microsoft Entra ID gère les identités : MFA (bloque 99,9% des attaques), accès conditionnel, SSO
- Azure Policy est un outil de gouvernance qui audite, bloque ou corrige les ressources non conformes
- Defender for Cloud centralise la sécurité : Secure Score, recommandations, détection des menaces
- Le modèle de responsabilité partagée : le client est **toujours** responsable de ses données
- La sécurité est un thème récurrent à l'examen AZ-900 (environ 25% des questions)`,

            coursId: coursAz900.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Guide MFA - Configuration pas à pas', description: 'Guide complet de déploiement de l\'authentification multifacteur', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 450000, public: true, ordre: 0, moduleId: azModule3.id },
            { titre: 'Azure Policy - Exemples de règles', description: '20 règles Azure Policy prêtes à l\'emploi', type: 'DATASET', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 12000, public: true, ordre: 1, moduleId: azModule3.id },
        ],
    });

    const azModule4 = await prisma.module.create({
        data: {
            titre: 'Gouvernance, Conformité et Gestion des Coûts',
            description: 'Apprenez à gérer et optimiser vos ressources Azure.',
            ordre: 3,
            dureeEstimee: 60,
            videoUrl: 'https://www.youtube.com/embed/2l9JVAo2o_E',
            contenu: `## Introduction

Dans un environnement cloud, les ressources peuvent se multiplier rapidement. Sans gouvernance ni contrôle des coûts, la facture peut vite grimper. Ce module vous apprend à structurer votre environnement Azure, à respecter les normes de conformité, et à maîtriser vos dépenses — trois compétences attendues à l'examen AZ-900.

---

## Gouvernance Azure

La gouvernance définit les règles et les processus qui encadrent l'utilisation des ressources Azure. Microsoft met à disposition plusieurs outils pour appliquer ces règles à grande échelle.

### Azure Blueprints

Un blueprint est un ensemble reproductible de ressources Azure qui définit l'architecture de référence d'un projet. Contrairement à un simple template ARM ou Terraform, le blueprint établit une **relation active** avec les ressources déployées :
- **Composition** : Resource Groups, policies, role assignments, ARM templates
- **Versionning** : Chaque modification crée une nouvelle version ; l'état de conformité est suivi dans le temps
- **Cycle de vie** : Mettez à jour tous les environnements (dev, staging, prod) en une seule opération

**Exemple** : Blueprint "Socle Sécurisé" qui déploie un Resource Group, applique les policies MFA et chiffrement, assigne les rôles aux équipes, et déploie un VNet de base.

### Management Groups

Les Management Groups sont des conteneurs hiérarchiques qui permettent d'appliquer des politiques et des contrôles d'accès à plusieurs abonnements Azure simultanément :

\`\`\`
Tenant Root Group
├── MG "Production"
│   ├── Abonnement "Prod-Ecommerce"
│   └── Abonnement "Prod-ERP"
├── MG "Non-Production"
│   ├── Abonnement "Dev"
│   └── Abonnement "Test"
└── MG "Sandbox"
    └── Abonnement "Expérimentation"
\`\`\`

**Avantage** : Appliquez une politique de chiffrement au niveau du Management Group "Production" et elle s'applique automatiquement à tous les abonnements enfants. Pas besoin de l'assigner 3 fois.

{{ressource:Calculateur TCO - Guide complet:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Conformité

Azure fournit l'un des portefeuilles de conformité les plus étendus du marché :

- **Offres de conformité** : Plus de 100 certifications couvrant ISO 27001, SOC 1/2/3, PCI DSS, HIPAA, HDS, RGPD, etc.
- **Microsoft Purview Compliance Manager** : Tableau de bord de conformité qui évalue votre posture, suggère des actions d'amélioration, et suit votre progression
- **Service Trust Portal** : Accédez aux rapports d'audit, aux certifications et aux documents de conformité signés par Microsoft

> **Pour l'examen** : Retenez qu'Azure propose des offres de conformité spécifiques par secteur (santé : HIPAA, finance : PCI DSS, gouvernement : FedRAMP). Le *Service Trust Portal* est la source officielle pour vérifier la conformité Azure.

---

## Gestion des Coûts

Azure propose plusieurs outils pour estimer, suivre et optimiser vos dépenses cloud :

### TCO Calculator (Calculateur de Coût Total de Possession)

Le TCO Calculator compare le coût de vos infrastructures on-premises actuelles avec le coût estimé des mêmes charges de travail sur Azure :
- **Saisie** : Spécifiez vos serveurs, bases de données, stockage et réseau actuels
- **Rapport** : Génère une comparaison détaillée incluant l'électricité, la maintenance, le personnel
- **Usage** : Argumentaire financier pour convaincre votre direction de migrer vers le cloud

### Azure Pricing Calculator

Le Pricing Calculator permet d'estimer le coût mensuel d'une solution Azure avant de la déployer :
- **Configuration** : Choisissez les services, les régions, les niveaux (Basic, Standard, Premium)
- **Options** : Ajoutez des réservations (1 an, 3 ans), Azure Hybrid Benefit, des instances spot
- **Export** : Générez un lien partageable ou un PDF de l'estimation

{{ressource:Azure Pricing Calculator:LIEN_EXTERNE:https://azure.microsoft.com/fr-fr/pricing/calculator/}}

### Azure Cost Management + Billing

Cost Management est l'outil d'analyse et d'optimisation des coûts en continu :
- **Tableaux de bord** : Visualisez vos dépenses par service, région, resource group, tag
- **Budgets** : Créez des budgets mensuels avec alertes par email (à 50%, 90%, 100%)
- **Recommandations** : Azure Advisor vous suggère des actions d'économie (VM sous-utilisées, Reserved Instances, droits d'instance)
- **Anomalies** : Détection automatique des pics de dépenses inhabituels

---

## Bonnes Pratiques d'Optimisation

1. **Utilisez des tags** : Organisez vos ressources par projet, centre de coût, environnement (tag : "Projet=ERP", "Env=Prod", "CostCenter=IT")
2. **Appliquez des budgets** : Définissez un budget par projet et activez les alertes pour éviter les dépassements
3. **Activez Azure Advisor** : Recevez des recommandations personnalisées d'optimisation (coûts, sécurité, performance)
4. **Utilisez Azure Reservations** : Réservez des ressources pour 1 ou 3 ans et économisez jusqu'à 72% par rapport au prix à la demande
5. **Azure Hybrid Benefit** : Utilisez vos licences Windows Server et SQL Server existantes sur Azure pour réduire les coûts
6. **Arrêtez les ressources inutilisées** : Identifiez et stoppez les VMs en idle, supprimez les disques non attachés

---

## Points Clés à Retenir

- Les Management Groups permettent d'appliquer des politiques à plusieurs abonnements de façon hiérarchique
- Azure Blueprints crée des environnements reproductibles avec politiques, rôles et ressources
- Le Service Trust Portal est la source officielle pour vérifier la conformité Azure
- Le TCO Calculator compare on-premises vs cloud, le Pricing Calculator estime les coûts avant déploiement
- Cost Management + Azure Advisor = optimisation continue des coûts
- Pour l'examen : sachez expliquer le rôle de chaque outil de coûts (TCO Calculator, Pricing Calculator, Cost Management)`,

            coursId: coursAz900.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Calculateur TCO - Guide complet', description: 'Guide d\'utilisation du TCO Calculator Azure', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 320000, public: true, ordre: 0, moduleId: azModule4.id },
            { titre: 'Azure Pricing Calculator', description: 'Accès direct au simulateur de coûts Azure', type: 'LIEN_EXTERNE', url: 'https://azure.microsoft.com/fr-fr/pricing/calculator/', public: true, ordre: 1, moduleId: azModule4.id },
        ],
    });

    // Module 5 - Révision et Examen Blanc AZ-900
    const azModule5 = await prisma.module.create({
        data: {
            titre: 'Révision Complète et Examen Blanc',
            description: 'Consolidez vos connaissances avec une synthèse interactive et un examen blanc chronométré.',
            ordre: 4,
            dureeEstimee: 90,
            videoUrl: 'https://www.youtube.com/embed/0LsvQy9PSfA',
            contenu: `## Introduction

Ce dernier module est conçu pour consolider l'ensemble des notions abordées dans les quatre modules précédents. Nous allons parcourir une synthèse complète du programme AZ-900, tester vos connaissances avec des questions types, et vous donner les dernières astuces pour aborder l'examen sereinement. Considérez ce module comme votre session de révision finale avant le jour J.

---

## Synthèse Complète du Programme AZ-900

L'examen AZ-900 couvre quatre grands domaines. Voici une synthèse de ce qu'il faut retenir pour chacun.

### 1. Concepts du Cloud Computing (25-30% de l'examen)

- **Modèles de service** : IaaS (VM, réseau) → Vous gérez OS + applicatif ; PaaS (App Service, SQL) → Vous gérez l'app uniquement ; SaaS (M365) → Tout est géré
- **Modèles de déploiement** : Public (mutualisé, élastique), Privé (dédié, contrôle total), Hybride (flexibilité maximale)
- **Avantages fondamentaux** : Haute disponibilité, élasticité, scalabilité, paiement à l'usage, agilité
- **Modèle de responsabilité partagée** : Le client est **toujours** responsable de ses données et de la gestion des accès

{{ressource:Fiche récapitulative - Modèles Cloud:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

### 2. Services Azure Principaux (30-35% de l'examen)

| Catégorie | Services à connaître | Cas d'usage |
|-----------|---------------------|-------------|
| Calcul | VM, App Service, Functions, AKS, Container Instances | Hébergement d'applications, traitement batch, migration |
| Stockage | Blob (Hot/Cool/Archive), Disk, Files | Sauvegardes, contenu statique, partage de fichiers |
| Base de données | SQL Database, Cosmos DB, MySQL, PostgreSQL | Applications transactionnelles, données globales |
| Réseau | VNet, Load Balancer, VPN Gateway, CDN | Connectivité, répartition de charge, accélération |

### 3. Sécurité, Identité et Gouvernance (25-30% de l'examen)

- **Microsoft Entra ID** : IAM, MFA, accès conditionnel, SSO — le centre des identités
- **Azure Policy** : Applique des règles de gouvernance (audit, deny, modify) à grande échelle
- **Defender for Cloud** : Secure Score, recommandations, détection des menaces unifiée
- **Azure Sentinel** : SIEM cloud natif pour l'analyse des menaces et la réponse aux incidents
- **Modèle de responsabilité partagée** : À connaître par cœur pour l'examen

### 4. Gestion des Coûts et Conformité (10-15% de l'examen)

- **TCO Calculator** : Compare on-premises vs Azure pour justifier la migration
- **Pricing Calculator** : Estime le coût avant déploiement
- **Cost Management** : Budgets, alertes, recommandations, optimisation continue
- **Azure Reservations + Hybrid Benefit** : Jusqu'à 72% d'économie avec les réservations
- **Service Trust Portal** : Source officielle des certifications de conformité Azure

{{ressource:Guide de Révision Officiel AZ-900 PDF:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## 10 Questions Types pour l'Examen

Testez vos connaissances avec ces questions représentatives du format AZ-900 :

**Q1 : Quel est l'avantage principal du Cloud Computing ?**
- A. Éliminer tous les coûts IT ❌
- B. Payer uniquement ce que vous consommez ✅
- C. Supprimer le besoin de sécurité ❌

**Q2 : Quel service Azure fournit des machines virtuelles ?**
- A. App Service ❌ (PaaS)
- B. Azure VMs ✅ (IaaS)
- C. Azure SQL ❌ (PaaS)

**Q3 : Dans le modèle SaaS, qui est responsable de la sécurité de l'OS ?**
- A. Le client ❌
- B. Le fournisseur ✅
- C. Les deux ❌

**Q4 : Quel service Azure gère les identités et les accès ?**
- A. Azure Policy ❌
- B. Microsoft Entra ID ✅
- C. Azure Firewall ❌

**Q5 : Quel outil permet d'estimer les économies réalisées en migrant vers Azure ?**
- A. Pricing Calculator ❌
- B. TCO Calculator ✅
- C. Cost Management ❌

**Q6 : Quelle est la durabilité des données dans Azure Blob Storage ?**
- A. 99,9% ❌
- B. 99,99% ❌
- C. 99,999999999% (11 nines) ✅

**Q7 : Quel modèle de déploiement cloud combine cloud public et cloud privé ?**
- A. Cloud public ❌
- B. Cloud privé ❌
- C. Cloud hybride ✅

**Q8 : Quel service PaaS Azure permet de déployer des applications Web sans gérer de serveur ?**
- A. Azure VMs ❌
- B. Azure App Service ✅
- C. Azure Functions ❌

**Q9 : Quel service Azure analyse vos dépenses et recommande des économies ?**
- A. Azure Advisor ✅
- B. Azure Policy ❌
- C. Azure Monitor ❌

**Q10 : Qui est responsable de la sécurité des données dans le modèle de responsabilité partagée ?**
- A. Microsoft ❌
- B. Le client ✅
- C. Les deux à 50% ❌

{{ressource:Simulation interactive AZ-900:LIEN_EXTERNE:https://learn.microsoft.com/fr-fr/credentials/certifications/azure-fundamentals/practice/assessment?assessment-type=practice&assessment-assessmentId=6}}

---

## Conseils pour le Jour de l'Examen

1. **Gérez votre temps** : 60 minutes pour 40-60 questions, soit environ 1 minute par question. Passez si vous bloquez et revenez plus tard
2. **Lisez 2 fois chaque question** : Les questions AZ-900 testent la **compréhension**, pas la mémorisation. Les mots-clés comme "le plus", "toujours", "jamais" sont souvent des pièges
3. **Éliminez les réponses incorrectes** : Même si vous n'êtes pas sûr, éliminez 1 ou 2 réponses pour augmenter vos chances
4. **Ne changez pas votre première réponse** : Sauf si vous êtes certain de l'erreur, votre premier instinct est souvent le bon
5. **Respirez** : L'examen est noté sur 700/1000. Vous avez le droit à l'erreur

{{ressource:Examen Blanc AZ-900 - 50 Questions:EXERCICE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Points Clés à Retenir

- Les 4 domaines de l'examen : Concepts Cloud (25-30%), Services Azure (30-35%), Sécurité (25-30%), Coûts (10-15%)
- Le modèle de responsabilité partagée est le concept le plus testé
- Les mots-clés sont vos meilleurs alliés pour lire les questions
- La pratique est la clé : faites un maximum d'examens blancs avant le jour J`,

            coursId: coursAz900.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Examen Blanc AZ-900 - 50 Questions', description: 'Simulation complète d\'examen avec correction détaillée', type: 'EXERCICE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 1200000, public: true, ordre: 0, moduleId: azModule5.id },
            { titre: 'Checklist de Révision AZ-900', description: 'Liste de vérification de tous les domaines d\'examen', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 180000, public: true, ordre: 1, moduleId: azModule5.id },
            { titre: 'Microsoft Learn - Practice Assessment', description: 'Évaluation d\'entraînement officielle Microsoft', type: 'LIEN_EXTERNE', url: 'https://learn.microsoft.com/fr-fr/credentials/certifications/azure-fundamentals/practice/assessment', public: true, ordre: 2, moduleId: azModule5.id },
        ],
    });

    // ───── COURS 2 : AWS Solutions Architect (SAA-C03) ─────
    const coursAws = await prisma.cours.create({
        data: {
            titre: 'AWS Solutions Architect Associate (SAA-C03) - Formation Expert',
            slug: 'aws-solutions-architect-saa-c03-formation-expert',
            description: 'Devenez un architecte cloud AWS certifié. Ce cours complet vous prépare à l\'examen SAA-C03 avec des architectures réelles, des labs pratiques et des études de cas.',
            statut: 'PUBLIE',
            imageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
            videoUrl: 'https://www.youtube.com/embed/ZmU2q9A10Ns',
            objectifs: [
                'Concevoir des architectures AWS hautement disponibles et résilientes',
                'Maîtriser les services de stockage, base de données et réseau AWS',
                'Implémenter la sécurité et la conformité sur AWS',
                'Optimiser les coûts et les performances des solutions AWS',
                'Se préparer efficacement à l\'examen SAA-C03',
            ],
            prerequis: [
                'Connaissances de base en réseau et administration système',
                'Expérience avec les environnements cloud (1 an recommandé)',
                'Compréhension des bases de données et du stockage',
            ],
            publicCible: [
                'Architectes cloud et ingénieurs infrastructure',
                'Développeurs souhaitant évoluer vers le cloud',
                'Professionnels IT en reconversion vers AWS',
                'Toute personne préparant la certification SAA-C03',
            ],
            dureeEstimee: 1200,
            datePublication: new Date(),
            formateurId: formateur.id,
            certificationId: certAws.id,
        },
    });

    const awsModule1 = await prisma.module.create({
        data: {
            titre: 'Introduction à AWS et Architecture Globale',
            description: 'Comprenez l\'infrastructure globale AWS et les principes fondamentaux d\'architecture.',
            ordre: 0,
            dureeEstimee: 90,
            videoUrl: 'https://www.youtube.com/embed/ZmU2q9A10Ns',
            contenu: `## Introduction

Bienvenue dans ce premier module AWS SAA-C03. Avant de concevoir des architectures, il est essentiel de comprendre l'infrastructure globale sur laquelle reposent tous les services AWS. Ce module couvre les régions et zones de disponibilité, le framework Well-Architected, et le modèle de responsabilité partagée — des concepts fondamentaux qui reviennent systématiquement à l'examen.

---

## Infrastructure Globale AWS

AWS possède l'infrastructure cloud la plus étendue et la plus mature du marché, avec **33 régions**, **105 zones de disponibilité**, et **plus de 600 points de présence** dans le monde. Cette couverture mondiale permet de déployer des applications à proximité de vos utilisateurs, où qu'ils se trouvent.

### Régions et Zones de Disponibilité (AZ)

Une **Région** AWS est un emplacement géographique distinct, composé d'au moins trois zones de disponibilité isolées. Par exemple, la région eu-west-3 correspond à Paris.

Les **Zones de Disponibilité (Availability Zones)** sont des centres de données distincts situés à quelques kilomètres les uns des autres (latence < 2ms), mais suffisamment éloignés pour être indépendants en cas de sinistre. Chaque AZ dispose de son propre alimentation électrique, refroidissement et réseau physique.

Cette architecture est la clé de la **haute disponibilité** : en déployant vos ressources sur au moins deux AZs, vous garantissez la continuité de service même si l'une d'elles tombe en panne.

### Points de Présence (Edge Locations)

Les **Edge Locations** sont des sites de cache répartis dans le monde entier (600+), utilisés par **CloudFront** (CDN) et **Route 53** (DNS) pour accélérer la distribution de contenu. Quand un utilisateur accède à votre site, le contenu statique est servi depuis l'Edge Location le plus proche, réduisant la latence.

{{ressource:Carte des régions AWS:SLIDE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Les 6 Piliers du Well-Architected Framework

Le **AWS Well-Architected Framework** est un ensemble de bonnes pratiques pour concevoir des architectures cloud fiables, sécurisées et optimisées. Il repose sur six piliers :

1. **Operational Excellence** : Automatisez les opérations, surveillez en continu, améliorez les processus
2. **Security** : IAM, chiffrement, moindre privilège — protégez les données et les systèmes
3. **Reliability** : Haute disponibilité, reprise après sinistre, scalabilité
4. **Performance Efficiency** : Choisissez les bonnes ressources pour chaque charge de travail
5. **Cost Optimization** : Payez pour ce dont vous avez besoin, éliminez le gaspillage
6. **Sustainability** : Minimisez l'impact environnemental de vos architectures

> **Pour l'examen** : Connaître les six piliers est indispensable. On vous demandera de les identifier ou de les associer à des bonnes pratiques spécifiques.

{{ressource:AWS Well-Architected Framework:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Le Modèle de Responsabilité Partagée AWS

Ce modèle est **central pour SAA-C03** et toutes les certifications AWS. Il définit ce qu'AWS sécurise et ce que vous devez sécuriser :

- **AWS est responsable de la sécurité DE l'infrastructure** : Centres de données, matériel, réseau physique, hyperviseurs. "Security of the Cloud"
- **Vous êtes responsable de la sécurité DANS l'infrastructure** : OS des instances, applications, données, configurations IAM, pare-feu (Security Groups), chiffrement côté client. "Security in the Cloud"

> **Règle d'or pour l'examen** : Le client est toujours responsable de la gestion des accès (IAM), du chiffrement des données côté client, et de la sécurité de l'OS sur les instances EC2. Même dans un service managé comme RDS, vous configurez les Security Groups et le chiffrement.

---

## Points Clés à Retenir

- Une **Région** = zone géographique, une **AZ** = centre de données isolé dans une région (3+ par région)
- Les **Edge Locations** servent le contenu via CloudFront (CDN) et Route 53 (DNS)
- Le **Well-Architected Framework** a 6 piliers : Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability
- Le **modèle de responsabilité partagée** : AWS sécurise l'infrastructure, vous sécurisez ce qui tourne dessus
- Pour l'examen : savoir identifier quel pilier correspond à quelle pratique, et qui est responsable de quoi dans le modèle partagé`,

            coursId: coursAws.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Carte des régions AWS', description: 'Carte interactive de toutes les régions et AZs AWS', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 2100000, public: true, ordre: 0, moduleId: awsModule1.id },
            { titre: 'AWS Well-Architected Framework', description: 'Document officiel détaillant les 6 piliers', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 1800000, public: true, ordre: 1, moduleId: awsModule1.id },
        ],
    });

    const awsModule2 = await prisma.module.create({
        data: {
            titre: 'Stockage et Bases de Données AWS',
            description: 'Maîtrisez S3, EBS, EFS, RDS, DynamoDB et les stratégies de sauvegarde.',
            ordre: 1,
            dureeEstimee: 120,
            videoUrl: 'https://www.youtube.com/embed/_7jOniPqWAs',
            contenu: `## Introduction

Le stockage et les bases de données représentent une part importante de l'examen SAA-C03 (environ 15-20% des questions). Dans ce module, nous explorons les services de stockage et de base de données AWS : quand utiliser S3 vs EBS vs EFS, comment dimensionner RDS, et pourquoi DynamoDB est le choix NoSQL par excellence.

---

## Amazon S3 — Stockage d'Objets

S3 est probablement le service AWS le plus connu. Il offre un stockage d'objets avec une durabilité de **99,999999999%** (11 nines) et une disponibilité de 99,99%.

### Classes de Stockage

S3 propose plusieurs classes adaptées à la fréquence d'accès :

| Classe | Utilisation | Coût stockage | Coût accès |
|--------|-------------|---------------|------------|
| **S3 Standard** | Données fréquemment accédées | Élevé | Très faible |
| **S3 Intelligent-Tiering** | Accès variable (auto) | Moyen | Faible |
| **S3 Standard-IA** | Accès peu fréquent (>30 jours) | Faible | Élevé |
| **S3 One Zone-IA** | Données non critiques | Très faible | Élevé |
| **S3 Glacier Instant Retrieval** | Archives avec accès rapide | Faible | Élevé |
| **S3 Glacier Flexible Retrieval** | Archives (minutes à heures) | Très faible | Très élevé |
| **S3 Glacier Deep Archive** | Archives long terme (12h+) | Minimal | Très élevé |

### Fonctionnalités Clés pour SAA-C03

- **S3 Versioning** : Protège contre les suppressions accidentelles — plusieurs versions d'un même objet sont conservées
- **S3 Lifecycle Policies** : Automatise la transition entre classes (ex : Standard → IA à 30 jours → Glacier à 90 jours)
- **S3 Replication** : Réplication cross-région (CRR) pour la conformité, ou même région (SRR) pour l'agrégation des logs
- **S3 Transfer Acceleration** : Accélère les uploads via les Edge Locations CloudFront
- **S3 Presigned URLs** : Accès temporaire à un objet sans rendre le bucket public
- **S3 Object Lock** : Empêche la suppression ou modification d'objets (WORM — Write Once Read Many)

{{ressource:Comparatif des services de stockage AWS:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Amazon EBS — Stockage par Blocs

EBS (Elastic Block Store) fournit des volumes de stockage par blocs persistants attachés à vos instances EC2. Contrairement à S3 qui est accessible via API HTTP, EBS se comporte comme un disque dur virtuel.

### Types de Volumes EBS

- **gp3** : General Purpose SSD, 3000 IOPS de base, 16 000 IOPS max — le standard pour 95% des cas
- **io2 / io2 Block Express** : Provisioned IOPS SSD, jusqu'à 256 000 IOPS — pour bases de données haute performance
- **st1** : Throughput Optimized HDD — pour le big data et le streaming
- **sc1** : Cold HDD — pour les sauvegardes peu fréquentes

### Snapshots EBS

Les snapshots sont des sauvegardes **incrémentielles** des volumes EBS, stockées dans S3. Seuls les blocs modifiés depuis le dernier snapshot sont sauvegardés, ce qui économise du temps et de l'espace de stockage.

> **Cas d'usage typique** : Snapshot quotidien d'une base RDS ou d'un volume EBS, conservé 30 jours avec lifecycle policy.

---

## Amazon RDS — Bases de Données Relationnelles

RDS (Relational Database Service) est le service de base de données relationnelle managé d'AWS. Il supporte MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, et la base propriétaire Amazon Aurora.

### RDS Multi-AZ

Le déploiement **Multi-AZ** crée une réplique synchrone dans une autre AZ pour la haute disponibilité. En cas de panne de l'instance principale, RDS bascule automatiquement vers la réplique (60-120 secondes). Le même endpoint DNS est conservé — l'application ne voit pas le changement.

### Read Replicas

Les **Read Replicas** permettent de décharger les lectures de l'instance principale. La réplication est asynchrone (latence < 1 seconde). Utile pour les applications à fort trafic de lecture (rapports, analytics). Vous pouvez avoir jusqu'à 15 Read Replicas par base.

{{ressource:Lab : Setup RDS Multi-AZ:EXERCICE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Amazon DynamoDB — NoSQL

DynamoDB est la base de données NoSQL clé-valeur et document d'AWS, avec des performances en millisecondes à n'importe quelle échelle.

- **Serverless** : Pas d'infrastructure à gérer, scalabilité automatique
- **Mode capacité** : On-Demand (payez par requête) ou Provisioned (capacité réservée pour les workloads prévisibles)
- **DAX (DynamoDB Accelerator)** : Cache en mémoire pour les lectures à haute vitesse (microsecondes)
- **DynamoDB Streams** : Flux de modifications en temps réel pour déclencher des événements (Lambda)
- **Global Tables** : Réplication multi-région active-active pour les applications mondiales

> **Pour SAA-C03** : On choisit DynamoDB pour les workloads NoSQL nécessitant une latence inférieure à 10ms, une scalabilité massive, et un modèle serverless. Pour les données transactionnelles ACID complexes, on préfère RDS Aurora.

---

## Points Clés à Retenir

- **S3** : Stockage d'objets (11 nines), 7 classes de stockage, versioning, lifecycle, replication, presigned URLs
- **EBS** : Stockage par blocs pour EC2, snapshots incrémentiels, types gp3/io2/st1/sc1
- **RDS** : Relationnel managé, Multi-AZ (HA synchrone), Read Replicas (scale lecture asynchrone)
- **DynamoDB** : NoSQL serverless, DAX (cache), Streams, Global Tables
- À l'examen : sachez quel service de stockage choisir selon le cas d'usage (S3 pour objets, EBS pour blocs, EFS pour fichiers partagés, RDS pour relationnel, DynamoDB pour NoSQL)`,

            coursId: coursAws.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Comparatif des services de stockage AWS', description: 'Tableau comparatif S3/EBS/EFS/Glacier', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 520000, public: true, ordre: 0, moduleId: awsModule2.id },
            { titre: 'Lab : Setup RDS Multi-AZ', description: 'Exercice pratique de déploiement d\'une base de données haute disponibilité', type: 'EXERCICE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 410000, public: true, ordre: 1, moduleId: awsModule2.id },
        ],
    });

    const awsModule3 = await prisma.module.create({
        data: {
            titre: 'Sécurité AWS et IAM',
            description: 'Gérez les identités, les accès et la sécurité de votre infrastructure AWS.',
            ordre: 2,
            dureeEstimee: 90,
            videoUrl: 'https://www.youtube.com/embed/1NSTaR5YFvA',
            contenu: `## Introduction

La sécurité est le domaine le plus important de l'examen SAA-C03 (30% des questions). Ce module couvre IAM, la gestion des identités et des accès, ainsi que les services de protection comme Shield, WAF et KMS. Comprendre comment sécuriser une architecture AWS est ce qui distingue un bon architecte cloud d'un architecte junior.

---

## AWS IAM — Identity and Access Management

IAM est le service central de gestion des identités et des accès sur AWS. Tout passe par IAM : qui peut faire quoi sur quelle ressource.

### Utilisateurs, Groupes et Rôles

- **Utilisateurs IAM** : Identités permanentes représentant des personnes physiques ou des applications. Chaque utilisateur a un nom unique et des credentials (mot de passe console, clés d'accès API).
- **Groupes IAM** : Collections d'utilisateurs. Au lieu d'assigner des permissions à chaque utilisateur individuellement, vous assignez des politiques au groupe. Exemple : groupe "Admin" avec politique AdministrateurAccess, groupe "Dev" avec politique限制.
- **Rôles IAM** : Identités temporaires assumées par une entité de confiance (utilisateur, service AWS, compte externe). Contrairement aux utilisateurs, les rôles n'ont pas de credentials permanents — ils génèrent des credentials temporaires via STS (Security Token Service).

{{ressource:IAM Best Practices Guide:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

### Politiques IAM

Une politique IAM est un document JSON qui définit les permissions. Il existe trois types :

- **AWS Managed Policies** : Créées et maintenues par AWS (ex : AmazonS3ReadOnlyAccess). À privilégier quand elles existent.
- **Customer Managed Policies** : Créées par vos soins. Utiles pour des besoins spécifiques non couverts par les politiques AWS.
- **Inline Policies** : Intégrées directement à un seul utilisateur, groupe ou rôle. À éviter sauf cas particulier (relation 1:1).

Exemple de politique "Lecture seule S3" :

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": ["arn:aws:s3:::mon-bucket/*"]
  }]
}
\`\`\`

### Bonnes Pratiques IAM (à connaître pour l'examen)

1. **Root account** : Activez MFA, ne l'utilisez **jamais** pour les tâches quotidiennes — créez des utilisateurs IAM admin
2. **Moindre privilège** : Donnez le strict minimum de permissions nécessaires. Commencez avec aucune permission, ajoutez progressivement
3. **Rôles plutôt que clés d'accès** : Préférez les rôles IAM aux clés d'accès pour les applications. Les clés sont permanentes, les rôles génèrent des credentials temporaires
4. **Conditions IAM** : Utilisez les conditions (SourceIP, MFA_Auth, aws:CurrentTime) pour renforcer la sécurité
5. **IAM Access Analyzer** : Analysez les politiques pour détecter les accès non intentionnels

{{ressource:AWS Security Reference Architecture:SLIDE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## AWS Shield et WAF

### AWS Shield

- **Shield Standard** : Protection DDoS gratuite pour tous les clients AWS (couche 3/4). Activée par défaut sur CloudFront, Route 53, ELB.
- **Shield Advanced** : Protection DDoS renforcée (3 000 $/mois). Inclut la couche 7, la détection avancée, l'atténuation des attaques volumétriques et le support 24/7 de l'équipe DRT (DDoS Response Team).

### AWS WAF (Web Application Firewall)

WAF est un firewall applicatif qui filtre les requêtes HTTP/HTTPS au niveau de CloudFront, ALB, API Gateway ou AppSync. Il protège contre :
- **SQL injection** : Bloque les tentatives d'injection SQL dans les paramètres de requête
- **Cross-site scripting (XSS)** : Bloque les scripts malveillants dans les champs de formulaire
- **Rate-based rules** : Limite le nombre de requêtes par IP (protection contre le brute-force)
- **Règles gérées** : AWS fournit des règles préconfigurées (OWASP Top 10, bot control, etc.)

---

## AWS KMS et Chiffrement

### AWS Key Management Service (KMS)

KMS est le service central de gestion des clés de chiffrement. Il est intégré à la plupart des services AWS (S3, EBS, RDS, Lambda) :

- **CMKs (Customer Master Keys)** : Vos clés de chiffrement, gérées par AWS ou par vous (Customer Managed CMK)
- **Automatic key rotation** : Rotation annuelle automatique pour les CMKs
- **Envelope encryption** : Chaque donnée est chiffrée avec une Data Key unique, elle-même chiffrée par votre CMK
- **CloudHSM** : Module de sécurité matériel dédié (pour les charges de travail nécessitant un HSM certifié FIPS 140-2 Level 3)

> **Pour SAA-C03** : Sachez que S3 gère le chiffrement côté serveur (SSE-S3, SSE-KMS, SSE-C). EBS chiffre avec KMS par défaut. RDS peut chiffrer au repos avec KMS. DynamoDB chiffre au repos avec KMS.

---

## Points Clés à Retenir

- **IAM** : Utilisateurs (identités permanentes), Groupes (permissions partagées), Rôles (permissions temporaires via STS)
- **Best practices** : MFA sur root, moindre privilège, rôles > clés, conditions IAM
- **Shield** : Standard (gratuit, couche 3/4), Advanced (payant, couche 7 + DRT)
- **WAF** : Firewall applicatif (SQLi, XSS, rate limiting) pour CloudFront, ALB, API Gateway
- **KMS** : Gestion centralisée des clés, intégré à tous les services AWS
- La sécurité = 30% de l'examen — maîtrisez IAM, KMS et le chiffrement`,

            coursId: coursAws.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'IAM Best Practices Guide', description: 'Guide officiel des meilleures pratiques IAM', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 680000, public: true, ordre: 0, moduleId: awsModule3.id },
            { titre: 'AWS Security Reference Architecture', description: 'Architecture de sécurité de référence AWS', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 3400000, public: true, ordre: 1, moduleId: awsModule3.id },
        ],
    });

    // Module 4 - Mise en Réseau, CDN et DNS
    const awsModule4 = await prisma.module.create({
        data: {
            titre: 'Mise en Réseau, CloudFront et Route 53',
            description: 'Maîtrisez les services réseau AWS : VPC, CloudFront CDN, Route 53 DNS et les architectures hybrides.',
            ordre: 3,
            dureeEstimee: 110,
            videoUrl: 'https://www.youtube.com/embed/RADwQj_VajA',
            contenu: `## Introduction

Le réseau est le socle de toute architecture AWS. Sans une conception VPC correcte, vos applications ne peuvent ni communiquer entre elles ni être accessibles depuis Internet. Ce module couvre en détail le VPC, ses composants, les options de connectivité hybride, CloudFront (CDN) et Route 53 (DNS) — tous des sujets fréquents à l'examen SAA-C03.

---

## Amazon VPC — Virtual Private Cloud

Le VPC est votre réseau privé virtuel isolé dans AWS. C'est le point de départ de toute architecture — vous ne déployez rien sans VPC.

### Composants d'un VPC

- **Subnets** : Segments du VPC associés à une AZ spécifique. Publics (avec Internet Gateway) pour les load balancers, NAT Gateways et bastions. Privés (sans accès Internet direct) pour les EC2, RDS et autres services internes.
- **Route Tables** : Chaque subnet est associé à une table de routage qui définit comment le trafic est dirigé (vers Internet, vers un autre VPC, vers on-premise).
- **Internet Gateway (IGW)** : Point d'entrée/sortie depuis Internet vers les subnets publics. Un VPC peut avoir un seul IGW.
- **NAT Gateway / NAT Instance** : Permet aux instances dans les subnets privés d'accéder à Internet (mises à jour, API externes) sans être accessibles depuis l'extérieur.
- **Security Groups** : Firewall ***stateful*** au niveau de l'instance. Par défaut, tout le trafic entrant est bloqué, tout le trafic sortant est autorisé. Si vous autorisez le trafic entrant, le trafic sortant de réponse est automatiquement autorisé.
- **Network ACLs (NACL)** : Firewall ***stateless*** au niveau du subnet. Contrairement aux Security Groups, les NACL nécessitent des règles explicites pour le trafic entrant ET sortant. Chaque règle a un numéro et un sens (Allow/Deny).

{{ressource:Diagramme d'architecture VPC Multi-AZ:SLIDE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

### VPC Endpoints

Les VPC Endpoints permettent de se connecter aux services AWS (S3, DynamoDB, Lambda, etc.) sans passer par Internet. Deux types :

- **Gateway Endpoint** : Pour S3 et DynamoDB uniquement. Gratuit. Ajout d'une entrée dans la route table.
- **Interface Endpoint** (AWS PrivateLink) : Pour les autres services AWS. Payant. Crée une ENI (Elastic Network Interface) dans le subnet.

> **Pour SAA-C03** : Les VPC Endpoints sont un sujet récurrent. On les utilise pour sécuriser l'accès à S3 depuis un subnet privé sans NAT Gateway — plus sécurisé et moins cher.

### Connectivité Hybride

- **AWS VPN** : Connexion site-à-site chiffrée via Internet entre votre réseau on-premise et votre VPC. Utilise IPsec. Rapide à mettre en place, latence variable.
- **AWS Direct Connect** : Connexion physique dédiée entre votre datacenter et AWS. Latence réduite et constante, bande passante garantie. Mise en place plus longue (semaines).
- **Transit Gateway** : Hub central qui connecte des milliers de VPC et des réseaux on-premise via une architecture hub-and-spoke. Simplifie le routage et la gestion.

{{ressource:Guide VPC - Architecture de référence:DATASET:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Amazon CloudFront — CDN

CloudFront est le réseau de diffusion de contenu (CDN) d'AWS, avec plus de **600 points de présence** dans le monde :

- **Contenu statique et dynamique** : Cache les fichiers statiques (images, CSS, JS) aux Edge Locations, et accélère le contenu dynamique via des connexions optimisées vers l'origine
- **Origin Shield** : Couche de cache régionale supplémentaire qui réduit la charge sur l'origine et améliore le hit ratio
- **Sécurité** : Intégration avec AWS WAF, Shield (DDoS), Geo-restriction (blocage par pays), Signed URLs/Cookies (accès restreint)
- **Lambda@Edge** : Exécutez du code aux Edge Locations pour personnaliser le contenu (ex : redirection selon l'appareil, réécriture d'URL, A/B testing)

{{ressource:CloudFront - Optimisation des performances:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Amazon Route 53 — DNS

Route 53 est le service DNS (Domain Name System) d'AWS. Au-delà de la simple résolution de noms, il offre des fonctionnalités avancées de routage :

### Types de Routage DNS

| Type | Comportement | Cas d'usage |
|------|-------------|-------------|
| **Simple** | Une seule destination | Site statique, architecture monolithique |
| **Weighted** | Distribution pondérée (%) | A/B testing, canary deployments |
| **Latency-based** | Dirige vers la région avec la latence la plus faible | Applications mondiales |
| **Failover** | Basculement automatique vers une cible secondaire | DR (Disaster Recovery) actif/passif |
| **Geolocation** | Routage selon la localisation de l'utilisateur | Conformité régionale, contenu localisé |
| **Geoproximity** | Routage selon la proximité géographique (avec bias) | Distribution fine du trafic |

### Health Checks et DNS Failover

Route 53 peut surveiller la santé de vos points de terminaison via des **Health Checks**. Si une ressource devient indisponible, Route 53 bascule automatiquement le trafic vers une ressource saine — c'est le **DNS Failover**, une technique essentielle pour la reprise après sinistre.

{{ressource:Route 53 - Types de routage expliqués:SLIDE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

{{ressource:Lab : Configuration d'un VPC complet:EXERCICE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Points Clés à Retenir

- **VPC** : Subnets publics/privés, IGW, NAT Gateway, Security Groups (stateful), NACL (stateless)
- **VPC Endpoints** : Gateway (S3/DynamoDB, gratuit), Interface/PrivateLink (autres services, payant)
- **Connectivité hybride** : VPN (IPsec, rapide), Direct Connect (dédié, fiable), Transit Gateway (hub)
- **CloudFront** : CDN global, Origin Shield, Lambda@Edge, WAF/Shield intégré
- **Route 53** : 6 types de routage (Simple, Weighted, Latency, Failover, Geolocation, Geoproximity), Health Checks
- À l'examen : sachez quand utiliser un VPC Endpoint vs NAT Gateway, et quel type de routage Route 53 selon le scénario`,

            coursId: coursAws.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Guide VPC - Architecture de référence', description: 'Template CloudFormation pour VPC multi-AZ complet', type: 'DATASET', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 45000, public: true, ordre: 0, moduleId: awsModule4.id },
            { titre: 'CloudFront - Optimisation des performances', description: 'Guide avancé de mise en cache et d\'optimisation CDN', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 890000, public: true, ordre: 1, moduleId: awsModule4.id },
            { titre: 'Route 53 - Types de routage expliqués', description: 'Infographie interactive des 6 types de routage DNS', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 2100000, public: true, ordre: 2, moduleId: awsModule4.id },
        ],
    });

    // Module 5 - Architecture Avancée et Révision SAA-C03
    const awsModule5 = await prisma.module.create({
        data: {
            titre: 'Architecture Avancée, Migration et Révision',
            description: 'Architectures microservices, serverless, stratégies de migration et préparation à l\'examen SAA-C03.',
            ordre: 4,
            dureeEstimee: 130,
            videoUrl: 'https://www.youtube.com/embed/AkD6ohFn5Yg',
            contenu: `## Introduction

Ce dernier module rassemble les architectures avancées (serverless, microservices, conteneurs), les stratégies de migration, et une synthèse complète pour l'examen SAA-C03. Ces sujets représentent une part importante des questions et sont souvent ceux qui départagent les candidats.

---

## Architectures Microservices et Serverless

L'évolution des architectures cloud va des monolithes vers des architectures microservices et serverless. AWS propose une gamme complète de services pour chaque approche.

### AWS Lambda — Serverless

Lambda exécute votre code en réponse à des événements sans provisionner ni gérer de serveurs. Chaque fonction est indépendante et scale automatiquement.

- **Déclencheurs courants** : S3 (upload d'objet), API Gateway (requête HTTP), DynamoDB Streams (modification de table), SQS (message dans une queue), SNS (notification), EventBridge (règle programmée)
- **Limites techniques** : 15 minutes de timeout max, 10 Go de mémoire, 50 Mo de package décompressé (250 Mo avec /tmp), 1 000 exécutions simultanées par défaut
- **Cold Start vs Warm Start** : Les premières invocations après une période d'inactivité prennent plus de temps (cold start). **Provisioned Concurrency** maintient un nombre d'environnements pré-initialisés pour éliminer le cold start
- **Meilleures pratiques** : Gardez vos fonctions légères, utilisez des layers pour les dépendances, configurez des réservations de concurrence pour les fonctions critiques

{{ressource:Guide Architecture Serverless:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

### Amazon API Gateway

API Gateway est le service de création, publication et gestion d'APIs à n'importe quelle échelle :

- **Types d'API** : RESTful (HTTP), WebSocket (temps réel), HTTP (version simplifiée)
- **Throttling** : Limitez le taux de requêtes par client (burst et sustained) pour protéger vos backends contre les abus
- **Caching** : Mettez en cache les réponses API à partir de 500 Mo jusqu'à 237 Go, avec des TTL configurables
- **WAF intégré** : Protégez vos endpoints API avec les règles WAF (SQL injection, XSS, rate limiting)
- **Usage Plans** : Créez des plans avec des quotas et des limites de débit par client (modèle API-as-a-product)

### Amazon ECS, EKS et Fargate — Conteneurs

Pour les architectures conteneurisées, AWS propose plusieurs options :

- **Amazon ECS** : Service de conteneurs managé, natif AWS. Moteur propriétaire, plus simple à configurer que K8s. Idéal pour les équipes qui veulent une solution conteneur sans la complexité de Kubernetes.
- **Amazon EKS** : Kubernetes managé par AWS. Standard du marché pour l'orchestration de conteneurs. Portable (même config sur site et cloud). Plus complexe à gérer.
- **AWS Fargate** : Moteur d'exécution serverless pour conteneurs. Plus besoin de gérer les instances EC2 — vous définissez le CPU et la mémoire, Fargate s'occupe du reste. Facturation à la seconde.
- **Amazon ECR** : Registry d'images Docker entièrement géré, avec scan de vulnérabilités intégré.

> **Quand utiliser quoi ?** ECS + Fargate pour les équipes AWS natives qui veulent du serverless conteneurisé. EKS pour les équipes qui ont déjà K8s sur site et veulent la portabilité. Lambda pour le code événementiel léger.

---

## Stratégies de Migration

Migrer vers AWS ne se fait pas en un clic. Les **7 R de la migration** décrivent les stratégies possibles :

| Stratégie | Description | Effort | Bénéfice |
|-----------|-------------|--------|----------|
| **Rehost (Lift & Shift)** | Migrer à l'identique sans modification | Faible | Rapide, faible risque |
| **Replatform** | Optimisation mineure (ex : RDS au lieu de SQL sur EC2) | Moyen | Économies sans changer l'archi |
| **Refactor/Re-architect** | Réécrire en microservices serverless | Élevé | Innovation, scalabilité maximale |
| **Repurchase** | Passer à un SaaS (ex : Salesforce) | Faible | Pas de maintenance |
| **Retire** | Supprimer les apps obsolètes | Faible | Économies immédiates |
| **Retain** | Garder sur site | Nul | Aucun |
| **Relocate** | Déplacer vers un autre compte/région AWS | Faible | Réorganisation |

{{ressource:AWS DMS - Guide de migration:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

### Outils de Migration

- **AWS Migration Hub** : Tableau de bord centralisé pour suivre toutes vos migrations
- **Server Migration Service (SMS)** : Automatise la migration des VMs (VMware, Hyper-V) vers AWS
- **Database Migration Service (DMS)** : Migre les bases de données avec un temps d'arrêt minimal. Supporte les migrations homogènes (MySQL → RDS MySQL) et hétérogènes (Oracle → Aurora PostgreSQL)
- **DataSync** : Transfert de données à grande échelle entre le stockage sur site et AWS (NFS, SMB → S3, EFS, FSx)
- **AWS Application Discovery Service** : Découvrez et cartographiez votre parc applicatif avant la migration

---

## Domaines d'Examen SAA-C03 et Stratégie de Révision

| Domaine | Poids | Sujets Clés |
|---------|-------|-------------|
| Conception d'architectures sécurisées | **30%** | IAM, KMS, chiffrement, WAF, Shield, Security Groups |
| Conception d'architectures résilientes | **26%** | Multi-AZ, Auto Scaling, RDS Multi-AZ, Route 53 Failover |
| Conception d'architectures performantes | **24%** | CloudFront, ElastiCache, DynamoDB DAX, Read Replicas |
| Conception d'architectures optimisées en coûts | **20%** | Reserved Instances, Savings Plans, S3 Lifecycle, Spot Instances |

> **Stratégie recommandée** : Maîtrisez parfaitement la sécurité (30% de l'examen). Concentrez-vous sur IAM, KMS, S3, VPC et EC2 (les services les plus testés). Faites un maximum de questions pratiques sur les cas d'usage (quelle solution pour quel besoin ?).

{{ressource:Simulation d'examen SAA-C03:EXERCICE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Points Clés à Retenir

- **Lambda** : Serverless événementiel, max 15 min, Provisioned Concurrency pour éliminer le cold start
- **API Gateway** : REST/WebSocket/HTTP, throttling, caching, WAF, usage plans
- **ECS/EKS/Fargate** : Conteneurs managés, serverless (Fargate), K8s (EKS) vs natif AWS (ECS)
- **7 R de migration** : Rehost (rapide), Replatform (optimisation), Refactor (modernisation)
- **Domaines SAA-C03** : Sécurité (30%), Résilience (26%), Performance (24%), Coûts (20%)
- Pour l'examen : entraînez-vous sur les cas d'usage — "quel service pour quel besoin ?" est le format le plus fréquent`,

            coursId: coursAws.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Guide des 6R de Migration', description: 'Document détaillant les stratégies de migration AWS', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 650000, public: true, ordre: 0, moduleId: awsModule5.id },
            { titre: 'AWS Well-Architected Review Checklist', description: 'Checklist d\'audit pour les 6 piliers Well-Architected', type: 'EXERCICE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 280000, public: true, ordre: 1, moduleId: awsModule5.id },
            { titre: 'Exam Readiness SAA-C03', description: 'Cours officiel AWS de préparation à l\'examen', type: 'LIEN_EXTERNE', url: 'https://aws.amazon.com/fr/training/classroom/exam-readiness-aws-certified-solutions-architect-associate/', public: true, ordre: 2, moduleId: awsModule5.id },
        ],
    });

    // ───── COURS 3 : CompTIA Security+ (SY0-701) ─────
    const coursSecurity = await prisma.cours.create({
        data: {
            titre: 'CompTIA Security+ (SY0-701) - Cybersécurité Fondamentale',
            slug: 'comptia-security-sy0-701-cybersecurite-fondamentale',
            description: 'La certification Security+ est la référence mondiale en cybersécurité. Ce cours vous prépare à l\'examen SY0-701 avec des cas concrets, des simulations d\'attaque et des exercices pratiques.',
            statut: 'PUBLIE',
            imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
            videoUrl: 'https://www.youtube.com/embed/kiRhRqbC9sc',
            objectifs: [
                'Comprendre les menaces, attaques et vulnérabilités courantes',
                'Maîtriser les concepts de cryptographie et d\'infrastructure à clé publique (PKI)',
                'Mettre en œuvre la gestion des identités et des accès (IAM)',
                'Savoir répondre aux incidents et assurer la continuité d\'activité',
                'Se préparer à l\'examen CompTIA Security+ SY0-701',
            ],
            prerequis: [
                'Certification Network+ ou connaissances réseau équivalentes',
                '2 ans d\'expérience en administration système',
                'Compréhension de base des concepts de sécurité',
            ],
            publicCible: [
                'Professionnels de la cybersécurité',
                'Administrateurs système et réseau',
                'Analystes SOC et ingénieurs sécurité',
                'Toute personne visant la certification Security+',
            ],
            dureeEstimee: 1500,
            datePublication: new Date(),
            formateurId: formateur.id,
            certificationId: certSecurity.id,
        },
    });

    const secModule1 = await prisma.module.create({
        data: {
            titre: 'Menaces, Attaques et Vulnérabilités',
            description: 'Identifiez les différents types de menaces et comprenez les vecteurs d\'attaque.',
            ordre: 0,
            dureeEstimee: 120,
            videoUrl: 'https://www.youtube.com/embed/kiRhRqbC9sc',
            contenu: `## Introduction

La cybersécurité commence par la connaissance de l'ennemi. Ce module vous plonge dans l'univers des menaces, des malwares aux attaques sociales, en passant par les vulnérabilités techniques. C'est le domaine le plus vaste de l'examen Security+ (24%), et celui qui demande le plus de vocabulaire spécifique.

---

## Types de Menaces

Les menaces évoluent constamment. Voici les grandes familles à connaître pour l'examen SY0-701.

### Malwares

- **Virus** : Code malveillant qui s'attache à un fichier légitime (exe, script) et se propage quand le fichier infecté est exécuté. Nécessite une action humaine pour se propager.
- **Worm (Ver)** : Se propage automatiquement sur le réseau sans intervention humaine. Exploite les vulnérabilités réseau. Exemple : WannaCry (2017) a infecté 200 000 machines en 24h.
- **Trojan (Cheval de Troie)** : Logiciel qui semble légitime mais contient un code malveillant. Ne se propage pas seul — l'utilisateur l'installe volontairement.
- **Ransomware** : Chiffre les données de la victime et demande une rançon pour les déchiffrer. Le vecteur d'entrée principal est le phishing. Le ransomware le plus célèbre est LockBit, responsable de milliards de dollars de rançons.
- **Spyware** : Espionne l'activité de l'utilisateur (frappes clavier, historique navigation, identifiants) et transmet les données à un serveur distant.

{{ressource:Guide des Types de Malwares:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

### Attaques Sociales (Social Engineering)

L'ingénierie sociale exploite la psychologie humaine plutôt que les failles techniques. C'est le vecteur d'attaque le plus utilisé aujourd'hui :

- **Phishing** : Email frauduleux usurpant l'identité d'une entité légitime (banque, administration, fournisseur). Le but est de voler des identifiants ou de faire installer un malware.
- **Spear Phishing** : Version ciblée du phishing. L'attaquant personnalise le message pour une personne ou une entreprise spécifique (en utilisant des informations issues d'une précédente fuite de données).
- **Whaling** : Spear phishing visant les hauts dirigeants (CEO, CFO). Les messages sont très sophistiqués et jouent sur l'urgence ou la confidentialité.
- **Pretexting** : Création d'un scénario fictif (prétexte) pour obtenir des informations. Exemple : se faire passer pour un technicien IT qui a besoin du mot de passe.
- **Baiting** : Utilisation d'un appât physique (clé USB laissée dans le parking) ou virtuel (offre promotionnelle trop belle pour être vraie).
- **Tailgating** : Suivre une personne autorisée pour entrer dans un bâtiment sécurisé sans badge.

{{ressource:Phishing Awareness Training:SLIDE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

### Attaques Réseau
- **DDoS (Distributed Denial of Service)** : Submerge un serveur avec un trafic massif provenant d'un botnet (réseau d'appareils infectés). L'objectif est de rendre le service indisponible.
- **Man-in-the-Middle (MitM)** : L'attaquant intercepte les communications entre deux parties pour écouter ou modifier les données. Protections : chiffrement TLS, certificats, VPN.
- **DNS Spoofing (Cache Poisoning)** : L'attaquant corrompt le cache d'un serveur DNS pour rediriger les utilisateurs vers un site malveillant.
- **Replay Attack** : Capture et réémission de données valides (ex : une requête d'authentification) pour tromper le système. Protections : timestamps et nonces.

---

## Vulnérabilités

Une vulnérabilité est une faiblesse dans un système qui peut être exploitée par une menace.

### Analyse de Vulnérabilités

- **Vulnerability Scan** : Scan automatisé avec des outils comme Nessus, Qualys, OpenVAS. Détecte les vulnérabilités connues (CVE), les mauvaises configurations, les mots de passe faibles.
- **Penetration Test (Pentest)** : Test d'intrusion manuel réalisé par un expert en sécurité. Va plus loin qu'un scan : tente d'exploiter les vulnérabilités pour démontrer l'impact.
- **Bug Bounty** : Programme de récompense pour les chercheurs en sécurité qui découvrent et signalent des vulnérabilités. Exemples : HackerOne, Bugcrowd.

{{ressource:Top 10 OWASP 2026:LIEN_EXTERNE:https://owasp.org/www-project-top-ten/}}

### Cycle de Vie d'une Vulnérabilité
\`\`\`
Découverte → CVE attribué → Patch développé → 
Déploiement du patch → Scan de confirmation
\`\`\`
`,
            coursId: coursSecurity.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Guide des Types de Malwares', description: 'Catalogue illustré des différents types de malwares', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 780000, public: true, ordre: 0, moduleId: secModule1.id },
            { titre: 'Phishing Awareness Training', description: 'Module de sensibilisation au phishing pour les équipes', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 5600000, public: true, ordre: 1, moduleId: secModule1.id },
            { titre: 'Top 10 OWASP 2026', description: 'Liste des 10 vulnérabilités Web les plus critiques', type: 'LIEN_EXTERNE', url: 'https://owasp.org/www-project-top-ten/', public: true, ordre: 2, moduleId: secModule1.id },
        ],
    });

    // Module 2 - Cryptographie et PKI
    const secModule2 = await prisma.module.create({
        data: {
            titre: 'Cryptographie et Infrastructure à Clé Publique (PKI)',
            description: 'Comprenez les mécanismes de chiffrement, de signature numérique et l\'infrastructure PKI.',
            ordre: 1,
            dureeEstimee: 100,
            videoUrl: 'https://www.youtube.com/embed/DpC0Jh5tBfE',
            contenu: `## Concepts Fondamentaux de Cryptographie

### Chiffrement Symétrique
- Même clé pour chiffrer et déchiffrer
- **Algorithmes** : AES (256-bit), DES, 3DES, Blowfish
- **Avantage** : Très rapide, adapté aux gros volumes
- **Inconvénient** : Distribution sécurisée des clés

### Chiffrement Asymétrique
- Paire de clés : Publique et Privée
- **Algorithmes** : RSA, ECC, Diffie-Hellman
- **Avantage** : Pas de partage de clé secrète
- **Inconvénient** : Plus lent que le symétrique

### Fonctions de Hachage
- Empreinte numérique unique (one-way)
- **Algorithmes** : SHA-256, SHA-3, MD5 (à ne plus utiliser)
- **Usages** : Intégrité des données, stockage des mots de passe

> **Exemple concret** : HTTPS utilise les deux ! Échange asymétrique pour établir une clé de session symétrique (TLS Handshake).

{{ressource:Tableau comparatif des algorithmes:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

## Infrastructure à Clé Publique (PKI)

### Composants de la PKI
- **CA (Certificate Authority)** : Autorité de certification (Let's Encrypt, DigiCert)
- **RA (Registration Authority)** : Vérification de l'identité
- **CRL (Certificate Revocation List)** : Liste de certificats révoqués
- **OCSP (Online Certificate Status Protocol)** : Vérification en temps réel

### Types de Certificats
| Type | Usage |
|------|-------|
| Wildcard | *.domaine.com - Tous les sous-domaines |
| EV (Extended Validation) | Barre d'adresse verte, confiance maximale |
| SAN (Subject Alternative Name) | Multiples domaines dans un certificat |
| Auto-signé | Test, interne (pas de confiance publique) |

### Gestion du Cycle de Vie
\`\`\`
Génération → Validation → Distribution → Utilisation → Renouvellement/Révocation
\`\`\`

{{ressource:Guide PKI - Mise en œuvre pratique:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}
`,
            coursId: coursSecurity.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Guide des Algorithmes de Chiffrement', description: 'Fiche synthétique des algorithmes symétriques et asymétriques', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 420000, public: true, ordre: 0, moduleId: secModule2.id },
            { titre: 'Lab : Configuration d\'un certificat TLS', description: 'Exercice pratique de déploiement TLS sur un serveur Web', type: 'EXERCICE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 350000, public: true, ordre: 1, moduleId: secModule2.id },
            { titre: 'Let\'s Encrypt - Guide d\'utilisation', description: 'Documentation officielle pour obtenir des certificats gratuits', type: 'LIEN_EXTERNE', url: 'https://letsencrypt.org/fr/docs/', public: true, ordre: 2, moduleId: secModule2.id },
        ],
    });

    // Module 3 - Gestion des Identités et des Accès (IAM)
    const secModule3 = await prisma.module.create({
        data: {
            titre: 'Gestion des Identités et des Accès (IAM)',
            description: 'Implémentez l\'authentification multifacteur, le SSO, la fédération et les contrôles d\'accès.',
            ordre: 2,
            dureeEstimee: 90,
            videoUrl: 'https://www.youtube.com/embed/9cBRhsh8s3U',
            contenu: `## Contrôle d'Accès

### Modèles d'Accès
- **DAC (Discretionary Access Control)** : Le propriétaire contrôle l'accès
- **MAC (Mandatory Access Control)** : Labels de sécurité imposés (militaire/gouvernement)
- **RBAC (Role-Based Access Control)** : Accès basé sur les rôles (le plus courant en entreprise)
- **ABAC (Attribute-Based Access Control)** : Accès basé sur des attributs (utilisateur, ressource, environnement)

### Principe du Moindre Privilège
- Accorder uniquement les permissions nécessaires
- **JIT (Just-In-Time)** : Élévation temporaire des privilèges
- **JEA (Just-Enough-Administration)** : Périmètre d'administration limité

## Authentification Multi-Facteur (MFA)

### Facteurs d'Authentification
1. **Quelque chose que vous SAVEZ** : Mot de passe, PIN
2. **Quelque chose que vous AVEZ** : Token, smartphone, carte à puce
3. **Quelque chose que vous ÊTES** : Biométrie (empreinte, reconnaissance faciale)
4. **Quelque part où vous ÊTES** : Géolocalisation

### Méthodes MFA
- **TOTP (Time-based OTP)** : Google Authenticator, Microsoft Authenticator
- **SMS / Email** : Code à usage unique (moins sécurisé - SIM swap)
- **Push Notification** : Approbation via application mobile
- **Hardware Token** : YubiKey, Titan Security Key
- **Biométrie** : Windows Hello, FaceID, TouchID

## SSO et Fédération

- **SAML 2.0** : Standard pour l'authentification Web (Okta, Azure AD)
- **OAuth 2.0** : Délégation d'autorisation (API, applications tierces)
- **OpenID Connect (OIDC)** : Couche d'authentification par-dessus OAuth 2.0
- **LDAP** : Annuaire pour les environnements On-Premise

{{ressource:Guide SSO - Architecture de référence:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}
`,
            coursId: coursSecurity.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Tableau des modèles d\'accès DAC/MAC/RBAC/ABAC', description: 'Comparatif détaillé des 4 modèles de contrôle d\'accès', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 1800000, public: true, ordre: 0, moduleId: secModule3.id },
            { titre: 'Guide MFA - Configuration comparée', description: 'Comparatif des solutions MFA (Microsoft, Google, Duo, YubiKey)', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 550000, public: true, ordre: 1, moduleId: secModule3.id },
            { titre: 'OAuth 2.0 et OIDC - Guide pratique', description: 'Guide d\'implémentation OAuth 2.0 et OpenID Connect', type: 'LIEN_EXTERNE', url: 'https://oauth.net/2/', public: true, ordre: 2, moduleId: secModule3.id },
        ],
    });

    // Module 4 - Réponse aux Incidents et Continuité d'Activité
    const secModule4 = await prisma.module.create({
        data: {
            titre: 'Réponse aux Incidents et Continuité d\'Activité',
            description: 'Développez des procédures de réponse aux incidents, de reprise après sinistre et de continuité d\'activité.',
            ordre: 3,
            dureeEstimee: 85,
            videoUrl: 'https://www.youtube.com/embed/nQaTtOf0UYg',
            contenu: `## Réponse aux Incidents

### Phases de la Réponse aux Incidents (NIST)
1. **Preparation** : Équipes, outils, procédures
2. **Detection & Analysis** : Détection, qualification, investigation
3. **Containment, Eradication & Recovery** : Endiguement, éradication, restauration
4. **Post-Incident Activity** : Retour d'expérience, amélioration

### Outils de Détection
- **IDS/IPS** : Suricata, Snort, Zeek
- **SIEM** : Splunk, ELK Stack, Azure Sentinel, QRadar
- **EDR** : CrowdStrike, Microsoft Defender, SentinelOne
- **SOAR** : Automatisation de la réponse aux incidents

> 🔥 **Cas Pratique** : Détection d'un ransomware. 1. Isoler le poste infecté 2. Analyser le vecteur d'entrée 3. Restaurer les backups 4. Déployer des règles de détection

{{ressource:Plan de réponse aux incidents - Template:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

## Continuité d'Activité et Reprise après Sinistre (BCP/DRP)

### Métriques Clés
- **RTO (Recovery Time Objective)** : Temps maximum avant restauration (en heures)
- **RPO (Recovery Point Objective)** : Perte de données maximale acceptable (en minutes)
- **MTTR (Mean Time To Repair)** : Temps moyen de réparation
- **MTBF (Mean Time Between Failures)** : Temps moyen entre pannes

### Stratégies de Reprise
| Stratégie | RTO | RPO | Coût |
|-----------|-----|-----|------|
| Backup & Restore | 24h+ | 24h | Faible |
| Pilot Light | ~12h | ~1h | Moyen |
| Warm Standby | ~4h | ~1min | Élevé |
| Multi-site Active | <1h | <1sec | Très élevé |

### Sauvegardes
- **Règle 3-2-1** : 3 copies, 2 supports différents, 1 copie hors site
- **Types** : Complète, incrémentielle, différentielle
- **Chiffrement** : AES-256 pour les données au repos et en transit

{{ressource:Guide BCP - Plan de continuité d'activité:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}
`,
            coursId: coursSecurity.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Playbook de Réponse aux Incidents', description: 'Guide opérationnel étape par étape pour 12 scénarios d\'incident', type: 'EXERCICE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 920000, public: true, ordre: 0, moduleId: secModule4.id },
            { titre: 'Calculateur RTO/RPO', description: 'Outil de calcul des objectifs de reprise et coûts associés', type: 'DATASET', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 60000, public: true, ordre: 1, moduleId: secModule4.id },
            { titre: 'NIST Incident Response Framework', description: 'Document officiel NIST SP 800-61 sur la réponse aux incidents', type: 'LIEN_EXTERNE', url: 'https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final', public: true, ordre: 2, moduleId: secModule4.id },
        ],
    });

    // Module 5 - Révision et Examen Blanc Security+
    const secModule5 = await prisma.module.create({
        data: {
            titre: 'Révision Complète et Simulation d\'Examen',
            description: 'Synthèse interactive des 5 domaines Security+ avec simulation d\'examen complète.',
            ordre: 4,
            dureeEstimee: 120,
            videoUrl: 'https://www.youtube.com/embed/t0pU8UH3lYE',
            contenu: `## Synthèse des 5 Domaines Security+ (SY0-701)

### 1. Menaces, Attaques et Vulnérabilités (24%)
- Types de malwares, ingénierie sociale, attaques réseau
- Analyse des vulnérabilités, cycle de vie CVE
- **Indicators of Compromise (IoC)** : IP suspectes, hash de fichiers, patterns réseau

### 2. Architecture et Conception (21%)
- Modèles de sécurité (Zero Trust, Defense in Depth)
- Sécurisation du cloud (CASB, SASE, SSE)
- Sécurisation des conteneurs et de l'IoT

### 3. Cryptographie et PKI (25%)
- Chiffrement symétrique/asymétrique, hachage
- Infrastructure PKI, certificats, TLS
- **Rappel clé** : AES-256 est le standard symétrique, RSA-4096 pour l'asymétrique

### 4. IAM et Contrôle d'Accès (15%)
- RBAC, ABAC, moindre privilège
- MFA, SSO, fédération
- Gestion des sessions et des identités

### 5. Réponse aux Incidents et BCP (15%)
- Phases NIST de réponse aux incidents
- RTO/RPO, stratégies de reprise
- Forensic et collecte de preuves

> 🎓 **Le saviez-vous ?** 83% des questions Security+ sont des QCM avec 4 choix. 17% sont des questions interactives (glisser-déposer, sélection multiple).

{{ressource:Guide de Révision Security+ SY0-701:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

### Questions Types pour l'Examen

**Q1** : Quel principe de sécurité limite les dégâts d'une compromission ?
- Defense in Depth → ✅ (Multi-couches)
- Least Privilege → ✅ (Limitation des droits)
- Separation of Duties → ✅ (Séparation des tâches)

**Q2** : Quelle infrastructure vérifie la validité d'un certificat ?
- CA → ❌ (Délivre)
- CRL → ✅ (Liste de révocation)
- OCSP → ✅ (Vérification temps réel)
- RA → ❌ (Enregistrement)

{{ressource:Simulation complète Security+ 90 questions:EXERCICE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}
`,
            coursId: coursSecurity.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'CompTIA Security+ - Carte Mentale Complète', description: 'Mindmap interactive des 5 domaines SY0-701 avec liens vers les ressources', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 3200000, public: true, ordre: 0, moduleId: secModule5.id },
            { titre: 'Simulation d\'examen Security+ 90 questions', description: 'Examen blanc chronométré avec correction détaillée', type: 'EXERCICE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 1500000, public: true, ordre: 1, moduleId: secModule5.id },
            { titre: 'CompTIA Official Study Guide', description: 'Guide d\'étude officiel CompTIA Security+ SY0-701', type: 'LIEN_EXTERNE', url: 'https://www.comptia.org/fr/certifications/security', public: true, ordre: 2, moduleId: secModule5.id },
        ],
    });

    // ───── COURS 4 : Google Cloud Digital Leader ─────
    console.log('☁️ Création du cours Google Cloud Digital Leader...');
    const coursGcp = await prisma.cours.create({
        data: {
            titre: 'Google Cloud Digital Leader - Fondamentaux du Cloud Google',
            slug: 'google-cloud-digital-leader-fondamentaux',
            description: 'Découvrez Google Cloud Platform et préparez la certification Digital Leader. Ce cours couvre les produits GCP, la transformation digitale, la data, l\'IA et la sécurité sur Google Cloud.',
            statut: 'PUBLIE',
            imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80',
            videoUrl: 'https://www.youtube.com/embed/mf9gMf9sF4A',
            objectifs: [
                'Comprendre les produits et services Google Cloud',
                'Maîtriser les concepts de transformation digitale avec GCP',
                'Connaître les solutions data et IA de Google Cloud',
                'Appréhender la sécurité et la gouvernance sur GCP',
                'Se préparer à la certification Google Cloud Digital Leader',
            ],
            prerequis: [
                'Aucun prérequis technique spécifique',
                'Notions de base en cloud computing recommandées',
                'Intérêt pour la transformation digitale',
            ],
            publicCible: [
                'Professionnels non techniques souhaitant comprendre le cloud',
                'Chefs de projet et managers IT',
                'Étudiants et débutants en cloud computing',
                'Toute personne préparant la certification Digital Leader',
            ],
            dureeEstimee: 600,
            datePublication: new Date(),
            formateurId: formateur2.id,
            certificationId: certGcpDigitalLeader.id,
        },
    });

    const gcpModule1 = await prisma.module.create({
        data: {
            titre: 'Introduction à Google Cloud et Transformation Digitale',
            description: 'Découvrez la vision Google Cloud et comment le numérique transforme les entreprises.',
            ordre: 0,
            dureeEstimee: 60,
            videoUrl: 'https://www.youtube.com/embed/mf9gMf9sF4A',
            contenu: `## Introduction

Bienvenue dans le monde de Google Cloud. La certification Digital Leader est unique car elle s'adresse autant aux techniciens qu'aux décideurs : elle valide votre compréhension des concepts cloud, des produits GCP et de la transformation digitale. Ce module pose les bases de l'infrastructure Google et de sa vision du cloud.

---

## Google Cloud Platform (GCP)

### Infrastructure Globale

Google Cloud s'appuie sur le **plus grand réseau privé du monde**, avec plus de 40 régions, 160 points de présence et 200 000 km de câbles sous-marins. Contrairement à AWS et Azure qui utilisent en partie le réseau public Internet, Google achemine tout le trafic entre ses datacenters via son réseau fibre privé, ce qui garantit des performances optimales et une latence minimale.

### Différenciateurs Clés de GCP

1. **Réseau global** : Performances inégalées grâce au réseau privé — le trafic entre vos ressources GCP ne passe jamais par Internet
2. **Open Source** : Google est le créateur ou un contributeur majeur de Kubernetes (borg → K8s), TensorFlow, Angular, Go, Istio, et bien d'autres
3. **Data & AI** : BigQuery domine le marché du data warehouse serverless, et Vertex AI est la plateforme d'IA la plus complète du marché
4. **Prix compétitifs** : Remises automatiques sur l'utilisation longue durée (Committed Use Discounts jusqu'à 70%), et pas de frais de sortie pour les services Google

{{ressource:Guide Google Cloud pour décideurs:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Transformation Digitale avec Google Cloud

La certification Digital Leader met l'accent sur la **valeur commerciale** plutôt que sur les détails techniques. Voici les axes de transformation que Google Cloud accompagne :

- **Cloud comme catalyseur d'innovation** : Le cloud libère les équipes des contraintes d'infrastructure pour se concentrer sur l'innovation métier
- **Data-Driven Decision Making** : Avec BigQuery et Looker, les entreprises peuvent analyser des pétaoctets de données en secondes
- **Customer Experience personnalisée** : Gemini AI et Recommendations AI permettent de personnaliser l'expérience client à grande échelle
- **IT Modernization** : Migration des monolithes vers des microservices avec GKE (Google Kubernetes Engine), et adoption du serverless avec Cloud Run

{{ressource:Google Cloud Free Program:LIEN_EXTERNE:https://cloud.google.com/free}}

---

## Points Clés à Retenir

- GCP possède le plus grand réseau privé du monde (fibre, pas Internet public)
- Différenciateurs : réseau global, open source (K8s, TensorFlow), data/AI (BigQuery, Vertex AI)
- La certification Digital Leader est orientée "valeur métier" : comprenez POURQUOI utiliser un service, pas seulement COMMENT
- La transformation digitale repose sur 4 piliers : cloud catalyseur, data-driven, expérience client, modernisation IT
- Les Committed Use Discounts offrent jusqu'à 70% d'économie pour un engagement de 1 ou 3 ans`,

            coursId: coursGcp.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Carte des régions Google Cloud', description: 'Infographie mondiale des régions et zones GCP', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 2400000, public: true, ordre: 0, moduleId: gcpModule1.id },
            { titre: 'Google Cloud Free Program', description: 'Guide d\'inscription au programme gratuit GCP (300$ de crédit)', type: 'LIEN_EXTERNE', url: 'https://cloud.google.com/free', public: true, ordre: 1, moduleId: gcpModule1.id },
            { titre: 'Comparatif Cloud Providers 2026', description: 'Étude comparative AWS vs Azure vs GCP pour les décideurs', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 890000, public: true, ordre: 2, moduleId: gcpModule1.id },
        ],
    });

    const gcpModule2 = await prisma.module.create({
        data: {
            titre: 'Infrastructure et Calcul sur Google Cloud',
            description: 'Explorez les services de calcul, stockage et réseau de Google Cloud.',
            ordre: 1,
            dureeEstimee: 90,
            videoUrl: 'https://www.youtube.com/embed/Bg8qPmzTf0w',
            contenu: `## Introduction

Ce module explore l'infrastructure technique de Google Cloud : comment déployer des applications, stocker des données et connecter les ressources. Que vous soyez développeur, architecte ou DSI, comprendre ces services est essentiel pour la certification Digital Leader.

---

## Services de Calcul

Google Cloud propose plusieurs options de calcul, du contrôle total (IaaS) au serverless (Cloud Run).

### Compute Engine (IaaS)

Compute Engine fournit des machines virtuelles personnalisables, à l'image d'EC2 chez AWS ou des VMs Azure. Vous choisissez le nombre de vCPU, la RAM, le type de disque et l'OS :

- **Familles de VM** : GCloud N2 (general purpose), C2 (compute-optimized), E2 (économique), M2 (memory-optimized)
- **Sole-tenant nodes** : Isolation matérielle dédiée pour les charges de travail nécessitant une séparation physique (conformité, licensing)
- **Preemptible VMs** : Jusqu'à **80% d'économie** pour les workloads batch, mais la VM peut être arrêtée avec 30s de préavis
- **Savings Plans** : Engagement de 1 ou 3 ans pour 30-70% d'économie (Committed Use Discounts)

{{ressource:Comparatif Compute Engine vs GKE vs Cloud Run:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

### Google Kubernetes Engine (GKE)

Google est le **créateur de Kubernetes** (projet open source né de Borg, le système interne de Google). GKE est la version managée de K8s sur Google Cloud :

- **GKE Autopilot** : Mode serverless pour Kubernetes — Google gère les nœuds, vous déployez vos pods. Pas besoin de gérer de machines.
- **GKE Enterprise** : Version entreprise avec sécurité avancée, multi-clusters, Service Mesh (Anthos), et conformité renforcée.
- **GKE Standard** : Contrôle total sur les nœuds (choix des VMs, scaling manuel).

### Cloud Run (Serverless)

Cloud Run exécute des conteneurs sans infrastructure à gérer. Vous déployez une image Docker, Cloud Run s'occupe du reste :

- **Auto-scaling** : De 0 à plusieurs milliers de requêtes, paiement à la milliseconde
- **Support** : Tout langage (Go, Python, Node.js, Java, .NET, Ruby), tout framework
- **Pas de cold start** : Grâce au mode "min instances", vous pouvez maintenir des instances chaudes en permanence

{{ressource:Lab : Déployer une app sur Cloud Run:EXERCICE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Services de Stockage

### Cloud Storage

Cloud Storage est le service de stockage d'objets de Google Cloud (équivalent S3). Les données sont organisées en **buckets** :

- **Classes de stockage** : Standard (accès fréquent), Nearline (30 jours), Coldline (90 jours), Archive (365+ jours)
- **Autoclass** : Fonctionnalité qui déplace automatiquement vos données entre les classes selon leur fréquence d'accès — optimise les coûts sans intervention manuelle
- **Object retention** : Empêche la suppression des objets pendant une période définie (WORM)

### Cloud SQL et Spanner

- **Cloud SQL** : Service managé pour MySQL, PostgreSQL et SQL Server. Jusqu'à 10 Go de stockage, réplication, sauvegardes automatiques.
- **Cloud Spanner** : Base de données relationnelle **globale et cohérente** — combine les avantages du relationnel (ACID) avec la scalabilité horizontale du NoSQL. Idéal pour les applications mondiales qui ont besoin d'une consistance forte.

---

## Services Réseau

- **VPC (Virtual Private Cloud)** : Réseau privé global — contrairement à AWS/Azure où le VPC est régional, le VPC Google Cloud est **global** : une seule ressource réseau couvre toutes les régions
- **Cloud CDN** : Réseau de diffusion de contenu utilisant les 160+ points de présence Google
- **Cloud Load Balancing** : Répartiteur de charge global (un seul ANYCAST IP répartit le trafic entre toutes les régions)
- **Cloud NAT** : Accès Internet sortant pour les VMs privées (sans IP publique)

{{ressource:Google Cloud Architecture Framework:LIEN_EXTERNE:https://cloud.google.com/architecture/framework}}

---

## Points Clés à Retenir

- **Compute** : Compute Engine (VMs, IaaS), GKE (K8s managé), Cloud Run (serverless conteneurs)
- **Stockage** : Cloud Storage (objets, Autoclass), Cloud SQL (relationnel), Spanner (relationnel global)
- **Réseau** : VPC global (pas régional !), Cloud CDN, Load Balancing global, Cloud NAT
- **GKE Autopilot** est le mode serverless de Kubernetes — pas de nœuds à gérer
- **Preemptible VMs** = jusqu'à 80% d'économie pour les workloads tolérants aux pannes
- Pour l'examen Digital Leader : retenez les cas d'usage de chaque service plutôt que les détails de configuration`,

            coursId: coursGcp.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Comparatif Compute Engine vs GKE vs Cloud Run', description: 'Guide de choix pour les services de calcul GCP', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 480000, public: true, ordre: 0, moduleId: gcpModule2.id },
            { titre: 'Lab : Déployer une app sur Cloud Run', description: 'Tutoriel pratique de déploiement serverless', type: 'EXERCICE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 380000, public: true, ordre: 1, moduleId: gcpModule2.id },
            { titre: 'Google Cloud Architecture Framework', description: 'Bonnes pratiques d\'architecture GCP', type: 'LIEN_EXTERNE', url: 'https://cloud.google.com/architecture/framework', public: true, ordre: 2, moduleId: gcpModule2.id },
        ],
    });

    const gcpModule3 = await prisma.module.create({
        data: {
            titre: 'Data, Analytics et IA sur Google Cloud',
            description: 'Plongez dans l\'univers data-driven de Google Cloud : BigQuery, Dataflow, Vertex AI et plus.',
            ordre: 2,
            dureeEstimee: 100,
            videoUrl: 'https://www.youtube.com/embed/i2chbRGEs5Y',
            contenu: `## Introduction

Google Cloud est né de l'expérience de Google dans le traitement de données à l'échelle planétaire. Ce module couvre les services data et IA qui font la différence de GCP : BigQuery pour l'analytique serverless, Dataflow pour le traitement en temps réel, et Vertex AI pour l'intelligence artificielle. La data et l'IA représentent environ 30% de l'examen Digital Leader.

---

## BigQuery — Data Warehouse Serverless

BigQuery est le data warehouse serverless de Google Cloud, capable d'exécuter des requêtes SQL sur des **pétaoctets de données** en quelques secondes.

### Caractéristiques Clés

- **Serverless** : Aucune infrastructure à provisionner. Pas de clusters, pas de nœuds, pas de maintenance. Vous chargez les données et vous interrogez.
- **Séparation stockage/calcul** : Le stockage et le calcul sont facturés indépendamment. Vous pouvez stocker des pétaoctets sans payer pour du calcul inactif.
- **BigQuery Omni** : Interrogez des données stockées dans AWS (S3) et Azure (Blob Storage) directement depuis BigQuery, sans déplacer les données.
- **BigQuery ML** : Créez et exécutez des modèles de machine learning directement avec des requêtes SQL. Pas besoin d'exporter les données vers un autre outil.

### Cas d'Usage

- Analyse de logs et métriques en temps réel
- Data lake et data warehouse unifié (un seul outil pour les données structurées et semi-structurées)
- Prédictions ML (régression, classification, séries temporelles) directement dans le data warehouse

{{ressource:BigQuery - Guide d'optimisation des coûts:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Dataflow — Traitement Stream et Batch

Dataflow est le service de traitement de données basé sur **Apache Beam**, un framework open source qui permet d'écrire le même code pour le traitement batch et streaming :

- **Streaming** : Traitement temps réel avec garantie "exactly-once" — chaque événement est traité une fois et une seule
- **Batch** : Traitement par lots à grande échelle, autoscaling
- **Autoscaling** : Dataflow ajuste automatiquement le nombre de workers en fonction de la charge
- **Intégration** : Se connecte à Pub/Sub (messagerie), BigQuery, Cloud Storage, etc.

---

## Vertex AI — Intelligence Artificielle

Vertex AI est la plateforme unifiée d'IA/ML de Google Cloud, qui rassemble tous les outils en un seul endroit :

- **AutoML** : Créez des modèles de ML sans coder — entraînez des modèles de classification d'images, de texte, de traduction, etc.
- **Vertex AI Workbench** : Environnement de notebooks Jupyter managé, avec intégration Git, collaboration en temps réel
- **Generative AI** : Accès aux modèles fondamentaux de Google : **Gemini** (LLM multimodal), **Imagen** (génération d'images), **Codey** (génération de code)
- **Model Garden** : Catalogue de **150+ modèles pré-entraînés**, incluant des modèles open source (Llama, Claude, etc.) et propriétaires Google
- **Vertex AI Agent Builder** : Créez des agents IA conversationnels avec RAG (Retrieval-Augmented Generation) en quelques clics

{{ressource:Vertex AI - Cas d'usage entreprise:SLIDE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Points Clés à Retenir

- **BigQuery** : Data warehouse serverless, séparation stockage/calcul, BigQuery ML (ML en SQL), Omni (multi-cloud)
- **Dataflow** : Traitement stream/batch basé sur Apache Beam, exactly-once, autoscaling
- **Vertex AI** : Plateforme IA unifiée — AutoML, Gemini (LLM), Imagen (images), Model Garden (150+ modèles)
- Google Cloud est leader Gartner en Data & Analytics depuis 2024
- Pour l'examen Digital Leader : montrez que vous comprenez la **valeur métier** de ces services — BigQuery permet l'analyse en temps réel sans infrastructure, Vertex AI démocratise l'IA`,

            coursId: coursGcp.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'BigQuery - Guide d\'optimisation des coûts', description: 'Bonnes pratiques pour réduire vos coûts BigQuery (slot, partition, clustering)', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 610000, public: true, ordre: 0, moduleId: gcpModule3.id },
            { titre: 'Vertex AI - Cas d\'usage entreprise', description: '10 cas d\'usage concrets de Vertex AI en entreprise', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 4500000, public: true, ordre: 1, moduleId: gcpModule3.id },
            { titre: 'Documentation Vertex AI', description: 'Documentation officielle Google Cloud AI', type: 'LIEN_EXTERNE', url: 'https://cloud.google.com/vertex-ai/docs', public: true, ordre: 2, moduleId: gcpModule3.id },
        ],
    });

    const gcpModule4 = await prisma.module.create({
        data: {
            titre: 'Sécurité, Identité et Gouvernance GCP',
            description: 'Protégez vos ressources avec Google Cloud IAM, Security Command Center et BeyondCorp.',
            ordre: 3,
            dureeEstimee: 80,
            videoUrl: 'https://www.youtube.com/embed/yvFhLg-JBlE',
            contenu: `## Introduction

Google Cloud a été conçu avec une approche "security-first" : c'est le premier grand fournisseur cloud à avoir adopté le modèle Zero Trust (BeyondCorp). Ce module couvre IAM, le Zero Trust avec BeyondCorp, et les services de sécurité comme Security Command Center et Cloud Armor. La sécurité et la gouvernance représentent environ 20% de l'examen Digital Leader.

---

## Google Cloud IAM

Le modèle IAM de Google Cloud est simple et puissant : **Qui (Identity)** peut faire **Quoi (Role)** sur **Quelle ressource**.

### Types de Rôles

- **Primitive Roles** : Owner, Editor, Viewer. Rôles hérités, trop larges — **à éviter en production**. Google recommande de migrer vers des rôles plus fins.
- **Predefined Roles** : Rôles fins gérés par Google, comme \`roles/bigquery.dataViewer\` (lecture seule dans BigQuery) ou \`roles/storage.objectAdmin\` (gestion complète des objets Cloud Storage).
- **Custom Roles** : Rôles personnalisés pour le moindre privilège. Vous définissez exactement les permissions nécessaires.

### Service Accounts

Les Service Accounts sont des identités non-humaines utilisées par les applications et les VM pour s'authentifier auprès des services GCP. Contrairement aux utilisateurs, ils n'ont pas de mot de passe — ils utilisent des clés JSON ou l'instance metadata.

{{ressource:IAM Best Practices GCP:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## BeyondCorp — Zero Trust à la Google

BeyondCorp est le modèle Zero Trust de Google qui a remplacé le VPN traditionnel. Au lieu d'accorder l'accès au réseau, BeyondCorp accorde l'accès aux **applications** en fonction du contexte :

- **Access Context Manager** : Définit des politiques basées sur l'appareil (OS, version, patch level), la localisation, l'heure, le niveau de risque
- **IAP (Identity-Aware Proxy)** : Proxy qui vérifie l'identité et le contexte avant d'accorder l'accès à une application. Remplace le VPN pour les applications Web
- **Pas de VPN** : Les utilisateurs accèdent aux applications directement depuis Internet, sans tunnel VPN

{{ressource:BeyondCorp Enterprise - Guide:SLIDE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Google Cloud Security

### Security Command Center

Security Command Center est la plateforme de sécurité unifiée de Google Cloud :

- **SIEM/SOAR intégré** : Détection et réponse aux incidents dans une console unique
- **Event Threat Detection** : Détection des menaces à partir des logs d'audit (reconnaissance, accès anormal, exfiltration de données)
- **Container Threat Detection** : Surveillance des conteneurs GKE — détection des processus malveillants, des tentatives d'escalade de privilèges
- **Web Security Scanner** : Scan automatique des applications Web pour détecter les vulnérabilités (XSS, Flash injection, etc.)

### Cloud Armor

Cloud Armor est le WAF (Web Application Firewall) de Google Cloud :

- **Protection DDoS** : Toujours activée au niveau de l'infrastructure Google
- **Règles WAF personnalisables** : Bloquez les attaques OWASP Top 10 (SQL injection, XSS, RFI)
- **Rate limiting** : Limitez le nombre de requêtes par client pour protéger contre le brute-force

### Protection des Données

- **Cloud KMS** : Gestion centralisée des clés de chiffrement, intégré à tous les services GCP
- **Cloud CMEK/CSEK** : Clés de chiffrement gérées par le client (Customer-Managed Encryption Keys / Customer-Supplied Encryption Keys)
- **DLP (Data Loss Prevention)** : Inspecte et masque automatiquement les données sensibles (numéros de carte bancaire, SSN, emails) dans les bases de données, les fichiers et les APIs
- **VPC Service Controls** : Définit un périmètre de sécurité autour des services GCP pour empêcher l'exfiltration de données

{{ressource:Google Cloud Security Foundations:LIEN_EXTERNE:https://cloud.google.com/docs/security}}

---

## Points Clés à Retenir

- **IAM** : Qui (identity) + Quoi (role) + Quelle ressource. Évitez les Primitive Roles (Owner/Editor/Viewer)
- **BeyondCorp** : Zero Trust sans VPN — IAP pour l'accès aux applications, Access Context Manager pour les politiques
- **Security Command Center** : SIEM/SOAR intégré, Event Threat Detection, Container Threat Detection
- **Cloud Armor** : WAF + DDoS, règles OWASP, rate limiting
- **Data Protection** : KMS (chiffrement), DLP (inspection), VPC Service Controls (périmètre)
- Pour l'examen : sachez que BeyondCorp remplace le VPN et que IAP est le proxy d'accès aux applications`,

            coursId: coursGcp.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'IAM Best Practices GCP', description: 'Guide officiel des meilleures pratiques IAM Google Cloud', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 720000, public: true, ordre: 0, moduleId: gcpModule4.id },
            { titre: 'BeyondCorp Enterprise - Guide', description: 'Guide de déploiement Zero Trust avec Google', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 2800000, public: true, ordre: 1, moduleId: gcpModule4.id },
            { titre: 'Google Cloud Security Foundations', description: 'Documentation officielle des fondations sécurité GCP', type: 'LIEN_EXTERNE', url: 'https://cloud.google.com/docs/security', public: true, ordre: 2, moduleId: gcpModule4.id },
        ],
    });

    const gcpModule5 = await prisma.module.create({
        data: {
            titre: 'Innovation, Tarification et Révision',
            description: 'Innovation Google, gestion des coûts, migration et préparation à l\'examen Digital Leader.',
            ordre: 4,
            dureeEstimee: 90,
            videoUrl: 'https://www.youtube.com/embed/M3JLshFmDLI',
            contenu: `## Introduction

Ce dernier module couvre l'innovation Google au-delà du cloud (Apigee, Maps, Workspace), la gestion des coûts, et vous prépare à l'examen Digital Leader avec une synthèse des domaines et des conseils. L'innovation et la tarification représentent environ 20% de l'examen.

---

## Innovation Google Cloud

Au-delà des services d'infrastructure, Google Cloud propose des technologies d'innovation qui transforment les entreprises :

- **Apigee** : Plateforme de gestion d'API (API management). Permet de créer, sécuriser, monétiser et analyser les APIs. Apigee X ajoute l'IA pour la détection des anomalies API.
- **Google Maps Platform** : Géolocalisation et cartographie pour vos applications. Utilisé par 10 millions de sites et apps dans le monde.
- **Google Workspace** : Suite collaborative (Gmail, Docs, Sheets, Meet, Chat) — plus de 3 milliards d'utilisateurs.
- **Chronicle** : SIEM (Security Information and Event Management) cloud natif, conçu pour analyser des téraoctets de logs de sécurité par jour.

{{ressource:Guide Tarification GCP:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Sustainability — L'Engagement Vert de Google

Google est le leader de la durabilité dans le cloud :

- **Neutre en carbone depuis 2007** : Premier grand fournisseur cloud à atteindre la neutralité carbone
- **Objectif 2030** : Fonctionner 24/7 avec 100% d'énergie sans carbone dans tous ses datacenters
- **Carbon Footprint** : Tableau de bord qui suit les émissions de CO2 de vos ressources GCP
- **Region recommender** : Suggère les régions les plus vertes pour déployer vos workloads

---

## Gestion des Coûts GCP

### Outils Disponibles

- **Pricing Calculator** : Estimez le coût de votre solution avant de la déployer. Configurez les services, les régions, les options.
- **Cost Management** : Budgets, alertes (par seuil), rapports détaillés par projet/service/tag. Visualisez les tendances et les prévisions.
- **Recommender** : Analyse vos ressources et suggère des optimisations (droits de VM surdimensionnées, Recommender d'idle, suggestions de commitments).
- **Committed Use Discounts (CUD)** : Engagement de 1 ou 3 ans sur une dépense minimale de Compute Engine ou GKE. Jusqu'à 70% d'économie.

### Bonnes Pratiques d'Optimisation

1. Utilisez des **Preemptible VMs** pour les workloads batch et tolérants aux pannes (80% d'économie)
2. Appliquez des **labels** à toutes vos ressources pour le suivi des coûts par projet/équipe
3. Activez les **recommandations de droits** de VM pour ne pas payer pour des ressources inutilisées
4. Utilisez **Cloud Storage Autoclass** pour optimiser automatiquement les coûts de stockage

{{ressource:Google Cloud Digital Leader - Exam Guide:LIEN_EXTERNE:https://cloud.google.com/learn/certification/digital-leader}}

---

## Domaines d'Examen Digital Leader

| Domaine | Poids | Que savoir |
|---------|-------|------------|
| Transformation digitale avec Google Cloud | ~30% | Cloud comme catalyseur, CAPEX vs OPEX, modernisation IT |
| Innovation data et IA | ~30% | BigQuery, Vertex AI, Gemini, data-driven décisions |
| Infrastructure et modernisation | ~20% | Compute Engine, GKE, Cloud Run, migration |
| Sécurité et opérations | ~20% | IAM, BeyondCorp, Security Command Center, résilience |

> **Conseil clé pour l'examen** : L'évaluation Digital Leader met l'accent sur la **valeur commerciale** et la **transformation**, pas sur les détails techniques. Montrez que vous comprenez POURQUOI utiliser un service (bénéfice métier) plutôt que COMMENT le configurer.

{{ressource:Cartes de Révision Digital Leader:SLIDE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Points Clés à Retenir

- **Innovation** : Apigee (APIs), Maps (géoloc), Workspace (collaboration), Chronicle (SIEM)
- **Sustainability** : Google neutre en carbone depuis 2007, objectif 100% sans carbone 24/7 en 2030
- **Coûts** : Pricing Calculator (estimation), Cost Management (suivi), Recommender (optimisation), CUD (jusqu'à 70%)
- **Bonnes pratiques** : Preemptible VMs, labels, recommandations de droits, Autoclass
- **4 domaines d'examen** : Transformation digitale (30%), Data/IA (30%), Infrastructure (20%), Sécurité (20%)
- **Focus métier** : L'examen teste la compréhension de la valeur business, pas les détails techniques`,

            coursId: coursGcp.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Guide Tarification GCP', description: 'Guide complet des modèles de tarification Google Cloud', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 590000, public: true, ordre: 0, moduleId: gcpModule5.id },
            { titre: 'Google Cloud Digital Leader - Exam Guide', description: 'Guide officiel d\'examen Digital Leader avec domaines et ressources', type: 'LIEN_EXTERNE', url: 'https://cloud.google.com/learn/certification/digital-leader', public: true, ordre: 1, moduleId: gcpModule5.id },
            { titre: 'Cartes de Révision Digital Leader', description: '20 fiches de révision PDF pour les domaines de l\'examen', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 3800000, public: true, ordre: 2, moduleId: gcpModule5.id },
        ],
    });

    // ───── COURS 5 : AWS Cloud Practitioner (CLF-C02) ─────
    console.log('☁️ Création du cours AWS Cloud Practitioner...');
    const coursAwsCp = await prisma.cours.create({
        data: {
            titre: 'AWS Cloud Practitioner (CLF-C02) - Fondamentaux AWS',
            slug: 'aws-cloud-practitioner-clf-c02-fondamentaux',
            description: 'Découvrez Amazon Web Services et préparez la certification Cloud Practitioner. Idéal pour débuter votre parcours cloud AWS.',
            statut: 'PUBLIE',
            imageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
            videoUrl: 'https://www.youtube.com/embed/3hF6xE1VszI',
            objectifs: [
                'Comprendre l\'infrastructure et les services AWS',
                'Connaître les services de base : EC2, S3, RDS, Lambda, VPC',
                'Maîtriser les concepts de sécurité et IAM',
                'Comprendre les modèles de tarification et d\'optimisation des coûts',
                'Se préparer à l\'examen CLF-C02 Cloud Practitioner',
            ],
            prerequis: [
                'Aucune expérience technique requise',
                'Curiosité pour le cloud computing',
                'Une compréhension de base de l\'informatique est un plus',
            ],
            publicCible: [
                'Débutants en cloud computing',
                'Professionnels IT sans expérience cloud',
                'Étudiants et reconvertis professionnels',
                'Toute personne souhaitant débuter avec AWS',
            ],
            dureeEstimee: 500,
            datePublication: new Date(),
            formateurId: formateur2.id,
            certificationId: certAwsCp.id,
        },
    });

    const awsCpModule1 = await prisma.module.create({
        data: {
            titre: 'Introduction à AWS et au Cloud Computing',
            description: 'Découvrez Amazon Web Services, l\'infrastructure globale et les concepts fondamentaux du cloud.',
            ordre: 0,
            dureeEstimee: 60,
            videoUrl: 'https://www.youtube.com/embed/3hF6xE1VszI',
            contenu: `## Introduction

Bienvenue dans le monde AWS. La certification Cloud Practitioner (CLF-C02) est le point d'entrée idéal pour débuter votre parcours cloud. Elle valide votre compréhension globale d'AWS : infrastructure, services principaux, sécurité, tarification et architecture. Aucune expérience technique n'est requise — ce cours est conçu pour les débutants.

---

## Qu'est-ce qu'AWS ?

Amazon Web Services (AWS) est la plateforme cloud la plus complète au monde avec **200+ services** disponibles, utilisée par des millions de clients, des startups aux entreprises du Fortune 500. AWS a été lancé en 2006 et reste le leader du marché cloud avec environ 32% de parts de marché.

### Infrastructure Globale

AWS s'appuie sur une infrastructure mondiale incomparable :
- **33 régions** géographiques dans le monde, dont eu-west-3 (Paris) depuis 2017
- **105 zones de disponibilité (AZ)** — chaque région contient au moins 3 AZs isolées
- **Plus de 600 points de présence (Edge Locations)** pour CloudFront et Route 53
- **Région France** : eu-west-3 (Paris) avec 3 AZs

### Modèles de Service Cloud

Comme pour tous les fournisseurs cloud, AWS propose trois modèles de service :
- **IaaS** : EC2 (VMs), VPC (réseau) — vous gérez l'OS, les middlewares et les applications
- **PaaS** : RDS (base de données managée), Elastic Beanstalk (plateforme d'hébergement) — vous gérez uniquement les applications
- **SaaS** : AWS WorkMail (email), Chime (visioconférence), Amazon Connect (contact center) — tout est géré par AWS

{{ressource:AWS Global Infrastructure Map:SLIDE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Avantages du Cloud AWS

Pourquoi choisir AWS ? Cinq avantages fondamentaux à retenir pour l'examen CLF-C02 :

1. **Paiement à l'usage (Pay-as-you-go)** : Vous ne payez que ce que vous consommez, sans engagement ni frais fixes
2. **Économies d'échelle** : Plus vous utilisez AWS, plus le coût unitaire diminue — les économies sont répercutées sur les clients
3. **Capacité illimitée** : Plus besoin de provisionner à l'avance — AWS scale automatiquement avec vos besoins
4. **Vitesse et agilité** : Déployez des ressources en quelques minutes au lieu de plusieurs semaines
5. **Portée globale** : Déployez vos applications dans le monde entier en quelques clics

{{ressource:AWS Free Tier Guide:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Points Clés à Retenir

- AWS est le leader du cloud (32% de parts de marché), avec 33 régions et 105 AZs
- Trois modèles de service : IaaS (vous gérez beaucoup), PaaS (vous gérez l'app), SaaS (tout est géré)
- Cinq avantages : paiement à l'usage, économies d'échelle, capacité illimitée, vitesse, portée globale
- Pour l'examen CLF-C02 : retenez les définitions et les cas d'usage des services, pas les détails techniques
- Le Cloud Practitioner est la certification la plus accessible — parfaite pour débuter`,

            coursId: coursAwsCp.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'AWS Global Infrastructure Overview', description: 'Carte interactive des régions et zones AWS', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 2100000, public: true, ordre: 0, moduleId: awsCpModule1.id },
            { titre: 'AWS Free Tier Guide', description: 'Guide complet du niveau gratuit AWS (toujours gratuit 12 mois)', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 340000, public: true, ordre: 1, moduleId: awsCpModule1.id },
            { titre: 'Créer un compte AWS gratuit', description: 'Guide pas à pas pour créer votre compte AWS', type: 'LIEN_EXTERNE', url: 'https://aws.amazon.com/fr/free/', public: true, ordre: 2, moduleId: awsCpModule1.id },
        ],
    });

    const awsCpModule2 = await prisma.module.create({
        data: {
            titre: 'Services de Calcul et de Stockage AWS',
            description: 'Découvrez EC2, Lambda, S3, EBS et les services de base AWS.',
            ordre: 1,
            dureeEstimee: 90,
            videoUrl: 'https://www.youtube.com/embed/X8iEVoTs1eU',
            contenu: `## Introduction

Ce module vous présente les services de calcul et de stockage AWS les plus courants. Pour l'examen CLF-C02, vous devez connaître le cas d'usage de chaque service, pas les détails de configuration. Le domaine "Technologie cloud" représente 33% de l'examen — c'est le plus important.

---

## Services de Calcul AWS

### Amazon EC2 — Machines Virtuelles

EC2 (Elastic Compute Cloud) est le service de machines virtuelles d'AWS. Vous choisissez la puissance (vCPU, RAM), le système d'exploitation et le stockage :

- **Types d'instances** : Généraliste (t3), Calcul optimisé (c5), Mémoire optimisée (r5), Stockage (i3), GPU (p4)
- **Modèles d'achat** : On-Demand (flexible), Reserved (jusqu'à 72% d'économie pour engagement 1-3 ans), Spot (jusqu'à 90% pour workloads tolérants)
- **Auto Scaling** : Ajuste automatiquement le nombre d'instances selon la charge
- **Elastic Load Balancing (ELB)** : Répartit le trafic entre les instances

{{ressource:Guide des Types d'Instances EC2:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

### AWS Lambda — Serverless

Lambda exécute votre code en réponse à des événements, sans provisionner de serveur :
- **Déclencheurs** : Upload S3, requête API Gateway, message SQS, modification DynamoDB
- **Gratuit jusqu'à 1 million de requêtes par mois** (Free Tier)
- **Paiement** : Uniquement le temps d'exécution et le nombre de requêtes

### Elastic Beanstalk — PaaS

Elastic Beanstalk est la plateforme PaaS d'AWS. Vous déployez votre code, et Beanstalk gère automatiquement le capacity provisioning, l'auto-scaling et le load balancing. Idéal pour les développeurs qui veulent déployer rapidement sans gérer l'infrastructure.

{{ressource:Lab : Déployer une instance EC2:EXERCICE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Services de Stockage AWS

### Amazon S3 — Stockage d'Objets

S3 est le service de stockage d'objets le plus utilisé au monde :
- **Durabilité** : 99,999999999% (11 nines) — vos données sont automatiquement répliquées sur plusieurs AZs
- **Versioning** : Protège contre les suppressions accidentelles en conservant plusieurs versions d'un fichier
- **Lifecycle Policies** : Transition automatique des données vers des classes moins coûteuses (Standard → Standard-IA → Glacier → Glacier Deep Archive)
- **S3 Transfer Acceleration** : Accélère les uploads en utilisant les Edge Locations CloudFront

### Amazon EBS — Stockage par Blocs

EBS fournit des volumes de stockage persistants pour vos instances EC2 :
- **Snapshots** : Sauvegardes incrémentielles stockées dans S3
- **Encryption** : Chiffrement AES-256 intégré, activable par défaut

{{ressource:Lab : Héberger un site statique sur S3:EXERCICE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Points Clés à Retenir

- **EC2** : VMs avec 3 modèles d'achat (On-Demand, Reserved, Spot) + Auto Scaling + ELB
- **Lambda** : Serverless événementiel, gratuit jusqu'à 1M requêtes/mois, paiement à l'exécution
- **Elastic Beanstalk** : PaaS pour développeurs, déploiement automatique
- **S3** : Stockage d'objets, 11 nines, versioning, lifecycle policies, Transfer Acceleration
- **EBS** : Stockage par blocs pour EC2, snapshots, chiffrement
- Pour l'examen : retenez quel service utiliser pour quel besoin (EC2 = VM, S3 = objets, Lambda = serverless, Beanstalk = PaaS)`,

            coursId: coursAwsCp.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Guide des Types d\'Instances EC2', description: 'Tableau comparatif des familles d\'instances EC2 et cas d\'usage', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 520000, public: true, ordre: 0, moduleId: awsCpModule2.id },
            { titre: 'Lab : Déployer une instance EC2', description: 'Exercice pratique de lancement d\'une VM EC2 pas à pas', type: 'EXERCICE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 280000, public: true, ordre: 1, moduleId: awsCpModule2.id },
            { titre: 'Lab : Héberger un site statique sur S3', description: 'Tutoriel pour héberger un site Web statique avec S3', type: 'EXERCICE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 190000, public: true, ordre: 2, moduleId: awsCpModule2.id },
        ],
    });

    const awsCpModule3 = await prisma.module.create({
        data: {
            titre: 'Sécurité, Identité et Conformité AWS',
            description: 'Protégez vos ressources avec IAM, MFA, AWS Shield et les best practices de sécurité.',
            ordre: 2,
            dureeEstimee: 80,
            videoUrl: 'https://www.youtube.com/embed/1NSTaR5YFvA',
            contenu: `## Introduction

La sécurité est un pilier fondamental d'AWS. Pour l'examen CLF-C02 (25% du score), vous devez comprendre IAM, le modèle de responsabilité partagée, et les services de sécurité de base. Ce module vous donne les clés pour sécuriser vos ressources AWS.

---

## AWS IAM — Identity and Access Management

IAM est le service central qui gère qui peut faire quoi sur vos ressources AWS.

### Concepts Fondamentaux

- **Root User** : Créé avec le compte AWS, il a un accès complet et illimité. **Ne l'utilisez jamais pour les tâches quotidiennes** — activez MFA et créez des utilisateurs IAM pour l'administration.
- **IAM Users** : Identités créées pour les personnes ou applications. Chaque utilisateur a des credentials (mot de passe console ou clés d'accès API).
- **IAM Groups** : Collection d'utilisateurs. Au lieu d'assigner des permissions à chaque personne, on assigne une politique au groupe. Tous les membres héritent des permissions.
- **IAM Roles** : Identités temporaires assumées par un utilisateur ou un service AWS. Pas de credentials permanents — ils sont générés dynamiquement via STS.
- **IAM Policies** : Documents JSON qui définissent les permissions (Allow ou Deny) sur des actions et des ressources spécifiques.

{{ressource:IAM Best Practices - Guide Officiel:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

### Règles d'Or AWS

1. Activez **MFA** sur le compte root **immédiatement**
2. Créez des **utilisateurs IAM** pour l'administration quotidienne — ne travaillez jamais avec le root
3. Appliquez le **moindre privilège** : donnez uniquement les permissions nécessaires
4. Préférez les **rôles IAM** aux clés d'accès pour les applications — les rôles génèrent des credentials temporaires

---

## Services de Sécurité AWS

### AWS Shield

- **Shield Standard** : Protection DDoS gratuite pour tous les clients AWS (activée par défaut sur CloudFront, Route 53, ELB)
- **Shield Advanced** : Protection DDoS renforcée (3 000 $/mois) avec détection avancée, atténuation des couches 3/4/7, et accès à l'équipe DRT (DDoS Response Team)

### AWS WAF (Web Application Firewall)

Filtre les requêtes HTTP/HTTPS pour protéger vos applications Web contre :
- **SQL injection** : Bloque les tentatives d'injection SQL dans les paramètres
- **Cross-site scripting (XSS)** : Bloque les scripts malveillants
- **Rate limiting** : Limite le nombre de requêtes par IP pour prévenir le brute-force

### AWS KMS (Key Management Service)

KMS est le service central de gestion des clés de chiffrement, intégré à la plupart des services AWS (S3, EBS, RDS, Lambda). Il permet de créer, gérer et faire tourner les clés de chiffrement de façon centralisée.

{{ressource:AWS Security Essentials:SLIDE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Le Modèle de Responsabilité Partagée

Ce modèle est **fondamental** pour l'examen CLF-C02 et toutes les certifications AWS :

**AWS est responsable de la sécurité DE l'infrastructure** (Security of the Cloud) :
- Centres de données, matériel, réseau physique, hyperviseurs

**Vous êtes responsable de la sécurité DANS l'infrastructure** (Security in the Cloud) :
- OS des instances EC2, applications, données, configurations IAM, pare-feu (Security Groups), chiffrement côté client

> **Règle d'or** : Même dans un service managé (PaaS), vous êtes toujours responsable de vos données et de la gestion des accès (IAM).

{{ressource:AWS Shared Responsibility Model:SLIDE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Points Clés à Retenir

- **IAM** : Root User (accès total, à protéger avec MFA), Users (personnes), Groups (permissions partagées), Roles (temporaires), Policies (JSON de permissions)
- **Règles d'or** : MFA sur root, moindre privilège, rôles > clés
- **Shield** : Standard (gratuit, DDoS), Advanced (payant, 3 000 $/mois)
- **WAF** : Firewall applicatif (SQLi, XSS, rate limiting)
- **KMS** : Gestion centralisée des clés de chiffrement
- **Responsabilité partagée** : AWS sécurise l'infrastructure, vous sécurisez ce qu'il y a dedans
- La sécurité = 25% de l'examen CLF-C02 — c'est le deuxième domaine le plus important`,

            coursId: coursAwsCp.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'IAM Best Practices - Guide Officiel', description: 'Guide des meilleures pratiques IAM AWS', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 680000, public: true, ordre: 0, moduleId: awsCpModule3.id },
            { titre: 'AWS Security Essentials', description: 'Présentation des services de sécurité AWS', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 3200000, public: true, ordre: 1, moduleId: awsCpModule3.id },
        ],
    });

    const awsCpModule4 = await prisma.module.create({
        data: {
            titre: 'Tarification, Optimisation des Coûts et Support',
            description: 'Comprenez les modèles de tarification AWS, les outils d\'optimisation et les plans de support.',
            ordre: 3,
            dureeEstimee: 70,
            videoUrl: 'https://www.youtube.com/embed/73oVJjQNnB0',
            contenu: `## Introduction

La facturation et la tarification représentent 16% de l'examen CLF-C02, mais c'est souvent le domaine qui piège les candidats. Ce module couvre les modèles d'achat AWS, les outils de gestion des coûts et les plans de support. Comprendre comment optimiser les coûts est une compétence clé pour tout professionnel cloud.

---

## Modèles de Tarification AWS

AWS propose plusieurs modèles d'achat, chacun adapté à un cas d'usage spécifique :

### Paiement à l'Usage (Pay-as-you-go)

Le modèle le plus simple : vous payez uniquement ce que vous consommez, sans engagement ni frais avancés. Idéal pour les charges de travail variables, les projets en phase de démarrage et les environnements de développement.

### Reserved Instances (RI)

Engagement de 1 ou 3 ans sur un type d'instance spécifique :
- **Jusqu'à 72% d'économie** par rapport au prix à la demande
- **Standard RI** : Modification possible (famille, taille, AZ)
- **Convertible RI** : Changement de famille d'instance possible, économie moins élevée (jusqu'à 66%)

### Savings Plans

Engagement sur une dépense horaire (1 ou 3 ans), plus flexible que les RI :
- **Calcul Savings Plans** : S'applique à toutes les instances EC2, Fargate, Lambda
- **EC2 Instance Savings Plans** : S'applique à une famille d'instance spécifique
- **Jusqu'à 66% d'économie**

### Spot Instances

Instances EC2 utilisant la capacité inutilisée d'AWS :
- **Jusqu'à 90% d'économie** par rapport au prix à la demande
- Idéal pour : Batch, CI/CD, tests, workloads tolérants aux pannes
- **Attention** : Peut être interrompu avec un préavis de 2 minutes
- À utiliser uniquement pour des workloads qui peuvent être arrêtés et redémarrés

{{ressource:AWS Pricing Models Comparison:SLIDE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## AWS Organizations et Gestion des Coûts

### AWS Organizations

Service qui permet de gérer plusieurs comptes AWS de façon centralisée :

- **Consolidated Billing** : Facture unique pour tous les comptes de l'organisation
- **Volume Discounts** : Remises basées sur l'utilisation agrégée de tous les comptes
- **Service Control Policies (SCP)** : Appliquez des restrictions de permissions à tous les comptes membres
- **AWS Budgets** : Créez des budgets avec des alertes par email (à 50%, 90%, 100%)

{{ressource:Calculateur de coûts AWS:LIEN_EXTERNE:https://calculator.aws.amazon.com/}}

---

## Plans de Support AWS

| Plan | Prix | Caractéristiques |
|------|------|-----------------|
| **Basic** | Gratuit | Accès à la documentation, aux forums et aux vérifications de santé (Trusted Advisor limité) |
| **Developer** | À partir de 29 $/mois | Support email 24h/24, réponse sous 24h (non critique), meilleures pratiques générales |
| **Business** | À partir de 100 $/mois | Support technique 24/7 par téléphone/chat/email, réponse 1h pour urgence, Trusted Advisor complet |
| **Enterprise On-Ramp** | À partir de 5 500 $/mois | TAM (Technical Account Manager) pour l'intégration, réponse 30min pour urgence |
| **Enterprise** | À partir de 15 000 $/mois | TAM dédié, réponse 15min pour urgence, support infrastructure événementiel, Concierge Support Team |

{{ressource:Guide d'optimisation des coûts AWS:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Points Clés à Retenir

- **4 modèles d'achat** : On-Demand (flexible), Reserved (72% éco), Savings Plans (66% éco, flexible), Spot (90% éco, interruptible)
- **AWS Organizations** : Centralise la gestion des comptes et la facturation (Consolidated Billing)
- **AWS Budgets** : Créez des alertes pour éviter les dépassements de coûts
- **4 plans de support** : Basic (gratuit), Developer (29 $), Business (100 $), Enterprise (15 000 $)
- La tarification = 16% de l'examen — sachez quel modèle d'achat correspond à quel cas d'usage`,

            coursId: coursAwsCp.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'Calculateur de coûts AWS', description: 'Outil officiel d\'estimation des coûts AWS', type: 'LIEN_EXTERNE', url: 'https://calculator.aws.amazon.com/', public: true, ordre: 0, moduleId: awsCpModule4.id },
            { titre: 'Guide d\'optimisation des coûts AWS', description: 'Stratégies et outils pour réduire votre facture AWS', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 780000, public: true, ordre: 1, moduleId: awsCpModule4.id },
            { titre: 'AWS Pricing Models Comparison', description: 'Infographie comparant les 4 modèles d\'achat AWS', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 1500000, public: true, ordre: 2, moduleId: awsCpModule4.id },
        ],
    });

    const awsCpModule5 = await prisma.module.create({
        data: {
            titre: 'Architecture de Base, Migration et Révision',
            description: 'Architecture Well-Architected, stratégies de migration et préparation à l\'examen CLF-C02.',
            ordre: 4,
            dureeEstimee: 90,
            videoUrl: 'https://www.youtube.com/embed/2r2Ui-OBaqg',
            contenu: `## Introduction

Ce dernier module rassemble les concepts d'architecture Well-Architected, les stratégies de migration, le Cloud Adoption Framework (CAF), et une synthèse complète pour l'examen CLF-C02. C'est votre session de révision finale avant le jour J.

---

## Architecture Well-Architected

Le Well-Architected Framework est un ensemble de bonnes pratiques pour concevoir des architectures cloud fiables, sécurisées et économiques. Il repose sur **6 piliers** :

1. **Operational Excellence** : Automatisez les opérations, surveillez en continu, améliorez les processus
2. **Security** : IAM, chiffrement, moindre privilège — protégez les données et les systèmes
3. **Reliability** : Haute disponibilité (Multi-AZ), reprise après sinistre, scalabilité
4. **Performance Efficiency** : Choisissez les bonnes ressources pour chaque charge de travail
5. **Cost Optimization** : Éliminez le gaspillage, payez pour ce dont vous avez besoin
6. **Sustainability** : Minimisez l'impact environnemental de vos architectures

{{ressource:AWS Well-Architected Framework Overview:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Stratégies de Migration

La migration vers AWS peut suivre différentes stratégies, appelées les **7 R** :

| Stratégie | Description | Effort |
|-----------|-------------|--------|
| **Rehost (Lift & Shift)** | Migrer l'application à l'identique | Faible |
| **Replatform** | Optimisation mineure (ex : RDS au lieu de SQL auto-géré) | Moyen |
| **Refactor/Re-architect** | Moderniser l'application (microservices, serverless) | Élevé |
| **Repurchase** | Passer à une solution SaaS | Faible |
| **Retire** | Supprimer les applications obsolètes | Faible |
| **Retain** | Garder certaines applications sur site | Nul |
| **Relocate** | Déplacer vers un autre compte/région AWS | Faible |

### Outils de Migration

- **AWS Migration Hub** : Suivi centralisé de toutes vos migrations
- **AWS Application Discovery Service** : Découvrez et cartographiez votre parc applicatif
- **AWS DMS (Database Migration Service)** : Migrez les bases de données avec un temps d'arrêt minimal
- **AWS SMS (Server Migration Service)** : Automatisez la migration des serveurs

{{ressource:Exam Readiness CLF-C02:PDF:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## AWS Cloud Adoption Framework (CAF)

Le CAF est un guide structuré pour accompagner les entreprises dans leur adoption du cloud AWS. Il identifie **6 perspectives** qui couvrent l'ensemble des aspects d'une transformation cloud :

1. **Business** : Stratégie, finance, portefeuille d'applications
2. **People** : Compétences, culture d'entreprise, gestion du changement
3. **Governance** : Contrôle des risques, conformité réglementaire
4. **Platform** : Architecture de référence, infrastructure, données
5. **Security** : IAM, détection des menaces, protection des données
6. **Operations** : Monitoring, gestion des incidents, patching

> **Pour l'examen** : On vous demandera peut-être d'identifier la perspective CAF correspondant à une situation donnée (ex : "formation des équipes" → People).

---

## Domaines d'Examen CLF-C02 et Stratégie de Révision

| Domaine | Poids | Priorité |
|---------|-------|----------|
| **Technologie cloud** | **33%** | Priorité 1 : EC2, S3, Lambda, RDS, VPC, cas d'usage |
| **Concepts du cloud** | **26%** | Priorité 2 : modèles de service, avantages, AWS Global Infrastructure |
| **Sécurité et conformité** | **25%** | Priorité 3 : IAM, Shared Responsibility, Shield, WAF, KMS |
| **Facturation et tarification** | **16%** | Priorité 4 : modèles d'achat, Savings Plans, Support Plans |

> **Conseil pour réussir** : L'examen CLF-C02 teste la compréhension des concepts et des cas d'usage, pas les détails techniques très précis. Si vous savez quel service utiliser pour quel besoin et que vous comprenez les modèles de tarification de base, vous êtes bien préparé.

{{ressource:Simulation d'examen CLF-C02:EXERCICE:https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf}}

---

## Points Clés à Retenir

- **Well-Architected** : 6 piliers (Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability)
- **7 R de migration** : Rehost (le plus simple), Refactor (le plus complexe), Retire (économies)
- **CAF** : 6 perspectives (Business, People, Governance, Platform, Security, Operations)
- **Domaines CLF-C02** : Technologie cloud (33%) > Concepts cloud (26%) > Sécurité (25%) > Facturation (16%)
- Pour l'examen : concentrez-vous sur les **cas d'usage des services** et les **définitions** — c'est ce qui est le plus testé`,

            coursId: coursAwsCp.id,
        },
    });

    await prisma.ressource.createMany({
        data: [
            { titre: 'AWS Cloud Practitioner - Carte Mentale', description: 'Mindmap de révision CLF-C02 avec tous les domaines', type: 'SLIDE', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 2800000, public: true, ordre: 0, moduleId: awsCpModule5.id },
            { titre: 'Exam Readiness CLF-C02', description: 'Guide officiel AWS de préparation au Cloud Practitioner', type: 'PDF', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', taille: 1100000, public: true, ordre: 1, moduleId: awsCpModule5.id },
            { titre: 'AWS Cloud Practitioner Essentials', description: 'Cours officiel AWS Digital Training gratuit', type: 'LIEN_EXTERNE', url: 'https://aws.amazon.com/fr/training/learn-about/cloud-practitioner/', public: true, ordre: 2, moduleId: awsCpModule5.id },
        ],
    });

    // ───── INSCRIPTIONS ET PROGRESSIONS ─────
    console.log('📝 Création des inscriptions et progressions...');

    // Inscription d'Aziz au cours AZ-900
    const inscAzizAz = await prisma.inscriptionCours.create({
        data: {
            progression: 50,
            coursId: coursAz900.id,
            apprenantId: apprenantPrincipal.id,
        },
    });

    // Progression : Module 1 complété, Module 2 en cours
    await prisma.progressionModule.create({
        data: {
            inscriptionCoursId: inscAzizAz.id,
            moduleId: azModule1.id,
            completed: true,
            dateCompletion: new Date(Date.now() - 86400000 * 2),
        },
    });

    await prisma.progressionModule.create({
        data: {
            inscriptionCoursId: inscAzizAz.id,
            moduleId: azModule2.id,
            completed: true,
            dateCompletion: new Date(Date.now() - 86400000),
        },
    });

    // Inscription d'Aziz au cours Security+
    const inscAzizSec = await prisma.inscriptionCours.create({
        data: {
            progression: 25,
            coursId: coursSecurity.id,
            apprenantId: apprenantPrincipal.id,
        },
    });

    await prisma.progressionModule.create({
        data: {
            inscriptionCoursId: inscAzizSec.id,
            moduleId: secModule1.id,
            completed: true,
            dateCompletion: new Date(Date.now() - 86400000 * 3),
        },
    });

    // Inscription d'Aziz au cours Google Cloud Digital Leader
    const inscAzizGcp = await prisma.inscriptionCours.create({
        data: {
            progression: 20,
            coursId: coursGcp.id,
            apprenantId: apprenantPrincipal.id,
        },
    });

    await prisma.progressionModule.create({
        data: {
            inscriptionCoursId: inscAzizGcp.id,
            moduleId: gcpModule1.id,
            completed: true,
            dateCompletion: new Date(Date.now() - 86400000),
        },
    });

    // Inscription d'Aziz au cours AWS Cloud Practitioner
    const inscAzizAwsCp = await prisma.inscriptionCours.create({
        data: {
            progression: 10,
            coursId: coursAwsCp.id,
            apprenantId: apprenantPrincipal.id,
        },
    });

    // Inscription d'autres apprenants
    const otherApprenants = otherUsers.filter((u) => u.id !== formateur.id && u.id !== formateur2.id && u.id !== formateur3.id);
    const allCours = [coursAz900.id, coursAws.id, coursSecurity.id, coursGcp.id, coursAwsCp.id];
    const apprenantIds = otherApprenants.map(a => a.id);
    for (let i = 0; i < apprenantIds.length; i++) {
        const coursCount = 1 + Math.floor(Math.random() * 2);
        const assigned = new Set<bigint>();
        for (let j = 0; j < coursCount; j++) {
            let coursId: bigint;
            do {
                coursId = allCours[Math.floor(Math.random() * allCours.length)];
            } while (assigned.has(coursId));
            assigned.add(coursId);
            await prisma.inscriptionCours.create({
                data: {
                    progression: Math.floor(Math.random() * 80),
                    coursId,
                    apprenantId: apprenantIds[i],
                },
            });
        }
    }

    // 10. Forum et Communauté enrichis avec sujets, commentaires imbriqués et likes
    console.log('💬 Création des discussions et sujets du forum...');

    // Sujet 1 (Cybersécurité)
    const sujet1 = await prisma.sujet.create({
        data: {
            titre: 'Comment optimiser la révision du chapitre Sécurité pour la Security+ ?',
            contenu: 'Bonjour à tous ! Je passe ma certification Security+ dans 2 semaines. Des conseils sur la partie gestion des risques et cryptographie ? Merci d\'avance !',
            theme: 'Cybersécurité',
            auteurId: apprenantPrincipal.id,
            certificationId: certSecurity.id,
        },
    });

    const comm1Sujet1 = await prisma.commentaire.create({
        data: {
            contenu: 'Salut Aziz ! Concentre-toi bien sur les attaques de type Phishing, PKI et la différence entre chiffrements symétrique et asymétrique. Les questions sont très pratiques.',
            sujetId: sujet1.id,
            auteurId: formateur.id,
        },
    });

    // Réponses imbriquées au comm 1 du sujet 1
    await prisma.commentaire.create({
        data: {
            contenu: 'Merci Sarah pour tes conseils ! Est-ce qu\'il y a des TP ou des labs recommandés pour s\'entraîner ?',
            sujetId: sujet1.id,
            auteurId: apprenantPrincipal.id,
            parentCommentaireId: comm1Sujet1.id,
        },
    });

    await prisma.commentaire.create({
        data: {
            contenu: 'Tu peux consulter les fiches téléchargeables et guides PDF récapitulatifs dans la section Ressources du dashboard !',
            sujetId: sujet1.id,
            auteurId: superAdmin.id,
            parentCommentaireId: comm1Sujet1.id,
        },
    });

    await prisma.commentaire.create({
        data: {
            contenu: 'Je confirme, la partie gouvernance et analyse de risques représente au moins 25% des questions d\'examen !',
            sujetId: sujet1.id,
            auteurId: otherUsers[0].id,
        },
    });

    await prisma.likeSujet.createMany({
        data: [
            { sujetId: sujet1.id, utilisateurId: superAdmin.id },
            { sujetId: sujet1.id, utilisateurId: formateur.id },
            { sujetId: sujet1.id, utilisateurId: otherUsers[1].id },
        ],
    });

    await prisma.likeCommentaire.createMany({
        data: [
            { commentaireId: comm1Sujet1.id, utilisateurId: apprenantPrincipal.id },
            { commentaireId: comm1Sujet1.id, utilisateurId: superAdmin.id },
        ],
    });

    // Sujet 2 (Azure & Cloud)
    const sujet2 = await prisma.sujet.create({
        data: {
            titre: 'Retour d\'expérience sur la certification Microsoft Azure AZ-900 (Obtenue avec 890/1000 🎉)',
            contenu: 'Bonjour la communauté ! Je viens de valider mon examen AZ-900 ce matin avec un score de 890. Les questions sur Microsoft Entra ID, Azure Policy et le modèle de coût TCO sont très fréquentes. N\'hésitez pas si vous avez des questions !',
            theme: 'Azure & Cloud',
            auteurId: otherUsers[1].id,
            certificationId: certAz900.id,
        },
    });

    const comm1Sujet2 = await prisma.commentaire.create({
        data: {
            contenu: 'Bravo Leila ! Félicitations 👏 ! Combien de temps as-tu révisé avant de passer l\'examen ?',
            sujetId: sujet2.id,
            auteurId: apprenantPrincipal.id,
        },
    });

    await prisma.commentaire.create({
        data: {
            contenu: 'Merci Aziz ! J\'ai révisé environ 3 semaines en faisant régulièrement les QCM du simulateur d\'entraînement EthicalData.',
            sujetId: sujet2.id,
            auteurId: otherUsers[1].id,
            parentCommentaireId: comm1Sujet2.id,
        },
    });

    await prisma.commentaire.create({
        data: {
            contenu: 'Félicitations Leila ! Très beau résultat, vous êtes prête pour attaquer l\'AZ-104 maintenant !',
            sujetId: sujet2.id,
            auteurId: formateur.id,
        },
    });

    await prisma.likeSujet.createMany({
        data: [
            { sujetId: sujet2.id, utilisateurId: apprenantPrincipal.id },
            { sujetId: sujet2.id, utilisateurId: formateur.id },
            { sujetId: sujet2.id, utilisateurId: otherUsers[2].id },
            { sujetId: sujet2.id, utilisateurId: otherUsers[3].id },
        ],
    });

    // Sujet 3 (Conseils Examen)
    const sujet3 = await prisma.sujet.create({
        data: {
            titre: 'Astuces pour gérer le stress et le temps pendant les examens Proctored en ligne',
            contenu: 'En tant que formatrice, voici mes 5 règles d\'or pour passer vos examens à domicile sans accrocs : 1. Bureau complètement dégagé, 2. Connexion filaire si possible, 3. Ne lisez pas à voix haute, 4. Marquez les questions hésitantes et revenez-y à la fin !',
            theme: 'Conseils Examen',
            auteurId: formateur.id,
        },
    });

    await prisma.commentaire.create({
        data: {
            contenu: 'Merci beaucoup Sarah ! La règle de ne pas chuchoter ni lire à voix haute m\'a sauvé la vie, le proctor m\'avait prévenu lors de mon premier test.',
            sujetId: sujet3.id,
            auteurId: apprenantPrincipal.id,
        },
    });

    await prisma.commentaire.create({
        data: {
            contenu: 'Excellents conseils Sarah, un grand merci pour cet accompagnement de qualité sur la plateforme !',
            sujetId: sujet3.id,
            auteurId: superAdmin.id,
        },
    });

    await prisma.likeSujet.createMany({
        data: [
            { sujetId: sujet3.id, utilisateurId: apprenantPrincipal.id },
            { sujetId: sujet3.id, utilisateurId: otherUsers[0].id },
            { sujetId: sujet3.id, utilisateurId: otherUsers[1].id },
            { sujetId: sujet3.id, utilisateurId: otherUsers[4].id },
        ],
    });

    // Sujet 4 (Data & AI)
    const sujet4 = await prisma.sujet.create({
        data: {
            titre: 'Quelle roadmap choisir pour se spécialiser en Data Engineering et GenAI en 2026 ?',
            contenu: 'Salut à tous, je cherche des conseils pour construire une roadmap solide entre l\'ingénierie de données et l\'IA générative. Est-il préférable de passer Microsoft DP-600 ou AWS Data Engineer Associate en premier ?',
            theme: 'Data & AI',
            auteurId: otherUsers[2].id,
        },
    });

    await prisma.commentaire.create({
        data: {
            contenu: 'Les deux sont excellentes, mais DP-600 avec Microsoft Fabric prend énormément d\'ampleur en entreprise actuellement !',
            sujetId: sujet4.id,
            auteurId: otherUsers[3].id,
        },
    });

    await prisma.likeSujet.createMany({
        data: [
            { sujetId: sujet4.id, utilisateurId: apprenantPrincipal.id },
            { sujetId: sujet4.id, utilisateurId: formateur.id },
        ],
    });

    // Sujet 5 (Carrière & Emploi)
    const sujet5 = await prisma.sujet.create({
        data: {
            titre: 'Quelles sont les certifications les plus recherchées par les recruteurs Cloud / DevOps ?',
            contenu: 'Bonjour les passionnés ! Selon vous, quelles certifications font vraiment la différence sur un CV pour un recrutement ou une reconversion dans l\'univers Cloud & Sécurité ?',
            theme: 'Carrière & Emploi',
            auteurId: otherUsers[4].id,
        },
    });

    await prisma.commentaire.create({
        data: {
            contenu: 'AWS Solutions Architect et Security+ restent le combo le plus demandé sur le marché.',
            sujetId: sujet5.id,
            auteurId: otherUsers[0].id,
        },
    });

    await prisma.likeSujet.createMany({
        data: [
            { sujetId: sujet5.id, utilisateurId: apprenantPrincipal.id },
            { sujetId: sujet5.id, utilisateurId: otherUsers[2].id },
        ],
    });

    // 10. Planning Coaching & Créneaux de Disponibilité enrichis
    console.log('🗓️ Création des créneaux de coaching et rendez-vous...');
    const now = new Date();

    const makeDate = (daysFromNow: number, hour: number, minute: number = 0) => {
        const d = new Date(now);
        d.setDate(now.getDate() + daysFromNow);
        d.setHours(hour, minute, 0, 0);
        return d;
    };

    // Créneaux LIBRES (disponibles pour réservation par l'apprenant)
    const creneauxLibresData = [
        { formateurId: formateur.id, dateDebut: makeDate(1, 10), dateFin: makeDate(1, 11) },
        { formateurId: formateur.id, dateDebut: makeDate(1, 14), dateFin: makeDate(1, 15) },
        { formateurId: formateur.id, dateDebut: makeDate(2, 11), dateFin: makeDate(2, 12) },
        { formateurId: formateur.id, dateDebut: makeDate(3, 15), dateFin: makeDate(3, 16) },

        { formateurId: formateur2.id, dateDebut: makeDate(1, 15, 30), dateFin: makeDate(1, 16, 30) },
        { formateurId: formateur2.id, dateDebut: makeDate(2, 14), dateFin: makeDate(2, 15) },
        { formateurId: formateur2.id, dateDebut: makeDate(4, 10), dateFin: makeDate(4, 11) },

        { formateurId: formateur3.id, dateDebut: makeDate(2, 10), dateFin: makeDate(2, 11) },
        { formateurId: formateur3.id, dateDebut: makeDate(3, 16), dateFin: makeDate(3, 17) },
        { formateurId: formateur3.id, dateDebut: makeDate(5, 14), dateFin: makeDate(5, 15) },
    ];

    for (const c of creneauxLibresData) {
        await prisma.creneauDisponibilite.create({
            data: {
                formateurId: c.formateurId,
                dateDebut: c.dateDebut,
                dateFin: c.dateFin,
                estReserve: false,
            },
        });
    }

    // 2. Créneaux RÉSERVÉS avec Rendez-Vous déjà confirmés pour l'apprenant principal (Aziz)
    const creneauReserve1 = await prisma.creneauDisponibilite.create({
        data: {
            formateurId: formateur.id,
            dateDebut: makeDate(1, 16),
            dateFin: makeDate(1, 17),
            estReserve: true,
        },
    });

    await prisma.rendezVous.create({
        data: {
            creneauId: creneauReserve1.id,
            candidatId: apprenantPrincipal.id,
            formateurId: formateur.id,
            type: 'COACHING_TECHNIQUE',
            motif: 'Besoin d\'aide sur les architectures hybrides Azure & Entra ID (MFA).',
            notes: 'Lien Google Meet : https://meet.google.com/xyz-abc-def',
            statut: 'CONFIRME',
        },
    });

    const creneauReserve2 = await prisma.creneauDisponibilite.create({
        data: {
            formateurId: formateur2.id,
            dateDebut: makeDate(3, 11),
            dateFin: makeDate(3, 12),
            estReserve: true,
        },
    });

    await prisma.rendezVous.create({
        data: {
            creneauId: creneauReserve2.id,
            candidatId: apprenantPrincipal.id,
            formateurId: formateur2.id,
            type: 'PREPARATION_EXAMEN',
            motif: 'Revue de préparation et stratégie de passage pour l\'examen CompTIA Security+.',
            notes: 'Session de blanc d\'examen en direct',
            statut: 'CONFIRME',
        },
    });

    // 3. Un rendez-vous passé TERMINE
    const creneauPasse = await prisma.creneauDisponibilite.create({
        data: {
            formateurId: formateur.id,
            dateDebut: makeDate(-3, 14),
            dateFin: makeDate(-3, 15),
            estReserve: true,
        },
    });

    await prisma.rendezVous.create({
        data: {
            creneauId: creneauPasse.id,
            candidatId: apprenantPrincipal.id,
            formateurId: formateur.id,
            type: 'ORIENTATION',
            motif: 'Orientation initiale et définition de la roadmap de certification Cloud.',
            notes: 'Bilan effectué avec succès. Plan d\'étude validé.',
            statut: 'TERMINE',
        },
    });

    console.log('🎉 Seeding terminé avec succès ! Toutes les données avec visuels HD sont prêtes.');
}

main()
    .catch((e) => {
        console.error('Erreur lors du seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

