import { Controller, Post, Body, UseGuards} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { JwtAuthGuard } from '../../auth/guards/JwtAuthGuard';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { ApiResponse } from 'src/common/utils/ApiResponse';
import { User } from '../../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { ResponseAssetDto } from './dto/response-asset.dto';

@Controller()
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @Serialize(ResponseAssetDto)
  async create(
    @Body() createAssetDto: CreateAssetDto,
    @User() user: UserEntity,
  ) {
    return new ApiResponse(
      'Asset Property created successfully',
      await this.assetService.create(user.id, createAssetDto),
    );
  }

}
