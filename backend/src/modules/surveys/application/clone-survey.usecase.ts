import { AppDataSource } from "../../../infrastructure/orm/data-source.js";
import { Survey } from "../infrastructure/typeorm/survey.entity.js";
import { Question } from "../infrastructure/typeorm/question.entity.js";
import { Option } from "../infrastructure/typeorm/option.entity.js";
import { randomUUID } from "node:crypto";

export default class CloneSurveyUseCase {
  async exec(id: string) {
    return AppDataSource.transaction(async (m) => {
      const sRepo = m.getRepository(Survey);
      const qRepo = m.getRepository(Question);
      const oRepo = m.getRepository(Option);

      const s = await sRepo.findOne({ where: { id } });
      if (!s) throw new Error("404");

      const clone = sRepo.create();
      clone.title = s.title;
      clone.description = s.description;
      clone.publicId = randomUUID();
      const savedClone = await sRepo.save(clone);

      const qs = await qRepo.find({
        where: { surveyId: s.id },
        order: { order: "ASC" },
      });
      for (const q of qs) {
        const q2 = qRepo.create();
        q2.surveyId = savedClone.id;
        q2.order = q.order;
        q2.type = q.type;
        q2.title = q.title;
        q2.helpText = q.helpText;
        q2.required = q.required;
        q2.scaleMin = q.scaleMin;
        q2.scaleMax = q.scaleMax;
        const savedQ2 = await qRepo.save(q2);

        const os = await oRepo.find({
          where: { questionId: q.id },
          order: { order: "ASC" },
        });
        for (const o of os) {
          const o2 = oRepo.create();
          o2.questionId = savedQ2.id;
          o2.order = o.order;
          o2.label = o.label;
          o2.value = o.value;
          await oRepo.save(o2);
        }
      }

      return savedClone;
    });
  }
}
