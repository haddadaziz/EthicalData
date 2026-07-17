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
  constructor(private readonly prisma: PrismaService) {}

  // 1. Récupérer toutes les ressources actives
  async findAllRessources() {
    const resources = await this.prisma.ressource.findMany({
      where: { deletedAt: null },
      include: {
        certification: true,
        cours: { select: { id: true, titre: true } },
      },
      orderBy: { dateCreation: 'desc' },
    });
    return resources.map((r) => ({
      ...r,
      id: r.id.toString(),
      moduleId: r.moduleId?.toString(),
      coursId: r.coursId?.toString(),
      certificationId: r.certificationId?.toString(),
      certification: r.certification
        ? {
            id: r.certification.id.toString(),
            nom: r.certification.nom,
            slug: r.certification.slug,
            codeExamen: r.certification.codeExamen,
          }
        : null,
      cours: r.cours
        ? {
            id: r.cours.id.toString(),
            titre: r.cours.titre,
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
        certificationId: dto.certificationId
          ? BigInt(dto.certificationId)
          : null,
      },
    });
    return {
      ...ressource,
      id: ressource.id.toString(),
      moduleId: ressource.moduleId?.toString(),
      coursId: ressource.coursId?.toString(),
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
        certificationId: dto.certificationId
          ? BigInt(dto.certificationId)
          : null,
      },
    });
    return {
      ...updated,
      id: updated.id.toString(),
      moduleId: updated.moduleId?.toString(),
      coursId: updated.coursId?.toString(),
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

  // 5. Télécharger un document avec vérification de quota et règles anti-partage
  async downloadRessource(
    userId: number,
    resourceId: number,
    ipAddress: string,
  ) {
    const resource = await this.prisma.ressource.findFirst({
      where: { id: BigInt(resourceId), deletedAt: null },
    });

    if (!resource) {
      throw new NotFoundException("La ressource demandée n'existe pas.");
    }

    // ─── Vérification du quota ────────────────────────────────────────
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

    // ─── Règles anti-partage ──────────────────────────────────────────

    // 1. Rate limiting : max 15 téléchargements par heure
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await this.prisma.telechargement.count({
      where: {
        utilisateurId: BigInt(userId),
        date: { gte: oneHourAgo },
      },
    });
    if (recentCount >= 15) {
      throw new ForbiddenException(
        'Vous avez atteint la limite de 15 téléchargements par heure. Veuillez réessayer plus tard.',
      );
    }

    // 2. Détection de partage de compte : plus de 3 IP différentes en 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentIps = await this.prisma.telechargement.findMany({
      where: {
        utilisateurId: BigInt(userId),
        date: { gte: oneDayAgo },
        ip: { not: null },
      },
      select: { ip: true },
      distinct: ['ip'],
    });
    const uniqueIps = new Set(recentIps.map((d) => d.ip).filter(Boolean));
    if (uniqueIps.size >= 3 && !uniqueIps.has(ipAddress)) {
      throw new ForbiddenException(
        'Tentative de téléchargement depuis un nouvel appareil détectée. ' +
          'Pour des raisons de sécurité, veuillez vérifier votre compte ou contacter le support.',
      );
    }

    // 3. Anti-flood : pas plus de 5 téléchargements en 1 minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const rapidCount = await this.prisma.telechargement.count({
      where: {
        utilisateurId: BigInt(userId),
        date: { gte: oneMinuteAgo },
      },
    });
    if (rapidCount >= 5) {
      throw new ForbiddenException(
        'Trop de téléchargements rapides détectés. Veuillez patienter avant de continuer.',
      );
    }

    // ─── Enregistrement du téléchargement ─────────────────────────────
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

  // 7. Récupérer l'historique des téléchargements de l'utilisateur connecté
  async getUserDownloadHistory(userId: number) {
    const history = await this.prisma.telechargement.findMany({
      where: { utilisateurId: BigInt(userId) },
      include: {
        ressource: {
          select: {
            id: true,
            titre: true,
            type: true,
            url: true,
            taille: true,
            certification: {
              select: { id: true, nom: true, slug: true, codeExamen: true },
            },
            cours: {
              select: { id: true, titre: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return history.map((h) => ({
      id: h.id.toString(),
      date: h.date,
      ip: h.ip,
      ressource: {
        id: h.ressource.id.toString(),
        titre: h.ressource.titre,
        type: h.ressource.type,
        url: h.ressource.url,
        taille: h.ressource.taille,
        certification: h.ressource.certification
          ? {
              id: h.ressource.certification.id.toString(),
              nom: h.ressource.certification.nom,
              slug: h.ressource.certification.slug,
              codeExamen: h.ressource.certification.codeExamen,
            }
          : null,
        cours: h.ressource.cours
          ? {
              id: h.ressource.cours.id.toString(),
              titre: h.ressource.cours.titre,
            }
          : null,
      },
    }));
  }

  // 8. Récupérer l'historique complet des téléchargements (admin)
  async getAllDownloadHistory(options: {
    page: number;
    limit: number;
    search?: string;
    type?: string;
    userId?: string;
  }) {
    const { page, limit, search, type, userId } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.ressource = {
        titre: { contains: search },
      };
    }
    if (type) {
      where.ressource = {
        ...where.ressource,
        type: type as any,
      };
    }
    if (userId) {
      where.utilisateurId = BigInt(userId);
    }

    const [total, data] = await Promise.all([
      this.prisma.telechargement.count({ where }),
      this.prisma.telechargement.findMany({
        where,
        include: {
          ressource: {
            select: {
              id: true,
              titre: true,
              type: true,
              taille: true,
              certification: {
                select: { id: true, nom: true, slug: true, codeExamen: true },
              },
              cours: {
                select: { id: true, titre: true },
              },
            },
          },
          utilisateur: {
            select: {
              id: true,
              prenom: true,
              nom: true,
              email: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: data.map((h) => ({
        id: h.id.toString(),
        date: h.date,
        ip: h.ip,
        ressource: {
          id: h.ressource.id.toString(),
          titre: h.ressource.titre,
          type: h.ressource.type,
          taille: h.ressource.taille,
          certification: h.ressource.certification
            ? {
                id: h.ressource.certification.id.toString(),
                nom: h.ressource.certification.nom,
                slug: h.ressource.certification.slug,
                codeExamen: h.ressource.certification.codeExamen,
              }
            : null,
          cours: h.ressource.cours
            ? {
                id: h.ressource.cours.id.toString(),
                titre: h.ressource.cours.titre,
              }
            : null,
        },
        utilisateur: {
          id: h.utilisateur.id.toString(),
          prenom: h.utilisateur.prenom,
          nom: h.utilisateur.nom,
          email: h.utilisateur.email,
        },
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 6. Récupérer les quotas de l'utilisateur (gardé)
  async getUserResourceQuotas(userId: number) {
    const resources = await this.prisma.ressource.findMany({
      where: { deletedAt: null, public: false },
    });

    const downloads = await this.prisma.telechargement.findMany({
      where: { utilisateurId: BigInt(userId) },
    });

    return resources.map((r) => {
      const userDownloads = downloads.filter(
        (d) => d.ressourceId === r.id,
      ).length;
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
