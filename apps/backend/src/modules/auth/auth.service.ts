import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
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
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}