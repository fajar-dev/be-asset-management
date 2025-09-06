import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeders/seeder.module';
import { UserSeeder } from './seeders/user.seeder';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeederModule);
  const seeder = appContext.get(UserSeeder);

  await seeder.run();

  await appContext.close();
}

bootstrap();
