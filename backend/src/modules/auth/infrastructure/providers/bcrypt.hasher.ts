import bcrypt from "bcryptjs";

export default class BcryptHasher {
  async hash(plain: string) {
    return bcrypt.hash(plain, 10);
  }
  async compare(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed);
  }
}
