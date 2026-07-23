import { RolesGuard } from './roles.guard';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let mockPrisma: any;
  let currentUserForTest: any = null;

  beforeEach(() => {
    reflector = new Reflector();
    currentUserForTest = null;
    mockPrisma = {
      utilisateur: {
        findUnique: jest.fn().mockImplementation(() => {
          if (!currentUserForTest) return null;
          const roles = currentUserForTest.roles || [];
          return {
            roles: roles.map((r: string) => ({ nom: r })),
          };
        }),
      },
    };
    guard = new RolesGuard(reflector, mockPrisma);
  });

  const mockContext = (user: any, requiredRoles?: string[]) => {
    currentUserForTest = user;
    if (user && !user.id) {
      user.id = 1;
    }
    if (requiredRoles) {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
    } else {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    }

    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => {},
      getClass: () => {},
    } as any;
  };

  describe('when no @Roles decorator is present', () => {
    it('should allow access without checking roles', async () => {
      const context = mockContext(null);
      expect(await guard.canActivate(context)).toBe(true);
    });
  });

  describe('when @Roles is present', () => {
    it('should allow SUPER_ADMIN role', async () => {
      const context = mockContext({ roles: ['SUPER_ADMIN'] }, [
        'SUPER_ADMIN',
        'ADMIN',
      ]);
      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should allow ADMIN role', async () => {
      const context = mockContext({ roles: ['ADMIN'] }, [
        'SUPER_ADMIN',
        'ADMIN',
      ]);
      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should allow FORMATEUR role when required', async () => {
      const context = mockContext({ roles: ['FORMATEUR'] }, [
        'FORMATEUR',
        'ADMIN',
        'SUPER_ADMIN',
      ]);
      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should deny a regular user role', async () => {
      const context = mockContext({ roles: ['USER'] }, [
        'SUPER_ADMIN',
        'ADMIN',
      ]);
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should deny missing roles', async () => {
      const context = mockContext({ roles: [] }, [
        'SUPER_ADMIN',
        'ADMIN',
      ]);
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('security: edge cases', () => {
    it('should throw ForbiddenException when user has no roles property', async () => {
      const context = mockContext({}, ['SUPER_ADMIN']);
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user is null', async () => {
      const context = mockContext(null, ['SUPER_ADMIN']);
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user is undefined', async () => {
      const context = mockContext(undefined, ['ADMIN']);
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('simulation-specific role requirements', () => {
    it('should allow SUPER_ADMIN for simulation management', async () => {
      const context = mockContext({ roles: ['SUPER_ADMIN'] }, [
        'SUPER_ADMIN',
        'ADMIN',
      ]);
      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should allow ADMIN for simulation management', async () => {
      const context = mockContext({ roles: ['ADMIN'] }, [
        'SUPER_ADMIN',
        'ADMIN',
      ]);
      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should deny FORMATEUR for simulation admin management', async () => {
      const context = mockContext({ roles: ['FORMATEUR'] }, [
        'SUPER_ADMIN',
        'ADMIN',
      ]);
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
  });
});
