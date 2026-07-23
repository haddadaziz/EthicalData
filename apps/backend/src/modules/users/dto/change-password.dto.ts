import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: "L'ancien mot de passe est obligatoire." })
  oldPassword: string;

  @IsString()
  @MinLength(8, {
    message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
  })
  newPassword: string;
}
