import { FastifyPluginAsync } from "fastify";
import CreateSurveyUseCase from "../../application/create-survey.usecase.js";
import ListSurveysQuery from "../../application/list-surveys.query.js";
import UpdateSurveyUseCase from "../../application/update-survey.usecase.js";
import CloneSurveyUseCase from "../../application/clone-survey.usecase.js";

const surveysRoutes: FastifyPluginAsync = async (app) => {
  app.get("/surveys", async () => {
    const q = new ListSurveysQuery();
    return q.exec();
  });

  app.post(
    "/surveys",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const uc = new CreateSurveyUseCase();
      return uc.exec({
        title: req.body.title,
        description: req.body.description,
        createdById: req.user?.sub,
      });
    }
  );

  app.get("/surveys/:id", async (_req: any, reply) => {
    reply.code(501).send({ error: "not_implemented" });
  });

  app.patch(
    "/surveys/:id",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const uc = new UpdateSurveyUseCase();
      return uc.exec(req.params.id, req.body);
    }
  );

  app.post(
    "/surveys/:id/clone",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const uc = new CloneSurveyUseCase();
      return uc.exec(req.params.id);
    }
  );
};

export default surveysRoutes;
