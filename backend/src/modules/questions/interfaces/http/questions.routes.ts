import { FastifyPluginAsync } from "fastify";
import { AppDataSource } from "../../../../infrastructure/orm/data-source.js";
import { Question } from "../../../surveys/infrastructure/typeorm/question.entity.js";

const questionsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/surveys/:id/questions", async (req: any) => {
    const repo = AppDataSource.getRepository(Question);
    return repo.find({
      where: { surveyId: req.params.id },
      order: { order: "ASC" },
    });
  });
  app.post(
    "/surveys/:id/questions",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const repo = AppDataSource.getRepository(Question);
      const q = repo.create({ ...req.body, surveyId: req.params.id });
      return repo.save(q);
    }
  );
  app.patch(
    "/questions/:id",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const repo = AppDataSource.getRepository(Question);
      await repo.update({ id: req.params.id }, req.body);
      return { ok: true };
    }
  );
  app.post(
    "/questions/:id/move",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const repo = AppDataSource.getRepository(Question);
      await repo.update({ id: req.params.id }, { order: req.body.order });
      return { ok: true };
    }
  );
};

export default questionsRoutes;
