import { AppDataSource } from "../../../infrastructure/orm/data-source.js";
import { Answer } from "../../responses/infrastructure/typeorm/answer.entity.js";
import { AnswerOption } from "../../responses/infrastructure/typeorm/answer-option.entity.js";
import { Option } from "../../surveys/infrastructure/typeorm/option.entity.js";

export default class SummaryQuery {
  async exec(surveyId: string) {
    const qb = AppDataSource.getRepository(Answer)
      .createQueryBuilder("a")
      .select("a.questionId", "questionId")
      .addSelect("COUNT(*)", "n")
      .where(
        `a.responseId IN (SELECT id FROM "response" WHERE "surveyId" = :surveyId)`,
        { surveyId }
      )
      .groupBy("a.questionId");
    const totals = await qb.getRawMany();
    const options = await AppDataSource.getRepository(Option).find();
    const ao = await AppDataSource.getRepository(AnswerOption)
      .createQueryBuilder("ao")
      .leftJoin(Answer, "a", `a.id = ao."answerId"`)
      .select([
        'a."questionId" as "questionId"',
        'ao."optionId" as "optionId"',
        "COUNT(*) as c",
      ])
      .groupBy('a."questionId", ao."optionId"')
      .getRawMany();
    const byQ: Record<string, any> = {};
    for (const t of totals) byQ[t.questionId] = { n: Number(t.n), options: [] };
    for (const r of ao) {
      const opt = options.find((o) => o.id === r.optionId);
      if (!byQ[r.questionId]) byQ[r.questionId] = { n: 0, options: [] };
      byQ[r.questionId].options.push({
        optionId: r.optionId,
        label: opt?.label ?? "",
        count: Number(r.c),
      });
    }
    return byQ;
  }
}
