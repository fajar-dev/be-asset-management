import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { customValidationPipe } from './common/pipes/validation.pipe';
import { ResponseInterceptor } from './common/response/response.interceptor';
import { useContainer } from 'class-validator';
import { AppSingleton } from './common/singleton/app.singleton';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.set('trust proxy', true);
  app.useGlobalPipes(customValidationPipe());
  app.enableCors();
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Asset Management')
    .setDescription('Backend service for the Asset Management System')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  AppSingleton.setInstance(app);
  await app.listen(3000);
}
bootstrap();
