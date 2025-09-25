import { FastifyPluginAsync } from "fastify";
import UsersRepo from "../../infrastructure/typeorm/users.repo.js";
import requireRole from "../../../../core/security/guards.js";
import ListUsersQuery from "../../application/list-users.query.js";
import CreateUserUseCase from "../../application/create-user.usecase.js";
import UpdateUserUseCase from "../../application/update-user.usecase.js";

const usersRoutes: FastifyPluginAsync = async (app) => {
  const admin = requireRole(app, ["ADMIN"]);

  app.get("/users", { preHandler: [admin] }, async (req: any) => {
    const repo = new UsersRepo();
    const q = new ListUsersQuery(repo);
    const { query, page, size } = req.query || {};
    return q.exec({
      query,
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
    });
  });

  app.post("/users", { preHandler: [admin] }, async (req: any) => {
    const repo = new UsersRepo();
    const u = new CreateUserUseCase(repo);
    const { email, passwordHash, role } = req.body;
    return u.exec({ email, passwordHash, role });
  });

  app.patch("/users/:id", { preHandler: [admin] }, async (req: any) => {
    const repo = new UsersRepo();
    const u = new UpdateUserUseCase(repo);
    return u.exec(req.params.id, req.body);
  });
};

export default usersRoutes;
