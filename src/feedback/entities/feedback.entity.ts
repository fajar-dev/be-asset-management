import { BaseEntity } from "../../common/entities/base.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Status, Type } from "../enum/feedback.enum";
import { User } from "src/v1/user/entities/user.entity";
import { v7 as uuidv7 } from 'uuid';

@Entity('feedbacks')
export class Feedback extends BaseEntity {
  @Column({ name: 'feedback_uuid', type: 'char', length: 36, unique: true })
  feedbackUuid: string;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({
    name: 'type',
    type: 'enum',
    enum: Type,
  })
  type: Type;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: Status,
  })
  status: Status;

  @Column({ type: 'json', nullable: false })
  imagePaths: string[];

  @ManyToOne(() => User, (user) => user.feedbacks)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @BeforeInsert()
  async generateUuid() {
    this.feedbackUuid = uuidv7();
  }
}
