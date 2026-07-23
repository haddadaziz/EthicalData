import { IsNotEmpty } from 'class-validator';

export class UpdateSettingDto {
  @IsNotEmpty()
  valeur: string;
}
