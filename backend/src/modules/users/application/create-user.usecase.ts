import UsersRepo from "../infrastructure/typeorm/users.repo.js";

export default class CreateUserUseCase {
  constructor(private repo: UsersRepo) {}
  async exec(input: { email: string; passwordHash: string; role: string }) {
    const u = await this.repo.create({
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role as any,
    });
    return { id: u.id };
  }
}
