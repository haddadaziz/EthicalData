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
                email: `${prenoms[i].toLowerCase()}.${noms[i].toLowerCase()}@ethicaldata.local`,
                telephone: `+212 6 10 20 30 0${i}`,
                motDePasse: hashedPassword,
                statut: 'ACTIF',
                avatar: avatars[i % avatars.length],
                roles: { connect: { id: i % 3 === 0 ? formateurRole.id : apprenantRole.id } },
            },
        });
        otherUsers.push(u);
    }

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
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
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
            image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
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
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
            fournisseurId: comptia.id,
        },
    });

    // 7. Questions d'examen réelles
    console.log('❓ Ajout des questions de simulation réelles...');
    await prisma.question.create({
        data: {
            enonce: "Quel service Azure permet de centraliser la gestion des identités et de configurer l'authentification multifacteur (MFA) ?",
            explication: "Microsoft Entra ID (anciennement Azure Active Directory) est le service cloud de gestion des accès et des identités.",
            reponseCorrecte: "B",
            categorie: "Identité & IAM",
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
            enonce: "Quel service de stockage AWS offre un stockage d'objets hautement durable pour sauvegarder des fichiers, images et sauvegardes ?",
            explication: "Amazon S3 (Simple Storage Service) est un service de stockage d'objets offrant une durabilité de 99.999999999% (11 nines).",
            reponseCorrecte: "C",
            categorie: "Stockage Cloud",
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
            type: 'SLIDES',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            public: true,
            certificationId: certAws.id,
        },
    });

    // 9. Forum et Communauté
    console.log('💬 Création des discussions et sujets du forum...');
    const sujet1 = await prisma.sujet.create({
        data: {
            titre: 'Comment optimiser la révision du chapitre Sécurité pour la Security+ ?',
            contenu: 'Bonjour à tous ! Je passe ma certification Security+ dans 2 semaines. Des conseils sur la partie gestion des risques et cryptographie ? Merci d\'avance !',
            theme: 'Cybersécurité',
            auteurId: apprenantPrincipal.id,
            certificationId: certSecurity.id,
        },
    });

    await prisma.commentaire.create({
        data: {
            contenu: 'Salut Aziz ! Concentre-toi bien sur les attaques de type Phishing, PKI et la différence entre chiffrements symétrique et asymétrique. Les questions sont très pratiques.',
            sujetId: sujet1.id,
            auteurId: formateur.id,
        },
    });

    await prisma.likeSujet.create({
        data: {
            sujetId: sujet1.id,
            utilisateurId: superAdmin.id,
        },
    });

    // 10. Planning Coaching & Créneaux de Disponibilité
    console.log('🗓️ Création des créneaux de coaching...');
    const aujourdhui = new Date();
    const dateDemain = new Date(aujourdhui);
    dateDemain.setDate(aujourdhui.getDate() + 1);
    dateDemain.setHours(14, 0, 0, 0);

    const dateFinDemain = new Date(dateDemain);
    dateFinDemain.setHours(15, 0, 0, 0);

    const creneauDispo = await prisma.creneauDisponibilite.create({
        data: {
            formateurId: formateur.id,
            dateDebut: dateDemain,
            dateFin: dateFinDemain,
            estReserve: true,
        },
    });

    await prisma.rendezVous.create({
        data: {
            creneauId: creneauDispo.id,
            candidatId: apprenantPrincipal.id,
            formateurId: formateur.id,
            type: 'COACHING_TECHNIQUE',
            motif: 'Besoin d\'aide sur les architectures hybrides Azure & Active Directory.',
            notes: 'Lien Google Meet généré automatiquement',
            statut: 'CONFIRME',
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
