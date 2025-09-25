import { User } from './user';

export interface TokenResponse {
  token: string;
  user: User;
}

export interface MeResponse {
  user: {
    sub: string;
    role: string;
    iat: number;
    exp: number;
  };
}
