import { loadAuth, tokenFingerprint } from "../core/auth.js";

export const tool = {
  name: "oed_auth_status",
  description: "查看 openEuler oneid 登录状态：是否已登录、token 指纹、allow-list、登录时间。",
  parameters: {},
};

export async function run(_runtime) {
  const auth = loadAuth();
  if (!auth?.access_token) {
    return { ok: true, loggedIn: false };
  }
  return {
    ok: true,
    loggedIn: true,
    fingerprint: tokenFingerprint(auth.access_token),
    allowlist: auth.allowlist ?? [],
    loginAt: auth.login_at ?? null,
    expiresIn: auth.expires_in ?? null,
  };
}
