import { AppDataSource } from "../../../infrastructure/orm/data-source.js";
import { Survey } from "../infrastructure/typeorm/survey.entity.js";

export default class ListSurveysQuery {
  async exec() {
    const repo = AppDataSource.getRepository(Survey);
    const items = await repo.find({ order: { createdAt: "DESC" } });
    return items;
  }
}
