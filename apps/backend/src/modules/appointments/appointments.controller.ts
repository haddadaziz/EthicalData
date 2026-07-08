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

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // 1. Créer un créneau de disponibilité (Formateur / Admin)
  @Post('creneaux')
  async createCreneau(@Req() req: any, @Body() dto: CreateCreneauDto) {
    return this.appointmentsService.createCreneau(req.user.id, dto);
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

  // 5. Annuler un rendez-vous
  @Patch(':id/annuler')
  async cancelAppointment(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const userRoles = req.user.roles || [];
    return this.appointmentsService.cancelAppointment(req.user.id, userRoles, id);
  }

  // 6. Supprimer un créneau libre (Formateur)
  @Delete('creneaux/:id')
  async deleteCreneau(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.deleteCreneau(req.user.id, id);
  }
}