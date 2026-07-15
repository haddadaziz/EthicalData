import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Post()
    async create(@Body() dto: CreateContactMessageDto) {
        const message = await this.contactService.create(dto);
        return { success: true, id: message.id.toString() };
    }
}
