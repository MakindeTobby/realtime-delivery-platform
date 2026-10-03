import { Transform } from "class-transformer";
import { IsString, IsNotEmpty, MinLength } from "class-validator";

export class CreateCategoryDto {
    @Transform(({ value }: { value: string }) => value.trim())
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    name!: string;

}