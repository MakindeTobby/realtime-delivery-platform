import { IsEmail } from 'class-validator';

export class CheckPartnerExistenceDto {
  @IsEmail()
  email: string;
}
