import { Controller, Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { UserModule } from './user/user.module';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { SubCategoryModule } from './sub-category/sub-category.module';
import { AssetPropertyModule } from './asset-property/asset-property.module';
import { AssetModule } from './asset/asset.module';
import { AssetPropertyValueModule } from './asset-property-value/asset-property-value.module';
import { AssetMaintenanceModule } from './asset-maintenance/asset-maintenance.module';
import { AssetHolderModule } from './asset-holder/asset-holder.module';
import { LocationModule } from './location/location.module';
import { AssetLocationModule } from './asset-location/asset-location.module';
import { AssetNoteModule } from './asset-note/asset-note.module';
import { StatisticModule } from './statistic/statistic.module';
import { EmployeeModule } from './employee/employee.module';
import { BranchModule } from './branch/branch.module';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { RolesGuard } from '../auth/guards/role.guard';

@Module({
  imports: [
    UserModule,
    StatisticModule,
    CategoryModule,
    SubCategoryModule,
    AssetPropertyModule,
    LocationModule,
    AssetModule,
    AssetPropertyValueModule,
    AssetMaintenanceModule,
    AssetHolderModule,
    AssetLocationModule,
    AssetNoteModule,
    EmployeeModule,
    BranchModule,
    RouterModule.register([
      {
        path: 'v1',
        children: [
          {
            path: '/statistic',
            module: StatisticModule,
          },
          {
            path: '/location',
            module: LocationModule
          },
          {
            path: '/category',
            module: CategoryModule
          },
          {
            path: '/branch',
            module: BranchModule
          },
          {
            path: '/employee',
            module: EmployeeModule
          },
          {
            path: '/sub-category',
            module: SubCategoryModule,
          },
          {
            path: '/sub-category/:subCategoryUuid/property',
            module: AssetPropertyModule,
          },
          {
            path: '/asset',
            module: AssetModule,
          },
          {
            path: '/asset/:assetUuid/holder',
            module: AssetHolderModule,
          },
          {
            path: '/asset/:assetUuid/maintenance',
            module: AssetMaintenanceModule,
          },
          {
            path: '/asset/:assetUuid/location',
            module: AssetLocationModule
          },
          {
            path: '/asset/:assetUuid/note',
            module: AssetNoteModule
          },
        ],
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class V1Module {}

