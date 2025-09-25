import { Controller, Get, Post, Body, Param, Delete,  Query, DefaultValuePipe, ParseIntPipe, ParseUUIDPipe, Put } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ResponseLocationDto } from './dto/response-location.dto';
import { Serialize } from '../../common/interceptor/serialize.interceptor';
import { User } from '../../common/decorator/auth-user.decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { Roles } from '../../common/decorator/role.decorator';
import { Role } from '../user/role.enum';

@Controller()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @Roles(Role.ADMIN)
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
  @Serialize(ResponseLocationDto)
  async findAll(
    @Query('all', new DefaultValuePipe(false)) all: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search', new DefaultValuePipe('')) search: string,
  ) {
    let data;
    if (all) {
      data = await this.locationService.findAll( search );
    } else {
      data = await this.locationService.paginate({ page, limit, search });
    }
    return new ApiResponse(
      all ? 'All locations retrieved successfully' : 'Locations retrieved successfully',
      data,
    )
  }
  
  @Get(':uuid')
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
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
  async remove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @User() user: UserEntity,
  ) {
    await this.locationService.remove(uuid, user.id);
    return new ApiResponse('Location removed successfully');
  }
}
