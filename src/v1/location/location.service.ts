import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  /**
   * Create a new location
   * @param userId - ID of the user creating the location
   * @param createLocationDto - DTO containing data to create a location
   * @returns Promise<Location> - the created location entity
   */
  async create(userId: number, createLocationDto: CreateLocationDto): Promise<Location> {
    const location = this.locationRepository.create({
      name: createLocationDto.name,
      branch: createLocationDto.branch,
      createdBy: userId,
    });
    return this.locationRepository.save(location);
  }

  /**
   * Find a location by UUID
   * @param id - UUID of the location
   * @returns Promise<Location> - the found location entity
   * @throws NotFoundException if location is not found
   */
  findOne(id: string): Promise<Location> {
    return this.locationRepository.findOneOrFail({
      where: {
        locationUuid: id,
      },
    });
  }

  /**
   * Paginate locations with optional search
   * @param options - Pagination options plus optional search string
   * @returns Promise<Pagination<Location>> - paginated result of locations
   */
  async paginate(
    options: IPaginationOptions & { search?: string },
  ): Promise<Pagination<Location>> {
    const queryBuilder = this.locationRepository.createQueryBuilder('locations');
    if (options.search) {
      queryBuilder.andWhere('locations.name LIKE :search', {
        search: `%${options.search}%`,
      });
    }
    return paginate<Location>(queryBuilder, {
      limit: options.limit || 10,
      page: options.page || 1,
    });
  }

  /**
   * Update a location by UUID
   * @param uuid - UUID of the location to update
   * @param userId - ID of the user updating the location
   * @param updateLocationDto - DTO containing updated location data
   * @returns Promise<Location> - the updated location entity
   * @throws NotFoundException if location is not found
   */
  async update(
    uuid: string,
    userId: number,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location = await this.locationRepository.findOneOrFail({
      where: {
        locationUuid: uuid,
      },
    });
    location.name = updateLocationDto.name;
    location.branch = updateLocationDto.branch;
    location.updatedBy = userId;
    return this.locationRepository.save(location);
  }

  /**
   * Soft delete a location by UUID
   * @param uuid - UUID of the location to delete
   * @param userId - ID of the user performing the deletion
   * @returns Promise<Location> - the soft-deleted location entity
   * @throws NotFoundException if location is not found
   */
  async remove(uuid: string, userId: number) {
    const location = await this.locationRepository.findOneOrFail({
      where: { locationUuid: uuid },
    });
    location.deletedBy = userId;
    await this.locationRepository.save(location);
    return await this.locationRepository.softRemove(location);
  }
}