import { FastifyPluginAsync } from "fastify";
import { RegisterSchema, LoginSchema } from "./dto.js";
import BcryptHasher from "../../infrastructure/providers/bcrypt.hasher.js";
import JwtToken from "../../infrastructure/providers/jwt.token.js";
import { RegisterUseCase } from "../../application/register.usecase.js";
import { LoginUseCase } from "../../application/login.usecase.js";
import MeQuery from "../../application/me.query.js";

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/register", async (req, reply) => {
    const body = RegisterSchema.parse(req.body);
    const uc = new RegisterUseCase(
      new BcryptHasher(),
      new JwtToken(process.env.JWT_SECRET!)
    );
    const out = await uc.exec(body);
    return reply.send(out);
  });

  app.post("/auth/login", async (req, reply) => {
    const body = LoginSchema.parse(req.body);
    const uc = new LoginUseCase(
      new BcryptHasher(),
      new JwtToken(process.env.JWT_SECRET!)
    );
    const out = await uc.exec(body);
    return reply.send(out);
  });

  app.get(
    "/auth/me",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const uc = new MeQuery();
      return uc.exec({
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role,
      });
    }
  );
};

export default authRoutes;
