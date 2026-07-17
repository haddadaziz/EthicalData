import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  nom: string;

  @IsEmail({}, { message: "L'adresse e-mail est invalide." })
  @IsNotEmpty({ message: "L'adresse e-mail est obligatoire." })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le sujet est obligatoire.' })
  sujet: string;

  @IsString()
  @IsNotEmpty({ message: 'Le message est obligatoire.' })
  message: string;
}
