import {
  Entity,
  Column,
  BeforeInsert,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { v7 as uuidv7 } from 'uuid';

@Entity('categories')
export class Category extends BaseEntity {
  @Index()
  @Column({ name: 'category_uuid', type: 'char', length: 36, unique: true })
  categoryUuid: string;

  @Index()
  @Column({ name:'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name:'has_location', type: 'boolean', default: false })
  hasLocation: boolean;

  @Column({ name:'has_maintenance', type: 'boolean', default: false })
  hasMaintenance: boolean;

  @Column({ name:'has_holder', type: 'boolean', default: false })
  hasHolder: boolean;

  @BeforeInsert()
    async generateUuid() {
      this.categoryUuid = uuidv7();
    }
}
