import { UserRole } from 'src/db/schema';

export interface AuthUser {
  _id: string;
  email: string;
  role: UserRole;
}
