import { FastifyPluginAsync } from "fastify";
import { AppDataSource } from "../../../../infrastructure/orm/data-source.js";
import { Option } from "../../../surveys/infrastructure/typeorm/option.entity.js";

const optionsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/questions/:id/options", async (req: any) => {
    const repo = AppDataSource.getRepository(Option);
    return repo.find({
      where: { questionId: req.params.id },
      order: { order: "ASC" },
    });
  });
  app.post(
    "/questions/:id/options",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const repo = AppDataSource.getRepository(Option);
      const o = repo.create({ ...req.body, questionId: req.params.id });
      return repo.save(o);
    }
  );
  app.patch(
    "/options/:id",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const repo = AppDataSource.getRepository(Option);
      await repo.update({ id: req.params.id }, req.body);
      return { ok: true };
    }
  );
  app.delete(
    "/options/:id",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const repo = AppDataSource.getRepository(Option);
      await repo.delete({ id: req.params.id });
      return { ok: true };
    }
  );
};

export default optionsRoutes;
