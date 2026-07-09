import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateSimulationDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre de la simulation est obligatoire.' })
  titre: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  duree?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  scoreMinimal?: number;

  @IsNumber()
  @IsNotEmpty({ message: 'La certification est obligatoire.' })
  certificationId: number;
}
