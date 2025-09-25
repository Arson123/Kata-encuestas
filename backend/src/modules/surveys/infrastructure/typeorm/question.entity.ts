import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  JoinColumn,
} from "typeorm";
import { Survey } from "./survey.entity.js";

export enum QuestionType {
  TEXT = "TEXT",
  SCALE = "SCALE",
  SINGLE = "SINGLE",
  MULTI = "MULTI",
}

@Entity("question")
@Unique("uq_question_order", ["surveyId", "order"])
export class Question {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  surveyId!: string;

  @ManyToOne(() => Survey, { onDelete: "CASCADE" })
  @JoinColumn({ name: "surveyId" })
  survey!: Survey;

  @Column({ type: "int" })
  order!: number;

  @Column({ type: "enum", enum: QuestionType })
  type!: QuestionType;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "varchar", nullable: true })
  helpText?: string;

  @Column({ type: "boolean", default: false })
  required!: boolean;

  @Column({ type: "int", nullable: true })
  scaleMin?: number;

  @Column({ type: "int", nullable: true })
  scaleMax?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
