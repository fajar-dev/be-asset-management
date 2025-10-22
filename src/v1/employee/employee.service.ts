import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Employee } from './entities/employee.entity';
import { sanitizeText } from '../../common/helpers/sanitize.helper';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly configService: ConfigService,
  ) {}

  async crawl() {
    const res = await axios.post(
      this.configService.getOrThrow('NUSAWORK_URL') +
        '/v4.2/client/employee/filter',
      {
        fields: { active_status: ['active'] },
        is_paginate: false,
        multi_value: false,
        currentPage: 1,
      },
      {
        headers: {
          Authorization:
            'Bearer ' + this.configService.getOrThrow('NUSAWORK_TOKEN'),
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );

    const employees = res.data.data;

    for (const e of employees) {
      await this.employeeRepository.upsert(
        {
          id: e.user_id,
          idEmployee: sanitizeText(e.employee_id),
          branchId: sanitizeText(e.branch_id),
          fullName: sanitizeText(e.full_name),
          jobPosition: sanitizeText(e.job_position),
          email: sanitizeText(e.email),
          mobilePhone: sanitizeText(e.mobile_phone),
          photoProfile: sanitizeText(e.photo_profile),
        },
        ['idEmployee'],
      );
    }

    console.log(`✅ Saved ${employees.length} employees`);
  }

  /**
   * Get all employee or search by full name
   * @param search - Optional name search string
   * @returns Promise<Employee[]> - Array of category entities matching the search criteria, if provided
   */
  async findAll(search?: string): Promise<Employee[]> {
    if (search) {
      return this.employeeRepository.find({
        where: {
          fullName: Like(`%${search}%`)
        },
      });
    } else {
      return this.employeeRepository.find();
    }
  }
}
