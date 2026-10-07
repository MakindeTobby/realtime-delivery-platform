import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RestaurantOnboardingDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  restaurantName!: string;

  @IsString()
  @IsNotEmpty()
  cuisineType!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(500)
  description!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
