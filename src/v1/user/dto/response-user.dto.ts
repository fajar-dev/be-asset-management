import { Exclude, Expose, Type } from 'class-transformer';

export class ResponseUserDto {
  @Expose() 
  id: number;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  isActive: boolean;

  @Expose()
  lastLoginAt: Date | null;

  @Expose()
  lastLoginIp: string | null;

  @Expose()
  phoneNumber: string | null;
}