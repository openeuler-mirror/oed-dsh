import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadAuth, tokenFingerprint } from "../core/auth.js";

const VERSION = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "..", "package.json"), "utf8"),
).version;

export const tool = {
  name: "oed_diagnose",
  description:
    "诊断 oed-dsh 插件的本地状态：登录状态、AtomGit 令牌是否配置、配置项汇总、插件版本。只读，不泄露敏感信息。",
  parameters: {},
};

export async function run(runtime) {
  const auth = loadAuth();
  return {
    ok: true,
    pluginVersion: VERSION,
    loggedIn: Boolean(auth?.access_token),
    fingerprint: auth?.access_token ? tokenFingerprint(auth.access_token) : null,
    atomgitTokenConfigured: Boolean(runtime.atomgitToken),
    config: {
      riskAutoApprove: runtime.riskAutoApprove,
      localVerify: runtime.localVerify,
      allowMutations: runtime.allowMutations,
    },
    note: "网关连通性可用 oed_services 验证；本报告为当前会话快照。",
  };
}
