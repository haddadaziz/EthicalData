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
      throw new BadRequestException('La date de début doit être antérieure à la date de fin.');
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
          select: { id: true, prenom: true, nom: true, avatar: true, email: true },
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
    const creneau = await this.prisma.creneauDisponibilite.findUnique({
      where: { id: BigInt(dto.creneauId) },
      include: { formateur: true },
    });

    if (!creneau) {
      throw new NotFoundException('Créneau introuvable.');
    }

    if (creneau.estReserve) {
      throw new ConflictException('Ce créneau a déjà été réservé par un autre candidat.');
    }

    const candidat = await this.prisma.utilisateur.findUnique({
      where: { id: BigInt(candidatId) },
    });

    // Créer le rendez-vous
    const rdv = await this.prisma.rendezVous.create({
      data: {
        candidatId: BigInt(candidatId),
        formateurId: creneau.formateurId,
        creneauId: creneau.id,
        type: dto.type as any,
        motif: dto.motif,
        statut: 'CONFIRME',
      },
      include: {
        candidat: { select: { id: true, prenom: true, nom: true, email: true } },
        formateur: { select: { id: true, prenom: true, nom: true, email: true } },
        creneau: true,
      },
    });

    // Marquer le créneau comme réservé
    await this.prisma.creneauDisponibilite.update({
      where: { id: creneau.id },
      data: { estReserve: true },
    });

    const dateFormatted = new Date(creneau.dateDebut).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Notification pour le candidat
    await this.notificationsService.createNotification(
      candidatId.toString(),
      "Rendez-vous confirmé",
      `Votre séance de coaching (${dto.type}) avec ${creneau.formateur.prenom} ${creneau.formateur.nom} est confirmée pour le ${dateFormatted}.`,
      "SYSTEM",
      "/dashboard/appointments",
    );

    // Notification pour le formateur
    await this.notificationsService.createNotification(
      creneau.formateurId.toString(),
      "Nouveau RDV Réservé",
      `L'apprenant ${candidat?.prenom} ${candidat?.nom} a réservé le créneau du ${dateFormatted} (${dto.type}).`,
      "SYSTEM",
      "/dashboard/coaching",
    );

    return {
      ...rdv,
      id: rdv.id.toString(),
      candidatId: rdv.candidatId.toString(),
      formateurId: rdv.formateurId.toString(),
      creneauId: rdv.creneauId.toString(),
      candidat: { ...rdv.candidat, id: rdv.candidat.id.toString() },
      formateur: { ...rdv.formateur, id: rdv.formateur.id.toString() },
      creneau: { ...rdv.creneau, id: rdv.creneau.id.toString(), formateurId: rdv.creneau.formateurId.toString() },
    };
  }

  // 4. Obtenir mes rendez-vous (Apprenant / Formateur)
  async getMyAppointments(userId: number) {
    const rdvList = await this.prisma.rendezVous.findMany({
      where: {
        OR: [
          { candidatId: BigInt(userId) },
          { formateurId: BigInt(userId) },
        ],
      },
      orderBy: { creneau: { dateDebut: 'asc' } },
      include: {
        candidat: { select: { id: true, prenom: true, nom: true, avatar: true, email: true } },
        formateur: { select: { id: true, prenom: true, nom: true, avatar: true, email: true } },
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
      creneau: { ...rdv.creneau, id: rdv.creneau.id.toString(), formateurId: rdv.creneau.formateurId.toString() },
    }));
  }

  // 5. Annuler un rendez-vous (Libère le créneau)
  async cancelAppointment(userId: number, userRoles: string[], rdvId: number) {
    const rdv = await this.prisma.rendezVous.findUnique({
      where: { id: BigInt(rdvId) },
      include: { creneau: true, candidat: true, formateur: true },
    });

    if (!rdv) throw new NotFoundException('Rendez-vous introuvable.');

    const isAdmin = userRoles.includes('SUPER_ADMIN') || userRoles.includes('ADMIN');
    const isCandidat = rdv.candidatId === BigInt(userId);
    const isFormateur = rdv.formateurId === BigInt(userId);

    if (!isAdmin && !isCandidat && !isFormateur) {
      throw new ForbiddenException('Vous ne pouvez pas annuler ce rendez-vous.');
    }

    // Mettre à jour statut du RDV
    await this.prisma.rendezVous.update({
      where: { id: BigInt(rdvId) },
      data: { statut: 'ANNULE' },
    });

    // Libérer le créneau
    await this.prisma.creneauDisponibilite.update({
      where: { id: rdv.creneauId },
      data: { estReserve: false },
    });

    // Notifier l'autre partie
    const recipientId = isCandidat ? rdv.formateurId.toString() : rdv.candidatId.toString();
    const announcerName = isCandidat ? `${rdv.candidat.prenom} ${rdv.candidat.nom}` : `${rdv.formateur.prenom} ${rdv.formateur.nom}`;

    await this.notificationsService.createNotification(
      recipientId,
      "Rendez-vous Annulé",
      `Le rendez-vous prévu avec ${announcerName} a été annulé.`,
      "SYSTEM",
      "/dashboard/appointments",
    );

    return { message: 'Rendez-vous annulé et créneau libéré.' };
  }
}
