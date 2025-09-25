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
import { Question } from "./question.entity.js";

@Entity("option")
@Unique("uq_option_order", ["questionId", "order"])
export class Option {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  questionId!: string;

  @ManyToOne(() => Question, { onDelete: "CASCADE" })
  @JoinColumn({ name: "questionId" })
  question!: Question;

  @Column({ type: "int" })
  order!: number;

  @Column({ type: "varchar" })
  label!: string;

  @Column({ type: "varchar" })
  value!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
