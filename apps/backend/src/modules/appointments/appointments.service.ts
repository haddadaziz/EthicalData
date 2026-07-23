import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCreneauDto } from './dto/create-creneau.dto';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // 1. Créer un créneau de disponibilité (Formateur / Admin)
  async createCreneau(formateurId: number, dto: CreateCreneauDto) {
    const debut = new Date(dto.dateDebut);
    const fin = new Date(dto.dateFin);

    if (debut >= fin) {
      throw new BadRequestException(
        'La date de début doit être antérieure à la date de fin.',
      );
    }

    const creneau = await this.prisma.creneauDisponibilite.create({
      data: {
        formateurId: BigInt(formateurId),
        dateDebut: debut,
        dateFin: fin,
      },
      include: {
        formateur: {
          select: { id: true, prenom: true, nom: true, avatar: true },
        },
      },
    });

    return {
      ...creneau,
      id: creneau.id.toString(),
      formateurId: creneau.formateurId.toString(),
      formateur: {
        ...creneau.formateur,
        id: creneau.formateur.id.toString(),
      },
    };
  }

  // 2. Récupérer les créneaux disponibles pour les apprenants
  async getAvailableCreneaux() {
    const now = new Date();
    const creneaux = await this.prisma.creneauDisponibilite.findMany({
      where: {
        estReserve: false,
        dateDebut: { gte: now },
      },
      orderBy: { dateDebut: 'asc' },
      include: {
        formateur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    return creneaux.map((c) => ({
      ...c,
      id: c.id.toString(),
      formateurId: c.formateurId.toString(),
      formateur: {
        ...c.formateur,
        id: c.formateur.id.toString(),
      },
    }));
  }

  // 3. Réserver un rendez-vous (Apprenant) (+ NOTIFICATIONS)
  async bookAppointment(candidatId: number, dto: BookAppointmentDto) {
    const candidat = await this.prisma.utilisateur.findUnique({
      where: { id: BigInt(candidatId) },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const creneau = await tx.creneauDisponibilite.findUnique({
        where: { id: BigInt(dto.creneauId) },
        include: { formateur: true },
      });

      if (!creneau) {
        throw new NotFoundException('Créneau introuvable.');
      }

      if (creneau.estReserve) {
        throw new ConflictException(
          'Ce créneau a déjà été réservé par un autre candidat.',
        );
      }

      const claimed = await tx.creneauDisponibilite.updateMany({
        where: { id: BigInt(dto.creneauId), estReserve: false },
        data: { estReserve: true },
      });

      if (claimed.count === 0) {
        throw new ConflictException('Ce créneau a été réservé entre-temps.');
      }

      const existingRdv = await tx.rendezVous.findUnique({
        where: { creneauId: creneau.id },
      });

      let rdv;
      if (existingRdv) {
        rdv = await tx.rendezVous.update({
          where: { id: existingRdv.id },
          data: {
            candidatId: BigInt(candidatId),
            formateurId: creneau.formateurId,
            type: dto.type as any,
            motif: dto.motif || null,
            statut: 'CONFIRME',
          },
          include: {
            candidat: {
              select: { id: true, prenom: true, nom: true, email: true },
            },
            formateur: {
              select: { id: true, prenom: true, nom: true, email: true },
            },
            creneau: true,
          },
        });
      } else {
        rdv = await tx.rendezVous.create({
          data: {
            candidatId: BigInt(candidatId),
            formateurId: creneau.formateurId,
            creneauId: creneau.id,
            type: dto.type as any,
            motif: dto.motif,
            statut: 'CONFIRME',
          },
          include: {
            candidat: {
              select: { id: true, prenom: true, nom: true, email: true },
            },
            formateur: {
              select: { id: true, prenom: true, nom: true, email: true },
            },
            creneau: true,
          },
        });
      }

      return { rdv, creneau };
    });

    const dateFormatted = new Date(result.creneau.dateDebut).toLocaleDateString(
      'fr-FR',
      {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      },
    );

    await this.notificationsService.createNotification(
      candidatId.toString(),
      'Rendez-vous confirmé',
      `Votre séance de coaching (${dto.type}) avec ${result.creneau.formateur.prenom} ${result.creneau.formateur.nom} est confirmée pour le ${dateFormatted}.`,
      'SYSTEM',
      '/dashboard/appointments',
    );

    if (candidatId.toString() !== result.creneau.formateurId.toString()) {
      await this.notificationsService.createNotification(
        result.creneau.formateurId.toString(),
        'Nouveau RDV Réservé',
        `L'apprenant ${candidat?.prenom} ${candidat?.nom} a réservé le créneau du ${dateFormatted} (${dto.type}).`,
        'SYSTEM',
        '/dashboard/appointments',
      );
    }

    const rdv = result.rdv as any;
    return {
      ...rdv,
      id: rdv.id.toString(),
      candidatId: rdv.candidatId.toString(),
      formateurId: rdv.formateurId.toString(),
      creneauId: rdv.creneauId.toString(),
      candidat: { ...rdv.candidat, id: rdv.candidat.id.toString() },
      formateur: { ...rdv.formateur, id: rdv.formateur.id.toString() },
      creneau: {
        ...rdv.creneau,
        id: rdv.creneau.id.toString(),
        formateurId: rdv.creneau.formateurId.toString(),
      },
    };
  }

  // 4. Obtenir mes rendez-vous (Apprenant / Formateur)
  async getMyAppointments(userId: number) {
    const rdvList = await this.prisma.rendezVous.findMany({
      where: {
        OR: [{ candidatId: BigInt(userId) }, { formateurId: BigInt(userId) }],
      },
      orderBy: { creneau: { dateDebut: 'asc' } },
      include: {
        candidat: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            avatar: true,
            email: true,
          },
        },
        formateur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            avatar: true,
            email: true,
          },
        },
        creneau: true,
      },
    });

    return rdvList.map((rdv) => ({
      ...rdv,
      id: rdv.id.toString(),
      candidatId: rdv.candidatId.toString(),
      formateurId: rdv.formateurId.toString(),
      creneauId: rdv.creneauId.toString(),
      candidat: { ...rdv.candidat, id: rdv.candidat.id.toString() },
      formateur: { ...rdv.formateur, id: rdv.formateur.id.toString() },
      creneau: {
        ...rdv.creneau,
        id: rdv.creneau.id.toString(),
        formateurId: rdv.creneau.formateurId.toString(),
      },
    }));
  }

  // 4b. Tous les rendez-vous (Admin uniquement)
  async getAllAppointments() {
    const rdvList = await this.prisma.rendezVous.findMany({
      orderBy: { creneau: { dateDebut: 'desc' } },
      include: {
        candidat: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            avatar: true,
            email: true,
          },
        },
        formateur: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            avatar: true,
            email: true,
          },
        },
        creneau: true,
      },
    });

    return rdvList.map((rdv) => ({
      ...rdv,
      id: rdv.id.toString(),
      candidatId: rdv.candidatId.toString(),
      formateurId: rdv.formateurId.toString(),
      creneauId: rdv.creneauId.toString(),
      candidat: { ...rdv.candidat, id: rdv.candidat.id.toString() },
      formateur: { ...rdv.formateur, id: rdv.formateur.id.toString() },
      creneau: {
        ...rdv.creneau,
        id: rdv.creneau.id.toString(),
        formateurId: rdv.creneau.formateurId.toString(),
      },
    }));
  }

  // 5. Annuler un rendez-vous (Libère le créneau et notifie les DEUX parties)
  async cancelAppointment(userId: number, userRoles: string[], rdvId: number) {
    const rdv = await this.prisma.rendezVous.findUnique({
      where: { id: BigInt(rdvId) },
      include: { creneau: true, candidat: true, formateur: true },
    });

    if (!rdv) throw new NotFoundException('Rendez-vous introuvable.');

    const isAdmin =
      userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMIN');
    const isCandidat = rdv.candidatId === BigInt(userId);
    const isFormateur = rdv.formateurId === BigInt(userId);

    if (!isAdmin && !isCandidat && !isFormateur) {
      throw new ForbiddenException(
        'Vous ne pouvez pas annuler ce rendez-vous.',
      );
    }

    await this.prisma.rendezVous.update({
      where: { id: BigInt(rdvId) },
      data: { statut: 'ANNULE' },
    });

    await this.prisma.creneauDisponibilite.update({
      where: { id: rdv.creneauId },
      data: { estReserve: false },
    });

    const dateFormatted = new Date(rdv.creneau.dateDebut).toLocaleDateString(
      'fr-FR',
      {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      },
    );

    const isActorFormateur = BigInt(userId) === rdv.formateurId;

    if (isActorFormateur) {
      await this.notificationsService.createNotification(
        rdv.candidatId.toString(),
        'Rendez-vous Annulé par le Formateur',
        `Votre formateur ${rdv.formateur.prenom} ${rdv.formateur.nom} a annulé la séance de coaching du ${dateFormatted}.`,
        'SYSTEM',
        '/dashboard/appointments',
      );
    } else {
      await this.notificationsService.createNotification(
        rdv.formateurId.toString(),
        "Rendez-vous Annulé par l'Apprenant",
        `L'apprenant ${rdv.candidat.prenom} ${rdv.candidat.nom} a annulé la séance de coaching du ${dateFormatted}.`,
        'SYSTEM',
        '/dashboard/appointments',
      );

      await this.notificationsService.createNotification(
        rdv.candidatId.toString(),
        'Rendez-vous Annulé',
        `Votre rendez-vous du ${dateFormatted} avec ${rdv.formateur.prenom} ${rdv.formateur.nom} a bien été annulé.`,
        'SYSTEM',
        '/dashboard/appointments',
      );
    }

    return { message: 'Rendez-vous annulé et créneau libéré.' };
  }

  // 6. Supprimer un créneau libre (Admin / Formateur propriétaire)
  async deleteCreneau(userId: number, userRoles: string[], creneauId: number) {
    const creneau = await this.prisma.creneauDisponibilite.findUnique({
      where: { id: BigInt(creneauId) },
      include: { rendezVous: true },
    });

    if (!creneau) {
      throw new NotFoundException("Le créneau demandé n'existe pas.");
    }

    const isAdmin =
      userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMIN');
    if (!isAdmin && creneau.formateurId !== BigInt(userId)) {
      throw new ForbiddenException(
        'Vous ne pouvez pas supprimer un créneau qui ne vous appartient pas.',
      );
    }

    if (creneau.estReserve) {
      throw new BadRequestException(
        'Vous ne pouvez pas supprimer un créneau déjà réservé. Veuillez annuler le rendez-vous associé.',
      );
    }

    if (creneau.rendezVous) {
      await this.prisma.rendezVous.delete({
        where: { id: creneau.rendezVous.id },
      });
    }

    await this.prisma.creneauDisponibilite.delete({
      where: { id: BigInt(creneauId) },
    });

    return { message: 'Créneau supprimé avec succès.' };
  }

  // 7. Mettre à jour un créneau libre (Admin / Formateur propriétaire)
  async updateCreneau(
    userId: number,
    userRoles: string[],
    creneauId: number,
    dto: CreateCreneauDto,
  ) {
    const creneau = await this.prisma.creneauDisponibilite.findUnique({
      where: { id: BigInt(creneauId) },
    });

    if (!creneau) {
      throw new NotFoundException("Le créneau demandé n'existe pas.");
    }

    const isAdmin =
      userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMIN');
    if (!isAdmin && creneau.formateurId !== BigInt(userId)) {
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier un créneau qui ne vous appartient pas.',
      );
    }

    if (creneau.estReserve) {
      throw new BadRequestException(
        'Vous ne pouvez pas modifier un créneau déjà réservé.',
      );
    }

    const debut = new Date(dto.dateDebut);
    const fin = new Date(dto.dateFin);

    if (debut >= fin) {
      throw new BadRequestException(
        'La date de début doit être antérieure à la date de fin.',
      );
    }

    const updated = await this.prisma.creneauDisponibilite.update({
      where: { id: BigInt(creneauId) },
      data: {
        dateDebut: debut,
        dateFin: fin,
      },
      include: {
        formateur: {
          select: { id: true, prenom: true, nom: true, avatar: true },
        },
      },
    });

    return {
      ...updated,
      id: updated.id.toString(),
      formateurId: updated.formateurId.toString(),
      formateur: {
        ...updated.formateur,
        id: updated.formateur.id.toString(),
      },
    };
  }
}
