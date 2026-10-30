# Changelog

本文件遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [0.1.0] - 2026-10-30

### Added

- CVE 仓库操作（ADR-32~37）：`cve_repo_get_file`（读仓库文件/目录，直连 AtomGit 公开 API）、`cve_fork_push`（幂等 fork + git CLI 推送修复文件，返回 head 供 `cve_open_pr` 消费）、`src/core/git.js` 的 `pushFilesToFork`；`cve_fix_prepare` 新增 `patchCheck` 风险输入（ADR-35）。
- 传输路由规则（ADR-37）：AtomGit 平台对象直连 `atomgit.js` + PAT，openEuler 社区后端走网关 + oneid；`ag` 服务在插件内 deprecated。
- 需求、架构、开发流程设计文档（Phase 0）。
- P0 只读插件骨架：`oed_services` / `oed_operation_schema` / `oed_invoke` 三个元工具。
- 纯 JS `src/core`（discovery/http/operations/invoke/errors）与离线 fixtures 单测。
- npm/ESLint/Prettier 工程化配置与 `npm run ci`。
- 只读策略模块 `src/core/policy.js`：safe-method + 只读关键词 + 显式白名单，fail-closed。
- HTTP 瞬态失败重试（退避）+ 超时，区分可重试/不可重试错误。
- CVE triage 需求分析与设计文档（`docs/design/features/cve-triage/`）。
- CVE triage 实现：`cve_issue`（读 issue/评论并解析）+ `cve_package_version`（读各分支 spec `Version:`）+ `cve_triage_comment`（校验并渲染 5 模块评论）+ `cve_post_comment`（直连 AtomGit 发评论）+ `cve-triage` skill + 版本比较/词表校验（`src/core/cve-triage.js`、`src/core/atomgit.js`）。
- CVE repair 实现（ADR-16~23）：`cve_fix_prepare`（升级/backport 草稿 + 风险报告 + 修复配方 recipe）、`cve_open_pr`（直连 AtomGit 提 PR）、`cve_build`（本地预检计划 + 上游 CI 轮询）、`cve-repair` skill、版本系列/补丁/changelog 生成（`src/core/cve-repair.js`）。
- CVE review 实现（ADR-24~28）：`cve_pr_get`（读 PR + cve/sync/other 三态范围门禁）、`cve_review_pr`（清单判定 + verdict）、`cve_post_review`（发 review 评论）、`cve-review` skill（9 项清单 + sync 反合 PR 轻量 review，`src/core/cve-review.js`）。
- oneid 认证（ADR-29~31）：`oed_login`（RFC 8628 device flow，一键授权链接 + 自动轮询）、`oed_auth_status`（登录态/token 指纹/allow-list）、`oed_auth_logout`；token 存 `auth.json`、`oed_invoke` 自动注入 Bearer；allow-list 本地校验（`service_blocked_by_allowlist`）；`src/core/auth.js`。
- GUI 配置页：`atomgitToken` / `riskAutoApprove` / `localVerify` / `allowMutations` 四个 Volatile 字段；枚举用原生 select、布尔用 checkbox、令牌密文 + 显隐切换。
- 插件图标：官方 openEuler 纵向 logo（`vertical-left.svg`）。

### Changed

- 只读判定从「仅 GET」改为策略化判定，放行网关用于查询的 POST（如 `search`）。
- CVE triage 受影响判定改为「上游漏洞区间 vs 各分支当前包版本」为主 + 源码确认；cve 公告降为老 CVE 可选交叉核对（不依赖网关）。
- 发评论不再经 openEuler 网关的 `ag` 服务，改为 `cve_post_comment` 直连 AtomGit API（`ATOMGIT_TOKEN`）。
- CVE 修复方式收敛为 upgrade / backport 两种（删除 changelog_record）；分支模型按大版本只修最新 SP，旧 SP 走机器人反合。
- 配置字段标 `Volatile<T>` 以适配 DSH ≥0.1.7 的 settings 重写（只有 Volatile 字段进配置表单）。
- 写操作需 `allowMutations` + oneid 登录 + 写前审批；未认证写操作报 `auth_required`，未开启报 `mutation_blocked`。
- License 从 Apache-2.0 改为 Mulan PSL v2（对齐 openEuler 生态）。

### Fixed

- 本地链接安装时插件无法加载：补 `@deepseek-ai/dsh-tools`/`@deepseek-ai/schemastery` devDependencies，并修正工具 `output`/`parameters` 的 JSON Schema（显式 `additionalProperties`）。
- 工具返回 `undefined` 导致 DSH 报 "not lossless JSON"：`oed_operation_schema` 的 `altFlag` 改 `null`，并在 `register` 统一 `sanitizeJson` 保证所有工具输出 lossless JSON。

### Security

- 默认只读；非只读操作在 `allowMutations=false` 时以 `mutation_blocked` 拒绝。
