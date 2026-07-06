import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSujetDto } from './dto/create-sujet.dto';
import { CreateCommentaireDto } from './dto/create-commentaire.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ForumService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) { }

  // 1. Récupérer les discussions paginées
  async findAllSujets(filters?: { theme?: string; certificationId?: number; page?: number; limit?: number; userId?: number }) {
    const page = Number(filters?.page) || 1;
    const limit = Number(filters?.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = filters?.userId;

    const where: any = {};
    if (filters?.theme && filters.theme !== 'TOUS') {
      where.theme = filters.theme;
    }
    if (filters?.certificationId) {
      where.certificationId = BigInt(filters.certificationId);
    }

    const likesInclude = userId
      ? {
          where: { utilisateurId: BigInt(userId) },
          select: { utilisateurId: true },
        }
      : undefined;

    const [sujets, total] = await Promise.all([
      this.prisma.sujet.findMany({
        where,
        take: limit,
        skip: skip,
        orderBy: { dateCreation: 'desc' },
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
          certification: { select: { id: true, nom: true, codeExamen: true } },
          ...(likesInclude ? { likes: likesInclude } : {}),
          _count: { select: { likes: true, commentaires: true } },
        },
      }),
      this.prisma.sujet.count({ where }),
    ]);

    const formattedSujets = sujets.map((s: any) => {
      const { likes, ...rest } = s;
      return {
        ...rest,
        id: s.id.toString(),
        auteurId: s.auteurId.toString(),
        certificationId: s.certificationId ? s.certificationId.toString() : null,
        isLikedByUser: Array.isArray(s.likes) && s.likes.length > 0,
        auteur: {
          ...s.auteur,
          id: s.auteur.id.toString(),
          role: s.auteur.roles?.[0]?.nom || 'APPRENANT',
        },
        certification: s.certification
          ? { ...s.certification, id: s.certification.id.toString() }
          : null,
        likesCount: s._count?.likes || 0,
        commentairesCount: s._count?.commentaires || 0,
      };
    });

    return {
      data: formattedSujets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 2. Créer une nouvelle publication
  async createSujet(userId: number, dto: CreateSujetDto) {
    const sujet = await this.prisma.sujet.create({
      data: {
        titre: dto.titre,
        contenu: dto.contenu,
        theme: dto.theme,
        auteurId: BigInt(userId),
        certificationId: dto.certificationId ? BigInt(dto.certificationId) : null,
      },
    });

    return {
      ...sujet,
      id: sujet.id.toString(),
      auteurId: sujet.auteurId.toString(),
      certificationId: sujet.certificationId ? sujet.certificationId.toString() : null,
    };
  }

  // 3. Récupérer le détail d'une publication
  async findOneSujet(sujetId: number, currentUserId: number) {
    const sujet = await this.prisma.sujet.findUnique({
      where: { id: BigInt(sujetId) },
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
        certification: { select: { id: true, nom: true, codeExamen: true } },
        commentaires: {
          orderBy: { dateCreation: 'asc' },
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
            likes: {
              where: { utilisateurId: BigInt(currentUserId) },
              select: { utilisateurId: true },
            },
            _count: { select: { likes: true } },
          },
        },
        _count: { select: { likes: true, commentaires: true } },
      },
    });

    if (!sujet) {
      throw new NotFoundException('Publication non trouvée.');
    }

    const userLike = await this.prisma.likeSujet.findUnique({
      where: {
        sujetId_utilisateurId: {
          sujetId: BigInt(sujetId),
          utilisateurId: BigInt(currentUserId),
        },
      },
    });

    return {
      ...sujet,
      id: sujet.id.toString(),
      auteurId: sujet.auteurId.toString(),
      certificationId: sujet.certificationId ? sujet.certificationId.toString() : null,
      auteur: {
        ...sujet.auteur,
        id: sujet.auteur.id.toString(),
        role: sujet.auteur.roles?.[0]?.nom || 'APPRENANT',
      },
      certification: sujet.certification
        ? { ...sujet.certification, id: sujet.certification.id.toString() }
        : null,
      isLikedByUser: !!userLike,
      likesCount: sujet._count.likes,
      commentairesCount: sujet._count.commentaires,
      commentaires: sujet.commentaires.map((c: any) => ({
        id: c.id.toString(),
        contenu: c.contenu,
        dateCreation: c.dateCreation,
        sujetId: c.sujetId.toString(),
        auteurId: c.auteurId.toString(),
        parentCommentaireId: c.parentCommentaireId ? c.parentCommentaireId.toString() : null,
        likesCount: c._count?.likes || 0,
        isLikedByUser: Array.isArray(c.likes) && c.likes.length > 0,
        auteur: {
          ...c.auteur,
          id: c.auteur.id.toString(),
          role: c.auteur.roles?.[0]?.nom || 'APPRENANT',
        },
      })),
    };
  }

  // 4. Liker ou Unliker une publication (+ NOTIFICATION)
  async toggleLikeSujet(userId: number, sujetId: number) {
    const sujet = await this.prisma.sujet.findUnique({ where: { id: BigInt(sujetId) } });
    if (!sujet) throw new NotFoundException('Publication non trouvée.');

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
        where: {
          sujetId_utilisateurId: {
            sujetId: BigInt(sujetId),
            utilisateurId: BigInt(userId),
          },
        },
      });
      return { liked: false };
    } else {
      await this.prisma.likeSujet.create({
        data: {
          sujetId: BigInt(sujetId),
          utilisateurId: BigInt(userId),
        },
      });

      if (sujet.auteurId !== BigInt(userId)) {
        try {
          const liker = await this.prisma.utilisateur.findUnique({ where: { id: BigInt(userId) } });
          await this.notificationsService.createNotification(
            sujet.auteurId.toString(),
            "Nouveau J'aime",
            `${liker?.prenom || 'Un utilisateur'} ${liker?.nom || ''} a aimé votre publication "${sujet.titre}"`,
            "FORUM_LIKE",
            "/dashboard/community",
          );
        } catch (e) {
          console.warn("Erreur lors de la notification du Like sujet:", e);
        }
      }

      return { liked: true };
    }
  }

  // 5. Signaler un sujet à la modération (+ NOTIFICATION ADMINS)
  async reportSujet(userId: number, sujetId: number, motif?: string) {
    const sujet = await this.prisma.sujet.findUnique({ where: { id: BigInt(sujetId) } });
    if (!sujet) throw new NotFoundException('Publication non trouvée.');

    if (sujet.auteurId === BigInt(userId)) {
      throw new ForbiddenException('Vous ne pouvez pas signaler votre propre publication.');
    }

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

    const reporter = await this.prisma.utilisateur.findUnique({ where: { id: BigInt(userId) } });
    await this.notificationsService.notifyAdmins(
      "Nouveau Signalement",
      `${reporter?.prenom} ${reporter?.nom} a signalé la publication "${sujet.titre}". Motif: ${motif || 'Non précisé'}`,
      "FORUM_REPORT",
      "/admin/community",
    );

    return { message: 'Signalement envoyé à la modération.' };
  }

  // 6. Supprimer un sujet (Auteur ou Admin)
  async deleteSujet(userId: number, userRoles: string[], sujetId: number) {
    const sujet = await this.prisma.sujet.findUnique({ where: { id: BigInt(sujetId) } });
    if (!sujet) throw new NotFoundException('Publication non trouvée.');

    const isAdmin = userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMIN');
    const isOwner = sujet.auteurId === BigInt(userId);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer cette publication.');
    }

    await this.prisma.sujet.delete({ where: { id: BigInt(sujetId) } });

    if (isAdmin && !isOwner) {
      await this.notificationsService.createNotification(
        sujet.auteurId.toString(),
        "Publication supprimée",
        `Votre publication "${sujet.titre}" a été retirée par la modération.`,
        "SYSTEM",
        "/dashboard/community",
      );
    }

    return { message: 'Publication supprimée avec succès.' };
  }

  // 7. Ajouter un commentaire (+ NOTIFICATIONS)
  async createCommentaire(userId: number, sujetId: number, dto: CreateCommentaireDto) {
    const sujet = await this.prisma.sujet.findUnique({ where: { id: BigInt(sujetId) } });
    if (!sujet) throw new NotFoundException('Publication non trouvée.');

    const commAuthor = await this.prisma.utilisateur.findUnique({ where: { id: BigInt(userId) } });

    const commentaire = await this.prisma.commentaire.create({
      data: {
        contenu: dto.contenu,
        sujetId: BigInt(sujetId),
        auteurId: BigInt(userId),
        parentCommentaireId: dto.parentCommentaireId ? BigInt(dto.parentCommentaireId) : null,
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

    if (sujet.auteurId !== BigInt(userId)) {
      await this.notificationsService.createNotification(
        sujet.auteurId.toString(),
        "Nouveau commentaire",
        `${commAuthor?.prenom} ${commAuthor?.nom} a commenté votre publication "${sujet.titre}"`,
        "FORUM_REPLY",
        "/dashboard/community",
      );
    }

    if (dto.parentCommentaireId) {
      const parentComm = await this.prisma.commentaire.findUnique({
        where: { id: BigInt(dto.parentCommentaireId) },
      });
      if (parentComm && parentComm.auteurId !== BigInt(userId)) {
        const snippet = dto.contenu.length > 50 ? `${dto.contenu.substring(0, 50)}...` : dto.contenu;
        try {
          await this.notificationsService.createNotification(
            parentComm.auteurId.toString(),
            "Réponse à votre commentaire",
            `${commAuthor?.prenom || 'Un utilisateur'} ${commAuthor?.nom || ''} a répondu à votre commentaire : "${snippet}"`,
            "FORUM_REPLY",
            "/dashboard/community",
          );
        } catch (e) {
          console.warn("Erreur lors de la notification de réponse au commentaire:", e);
        }
      }
    }

    const c = commentaire as any;
    return {
      id: c.id.toString(),
      contenu: c.contenu,
      dateCreation: c.dateCreation,
      sujetId: c.sujetId.toString(),
      auteurId: c.auteurId.toString(),
      parentCommentaireId: c.parentCommentaireId ? c.parentCommentaireId.toString() : null,
      auteur: {
        ...c.auteur,
        id: c.auteur.id.toString(),
        role: c.auteur.roles?.[0]?.nom || 'APPRENANT',
      },
    };
  }

  // 8. Supprimer un commentaire
  async deleteCommentaire(userId: number, userRoles: string[], commentId: number) {
    const commentaire = await this.prisma.commentaire.findUnique({ where: { id: BigInt(commentId) } });
    if (!commentaire) throw new NotFoundException('Commentaire non trouvé.');

    const isAdmin = userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMIN');
    const isOwner = commentaire.auteurId === BigInt(userId);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer ce commentaire.');
    }

    await this.prisma.commentaire.delete({ where: { id: BigInt(commentId) } });
    return { message: 'Commentaire supprimé.' };
  }

  // 9. Stats Admin
  async getAdminStats() {
    const [totalSujets, totalCommentaires, totalLikes, signalementsPending] = await Promise.all([
      this.prisma.sujet.count(),
      this.prisma.commentaire.count(),
      this.prisma.likeSujet.count(),
      this.prisma.signalementSujet.count({ where: { traite: false } }),
    ]);

    return {
      totalSujets,
      totalCommentaires,
      totalLikes,
      signalementsPending,
    };
  }

  // 10. Signalements Admin
  async getReportedSujets(traite: boolean = false) {
    const signalements = await this.prisma.signalementSujet.findMany({
      where: { traite },
      orderBy: { dateCreation: 'desc' },
      include: {
        utilisateur: {
          select: { id: true, prenom: true, nom: true, email: true },
        },
        sujet: {
          include: {
            auteur: { select: { id: true, prenom: true, nom: true, email: true } },
            _count: { select: { commentaires: true, likes: true } },
          },
        },
      },
    });

    return signalements.map((sig: any) => ({
      id: sig.id.toString(),
      motif: sig.motif,
      dateCreation: sig.dateCreation,
      traite: sig.traite,
      signalePar: {
        ...sig.utilisateur,
        id: sig.utilisateur.id.toString(),
      },
      sujet: {
        id: sig.sujet.id.toString(),
        titre: sig.sujet.titre,
        contenu: sig.sujet.contenu,
        theme: sig.sujet.theme,
        dateCreation: sig.sujet.dateCreation,
        auteur: {
          ...sig.sujet.auteur,
          id: sig.sujet.auteur.id.toString(),
        },
        commentairesCount: sig.sujet._count.commentaires,
        likesCount: sig.sujet._count.likes,
      },
    }));
  }

  // 11. Résoudre signalement
  async resolveSignalement(id: number) {
    await this.prisma.signalementSujet.update({
      where: { id: BigInt(id) },
      data: { traite: true },
    });
    return { message: 'Signalement marqué comme traité.' };
  }

  // 12. Annuler résolution signalement
  async unresolveSignalement(id: number) {
    await this.prisma.signalementSujet.update({
      where: { id: BigInt(id) },
      data: { traite: false },
    });
    return { message: 'Signalement remis en attente.' };
  }

  // 13. Liker ou Unliker un commentaire (+ NOTIFICATION)
  async toggleLikeCommentaire(userId: number, commentId: number) {
    const comment = await this.prisma.commentaire.findUnique({
      where: { id: BigInt(commentId) },
    });
    if (!comment) throw new NotFoundException('Commentaire non trouvé.');

    const existingLike = await this.prisma.likeCommentaire.findUnique({
      where: {
        commentaireId_utilisateurId: {
          commentaireId: BigInt(commentId),
          utilisateurId: BigInt(userId),
        },
      },
    });

    if (existingLike) {
      await this.prisma.likeCommentaire.delete({
        where: {
          commentaireId_utilisateurId: {
            commentaireId: BigInt(commentId),
            utilisateurId: BigInt(userId),
          },
        },
      });

      if (comment.auteurId !== BigInt(userId)) {
        try {
          const liker = await this.prisma.utilisateur.findUnique({ where: { id: BigInt(userId) } });
          if (liker) {
            await this.prisma.notification.deleteMany({
              where: {
                destinataireId: comment.auteurId,
                type: "FORUM_LIKE_COMMENT",
                message: {
                  contains: `${liker.prenom} ${liker.nom}`,
                },
              },
            });
          }
        } catch (e) {
          console.warn("Erreur lors du retrait de la notification du Like commentaire:", e);
        }
      }

      return { liked: false };
    } else {
      await this.prisma.likeCommentaire.create({
        data: {
          commentaireId: BigInt(commentId),
          utilisateurId: BigInt(userId),
        },
      });

      if (comment.auteurId !== BigInt(userId)) {
        try {
          const liker = await this.prisma.utilisateur.findUnique({ where: { id: BigInt(userId) } });
          await this.notificationsService.createNotification(
            comment.auteurId.toString(),
            "Nouveau J'aime sur votre commentaire",
            `${liker?.prenom || 'Un utilisateur'} ${liker?.nom || ''} a aimé votre commentaire.`,
            "FORUM_LIKE_COMMENT",
            "/dashboard/community",
          );
        } catch (e) {
          console.warn("Erreur lors de la notification du Like commentaire:", e);
        }
      }

      return { liked: true };
    }
  }
}