import { FastifyPluginAsync } from "fastify";
import SummaryQuery from "../../application/summary.query.js";
import TimeseriesQuery from "../../application/timeseries.query.js";

const resultsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/results/surveys/:id/summary", async (req: any) => {
    const q = new SummaryQuery();
    return q.exec(req.params.id);
  });
  app.get("/results/surveys/:id/timeseries", async (req: any) => {
    const q = new TimeseriesQuery();
    const g = (req.query?.granularity as "minute" | "hour") || "hour";
    return q.exec(req.params.id, g);
  });
};

export default resultsRoutes;
