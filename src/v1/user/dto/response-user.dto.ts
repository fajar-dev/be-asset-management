import { Expose } from 'class-transformer';
import { Role } from '../enum/role.enum';

export class ResponseUserDto {
  @Expose({ name: 'userUuid' }) 
  id: number;

  @Expose()
  employeeId: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  avatar: string;

  @Expose()
  isActive: boolean;

  @Expose()
  lastLoginAt: Date | null;

  @Expose()
  lastLoginIp: string | null;

  @Expose()
  phoneNumber: string | null;

  @Expose()
  role: Role;
}