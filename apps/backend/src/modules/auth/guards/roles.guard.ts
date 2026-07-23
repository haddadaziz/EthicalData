import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Récupérer les rôles définis par le décorateur @Roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.id) {
      throw new ForbiddenException(
        'Accès refusé : Rôles utilisateur introuvables.',
      );
    }

    // Récupérer les rôles réels en temps réel depuis la base de données
    const dbUser = await this.prisma.utilisateur.findUnique({
      where: { id: BigInt(user.id) },
      select: {
        roles: {
          select: { nom: true },
        },
      },
    });

    if (!dbUser) {
      throw new ForbiddenException(
        'Accès refusé : Utilisateur inexistant.',
      );
    }

    const dbRoles = dbUser.roles.map((r: any) => r.nom);

    const hasRole = dbRoles.some((role: string) =>
      requiredRoles.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        "Accès refusé : Vous n'avez pas les droits nécessaires pour accéder à cette ressource.",
      );
    }

    return true;
  }
}
