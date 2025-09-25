import { FastifyPluginAsync } from "fastify";
import { AppDataSource } from "../../../../infrastructure/orm/data-source.js";
import { Survey } from "../../../surveys/infrastructure/typeorm/survey.entity.js";
import { Question } from "../../../surveys/infrastructure/typeorm/question.entity.js";
import { Option } from "../../../surveys/infrastructure/typeorm/option.entity.js";
import { IngestUseCase } from "../../application/ingest.usecase.js";

const publicRoutes: FastifyPluginAsync = async (app) => {
  app.get("/public/s/:publicId", async (req: any, reply) => {
    const s = await AppDataSource.getRepository(Survey).findOne({
      where: { publicId: req.params.publicId },
    });
    if (!s) return reply.code(404).send({ error: "not_found" });
    return {
      id: s.id,
      publicId: s.publicId,
      title: s.title,
      status: s.status,
      startAt: s.startAt,
      endAt: s.endAt,
    };
  });
  app.get("/public/s/:publicId/questions", async (req: any, reply) => {
    const s = await AppDataSource.getRepository(Survey).findOne({
      where: { publicId: req.params.publicId },
    });
    if (!s) return reply.code(404).send({ error: "not_found" });
    const qs = await AppDataSource.getRepository(Question).find({
      where: { surveyId: s.id },
      order: { order: "ASC" },
    });
    const os = await AppDataSource.getRepository(Option).find();
    const byQ = new Map<string, any[]>();
    for (const o of os) {
      if (!byQ.has(o.questionId)) byQ.set(o.questionId, []);
      byQ.get(o.questionId)!.push(o);
    }
    return qs.map((q) => ({ ...q, options: byQ.get(q.id) ?? [] }));
  });
  app.post("/public/responses", async (req: any, reply) => {
    const uc = new IngestUseCase();
    const out = await uc.exec({
      surveyId: req.body.surveyId,
      answers: req.body.answers ?? [],
      meta: req.body.meta,
      ip: req.ip,
      ua: req.headers["user-agent"],
    });
    return reply.code(201).send(out);
  });
};

export default publicRoutes;
