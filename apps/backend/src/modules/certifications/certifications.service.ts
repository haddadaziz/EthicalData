import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateRessourceDto } from './dto/create-ressource.dto';
import { AiService } from './ai.service';

@Injectable()
export class CertificationsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) { }

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
          select: { certifications: { where: { deletedAt: null } } },
        },
      },
      orderBy: { nom: 'asc' },
    });
    return fournisseurs.map((f) => ({
      ...f,
      id: f.id.toString(),
      certificationCount: f._count.certifications,
    }));
  }

  // Récupérer un fournisseur par ID
  async findOneFournisseur(id: number) {
    const fournisseur = await this.prisma.fournisseur.findFirst({
      where: { id: BigInt(id) },
      include: {
        _count: {
          select: { certifications: { where: { deletedAt: null } } },
        },
      },
    });
    if (!fournisseur) {
      throw new NotFoundException("Le fournisseur demandé n'existe pas.");
    }
    return {
      ...fournisseur,
      id: fournisseur.id.toString(),
      certificationCount: fournisseur._count.certifications,
    };
  }

  // Créer un fournisseur
  async createFournisseur(dto: CreateFournisseurDto) {
    const slug = this.slugify(dto.nom);
    const existing = await this.prisma.fournisseur.findFirst({
      where: { OR: [{ nom: dto.nom }, { slug }] },
    });
    if (existing) {
      throw new ConflictException('Un fournisseur avec ce nom existe déjà.');
    }
    const f = await this.prisma.fournisseur.create({
      data: {
        nom: dto.nom,
        slug,
        image: dto.image || null,
      },
    });
    return {
      ...f,
      id: f.id.toString(),
    };
  }

  // Modifier un fournisseur
  async updateFournisseur(id: number, dto: UpdateFournisseurDto) {
    const f = await this.prisma.fournisseur.findFirst({
      where: { id: BigInt(id) },
    });
    if (!f) {
      throw new NotFoundException("Le fournisseur demandé n'existe pas.");
    }
    const data: any = {
      nom: dto.nom,
      image: dto.image,
    };
    if (dto.nom) {
      data.slug = this.slugify(dto.nom);
      const existing = await this.prisma.fournisseur.findFirst({
        where: {
          nom: dto.nom,
          NOT: { id: BigInt(id) },
        },
      });
      if (existing) {
        throw new ConflictException('Un fournisseur avec ce nom existe déjà.');
      }
    }
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key],
    );
    const updated = await this.prisma.fournisseur.update({
      where: { id: BigInt(id) },
      data,
    });
    return {
      ...updated,
      id: updated.id.toString(),
    };
  }

  // Supprimer un fournisseur
  async removeFournisseur(id: number) {
    const f = await this.prisma.fournisseur.findFirst({
      where: { id: BigInt(id) },
      include: {
        certifications: { where: { deletedAt: null } },
      },
    });
    if (!f) {
      throw new NotFoundException("Le fournisseur demandé n'existe pas.");
    }
    if (f.certifications.length > 0) {
      throw new ConflictException(
        'Impossible de supprimer ce fournisseur car il possède des certifications actives rattachées.',
      );
    }
    await this.prisma.fournisseur.delete({
      where: { id: BigInt(id) },
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
        ressources: { where: { deletedAt: null } },
      },
      orderBy: { dateCreation: 'desc' },
    });

    return certs.map((c) => ({
      ...c,
      id: c.id.toString(),
      fournisseurId: c.fournisseurId.toString(),
      fournisseur: {
        ...c.fournisseur,
        id: c.fournisseur.id.toString(),
      },
      modules: c.modules.map((m) => ({
        ...m,
        id: m.id.toString(),
        certificationId: m.certificationId.toString(),
      })),
      ressources: c.ressources.map((r) => ({
        ...r,
        id: r.id.toString(),
        certificationId: r.certificationId?.toString(),
      })),
    }));
  }

  // Récupérer une certification par son ID
  async findOne(id: number) {
    const cert = await this.prisma.certification.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        fournisseur: true,
        modules: { orderBy: { ordre: 'asc' } },
        ressources: { where: { deletedAt: null } },
      },
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
        id: cert.fournisseur.id.toString(),
      },
      modules: cert.modules.map((m) => ({
        ...m,
        id: m.id.toString(),
        certificationId: m.certificationId.toString(),
      })),
      ressources: cert.ressources.map((r) => ({
        ...r,
        id: r.id.toString(),
        certificationId: r.certificationId?.toString(),
      })),
    };
  }

  // Créer une certification
  async create(dto: CreateCertificationDto) {
    const slug = `${this.slugify(dto.nom)}-${this.slugify(dto.codeExamen || '')}`;

    const existing = await this.prisma.certification.findFirst({
      where: {
        OR: [{ slug }, dto.codeExamen ? { codeExamen: dto.codeExamen } : {}],
      },
    });

    if (existing) {
      throw new ConflictException(
        "Une certification avec ce nom ou ce code d'examen existe déjà.",
      );
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
        fournisseurId: BigInt(dto.fournisseurId),
      },
      include: {
        fournisseur: true,
      },
    });

    return {
      ...cert,
      id: cert.id.toString(),
      fournisseurId: cert.fournisseurId.toString(),
      fournisseur: {
        ...cert.fournisseur,
        id: cert.fournisseur.id.toString(),
      },
    };
  }

  // Modifier une certification
  async update(id: number, dto: UpdateCertificationDto) {
    const cert = await this.prisma.certification.findFirst({
      where: { id: BigInt(id), deletedAt: null },
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
      fournisseurId: dto.fournisseurId ? BigInt(dto.fournisseurId) : undefined,
    };

    if (dto.nom) {
      data.slug = `${this.slugify(dto.nom)}-${this.slugify(dto.codeExamen || cert.codeExamen || '')}`;
    }

    // Nettoyer les propriétés undefined
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key],
    );

    const updated = await this.prisma.certification.update({
      where: { id: BigInt(id) },
      data,
      include: {
        fournisseur: true,
      },
    });

    return {
      ...updated,
      id: updated.id.toString(),
      fournisseurId: updated.fournisseurId.toString(),
      fournisseur: {
        ...updated.fournisseur,
        id: updated.fournisseur.id.toString(),
      },
    };
  }

  // Soft delete
  async remove(id: number) {
    const cert = await this.prisma.certification.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });

    if (!cert) {
      throw new NotFoundException("La certification demandée n'existe pas.");
    }

    await this.prisma.certification.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date() },
    });

    return { message: 'Certification supprimée avec succès.' };
  }
  async findQuestions(certId: number) {
    const questions = await this.prisma.question.findMany({
      where: { certificationId: BigInt(certId) },
      include: { options: true },
    });

    return questions.map((q) => ({
      ...q,
      id: q.id.toString(),
      certificationId: q.certificationId.toString(),
      options: q.options.map((opt) => ({
        ...opt,
        id: opt.id.toString(),
        questionId: opt.questionId.toString(),
      })),
    }));
  }

  async createQuestion(certId: number, dto: CreateQuestionDto) {
    const cert = await this.prisma.certification.findFirst({
      where: { id: BigInt(certId), deletedAt: null },
    });

    if (!cert) {
      throw new NotFoundException("La certification demandée n'existe pas.");
    }

    const optionsData =
      dto.options && dto.options.length > 0
        ? {
          create: dto.options.map((opt: any) => ({
            lettre: opt.lettre,
            texte: opt.texte,
          })),
        }
        : undefined;

    const question = await this.prisma.question.create({
      data: {
        enonce: dto.enonce,
        explication: dto.explication || null,
        reponseCorrecte: dto.reponseCorrecte,
        grilleNotation: dto.grilleNotation || null,
        categorie: dto.categorie || null,
        type: dto.type || 'QCM',
        certificationId: BigInt(certId),
        options: optionsData,
      },
      include: { options: true },
    });
    return {
      ...question,
      id: question.id.toString(),
      certificationId: question.certificationId.toString(),
      options: question.options.map((opt) => ({
        ...opt,
        id: opt.id.toString(),
        questionId: opt.questionId.toString(),
      })),
    };
  }

  async createTentative(userId: number, certId: number, score: number) {
    const cert = await this.prisma.certification.findFirst({
      where: { id: BigInt(certId), deletedAt: null },
    });

    if (!cert) {
      throw new NotFoundException("La certification demandée n'existe pas.");
    }

    const tentative = await this.prisma.tentative.create({
      data: {
        score,
        utilisateurId: BigInt(userId),
        certificationId: BigInt(certId),
      },
    });

    return {
      ...tentative,
      id: tentative.id.toString(),
      utilisateurId: tentative.utilisateurId.toString(),
      certificationId: tentative.certificationId.toString(),
    };
  }

  async getUserStats(userId: number) {
    const tentatives = await this.prisma.tentative.findMany({
      where: { utilisateurId: BigInt(userId) },
      include: { certification: true },
      orderBy: { datePassage: 'desc' },
    });

    const total = tentatives.length;
    const avgScore =
      total > 0
        ? Math.round(
          tentatives.reduce((acc, curr) => acc + curr.score, 0) / total,
        )
        : 0;

    return {
      totalAttempts: total,
      averageScore: avgScore,
      history: tentatives.map((t) => ({
        id: t.id.toString(),
        score: t.score,
        datePassage: t.datePassage,
        certificationName: t.certification.nom,
        certificationSlug: t.certification.slug,
      })),
    };
  }

  async removeQuestion(questionId: number) {
    await this.prisma.question.delete({
      where: { id: BigInt(questionId) },
    });
    return { message: 'Question supprimée avec succès.' };
  }

  async updateQuestion(questionId: number, dto: CreateQuestionDto) {
    const existing = await this.prisma.question.findUnique({
      where: { id: BigInt(questionId) },
    });
    if (!existing) {
      throw new NotFoundException("La question demandée n'existe pas.");
    }

    // Delete existing options associated with this question
    await this.prisma.option.deleteMany({
      where: { questionId: BigInt(questionId) },
    });

    const optionsData =
      dto.options && dto.options.length > 0
        ? {
          create: dto.options.map((opt: any) => ({
            lettre: opt.lettre,
            texte: opt.texte,
          })),
        }
        : undefined;

    const updated = await this.prisma.question.update({
      where: { id: BigInt(questionId) },
      data: {
        enonce: dto.enonce,
        explication: dto.explication || null,
        reponseCorrecte: dto.reponseCorrecte,
        grilleNotation: dto.grilleNotation || null,
        categorie: dto.categorie || null,
        type: dto.type || 'QCM',
        options: optionsData,
      },
      include: { options: true },
    });

    return {
      ...updated,
      id: updated.id.toString(),
      certificationId: updated.certificationId.toString(),
      options: updated.options.map((opt) => ({
        ...opt,
        id: opt.id.toString(),
        questionId: opt.questionId.toString(),
      })),
    };
  }

  async evaluateQuestionWithAi(questionId: number, reponseCandidat: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: BigInt(questionId) },
    });
    if (!question) {
      throw new NotFoundException("La question demandée n'existe pas.");
    }
    return this.aiService.evaluerReponseOuverte(
      question.enonce,
      question.reponseCorrecte,
      question.grilleNotation,
      reponseCandidat,
    );
  }

  // ==========================================
  // GESTION DES RESSOURCES (GUIDES, SLIDES...)
  // ==========================================

  async createRessource(dto: CreateRessourceDto) {
    const ressource = await this.prisma.ressource.create({
      data: {
        titre: dto.titre,
        description: dto.description,
        type: dto.type,
        url: dto.url,
        taille: dto.taille || null,
        version: dto.version || '1.0.0',
        quotaTelechargement: dto.quotaTelechargement !== undefined ? dto.quotaTelechargement : 10,
        public: dto.public !== undefined ? dto.public : false,
        certificationId: dto.certificationId ? BigInt(dto.certificationId) : null,
      },
    });
    return {
      ...ressource,
      id: ressource.id.toString(),
      certificationId: ressource.certificationId?.toString(),
    };
  }

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
        type: dto.type,
        url: dto.url,
        taille: dto.taille,
        version: dto.version,
        quotaTelechargement: dto.quotaTelechargement,
        public: dto.public,
        certificationId: dto.certificationId ? BigInt(dto.certificationId) : null,
      },
    });
    return {
      ...updated,
      id: updated.id.toString(),
      certificationId: updated.certificationId?.toString(),
    };
  }

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

  async findAllRessources() {
    const resources = await this.prisma.ressource.findMany({
      where: { deletedAt: null },
      include: { certification: true },
      orderBy: { dateCreation: 'desc' },
    });
    return resources.map((r) => ({
      ...r,
      id: r.id.toString(),
      certificationId: r.certificationId?.toString(),
      certification: r.certification ? {
        id: r.certification.id.toString(),
        nom: r.certification.nom,
        slug: r.certification.slug,
        codeExamen: r.certification.codeExamen,
      } : null,
    }));
  }
  // Enregistrer et autoriser le téléchargement d'un document (avec contrôle de quota)
  async downloadRessource(userId: number, resourceId: number, ipAddress: string) {
    const resource = await this.prisma.ressource.findFirst({
      where: { id: BigInt(resourceId), deletedAt: null },
    });

    if (!resource) {
      throw new NotFoundException("La ressource demandée n'existe pas.");
    }

    // Si la ressource n'est pas publique, on applique la vérification du quota
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
          `Vous avez atteint votre quota maximum de ${quota} téléchargements pour cette ressource.`
        );
      }
    }

    // Enregistrer le téléchargement dans l'historique
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

  // Récupérer le statut des quotas d'un utilisateur
  async getUserResourceQuotas(userId: number) {
    const resources = await this.prisma.ressource.findMany({
      where: { deletedAt: null, public: false },
    });

    const downloads = await this.prisma.telechargement.findMany({
      where: { utilisateurId: BigInt(userId) },
    });

    return resources.map(r => {
      const userDownloads = downloads.filter(d => d.ressourceId === r.id).length;
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
