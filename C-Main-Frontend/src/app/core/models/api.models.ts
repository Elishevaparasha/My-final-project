export enum Role {
  Admin = 0,
  Subscriber = 1,
  FreeUser = 2,
}

export interface UserResponse {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  isSubscriber: boolean;
  subscriptionExpiryDate?: string;
  monthlyWatchedSeconds: number;
  lastLoginDate?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface ChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
  newPassword: string;
  resetToken: string;
}

export interface ContentResponse {
  id: string;
  title: string;
  description: string;
  authorId?: string;
  uploadDate: string;
  contentType: string;
  videoUrl?: string;
  durationSeconds?: number;
  body?: string;
  thumbnailUrl?: string;
}

export interface ContentRequest {
  title: string;
  description: string;
  contentType: string;
  videoUrl?: string;
  durationSeconds?: number;
  body?: string;
  thumbnailUrl?: string;
  uploadDate?: string;
}
