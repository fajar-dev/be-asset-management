import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EmployeeService } from '../v1/employee/employee.service';
import { BranchService } from '../v1/branch/branch.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  try {
    const branchService = appContext.get(BranchService);
    const employeeService = appContext.get(EmployeeService);
    const configService = appContext.get(ConfigService);

    console.log('get token...');
    const token = await nusaworkToken(configService);

    console.log('Crawling branches...');
    await branchService.crawl(token);

    console.log('Crawling employees...');
    await employeeService.crawl(token);

  } catch (error) {
    console.error('Error during crawling:', error);
  } finally {
    await appContext.close();
  }
}

async function nusaworkToken(configService: ConfigService): Promise<string> {
  const baseUrl = configService.get<string>('NUSAWORK_URL');
  const clientId = configService.get<string>('NUSAWORK_CLIENT_ID');
  const clientSecret = configService.get<string>('NUSAWORK_CLIENT_SECRET');

  const res = await axios.post(
    `${baseUrl}/auth/api/oauth/token`,
    {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  return res.data.access_token;
}

bootstrap();
