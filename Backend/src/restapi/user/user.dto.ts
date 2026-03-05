import { UserRole } from "src/db/schema/user.schema";

export class SignupDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
  address?: Record<string, unknown>;
}

export class SigninDto {
  email?: string;
  phone?: string;
  password: string;
}

export class GenerateOtpDto {
  emailOrPhone: string;
}

export class VerifyOtpDto {
  emailOrPhone: string;
  otp: string;
}

export class LoginDto {
  email: string;
  password: string;
}
