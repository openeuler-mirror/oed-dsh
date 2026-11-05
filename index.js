/**
 * oed-dsh Host plugin — thin DSH adapter.
 *
 * This is the ONLY file that imports `@deepseek-ai/*` packages. All logic lives
 * in `src/core/**` (pure JS, no DSH dependency) so it is fully unit-testable
 * offline and reusable by a future MCP server.
 *
 * NOTE for maintainers: `defineTool`/`schemastery` resolve from the DSH
 * installation at runtime; the npm-published versions are older than the
 * desktop install, so never pin them here. Verify this adapter against the
 * installed DSH after first install; adjust `output` if the installed
 * `defineTool` contract differs.
 */
import z from "@deepseek-ai/schemastery";
import { defineTool } from "@deepseek-ai/dsh-tools";

import { buildRuntime } from "./src/config.js";
import { toToolErrorMessage } from "./src/core/errors.js";
import { sanitizeJson } from "./src/core/operations.js";
import { skill } from "./src/skill.js";
import { skill as cveTriageSkill } from "./src/skill-cve-triage.js";
import { skill as cveRepairSkill } from "./src/skill-cve-repair.js";
import { skill as cveReviewSkill } from "./src/skill-cve-review.js";
import { skill as communitySkill } from "./src/skill-community.js";

import { tool as servicesTool, run as runServices } from "./src/tools/services.js";
import { tool as schemaTool, run as runSchema } from "./src/tools/operation-schema.js";
import { tool as invokeTool, run as runInvoke } from "./src/tools/invoke.js";
import { tool as cveIssueTool, run as runCveIssue } from "./src/tools/cve-issue.js";
import { tool as cveCommentTool, run as runCveComment } from "./src/tools/cve-triage-comment.js";
import { tool as cveVersionTool, run as runCveVersion } from "./src/tools/cve-package-version.js";
import { tool as cvePostTool, run as runCvePost } from "./src/tools/cve-post-comment.js";
import { tool as cveFixTool, run as runCveFix } from "./src/tools/cve-fix-prepare.js";
import { tool as cveOpenPrTool, run as runCveOpenPr } from "./src/tools/cve-open-pr.js";
import { tool as cveBuildTool, run as runCveBuild } from "./src/tools/cve-build.js";
import { tool as cveBuildWaitTool, run as runCveBuildWait } from "./src/tools/cve-build-wait.js";
import {
  tool as cveRepoGetFileTool,
  run as runCveRepoGetFile,
} from "./src/tools/cve-repo-get-file.js";
import { tool as cveForkPushTool, run as runCveForkPush } from "./src/tools/cve-fork-push.js";
import { tool as cvePrGetTool, run as runCvePrGet } from "./src/tools/cve-pr-get.js";
import { tool as cveReviewPrTool, run as runCveReviewPr } from "./src/tools/cve-review-pr.js";
import { tool as cvePostReviewTool, run as runCvePostReview } from "./src/tools/cve-post-review.js";
import { tool as oedLoginTool, run as runOedLogin } from "./src/tools/oed-login.js";
import { tool as oedAuthStatusTool, run as runOedAuthStatus } from "./src/tools/oed-auth-status.js";
import { tool as oedAuthLogoutTool, run as runOedAuthLogout } from "./src/tools/oed-auth-logout.js";
import { tool as oedDiagnoseTool, run as runOedDiagnose } from "./src/tools/oed-diagnose.js";
import {
  tool as oedReportIssueTool,
  run as runOedReportIssue,
} from "./src/tools/oed-report-issue.js";
import { skill as helpSkill } from "./src/skill-help.js";

export const name = "oed-dsh";
export const inject = ["tools", "skills"];

/** Configuration schema, validated at activation by the Harness. */
export const Config = z.object({
  gateway: z.string().default("https://api-gateway.osinfra.cn"),
  community: z.string().default("openeuler"),
  cacheTtlMs: z.number().default(600_000),
  maxResponseChars: z.number().default(64_000),
  allowMutations: z
    .boolean()
    .default(false)
    .volatile()
    .description("允许写操作（需已登录 + 写前审批）；关闭时写操作被 mutation_blocked 拦截。"),
  readOnlyAllowlist: z.array(z.string()).default([]),
  // Volatile fields are the only ones surfaced to the Plugins config form
  // (DSH ≥0.1.7 derives the form from Volatile<T> fields). Enum schemas render
  // as dropdowns.
  atomgitToken: z
    .string()
    .default("")
    .volatile()
    .description(
      "AtomGit 个人令牌，用于发布 CVE 影响性分析评论和提交修复 PR。留空表示不配置。创建地址 https://atomgit.com/setting/token-classic/create",
    ),
  riskAutoApprove: z
    .union([z.const("never"), z.const("medium"), z.const("high")])
    .default("never")
    .volatile()
    .description(
      "遇到风险时是否自动继续而不询问。never=中高风险都停下询问（默认）；medium=中风险自动、高风险询问；high=中高风险都自动仅报告。风险等级：低=已修复（自动跳过）；中=同线 patch 升级（可能改 ABI）；高=backport 冲突/跨系列/ABI 变化/构建失败/组件存疑。",
    ),
  localVerify: z
    .union([z.const("none"), z.const("lightweight"), z.const("docker")])
    .default("lightweight")
    .volatile()
    .description(
      "提 PR 前在本地的验证方式。none=跳过；lightweight=git apply --check + grep 源码（默认，各平台可用）；docker=本地容器 rpmbuild -bp（需容器运行时：macOS 用 Docker Desktop/OrbStack/Colima，Windows 用 WSL2，Linux 用 docker/podman）。无论哪种，提 PR 后都会轮询上游 CI 状态。",
    ),
});

function register(ctx, runtime, { name: toolName, description, parameters, run }) {
  ctx.tools.register(
    defineTool({
      name: toolName,
      description,
      parameters,
      output: {
        schema: { type: "object", additionalProperties: true },
        render: (_args, value) => [
          {
            type: "text",
            text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
          },
        ],
      },
      async execute(args, exec) {
        try {
          return sanitizeJson(await run(runtime, args, exec?.signal));
        } catch (err) {
          // Surface a single, actionable line to the model, preserving the cause.
          throw new Error(toToolErrorMessage(err), { cause: err });
        }
      },
    }),
  );
}

export function apply(ctx, config) {
  const runtime = buildRuntime(config, process.env ?? {});
  register(ctx, runtime, { ...servicesTool, run: runServices });
  register(ctx, runtime, { ...schemaTool, run: runSchema });
  register(ctx, runtime, { ...invokeTool, run: runInvoke });
  register(ctx, runtime, { ...cveIssueTool, run: runCveIssue });
  register(ctx, runtime, { ...cveCommentTool, run: runCveComment });
  register(ctx, runtime, { ...cveVersionTool, run: runCveVersion });
  register(ctx, runtime, { ...cvePostTool, run: runCvePost });
  register(ctx, runtime, { ...cveFixTool, run: runCveFix });
  register(ctx, runtime, { ...cveOpenPrTool, run: runCveOpenPr });
  register(ctx, runtime, { ...cveBuildTool, run: runCveBuild });
  register(ctx, runtime, { ...cveBuildWaitTool, run: runCveBuildWait });
  register(ctx, runtime, { ...cveRepoGetFileTool, run: runCveRepoGetFile });
  register(ctx, runtime, { ...cveForkPushTool, run: runCveForkPush });
  register(ctx, runtime, { ...cvePrGetTool, run: runCvePrGet });
  register(ctx, runtime, { ...cveReviewPrTool, run: runCveReviewPr });
  register(ctx, runtime, { ...cvePostReviewTool, run: runCvePostReview });
  register(ctx, runtime, { ...oedLoginTool, run: runOedLogin });
  register(ctx, runtime, { ...oedAuthStatusTool, run: runOedAuthStatus });
  register(ctx, runtime, { ...oedAuthLogoutTool, run: runOedAuthLogout });
  register(ctx, runtime, { ...oedDiagnoseTool, run: runOedDiagnose });
  register(ctx, runtime, { ...oedReportIssueTool, run: runOedReportIssue });

  // Routing skill: makes openEuler tasks auto-route to the oed tools instead
  // of web search. Registered on the skill registry (host plane).
  ctx.skills.register(skill);
  ctx.skills.register(cveTriageSkill);
  ctx.skills.register(cveRepairSkill);
  ctx.skills.register(cveReviewSkill);
  ctx.skills.register(communitySkill);
  ctx.skills.register(helpSkill);
}
