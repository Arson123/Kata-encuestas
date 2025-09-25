import { FastifyPluginAsync, FastifyRequest } from "fastify";
import { AppDataSource } from "../../../../infrastructure/orm/data-source.js";

type ExportParams = { id: string };

const exportsRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/exports/surveys/:id/responses.csv",
    async (req: FastifyRequest<{ Params: ExportParams }>, reply) => {
      const rows = await AppDataSource.query(
        `select r.id as "response_id", r."createdAt", a."questionId",
                a."valueText", a."valueNumber"
         from "response" r
         left join "answer" a on a."responseId" = r.id
         where r."surveyId" = $1
         order by r."createdAt" asc`,
        [req.params.id]
      ).catch(async () => []);

      const header =
        "response_id,created_at,question_id,value_text,value_number\n";
      const body = rows
        .map((r: any) =>
          [
            r.response_id,
            r.createdAt,
            r.questionId,
            JSON.stringify(r.valueText ?? ""),
            r.valueNumber ?? "",
          ].join(",")
        )
        .join("\n");

      reply.header("Content-Type", "text/csv");
      reply.header(
        "Content-Disposition",
        `attachment; filename="responses_${req.params.id}.csv"`
      );
      return header + body + "\n";
    }
  );

  app.get(
    "/exports/surveys/:id/summary.csv",
    async (_req: FastifyRequest<{ Params: ExportParams }>, reply) => {
      reply.header("Content-Type", "text/csv");
      reply.header(
        "Content-Disposition",
        `attachment; filename="summary_${_req.params.id}.csv"`
      );
      return "question_id,label,count\n";
    }
  );
};

export default exportsRoutes;
