export type Role = "user" | "manager" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  emailVerified: boolean;
}

export interface AuthTokensResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  message?: string;
}

export interface AuthErrorPayload {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}
