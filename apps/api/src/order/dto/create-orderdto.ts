import { IsArray, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { OrderItemDto } from './order-item.dto'

export class CreateOrderDto {
    @IsString()
    restaurantId!: string

    @IsString()
    deliveryAddress!: string

    @IsArray()
    @ValidateNested({ each: true }) // validates each item in the array againt OrderItemDto
    @Type(() => OrderItemDto)
    items!: OrderItemDto[];

}