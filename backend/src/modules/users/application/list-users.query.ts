import UsersRepo from "../infrastructure/typeorm/users.repo.js";

export default class ListUsersQuery {
  constructor(private repo: UsersRepo) {}
  async exec(input: { query?: string; page?: number; size?: number }) {
    const page = input.page ?? 1;
    const size = input.size ?? 20;
    const [items, total] = await this.repo.list(
      input.query,
      (page - 1) * size,
      size
    );
    return { items, total, page, size };
  }
}
