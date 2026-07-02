import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateSujetDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre du sujet est obligatoire.' })
  titre: string;

  @IsString()
  @IsNotEmpty({ message: 'Le contenu du sujet ne peut pas être vide.' })
  contenu: string;

  @IsString()
  @IsNotEmpty({ message: 'Le thème est obligatoire (ex: Azure, Cybersécurité).' })
  theme: string;

  @IsNumber({}, { message: 'L\'identifiant de la certification doit être un nombre.' })
  @IsOptional()
  certificationId?: number;
}