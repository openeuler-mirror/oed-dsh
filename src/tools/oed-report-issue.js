import { createIssue } from "../core/atomgit.js";

export const tool = {
  name: "oed_report_issue",
  description:
    "向 openeuler/oed-dsh 仓库创建 bug / feature issue（写操作）。先展示草稿并用 ask_user_question 确认后再调用；需 AtomGit 令牌。",
  parameters: {
    type: { type: "string", description: "issue 类型：bug 或 feature，默认 bug" },
    title: { type: "string", required: true, description: "issue 标题" },
    body: { type: "string", required: true, description: "issue 描述（含复现步骤、诊断信息等）" },
  },
};

export async function run(runtime, args, signal) {
  const kind = args.type === "feature" ? "feature" : "bug";
  const title = `${kind === "bug" ? "[bug]" : "[feature]"} ${args.title ?? ""}`.trim();
  const body = args.body ?? "";
  const result = await createIssue("openeuler", "oed-dsh", {
    title,
    body,
    token: runtime.atomgitToken,
    signal,
  });
  return { ...result, repo: "openeuler/oed-dsh" };
}
