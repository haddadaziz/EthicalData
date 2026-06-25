import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
  prenom: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  nom: string;

  @IsEmail({}, { message: "L'adresse e-mail n'est pas valide." })
  email: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @MinLength(8, { message: 'Le mot de passe doit faire au moins 8 caractères.' })
  motDePasse: string;

  @IsArray({ message: 'Les rôles doivent être transmis sous forme de tableau.' })
  @ArrayNotEmpty({ message: 'Au moins un rôle doit être attribué.' })
  @IsString({ each: true, message: 'Chaque rôle doit être une chaîne de caractères.' })
  roles: string[];
}