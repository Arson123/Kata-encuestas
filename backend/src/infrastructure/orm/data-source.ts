import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { User } from "../../modules/auth/infrastructure/typeorm/user.entity.js";
import { Survey } from "../../modules/surveys/infrastructure/typeorm/survey.entity.js";
import { Question } from "../../modules/surveys/infrastructure/typeorm/question.entity.js";
import { Option } from "../../modules/surveys/infrastructure/typeorm/option.entity.js";
import { Response } from "../../modules/responses/infrastructure/typeorm/response.entity.js";
import { Answer } from "../../modules/responses/infrastructure/typeorm/answer.entity.js";
import { AnswerOption } from "../../modules/responses/infrastructure/typeorm/answer-option.entity.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DB_URL,
  entities: [User, Survey, Question, Option, Response, Answer, AnswerOption],
  migrations: [path.join(__dirname, "migrations/*.{ts,js}")],
  synchronize: false,
  logging: false,
});
