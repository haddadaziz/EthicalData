import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('system')
  @Roles('SUPER_ADMIN')
  async getAll() {
    return this.settingsService.getAllSettings();
  }

  @Patch('system/:key')
  @Roles('SUPER_ADMIN')
  async update(@Param('key') key: string, @Body() body: any) {
    // Note: body is the configuration object for the given key
    return this.settingsService.updateSetting(key, body);
  }
}
