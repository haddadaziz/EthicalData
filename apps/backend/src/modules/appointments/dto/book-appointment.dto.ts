import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum TypeRendezVousEnum {
  ORIENTATION = 'ORIENTATION',
  COACHING_TECHNIQUE = 'COACHING_TECHNIQUE',
  PREPARATION_EXAMEN = 'PREPARATION_EXAMEN',
  BILAN_CARRIERE = 'BILAN_CARRIERE',
}

export class BookAppointmentDto {
  @IsNumber({}, { message: "L'ID du créneau doit être un nombre." })
  @IsNotEmpty({ message: 'Le créneau est obligatoire.' })
  creneauId: number;

  @IsEnum(TypeRendezVousEnum, { message: 'Type de rendez-vous invalide.' })
  type: TypeRendezVousEnum;

  @IsOptional()
  @IsString()
  motif?: string;
}
