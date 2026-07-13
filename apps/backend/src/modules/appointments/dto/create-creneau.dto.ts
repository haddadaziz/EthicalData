import { IsDateString, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateCreneauDto {
  @IsDateString({}, { message: 'La date de début doit être une date valide.' })
  @IsNotEmpty({ message: 'La date de début est obligatoire.' })
  dateDebut: string;

  @IsDateString({}, { message: 'La date de fin doit être une date valide.' })
  @IsNotEmpty({ message: 'La date de fin est obligatoire.' })
  dateFin: string;

  @IsOptional()
  @IsInt({ message: 'L\'ID du formateur doit être un nombre entier.' })
  @Min(1, { message: 'L\'ID du formateur est invalide.' })
  formateurId?: number;
}