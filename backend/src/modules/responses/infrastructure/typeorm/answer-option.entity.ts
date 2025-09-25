import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("answeroption")
export class AnswerOption {
  @PrimaryColumn({ type: "uuid" })
  answerId!: string;

  @PrimaryColumn({ type: "uuid" })
  optionId!: string;
}
