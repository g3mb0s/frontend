import type { AuthErrorPayload, AuthTokensResponse } from "./types";

const AUTH_API_BASE_URL = "/api/auth";

export class AuthApiError extends Error {
  status: number;
  payload: AuthErrorPayload | null;

  constructor(status: number, payload: AuthErrorPayload | null) {
    super(formatAuthError(payload, status));
    this.name = "AuthApiError";
    this.status = status;
    this.payload = payload;
  }
}

export async function authApiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new AuthApiError(response.status, await readErrorPayload(response));
  }

  return response.json() as Promise<T>;
}

export function login(email: string, password: string) {
  return authApiRequest<AuthTokensResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string) {
  return authApiRequest<AuthTokensResponse>("/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function resendVerificationCode(email: string) {
  return authApiRequest<{ message: string }>("/resend-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function refreshTokens(refreshToken: string) {
  return authApiRequest<AuthTokensResponse>("/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function formatAuthError(payload: AuthErrorPayload | null, status: number) {
  if (Array.isArray(payload?.message)) {
    return payload.message.join(", ");
  }

  if (payload?.message) return payload.message;
  if (payload?.error) return payload.error;

  return `Request failed with status ${status}`;
}

async function readErrorPayload(response: Response) {
  try {
    return (await response.json()) as AuthErrorPayload;
  } catch {
    return null;
  }
}
