import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  ArrayMinSize,
} from 'class-validator';
import { Niveau } from '@prisma/client';

export class CreateCertificationDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom de la certification est obligatoire.' })
  nom: string;

  @IsString()
  @IsOptional()
  codeExamen?: string;

  @IsString()
  @IsNotEmpty({ message: 'La description est obligatoire.' })
  description: string;

  @IsEnum(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'], {
    message: 'Le niveau doit être DEBUTANT, INTERMEDIAIRE ou AVANCE.',
  })
  niveau: Niveau;

  @IsString()
  @IsOptional()
  dureeIndicative?: string;

  @IsNumber({}, { message: 'Le fournisseurId doit être un nombre.' })
  @IsNotEmpty({ message: 'Le fournisseur est obligatoire.' })
  fournisseurId: number;

  @IsNumber()
  @IsOptional()
  categorieId?: number;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsOptional()
  objectifs?: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsOptional()
  prerequis?: string[];

  @IsString()
  @IsOptional()
  image?: string;
}
