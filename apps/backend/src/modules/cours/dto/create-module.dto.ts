import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  titre: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contenu?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  ordre?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  dureeEstimee?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;
}
