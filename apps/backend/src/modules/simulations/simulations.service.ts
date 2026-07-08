import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../certifications/ai.service';
import { CreateQuestionDto } from './dto/create-question.dto';

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

        // Tentative passe maintenant par une Simulation liée à la certification
        const simulation = await this.prisma.simulation.findFirst({
            where: { certificationId: BigInt(certId) },
        });

        if (!simulation) {
            throw new NotFoundException('Aucune simulation disponible pour cette certification.');
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
}