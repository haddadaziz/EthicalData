import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsIn,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom de la promotion est obligatoire.' })
  nom: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['POURCENTAGE', 'MONTANT'])
  type: 'POURCENTAGE' | 'MONTANT';

  @IsNumber()
  @Min(0)
  valeur: number;

  @IsString()
  @IsIn(['FORMATION', 'VOUCHER', 'PACK_EXAMEN_BLANC'])
  targetType: 'FORMATION' | 'VOUCHER' | 'PACK_EXAMEN_BLANC';

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
