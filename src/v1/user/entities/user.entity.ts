import { BaseEntity } from '../../../common/entities/base.entity';
import { BeforeInsert, Column, Entity, Index, OneToMany } from "typeorm";
import { v7 as uuidv7 } from 'uuid';
import { Role } from '../enum/role.enum';
import { Feedback } from 'src/feedback/entities/feedback.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'user_uuid', type: 'char', length: 36, unique: true })
  userUuid: string;

  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', nullable: true })
  lastLoginIp: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    name: 'role',
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];

  @BeforeInsert()
  async generateUuid() {
    this.userUuid = uuidv7();
  }
}
