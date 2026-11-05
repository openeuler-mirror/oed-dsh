/**
 * Plugin self-help skill (pure data): installation, configuration, and
 * troubleshooting for oed-dsh itself, plus how to report a bug.
 */
export const skill = {
  name: "oed-help",
  source: "oed-dsh",
  description:
    "openEuler Infra（oed-dsh）插件的使用帮助：安装、配置、常见问题排错，以及遇到 bug 时的反馈方式。当用户问插件本身怎么用 / 怎么配 / 报错怎么办时使用。",
  whenToUse: "任务涉及 oed-dsh 插件本身的使用、配置、安装、排错、或反馈 bug 时。",
  content: `# openEuler Infra 帮助（oed-help）

这是 oed-dsh 插件的使用帮助。用户问插件相关问题时，直接据此回答。

## 快速上手（示例）

新会话里直接问，agent 会自动路由到 oed 工具：

- 「列出 openEuler 服务」
- 「查 CVE-2019-10082 的安全公告」
- 「分析 https://atomgit.com/src-openeuler/ffmpeg/issues/267 并生成影响性分析评论」
- 「审查 https://atomgit.com/src-openeuler/postgresql-17/pulls/32」
- 「查某天例会」·「搜 SIG 文档」·「论坛最新帖」（非 CVE 社区服务，见 oed-community）

## 安装

- npm：\`dsh plugin --profile web add oed-dsh@<版本>\`
- Git 地址：Plugins → 添加插件 → Git 地址 → https://atomgit.com/openeuler/oed-dsh.git
- 本地目录：Plugins → 添加插件 → 本地目录（开发调试）

装完启用 + 重启 DSH。

## 配置

Plugins 页 → openEuler Infra 配置页，4 项：AtomGit 令牌 / 风险自动处理 / 本地预检 / 允许写操作。
环境变量（CI 场景）：\`ATOMGIT_TOKEN\` / \`OED_TOKEN\` / \`OED_APP_ID\` / \`OED_CACHE_DIR\`。
填完 AtomGit 令牌后，可让 agent 用 \`oed_diagnose\` 校验令牌是否有效（返回 \`atomgitTokenValid\`）。

## 常见问题排错

- 报 \`atomgit_token_missing\` → 没配 AtomGit 令牌，去配置页填（或设 \`ATOMGIT_TOKEN\`）。
- 报 \`auth_required\` → 需 oneid 登录；agent 会自动发起登录、弹授权链接，点一下即可。
- 报 \`mutation_blocked\` → 写操作被拦；去配置页开「允许写操作」。
- web boot 失败 / import failed / duplicate factory registration → 插件包名与 client.js 模块 id 不一致，更新到最新版。
- 报 \`network_error\` → 网关临时不可达，稍后重试。

## 遇到 bug

用 \`oed_diagnose\` 诊断本地状态，再用 \`oed_report_issue\` 提 bug issue（附诊断信息）。`,
};
