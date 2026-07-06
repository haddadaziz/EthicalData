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
            image: '/badges/comptia-sec.svg',
            fournisseurId: comptia.id,
        },
    });

    // 7. Questions d'examen réelles (QCM, Vrai/Faux, Ouvertes & Cas Pratiques avec IA)
    console.log('❓ Ajout des questions de simulation réelles & banque d\'évaluation IA...');

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

    // 9. Forum et Communauté enrichis avec sujets, commentaires imbriqués et likes
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

    // Formateurs disponibles (Sarah Mansouri + Formateurs parmi les utilisateurs)
    const formateur2 = otherUsers[0]; // Karim El Amrani (Formateur)
    const formateur3 = otherUsers[3]; // Sofia Alaoui (Formatrice)

    // 1. Créneaux LIBRES (disponibles pour réservation par l'apprenant)
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
