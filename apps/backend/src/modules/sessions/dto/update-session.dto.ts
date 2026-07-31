import {
  IsString,
  IsOptional,
  IsInt,
  IsIn,
  IsDateString,
  Min,
} from 'class-validator';

export class UpdateSessionDto {
  @IsString()
  @IsOptional()
  titre?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dateDebut?: string;

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
  @IsOptional()
  formateurId?: number;
}
