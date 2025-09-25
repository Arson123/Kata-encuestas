export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'USER' | string;
  createdAt: string;
  updatedAt: string;
}
