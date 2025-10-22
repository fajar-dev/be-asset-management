import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EmployeeService } from '../v1/employee/employee.service';
import { BranchService } from '../v1/branch/branch.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  try {
    const branchService = appContext.get(BranchService);
    const employeeService = appContext.get(EmployeeService);

    console.log('Crawling branches...');
    await branchService.crawl();

    console.log('Crawling employees...');
    await employeeService.crawl();

    console.log('Crawl completed successfully.');
  } catch (error) {
    console.error('Error during crawling:', error);
  } finally {
    await appContext.close();
  }
}

bootstrap();
