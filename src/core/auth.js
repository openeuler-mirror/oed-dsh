import { requestJson } from "./http.js";
import { OedError } from "./errors.js";
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

/** openEuler oneid device-flow defaults (verified against oed-cli defaults.toml). */
export const AUTH_DEFAULTS = {
  clientId: "623c3c2f1eca5ad5fca6c58a",
  issuer: "https://omapi.osinfra.cn/oneid/oidc",
  deviceAuthorizationUrl: "https://omapi.osinfra.cn/oneid/oidc/device/code",
  tokenUrl: "https://omapi.osinfra.cn/oneid/oidc/token",
  userDataUrl: "https://omapi.osinfra.cn/oneid/oidc/device/user-data",
  // oed-cli relies on MSAL auto-appending the reserved scopes; we hand-roll the
  // request, so include them explicitly — offline_access is required for a
  // refresh_token (access_token TTL is ~120s).
  scopes: "openid profile offline_access email id_token",
};

const FORM_HEADERS = { "Content-Type": "application/x-www-form-urlencoded" };

function formBody(fields) {
  return new URLSearchParams(fields).toString();
}

/** RFC 8628 step 1: request a device code. */
export async function startDeviceFlow({ signal, env = {}, clientId: clientIdOverride } = {}) {
  const url = env.OED_DEVICE_AUTHORIZATION_URL || AUTH_DEFAULTS.deviceAuthorizationUrl;
  const clientId = clientIdOverride || env.OED_APP_ID || AUTH_DEFAULTS.clientId;
  const scopes = env.OED_SCOPES || AUTH_DEFAULTS.scopes;
  const { data } = await requestJson(url, {
    method: "POST",
    headers: FORM_HEADERS,
    body: formBody({ client_id: clientId, scope: scopes }),
    signal,
  });
  return {
    deviceCode: data?.device_code,
    userCode: data?.user_code,
    verificationUri: data?.verification_uri ?? "",
    verificationUriComplete: data?.verification_uri_complete,
    interval: data?.interval ?? 5,
    expiresIn: data?.expires_in,
  };
}

/**
 * RFC 8628 step 2: one poll of the token endpoint. A pending/denied/expired
 * response returns `{ ok:false, error }` rather than throwing, so the caller
 * can decide to keep polling.
 */
export async function pollDeviceToken(
  deviceCode,
  { signal, env = {}, clientId: clientIdOverride } = {},
) {
  const url = env.OED_TOKEN_URL || AUTH_DEFAULTS.tokenUrl;
  const clientId = clientIdOverride || env.OED_APP_ID || AUTH_DEFAULTS.clientId;
  try {
    const { data } = await requestJson(url, {
      method: "POST",
      headers: FORM_HEADERS,
      body: formBody({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        device_code: deviceCode,
        client_id: clientId,
      }),
      signal,
    });
    return {
      ok: true,
      accessToken: data?.access_token,
      refreshToken: data?.refresh_token,
      idToken: data?.id_token,
      expiresIn: data?.expires_in,
    };
  } catch (err) {
    if (err instanceof OedError && err.status === 400) {
      let error = "unknown";
      try {
        error = JSON.parse(err.raw || err.hint || "{}").error || "unknown";
      } catch {
        /* keep "unknown" */
      }
      return { ok: false, error };
    }
    throw err;
  }
}

/** Fetch the per-user service allow-list (response `{"data": "a,b,..."}`). */
export async function fetchAllowList(token, { signal, env = {} } = {}) {
  const url = env.OED_USER_DATA_URL || AUTH_DEFAULTS.userDataUrl;
  const { data } = await requestJson(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  return parseAllowList(data?.data);
}

/** Parse the allow-list "a,b,..." string into an array. */
export function parseAllowList(raw) {
  if (!raw) return [];
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Path to our auth.json. Uses a `oed-dsh` subdirectory (not oed-cli's) so the
 * simpler JSON shape never collides with oed-cli's MSAL cache, while still
 * honoring OED_CACHE_DIR / XDG_CACHE_HOME.
 */
export function authFilePath(env = {}) {
  const override = env.OED_CACHE_DIR;
  if (override) return join(override, "auth.json");
  const xdg = env.XDG_CACHE_HOME;
  const base = xdg || join(homedir(), ".cache");
  return join(base, "oed-dsh", "auth.json");
}

/** Read and parse auth.json; null when missing or malformed. */
export function loadAuth(path = authFilePath(process.env)) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

/** Write auth.json atomically-ish with mode 0600. */
export function saveAuth(data, path = authFilePath(process.env)) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2), { mode: 0o600 });
}

/** Remove auth.json (logout); missing file is a no-op. */
export function clearAuth(path = authFilePath(process.env)) {
  try {
    unlinkSync(path);
  } catch {
    /* already gone */
  }
}

/** Short SHA-256 prefix for status display, never the raw token. */
export function tokenFingerprint(token) {
  if (!token) return null;
  return createHash("sha256").update(String(token)).digest("hex").slice(0, 12);
}
