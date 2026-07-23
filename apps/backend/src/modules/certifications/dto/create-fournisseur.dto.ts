import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFournisseurDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom du fournisseur est obligatoire.' })
  nom: string;

  @IsString()
  @IsOptional()
  image?: string;
}
