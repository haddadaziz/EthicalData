import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateCreneauDto } from './dto/create-creneau.dto';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // 1. Créer un créneau de disponibilité (Admin / Formateur)
  @Post('creneaux')
  async createCreneau(@Req() req: any, @Body() dto: CreateCreneauDto) {
    const userRoles: string[] = req.user.roles || [];
    const isAdmin = userRoles.some(r => r === 'ADMIN' || r === 'SUPER_ADMIN');
    const formateurId = isAdmin && dto.formateurId ? dto.formateurId : req.user.id;
    return this.appointmentsService.createCreneau(formateurId, dto);
  }

  // 2. Récupérer les créneaux disponibles pour réservation
  @Get('creneaux/disponibles')
  async getAvailableCreneaux() {
    return this.appointmentsService.getAvailableCreneaux();
  }

  // 3. Réserver un rendez-vous (Apprenant)
  @Post('reserver')
  async bookAppointment(@Req() req: any, @Body() dto: BookAppointmentDto) {
    return this.appointmentsService.bookAppointment(req.user.id, dto);
  }

  // 4. Obtenir mes rendez-vous (Apprenant / Formateur)
  @Get('mes-rdv')
  async getMyAppointments(@Req() req: any) {
    return this.appointmentsService.getMyAppointments(req.user.id);
  }

  // 5a. Tous les rendez-vous (Admin)
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getAllAppointments() {
    return this.appointmentsService.getAllAppointments();
  }

  // 5b. Annuler un rendez-vous
  @Patch(':id/annuler')
  async cancelAppointment(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userRoles = req.user.roles || [];
    return this.appointmentsService.cancelAppointment(req.user.id, userRoles, id);
  }

  // 6. Supprimer un créneau libre (Admin / Formateur)
  @Delete('creneaux/:id')
  async deleteCreneau(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userRoles = req.user.roles || [];
    return this.appointmentsService.deleteCreneau(req.user.id, userRoles, id);
  }

  // 7. Mettre à jour un créneau libre (Admin / Formateur)
  @Patch('creneaux/:id')
  async updateCreneau(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCreneauDto,
  ) {
    const userRoles = req.user.roles || [];
    return this.appointmentsService.updateCreneau(req.user.id, userRoles, id, dto);
  }
}
