import {
  Entity,
  Column,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('categories')
export class Category extends BaseEntity {

  @Column({ name:'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name:'has_location', type: 'boolean', default: false })
  hasLocation: boolean;

  @Column({ name:'has_maintenance', type: 'boolean', default: false })
  hasMaintenance: boolean;

  @Column({ name:'has_holder', type: 'boolean', default: false })
  hasHolder: boolean;
}
