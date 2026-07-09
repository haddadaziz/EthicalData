import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../certifications/ai.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateSimulationDto } from './dto/create-simulation.dto';

@Injectable()
export class SimulationsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: AiService,
    ) { }

    // 1. Obtenir toutes les questions d'une certification
    async findQuestionsByCertification(certId: number) {
        const questions = await this.prisma.question.findMany({
            where: { certificationId: BigInt(certId) },
            include: { options: true },
        });

        return questions.map((q) => ({
            ...q,
            id: q.id.toString(),
            certificationId: q.certificationId.toString(),
            options: q.options.map((opt) => ({
                ...opt,
                id: opt.id.toString(),
                questionId: opt.questionId.toString(),
            })),
        }));
    }

    // 2. Créer une question pour une certification
    async createQuestion(certId: number, dto: CreateQuestionDto) {
        const cert = await this.prisma.certification.findFirst({
            where: { id: BigInt(certId), deletedAt: null },
        });

        if (!cert) {
            throw new NotFoundException("La certification demandée n'existe pas.");
        }

        const optionsData =
            dto.options && dto.options.length > 0
                ? {
                    create: dto.options.map((opt: any) => ({
                        lettre: opt.lettre,
                        texte: opt.texte,
                    })),
                }
                : undefined;

        const question = await this.prisma.question.create({
            data: {
                enonce: dto.enonce,
                explication: dto.explication || null,
                reponseCorrecte: dto.reponseCorrecte,
                grilleNotation: dto.grilleNotation || null,
                categorie: dto.categorie || null,
                type: dto.type || 'QCM',
                certificationId: BigInt(certId),
                options: optionsData,
            },
            include: { options: true },
        });

        return {
            ...question,
            id: question.id.toString(),
            certificationId: question.certificationId.toString(),
            options: question.options.map((opt) => ({
                ...opt,
                id: opt.id.toString(),
                questionId: opt.questionId.toString(),
            })),
        };
    }

    // 3. Modifier une question
    async updateQuestion(questionId: number, dto: CreateQuestionDto) {
        const existing = await this.prisma.question.findUnique({
            where: { id: BigInt(questionId) },
        });
        if (!existing) {
            throw new NotFoundException("La question demandée n'existe pas.");
        }

        await this.prisma.option.deleteMany({
            where: { questionId: BigInt(questionId) },
        });

        const optionsData =
            dto.options && dto.options.length > 0
                ? {
                    create: dto.options.map((opt: any) => ({
                        lettre: opt.lettre,
                        texte: opt.texte,
                    })),
                }
                : undefined;

        const updated = await this.prisma.question.update({
            where: { id: BigInt(questionId) },
            data: {
                enonce: dto.enonce,
                explication: dto.explication || null,
                reponseCorrecte: dto.reponseCorrecte,
                grilleNotation: dto.grilleNotation || null,
                categorie: dto.categorie || null,
                type: dto.type || 'QCM',
                options: optionsData,
            },
            include: { options: true },
        });

        return {
            ...updated,
            id: updated.id.toString(),
            certificationId: updated.certificationId.toString(),
            options: updated.options.map((opt) => ({
                ...opt,
                id: opt.id.toString(),
                questionId: opt.questionId.toString(),
            })),
        };
    }

    // 4. Supprimer une question
    async removeQuestion(questionId: number) {
        await this.prisma.question.delete({
            where: { id: BigInt(questionId) },
        });
        return { message: 'Question supprimée avec succès.' };
    }

    // 5. Évaluer une réponse ouverte avec l'IA
    async evaluateQuestionWithAi(questionId: number, reponseCandidat: string) {
        const question = await this.prisma.question.findUnique({
            where: { id: BigInt(questionId) },
        });
        if (!question) {
            throw new NotFoundException("La question demandée n'existe pas.");
        }
        return this.aiService.evaluerReponseOuverte(
            question.enonce,
            question.reponseCorrecte,
            question.grilleNotation,
            reponseCandidat,
        );
    }

    // 6. Enregistrer une tentative de quiz
    async createTentative(userId: number, certId: number, score: number) {
        const cert = await this.prisma.certification.findFirst({
            where: { id: BigInt(certId), deletedAt: null },
        });

        if (!cert) {
            throw new NotFoundException("La certification demandée n'existe pas.");
        }

        let simulation = await this.prisma.simulation.findFirst({
            where: { certificationId: BigInt(certId) },
        });

        if (!simulation) {
            simulation = await this.prisma.simulation.create({
                data: {
                    titre: `Simulation ${cert.nom}`,
                    description: `Simulation automatique pour la certification ${cert.nom}`,
                    duree: 60,
                    scoreMinimal: 800,
                    certificationId: BigInt(certId),
                },
            });
        }

        const tentative = await this.prisma.tentative.create({
            data: {
                score,
                utilisateurId: BigInt(userId),
                simulationId: simulation.id,
            },
        });

        return {
            ...tentative,
            id: tentative.id.toString(),
            utilisateurId: tentative.utilisateurId.toString(),
            simulationId: tentative.simulationId.toString(),
        };
    }

    // 7. Obtenir les statistiques utilisateur
    async getUserStats(userId: number) {
        const tentatives = await this.prisma.tentative.findMany({
            where: { utilisateurId: BigInt(userId) },
            include: { simulation: { include: { certification: true } } },
            orderBy: { datePassage: 'desc' },
        });

        const total = tentatives.length;
        const avgScore =
            total > 0
                ? Math.round(
                    tentatives.reduce((acc, curr) => acc + curr.score, 0) / total,
                )
                : 0;

        const readinessScore = Math.min(100, Math.round(avgScore * 1.05));
        let readinessLabel = 'NON_PRET';
        if (readinessScore >= 80) readinessLabel = 'PRET';
        else if (readinessScore >= 65) readinessLabel = 'PRESQUE_PRET';

        return {
            totalAttempts: total,
            averageScore: avgScore,
            readinessScore,
            readinessLabel,
            history: tentatives.map((t) => ({
                id: t.id.toString(),
                score: t.score,
                datePassage: t.datePassage,
                certificationId: t.simulation?.certificationId?.toString() || '',
                certificationName: t.simulation?.certification?.nom || '',
                certificationSlug: t.simulation?.certification?.slug || '',
            })),
        };
    }

    // 8. Obtenir le Readiness Score IA et le Plan de Révision pour une certification
    async getReadinessScoreForCertification(userId: number, certId: number) {
        const cert = await this.prisma.certification.findFirst({
            where: { id: BigInt(certId), deletedAt: null },
            include: {
                cours: {
                    where: { statut: 'PUBLIE', deletedAt: null },
                    include: { modules: { orderBy: { ordre: 'asc' } } },
                },
            },
        });

        if (!cert) {
            throw new NotFoundException("La certification demandée n'existe pas.");
        }

        const tentatives = await this.prisma.tentative.findMany({
            where: {
                utilisateurId: BigInt(userId),
                simulation: { certificationId: BigInt(certId) },
            },
            orderBy: { datePassage: 'desc' },
            take: 5,
        });

        if (tentatives.length === 0) {
            return {
                certificationNom: cert.nom,
                readinessScore: 0,
                statut: 'NON_EVALUE',
                totalTentatives: 0,
                conseil: "Veuillez passer une simulation afin d'obtenir des recommandations de l'intelligence artificielle",
                pointsForts: [],
                lacunes: [],
                planRevision: [
                    `Effectuez une première simulation complète de ${cert.nom}.`,
                    `Consultez le guide de préparation et le programme officiel de l'examen.`,
                ],
                history: [],
            };
        }

        const scores = tentatives.map((t) => t.score);
        const dernierScore = scores[0];
        const moyenneScores = Math.round(
            scores.reduce((a, b) => a + b, 0) / scores.length,
        );

        const readinessScore = Math.min(
            100,
            Math.round(moyenneScores * 0.6 + dernierScore * 0.4),
        );

        let statut = 'NON_PRET';
        let conseil = '';

        if (readinessScore >= 80) {
            statut = 'PRET';
            conseil = `Excellent niveau de préparation pour ${cert.nom} ! Vos résultats sont très stables. Vous pouvez vous inscrire à l'examen officiel en toute sérénité.`;
        } else if (readinessScore >= 65) {
            statut = 'PRESQUE_PRET';
            conseil = `Vous approchez du seuil de réussite pour ${cert.nom}. Nous vous recommandons de réserver une séance de coaching individuel avec un formateur avant de réserver votre date d'examen.`;
        } else {
            statut = 'NON_PRET';
            conseil = `Des lacunes subsistent sur les concepts clés de ${cert.nom}. Consolidez vos révisions sur les fiches de cours et refaites des quiz d'entraînement.`;
        }

        const moduleTitles = (cert.cours || []).flatMap((c) => c.modules.map((m) => m.titre));
        let pointsForts: string[] = [];
        let lacunes: string[] = [];

        if (moduleTitles.length >= 2) {
            if (readinessScore >= 80) {
                pointsForts = moduleTitles.slice(0, Math.min(3, moduleTitles.length));
                lacunes = moduleTitles.slice(Math.min(3, moduleTitles.length - 1));
                if (lacunes.length === 0) lacunes = ["Optimisation avancée du temps par question"];
            } else if (readinessScore >= 65) {
                pointsForts = moduleTitles.slice(0, Math.ceil(moduleTitles.length / 2));
                lacunes = moduleTitles.slice(Math.ceil(moduleTitles.length / 2));
            } else {
                pointsForts = moduleTitles.slice(0, 1);
                lacunes = moduleTitles.slice(1);
            }
        } else {
            if (readinessScore >= 80) {
                pointsForts = ["Architecture & Concepts fondamentaux", "Identity & Access Management (IAM)"];
                lacunes = ["Optimisation fine des budgets & coûts"];
            } else if (readinessScore >= 65) {
                pointsForts = ["Concepts fondamentaux et principes généraux"];
                lacunes = ["Gestion des coûts et calcul de facturation", "Sécurité des données et stockage Cloud"];
            } else {
                pointsForts = ["Notions globales d'introduction"];
                lacunes = ["Architecture réseau & sécurité", "Stockage et redondance de données", "Gestion des coûts & facturation"];
            }
        }

        const planRevision = [
            `Révisez en priorité les fiches et cours théoriques de ${cert.nom}.`,
            `Consultez les supports PDF autorisés téléchargeables dans votre bibliothèque.`,
            `Réservez un créneau individuel avec un coach certifié pour éclaircir les points bloquants.`,
            `Effectuez 2 simulations supplémentaires chrono pour stabiliser votre score au-dessus de 80%.`,
        ];

        return {
            certificationNom: cert.nom,
            readinessScore,
            statut,
            dernierScore,
            moyenneScores,
            totalTentatives: tentatives.length,
            conseil,
            pointsForts,
            lacunes,
            planRevision,
            history: tentatives.map((t) => ({
                id: t.id.toString(),
                score: t.score,
                datePassage: t.datePassage,
                certificationId: cert.id.toString(),
                certificationName: cert.nom,
                certificationSlug: cert.slug,
            })),
        };
    }

    // ───── Simulations de Cours ─────────────────────────────────────

    async createCourseSimulation(coursId: number, dto: CreateSimulationDto) {
        const cours = await this.prisma.cours.findFirst({
            where: { id: BigInt(coursId), deletedAt: null },
        });
        if (!cours) throw new NotFoundException('Cours introuvable.');

        const existing = await this.prisma.simulation.findFirst({
            where: { coursId: BigInt(coursId) },
        });
        if (existing) throw new BadRequestException('Ce cours a déjà une simulation.');

        const simulation = await this.prisma.simulation.create({
            data: {
                titre: dto.titre,
                description: dto.description || null,
                duree: dto.duree ?? 60,
                scoreMinimal: dto.scoreMinimal ?? 700,
                certificationId: BigInt(dto.certificationId),
                coursId: BigInt(coursId),
            },
        });

        return {
            ...simulation,
            id: simulation.id.toString(),
            certificationId: simulation.certificationId.toString(),
            coursId: simulation.coursId?.toString() || null,
        };
    }

    async getCourseSimulation(coursId: number) {
        const simulation = await this.prisma.simulation.findFirst({
            where: { coursId: BigInt(coursId) },
            include: {
                questions: { include: { options: true } },
                certification: true,
            },
        });
        if (!simulation) return null;

        return {
            ...simulation,
            id: simulation.id.toString(),
            certificationId: simulation.certificationId.toString(),
            coursId: simulation.coursId?.toString() || null,
            certification: simulation.certification
                ? { ...simulation.certification, id: simulation.certification.id.toString() }
                : null,
            questions: simulation.questions.map((q) => ({
                ...q,
                id: q.id.toString(),
                certificationId: q.certificationId.toString(),
                options: q.options.map((o) => ({
                    ...o,
                    id: o.id.toString(),
                    questionId: o.questionId.toString(),
                })),
            })),
        };
    }

    async createCourseTentative(userId: number, coursId: number, score: number) {
        const simulation = await this.prisma.simulation.findFirst({
            where: { coursId: BigInt(coursId) },
        });
        if (!simulation) throw new NotFoundException('Aucune simulation pour ce cours.');

        const tentative = await this.prisma.tentative.create({
            data: {
                score,
                utilisateurId: BigInt(userId),
                simulationId: simulation.id,
            },
        });

        return {
            ...tentative,
            id: tentative.id.toString(),
            utilisateurId: tentative.utilisateurId.toString(),
            simulationId: tentative.simulationId.toString(),
        };
    }

    async getCourseTentatives(userId: number, coursId: number) {
        const simulation = await this.prisma.simulation.findFirst({
            where: { coursId: BigInt(coursId) },
        });
        if (!simulation) return [];

        const tentatives = await this.prisma.tentative.findMany({
            where: {
                utilisateurId: BigInt(userId),
                simulationId: simulation.id,
            },
            orderBy: { datePassage: 'desc' },
            take: 10,
        });

        return tentatives.map((t) => ({
            id: t.id.toString(),
            score: t.score,
            dureePassage: t.dureePassage,
            datePassage: t.datePassage,
        }));
    }

    // ───── Questions pour Simulations de Cours ──────────────────────

    async findQuestionsByCourse(coursId: number) {
        const simulation = await this.prisma.simulation.findFirst({
            where: { coursId: BigInt(coursId) },
        });
        if (!simulation) return [];

        const questions = await this.prisma.question.findMany({
            where: { simulationId: simulation.id },
            include: { options: true },
            orderBy: { dateCreation: 'asc' },
        });

        return questions.map((q) => ({
            ...q,
            id: q.id.toString(),
            certificationId: q.certificationId.toString(),
            simulationId: q.simulationId?.toString() || null,
            options: q.options.map((o) => ({
                ...o,
                id: o.id.toString(),
                questionId: o.questionId.toString(),
            })),
        }));
    }

    async createCourseQuestion(coursId: number, dto: CreateQuestionDto) {
        const simulation = await this.prisma.simulation.findFirst({
            where: { coursId: BigInt(coursId) },
            include: { cours: true },
        });
        if (!simulation) throw new NotFoundException("Ce cours n'a pas de simulation. Créez d'abord la simulation.");
        if (!simulation.cours) throw new NotFoundException('Cours introuvable.');

        const optionsData =
            dto.options && dto.options.length > 0
                ? {
                    create: dto.options.map((opt: any) => ({
                        lettre: opt.lettre,
                        texte: opt.texte,
                    })),
                }
                : undefined;

        const question = await this.prisma.question.create({
            data: {
                enonce: dto.enonce,
                explication: dto.explication || null,
                reponseCorrecte: dto.reponseCorrecte,
                grilleNotation: dto.grilleNotation || null,
                categorie: dto.categorie || null,
                type: dto.type || 'QCM',
                certificationId: simulation.certificationId,
                simulationId: simulation.id,
                options: optionsData,
            },
            include: { options: true },
        });

        return {
            ...question,
            id: question.id.toString(),
            certificationId: question.certificationId.toString(),
            simulationId: question.simulationId?.toString() || null,
            options: question.options.map((o) => ({
                ...o,
                id: o.id.toString(),
                questionId: o.questionId.toString(),
            })),
        };
    }

    async getReadinessScoreForCourse(userId: number, coursId: number) {
        const cours = await this.prisma.cours.findFirst({
            where: { id: BigInt(coursId), deletedAt: null },
            include: {
                modules: { orderBy: { ordre: 'asc' }, take: 1 },
                certification: true,
            },
        });
        if (!cours) throw new NotFoundException('Cours introuvable.');

        const simulation = await this.prisma.simulation.findFirst({
            where: { coursId: BigInt(coursId) },
        });

        if (!simulation) {
            return {
                coursNom: cours.titre,
                readinessScore: 0,
                statut: 'NON_EVALUE',
                totalTentatives: 0,
                simulationExists: false,
                conseil: "Le formateur n'a pas encore créé de simulation pour ce cours.",
                pointsForts: [],
                lacunes: [],
                planRevision: [],
                history: [],
            };
        }

        const tentatives = await this.prisma.tentative.findMany({
            where: {
                utilisateurId: BigInt(userId),
                simulationId: simulation.id,
            },
            orderBy: { datePassage: 'desc' },
            take: 5,
        });

        if (tentatives.length === 0) {
            return {
                coursNom: cours.titre,
                readinessScore: 0,
                statut: 'NON_EVALUE',
                simulationExists: true,
                totalTentatives: 0,
                conseil: "Veuillez passer la simulation de ce cours pour obtenir une analyse de votre niveau.",
                pointsForts: [],
                lacunes: [],
                planRevision: [
                    `Terminez tous les modules du cours "${cours.titre}".`,
                    `Passez la simulation de fin de cours.`,
                    `Consultez les ressources complémentaires fournies par le formateur.`,
                ],
                history: [],
            };
        }

        const scores = tentatives.map((t) => t.score);
        const dernierScore = scores[0];
        const moyenneScores = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const readinessScore = Math.min(100, Math.round(moyenneScores * 0.6 + dernierScore * 0.4));

        let statut = 'NON_PRET';
        let conseil = '';

        if (readinessScore >= 80) {
            statut = 'PRET';
            conseil = `Excellent ! Vous maîtrisez les concepts du cours "${cours.titre}". Vous êtes prêt pour l'évaluation.`;
        } else if (readinessScore >= 65) {
            statut = 'PRESQUE_PRET';
            conseil = `Bonne progression sur "${cours.titre}". Consolidez vos révisions sur les modules où vous avez le moins de points.`;
        } else {
            statut = 'NON_PRET';
            conseil = `Revoir les modules de "${cours.titre}" avant de repasser la simulation. Concentrez-vous sur les notions fondamentales.`;
        }

        const moduleTitles = (cours.modules || []).map((m) => m.titre);
        let pointsForts: string[] = [];
        let lacunes: string[] = [];

        if (moduleTitles.length >= 2) {
            const mid = Math.ceil(moduleTitles.length / 2);
            if (readinessScore >= 80) {
                pointsForts = moduleTitles;
                lacunes = ["Optimisation du temps de réponse aux questions"];
            } else if (readinessScore >= 65) {
                pointsForts = moduleTitles.slice(0, mid);
                lacunes = moduleTitles.slice(mid);
            } else {
                pointsForts = moduleTitles.slice(0, 1);
                lacunes = moduleTitles.slice(1);
            }
        } else {
            pointsForts = ["Concepts fondamentaux du cours"];
            lacunes = ["Détails avancés et cas pratiques"];
        }

        const planRevision = [
            `Révisez les modules du cours "${cours.titre}" en priorité.`,
            `Utilisez les fiches de révision et ressources associées.`,
            `Réservez un créneau avec un formateur si des points restent flous.`,
            `Repassez la simulation une fois les révisions terminées.`,
        ];

        return {
            coursNom: cours.titre,
            readinessScore,
            statut,
            dernierScore,
            moyenneScores,
            simulationExists: true,
            totalTentatives: tentatives.length,
            conseil,
            pointsForts,
            lacunes,
            planRevision,
            history: tentatives.map((t) => ({
                id: t.id.toString(),
                score: t.score,
                datePassage: t.datePassage,
            })),
        };
    }
}