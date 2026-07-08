import { IsString, IsOptional, IsInt, IsBoolean, IsEnum, Min } from 'class-validator';

export enum TypeRessource {
  PDF = 'PDF',
  VIDEO = 'VIDEO',
  SLIDE = 'SLIDE',
  DATASET = 'DATASET',
  LIEN_EXTERNE = 'LIEN_EXTERNE',
  EXERCICE = 'EXERCICE',
  AUTRE = 'AUTRE',
}

export class CreateModuleRessourceDto {
  @IsString()
  titre: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TypeRessource)
  type: TypeRessource;

  @IsString()
  url: string;

  @IsOptional()
  @IsInt()
  taille?: number;

  @IsOptional()
  @IsBoolean()
  public?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  ordre?: number;
}