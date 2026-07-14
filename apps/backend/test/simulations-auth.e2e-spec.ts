import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { JwtAuthGuard } from './../src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './../src/modules/auth/guards/roles.guard';

describe('Simulations - Auth & Security (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── GET /simulations ─────────────────────────────────────────────

  describe('GET /simulations', () => {
    it('should return 200 and an array of simulations', () => {
      return request(app.getHttpServer())
        .get('/simulations')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  // ─── GET /simulations/:id ─────────────────────────────────────────

  describe('GET /simulations/:id', () => {
    it('should return 404 for non-existent simulation', () => {
      return request(app.getHttpServer())
        .get('/simulations/999999')
        .expect(404);
    });
  });

  // ─── POST /simulations ────────────────────────────────────────────

  describe('POST /simulations', () => {
    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/simulations')
        .send({})
        .expect(400);
    });

    it('should return 400 for missing certificationId', () => {
      return request(app.getHttpServer())
        .post('/simulations')
        .send({ titre: 'Test' })
        .expect(400);
    });

    it('should return 400 for invalid duree (min 1)', () => {
      return request(app.getHttpServer())
        .post('/simulations')
        .send({ titre: 'Test', certificationId: 1, duree: 0 })
        .expect(400);
    });

    it('should return 400 for invalid scoreMinimal (min 0)', () => {
      return request(app.getHttpServer())
        .post('/simulations')
        .send({ titre: 'Test', certificationId: 1, scoreMinimal: -1 })
        .expect(400);
    });

    it('should return 400 for invalid scoreMinimal (max 100)', () => {
      return request(app.getHttpServer())
        .post('/simulations')
        .send({ titre: 'Test', certificationId: 1, scoreMinimal: 101 })
        .expect(400);
    });
  });

  // ─── PATCH /simulations/:id ───────────────────────────────────────

  describe('PATCH /simulations/:id', () => {
    it('should return 404 for non-existent simulation', () => {
      return request(app.getHttpServer())
        .patch('/simulations/999999')
        .send({ titre: 'Updated' })
        .expect(404);
    });

    it('should return 400 for invalid body', () => {
      return request(app.getHttpServer())
        .patch('/simulations/1')
        .send({ titre: '' })
        .expect(400);
    });
  });

  // ─── DELETE /simulations/:id ──────────────────────────────────────

  describe('DELETE /simulations/:id', () => {
    it('should return 404 for non-existent simulation', () => {
      return request(app.getHttpServer())
        .delete('/simulations/999999')
        .expect(404);
    });
  });

  // ─── Rôle-based Access ────────────────────────────────────────────

  describe('Role-based access control', () => {
    it('should block regular users from creating simulations when RolesGuard denies', async () => {
      // Create a new module with JwtAuthGuard mocked to pass but RolesGuard to deny
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => true })
        .overrideGuard(RolesGuard)
        .useValue({ canActivate: () => false })
        .compile();

      const guardApp = moduleFixture.createNestApplication();
      await guardApp.init();

      await request(guardApp.getHttpServer())
        .post('/simulations')
        .send({ titre: 'Test', certificationId: 1 })
        .expect(403);

      await guardApp.close();
    });
  });

  // ─── DTO Validation ───────────────────────────────────────────────

  describe('DTO validation', () => {
    it('should reject empty titre', () => {
      return request(app.getHttpServer())
        .post('/simulations')
        .send({ titre: '', certificationId: 1 })
        .expect(400);
    });

    it('should reject non-numeric certificationId', () => {
      return request(app.getHttpServer())
        .post('/simulations')
        .send({ titre: 'Test', certificationId: 'abc' })
        .expect(400);
    });

    it('should accept valid optional fields', () => {
      return request(app.getHttpServer())
        .post('/simulations')
        .send({ titre: 'Test', certificationId: 1, duree: 60, scoreMinimal: 75 })
        .expect(201);
    });
  });
});
