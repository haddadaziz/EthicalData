import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateRessourceDto } from './create-ressource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  async findAllRessources() {
    return this.resourcesService.findAllRessources();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createRessource(@Body() dto: CreateRessourceDto) {
    return this.resourcesService.createRessource(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updateRessource(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateRessourceDto>,
  ) {
    return this.resourcesService.updateRessource(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async removeRessource(@Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.removeRessource(id);
  }

  @Post(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadRessource(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Ip() ip: string,
  ) {
    return this.resourcesService.downloadRessource(req.user.id, id, ip);
  }

  @Get('me/quotas')
  @UseGuards(JwtAuthGuard)
  async getUserResourceQuotas(@Req() req: any) {
    return this.resourcesService.getUserResourceQuotas(req.user.id);
  }

  @Get('me/historique')
  @UseGuards(JwtAuthGuard)
  async getUserDownloadHistory(@Req() req: any) {
    return this.resourcesService.getUserDownloadHistory(req.user.id);
  }

  @Get('admin/historique')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getAllDownloadHistory(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('userId') userId?: string,
  ) {
    return this.resourcesService.getAllDownloadHistory({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      type,
      userId,
    });
  }
}
