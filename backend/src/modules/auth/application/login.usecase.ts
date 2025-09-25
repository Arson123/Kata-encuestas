import { AppDataSource } from "../../../infrastructure/orm/data-source.js";
import { User } from "../infrastructure/typeorm/user.entity.js";
import BcryptHasher from "../infrastructure/providers/bcrypt.hasher.js";
import JwtToken from "../infrastructure/providers/jwt.token.js";

export class LoginUseCase {
  constructor(private hasher: BcryptHasher, private token: JwtToken) {}
  async exec(input: { email: string; password: string }) {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { email: input.email } });
    if (!user) throw new Error("401");
    const ok = await this.hasher.compare(input.password, user.passwordHash);
    if (!ok) throw new Error("401");
    const jwt = this.token.sign({
      sub: user.id,
      role: user.role,
      email: user.email,
    });
    return {
      token: jwt,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
