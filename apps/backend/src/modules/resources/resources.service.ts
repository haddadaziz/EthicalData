import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRessourceDto } from './create-ressource.dto';
import { TypeRessource } from '@prisma/client';

@Injectable()
export class ResourcesService {
    constructor(private readonly prisma: PrismaService) { }

    // 1. Récupérer toutes les ressources actives
    async findAllRessources() {
        const resources = await this.prisma.ressource.findMany({
            where: { deletedAt: null },
            include: { certification: true },
            orderBy: { dateCreation: 'desc' },
        });
        return resources.map((r) => ({
            ...r,
            id: r.id.toString(),
            certificationId: r.certificationId?.toString(),
            certification: r.certification
                ? {
                    id: r.certification.id.toString(),
                    nom: r.certification.nom,
                    slug: r.certification.slug,
                    codeExamen: r.certification.codeExamen,
                }
                : null,
        }));
    }

    // 2. Créer une nouvelle ressource
    async createRessource(dto: CreateRessourceDto) {
        const ressource = await this.prisma.ressource.create({
            data: {
                titre: dto.titre,
                description: dto.description,
                type: dto.type as TypeRessource,
                url: dto.url,
                taille: dto.taille || null,
                version: dto.version || '1.0.0',
                quotaTelechargement:
                    dto.quotaTelechargement !== undefined ? dto.quotaTelechargement : 10,
                public: dto.public !== undefined ? dto.public : false,
                certificationId: dto.certificationId ? BigInt(dto.certificationId) : null,
            },
        });
        return {
            ...ressource,
            id: ressource.id.toString(),
            certificationId: ressource.certificationId?.toString(),
        };
    }

    // 3. Mettre à jour une ressource
    async updateRessource(id: number, dto: Partial<CreateRessourceDto>) {
        const existing = await this.prisma.ressource.findFirst({
            where: { id: BigInt(id), deletedAt: null },
        });
        if (!existing) {
            throw new NotFoundException("La ressource demandée n'existe pas.");
        }
        const updated = await this.prisma.ressource.update({
            where: { id: BigInt(id) },
            data: {
                titre: dto.titre,
                description: dto.description,
                type: dto.type as TypeRessource,
                url: dto.url,
                taille: dto.taille,
                version: dto.version,
                quotaTelechargement: dto.quotaTelechargement,
                public: dto.public,
                certificationId: dto.certificationId ? BigInt(dto.certificationId) : null,
            },
        });
        return {
            ...updated,
            id: updated.id.toString(),
            certificationId: updated.certificationId?.toString(),
        };
    }

    // 4. Supprimer une ressource (Soft delete)
    async removeRessource(id: number) {
        const existing = await this.prisma.ressource.findFirst({
            where: { id: BigInt(id), deletedAt: null },
        });
        if (!existing) {
            throw new NotFoundException("La ressource demandée n'existe pas.");
        }
        await this.prisma.ressource.update({
            where: { id: BigInt(id) },
            data: { deletedAt: new Date() },
        });
        return { message: 'Ressource supprimée avec succès.' };
    }

    // 5. Télécharger un document avec vérification de quota
    async downloadRessource(userId: number, resourceId: number, ipAddress: string) {
        const resource = await this.prisma.ressource.findFirst({
            where: { id: BigInt(resourceId), deletedAt: null },
        });

        if (!resource) {
            throw new NotFoundException("La ressource demandée n'existe pas.");
        }

        if (!resource.public) {
            const quota = resource.quotaTelechargement ?? 10;
            const downloadCount = await this.prisma.telechargement.count({
                where: {
                    utilisateurId: BigInt(userId),
                    ressourceId: BigInt(resourceId),
                },
            });

            if (downloadCount >= quota) {
                throw new ForbiddenException(
                    `Vous avez atteint votre quota maximum de ${quota} téléchargements pour cette ressource.`,
                );
            }
        }

        await this.prisma.telechargement.create({
            data: {
                ressourceId: BigInt(resourceId),
                utilisateurId: BigInt(userId),
                ip: ipAddress,
            },
        });

        return {
            url: resource.url,
            message: 'Téléchargement autorisé.',
        };
    }

    // 6. Récupérer les quotas de l'utilisateur
    async getUserResourceQuotas(userId: number) {
        const resources = await this.prisma.ressource.findMany({
            where: { deletedAt: null, public: false },
        });

        const downloads = await this.prisma.telechargement.findMany({
            where: { utilisateurId: BigInt(userId) },
        });

        return resources.map((r) => {
            const userDownloads = downloads.filter((d) => d.ressourceId === r.id).length;
            const quotaMax = r.quotaTelechargement ?? 10;
            return {
                resourceId: r.id.toString(),
                downloadsCount: userDownloads,
                quotaMax,
                remaining: Math.max(0, quotaMax - userDownloads),
            };
        });
    }
}