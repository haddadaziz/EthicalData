import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CertificationsService } from './certifications.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('certifications')
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  // Récupérer les fournisseurs
  @Get('fournisseurs')
  async findAllFournisseurs() {
    return this.certificationsService.findAllFournisseurs();
  }

  // Récupérer toutes les certifications
  @Get()
  async findAll() {
    return this.certificationsService.findAll();
  }

  // Récupérer une certification par son ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.certificationsService.findOne(id);
  }

  // Créer une nouvelle certification
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Post()
  async create(@Body() dto: CreateCertificationDto) {
    return this.certificationsService.create(dto);
  }

  // Mettre à jour les informations d'une certification
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCertificationDto) {
    return this.certificationsService.update(id, dto);
  }

  // Soft delete
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.certificationsService.remove(id);
  }
}