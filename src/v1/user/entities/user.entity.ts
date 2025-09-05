import { BaseEntity } from '../../../common/entities/base.entity';
import { Column, Entity } from "typeorm";

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', nullable: true })
  lastLoginIp: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
