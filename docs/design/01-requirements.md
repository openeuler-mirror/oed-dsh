# 需求分析

> 状态：草案（待评审） · 版本 0.1 · 归属：oed-dsh 项目

## 1. 背景与问题

openEuler 社区服务通过 Infra API 网关暴露，`oed-cli`（Python）已用"运行时发现 + 动态命令"的方式解决了 CLI/Agent 的调用问题。但 DeepSeek Harness（DSH）用户若想使用这些能力，目前要么装 Python CLI + 手配 PATH + 拷 skill（重），要么没有原生入口。

本项目的目标是把同一个网关访问能力以 **DSH 原生插件**的形态交付，让 DSH 用户获得"装插件即可用"的体验。

## 2. 目标 / 非目标

### 目标（Goals）

- **G1 零安装**：DSH 用户安装插件后即可调用 openEuler 服务，不装 Python、不装 oed-cli、不配置网关地址。
- **G2 能力等价**：覆盖 `oed-cli` 的核心只读能力——服务发现、操作 schema 探查、真实调用（MVP 只读）。
- **G3 契约一致**：与 `oed-cli` 对网关的解释一致（feed/OpenAPI、WAF 头、base_url 规则、错误语义）。
- **G4 专业工程**：可测试、可维护、可发布（npm + DSH 市场索引）、可治理（openEuler SIG）。
- **G5 可演进**：核心逻辑与 DSH 解耦，未来可复用到 MCP server 等其它形态。

### 非目标（Non-goals）

- 不重写 oed-cli；不替代终端/CI 场景（那些继续用 oed-cli）。
- P0 不做写操作、不做认证（device flow）、不做 UI 面板。
- 不做"每个 operation 一个工具"（365+ 个工具会撑爆上下文）。
- 不在 P0 内置多社区/企业网关配置界面（用配置项兜底，默认 openeuler 生产网关）。

## 3. 角色与场景

| 角色 | 场景 | 诉求 |
|---|---|---|
| DSH 用户 | 让 agent 查 CVE 公告、找 SIG 文档、看例会、查软件包/Issue | 装插件即用；agent 自动发现并调用；不猜参数 |
| openEuler 贡献者 | 在 DSH 里辅助日常贡献查询 | 稳定、只读安全、结果可复现 |
| 插件维护者 | 迭代/发布/排查 | 清晰架构、离线测试、可追溯的发布流程 |

## 4. 功能需求（按优先级）

> 优先级：P0 = MVP 必做；P1 = 二期；P2 = 远期。

### P0 — 只读 MVP

| ID | 需求 | 说明 |
|---|---|---|
| FR-1 | 服务发现 `oed_services` | 返回社区服务清单（service_name、title、description、community）。等价 `oed services`。 |
| FR-2 | 操作探查 `oed_operation_schema` | 入参 `service`、`operation`；返回 method/path/url、参数表（name/in/required/flag/type）、body_schema/body_required_fields、usage。等价 `oed <service> <operation> --help` 的语义。 |
| FR-3 | 真实调用 `oed_invoke` | 入参 `service`、`operation`、`params`(object, query/path)、`body`(object, POST/PUT/PATCH)、`dryRun`(bool)；校验服务/操作存在；只读策略放行只读操作（含查询型 POST），写操作拒绝（P0）；返回 `{ok, status, url, method, service, operation, response}`；错误返回结构化 `kind + hint`。 |
| FR-4 | 缓存 | discovery feed 与 per-service spec 缓存，TTL 600s（P0 内存即可；磁盘缓存 P1）。 |
| FR-5 | 网关/WAF 适配 | 复刻浏览器风格头（UA/Accept/Accept-Language，不带默认 Referer）；host 仅取 feed 的 `base_url`，忽略 spec 的 backend address；非 https 拒绝。 |
| FR-6 | 错误模型 | `kind` 对齐 oed-cli：`service_not_found`/`method_not_found`/`spec_missing`/`network_error`/`waf_block`/`upstream_error`/`insecure_base_url`/…，映射为工具错误信息（含 hint）。 |
| FR-7 | 插件元数据 | bundle 清单（`dsh.bundle.patch`）、`engines.dsh`、locale（en/zh）title/description、icon。 |
| FR-8 | 测试与契约 | fixtures 驱动的离线单测；与 oed-cli 的 golden 契约对齐（operation 表、flag 推导、body schema）。 |

### P1 — 认证与安全

| ID | 需求 |
|---|---|
| FR-9 | 登录 `oed_login`：oneid RFC 8628 device flow，工具结果返回 verification URL + user code，后台轮询；兼容 `OED_TOKEN`/`OED_COOKIE` 环境变量。 |
| FR-10 | 写操作开关 + 审批：`allowMutations` 配置（默认 false）；开启后用工具 guard / `tools/pre-execute` 请求审批。 |
| FR-11 | token 安全存储：不落日志、不落工具结果；存储方案随认证设计（keyring 或 0600 文件）。 |
| FR-12 | 可选 UI 面板（服务浏览器/最近调用）。 |

### P2 — 体验与扩展

| ID | 需求 |
|---|---|
| FR-13 | MCP server（`oed mcp`）复用 core，跨 harness（Claude Code/Cursor/Codex）。 |
| FR-14 | 大响应控制：`maxResponseChars`、分页提示、结构化渲染。 |
| FR-15 | 磁盘缓存 + 缓存完整性（时间戳/格式校验）。 |

## 5. 非功能需求

| ID | 需求 | 度量/验收 |
|---|---|---|
| NFR-1 | 零运行时依赖 | 生产 `dependencies` 为空；仅 Node 内建模块 |
| NFR-2 | 体积小、无构建 | 源码包 < 100KB；ESM 直发（无打包步骤） |
| NFR-3 | 安全默认 | 只读默认；不记录凭据；写操作需审批；错误信息不泄 token |
| NFR-4 | 兼容性 | 目标 DSH 桌面版；macOS/Windows/Linux；`engines.dsh` 显式声明 |
| NFR-5 | i18n | 插件元数据与关键提示 en/zh |
| NFR-6 | 可观测 | 诊断走 stderr/DSH 日志，不污染工具结果 |
| NFR-7 | 可维护 | 模块单一职责；JSDoc 类型标注；核心路径单测覆盖 |

## 6. 约束

- **平台/治理**：主仓 AtomGit（先个人，后迁 `openEuler/oed-dsh`）；Apache-2.0；openEuler CLA/DCO 按 SIG 要求。
- **分发**：npm 包（暂定名 `dsh-oed`）+ DSH 插件市场索引（URL 用非个人稳定地址，方案见架构 ADR）。
- **语言/运行时**：ESM JavaScript；Node ≥20 特性；不 import DSH 私有包于 core。
- **契约源**：网关 discovery feed 与 OpenAPI 是唯一事实源；oed-cli 作为参考实现，不与插件做代码级共享。

## 7. 验收标准（P0 完成定义）

- 用户在 DSH 里安装 bundle（本地目录/npm）后，**不装 CLI** 即可让 agent 完成：`oed_services` → `oed_operation_schema` → `oed_invoke` 一次真实只读调用（如 CVE 查询）。
- 只读默认生效：写操作被拒并给出可读原因。
- `npm run lint`、`npm test`（离线）全绿；fixtures 可复现。
- Plugins 页正确显示中英文标题/描述与图标；`engines.dsh` 匹配目标 DSH 版本。
