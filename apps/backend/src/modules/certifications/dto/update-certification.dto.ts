import { IsOptional, IsString, IsEnum, IsNumber, IsArray } from 'class-validator';
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

  @IsNumber()
  @IsOptional()
  categorieId?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  objectifs?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prerequis?: string[];

  @IsString()
  @IsOptional()
  image?: string;
}
