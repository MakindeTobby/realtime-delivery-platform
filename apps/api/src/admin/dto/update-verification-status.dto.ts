import { IsEnum } from 'class-validator';
import { verificationStatusEnum } from '../../db/schema/verification';

export class UpdateVerificationStatusDto {
  @IsEnum(verificationStatusEnum.enumValues)
  status: (typeof verificationStatusEnum.enumValues)[number];
}
