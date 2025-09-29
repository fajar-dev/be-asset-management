import { BaseEntity } from "../../../common/entities/base.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { Employee } from "../../../v1/employee/entities/employee.entity";
import { Location } from "../../../v1/location/entities/location.entity";

@Entity("branches")
export class Branch extends BaseEntity {
  @Column({ name: "id_branch", type: "char", length: 36, unique: true })
  idBranch: string;

  @Column({ name: "name", type: "varchar", length: 255 })
  name: string;

  @OneToMany(() => Employee, (employee) => employee.branch)
  employees: Employee[];

  @OneToMany(() => Location, (location) => location.branch)
  locations: Location[];
}
