import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  private computeStatut(p: any) {
    const now = new Date();
    if (!p.actif) return 'INACTIVE';
    if (p.dateDebut && new Date(p.dateDebut) > now) return 'A_VENIR';
    if (p.dateFin && new Date(p.dateFin) < now) return 'EXPIREE';
    return 'ACTIVE';
  }

  private serialize(promotion: any) {
    return {
      ...promotion,
      id: promotion.id.toString(),
      targetId: promotion.targetId?.toString() || null,
      cours: promotion.cours
        ? { ...promotion.cours, id: promotion.cours.id.toString() }
        : null,
      statut: this.computeStatut(promotion),
    };
  }

  private async resolveCours(promotions: any[]) {
    const ids = promotions
      .filter((p) => p.targetType === 'FORMATION' && p.targetId)
      .map((p) => p.targetId);
    if (ids.length === 0) {
      return promotions.map((p) => ({ ...p, cours: null }));
    }
    const cours = await this.prisma.cours.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true, titre: true, priceMad: true },
    });
    const map = new Map(cours.map((c) => [c.id.toString(), c]));
    return promotions.map((p) => ({
      ...p,
      cours:
        p.targetType === 'FORMATION' && p.targetId
          ? map.get(p.targetId.toString()) || null
          : null,
    }));
  }

  async findAll() {
    const promotions = await this.prisma.promotion.findMany({
      orderBy: [{ actif: 'desc' }, { dateCreation: 'desc' }],
    });
    const resolved = await this.resolveCours(promotions);
    return resolved.map((p) => this.serialize(p));
  }

  async findOne(id: number) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: BigInt(id) },
    });
    if (!promotion) throw new NotFoundException('Promotion introuvable.');
    const [resolved] = await this.resolveCours([promotion]);
    return this.serialize(resolved);
  }

  async findPublicActives(targetType?: string) {
    const promotions = await this.prisma.promotion.findMany({
      where: {
        actif: true,
        isPublic: true,
        ...(targetType ? { targetType: targetType as any } : {}),
      },
      orderBy: [{ actif: 'desc' }, { dateCreation: 'desc' }],
    });
    const resolved = await this.resolveCours(promotions);
    return resolved.map((p) => this.serialize(p));
  }

  async create(dto: CreatePromotionDto) {
    if (dto.targetType === 'FORMATION' && dto.targetId) {
      const cours = await this.prisma.cours.findFirst({
        where: { id: BigInt(dto.targetId), deletedAt: null },
      });
      if (!cours) throw new NotFoundException('Formation introuvable.');
    }

    if (dto.dateDebut && dto.dateFin && new Date(dto.dateDebut) > new Date(dto.dateFin)) {
      throw new BadRequestException(
        'La date de début doit être antérieure à la date de fin.',
      );
    }

    if (dto.type === 'POURCENTAGE' && dto.valeur > 100) {
      throw new BadRequestException(
        'Un pourcentage de remise ne peut pas dépasser 100%.',
      );
    }

    const promotion = await this.prisma.promotion.create({
      data: {
        nom: dto.nom,
        description: dto.description || null,
        type: dto.type,
        valeur: dto.valeur,
        targetType: dto.targetType,
        targetId: dto.targetId ? BigInt(dto.targetId) : null,
        cibleNom: dto.cibleNom || null,
        dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : null,
        dateFin: dto.dateFin ? new Date(dto.dateFin) : null,
        actif: dto.actif ?? true,
        isPublic: dto.isPublic ?? true,
      },
    });

    return this.serialize(promotion);
  }

  async update(id: number, dto: UpdatePromotionDto) {
    const existing = await this.prisma.promotion.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) throw new NotFoundException('Promotion introuvable.');

    if (dto.targetType === 'FORMATION' && dto.targetId) {
      const cours = await this.prisma.cours.findFirst({
        where: { id: BigInt(dto.targetId), deletedAt: null },
      });
      if (!cours) throw new NotFoundException('Formation introuvable.');
    }

    const dateDebut = dto.dateDebut ? new Date(dto.dateDebut) : existing.dateDebut;
    const dateFin = dto.dateFin ? new Date(dto.dateFin) : existing.dateFin;
    if (dateDebut && dateFin && dateDebut > dateFin) {
      throw new BadRequestException(
        'La date de début doit être antérieure à la date de fin.',
      );
    }

    if (
      (dto.type ?? existing.type) === 'POURCENTAGE' &&
      (dto.valeur ?? existing.valeur) > 100
    ) {
      throw new BadRequestException(
        'Un pourcentage de remise ne peut pas dépasser 100%.',
      );
    }

    const promotion = await this.prisma.promotion.update({
      where: { id: BigInt(id) },
      data: {
        nom: dto.nom ?? existing.nom,
        description: dto.description !== undefined ? dto.description : existing.description,
        type: dto.type ?? existing.type,
        valeur: dto.valeur ?? existing.valeur,
        targetType: dto.targetType ?? existing.targetType,
        targetId:
          dto.targetId !== undefined
            ? dto.targetId
              ? BigInt(dto.targetId)
              : null
            : existing.targetId,
        cibleNom: dto.cibleNom !== undefined ? dto.cibleNom : existing.cibleNom,
        dateDebut,
        dateFin,
        actif: dto.actif ?? existing.actif,
        isPublic: dto.isPublic ?? existing.isPublic,
      },
    });

    return this.serialize(promotion);
  }

  async toggle(id: number) {
    const existing = await this.prisma.promotion.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) throw new NotFoundException('Promotion introuvable.');

    const promotion = await this.prisma.promotion.update({
      where: { id: BigInt(id) },
      data: { actif: !existing.actif },
    });

    return this.serialize(promotion);
  }

  async togglePublic(id: number) {
    const existing = await this.prisma.promotion.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) throw new NotFoundException('Promotion introuvable.');

    const promotion = await this.prisma.promotion.update({
      where: { id: BigInt(id) },
      data: { isPublic: !existing.isPublic },
    });

    return this.serialize(promotion);
  }

  async remove(id: number) {
    const existing = await this.prisma.promotion.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) throw new NotFoundException('Promotion introuvable.');

    await this.prisma.promotion.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Promotion supprimée avec succès.' };
  }
}
