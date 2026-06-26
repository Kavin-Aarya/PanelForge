/**
 * authedFetch — wraps fetch() so that every authenticated request:
 *   1. Attaches the current access token automatically.
 *   2. On a 401 (expired/invalid token), silently calls /api/auth/refresh,
 *      stores the new tokens, and retries the original request ONCE.
 *   3. If the refresh itself fails (refresh token also dead), clears
 *      stored tokens and throws — the caller should redirect to login.
 *
 * NOTE: assumes tokens are stored under "accessToken" / "refreshToken"
 * in localStorage. Update the two key names below if yours differ.
 */

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Prevents multiple simultaneous 401s from firing multiple parallel
// refresh calls — they all await the same in-flight refresh promise.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available. Please log in again.");
    }

    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      throw new Error("Session expired. Please log in again.");
    }

    const data = await res.json();
    storeTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function authedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = getAccessToken();

  const buildHeaders = (token: string | null) => ({
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  let res = await fetch(url, { ...options, headers: buildHeaders(accessToken) });

  if (res.status === 401) {
    const newAccessToken = await refreshAccessToken(); // throws if refresh fails
    res = await fetch(url, { ...options, headers: buildHeaders(newAccessToken) });
  }

  return res;
}