import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateCommentaireDto {
  @IsString()
  @IsNotEmpty({ message: 'Le contenu du commentaire ne peut pas être vide.' })
  contenu: string;

  @IsOptional()
  @IsNumber()
  parentCommentaireId?: number;
}