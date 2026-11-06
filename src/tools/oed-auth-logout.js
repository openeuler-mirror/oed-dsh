import { clearAuth } from "../core/auth.js";

export const tool = {
  name: "oed_auth_logout",
  description:
    "Log out of openEuler oneid (clear the stored token and allow-list). 退出 openEuler oneid 登录（清除存储的 token 与 allow-list）。",
  parameters: {},
};

export async function run(_runtime) {
  clearAuth();
  return { ok: true, loggedIn: false };
}
