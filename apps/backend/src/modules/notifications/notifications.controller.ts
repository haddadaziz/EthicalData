import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // 1. Récupérer les notifications et le nombre d'éléments non lus
  @Get()
  async getNotifications(@Req() req: any) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  // 2. Marquer TOUTES les notifications comme lues (placé avant :id)
  @Patch('tout-lire')
  async markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  // 3. Marquer une notification spécifique comme lue
  @Patch(':id/lire')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.notificationsService.markAsRead(req.user.id, id);
  }

  // 4. Supprimer une notification
  @Delete(':id')
  async deleteNotification(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.notificationsService.deleteNotification(req.user.id, id);
  }
}
