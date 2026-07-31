import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

const SESSION_INCLUDE = {
  cours: { select: { id: true, titre: true } },
  formateur: {
    select: { id: true, prenom: true, nom: true, avatar: true },
  },
} as const;

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize(session: any) {
    const placesDisponibles =
      session.maxPlaces != null
        ? Math.max(0, session.maxPlaces - (session.placesOccupees || 0))
        : null;
    return {
      ...session,
      id: session.id.toString(),
      coursId: session.coursId?.toString() || null,
      formateurId: session.formateurId.toString(),
      cours: session.cours
        ? { ...session.cours, id: session.cours.id.toString() }
        : null,
      formateur: session.formateur
        ? {
            ...session.formateur,
            id: session.formateur.id.toString(),
            nomComplet: `${session.formateur.prenom || ''} ${session.formateur.nom || ''}`.trim(),
          }
        : null,
      placesDisponibles,
      estComplet:
        session.maxPlaces != null &&
        (session.placesOccupees || 0) >= session.maxPlaces,
    };
  }

  async findAll() {
    const sessions = await this.prisma.session.findMany({
      include: SESSION_INCLUDE,
      orderBy: { dateDebut: 'desc' },
    });
    return sessions.map((s) => this.serialize(s));
  }

  async findUpcomingPublic() {
    const sessions = await this.prisma.session.findMany({
      where: {
        statut: 'OUVERTE',
        dateDebut: { gte: new Date() },
      },
      include: SESSION_INCLUDE,
      orderBy: { dateDebut: 'asc' },
    });
    return sessions.map((s) => this.serialize(s));
  }

  async findOne(id: number) {
    const session = await this.prisma.session.findUnique({
      where: { id: BigInt(id) },
      include: SESSION_INCLUDE,
    });
    if (!session) throw new NotFoundException('Session introuvable.');
    return this.serialize(session);
  }

  async create(dto: CreateSessionDto) {
    const dateDebut = new Date(dto.dateDebut);
    const dateFin = dto.dateFin ? new Date(dto.dateFin) : null;
    await this.validate(dateDebut, dateFin, dto.formateurId, dto.coursId ?? null);

    const session = await this.prisma.session.create({
      data: {
        titre: dto.titre,
        description: dto.description || null,
        dateDebut,
        dateFin,
        maxPlaces: dto.maxPlaces ?? null,
        placesOccupees: dto.placesOccupees ?? 0,
        statut: dto.statut ?? 'OUVERTE',
        teamsLink: dto.teamsLink || null,
        coursId: dto.coursId ? BigInt(dto.coursId) : null,
        formateurId: BigInt(dto.formateurId),
      },
      include: SESSION_INCLUDE,
    });

    return this.serialize(session);
  }

  async update(id: number, dto: UpdateSessionDto) {
    const existing = await this.prisma.session.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) throw new NotFoundException('Session introuvable.');

    const dateDebut = dto.dateDebut ? new Date(dto.dateDebut) : existing.dateDebut;
    const dateFin = dto.dateFin
      ? new Date(dto.dateFin)
      : dto.dateFin === null
        ? null
        : existing.dateFin;

    await this.validate(
      dateDebut,
      dateFin,
      dto.formateurId ?? Number(existing.formateurId),
      dto.coursId !== undefined ? dto.coursId : Number(existing.coursId) || null,
    );

    const session = await this.prisma.session.update({
      where: { id: BigInt(id) },
      data: {
        titre: dto.titre ?? existing.titre,
        description:
          dto.description !== undefined ? dto.description : existing.description,
        dateDebut,
        dateFin,
        maxPlaces: dto.maxPlaces !== undefined ? dto.maxPlaces : existing.maxPlaces,
        placesOccupees:
          dto.placesOccupees !== undefined
            ? dto.placesOccupees
            : existing.placesOccupees,
        statut: dto.statut ?? existing.statut,
        teamsLink: dto.teamsLink !== undefined ? dto.teamsLink : existing.teamsLink,
        coursId:
          dto.coursId !== undefined
            ? dto.coursId
              ? BigInt(dto.coursId)
              : null
            : existing.coursId,
        formateurId: dto.formateurId
          ? BigInt(dto.formateurId)
          : existing.formateurId,
      },
      include: SESSION_INCLUDE,
    });

    return this.serialize(session);
  }

  async setStatut(id: number, statut: 'OUVERTE' | 'COMPLETE' | 'CLOTUREE') {
    const existing = await this.prisma.session.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) throw new NotFoundException('Session introuvable.');

    const session = await this.prisma.session.update({
      where: { id: BigInt(id) },
      data: { statut },
      include: SESSION_INCLUDE,
    });

    return this.serialize(session);
  }

  async remove(id: number) {
    const existing = await this.prisma.session.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) throw new NotFoundException('Session introuvable.');

    await this.prisma.session.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Session supprimée avec succès.' };
  }

  private async validate(
    dateDebut: Date,
    dateFin: Date | null,
    formateurId: number,
    coursId: number | null,
  ) {
    if (dateFin && dateDebut > dateFin) {
      throw new BadRequestException(
        'La date de début doit être antérieure à la date de fin.',
      );
    }

    const formateur = await this.prisma.utilisateur.findFirst({
      where: { id: BigInt(formateurId), deletedAt: null },
    });
    if (!formateur) throw new NotFoundException('Formateur introuvable.');

    if (coursId) {
      const cours = await this.prisma.cours.findFirst({
        where: { id: BigInt(coursId), deletedAt: null },
      });
      if (!cours) throw new NotFoundException('Formation introuvable.');
    }
  }
}
