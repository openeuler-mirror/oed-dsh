/**
 * Routing skill for oed-dsh (pure data, no DSH imports).
 *
 * DSH gives the model a flat list of tools (web search, bash, oed_*, …) and a
 * skill catalog. Without a skill, a generic query like "列出 openEuler 的 SIG"
 * matches web search just as well as our tools, so the model defaults to web
 * search. This skill's keyword-rich description routes openEuler tasks to the
 * oed tools instead. The body loads on demand; only name + description stay in
 * the catalog each turn.
 */
export const skill = {
  name: "oed-dsh",
  source: "oed-dsh",
  description:
    "Query and call openEuler community services (SIG groups, CVE advisories, packages, meetings, forums, mail lists, issues/PRs, EulerMaker builds, AtomGit repos) with oneid auth; use only oed_services / oed_operation_schema / oed_invoke against the Infra gateway (writes auto-login on demand), never web-search or hand-write curl. 查询和调用 openEuler 社区服务（SIG 组、CVE 公告、软件包、例会、论坛、邮件列表、Issue/PR、EulerMaker 构建、AtomGit 仓库），含 oneid 登录；只用 oed_services/oed_operation_schema/oed_invoke 访问网关（写操作按需自动登录），不要 web search、不要手写 curl。",
  whenToUse:
    "Tasks touching openEuler community, SIG, CVE, packages, meetings, forums, mail lists, issues/PRs, EulerMaker, or AtomGit. 涉及 openEuler 社区、SIG、CVE、软件包、会议、论坛、邮件列表、Issue/PR、EulerMaker、AtomGit 的任务。",
  content: `# openEuler Infra（oed-dsh）

用下面这些工具访问 openEuler Infra 网关。不要用 web search 查 openEuler 社区数据，也不要手写 curl。

## 工作流

1. \`oed_services\` —— 列出可用服务（当前 13 个）。
2. \`oed_operation_schema\`（service, operation）—— 查某个操作的 method/path/参数 flag/body schema。**别猜参数名**。
3. \`oed_invoke\`（service, operation, params?, body?, dryRun?）—— 发起调用，返回 JSON。

## 认证（写操作 / identity-gated 服务需要）

- **按需（懒加载）登录**：写操作 / identity-gated 服务未登录时（\`auth_required\`），**不要只报错**——自动调用 \`oed_login\` 发起登录、把授权链接展示给用户；用户授权完成后**自动重试原操作**。只读操作永不触发登录。
- \`oed_login\` —— 登录：不带参数发起，返回一个**可直接点击的授权链接**（可能已预填用户码），把链接展示给用户；用户授权后，用返回的 \`deviceCode\` 再次调用 \`oed_login\`（会自动轮询直到完成）。
- \`oed_auth_status\` —— 查看是否已登录。
- \`oed_auth_logout\` —— 登出。

## 硬规则

- query/path 参数放 \`params\`（对象）；POST/PUT/PATCH 的请求体放 \`body\`（对象）。
- 调用前先 \`oed_operation_schema\` 拿参数，不要凭记忆猜 flag。
- 写操作需：\`allowMutations\` 开启 + 已登录（\`oed_login\` / \`OED_TOKEN\`）+ **写前审批**。
- 写操作前先展示将执行的 service/operation/body，用 \`ask_user_question\` 弹选项（「执行」「取消」），用户确认后再 \`oed_invoke\`。
- 只读操作永不触发登录、不弹提示。

## 常见任务对照

| 需求 | 工具调用 |
|---|---|
| 找 SIG 组 / 搜 SIG 文档 | \`search.searchSigByKeyword\`，body: {keyword, keywordType, pageNum, pageSize} |
| 查 CVE 安全公告 | \`cve.getSecurityNoticeByCveId\`，params: {cveId} |
| 看例会 | \`meeting.listMeetings\`，params: {date} |
| 查软件包 | \`easysoftware\` / \`pkgcontrib\` / \`eur\` 的查询类操作 |
| Issue/PR | \`quickissue\`（看板）/ \`ag\`（AtomGit，需登录） |
| EulerMaker 构建 | \`eulermaker\` 的查询类操作 |

> 非 CVE 社区服务（SIG 搜索 / 例会 / 论坛 / 软件包）的详细 quirks（forum 托管头、search body 形状、响应路径）见 \`oed-community\` skill。

## 排错

- 报 \`service_not_found\` / \`method_not_found\` → 先 \`oed_services\`，再 \`oed_operation_schema\` 看可用操作。
- 报 \`network_error\` → 稍后重试（插件自带退避重试）。
- 报 \`auth_required\` → **可恢复信号**：自动调用 \`oed_login\` 发起登录、展示授权链接；用户授权后自动重试原操作；授权被拒 / 超时则明确告知并停止，不无限重试。
- 报 \`mutation_blocked\` → 写操作需开启 \`allowMutations\`。`,
};
