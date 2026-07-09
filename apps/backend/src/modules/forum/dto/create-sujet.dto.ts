import { IsNotEmpty, IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';

export class CreateSujetDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre du sujet est obligatoire.' })
  @MaxLength(200, { message: 'Le titre ne peut pas dépasser 200 caractères.' })
  titre: string;

  @IsString()
  @IsNotEmpty({ message: 'Le contenu du sujet ne peut pas être vide.' })
  @MaxLength(10000, { message: 'Le contenu ne peut pas dépasser 10 000 caractères.' })
  contenu: string;

  @IsString()
  @IsNotEmpty({ message: 'Le thème est obligatoire (ex: Azure, Cybersécurité).' })
  theme: string;

  @IsNumber({}, { message: 'L\'identifiant de la certification doit être un nombre.' })
  @IsOptional()
  certificationId?: number;
}