import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsIn,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre de la session est obligatoire.' })
  titre: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  dateDebut: string;

  @IsDateString()
  @IsOptional()
  dateFin?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  maxPlaces?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  placesOccupees?: number;

  @IsString()
  @IsOptional()
  @IsIn(['OUVERTE', 'COMPLETE', 'CLOTUREE'])
  statut?: 'OUVERTE' | 'COMPLETE' | 'CLOTUREE';

  @IsString()
  @IsOptional()
  teamsLink?: string;

  @IsInt()
  @IsOptional()
  coursId?: number | null;

  @IsInt()
  formateurId: number;
}
