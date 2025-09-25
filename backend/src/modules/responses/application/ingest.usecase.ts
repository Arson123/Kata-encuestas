import { AppDataSource } from "../../../infrastructure/orm/data-source.js";
import { Response } from "../infrastructure/typeorm/response.entity.js";
import { Answer } from "../infrastructure/typeorm/answer.entity.js";
import { AnswerOption } from "../infrastructure/typeorm/answer-option.entity.js";

export class IngestUseCase {
  async exec(input: {
    surveyId: string;
    answers: any[];
    meta?: any;
    ip?: string;
    ua?: string;
  }) {
    return AppDataSource.transaction(async (m) => {
      const rRepo = m.getRepository(Response);
      const aRepo = m.getRepository(Answer);
      const aoRepo = m.getRepository(AnswerOption);

      const r = rRepo.create();
      r.surveyId = input.surveyId;
      r.meta = input.meta ?? {};
      r.ipHash = input.ip;
      r.userAgent = input.ua;
      const savedR = await rRepo.save(r);

      for (const a of input.answers || []) {
        if (a.type === "TEXT") {
          const ent = aRepo.create();
          ent.responseId = savedR.id;
          ent.questionId = a.questionId;
          ent.valueText = String(a.value ?? "");
          await aRepo.save(ent);
        } else if (a.type === "SCALE") {
          const ent = aRepo.create();
          ent.responseId = savedR.id;
          ent.questionId = a.questionId;
          ent.valueNumber = Number(a.value);
          await aRepo.save(ent);
        } else if (a.type === "SINGLE" || a.type === "MULTI") {
          const ent = aRepo.create();
          ent.responseId = savedR.id;
          ent.questionId = a.questionId;
          const savedA = await aRepo.save(ent);
          const ids = Array.isArray(a.optionIds) ? a.optionIds : [a.optionIds];
          for (const id of ids) {
            const ao = aoRepo.create();
            ao.answerId = savedA.id;
            ao.optionId = id;
            await aoRepo.save(ao);
          }
        }
      }

      return { id: savedR.id };
    });
  }
}
