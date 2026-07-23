import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsEnum,
  Min,
} from 'class-validator';

export enum StatutCours {
  BROUILLON = 'BROUILLON',
  PUBLIE = 'PUBLIE',
  ARCHIVE = 'ARCHIVE',
}

export class CreateCoursDto {
  @IsString()
  titre: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectifs?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequis?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  publicCible?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  dureeEstimee?: number;

  @IsOptional()
  @IsInt()
  certificationId?: number;

  @IsOptional()
  @IsEnum(StatutCours)
  statut?: StatutCours;
}
