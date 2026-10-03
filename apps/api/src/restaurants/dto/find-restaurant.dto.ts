import { Type } from "class-transformer";
import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from "class-validator";

export class FindRestaurantsDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    cuisineType?: string;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isOpen?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 20;
}