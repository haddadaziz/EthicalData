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
} from '@nestjs/common';
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
  async updateMyProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateUserProfile(req.user.id, updateProfileDto);
  }

  // PATCH /users/me/password -> Changer son propre mot de passe
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async changeMyPassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changeUserPassword(req.user.id, changePasswordDto);
  }

  // GET /users/public/:id -> Consultation du profil public d'un apprenant
  @UseGuards(JwtAuthGuard)
  @Get('public/:id')
  async getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getPublicUserProfile(id);
  }

  // GET /users -> Récupérer tous les utilisateurs (Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get()
  async findAll() {
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
}
