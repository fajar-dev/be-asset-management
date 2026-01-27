import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { Like, Repository } from 'typeorm';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Location } from '../location/entities/location.entity';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private configService: ConfigService,
  ) {}

  async crawl(token: string) {
      const branchRes = await axios.get(this.configService.getOrThrow('NUSAWORK_URL') + '/emp/api/branch', {
        headers: {
          Authorization: ' Bearer ' + token,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
      });
      const branches = branchRes.data.data;

      for (const b of branches) {
      await this.branchRepository.upsert(
        {
          id: b.id,
          idBranch: b.branch_id,
          name: b.name,
        },
        ['idBranch'],
      );
    }

      console.log(`Saved ${branches.length} branches`);
  }

  /**
   * Get all branch or search by full name
   * @param search - Optional name search string
   * @returns Promise<Employee[]> - Array of category entities matching the search criteria, if provided
   */
  async findAll(search?: string): Promise<Branch[]> {
    if (search) {
      return this.branchRepository.find({
        where: {
          name: Like(`%${search}%`)
        },
      });
    } else {
      return this.branchRepository.find();
    }
  }

  /**
   * Get all location by branch id
   * @param branchId - branch id search string
   * @returns Promise<Location[]> - Array of location entities matching the search criteria, if provided
   */
  async findLocation(branchId?: string): Promise<Location[]> {
    return this.locationRepository.find({
      where: {
        branchId: branchId
      },
    });
  }
}