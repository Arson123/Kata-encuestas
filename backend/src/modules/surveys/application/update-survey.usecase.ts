import { AppDataSource } from "../../../infrastructure/orm/data-source.js";
import { Survey } from "../infrastructure/typeorm/survey.entity.js";

export default class UpdateSurveyUseCase {
  async exec(id: string, data: Partial<Survey>) {
    const repo = AppDataSource.getRepository(Survey);
    await repo.update({ id }, data as any);
    return { ok: true };
  }
}
