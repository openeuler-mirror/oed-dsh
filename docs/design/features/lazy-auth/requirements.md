# lazy-auth 需求分析

> 状态：草案（待评审） · 关联 issue：[#1](https://atomgit.com/openeuler/oed-dsh/issues/1) · 依赖：gateway-auth

## 1. 背景与问题

oneid 登录目前是**显式触发**：写操作 / identity-gated 服务遇到未登录时，`oed_invoke` 返回 `auth_required`，agent 只报错，用户得主动说「登录 openEuler」才触发 `oed_login`。这让用户被迫感知 oneid 的存在，违背「用户对 oneid 零感知」的目标。

## 2. 目标 / 非目标

### 目标

- **G1** 写操作 / identity-gated 服务未登录时，agent 自动发起登录（`oed_login`）并引导用户授权，成功后自动重试原操作。
- **G2** 用户全程只做「点链接授权」，不需要知道 oneid / `oed_login`。
- **G3** 只读操作永不触发登录。

### 非目标

- 不改 device flow 本身（浏览器授权仍不可避免）。
- 不做 DSH 级的 auth 挑战 UI（超出当前插件能力）。

## 3. 功能需求

| ID | 需求 | 说明 |
|---|---|---|
| FR-1 | `auth_required` 触发登录 | agent 遇到 `auth_required` 时，自动调用 `oed_login` 发起登录并展示授权链接。 |
| FR-2 | 自动重试 | 登录完成后，agent 自动重试原操作。 |
| FR-3 | 只读不触发 | 只读操作不登录、不弹任何提示。 |
| FR-4 | 失败反馈 | 登录被拒 / 超时给出清晰反馈，不无限重试。 |

## 4. 验收标准

- 未登录执行写操作 → agent 自动发起登录 → 用户点链接授权 → agent 自动重试原操作并成功；
- 用户不需要手动说「登录」；
- 只读操作不触发登录。
