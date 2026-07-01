import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Crée un nouvel utilisateur avec ses rôles après validation et hachage du mot de passe
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

  // Recherche un utilisateur par son e-mail avec ses roles
  async findByEmail(email: string) {
    return this.prisma.utilisateur.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });
  }

  // Recherche un utilisateur par son ID
  async findById(id: number) {
    const user = await this.prisma.utilisateur.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException("L'utilisateur demandé n'existe pas.");
    }

    const { motDePasse, ...result } = user;
    return {
      ...result,
      id: result.id.toString(),
    };
  }

  // Récupère tous les utilisateurs non supprimés avec leurs rôles
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

  // Met à jour les informations d'un utilisateur
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

    // Si le mot de passe doit être mis à jour
    if (updateUserDto.motDePasse) {
      const salt = await bcrypt.genSalt(10);
      data.motDePasse = await bcrypt.hash(updateUserDto.motDePasse, salt);
    }

    // Si les rôles sont mis à jour
    if (updateUserDto.roles) {
      data.roles = {
        set: updateUserDto.roles.map((roleNom) => ({ nom: roleNom })),
      };
    }

    // Nettoyer les champs undefined
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
