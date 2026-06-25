import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Crée un nouvel utilisateur après validation et hachage du mot de passe.
  async create(createUserDto: CreateUserDto) {
    // Vérifier si l'adresse e-mail est déjà prise
    const existingUser = await this.prisma.utilisateur.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cette adresse e-mail existe déjà.');
    }

    // Hachage mdp
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.motDePasse, salt);

    // Créer l'utilisateur dans PostgreSQL via Prisma
    const user = await this.prisma.utilisateur.create({
      data: {
        prenom: createUserDto.prenom,
        nom: createUserDto.nom,
        email: createUserDto.email,
        telephone: createUserDto.telephone,
        motDePasse: hashedPassword,
        statut: 'ACTIF',
      },
    });

    // Exclure le mot de passe de la réponse pour des raisons de sécurité
    // Et conversion BigInt ID en String pour éviter les erreurs de sérialisation JSON
    const { motDePasse, ...result } = user;
    return {
      ...result,
      id: result.id.toString(),
    };
  }

  // Recherche un utilisateur par son e-mail
  async findByEmail(email: string) {
    return this.prisma.utilisateur.findUnique({
      where: { email },
    });
  }

  // Recherche un utilisateur par son ID.
  async findById(id: number) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: BigInt(id) },
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
}