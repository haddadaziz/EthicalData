import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Statut } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  prenom?: string;

  @IsString()
  @IsOptional()
  nom?: string;

  @IsEmail({}, { message: "L'adresse e-mail n'est pas valide." })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit faire au moins 8 caractères.',
  })
  @IsOptional()
  motDePasse?: string;

  @IsArray({
    message: 'Les rôles doivent être transmis sous forme de tableau.',
  })
  @IsString({
    each: true,
    message: 'Chaque rôle doit être une chaîne de caractères.',
  })
  @IsOptional()
  roles?: string[];

  @IsEnum(['ACTIF', 'INACTIF', 'BANNI'], {
    message: 'Le statut doit être ACTIF, INACTIF ou BANNI.',
  })
  @IsOptional()
  statut?: Statut;
}
