import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSujetDto } from './dto/create-sujet.dto';
import { CreateCommentaireDto } from './dto/create-commentaire.dto';

@Injectable()
export class ForumService {
  constructor(private prisma: PrismaService) {}

  // 1. Créer un nouveau sujet de discussion
  async createSujet(auteurId: number, dto: CreateSujetDto) {
    const sujet = await this.prisma.sujet.create({
      data: {
        titre: dto.titre,
        contenu: dto.contenu,
        theme: dto.theme,
        auteurId: BigInt(auteurId),
        certificationId: dto.certificationId ? BigInt(dto.certificationId) : null,
      },
    });

    return {
      ...sujet,
      id: sujet.id.toString(),
      auteurId: sujet.auteurId.toString(),
      certificationId: sujet.certificationId?.toString(),
    };
  }

  // 2. Lister tous les sujets avec filtres et compteurs de likes/commentaires
  async findAllSujets(filters: { theme?: string; certificationId?: number }) {
    const whereClause: any = { deletedAt: null };
    
    if (filters.theme && filters.theme !== 'TOUS') {
      whereClause.theme = filters.theme;
    }
    if (filters.certificationId) {
      whereClause.certificationId = BigInt(filters.certificationId);
    }

    const sujets = await this.prisma.sujet.findMany({
      where: whereClause,
      include: {
        auteur: {
          select: {
            prenom: true,
            nom: true,
            avatar: true,
            roles: { select: { nom: true } },
          },
        },
        certification: {
          select: {
            id: true,
            nom: true,
            codeExamen: true,
          },
        },
        commentaires: {
          where: { deletedAt: null },
        },
        likes: true,
      },
      orderBy: { dateCreation: 'desc' },
    });

    return sujets.map((s) => ({
      id: s.id.toString(),
      titre: s.titre,
      contenu: s.contenu,
      theme: s.theme,
      dateCreation: s.dateCreation,
      auteur: {
        prenom: s.auteur.prenom,
        nom: s.auteur.nom,
        avatar: s.auteur.avatar,
        role: s.auteur.roles[0]?.nom || 'APPRENANT',
      },
      certification: s.certification ? {
        id: s.certification.id.toString(),
        nom: s.certification.nom,
        codeExamen: s.certification.codeExamen,
      } : null,
      commentairesCount: s.commentaires.length,
      likesCount: s.likes.length,
    }));
  }

  // 3. Récupérer un sujet en détail avec ses commentaires et savoir si l'utilisateur l'a aimé
  async findOneSujet(id: number, currentUserId: number) {
    const sujet = await this.prisma.sujet.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        auteur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            avatar: true,
            roles: { select: { nom: true } },
          },
        },
        certification: {
          select: {
            id: true,
            nom: true,
            codeExamen: true,
          },
        },
        commentaires: {
          where: { deletedAt: null },
          include: {
            auteur: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                avatar: true,
                roles: { select: { nom: true } },
              },
            },
          },
          orderBy: { dateCreation: 'asc' },
        },
        likes: true,
      },
    });

    if (!sujet) {
      throw new NotFoundException("Ce sujet n'existe pas ou a été supprimé.");
    }

    const isLikedByUser = sujet.likes.some((l) => l.utilisateurId === BigInt(currentUserId));

    return {
      id: sujet.id.toString(),
      titre: sujet.titre,
      contenu: sujet.contenu,
      theme: sujet.theme,
      dateCreation: sujet.dateCreation,
      isLikedByUser,
      likesCount: sujet.likes.length,
      auteur: {
        id: sujet.auteur.id.toString(),
        prenom: sujet.auteur.prenom,
        nom: sujet.auteur.nom,
        avatar: sujet.auteur.avatar,
        role: sujet.auteur.roles[0]?.nom || 'APPRENANT',
      },
      certification: sujet.certification ? {
        id: sujet.certification.id.toString(),
        nom: sujet.certification.nom,
        codeExamen: sujet.certification.codeExamen,
      } : null,
      commentaires: sujet.commentaires.map((c) => ({
        id: c.id.toString(),
        contenu: c.contenu,
        dateCreation: c.dateCreation,
        auteur: {
          id: c.auteur.id.toString(),
          prenom: c.auteur.prenom,
          nom: c.auteur.nom,
          avatar: c.auteur.avatar,
          role: c.auteur.roles[0]?.nom || 'APPRENANT',
        },
      })),
    };
  }

  // 4. Liker / Enlever un like sur un sujet (Toggle)
  async toggleLikeSujet(userId: number, sujetId: number) {
    const existingLike = await this.prisma.likeSujet.findUnique({
      where: {
        sujetId_utilisateurId: {
          sujetId: BigInt(sujetId),
          utilisateurId: BigInt(userId),
        },
      },
    });

    if (existingLike) {
      await this.prisma.likeSujet.delete({
        where: { id: existingLike.id },
      });
      return { liked: false };
    } else {
      await this.prisma.likeSujet.create({
        data: {
          sujetId: BigInt(sujetId),
          utilisateurId: BigInt(userId),
        },
      });
      return { liked: true };
    }
  }

  // 5. Signaler un sujet
  async reportSujet(userId: number, sujetId: number, motif?: string) {
    const existingReport = await this.prisma.signalementSujet.findUnique({
      where: {
        sujetId_utilisateurId: {
          sujetId: BigInt(sujetId),
          utilisateurId: BigInt(userId),
        },
      },
    });

    if (existingReport) {
      return { message: 'Vous avez déjà signalé cette publication.' };
    }

    await this.prisma.signalementSujet.create({
      data: {
        sujetId: BigInt(sujetId),
        utilisateurId: BigInt(userId),
        motif,
      },
    });

    return { message: 'Signalement envoyé à la modération.' };
  }

  // 6. Ajouter un commentaire sous un sujet
  async createCommentaire(auteurId: number, sujetId: number, dto: CreateCommentaireDto) {
    const sujet = await this.prisma.sujet.findFirst({
      where: { id: BigInt(sujetId), deletedAt: null },
    });

    if (!sujet) {
      throw new NotFoundException("Le sujet associé n'existe pas.");
    }

    const comm = await this.prisma.commentaire.create({
      data: {
        contenu: dto.contenu,
        sujetId: BigInt(sujetId),
        auteurId: BigInt(auteurId),
      },
      include: {
        auteur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            avatar: true,
            roles: { select: { nom: true } },
          },
        },
      },
    });

    return {
      id: comm.id.toString(),
      contenu: comm.contenu,
      dateCreation: comm.dateCreation,
      auteur: {
        id: comm.auteur.id.toString(),
        prenom: comm.auteur.prenom,
        nom: comm.auteur.nom,
        avatar: comm.auteur.avatar,
        role: comm.auteur.roles[0]?.nom || 'APPRENANT',
      },
    };
  }

  // 7. Supprimer un sujet (seulement auteur ou admin)
  async deleteSujet(userId: number, userRoles: string[], sujetId: number) {
    const sujet = await this.prisma.sujet.findFirst({
      where: { id: BigInt(sujetId), deletedAt: null },
    });

    if (!sujet) {
      throw new NotFoundException("Ce sujet n'existe pas.");
    }

    const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN');
    const isAuthor = sujet.auteurId === BigInt(userId);

    if (!isAdmin && !isAuthor) {
      throw new ForbiddenException("Vous n'avez pas l'autorisation de supprimer ce sujet.");
    }

    await this.prisma.sujet.update({
      where: { id: BigInt(sujetId) },
      data: { deletedAt: new Date() },
    });

    return { message: 'Sujet supprimé avec succès.' };
  }

  // 8. Supprimer un commentaire (seulement auteur ou admin)
  async deleteCommentaire(userId: number, userRoles: string[], commentId: number) {
    const comm = await this.prisma.commentaire.findFirst({
      where: { id: BigInt(commentId), deletedAt: null },
    });

    if (!comm) {
      throw new NotFoundException("Ce commentaire n'existe pas.");
    }

    const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN');
    const isAuthor = comm.auteurId === BigInt(userId);

    if (!isAdmin && !isAuthor) {
      throw new ForbiddenException("Vous n'avez pas l'autorisation de supprimer ce commentaire.");
    }

    await this.prisma.commentaire.update({
      where: { id: BigInt(commentId) },
      data: { deletedAt: new Date() },
    });

    return { message: 'Commentaire supprimé avec succès.' };
  }
}