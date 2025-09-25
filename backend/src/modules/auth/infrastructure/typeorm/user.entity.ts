import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import UserRole from "../../domain/user.role";

@Entity("user")
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ type: "varchar", length: 255 }) email!: string;
  @Column({ type: "varchar", length: 255 }) passwordHash!: string;
  @Column({ type: "enum", enum: UserRole, default: UserRole.EDITOR })
  role!: UserRole;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
