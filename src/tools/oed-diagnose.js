import { loadAuth, tokenFingerprint } from "../core/auth.js";
import { currentUser } from "../core/atomgit.js";
import { VERSION } from "../core/version.js";

export const tool = {
  name: "oed_diagnose",
  description:
    "Diagnose the oed-dsh plugin's local state: login status, whether the AtomGit token is configured and valid, config summary, plugin version. 诊断 oed-dsh 插件的本地状态：登录状态、AtomGit 令牌是否配置并校验其有效性、配置项汇总、插件版本。只读，不泄露敏感信息。",
  parameters: {},
};

export async function run(runtime, _args, signal) {
  const auth = loadAuth();
  let atomgitTokenValid = null;
  let atomgitTokenUser = null;
  if (runtime.atomgitToken) {
    try {
      const user = await currentUser({ token: runtime.atomgitToken, signal });
      atomgitTokenValid = true;
      atomgitTokenUser = user?.login ?? user?.name ?? null;
    } catch (err) {
      // 401/403 = token 无效；其它（网络等）= 未知，不误报
      atomgitTokenValid = err?.status === 401 || err?.status === 403 ? false : null;
    }
  }
  return {
    ok: true,
    pluginVersion: VERSION,
    loggedIn: Boolean(auth?.access_token),
    fingerprint: auth?.access_token ? tokenFingerprint(auth.access_token) : null,
    atomgitTokenConfigured: Boolean(runtime.atomgitToken),
    atomgitTokenValid,
    atomgitTokenUser,
    config: {
      riskAutoApprove: runtime.riskAutoApprove,
      localVerify: runtime.localVerify,
      allowMutations: runtime.allowMutations,
    },
    note: "网关连通性可用 oed_services 验证；本报告为当前会话快照。",
  };
}
