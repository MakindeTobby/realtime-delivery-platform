import { OrderStatus } from '@food-delivery/types'
import type { OrderStatusType } from '@food-delivery/types'
import { IsEnum } from 'class-validator'

export class UpdateStatusDto {
    @IsEnum(OrderStatus) // only accepts valid OrderStatus values
    status: OrderStatusType
}