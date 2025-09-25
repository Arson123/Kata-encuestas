import { FastifyInstance } from "fastify";

const requireRole = (app: FastifyInstance, roles: string[]) => {
  return async (req: any, reply: any) => {
    await (app as any).authenticate(req, reply);
    if (!roles.includes(req.user.role)) {
      reply.code(403).send({ error: "forbidden" });
    }
  };
};

export default requireRole;
