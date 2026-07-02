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

        const tentative = await this.prisma.tentative.create({
            data: {
                score,
                utilisateurId: BigInt(userId),
                certificationId: BigInt(certId),
            },
        });

        return {
            ...tentative,
            id: tentative.id.toString(),
            utilisateurId: tentative.utilisateurId.toString(),
            certificationId: tentative.certificationId.toString(),
        };
    }

    // 7. Obtenir les statistiques et le Readiness Score IA de l'utilisateur
    async getUserStats(userId: number) {
        const tentatives = await this.prisma.tentative.findMany({
            where: { utilisateurId: BigInt(userId) },
            include: { certification: true },
            orderBy: { datePassage: 'desc' },
        });

        const total = tentatives.length;
        const avgScore =
            total > 0
                ? Math.round(
                    tentatives.reduce((acc, curr) => acc + curr.score, 0) / total,
                )
                : 0;

        // Calcul du Readiness Score global
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
                certificationName: t.certification.nom,
                certificationSlug: t.certification.slug,
            })),
        };
    }
}