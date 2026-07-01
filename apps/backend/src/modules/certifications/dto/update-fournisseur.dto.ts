import { IsOptional, IsString } from 'class-validator';

export class UpdateFournisseurDto {
  @IsString()
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  image?: string;
}
