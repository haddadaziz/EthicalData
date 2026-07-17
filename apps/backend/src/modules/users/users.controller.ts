import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Patch,
  Delete,
  Req,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Endpoint d'inscription POST /users publique
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // GET /users/me/profile -> Récupérer son propre profil connecté
  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  async getMyProfile(@Req() req: any) {
    return this.usersService.getUserProfile(req.user.id);
  }

  // PATCH /users/me/profile -> Mettre à jour ses propres informations
  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  async updateMyProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateUserProfile(req.user.id, updateProfileDto);
  }

  // PATCH /users/me/password -> Changer son propre mot de passe
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async changeMyPassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changeUserPassword(req.user.id, changePasswordDto);
  }

  // GET /users/public/:id -> Consultation du profil public d'un apprenant
  @UseGuards(JwtAuthGuard)
  @Get('public/:id')
  async getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getPublicUserProfile(id);
  }

  // GET /users -> Récupérer tous les utilisateurs (Admin)
  // GET /users?q=...&role=FORMATEUR -> Rechercher des formateurs
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get()
  async findAll(@Query('q') query?: string) {
    if (query) {
      return this.usersService.searchFormateurs(query);
    }
    return this.usersService.findAll();
  }

  // GET /users/:id -> Récupérer un utilisateur par ID (Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  // PATCH /users/:id -> Mise à jour d'un utilisateur par un Admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // DELETE /users/:id -> Suppression d'un utilisateur par un Admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  // POST /users/become-trainer -> Devenir Formateur
  @UseGuards(JwtAuthGuard)
  @Post('become-trainer')
  async becomeTrainer(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.usersService.becomeTrainer(req.user.id);

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', result.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60,
    });

    return result;
  }
}
