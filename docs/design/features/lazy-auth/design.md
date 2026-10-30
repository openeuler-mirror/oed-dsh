# lazy-auth 设计

> 状态：草案（待评审） · 关联 issue：[#1](https://atomgit.com/openeuler/oed-dsh/issues/1) · 依赖：gateway-auth

## 1. 交付形态

- **主要**：改 `oed-dsh` 路由 skill 的排错规则（prompt 层），把 `auth_required` 从「终止报错」改为「可恢复信号 → 自动登录 → 重试」。
- **次要**：改 `auth_required` 错误提示为更引导式的表述（如「正在发起登录…」）。
- **代码侧不动**：`auth_required` / `mutation_blocked` 的判定逻辑已存在。

## 2. 数据流

```
用户：「提交构建 xxx」
  → oed_invoke → auth_required
  → agent 自动 oed_login（无参）→ 展示授权链接给用户
  → 用户点链接授权
  → agent oed_login(deviceCode) → 完成登录
  → agent 重试 oed_invoke 原操作 → 成功
```

## 3. 错误语义调整

| 场景 | 之前 | 之后 |
|---|---|---|
| `auth_required` | 报错，提示「run oed_login first」 | 视为可恢复：agent 自动发起登录并重试 |
| `auth_denied` / `auth_timeout` | 报错 | 明确告知「授权被拒 / 超时」，不无限重试 |

## 4. ADR

| # | 决策 |
|---|---|
| ADR-38 | 登录触发从显式改为按需：`auth_required` 视为可恢复信号，由 agent 自动发起 `oed_login` 并重试原操作，而非终止报错；只读操作永不触发登录 |

## 5. 风险

- **循环重试**：登录成功后仍 `auth_required`（如 token 未生效）→ 用 FR-4 约束：失败给出反馈、不无限重试。
- **授权链接展示时机**：agent 需先返回链接、等待用户授权，再重试 → 沿用现有 `oed_login` 两段式，不改动。
