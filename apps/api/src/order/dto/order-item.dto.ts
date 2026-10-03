import { IsNotEmpty, IsUUID, Min, Max, IsInt } from "class-validator";

export class OrderItemDto {
    @IsUUID()
    @IsNotEmpty()
    menuItemId: string;

    @IsInt()
    @Min(1)
    @Max(50)
    quantity: number;
}