import api from "./config";
import type { ApiResponse } from "./types";

// Types for User
export type UserRole = "ADMIN" | "EMPLOYEE" | "USER";

export interface User {
  _id: string;

  name: string;
  email: string;
  phone: string;
  role: UserRole;
  address?: Record<string, unknown>;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
  address?: Record<string, unknown>;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface GenerateOtpData {
  emailOrPhone: string;
}

export interface VerifyOtpData {
  emailOrPhone: string;
  otp: string;
}

export interface LoginResponse {
  message: string;
  token?: string;
  access_token?: string;
  email?: string;
  user?: User;
}

export const signup = async (data: SignupData): Promise<ApiResponse<void>> => {
  const response = await api.post<ApiResponse<void>>("/user/signup", data);
  return response.data;
};

export const verifyOtp = async (
  data: VerifyOtpData,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/user/verify-otp", data);
  return response.data;
};

export const resendOtp = async (
  data: GenerateOtpData,
): Promise<ApiResponse<void>> => {
  const response = await api.post<ApiResponse<void>>("/user/resend-otp", data);
  return response.data;
};

export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/user/login", data);
  return response.data;
};

export const createStaff = async (
  data: SignupData,
): Promise<ApiResponse<User>> => {
  const response = await api.post<ApiResponse<User>>(
    "/user/create-staff",
    data,
  );
  return response.data;
};

export const getProfile = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>("/user/profile");
  return response.data;
};

export const checkAdminAccess = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>("/user/admin");
  return response.data;
};

export const toggleLikeProduct = async (
  productId: string,
): Promise<ApiResponse<string[]>> => {
  const response = await api.post<ApiResponse<string[]>>(
    `/wishlist/toggle/${productId}`,
  );
  return response.data;
};

export const getMyWishlist = async (): Promise<ApiResponse<string[]>> => {
  const response = await api.get<ApiResponse<string[]>>('/wishlist/my');
  return response.data;
};
