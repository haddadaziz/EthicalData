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
import { TypeRessource } from '@prisma/client';
import { CreateCategorieDto } from './dto/create-categorie.dto';
import { UpdateCategorieDto } from './dto/update-categorie.dto';
import { CreateModuleCertificationDto } from './dto/create-module-certification.dto';
import { UpdateModuleCertificationDto } from './dto/update-module-certification.dto';

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
    return f;
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
    return updated;
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
  async findAll(categorieSlug?: string) {
    const where: any = { deletedAt: null };
    if (categorieSlug) {
      where.categorie = { slug: categorieSlug };
    }
    const certs = await this.prisma.certification.findMany({
      where,
      include: {
        fournisseur: true,
        categorie: true,
        modules: {
          where: { parentId: null },
          include: { sousModules: { orderBy: { ordre: 'asc' } } },
          orderBy: { ordre: 'asc' },
        },
        ressources: { where: { deletedAt: null } },
        simulations: true,
      },
      orderBy: { dateCreation: 'desc' },
    });

    return certs;
  }

  // Récupérer une certification par son ID
  async findOne(id: number) {
    const cert = await this.prisma.certification.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        fournisseur: true,
        categorie: true,
        modules: {
          where: { parentId: null },
          include: { sousModules: { orderBy: { ordre: 'asc' } } },
          orderBy: { ordre: 'asc' },
        },
        ressources: { where: { deletedAt: null } },
        cours: {
          where: { statut: 'PUBLIE', deletedAt: null },
          include: { modules: { orderBy: { ordre: 'asc' } } },
        },
      },
    });

    if (!cert) {
      throw new NotFoundException("La certification demandée n'existe pas.");
    }

    return cert;
  }

  // Récupérer une certification par son slug
  async findBySlug(slug: string) {
    const cert = await this.prisma.certification.findFirst({
      where: { slug, deletedAt: null },
      include: {
        fournisseur: true,
        categorie: true,
        modules: {
          where: { parentId: null },
          include: { sousModules: { orderBy: { ordre: 'asc' } } },
          orderBy: { ordre: 'asc' },
        },
        ressources: { where: { deletedAt: null } },
        cours: {
          where: { statut: 'PUBLIE', deletedAt: null },
          include: { modules: { orderBy: { ordre: 'asc' } } },
        },
      },
    });

    if (!cert) {
      throw new NotFoundException("La certification demandée n'existe pas.");
    }

    return cert;
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
        categorieId: dto.categorieId ? BigInt(dto.categorieId) : undefined,
        objectifs: dto.objectifs || [],
        prerequis: dto.prerequis || [],
      },
      include: {
        fournisseur: true,
        categorie: true,
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
      categorieId: dto.categorieId !== undefined ? BigInt(dto.categorieId) : undefined,
      objectifs: dto.objectifs,
      prerequis: dto.prerequis,
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

    return updated;
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

    return questions;
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
    return question;
  }

  async createTentative(userId: number, certId: number, score: number) {
    const cert = await this.prisma.certification.findFirst({
      where: { id: BigInt(certId), deletedAt: null },
    });

    if (!cert) {
      throw new NotFoundException("La certification demandée n'existe pas.");
    }

    // Tentative passe maintenant par une Simulation liée à la certification
    const simulation = await this.prisma.simulation.findFirst({
      where: { certificationId: BigInt(certId) },
    });

    if (!simulation) {
      throw new NotFoundException('Aucune simulation disponible pour cette certification.');
    }

    const tentative = await this.prisma.tentative.create({
      data: {
        score,
        utilisateurId: BigInt(userId),
        simulationId: simulation.id,
      },
    });

    return tentative;
  }

  async getUserStats(userId: number) {
    const tentatives = await this.prisma.tentative.findMany({
      where: { utilisateurId: BigInt(userId) },
      include: { simulation: { include: { certification: true } } },
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
        ...t,
        certificationName: t.simulation?.certification?.nom || '',
        certificationSlug: t.simulation?.certification?.slug || '',
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

    return updated;
  }

  async evaluateQuestionWithAi(questionId: number, reponseCandidat: string) {
    const qId = Number(questionId);
    if (!qId || isNaN(qId)) {
      return {
        score: 0,
        critique: "ID de question invalide.",
        suggestions: "Veuillez vérifier la question sélectionnée.",
      };
    }
    const question = await this.prisma.question.findUnique({
      where: { id: BigInt(qId) },
    });
    if (!question) {
      return {
        score: 0,
        critique: "La question demandée n'existe pas.",
        suggestions: "Veuillez recharger la banque de questions.",
      };
    }
    return this.aiService.evaluerReponseOuverte(
      question.enonce,
      question.reponseCorrecte,
      question.grilleNotation,
      reponseCandidat || '',
    );
  }

  // ==========================================
  // GESTION DES CATEGORIES DE CERTIFICATION
  // ==========================================

  async findAllCategories() {
    return this.prisma.categorieCertification.findMany({
      include: {
        _count: { select: { certifications: { where: { deletedAt: null } } } },
      },
      orderBy: { ordre: 'asc' },
    });
  }

  async findOneCategory(id: number) {
    const cat = await this.prisma.categorieCertification.findFirst({
      where: { id: BigInt(id) },
      include: {
        certifications: { where: { deletedAt: null }, include: { fournisseur: true } },
      },
    });
    if (!cat) throw new NotFoundException("Catégorie introuvable.");
    return cat;
  }

  async createCategory(dto: CreateCategorieDto) {
    const slug = this.slugify(dto.nom);
    const existing = await this.prisma.categorieCertification.findUnique({ where: { slug } });
    if (existing) throw new ConflictException("Cette catégorie existe déjà.");
    return this.prisma.categorieCertification.create({
      data: { nom: dto.nom, slug, description: dto.description, image: dto.image, ordre: dto.ordre || 0 },
    });
  }

  async updateCategory(id: number, dto: UpdateCategorieDto) {
    const cat = await this.prisma.categorieCertification.findFirst({ where: { id: BigInt(id) } });
    if (!cat) throw new NotFoundException("Catégorie introuvable.");
    const data: any = { ...dto };
    if (dto.nom) data.slug = this.slugify(dto.nom);
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
    return this.prisma.categorieCertification.update({ where: { id: BigInt(id) }, data });
  }

  async removeCategory(id: number) {
    const cat = await this.prisma.categorieCertification.findFirst({
      where: { id: BigInt(id) },
      include: { certifications: { where: { deletedAt: null } } },
    });
    if (!cat) throw new NotFoundException("Catégorie introuvable.");
    if (cat.certifications.length > 0) {
      throw new ConflictException("Impossible de supprimer : des certifications sont rattachées à cette catégorie.");
    }
    await this.prisma.categorieCertification.delete({ where: { id: BigInt(id) } });
    return { message: "Catégorie supprimée avec succès." };
  }

  // ==========================================
  // GESTION DES MODULES DE CERTIFICATION
  // ==========================================

  async findModules(certId: number) {
    return this.prisma.moduleCertification.findMany({
      where: { certificationId: BigInt(certId), parentId: null },
      include: { sousModules: { orderBy: { ordre: 'asc' } } },
      orderBy: { ordre: 'asc' },
    });
  }

  async createModule(certId: number, dto: CreateModuleCertificationDto) {
    const cert = await this.prisma.certification.findFirst({ where: { id: BigInt(certId), deletedAt: null } });
    if (!cert) throw new NotFoundException("La certification demandée n'existe pas.");
    return this.prisma.moduleCertification.create({
      data: {
        titre: dto.titre,
        description: dto.description,
        ordre: dto.ordre || 0,
        icon: dto.icon,
        certificationId: BigInt(certId),
        parentId: dto.parentId ? BigInt(dto.parentId) : null,
      },
    });
  }

  async updateModule(moduleId: number, dto: UpdateModuleCertificationDto) {
    const mod = await this.prisma.moduleCertification.findFirst({ where: { id: BigInt(moduleId) } });
    if (!mod) throw new NotFoundException("Module introuvable.");
    const data: any = { ...dto };
    if (dto.parentId === null) data.parentId = null;
    else if (dto.parentId) data.parentId = BigInt(dto.parentId);
    Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
    return this.prisma.moduleCertification.update({ where: { id: BigInt(moduleId) }, data });
  }

  async removeModule(moduleId: number) {
    const mod = await this.prisma.moduleCertification.findFirst({ where: { id: BigInt(moduleId) } });
    if (!mod) throw new NotFoundException("Module introuvable.");
    await this.prisma.moduleCertification.delete({ where: { id: BigInt(moduleId) } });
    return { message: "Module supprimé avec succès." };
  }

  // ==========================================
  // GESTION DES RESSOURCES (GUIDES, SLIDES...)
  // ==========================================

  async createRessource(dto: CreateRessourceDto) {
    const ressource = await this.prisma.ressource.create({
      data: {
        titre: dto.titre,
        description: dto.description,
        type: dto.type as TypeRessource,
        url: dto.url,
        taille: dto.taille || null,
        version: dto.version || '1.0.0',
        quotaTelechargement: dto.quotaTelechargement !== undefined ? dto.quotaTelechargement : 10,
        public: dto.public !== undefined ? dto.public : false,
        certificationId: dto.certificationId ? BigInt(dto.certificationId) : null,
        coursId: dto.coursId ? BigInt(dto.coursId) : null,
      },
    });
    return {
      ...ressource,
      id: ressource.id.toString(),
      certificationId: ressource.certificationId?.toString(),
      coursId: ressource.coursId?.toString(),
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
        type: dto.type as TypeRessource,
        url: dto.url,
        taille: dto.taille,
        version: dto.version,
        quotaTelechargement: dto.quotaTelechargement,
        public: dto.public,
        certificationId: dto.certificationId ? BigInt(dto.certificationId) : null,
        coursId: dto.coursId !== undefined ? (dto.coursId ? BigInt(dto.coursId) : null) : undefined,
      },
    });
    return updated;
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
      include: { 
        certification: true,
        cours: { select: { id: true, titre: true } }
      },
      orderBy: { dateCreation: 'desc' },
    });
    return resources;
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
        resourceId: r.id,
        downloadsCount: userDownloads,
        quotaMax,
        remaining: Math.max(0, quotaMax - userDownloads),
      };
    });
  }
}
