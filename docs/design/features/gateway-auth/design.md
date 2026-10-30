# gateway auth 设计

> 状态：草案（待评审） · 关联 issue：[#3](https://atomgit.com/ZhengZhenyu/oed-dsh/issues/3) · 对齐：oed-cli auth

## 1. 交付形态

- **工具**：`oed_login`（device flow 登录）、`oed_auth_status`（状态）、`oed_auth_logout`（登出）。
- **复用**：`oed_invoke`（自动注入 Bearer）、`src/core/http`（Header 注入）、`config`（`allowMutations`）。

## 2. 认证流程（RFC 8628 device flow，对齐 oed-cli）

```
oed_login
  → POST device_authorization_url（client_id + scope）→ device_code / user_code / verification_uri / interval
  → 展示 verification_uri + user_code（不写日志）
  → 轮询 token_url（grant_type=urn:ietf:params:oauth:grant-type:device_code）
  → 存 access_token + refresh_token + allow-list 到 auth.json
  → 后续 oed_invoke 自动带 Authorization: Bearer <token>
```

### 端点与参数（默认值，env 可覆盖）

| 项 | 值 |
|---|---|
| issuer（`OED_DEVICE_URL`） | `https://omapi.osinfra.cn/oneid/oidc` |
| client_id（`OED_APP_ID`） | `623c3c2f1eca5ad5fca6c58a`（公共客户端） |
| device_authorization_url | `https://omapi.osinfra.cn/oneid/oidc/device/code` |
| token_url | `https://omapi.osinfra.cn/oneid/oidc/token` |
| cli_user_data_url（allow-list） | `https://omapi.osinfra.cn/oneid/oidc/device/user-data` |
| scopes | `email id_token`（+ 服务端保留 `openid profile offline_access`） |
| allow-list 响应形状 | `{"data": "service-a,service-b,..."}` |

> JS 侧手工实现 RFC 8628（不用 MSAL）。`id_token` 必须显式出现在 scope 里，否则 oneid 不在 `/token` 返回 id_token（refresh 会坏）；access_token TTL 约 120s，需 refresh_token 静默续期。

## 3. token 存储与优先级

- 存储：`auth.json`（`access_token` / `refresh_token` / `allowlist`），对齐 oed-cli，CI/已登录用户可复用。
- 优先级：`OED_TOKEN` env > 存储 token；`OED_COOKIE` 同 oed-cli 语义。

## 4. allow-list（本地校验）

- 登录时拉取用户已授权的服务列表，存本地；
- 调用列表外服务 → `service_blocked_by_allowlist`（本地判断，无 HTTP）；
- `auth.json` 缺失 / 无 allowlist / 列表为空 → fail-open（对齐 oed-cli）。

## 5. 写操作 + 审批

- 写操作判定沿用 `policy.js`；
- 执行条件：`allowMutations=true` + 已认证 + 写前审批（`ask_user_question` 弹选项）；
- 任一不满足 → `mutation_blocked` / `auth_required`，fail-closed。

## 6. 错误语义

| 场景 | kind |
|---|---|
| 未认证调 identity-gated 服务 | `auth_required` |
| 调 allow-list 外服务 | `service_blocked_by_allowlist` |
| 写操作未开启/未审批 | `mutation_blocked` |
| device flow 超时/被拒 | `auth_denied` / `auth_timeout` |

## 7. ADR

| # | 决策 |
|---|---|
| ADR-29 | 认证采用 oed-cli 同款 oneid device flow（RFC 8628），复用 `auth.json` 存储与 `OED_TOKEN`/`OED_COOKIE` env 兼容 |
| ADR-30 | 写操作 = `allowMutations=true` + 已认证 + 写前审批（`ask_user_question`），默认 fail-closed |
| ADR-31 | allow-list 本地校验，`auth.json` 缺失时 fail-open（对齐 oed-cli） |

## 8. 风险

- device flow 端点/流程与 oed-cli 不一致 → 实现时以 oed-cli 源码为准对齐；
- 网关间歇不可达 → 登录/轮询失败给出可重试错误，不阻塞只读功能；
- token 泄漏 → 复用 redactToken，不落日志/对话。
