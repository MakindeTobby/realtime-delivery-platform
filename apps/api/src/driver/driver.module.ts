import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module';
import { GatewayModule } from '../gateway/gateway.module';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';



@Module({
    imports: [AuthModule, GatewayModule],
    controllers: [DriverController],
    providers: [DriverService],
    exports: [DriverService], // orderService needs to inject this 
})

export class DriverModule { };