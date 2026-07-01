import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { Niveau } from '@prisma/client';

export class UpdateCertificationDto {
  @IsString()
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  codeExamen?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'])
  @IsOptional()
  niveau?: Niveau;

  @IsString()
  @IsOptional()
  dureeIndicative?: string;

  @IsNumber()
  @IsOptional()
  fournisseurId?: number;

  @IsString()
  @IsOptional()
  image?: string;
}
