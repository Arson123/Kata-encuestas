import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1710000000001 implements MigrationInterface {
  name = "Init1710000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM ('ADMIN','EDITOR','VIEWER')`);
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" varchar(255) NOT NULL,
        "passwordHash" varchar(255) NOT NULL,
        "role" "public"."user_role_enum" NOT NULL DEFAULT 'EDITOR',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`CREATE TYPE "public"."survey_status_enum" AS ENUM ('DRAFT','PUBLISHED','CLOSED')`);
    await queryRunner.query(`
      CREATE TABLE "survey" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "publicId" varchar NOT NULL,
        "title" varchar NOT NULL,
        "description" varchar,
        "status" "public"."survey_status_enum" NOT NULL DEFAULT 'DRAFT',
        "isAnonymous" boolean NOT NULL DEFAULT true,
        "startAt" TIMESTAMPTZ,
        "endAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_survey_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_survey_publicId" UNIQUE ("publicId")
      )
    `);

    await queryRunner.query(`CREATE TYPE "public"."question_type_enum" AS ENUM ('TEXT','SCALE','SINGLE','MULTI')`);
    await queryRunner.query(`
      CREATE TABLE "question" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "surveyId" uuid NOT NULL,
        "order" integer NOT NULL,
        "type" "public"."question_type_enum" NOT NULL,
        "title" varchar NOT NULL,
        "helpText" varchar,
        "required" boolean NOT NULL DEFAULT false,
        "scaleMin" integer,
        "scaleMax" integer,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_question_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_question_order" UNIQUE ("surveyId","order"),
        CONSTRAINT "FK_question_survey" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "option" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "questionId" uuid NOT NULL,
        "order" integer NOT NULL,
        "label" varchar NOT NULL,
        "value" varchar NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_option_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_option_order" UNIQUE ("questionId","order"),
        CONSTRAINT "FK_option_question" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "response" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "surveyId" uuid NOT NULL,
        "respondentId" varchar,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "ipHash" varchar,
        "userAgent" varchar,
        "meta" jsonb,
        CONSTRAINT "PK_response_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_response_survey" FOREIGN KEY ("surveyId") REFERENCES "survey"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "answer" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "responseId" uuid NOT NULL,
        "questionId" uuid NOT NULL,
        "valueText" text,
        "valueNumber" double precision,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_answer_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_answer_response" FOREIGN KEY ("responseId") REFERENCES "response"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_answer_question" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "answeroption" (
        "answerId" uuid NOT NULL,
        "optionId" uuid NOT NULL,
        CONSTRAINT "PK_answeroption" PRIMARY KEY ("answerId","optionId"),
        CONSTRAINT "FK_answeroption_answer" FOREIGN KEY ("answerId") REFERENCES "answer"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_answeroption_option" FOREIGN KEY ("optionId") REFERENCES "option"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_answer_response" ON "answer" ("responseId")`);
    await queryRunner.query(`CREATE INDEX "IDX_answer_question" ON "answer" ("questionId")`);
    await queryRunner.query(`CREATE INDEX "IDX_response_survey" ON "response" ("surveyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_question_survey" ON "question" ("surveyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_option_question" ON "option" ("questionId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_option_question"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_question_survey"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_response_survey"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_answer_question"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_answer_response"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "answeroption"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "answer"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "response"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "option"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "question"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "survey"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."question_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."survey_status_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_role_enum"`);
  }
}
