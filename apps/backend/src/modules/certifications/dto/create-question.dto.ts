import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty({ message: "L'énoncé de la question est obligatoire." })
  enonce: string;

  @IsString()
  @IsOptional()
  explication?: string;

  @IsString()
  @IsNotEmpty({ message: "La réponse correcte ou la réponse modèle est obligatoire." })
  reponseCorrecte: string;

  @IsString()
  @IsOptional()
  grilleNotation?: string;

  @IsString()
  @IsOptional()
  categorie?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsArray()
  @IsOptional()
  options?: { lettre: string; texte: string }[];
}