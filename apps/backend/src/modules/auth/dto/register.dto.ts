import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
  prenom: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  nom: string;

  @IsEmail({}, { message: "L'adresse e-mail n'est pas valide." })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @MinLength(8, {
    message: 'Le mot de passe doit faire au moins 8 caractères.',
  })
  motDePasse: string;
}
