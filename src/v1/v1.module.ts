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
import { CategoryGuard } from '../common/guards/category.guard';

@Module({
  imports: [
    UserModule,
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
    RouterModule.register([
      {
        path: 'v1',
        children: [
          {
            path: '/',
            module: UserModule,
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
      useClass: CategoryGuard,
    },
  ],
})
export class V1Module {}

