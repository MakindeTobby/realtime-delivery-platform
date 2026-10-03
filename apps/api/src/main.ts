import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/index.js';
import { createRouteHandler } from 'uploadthing/express';
import { createUploadRouter } from './uploadthing/upload-router';
import { NestExpressApplication } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import type { Database } from './db';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true
  });
  const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0);
  app.getHttpAdapter().getInstance().set('trust proxy', trustProxyHops);
  app.enableCors();
  app.setGlobalPrefix('api'); // /api/hello
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

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
