import { Test, TestingModule } from '@nestjs/testing';
import { SimulationsService } from './simulations.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../certifications/ai.service';
import { NotFoundException } from '@nestjs/common';

describe('SimulationsService', () => {
  let service: SimulationsService;
  let prisma: any;

  const mockPrisma = {
    simulation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    certification: {
      findFirst: jest.fn(),
    },
    cours: {
      findFirst: jest.fn(),
    },
    question: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    option: {
      deleteMany: jest.fn(),
    },
    tentative: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockAiService = {
    evaluerReponseOuverte: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<SimulationsService>(SimulationsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all simulations with related data', async () => {
      const mockSimulations = [
        {
          id: BigInt(1),
          titre: 'Simulation AZ-900',
          description: 'Test',
          duree: 60,
          scoreMinimal: 700,
          dateCreation: new Date(),
          certificationId: BigInt(1),
          coursId: null,
          certification: { id: BigInt(1), nom: 'Azure Fundamentals', codeExamen: 'AZ-900' },
          cours: null,
          _count: { questions: 10, tentatives: 5 },
        },
      ];

      mockPrisma.simulation.findMany.mockResolvedValue(mockSimulations);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].titre).toBe('Simulation AZ-900');
      expect(result[0].certification?.codeExamen).toBe('AZ-900');
      expect(result[0]._count.questions).toBe(10);
    });

    it('should return empty array when no simulations exist', async () => {
      mockPrisma.simulation.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a simulation by id', async () => {
      const mockSim = {
        id: BigInt(1),
        titre: 'Simulation AZ-900',
        description: 'Test',
        duree: 60,
        scoreMinimal: 700,
        dateCreation: new Date(),
        certificationId: BigInt(1),
        coursId: null,
        certification: { id: BigInt(1), nom: 'Azure Fundamentals', codeExamen: 'AZ-900', slug: 'az-900' },
        cours: null,
        questions: [],
        _count: { tentatives: 3 },
      };

      mockPrisma.simulation.findUnique.mockResolvedValue(mockSim);

      const result = await service.findOne(1);
      expect(result.id).toBe('1');
      expect(result.titre).toBe('Simulation AZ-900');
    });

    it('should throw NotFoundException when simulation does not exist', async () => {
      mockPrisma.simulation.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      titre: 'Nouvelle Simulation',
      description: 'Description test',
      duree: 90,
      scoreMinimal: 800,
      certificationId: 1,
    };

    it('should create a simulation successfully', async () => {
      mockPrisma.certification.findFirst.mockResolvedValue({ id: BigInt(1), nom: 'Azure' });
      mockPrisma.simulation.create.mockResolvedValue({
        id: BigInt(1),
        ...createDto,
        certificationId: BigInt(1),
        coursId: null,
        dateCreation: new Date(),
      });

      const result = await service.create(createDto);
      expect(result.id).toBe('1');
      expect(result.titre).toBe('Nouvelle Simulation');
    });

    it('should throw NotFoundException when certification does not exist', async () => {
      mockPrisma.certification.findFirst.mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should create with optional coursId', async () => {
      const dtoWithCours = { ...createDto, coursId: 5 };
      mockPrisma.certification.findFirst.mockResolvedValue({ id: BigInt(1) });
      mockPrisma.cours.findFirst.mockResolvedValue({ id: BigInt(5) });
      mockPrisma.simulation.create.mockResolvedValue({
        id: BigInt(2),
        ...dtoWithCours,
        certificationId: BigInt(1),
        coursId: BigInt(5),
        dateCreation: new Date(),
      });

      const result = await service.create(dtoWithCours);
      expect(result.coursId).toBe('5');
    });
  });

  describe('update', () => {
    const updateDto = {
      titre: 'Updated Simulation',
      description: 'Updated',
      duree: 120,
      scoreMinimal: 850,
      certificationId: 1,
    };

    it('should update a simulation', async () => {
      mockPrisma.simulation.findUnique.mockResolvedValue({ id: BigInt(1) });
      mockPrisma.simulation.update.mockResolvedValue({
        id: BigInt(1),
        ...updateDto,
        certificationId: BigInt(1),
        coursId: null,
        dateCreation: new Date(),
      });

      const result = await service.update(1, updateDto);
      expect(result.titre).toBe('Updated Simulation');
    });

    it('should throw NotFoundException when simulation does not exist', async () => {
      mockPrisma.simulation.findUnique.mockResolvedValue(null);
      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a simulation', async () => {
      mockPrisma.simulation.findUnique.mockResolvedValue({ id: BigInt(1) });
      mockPrisma.simulation.delete.mockResolvedValue({ id: BigInt(1) });

      const result = await service.remove(1);
      expect(result.message).toBe('Simulation supprimée avec succès.');
    });

    it('should throw NotFoundException when simulation does not exist', async () => {
      mockPrisma.simulation.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findQuestionsByCertification', () => {
    it('should return questions for a certification', async () => {
      const mockQuestions = [
        {
          id: BigInt(1),
          enonce: 'Question 1',
          type: 'QCM',
          certificationId: BigInt(1),
          options: [{ id: BigInt(1), lettre: 'A', texte: 'Option A', questionId: BigInt(1) }],
        },
      ];

      mockPrisma.question.findMany.mockResolvedValue(mockQuestions);

      const result = await service.findQuestionsByCertification(1);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].options[0].lettre).toBe('A');
    });
  });

  describe('createTentative', () => {
    it('should create a tentative and auto-create simulation if needed', async () => {
      mockPrisma.certification.findFirst.mockResolvedValue({ id: BigInt(1), nom: 'Azure' });
      mockPrisma.simulation.findFirst
        .mockResolvedValueOnce(null) // No existing simulation
        .mockResolvedValueOnce({ id: BigInt(10), certificationId: BigInt(1) }); // After creation
      mockPrisma.simulation.create.mockResolvedValue({ id: BigInt(10), certificationId: BigInt(1) });
      mockPrisma.tentative.create.mockResolvedValue({
        id: BigInt(1),
        score: 85,
        utilisateurId: BigInt(42),
        simulationId: BigInt(10),
        datePassage: new Date(),
        dureePassage: null,
      });

      const result = await service.createTentative(42, 1, 85);
      expect(result.id).toBe('1');
      expect(result.score).toBe(85);
    });

    it('should throw NotFoundException when certification does not exist', async () => {
      mockPrisma.certification.findFirst.mockResolvedValue(null);
      await expect(service.createTentative(42, 999, 50)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserStats', () => {
    it('should return user stats with readiness score', async () => {
      mockPrisma.tentative.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          score: 80,
          datePassage: new Date(),
          simulation: {
            certificationId: BigInt(1),
            certification: { nom: 'Azure', slug: 'az-900' },
          },
        },
        {
          id: BigInt(2),
          score: 90,
          datePassage: new Date(),
          simulation: {
            certificationId: BigInt(1),
            certification: { nom: 'Azure', slug: 'az-900' },
          },
        },
      ]);

      const result = await service.getUserStats(42);
      expect(result.totalAttempts).toBe(2);
      expect(result.averageScore).toBe(85);
      expect(result.readinessScore).toBeGreaterThanOrEqual(80);
      expect(result.readinessLabel).toBe('PRET');
    });

    it('should return empty stats when no attempts', async () => {
      mockPrisma.tentative.findMany.mockResolvedValue([]);
      const result = await service.getUserStats(42);
      expect(result.totalAttempts).toBe(0);
      expect(result.averageScore).toBe(0);
    });
  });

  describe('Security: BigInt serialization', () => {
    it('should convert all BigInt IDs to strings in findAll', async () => {
      const mockSims = [
        {
          id: BigInt(1),
          titre: 'Test',
          description: null,
          duree: 60,
          scoreMinimal: 700,
          dateCreation: new Date(),
          certificationId: BigInt(2),
          coursId: BigInt(3),
          certification: { id: BigInt(2), nom: 'Test Cert', codeExamen: 'TC-01' },
          cours: { id: BigInt(3), titre: 'Test Course' },
          _count: { questions: 0, tentatives: 0 },
        },
      ];
      mockPrisma.simulation.findMany.mockResolvedValue(mockSims);

      const result = await service.findAll();
      expect(typeof result[0].id).toBe('string');
      expect(typeof result[0].certificationId).toBe('string');
      expect(typeof result[0].coursId).toBe('string');
      expect(typeof result[0].certification!.id).toBe('string');
      expect(typeof result[0].cours!.id).toBe('string');
    });
  });

  describe('Security: Validation of non-existent resources', () => {
    it('should reject creation with non-existent coursId', async () => {
      const dto = {
        titre: 'Test',
        certificationId: 1,
        coursId: 999,
      };

      mockPrisma.certification.findFirst.mockResolvedValue({ id: BigInt(1) });
      mockPrisma.cours.findFirst.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should reject tentative with non-existent certification', async () => {
      mockPrisma.certification.findFirst.mockResolvedValue(null);
      await expect(service.createTentative(1, 999, 50)).rejects.toThrow(NotFoundException);
    });
  });
});
