import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  // valider l'authentification et renvoyer sans mot de passe
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const isMatch = await bcrypt.compare(pass, user.motDePasse);

      if (isMatch) {
        if (user.statut === 'BANNI') {
          throw new UnauthorizedException(
            'Vous êtes banni, vous ne pouvez pas vous connecter.',
          );
        }
        if (user.statut === 'INACTIF') {
          throw new UnauthorizedException(
            'Votre compte est inactif, vous ne pouvez pas vous connecter.',
          );
        }

        const { motDePasse, ...result } = user;
        return {
          ...result,
          id: result.id.toString(),
        };
      }
    }

    return null;
  }

  async login(user: any) {
    const payload = {
      sub: user.id.toString(),
      email: user.email,
      roles: user.roles.map((role: any) => role.nom),
    };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }

  async register(registerDto: RegisterDto) {
    try {
      const createUserDto: CreateUserDto = {
        prenom: registerDto.prenom,
        nom: registerDto.nom,
        email: registerDto.email,
        telephone: registerDto.telephone,
        motDePasse: registerDto.motDePasse,
        roles: ['APPRENANT'],
      };

      const user = await this.usersService.create(createUserDto);
      return await this.login(user);
    } catch (err: any) {
      console.error('❌ AUTH REGISTER ERROR:', err?.stack || err?.message || err);
      throw err;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return {
        message:
          'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
      };
    }

    const now = new Date();
    const existingTokens = await this.prisma.passwordResetToken.findMany({
      where: { email, used: false, expiresAt: { gte: now } },
    });

    if (existingTokens.length >= 3) {
      return {
        message:
          'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    await this.mailService.sendPasswordResetEmail(email, token);

    return {
      message:
        'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
    };
  }

  async resetPassword(
    token: string,
    motDePasse: string,
  ): Promise<{ message: string }> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record) {
      throw new NotFoundException('Token de réinitialisation invalide.');
    }

    if (record.used) {
      throw new BadRequestException('Ce token a déjà été utilisé.');
    }

    if (new Date() > record.expiresAt) {
      throw new BadRequestException(
        'Ce token a expiré. Veuillez refaire une demande.',
      );
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    await this.prisma.utilisateur.update({
      where: { email: record.email },
      data: { motDePasse: hashedPassword },
    });

    await this.prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true },
    });

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  getCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? ('none' as const) : ('lax' as const),
      path: '/',
      maxAge: 24 * 60 * 60, // 24h (doit correspondre à JWT_EXPIRATION)
    };
  }
}
