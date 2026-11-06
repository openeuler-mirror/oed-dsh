import { DEFAULT_GATEWAY } from "./core/http.js";
import { makeDiscovery } from "./core/discovery.js";
import { loadAuth, authFilePath, AUTH_DEFAULTS } from "./core/auth.js";

/** Volatile fields arrive as `Volatile<T>` wrappers; plain fields do not. */
function readConfig(value) {
  return value != null && typeof value.get === "function" ? value.get() : value;
}

/**
 * Turn plugin Config + environment into the runtime object consumed by tools.
 * `OED_TOKEN`/`OED_COOKIE` compatibility is intentionally supported here so
 * users or CI that already authenticate oed-cli can reuse the same credentials.
 */
export function buildRuntime(config = {}, env = {}) {
  const gateway = (env.OED_GATEWAY || config.gateway || DEFAULT_GATEWAY).replace(/\/+$/, "");
  const community = env.OED_COMMUNITY || config.community || "openeuler";
  const cacheTtlMs = config.cacheTtlMs ?? 600_000;

  const discovery = makeDiscovery({ gateway, community, cacheTtlMs });
  const storedAuth = loadAuth(authFilePath(env));

  return {
    discovery,
    community,
    allowMutations: readConfig(config.allowMutations) ?? false,
    readOnlyAllowlist: Array.isArray(config.readOnlyAllowlist) ? config.readOnlyAllowlist : [],
    maxResponseChars: config.maxResponseChars ?? 64_000,
    token: env.OED_TOKEN || storedAuth?.access_token || undefined,
    allowlist: Array.isArray(storedAuth?.allowlist) ? storedAuth.allowlist : [],
    clientId: env.OED_APP_ID || AUTH_DEFAULTS.clientId,
    atomgitToken: env.ATOMGIT_TOKEN || readConfig(config.atomgitToken) || undefined,
    riskAutoApprove: readConfig(config.riskAutoApprove) ?? "never",
    localVerify: readConfig(config.localVerify) ?? "lightweight",
  };
}
