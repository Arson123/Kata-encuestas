import { AppDataSource } from "../infrastructure/orm/data-source.js";
import BcryptHasher from "../modules/auth/infrastructure/providers/bcrypt.hasher.js";
import JwtToken from "../modules/auth/infrastructure/providers/jwt.token.js";

export const di = {
  ds: AppDataSource,
  hasher: new BcryptHasher(),
  token: new JwtToken(process.env.JWT_SECRET || "secret"),
};
