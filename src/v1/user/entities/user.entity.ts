import { BaseEntity } from '../../../common/entities/base.entity';
import { BeforeInsert, Column, Entity, Index } from "typeorm";
import { v7 as uuidv7 } from 'uuid';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'user_uuid', type: 'char', length: 36, unique: true })
  userUuid: string;

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

  @BeforeInsert()
  async generateUuid() {
    this.userUuid = uuidv7();
  }
}
