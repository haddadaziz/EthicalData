import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class CertificationsService {
  constructor(private prisma: PrismaService) { }

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
      include: {
        _count: {
          select: { certifications: { where: { deletedAt: null } } }
        }
      },
      orderBy: { nom: 'asc' }
    });
    return fournisseurs.map(f => ({
      ...f,
      id: f.id.toString(),
      certificationCount: f._count.certifications
    }));
  }

  // Récupérer un fournisseur par ID
  async findOneFournisseur(id: number) {
    const fournisseur = await this.prisma.fournisseur.findFirst({
      where: { id: BigInt(id) },
      include: {
        _count: {
          select: { certifications: { where: { deletedAt: null } } }
        }
      }
    });
    if (!fournisseur) {
      throw new NotFoundException("Le fournisseur demandé n'existe pas.");
    }
    return {
      ...fournisseur,
      id: fournisseur.id.toString(),
      certificationCount: fournisseur._count.certifications
    };
  }

  // Créer un fournisseur
  async createFournisseur(dto: CreateFournisseurDto) {
    const slug = this.slugify(dto.nom);
    const existing = await this.prisma.fournisseur.findFirst({
      where: { OR: [{ nom: dto.nom }, { slug }] }
    });
    if (existing) {
      throw new ConflictException("Un fournisseur avec ce nom existe déjà.");
    }
    const f = await this.prisma.fournisseur.create({
      data: {
        nom: dto.nom,
        slug,
        image: dto.image || null
      }
    });
    return {
      ...f,
      id: f.id.toString()
    };
  }

  // Modifier un fournisseur
  async updateFournisseur(id: number, dto: UpdateFournisseurDto) {
    const f = await this.prisma.fournisseur.findFirst({
      where: { id: BigInt(id) }
    });
    if (!f) {
      throw new NotFoundException("Le fournisseur demandé n'existe pas.");
    }
    const data: any = {
      nom: dto.nom,
      image: dto.image
    };
    if (dto.nom) {
      data.slug = this.slugify(dto.nom);
      const existing = await this.prisma.fournisseur.findFirst({
        where: {
          nom: dto.nom,
          NOT: { id: BigInt(id) }
        }
      });
      if (existing) {
        throw new ConflictException("Un fournisseur avec ce nom existe déjà.");
      }
    }
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    const updated = await this.prisma.fournisseur.update({
      where: { id: BigInt(id) },
      data
    });
    return {
      ...updated,
      id: updated.id.toString()
    };
  }

  // Supprimer un fournisseur
  async removeFournisseur(id: number) {
    const f = await this.prisma.fournisseur.findFirst({
      where: { id: BigInt(id) },
      include: {
        certifications: { where: { deletedAt: null } }
      }
    });
    if (!f) {
      throw new NotFoundException("Le fournisseur demandé n'existe pas.");
    }
    if (f.certifications.length > 0) {
      throw new ConflictException("Impossible de supprimer ce fournisseur car il possède des certifications actives rattachées.");
    }
    await this.prisma.fournisseur.delete({
      where: { id: BigInt(id) }
    });
    return { message: 'Fournisseur supprimé avec succès.' };
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
      include: {
        fournisseur: true
      }
    });

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

    if (!cert) {
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

    if (dto.nom) {
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
  async findQuestions(certId: number) {
    const questions = await this.prisma.question.findMany({
      where: { certificationId: BigInt(certId) },
      include: { options: true }
    });

    return questions.map(q => ({
      ...q,
      id: q.id.toString(),
      certificationId: q.certificationId.toString(),
      options: q.options.map(opt => ({
        ...opt,
        id: opt.id.toString(),
        questionId: opt.questionId.toString()
      }))
    }));
  }

  async createQuestion(certId: number, dto: CreateQuestionDto) {
    const cert = await this.prisma.certification.findFirst({
      where: { id: BigInt(certId), deletedAt: null }
    });

    if (!cert) {
      throw new NotFoundException("La certification demandée n'existe pas.");
    }

    const optionsData = dto.options && dto.options.length > 0 
      ? {
          create: dto.options.map((opt: any) => ({
            lettre: opt.lettre,
            texte: opt.texte
          }))
        }
      : undefined;

    const question = await this.prisma.question.create({
      data: {
        enonce: dto.enonce,
        explication: dto.explication || null,
        reponseCorrecte: dto.reponseCorrecte,
        grilleNotation: dto.grilleNotation || null,
        categorie: dto.categorie || null,
        type: dto.type || "QCM",
        certificationId: BigInt(certId),
        options: optionsData
      },
      include: { options: true }
    });
    return {
      ...question,
      id: question.id.toString(),
      certificationId: question.certificationId.toString(),
      options: question.options.map(opt => ({
        ...opt,
        id: opt.id.toString(),
        questionId: opt.questionId.toString()
      }))
    };
  }

  async createTentative(userId: number, certId: number, score: number) {
    const cert = await this.prisma.certification.findFirst({
      where: { id: BigInt(certId), deletedAt: null }
    });

    if (!cert) {
      throw new NotFoundException("La certification demandée n'existe pas.");
    }

    const tentative = await this.prisma.tentative.create({
      data: {
        score,
        utilisateurId: BigInt(userId),
        certificationId: BigInt(certId)
      }
    });

    return {
      ...tentative,
      id: tentative.id.toString(),
      utilisateurId: tentative.utilisateurId.toString(),
      certificationId: tentative.certificationId.toString()
    };
  }

  async getUserStats(userId: number) {
    const tentatives = await this.prisma.tentative.findMany({
      where: { utilisateurId: BigInt(userId) },
      include: { certification: true },
      orderBy: { datePassage: 'desc' }
    });

    const total = tentatives.length;
    const avgScore = total > 0
      ? Math.round(tentatives.reduce((acc, curr) => acc + curr.score, 0) / total)
      : 0;

    return {
      totalAttempts: total,
      averageScore: avgScore,
      history: tentatives.map(t => ({
        id: t.id.toString(),
        score: t.score,
        datePassage: t.datePassage,
        certificationName: t.certification.nom,
        certificationSlug: t.certification.slug
      }))
    };
  }

  async removeQuestion(questionId: number) {
    await this.prisma.question.delete({
      where: { id: BigInt(questionId) }
    });
    return { message: 'Question supprimée avec succès.' };
  }
}