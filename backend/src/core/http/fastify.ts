import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rate from "@fastify/rate-limit";

import authRoutes from "../../modules/auth/interfaces/http/auth.routes.js";
import publicRoutes from "../../modules/responses/interfaces/http/public.routes.js";
import surveysRoutes from "../../modules/surveys/interfaces/http/surveys.routes.js";
import usersRoutes from "../../modules/users/interfaces/http/users.routes.js";
import questionsRoutes from "../../modules/questions/interfaces/http/questions.routes.js";
import optionsRoutes from "../../modules/options/interfaces/http/options.routes.js";
import resultsRoutes from "../../modules/results/interfaces/http/results.routes.js";
import exportsRoutes from "../../modules/export/interfaces/http/exports.routes.js";

export async function buildServer(ctx: { ds: any }) {
  const app = Fastify({ logger: true });
  await app.register(cors);
  await app.register(jwt, { secret: process.env.JWT_SECRET! });
  app.decorate("authenticate", async (req: any) => {
    await req.jwtVerify();
  });
  await app.register(rate, { max: 100, timeWindow: "1 minute" });

  await app.register(authRoutes);
  await app.register(usersRoutes);
  await app.register(surveysRoutes);
  await app.register(questionsRoutes);
  await app.register(optionsRoutes);
  await app.register(publicRoutes);
  await app.register(resultsRoutes);
  await app.register(exportsRoutes);

  app.get("/health", async () => ({ ok: true }));
  return app;
}
