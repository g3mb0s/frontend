import { refreshTokens } from "./api";
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  storeAuthTokens,
} from "./token-storage";

let refreshPromise: Promise<string | null> | null = null;

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const firstResponse = await fetchWithAccessToken(input, init);

  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  const accessToken = await refreshAccessToken();
  if (!accessToken) {
    return firstResponse;
  }

  return fetchWithAccessToken(input, init, accessToken);
}

async function fetchWithAccessToken(
  input: RequestInfo | URL,
  init: RequestInit,
  accessToken = getAccessToken(),
) {
  const headers = new Headers(init.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = runRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function runRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthStorage();
    return null;
  }

  try {
    const response = await refreshTokens(refreshToken);
    storeAuthTokens(response);
    return response.accessToken;
  } catch {
    clearAuthStorage();
    return null;
  }
}
