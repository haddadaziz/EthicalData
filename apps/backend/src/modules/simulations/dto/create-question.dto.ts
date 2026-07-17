import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OptionDto {
  @IsString()
  @IsNotEmpty()
  lettre: string;

  @IsString()
  @IsNotEmpty()
  texte: string;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty({ message: "L'énoncé de la question est obligatoire." })
  enonce: string;

  @IsOptional()
  @IsString()
  explication?: string;

  @IsOptional()
  @IsString()
  reponseCorrecte?: string;

  @IsOptional()
  @IsString()
  grilleNotation?: string;

  @IsOptional()
  @IsString()
  categorie?: string;

  @IsOptional()
  @IsString()
  type?: string; // QCM, CAS_PRATIQUE, VRAI_FAUX...

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: OptionDto[];
}
