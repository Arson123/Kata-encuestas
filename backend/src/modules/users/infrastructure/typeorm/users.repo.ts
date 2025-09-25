import { AppDataSource } from "../../../../infrastructure/orm/data-source.js";
import { User } from "../../../auth/infrastructure/typeorm/user.entity.js";
import { Like } from "typeorm";

export default class UsersRepo {
  async list(query?: string, skip = 0, take = 20) {
    const repo = AppDataSource.getRepository(User);
    return repo.findAndCount({
      where: query ? { email: Like(`%${query}%`) } : {},
      skip,
      take,
      order: { createdAt: "DESC" },
    });
  }

  async create(data: Partial<User>) {
    const repo = AppDataSource.getRepository(User);
    return repo.save(repo.create(data));
  }

  async update(id: string, data: Partial<User>) {
    const repo = AppDataSource.getRepository(User);
    await repo.update({ id }, data);
    return { ok: true };
  }
}
