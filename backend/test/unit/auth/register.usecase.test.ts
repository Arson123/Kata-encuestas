import { describe, it, expect, vi, afterEach } from "vitest";
import { RegisterUseCase } from "../../../src/modules/auth/application/register.usecase";
import { AppDataSource } from "../../../src/infrastructure/orm/data-source";

type Role = "ADMIN" | "EDITOR" | "VIEWER";
type UserRow = { id: string; email: string; passwordHash: string; role: Role };

class FakeUsersRepo {
  items: UserRow[] = [];
  lastSaved?: UserRow;

  async findOne(opts: {
    where: { email?: string; id?: string };
  }): Promise<UserRow | null> {
    if (opts?.where?.email)
      return this.items.find((u) => u.email === opts.where.email) ?? null;
    if (opts?.where?.id)
      return this.items.find((u) => u.id === opts.where.id) ?? null;
    return null;
  }
  create(data: Partial<UserRow>): UserRow {
    return {
      id: crypto.randomUUID(),
      email: data.email!,
      passwordHash: data.passwordHash!,
      role: (data.role ?? "EDITOR") as Role,
    };
  }
  async save(u: UserRow): Promise<UserRow> {
    this.items.push(u);
    this.lastSaved = u;
    return u;
  }
}

class FakeHasher {
  async hash(pwd: string) {
    return `hashed:${pwd}`;
  }
  async compare(): Promise<boolean> {
    return false;
  }
}

class FakeTokenService {
  sign(_payload: any) {
    return "fake.jwt";
  }
  signPermanent(_payload: any) {
    return "fake.permanent.jwt";
  }
}

afterEach(() => vi.restoreAllMocks());

describe("RegisterUseCase", () => {
  it("crea usuario, hashea password y NO expone passwordHash", async () => {
    const fakeRepo = new FakeUsersRepo();
    vi.spyOn(AppDataSource, "getRepository").mockReturnValue(fakeRepo as any);

    const uc = new RegisterUseCase(
      new FakeHasher() as any,
      new FakeTokenService() as any
    );

    const { user } = await uc.exec({
      email: "new@example.com",
      password: "secret",
      role: "ADMIN" as any,
    });

    expect(user.email).toBe("new@example.com");
    expect(user.role).toBe("ADMIN");
    expect((user as any).passwordHash).toBeUndefined();
    expect(fakeRepo.lastSaved?.passwordHash).toBe("hashed:secret");
  });

  it("lanza 409 si el email ya existe", async () => {
    const fakeRepo = new FakeUsersRepo();
    fakeRepo.items.push({
      id: crypto.randomUUID(),
      email: "dup@example.com",
      passwordHash: "hashed:x",
      role: "EDITOR",
    });
    vi.spyOn(AppDataSource, "getRepository").mockReturnValue(fakeRepo as any);

    const uc = new RegisterUseCase(
      new FakeHasher() as any,
      new FakeTokenService() as any
    );

    await expect(
      uc.exec({ email: "dup@example.com", password: "y" })
    ).rejects.toMatchObject({ message: expect.stringMatching(/409|email/i) });
  });
});
