import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenuModule } from './menu/menu.module';
import { validateEnvironment } from './config/environment';
import { OrdersModule } from './order/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { GatewayModule } from './gateway/gateway.module';
import { DriverModule } from './driver/driver.module';
import { AdminModule } from './admin/admin.module';
import { AddressesModule } from './addresses/addresses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnvironment,
    }),
    DbModule,
    AuthModule,
    RestaurantsModule,
    MenuModule,
    OrdersModule,
    PaymentsModule,
    GatewayModule,
    DriverModule,
    AddressesModule,
     AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
