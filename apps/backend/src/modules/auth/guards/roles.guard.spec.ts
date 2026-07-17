import { RolesGuard } from './roles.guard';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const mockContext = (user: any, requiredRoles?: string[]) => {
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
    it('should allow access without checking roles', () => {
      const context = mockContext(null);
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('when @Roles is present', () => {
    it('should allow SUPER_ADMIN role', () => {
      const context = mockContext({ roles: ['SUPER_ADMIN'] }, [
        'SUPER_ADMIN',
        'ADMIN',
      ]);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow ADMIN role', () => {
      const context = mockContext({ roles: ['ADMIN'] }, [
        'SUPER_ADMIN',
        'ADMIN',
      ]);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow FORMATEUR role when required', () => {
      const context = mockContext({ roles: ['FORMATEUR'] }, [
        'FORMATEUR',
        'ADMIN',
        'SUPER_ADMIN',
      ]);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny a regular user role', () => {
      const context = mockContext({ roles: ['USER'] }, [
        'SUPER_ADMIN',
        'ADMIN',
      ]);
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should deny missing roles', () => {
      const context = mockContext({ user: { roles: [] } }, [
        'SUPER_ADMIN',
        'ADMIN',
      ]);
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('security: edge cases', () => {
    it('should throw ForbiddenException when user has no roles property', () => {
      const context = mockContext({}, ['SUPER_ADMIN']);
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user is null', () => {
      const context = mockContext({ roles: null }, ['SUPER_ADMIN']);
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user is undefined', () => {
      const context = mockContext({}, ['ADMIN']);
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('simulation-specific role requirements', () => {
    it('should allow SUPER_ADMIN for simulation management', () => {
      const context = mockContext({ roles: ['SUPER_ADMIN'] }, [
        'SUPER_ADMIN',
        'ADMIN',
      ]);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow ADMIN for simulation management', () => {
      const context = mockContext({ roles: ['ADMIN'] }, [
        'SUPER_ADMIN',
        'ADMIN',
      ]);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny FORMATEUR for simulation admin management', () => {
      const context = mockContext({ roles: ['FORMATEUR'] }, [
        'SUPER_ADMIN',
        'ADMIN',
      ]);
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
