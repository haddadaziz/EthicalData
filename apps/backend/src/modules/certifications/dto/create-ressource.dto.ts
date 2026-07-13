import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsNumber,
    IsBoolean,
} from 'class-validator';

export class CreateRessourceDto {
    @IsString()
    @IsNotEmpty({ message: 'Le titre de la ressource est obligatoire.' })
    titre: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty({ message: 'Le type de la ressource (ex: PDF, SLIDES) est obligatoire.' })
    type: string;

    @IsString()
    @IsNotEmpty({ message: "L'URL du document est obligatoire." })
    url: string;

    @IsNumber({}, { message: 'La taille doit être un nombre.' })
    @IsOptional()
    taille?: number;

    @IsString()
    @IsOptional()
    version?: string;

    @IsNumber({}, { message: 'Le quota de téléchargement doit être un nombre.' })
    @IsOptional()
    quotaTelechargement?: number;

    @IsBoolean({ message: 'La visibilité publique doit être un booléen.' })
    @IsOptional()
    public?: boolean;

    @IsNumber({}, { message: 'La certification associée doit être un identifiant numérique.' })
    @IsOptional()
    certificationId?: number;

    @IsNumber({}, { message: 'Le cours associé doit être un identifiant numérique.' })
    @IsOptional()
    coursId?: number;
}