import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ContactService', () => {
  let service: ContactService;
  let prisma: any;

  const mockPrisma = {
    contactMessage: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      nom: 'Jean Dupont',
      email: 'jean@example.com',
      sujet: 'Question sur AZ-900',
      message:
        'Bonjour, je voudrais des informations sur la certification AZ-900.',
    };

    it('should create a contact message successfully', async () => {
      mockPrisma.contactMessage.create.mockResolvedValue({
        id: BigInt(1),
        ...createDto,
        lu: false,
        dateCreation: new Date(),
      });

      const result = await service.create(createDto);

      expect(prisma.contactMessage.create).toHaveBeenCalledWith({
        data: {
          nom: createDto.nom,
          email: createDto.email,
          sujet: createDto.sujet,
          message: createDto.message,
        },
      });
      expect(result.nom).toBe('Jean Dupont');
      expect(result.email).toBe('jean@example.com');
    });

    it('should persist all fields correctly', async () => {
      mockPrisma.contactMessage.create.mockResolvedValue({
        id: BigInt(1),
        ...createDto,
        lu: false,
        dateCreation: new Date(),
      });

      const result = await service.create(createDto);

      expect(result).toMatchObject({
        nom: createDto.nom,
        email: createDto.email,
        sujet: createDto.sujet,
        message: createDto.message,
      });
    });
  });
});
