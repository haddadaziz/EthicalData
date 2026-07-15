import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // valider l'authentification et renvoyer sans mot de passe
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const isMatch = await bcrypt.compare(pass, user.motDePasse);

      if (isMatch) {
        if (user.statut === 'BANNI') {
          throw new UnauthorizedException('Vous êtes banni, vous ne pouvez pas vous connecter.');
        }
        if (user.statut === 'INACTIF') {
          throw new UnauthorizedException('Votre compte est inactif, vous ne pouvez pas vous connecter.');
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
    const createUserDto: CreateUserDto = {
      prenom: registerDto.prenom,
      nom: registerDto.nom,
      email: registerDto.email,
      motDePasse: registerDto.motDePasse,
      roles: ['APPRENANT'],
    };

    const user = await this.usersService.create(createUserDto);
    return this.login(user);
  }

  getCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' as const : 'lax' as const,
      path: '/',
      maxAge: 24 * 60 * 60, // 24h (doit correspondre à JWT_EXPIRATION)
    };
  }
}
