import UsersRepo from "../infrastructure/typeorm/users.repo.js";

export default class UpdateUserUseCase {
  constructor(private repo: UsersRepo) {}
  async exec(id: string, data: { role?: string; passwordHash?: string }) {
    await this.repo.update(id, data as any);
    return { ok: true };
  }
}
