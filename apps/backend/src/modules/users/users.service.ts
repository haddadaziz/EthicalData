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

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Crée un nouvel utilisateur
  async create(createUserDto: CreateUserDto) {
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
    return this.prisma.utilisateur.findUnique({
      where: { email },
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

    const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.motDePasse);
    if (!isPasswordValid) {
      throw new BadRequestException('L\'ancien mot de passe saisi est incorrect.');
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
        roles: { select: { nom: true } },
        _count: {
          select: {
            sujets: true,
            commentaires: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Profil apprenant non trouvé.');
    }

    return {
      id: user.id.toString(),
      prenom: user.prenom,
      nom: user.nom,
      avatar: user.avatar,
      bio: user.bio,
      dateInscription: user.dateInscription,
      role: user.roles[0]?.nom || 'APPRENANT',
      stats: {
        sujetsCount: user._count.sujets,
        commentairesCount: user._count.commentaires,
      },
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
}
