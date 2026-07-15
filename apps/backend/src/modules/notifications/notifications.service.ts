import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface SendToGroupDto {
    titre: string;
    message: string;
    target: 'FORMATEUR' | 'APPRENANT' | 'TOUS';
    type?: string;
    lien?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Créer une notification pour un utilisateur spécifique
  async createNotification(
    destinataireId: number | string,
    titre: string,
    message: string,
    type: string,
    lien?: string,
  ) {
    return this.prisma.notification.create({
      data: {
        destinataireId: BigInt(destinataireId),
        titre,
        message,
        type,
        lien,
      },
    });
  }

  // Notifier tous les administrateurs (ex: pour un signalement)
  async notifyAdmins(titre: string, message: string, type: string, lien?: string) {
    const adminRoles = await this.prisma.role.findMany({
      where: { nom: { in: ['SUPER_ADMIN', 'ADMIN'] } },
      include: {
        utilisateurs: { select: { id: true } },
      },
    });

    const adminIds = new Set<string>();
    adminRoles.forEach((role) => {
      role.utilisateurs.forEach((u) => adminIds.add(u.id.toString()));
    });

    const notificationsData = Array.from(adminIds).map((adminId) => ({
      destinataireId: BigInt(adminId),
      titre,
      message,
      type,
      lien,
    }));

    if (notificationsData.length > 0) {
      await this.prisma.notification.createMany({
        data: notificationsData,
      });
    }
  }

  // Envoyer une notification à un groupe d'utilisateurs
  async sendToGroup(dto: SendToGroupDto) {
    const roleNames: string[] = [];
    if (dto.target === 'FORMATEUR' || dto.target === 'TOUS') {
      roleNames.push('FORMATEUR');
    }
    if (dto.target === 'APPRENANT' || dto.target === 'TOUS') {
      roleNames.push('APPRENANT');
    }

    const roles = await this.prisma.role.findMany({
      where: { nom: { in: roleNames } },
      include: {
        utilisateurs: { select: { id: true } },
      },
    });

    const userIds = new Set<string>();
    roles.forEach((role) => {
      role.utilisateurs.forEach((u) => userIds.add(u.id.toString()));
    });

    if (userIds.size === 0) {
      throw new BadRequestException('Aucun utilisateur trouvé pour ce groupe.');
    }

    const notificationsData = Array.from(userIds).map((id) => ({
      destinataireId: BigInt(id),
      titre: dto.titre,
      message: dto.message,
      type: dto.type || 'SYSTEM',
      lien: dto.lien || null,
    }));

    await this.prisma.notification.createMany({
      data: notificationsData,
    });

    return { success: true, count: userIds.size };
  }

  // Récupérer les notifications d'un utilisateur
  async getUserNotifications(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: { destinataireId: BigInt(userId) },
      orderBy: { dateCreation: 'desc' },
      take: 30,
    });

    const unreadCount = await this.prisma.notification.count({
      where: { destinataireId: BigInt(userId), lue: false },
    });

    return {
      unreadCount,
      notifications: notifications.map((n) => ({
        ...n,
        id: n.id.toString(),
        destinataireId: n.destinataireId.toString(),
      })),
    };
  }

  // Marquer une notification comme lue
  async markAsRead(userId: number, notificationId: number) {
    const notif = await this.prisma.notification.findFirst({
      where: { id: BigInt(notificationId), destinataireId: BigInt(userId) },
    });

    if (!notif) throw new NotFoundException('Notification non trouvée.');

    await this.prisma.notification.update({
      where: { id: BigInt(notificationId) },
      data: { lue: true },
    });

    return { message: 'Notification marquée comme lue.' };
  }

  // Marquer TOUTES les notifications comme lues
  async markAllAsRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { destinataireId: BigInt(userId), lue: false },
      data: { lue: true },
    });

    return { message: 'Toutes les notifications ont été marquées comme lues.' };
  }

  // Supprimer une notification
  async deleteNotification(userId: number, notificationId: number) {
    await this.prisma.notification.deleteMany({
      where: { id: BigInt(notificationId), destinataireId: BigInt(userId) },
    });

    return { message: 'Notification supprimée.' };
  }
}