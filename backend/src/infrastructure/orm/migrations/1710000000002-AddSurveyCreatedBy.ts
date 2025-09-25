import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSurveyCreatedBy1710000000002 implements MigrationInterface {
  name = "AddSurveyCreatedBy1710000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "survey" ADD COLUMN "createdById" uuid`
    );
    await queryRunner.query(`
      ALTER TABLE "survey"
      ADD CONSTRAINT "FK_survey_createdBy"
      FOREIGN KEY ("createdById") REFERENCES "user"("id")
      ON DELETE SET NULL
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_survey_createdBy" ON "survey" ("createdById")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_survey_createdBy"`);
    await queryRunner.query(
      `ALTER TABLE "survey" DROP CONSTRAINT IF EXISTS "FK_survey_createdBy"`
    );
    await queryRunner.query(
      `ALTER TABLE "survey" DROP COLUMN IF EXISTS "createdById"`
    );
  }
}
