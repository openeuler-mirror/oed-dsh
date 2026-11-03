# build CI 轮询 设计

> 状态：草案（待评审） · 关联 issue：[#5](https://atomgit.com/openeuler/oed-dsh/issues/5) · 依赖：cve-build / oed_invoke

## 1. 交付形态

- **新工具** `cve_build_wait`（或增强 `cve_build` 增加 wait 能力）：给定构建/任务标识，轮询 CI 状态直到终态。
- **复用**：`oed_invoke`（只读查询 eulermaker / pkgcontrib）。
- **核心**：`src/core/build-wait.js` 的轮询状态机（可离线单测）。

## 2. 数据流

```
cve_build_wait(service, operation, params, { interval, timeoutMs })
  → 循环：oed_invoke(service, operation, params)
  → 判断终态（成功 / 失败 / 运行中）
  → 到终态 → 返回汇总
  → 超时 → 返回当前状态 + timeout 提示
```

## 3. 轮询状态机（核心逻辑）

- 输入：`service`（eulermaker / pkgcontrib）、`operation`（状态查询操作）、`params`（构建/任务 id 等）、`interval`（默认 30s）、`timeoutMs`（默认 30min）。
- 终态判定：由调用方传入的 `isTerminal(data)` 判定函数（或按约定的状态字段/枚举）。
- 只读：仅调用 `oed_invoke` 的 GET 类状态查询。

## 4. 待实现时核实

- eulermaker / pkgcontrib 的**确切状态操作名、参数、返回结构、终态枚举**（运行时用 `oed_operation_schema` 发现，或对照 oed-cli）。
- 终态字段名（如 `status` / `state`，成功值 / 失败值）。

## 5. ADR

| # | 决策 |
|---|---|
| ADR-40 | CI 轮询封装为「轮询到终态」的能力（`cve_build_wait`），复用 `oed_invoke` 只读查询；带间隔 + 超时，不无限轮询 |

## 6. 风险

- eulermaker / pkgcontrib 的状态接口不稳定 → 轮询失败需可重试 + 明确报错。
- 终态枚举各服务不一致 → `isTerminal` 按服务适配，失败时 fail-closed 返回原始数据 + 提示人工确认。
