import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { User } from "../../../auth/infrastructure/typeorm/user.entity.js";
import SurveyStatus from "../../domain/survey.status.js";

@Entity("survey")
@Unique(["publicId"])
export class Survey {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ type: "varchar" }) publicId!: string;
  @Column({ type: "varchar" }) title!: string;
  @Column({ type: "varchar", nullable: true }) description?: string;
  @Column({ type: "enum", enum: SurveyStatus, default: SurveyStatus.DRAFT })
  status!: SurveyStatus;
  @Column({ type: "boolean", default: true }) isAnonymous!: boolean;
  @Column({ type: "timestamptz", nullable: true }) startAt?: Date;
  @Column({ type: "timestamptz", nullable: true }) endAt?: Date;
  @ManyToOne(() => User, { nullable: true }) createdBy?: User;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
