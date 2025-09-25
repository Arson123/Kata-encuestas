import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Survey } from "../../../surveys/infrastructure/typeorm/survey.entity.js";

@Entity("response")
export class Response {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  surveyId!: string;

  @ManyToOne(() => Survey, { onDelete: "CASCADE" })
  @JoinColumn({ name: "surveyId" })
  survey!: Survey;

  @Column({ type: "varchar", nullable: true })
  respondentId?: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @Column({ type: "varchar", nullable: true })
  ipHash?: string;

  @Column({ type: "varchar", nullable: true })
  userAgent?: string;

  @Column({ type: "jsonb", nullable: true })
  meta?: Record<string, unknown>;
}
