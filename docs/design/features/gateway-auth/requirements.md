# gateway auth 需求分析

> 状态：草案（待评审） · 关联 issue：[#3](https://atomgit.com/ZhengZhenyu/oed-dsh/issues/3) · 对齐：oed-cli auth

## 1. 背景与问题

oed-dsh 的通用调用（`oed_invoke`）已能发现并调用网关的全部操作，但：

- 无 oneid 认证，identity-gated 服务（`eulermaker` / `pkgcontrib` / `meeting` …）的写操作和部分读不可用；
- 写操作默认被 `mutation_blocked` 拦，没有「认证 → 审批 → 执行」的完整写流程。

这使「零安装调用 openEuler 社区服务」的完整闭环（含写操作）未打通。

## 2. 目标 / 非目标

### 目标

- **G1** 实现 `oed login` 的等价物（oneid OAuth device flow），认证后 `oed_invoke` 自动带 `Authorization: Bearer <token>`。
- **G2** 复用 oed-cli 的 `auth.json` 存储格式与 `OED_TOKEN` / `OED_COOKIE` 兼容。
- **G3** 写操作在 `allowMutations=true` 且已认证、且写前审批后执行。

### 非目标

- 不改 AtomGit PAT（已直连实现）；不做 SSO / 企业定制。

## 3. 功能需求

| ID | 需求 | 说明 |
|---|---|---|
| FR-1 | 设备流程登录 | RFC 8628 device flow：取 device code → 展示 URL + user code → 轮询 access_token / refresh_token。 |
| FR-2 | token 存储 | access_token / refresh_token 存入 `auth.json`（对齐 oed-cli）；`OED_TOKEN` env 优先；`OED_COOKIE` 兼容。 |
| FR-3 | token 注入 | 认证后 `oed_invoke` 自动带 `Authorization: Bearer <token>`。 |
| FR-4 | allow-list | 登录时拉取并本地存储；调用列表外服务 → `service_blocked_by_allowlist`（本地校验，缺失时 fail-open）。 |
| FR-5 | 状态 / 登出 | 查看登录态、token 指纹、allow-list；登出清除 token。 |
| FR-6 | 写操作 + 审批 | 写操作需 `allowMutations=true` + 已认证 + 写前审批（`ask_user_question`）。 |
| FR-7 | 错误语义 | `auth_required` / `service_blocked_by_allowlist` / `mutation_blocked`。 |

## 4. 非功能需求

| ID | 需求 | 说明 |
|---|---|---|
| NFR-1 | 安全 | token 不落日志、不进对话正文；device flow 的 user code 不写日志。 |
| NFR-2 | 兼容 | 复用 oed-cli 的 `auth.json` 格式与 env 变量，CI / 已登录用户可复用凭据。 |
| NFR-3 | 确定性 | device flow 状态机、allow-list 校验可离线单测。 |

## 5. 验收标准

- 能完成 device flow 登录并存储 token；`oed_invoke` 自动带 Bearer；
- 认证后可调用 identity-gated 服务的读操作；
- 写操作未认证 / 未审批时给出明确错误。
