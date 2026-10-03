import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { GatewayModule } from '../gateway/gateway.module';
import { DriverModule } from '../driver/driver.module';



@Module({
    imports: [AuthModule, GatewayModule, DriverModule],
    controllers: [OrdersController],
    providers: [OrdersService]
})

export class OrdersModule { };