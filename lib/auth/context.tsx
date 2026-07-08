"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  login as loginRequest,
  register as registerRequest,
  resendVerificationCode,
} from "./api";
import { authFetch } from "./auth-fetch";
import {
  clearAuthStorage,
  getAccessToken,
  storeAuthTokens,
  storeUser,
} from "./token-storage";
import type { AuthTokensResponse, AuthUser } from "./types";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthTokensResponse>;
  register: (email: string, password: string) => Promise<AuthTokensResponse>;
  verifyEmail: (code: string) => Promise<AuthTokensResponse>;
  resendCode: (email?: string) => Promise<void>;
  refreshSession: () => Promise<AuthUser | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const applyAuthResponse = useCallback((response: AuthTokensResponse) => {
    storeAuthTokens(response);
    setUser(response.user);
    setStatus("authenticated");
    return response;
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    setStatus("anonymous");
    router.replace("/login");
  }, [router]);

  const refreshSession = useCallback(async () => {
    if (!getAccessToken()) {
      clearAuthStorage();
      setUser(null);
      setStatus("anonymous");
      return null;
    }

    const response = await authFetch("/api/auth");
    if (!response.ok) {
      clearAuthStorage();
      setUser(null);
      setStatus("anonymous");
      return null;
    }

    const { user: currentUser } = (await response.json()) as { user: AuthUser };
    storeUser(currentUser);
    setUser(currentUser);
    setStatus("authenticated");
    return currentUser;
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshSession();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      login: async (email, password) =>
        applyAuthResponse(await loginRequest(email, password)),
      register: async (email, password) =>
        applyAuthResponse(await registerRequest(email, password)),
      verifyEmail: async (code) => {
        const response = await authFetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error((await readErrorMessage(response)) ?? "Email verification failed");
        }

        return applyAuthResponse((await response.json()) as AuthTokensResponse);
      },
      resendCode: async (email) => {
        const targetEmail = email ?? user?.email;
        if (!targetEmail) {
          throw new Error("Email is required");
        }

        await resendVerificationCode(targetEmail);
      },
      refreshSession,
      logout,
    }),
    [applyAuthResponse, logout, refreshSession, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}

async function readErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    const message = payload?.message;
    return Array.isArray(message) ? message.join(", ") : message;
  } catch {
    return null;
  }
}
