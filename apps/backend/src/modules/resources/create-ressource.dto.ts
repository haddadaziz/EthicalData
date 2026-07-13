import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRessourceDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire.' })
  titre: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Le type de ressource est obligatoire.' })
  type: string; // PDF, SLIDES, DATASET, EXERCICE...

  @IsString()
  @IsNotEmpty({ message: "L'URL du fichier est obligatoire." })
  url: string;

  @IsOptional()
  @IsNumber()
  taille?: number;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsNumber()
  quotaTelechargement?: number;

  @IsOptional()
  @IsBoolean()
  public?: boolean;

  @IsOptional()
  @IsNumber()
  certificationId?: number;

  @IsOptional()
  @IsNumber()
  coursId?: number;
}