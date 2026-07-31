import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';

export class UpdatePromotionDto {
  @IsString()
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['POURCENTAGE', 'MONTANT'])
  type?: 'POURCENTAGE' | 'MONTANT';

  @IsNumber()
  @IsOptional()
  @Min(0)
  valeur?: number;

  @IsString()
  @IsOptional()
  @IsIn(['FORMATION', 'VOUCHER', 'PACK_EXAMEN_BLANC'])
  targetType?: 'FORMATION' | 'VOUCHER' | 'PACK_EXAMEN_BLANC';

  @IsNumber()
  @IsOptional()
  targetId?: number;

  @IsString()
  @IsOptional()
  cibleNom?: string;

  @IsDateString()
  @IsOptional()
  dateDebut?: string;

  @IsDateString()
  @IsOptional()
  dateFin?: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
