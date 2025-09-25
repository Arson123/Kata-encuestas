import { AppDataSource } from "../../../infrastructure/orm/data-source.js";
import { User } from "../infrastructure/typeorm/user.entity.js";
import BcryptHasher from "../infrastructure/providers/bcrypt.hasher.js";
import JwtToken from "../infrastructure/providers/jwt.token.js";
import UserRole from "../domain/user.role.js";

export class RegisterUseCase {
  constructor(private hasher: BcryptHasher, private token: JwtToken) {}
  async exec(input: { email: string; password: string; role?: UserRole }) {
    const repo = AppDataSource.getRepository(User);
    const exists = await repo.findOne({ where: { email: input.email } });
    if (exists) throw new Error("409");
    const passwordHash = await this.hasher.hash(input.password);
    const user = await repo.save(
      repo.create({
        email: input.email,
        passwordHash,
        role: input.role ?? UserRole.EDITOR,
      })
    );
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
