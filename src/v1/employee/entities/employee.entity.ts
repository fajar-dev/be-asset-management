import { BaseEntity } from "../../../common/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { AssetHolder } from "../../../v1/asset-holder/entities/asset-holder.entity";
import { User } from "../../../v1/user/entities/user.entity";
import { Branch } from "../../../v1/branch/entities/branch.entity";

@Entity("employees")
export class Employee extends BaseEntity {
  @Column({ name: "id_employee", type: "char", length: 36, unique: true })
  idEmployee: string;

  @Column({ name: "branch_id", type: "char", length: 36 })
  branchId: string;

  @Column({ name: "full_name", type: "varchar", length: 255 })
  fullName: string;

  @Column({ name: "job_position", type: "varchar", length: 255 })
  jobPosition: string;

  @Column({ name: "email", type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ name: "mobile_phone", type: "varchar", length: 255, nullable: true })
  mobilePhone: string;

  @Column({ name: "photo_profile", type: "varchar", length: 255, nullable: true })
  photoProfile: string;

  @Column({ name: "job_level", type: "varchar", length: 255 })
  jobLevel: string;

  @Column({ name: "organization_name", type: "varchar", length: 255 })
  organizationName: string;

  @Column({ name: "status_join", type: "char", length: 36 })
  statusJoin: string;

  @ManyToOne(() => Branch, (branch) => branch.employees)
  @JoinColumn({ name: "branch_id", referencedColumnName: "idBranch" }) 
  branch: Branch;

  @OneToMany(() => AssetHolder, (holder) => holder.employee)
  assetHolders: AssetHolder[];

  @OneToMany(() => User, (user) => user.employee)
  users: User[];
}
