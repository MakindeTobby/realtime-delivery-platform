import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @IsString()
  restaurantId!: string;

  @IsOptional()
  @IsUUID()
  addressId?: string;

  // Keep the existing free-text checkout contract. Clients can instead send
  // addressId to snapshot a saved address and its coordinates onto the order.
  @ValidateIf((dto: CreateOrderDto) => !dto.addressId)
  @IsString()
  deliveryAddress?: string;

  @ValidateIf((dto: CreateOrderDto) => !dto.addressId)
  @IsString()
  deliveryCity?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}
