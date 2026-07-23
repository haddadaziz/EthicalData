import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCommentaireDto {
  @IsString()
  @IsNotEmpty({ message: 'Le contenu du commentaire ne peut pas être vide.' })
  @MaxLength(5000, {
    message: 'Le commentaire ne peut pas dépasser 5 000 caractères.',
  })
  contenu: string;

  @IsOptional()
  @IsNumber()
  parentCommentaireId?: number;

  @IsOptional()
  @IsNumber()
  mentionUserId?: number;
}
