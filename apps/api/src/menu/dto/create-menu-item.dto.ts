import { IsNumberString, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateMenuItemDto {
    @IsUUID()
    categoryId!: string;

    @IsString()
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumberString() // Price comes  as a string e.g. "7.99" - to match numeric DB type
    price!: string;

    @IsString()
    @IsOptional()
    imageUrl?: string; // set after uploadthing upload
}