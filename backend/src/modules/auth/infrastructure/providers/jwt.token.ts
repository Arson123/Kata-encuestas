import jwt from "jsonwebtoken";

export default class JwtToken {
  constructor(private secret: string) {}
  sign(payload: Record<string, any>) {
    return jwt.sign(payload, this.secret, { expiresIn: "7d" });
  }
}
