import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import { Response as Resp } from "./response.entity.js";

@Entity("answer")
export class Answer {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  responseId!: string;

  @ManyToOne(() => Resp, { onDelete: "CASCADE" })
  @JoinColumn({ name: "responseId" })
  response!: Resp;

  @Column({ type: "uuid" })
  questionId!: string;

  @Column({ type: "text", nullable: true })
  valueText?: string;

  @Column({ type: "double precision", nullable: true })
  valueNumber?: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
