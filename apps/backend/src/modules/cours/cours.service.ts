import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCoursDto } from './dto/create-cours.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateModuleRessourceDto } from './dto/create-module-ressource.dto';

@Injectable()
export class CoursService {
  constructor(private prisma: PrismaService) {}

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

  private serializeCours(c: any) {
    return {
      ...c,
      id: c.id.toString(),
      formateurId: c.formateurId.toString(),
      certificationId: c.certificationId ? c.certificationId.toString() : null,
      formateur: c.formateur
        ? { ...c.formateur, id: c.formateur.id.toString() }
        : undefined,
      certification: c.certification
        ? {
            ...c.certification,
            id: c.certification.id.toString(),
            fournisseurId: c.certification.fournisseurId
              ? c.certification.fournisseurId.toString()
              : null,
            fournisseur: c.certification.fournisseur
              ? {
                  ...c.certification.fournisseur,
                  id: c.certification.fournisseur.id.toString(),
                }
              : undefined,
          }
        : null,
      modules: (c.modules || []).map((m: any) => ({
        ...m,
        id: m.id.toString(),
        coursId: m.coursId.toString(),
        ressources: (m.ressources || []).map((r: any) => ({
          ...r,
          id: r.id.toString(),
          moduleId: r.moduleId?.toString(),
          coursId: r.coursId?.toString(),
          certificationId: r.certificationId?.toString(),
        })),
      })),
    };
  }


  private validatePublishable(data: {
    titre?: string;
    description?: string | null;
    certificationId?: number | bigint | null;
    objectifs?: string[];
    prerequis?: string[];
    publicCible?: string[];
    dureeEstimee?: number | null;
    modules?: { id: any }[];
  }): string[] {
    const errors: string[] = [];

    if (!data.titre?.trim()) {
      errors.push('Le titre du cours est obligatoire.');
    }
    if (!data.description?.trim()) {
      errors.push('La description du cours est obligatoire.');
    }
    if (!data.certificationId) {
      errors.push('Une certification doit être associée au cours.');
    }
    if (!data.objectifs || (data.objectifs as string[]).filter((o) => o.trim()).length === 0) {
      errors.push('Au moins un objectif d’apprentissage est requis.');
    }
    if (!data.prerequis || (data.prerequis as string[]).filter((p) => p.trim()).length === 0) {
      errors.push('Au moins un prérequis est requis.');
    }
    if (!data.publicCible || (data.publicCible as string[]).filter((p) => p.trim()).length === 0) {
      errors.push('Au moins un public cible est requis.');
    }
    if (!data.dureeEstimee || data.dureeEstimee <= 0) {
      errors.push('La durée estimée du cours est obligatoire.');
    }
    if (data.modules !== undefined && (!data.modules || data.modules.length === 0)) {
      errors.push('Le cours doit contenir au moins un module.');
    }

    return errors;
  }

  // ─────────────────────────────────────────
  // COURS
  // ─────────────────────────────────────────

  async findAllByFormateur(formateurId: number) {
    const cours = await this.prisma.cours.findMany({
      where: { formateurId: BigInt(formateurId), deletedAt: null },
      include: {
        certification: { include: { fournisseur: true } },
        formateur: { select: { id: true, prenom: true, nom: true, avatar: true } },
        modules: {
          orderBy: { ordre: 'asc' },
          include: { ressources: true },
        },
        _count: { select: { modules: true } },
      },
      orderBy: { dateCreation: 'desc' },
    });
    return cours.map(this.serializeCours.bind(this));
  }

  async findAllForAdmin() {
    const cours = await this.prisma.cours.findMany({
      where: { deletedAt: null },
      include: {
        certification: { include: { fournisseur: true } },
        formateur: { select: { id: true, prenom: true, nom: true, avatar: true } },
        modules: {
          orderBy: { ordre: 'asc' },
          include: { ressources: true },
        },
        _count: { select: { modules: true, inscriptions: true } },
      },
      orderBy: { dateCreation: 'desc' },
    });
    return cours.map(this.serializeCours.bind(this));
  }

  async findBrouillons(formateurId: number) {
    const cours = await this.prisma.cours.findMany({
      where: {
        formateurId: BigInt(formateurId),
        statut: 'BROUILLON',
        deletedAt: null,
      },
      include: {
        certification: { include: { fournisseur: true } },
        modules: { orderBy: { ordre: 'asc' } },
        _count: { select: { modules: true } },
      },
      orderBy: { dateCreation: 'desc' },
    });
    return cours.map(this.serializeCours.bind(this));
  }

  async findOne(id: number) {
    const cours = await this.prisma.cours.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        certification: { include: { fournisseur: true } },
        formateur: { select: { id: true, prenom: true, nom: true, avatar: true } },
        modules: {
          orderBy: { ordre: 'asc' },
          include: { ressources: { orderBy: { ordre: 'asc' } } },
        },
        _count: { select: { modules: true, inscriptions: true } },
      },
    });
    if (!cours) throw new NotFoundException('Cours introuvable.');
    return this.serializeCours(cours);
  }

  async create(formateurId: number, dto: CreateCoursDto) {
    const statut = dto.statut || 'BROUILLON';

    if (statut === 'PUBLIE') {
      const errors = this.validatePublishable({
        titre: dto.titre,
        description: dto.description,
        certificationId: dto.certificationId,
        objectifs: dto.objectifs,
        prerequis: dto.prerequis,
        publicCible: dto.publicCible,
        dureeEstimee: dto.dureeEstimee,
      });
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }
    }

    if (!dto.titre?.trim()) {
      throw new BadRequestException(['Le titre du cours est obligatoire.']);
    }

    const slug = `${this.slugify(dto.titre)}-${Date.now()}`;
    const cours = await this.prisma.cours.create({
      data: {
        titre: dto.titre,
        slug,
        description: dto.description || null,
        imageUrl: dto.imageUrl || null,
        videoUrl: dto.videoUrl || null,
        objectifs: dto.objectifs || [],
        prerequis: dto.prerequis || [],
        publicCible: dto.publicCible || [],
        dureeEstimee: dto.dureeEstimee || null,
        statut,
        formateurId: BigInt(formateurId),
        certificationId: dto.certificationId ? BigInt(dto.certificationId) : undefined,
      },
      include: {
        certification: { include: { fournisseur: true } },
        modules: true,
      },
    });
    return this.serializeCours(cours);
  }

  async update(formateurId: number, coursId: number, dto: Partial<CreateCoursDto>, userRoles?: string[]) {
    const cours = await this.prisma.cours.findFirst({
      where: { id: BigInt(coursId), deletedAt: null },
      include: { modules: true },
    });
    if (!cours) throw new NotFoundException('Cours introuvable.');

    const isAdmin = userRoles && (userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN'));
    if (cours.formateurId.toString() !== formateurId.toString() && !isAdmin) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres cours.');
    }

    const newStatut = dto.statut ?? cours.statut;
    if (newStatut === 'PUBLIE') {
      const errors = this.validatePublishable({
        titre: dto.titre ?? cours.titre,
        description: dto.description ?? cours.description,
        certificationId: dto.certificationId ?? cours.certificationId,
        objectifs: dto.objectifs ?? (cours.objectifs as string[]),
        prerequis: dto.prerequis ?? (cours.prerequis as string[]),
        publicCible: dto.publicCible ?? (cours.publicCible as string[]),
        dureeEstimee: dto.dureeEstimee ?? cours.dureeEstimee,
        modules: cours.modules,
      });
      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }
    }

    const data: any = {};
    if (dto.titre !== undefined) {
      data.titre = dto.titre;
      data.slug = `${this.slugify(dto.titre)}-${Date.now()}`;
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.videoUrl !== undefined) data.videoUrl = dto.videoUrl;
    if (dto.objectifs !== undefined) data.objectifs = dto.objectifs;
    if (dto.prerequis !== undefined) data.prerequis = dto.prerequis;
    if (dto.publicCible !== undefined) data.publicCible = dto.publicCible;
    if (dto.dureeEstimee !== undefined) data.dureeEstimee = dto.dureeEstimee;
    if (dto.certificationId !== undefined) data.certificationId = BigInt(dto.certificationId);
    if (dto.statut !== undefined) {
      data.statut = dto.statut;
      if (dto.statut === 'PUBLIE') data.datePublication = new Date();
    }

    const updated = await this.prisma.cours.update({
      where: { id: BigInt(coursId) },
      data,
      include: {
        certification: { include: { fournisseur: true } },
        modules: { orderBy: { ordre: 'asc' }, include: { ressources: true } },
      },
    });
    return this.serializeCours(updated);
  }

  async publish(formateurId: number, coursId: number, userRoles?: string[]) {
    const cours = await this.prisma.cours.findFirst({
      where: { id: BigInt(coursId), deletedAt: null },
      include: { modules: true },
    });

    if (!cours) throw new NotFoundException('Cours introuvable.');

    const isAdmin = userRoles && (userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN'));
    if (cours.formateurId.toString() !== formateurId.toString() && !isAdmin) {
      throw new ForbiddenException('Vous ne pouvez publier que vos propres cours.');
    }

    const errors = this.validatePublishable({
      titre: cours.titre,
      description: cours.description,
      certificationId: cours.certificationId,
      objectifs: cours.objectifs as string[],
      prerequis: cours.prerequis as string[],
      publicCible: cours.publicCible as string[],
      dureeEstimee: cours.dureeEstimee,
      modules: cours.modules,
    });

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.update(formateurId, coursId, { statut: 'PUBLIE' } as any, userRoles);
  }

  async remove(formateurId: number, coursId: number, userRoles?: string[]) {
    const cours = await this.prisma.cours.findFirst({
      where: { id: BigInt(coursId), deletedAt: null },
    });
    if (!cours) throw new NotFoundException('Cours introuvable.');

    const isAdmin = userRoles && (userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN'));
    if (cours.formateurId.toString() !== formateurId.toString() && !isAdmin) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres cours.');
    }
    await this.prisma.cours.update({
      where: { id: BigInt(coursId) },
      data: { deletedAt: new Date() },
    });
    return { message: 'Cours supprimé avec succès.' };
  }

  // ─────────────────────────────────────────
  // INSCRIPTIONS APPRENANTS
  // ─────────────────────────────────────────



  async findDisponibles(userId: number) {
    const cours = await this.prisma.cours.findMany({
      where: {
        statut: 'PUBLIE',
        deletedAt: null,
        formateurId: { not: BigInt(userId) },
      },
      include: {
        certification: { include: { fournisseur: true } },
        formateur: { select: { id: true, prenom: true, nom: true, avatar: true } },
        modules: { orderBy: { ordre: 'asc' } },
        _count: { select: { modules: true, inscriptions: true } },
      },
      orderBy: { datePublication: 'desc' },
    });
    return cours.map(this.serializeCours.bind(this));
  }

  async inscrire(userId: number, coursId: number) {
    const cours = await this.prisma.cours.findFirst({
      where: { id: BigInt(coursId), statut: 'PUBLIE', deletedAt: null },
    });
    if (!cours) throw new NotFoundException('Cours introuvable ou non publié.');

    const existing = await this.prisma.inscriptionCours.findUnique({
      where: { coursId_apprenantId: { coursId: BigInt(coursId), apprenantId: BigInt(userId) } },
    });
    if (existing) throw new BadRequestException('Vous êtes déjà inscrit à ce cours.');

    const inscription = await this.prisma.inscriptionCours.create({
      data: {
        coursId: BigInt(coursId),
        apprenantId: BigInt(userId),
      },
      include: {
        cours: {
          include: {
            certification: { include: { fournisseur: true } },
            formateur: { select: { id: true, prenom: true, nom: true, avatar: true } },
            modules: { orderBy: { ordre: 'asc' } },
          },
        },
        progressions: true,
      },
    });
    return this.serializeInscription(inscription);
  }

  async findMyInscriptions(userId: number) {
    const inscriptions = await this.prisma.inscriptionCours.findMany({
      where: { apprenantId: BigInt(userId) },
      include: {
        cours: {
          include: {
            certification: { include: { fournisseur: true } },
            formateur: { select: { id: true, prenom: true, nom: true, avatar: true } },
            modules: { orderBy: { ordre: 'asc' }, include: { ressources: { orderBy: { ordre: 'asc' } } } },
            _count: { select: { modules: true } },
          },
        },
        progressions: true,
      },
      orderBy: { dateInscription: 'desc' },
    });
    return inscriptions.map(this.serializeInscription.bind(this));
  }

  private serializeInscription(insc: any) {
    return {
      ...insc,
      id: insc.id.toString(),
      coursId: insc.coursId.toString(),
      apprenantId: insc.apprenantId.toString(),
      progressions: (insc.progressions || []).map((p: any) => ({
        ...p,
        id: p.id.toString(),
        inscriptionCoursId: p.inscriptionCoursId.toString(),
        moduleId: p.moduleId.toString(),
      })),
      cours: insc.cours ? {
        ...insc.cours,
        id: insc.cours.id.toString(),
        formateurId: insc.cours.formateurId.toString(),
        certificationId: insc.cours.certificationId ? insc.cours.certificationId.toString() : null,
        formateur: insc.cours.formateur
          ? { ...insc.cours.formateur, id: insc.cours.formateur.id.toString() }
          : undefined,
        certification: insc.cours.certification
          ? {
              ...insc.cours.certification,
              id: insc.cours.certification.id.toString(),
              fournisseurId: insc.cours.certification.fournisseurId?.toString(),
              fournisseur: insc.cours.certification.fournisseur
                ? { ...insc.cours.certification.fournisseur, id: insc.cours.certification.fournisseur.id.toString() }
                : undefined,
            }
          : null,
        modules: (insc.cours.modules || []).map((m: any) => ({
          ...m,
          id: m.id.toString(),
          coursId: m.coursId.toString(),
          ressources: (m.ressources || []).map((r: any) => ({
            ...r,
            id: r.id.toString(),
            moduleId: r.moduleId?.toString() || null,
          })),
        })),
      } : null,
    };
  }

  // ─────────────────────────────────────────
  // MODULES
  // ─────────────────────────────────────────

  async addModule(formateurId: number, coursId: number, dto: CreateModuleDto) {
    const cours = await this.prisma.cours.findFirst({
      where: { id: BigInt(coursId), deletedAt: null },
    });
    if (!cours) throw new NotFoundException('Cours introuvable.');
    if (cours.formateurId.toString() !== formateurId.toString()) {
      throw new ForbiddenException('Accès refusé.');
    }

    const lastModule = await this.prisma.module.findFirst({
      where: { coursId: BigInt(coursId) },
      orderBy: { ordre: 'desc' },
    });
    const ordre = dto.ordre ?? (lastModule ? lastModule.ordre + 1 : 0);

    const module = await this.prisma.module.create({
      data: {
        titre: dto.titre,
        description: dto.description || null,
        contenu: dto.contenu || null,
        ordre,
        dureeEstimee: dto.dureeEstimee || 30,
        imageUrl: dto.imageUrl || null,
        videoUrl: dto.videoUrl || null,
        coursId: BigInt(coursId),
      },
      include: { ressources: true },
    });

    return {
      ...module,
      id: module.id.toString(),
      coursId: module.coursId.toString(),
      ressources: [],
    };
  }

  async updateModule(formateurId: number, moduleId: number, dto: Partial<CreateModuleDto>) {
    const module = await this.prisma.module.findFirst({
      where: { id: BigInt(moduleId) },
      include: { cours: true },
    });
    if (!module) throw new NotFoundException('Module introuvable.');
    if (module.cours.formateurId.toString() !== formateurId.toString()) {
      throw new ForbiddenException('Accès refusé.');
    }

    const updated = await this.prisma.module.update({
      where: { id: BigInt(moduleId) },
      data: {
        titre: dto.titre,
        description: dto.description,
        contenu: dto.contenu,
        ordre: dto.ordre,
        dureeEstimee: dto.dureeEstimee,
        imageUrl: dto.imageUrl,
        videoUrl: dto.videoUrl,
      },
      include: { ressources: true },
    });
    return {
      ...updated,
      id: updated.id.toString(),
      coursId: updated.coursId.toString(),
    };
  }

  // ─────────────────────────────────────────
  // PROGRESSION DES MODULES (APPRENANTS)
  // ─────────────────────────────────────────

  async getProgressionModules(userId: number, coursId: number) {
    const inscription = await this.prisma.inscriptionCours.findUnique({
      where: { coursId_apprenantId: { coursId: BigInt(coursId), apprenantId: BigInt(userId) } },
      include: { progressions: true },
    });
    if (!inscription) throw new NotFoundException('Inscription introuvable.');

    const modules = await this.prisma.module.findMany({
      where: { coursId: BigInt(coursId) },
      orderBy: { ordre: 'asc' },
    });

    return modules.map((m) => {
      const prog = inscription.progressions.find((p) => p.moduleId.toString() === m.id.toString());
      return {
        moduleId: m.id.toString(),
        titre: m.titre,
        completed: prog?.completed ?? false,
        dateCompletion: prog?.dateCompletion ?? null,
      };
    });
  }

  async completeModule(userId: number, coursId: number, moduleId: number) {
    const inscription = await this.prisma.inscriptionCours.findUnique({
      where: { coursId_apprenantId: { coursId: BigInt(coursId), apprenantId: BigInt(userId) } },
    });
    if (!inscription) throw new NotFoundException('Inscription introuvable.');

    const module = await this.prisma.module.findFirst({
      where: { id: BigInt(moduleId), coursId: BigInt(coursId) },
    });
    if (!module) throw new NotFoundException('Module introuvable dans ce cours.');

    const existing = await this.prisma.progressionModule.findUnique({
      where: { inscriptionCoursId_moduleId: { inscriptionCoursId: inscription.id, moduleId: BigInt(moduleId) } },
    });

    if (existing?.completed) {
      return { message: 'Module déjà complété.' };
    }

    await this.prisma.progressionModule.upsert({
      where: { inscriptionCoursId_moduleId: { inscriptionCoursId: inscription.id, moduleId: BigInt(moduleId) } },
      update: { completed: true, dateCompletion: new Date() },
      create: { inscriptionCoursId: inscription.id, moduleId: BigInt(moduleId), completed: true, dateCompletion: new Date() },
    });

    // Recalculer la progression globale
    const totalModules = await this.prisma.module.count({ where: { coursId: BigInt(coursId) } });
    const completedCount = await this.prisma.progressionModule.count({
      where: { inscriptionCoursId: inscription.id, completed: true },
    });
    const progression = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    await this.prisma.inscriptionCours.update({
      where: { id: inscription.id },
      data: { progression },
    });

    return {
      message: 'Module complété avec succès.',
      progression,
      completedCount,
      totalModules,
    };
  }

  async desinscrire(userId: number, coursId: number) {
    const inscription = await this.prisma.inscriptionCours.findUnique({
      where: { coursId_apprenantId: { coursId: BigInt(coursId), apprenantId: BigInt(userId) } },
    });
    if (!inscription) throw new NotFoundException('Inscription introuvable.');

    // Supprimer les progressions liées
    await this.prisma.progressionModule.deleteMany({
      where: { inscriptionCoursId: inscription.id },
    });

    await this.prisma.inscriptionCours.delete({
      where: { id: inscription.id },
    });

    return { message: 'Désinscription réussie.' };
  }

  async removeModule(formateurId: number, moduleId: number) {
    const module = await this.prisma.module.findFirst({
      where: { id: BigInt(moduleId) },
      include: { cours: true },
    });
    if (!module) throw new NotFoundException('Module introuvable.');
    if (module.cours.formateurId.toString() !== formateurId.toString()) {
      throw new ForbiddenException('Accès refusé.');
    }
    await this.prisma.module.delete({ where: { id: BigInt(moduleId) } });
    return { message: 'Module supprimé avec succès.' };
  }

  // ─────────────────────────────────────────
  // RESSOURCES DE MODULE
  // ─────────────────────────────────────────

  async addRessource(formateurId: number, moduleId: number, dto: CreateModuleRessourceDto) {
    const module = await this.prisma.module.findFirst({
      where: { id: BigInt(moduleId) },
      include: { cours: true },
    });
    if (!module) throw new NotFoundException('Module introuvable.');
    if (module.cours.formateurId.toString() !== formateurId.toString()) {
      throw new ForbiddenException('Accès refusé.');
    }

    const ressource = await this.prisma.ressource.create({
      data: {
        titre: dto.titre,
        description: dto.description || null,
        type: dto.type,
        url: dto.url,
        taille: dto.taille || null,
        public: dto.public ?? false,
        ordre: dto.ordre ?? 0,
        moduleId: BigInt(moduleId),
        coursId: module.coursId,
        certificationId: module.cours.certificationId,
      },
    });
    return { 
      ...ressource, 
      id: ressource.id.toString(), 
      moduleId: ressource.moduleId?.toString(),
      coursId: ressource.coursId?.toString(),
      certificationId: ressource.certificationId?.toString() 
    };
  }

  async removeRessource(formateurId: number, ressourceId: number) {
    const ressource = await this.prisma.ressource.findFirst({
      where: { id: BigInt(ressourceId) },
      include: { module: { include: { cours: true } } },
    });
    if (!ressource) throw new NotFoundException('Ressource introuvable.');
    if (ressource.module?.cours.formateurId.toString() !== formateurId.toString()) {
      throw new ForbiddenException('Accès refusé.');
    }
    await this.prisma.ressource.delete({ where: { id: BigInt(ressourceId) } });
    return { message: 'Ressource supprimée avec succès.' };
  }

  async getInscriptionStatus(userId: number, coursId: number) {
    const inscription = await this.prisma.inscriptionCours.findFirst({
      where: { coursId: BigInt(coursId), apprenantId: BigInt(userId) },
      include: { progressions: true },
    });

    if (!inscription) {
      return { inscrit: false, progression: 0, completed: false, totalModules: 0 };
    }

    const totalModules = await this.prisma.module.count({
      where: { coursId: BigInt(coursId) },
    });
    const completedCount = inscription.progressions.filter((p) => p.completed).length;
    const allCompleted = totalModules > 0 && completedCount >= totalModules;

    return {
      inscrit: true,
      progression: inscription.progression,
      completed: allCompleted,
      totalModules,
      completedCount,
    };
  }
}