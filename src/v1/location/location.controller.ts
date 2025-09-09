import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, DefaultValuePipe, ParseIntPipe, ParseUUIDPipe, Put } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from 'src/auth/guards/JwtAuthGuard';
import { ResponseLocationDto } from './dto/response-location.dto';
import { Serialize } from 'src/common/interceptor/serialize.interceptor';
import { User } from 'src/common/decorator/auth-user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { ApiResponse } from 'src/common/utils/ApiResponse';

@Controller()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  
  @UseGuards(JwtAuthGuard)
  @Post()
  @Serialize(ResponseLocationDto)
  async create(
    @User() user: UserEntity,
    @Body() CreateLocationDto: CreateLocationDto,
  ) {
    return new ApiResponse(
      'Location created successfully',
      await this.locationService.create(user.id, CreateLocationDto),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseLocationDto)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    return new ApiResponse(
      'Locations retrieved successfully',
      await this.locationService.paginate({ page, limit, search }),
    );
  }
  
  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseLocationDto)
  async findOne(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    return new ApiResponse(
      'Location fetched successfully',
      await this.locationService.findOne(uuid),
    );
  }

  @Put(':uuid')
  @UseGuards(JwtAuthGuard)
  @Serialize(ResponseLocationDto)
  async update(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
    @Body() UpdateLocationDto: UpdateLocationDto,
  ) {
    return new ApiResponse(
      'Location updated successfully',
      await this.locationService.update(uuid, user.id, UpdateLocationDto),
    );
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
  ) {
    await this.locationService.remove(uuid, user.id);
    return new ApiResponse('Location removed successfully');
  }
}
