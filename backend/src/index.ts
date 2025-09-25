import "reflect-metadata";
import "dotenv/config";

import { buildServer } from "./core/http/fastify.js";
import { AppDataSource } from "./infrastructure/orm/data-source.js";
import { env } from "./config/env.js";

async function main() {
  await AppDataSource.initialize();
  const app = await buildServer({ ds: AppDataSource });

  const port: number = Number(env.PORT ?? 3000);

  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`API up on :${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
