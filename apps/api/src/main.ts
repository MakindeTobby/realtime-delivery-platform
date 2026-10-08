import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/index.js';
import { createRouteHandler } from 'uploadthing/express';
import { createUploadRouter } from './uploadthing/upload-router';
import { NestExpressApplication } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import type { Database } from './db';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true
  });
  const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0);
  const expressApp = app.getHttpAdapter().getInstance() as unknown as {
    set: (setting: string, value: number) => void;
  };
  expressApp.set('trust proxy', trustProxyHops);
  app.enableCors();
  app.setGlobalPrefix('api'); // /api/hello
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Food Delivery API')
    .setDescription(
      'HTTP API for customer accounts, restaurant onboarding and menus, orders, driver operations, payments, and administration. Authenticated endpoints use a JWT access token in the Authorization header.\n\nThe Socket.IO namespace `/orders` uses the same Bearer token in the Authorization header. Clients can emit `join:order` with an order ID, `join:restaurant` with a restaurant ID, or `join:driver` with the driver user ID. The server emits `order:updated` and `driver:assigned` events.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    useGlobalPrefix: true,
    jsonDocumentUrl: 'docs-json',
    swaggerOptions: { persistAuthorization: true },
  });

  const uploadRouter = createUploadRouter(app.get(JwtService), app.get<Database>('DB'));

  app.use('/api/uploadthing', createRouteHandler({
    router: uploadRouter, config: {
      token: process.env.UPLOADTHING_TOKEN
    }
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`API is running on port: ${port}`);
}
bootstrap();
