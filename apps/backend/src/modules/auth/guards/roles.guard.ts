import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Récupérer les rôles définis par le décorateur @Roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      throw new ForbiddenException("Accès refusé : Rôles utilisateur introuvables.");
    }

    const hasRole = user.roles.some((role: string) => requiredRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException("Accès refusé : Vous n'avez pas les droits nécessaires pour accéder à cette ressource.");
    }

    return true;
  }
}