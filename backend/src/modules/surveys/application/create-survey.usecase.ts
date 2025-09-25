import { AppDataSource } from "../../../infrastructure/orm/data-source.js";
import { Survey } from "../infrastructure/typeorm/survey.entity.js";
import { randomUUID } from "node:crypto";

export default class CreateSurveyUseCase {
  async exec(input: {
    title: string;
    description?: string;
    createdById?: string;
  }) {
    const repo = AppDataSource.getRepository(Survey);
    const s = repo.create();
    s.title = input.title;
    s.description = input.description;
    s.publicId = randomUUID();
    const saved = await repo.save(s);
    return saved;
  }
}
