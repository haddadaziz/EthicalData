import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private settingsService: SettingsService,
  ) {}

  // Crée un nouvel utilisateur
  async create(createUserDto: CreateUserDto) {
    const generalSettings = await this.settingsService.getSetting('general');
    if (generalSettings && generalSettings.allowRegistrations === false) {
      const hasAdminRole =
        createUserDto.roles &&
        createUserDto.roles.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');
      if (!hasAdminRole) {
        throw new BadRequestException(
          'Les inscriptions sont actuellement désactivées sur cette plateforme.',
        );
      }
    }

    const securitySettings = await this.settingsService.getSetting('security');
    if (securitySettings) {
      const {
        passwordMinLength,
        passwordRequireUppercase,
        passwordRequireDigit,
        passwordRequireSpecialChar,
      } = securitySettings;
      const pwd = createUserDto.motDePasse || '';

      if (pwd.length < (passwordMinLength || 8)) {
        throw new BadRequestException(
          `Le mot de passe doit contenir au moins ${passwordMinLength || 8} caractères.`,
        );
      }
      if (passwordRequireUppercase && !/[A-Z]/.test(pwd)) {
        throw new BadRequestException(
          'Le mot de passe doit contenir au moins une lettre majuscule.',
        );
      }
      if (passwordRequireDigit && !/[0-9]/.test(pwd)) {
        throw new BadRequestException(
          'Le mot de passe doit contenir au moins un chiffre.',
        );
      }
      if (passwordRequireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
        throw new BadRequestException(
          'Le mot de passe doit contenir au moins un caractère spécial.',
        );
      }
    }

    const existingUser = await this.prisma.utilisateur.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Un utilisateur avec cette adresse e-mail existe déjà.',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.motDePasse, salt);

    const user = await this.prisma.utilisateur.create({
      data: {
        prenom: createUserDto.prenom,
        nom: createUserDto.nom,
        email: createUserDto.email,
        telephone: createUserDto.telephone,
        motDePasse: hashedPassword,
        statut: 'ACTIF',
        roles:
          createUserDto.roles && createUserDto.roles.length > 0
            ? {
                connect: createUserDto.roles.map((roleNom) => ({
                  nom: roleNom,
                })),
              }
            : undefined,
      },
      include: {
        roles: true,
      },
    });

    const { motDePasse, ...result } = user;
    return {
      ...result,
      id: result.id.toString(),
      roles: result.roles.map((r) => ({
        ...r,
        id: r.id.toString(),
      })),
    };
  }

  // Recherche par email
  async findByEmail(email: string) {
    return this.prisma.utilisateur.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        deletedAt: null,
      },
      include: {
        roles: true,
      },
    });
  }

  // Recherche par ID
  async findById(id: number) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException("L'utilisateur demandé n'existe pas.");
    }

    const { motDePasse, ...result } = user;
    return {
      ...result,
      id: result.id.toString(),
      roles: result.roles.map((r) => ({
        ...r,
        id: r.id.toString(),
      })),
    };
  }

  // Récupérer le profil connecté (Mon Profil)
  async getUserProfile(userId: number) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { id: BigInt(userId), deletedAt: null },
      include: {
        roles: true,
        tentatives: {
          select: {
            score: true,
            simulation: {
              select: {
                certification: {
                  select: {
                    id: true,
                    nom: true,
                    slug: true,
                    codeExamen: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            sujets: true,
            commentaires: true,
            likesSujets: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Profil non trouvé.');
    }

    // Récupérer les certifications obtenues (score d'un examen blanc >= 80)
    const obtainedMap = new Map();
    user.tentatives.forEach((t) => {
      const cert = t.simulation?.certification;
      if (t.score >= 80 && cert) {
        const key = cert.id.toString();
        obtainedMap.set(key, {
          id: key,
          nom: cert.nom,
          slug: cert.slug,
          codeExamen: cert.codeExamen,
          image: cert.image,
          bestScore: Math.max(t.score, obtainedMap.get(key)?.bestScore || 0),
        });
      }
    });
    const obtainedCerts = Array.from(obtainedMap.values());

    const { motDePasse, ...result } = user;
    return {
      ...result,
      id: result.id.toString(),
      roles: result.roles.map((r) => ({
        ...r,
        id: r.id.toString(),
      })),
      stats: {
        sujetsCount: result._count.sujets,
        commentairesCount: result._count.commentaires,
        likesCount: result._count.likesSujets,
      },
      obtainedCertifications: obtainedCerts,
    };
  }

  // Mettre à jour le profil connecté
  async updateUserProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { id: BigInt(userId), deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    const updatedUser = await this.prisma.utilisateur.update({
      where: { id: BigInt(userId) },
      data: {
        prenom: dto.prenom ?? user.prenom,
        nom: dto.nom ?? user.nom,
        telephone: dto.telephone ?? user.telephone,
        avatar: dto.avatar ?? user.avatar,
        bio: dto.bio ?? user.bio,
        preferences: dto.preferences ? dto.preferences : user.preferences,
      },
      include: {
        roles: true,
        _count: {
          select: {
            sujets: true,
            commentaires: true,
            likesSujets: true,
          },
        },
      },
    });

    const { motDePasse, ...result } = updatedUser;
    return {
      ...result,
      id: result.id.toString(),
      roles: result.roles.map((r) => ({
        ...r,
        id: r.id.toString(),
      })),
      stats: {
        sujetsCount: result._count.sujets,
        commentairesCount: result._count.commentaires,
        likesCount: result._count.likesSujets,
      },
    };
  }

  // Changer de mot de passe
  async changeUserPassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { id: BigInt(userId), deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.motDePasse,
    );
    if (!isPasswordValid) {
      throw new BadRequestException(
        "L'ancien mot de passe saisi est incorrect.",
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.utilisateur.update({
      where: { id: BigInt(userId) },
      data: { motDePasse: hashedPassword },
    });

    return { message: 'Mot de passe mis à jour avec succès.' };
  }

  // Profil public d'un apprenant
  async getPublicUserProfile(targetUserId: number) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { id: BigInt(targetUserId), deletedAt: null },
      select: {
        id: true,
        prenom: true,
        nom: true,
        avatar: true,
        bio: true,
        dateInscription: true,
        preferences: true,
        roles: { select: { nom: true } },
        tentatives: {
          select: {
            score: true,
            simulation: {
              select: {
                certification: {
                  select: {
                    id: true,
                    nom: true,
                    slug: true,
                    codeExamen: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            sujets: true,
            commentaires: true,
            likesSujets: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Profil apprenant non trouvé.');
    }

    // Récupérer les certifications obtenues (score d'un examen blanc >= 80)
    const obtainedMap = new Map();
    user.tentatives.forEach((t) => {
      const cert = t.simulation?.certification;
      if (t.score >= 80 && cert) {
        const key = cert.id.toString();
        obtainedMap.set(key, {
          id: key,
          nom: cert.nom,
          slug: cert.slug,
          codeExamen: cert.codeExamen,
          image: cert.image,
          bestScore: Math.max(t.score, obtainedMap.get(key)?.bestScore || 0),
        });
      }
    });
    const obtainedCerts = Array.from(obtainedMap.values());

    return {
      id: user.id.toString(),
      prenom: user.prenom,
      nom: user.nom,
      avatar: user.avatar,
      bio: user.bio,
      dateInscription: user.dateInscription,
      role: user.roles[0]?.nom || 'APPRENANT',
      preferences: user.preferences,
      stats: {
        sujetsCount: user._count.sujets,
        commentairesCount: user._count.commentaires,
        likesCount: user._count.likesSujets,
      },
      obtainedCertifications: obtainedCerts,
    };
  }

  // Récupérer tous les utilisateurs
  async findAll() {
    const users = await this.prisma.utilisateur.findMany({
      where: { deletedAt: null },
      include: {
        roles: true,
      },
    });

    return users.map((user) => {
      const { motDePasse, ...result } = user;
      return {
        ...result,
        id: result.id.toString(),
        roles: result.roles.map((r) => ({
          ...r,
          id: r.id.toString(),
        })),
      };
    });
  }

  async searchFormateurs(query: string) {
    const where: any = {
      deletedAt: null,
      roles: { some: { nom: 'FORMATEUR' } },
    };

    if (query.trim()) {
      const q = query.trim();
      where.OR = [
        { prenom: { contains: q } },
        { nom: { contains: q } },
        { email: { contains: q } },
        { telephone: { contains: q } },
      ];
    }

    const users = await this.prisma.utilisateur.findMany({
      where,
      take: 20,
      orderBy: { prenom: 'asc' },
    });

    return users.map((user) => {
      const { motDePasse, ...result } = user;
      return {
        ...result,
        id: result.id.toString(),
      };
    });
  }

  // Met à jour admin
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException("L'utilisateur demandé n'existe pas.");
    }

    const data: any = {
      prenom: updateUserDto.prenom,
      nom: updateUserDto.nom,
      email: updateUserDto.email,
      telephone: updateUserDto.telephone,
      statut: updateUserDto.statut,
    };

    if (updateUserDto.motDePasse) {
      const salt = await bcrypt.genSalt(10);
      data.motDePasse = await bcrypt.hash(updateUserDto.motDePasse, salt);
    }

    if (updateUserDto.roles) {
      data.roles = {
        set: updateUserDto.roles.map((roleNom) => ({ nom: roleNom })),
      };
    }

    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key],
    );

    const updatedUser = await this.prisma.utilisateur.update({
      where: { id: BigInt(id) },
      data,
      include: {
        roles: true,
      },
    });

    const { motDePasse, ...result } = updatedUser;
    return {
      ...result,
      id: result.id.toString(),
      roles: result.roles.map((r) => ({
        ...r,
        id: r.id.toString(),
      })),
    };
  }

  // Soft delete
  async remove(id: number) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException("L'utilisateur demandé n'existe pas.");
    }

    await this.prisma.utilisateur.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date() },
    });

    return { message: 'Utilisateur supprimé avec succès.' };
  }

  // Devenir Formateur — retourne un nouveau token JWT pour prise d'effet immédiate
  async becomeTrainer(userId: number) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { id: BigInt(userId), deletedAt: null },
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    const hasTrainerRole = user.roles.some((r) => r.nom === 'FORMATEUR');
    if (!hasTrainerRole) {
      await this.prisma.utilisateur.update({
        where: { id: BigInt(userId) },
        data: {
          roles: {
            connect: { nom: 'FORMATEUR' },
          },
        },
      });
    }

    // Re-fetch pour avoir les rôles mis à jour
    const updatedUser = await this.prisma.utilisateur.findFirst({
      where: { id: BigInt(userId) },
      include: { roles: true },
    });

    // Émettre un nouveau JWT avec les rôles mis à jour
    const payload = {
      sub: updatedUser!.id.toString(),
      email: updatedUser!.email,
      roles: updatedUser!.roles.map((r) => r.nom),
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      message: 'Félicitations ! Vous êtes maintenant formateur.',
      roles: updatedUser!.roles.map((r) => r.nom),
    };
  }
}
