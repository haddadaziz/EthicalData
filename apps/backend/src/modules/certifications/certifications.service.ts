import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';

@Injectable()
export class CertificationsService {
  constructor(private prisma: PrismaService) { }

  // Helper pour générer un slug URL-friendly
  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  // Récupérer tous les fournisseurs
  async findAllFournisseurs() {
    const fournisseurs = await this.prisma.fournisseur.findMany({
      orderBy: { nom: 'asc' }
    });
    return fournisseurs.map(f => ({
      ...f,
      id: f.id.toString()
    }));
  }

  // Récupérer toutes les certifications non supprimées
  async findAll() {
    const certs = await this.prisma.certification.findMany({
      where: { deletedAt: null },
      include: {
        fournisseur: true,
        modules: { orderBy: { ordre: 'asc' } },
        ressources: { where: { deletedAt: null } }
      },
      orderBy: { dateCreation: 'desc' }
    });

    return certs.map(c => ({
      ...c,
      id: c.id.toString(),
      fournisseurId: c.fournisseurId.toString(),
      fournisseur: {
        ...c.fournisseur,
        id: c.fournisseur.id.toString()
      },
      modules: c.modules.map(m => ({
        ...m,
        id: m.id.toString(),
        certificationId: m.certificationId.toString()
      })),
      ressources: c.ressources.map(r => ({
        ...r,
        id: r.id.toString(),
        certificationId: r.certificationId?.toString()
      }))
    }));
  }

  // Récupérer une certification par son ID
  async findOne(id: number) {
    const cert = await this.prisma.certification.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        fournisseur: true,
        modules: { orderBy: { ordre: 'asc' } },
        ressources: { where: { deletedAt: null } }
      }
    });

    if (!cert) {
      throw new NotFoundException("La certification demandée n'existe pas.");
    }

    return {
      ...cert,
      id: cert.id.toString(),
      fournisseurId: cert.fournisseurId.toString(),
      fournisseur: {
        ...cert.fournisseur,
        id: cert.fournisseur.id.toString()
      },
      modules: cert.modules.map(m => ({
        ...m,
        id: m.id.toString(),
        certificationId: m.certificationId.toString()
      })),
      ressources: cert.ressources.map(r => ({
        ...r,
        id: r.id.toString(),
        certificationId: r.certificationId?.toString()
      }))
    };
  }

  // Créer une certification
  async create(dto: CreateCertificationDto) {
    const slug = `${this.slugify(dto.nom)}-${this.slugify(dto.codeExamen || '')}`;

    const existing = await this.prisma.certification.findFirst({
      where: {
        OR: [
          { slug },
          dto.codeExamen ? { codeExamen: dto.codeExamen } : {}
        ]
      }
    });

    if (existing) {
      throw new ConflictException("Une certification avec ce nom ou ce code d'examen existe déjà.");
    }

    const cert = await this.prisma.certification.create({
      data: {
        nom: dto.nom,
        slug,
        codeExamen: dto.codeExamen || null,
        description: dto.description,
        niveau: dto.niveau,
        dureeIndicative: dto.dureeIndicative || null,
        image: dto.image || null,
        fournisseurId: BigInt(dto.fournisseurId)
      },

      return {
        ...cert,
        id: cert.id.toString(),
        fournisseurId: cert.fournisseurId.toString(),
        fournisseur: {
          ...cert.fournisseur,
          id: cert.fournisseur.id.toString()
        }
      };
    }

  // Modifier une certification
  async update(id: number, dto: UpdateCertificationDto) {
      const cert = await this.prisma.certification.findFirst({
        where: { id: BigInt(id), deletedAt: null }
      });

      if(!cert) {
        throw new NotFoundException("La certification demandée n'existe pas.");
      }

       const data: any = {
        nom: dto.nom,
        codeExamen: dto.codeExamen,
        description: dto.description,
        niveau: dto.niveau,
        dureeIndicative: dto.dureeIndicative,
        image: dto.image,
        fournisseurId: dto.fournisseurId ? BigInt(dto.fournisseurId) : undefined
      };

      if(dto.nom) {
        data.slug = `${this.slugify(dto.nom)}-${this.slugify(dto.codeExamen || cert.codeExamen || '')}`;
  }

    // Nettoyer les propriétés undefined
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

const updated = await this.prisma.certification.update({
  where: { id: BigInt(id) },
  data,
  include: {
    fournisseur: true
  }
});

return {
  ...updated,
  id: updated.id.toString(),
  fournisseurId: updated.fournisseurId.toString(),
  fournisseur: {
    ...updated.fournisseur,
    id: updated.fournisseur.id.toString()
  }
};
  }

  // Soft delete
  async remove(id: number) {
  const cert = await this.prisma.certification.findFirst({
    where: { id: BigInt(id), deletedAt: null }
  });

  if (!cert) {
    throw new NotFoundException("La certification demandée n'existe pas.");
  }

  await this.prisma.certification.update({
    where: { id: BigInt(id) },
    data: { deletedAt: new Date() }
  });

  return { message: 'Certification supprimée avec succès.' };
}
}