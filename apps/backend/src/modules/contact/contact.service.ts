import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Injectable()
export class ContactService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateContactMessageDto) {
        return this.prisma.contactMessage.create({
            data: {
                nom: dto.nom,
                email: dto.email,
                sujet: dto.sujet,
                message: dto.message,
            },
        });
    }
}
