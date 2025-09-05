import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { customValidationPipe } from './common/pipes/validation.pipe';
import { ResponseInterceptor } from './common/response/response.interceptor';
import { useContainer } from 'class-validator';
import { AppSingleton } from './common/singleton/app.singleton';
import { V1Module } from './v1/v1.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('v1');
  app.set('trust proxy', true);
  app.useGlobalPipes(customValidationPipe());
  app.enableCors();
  app.useGlobalInterceptors(new ResponseInterceptor());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  AppSingleton.setInstance(app);
  await app.listen(3000);
}
bootstrap();
