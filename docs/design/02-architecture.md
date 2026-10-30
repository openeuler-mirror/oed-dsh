# 架构设计

> 状态：草案（待评审） · 版本 0.1

## 1. 核心设计原则

1. **core / adapter 分层**：网关访问逻辑（core）是纯 JS，不 import 任何 `@deepseek-ai/*` 包；DSH 集成只出现在极薄的 `index.js` 适配层。
   - 原因：npm 上公开的 DSH 包版本落后于桌面端安装版（`dsh` npm `0.2.0-rc.2` vs 桌面 `0.2.1-rc.2`），pin npm 会引入陈旧 API；core 解耦后 CI 无需 DSH 即可跑全部单测。
   - 收益：未来 MCP server 直接复用 core；适配层几乎无逻辑、无需单测。
2. **元工具而非穷举工具**：3 个元工具覆盖 365+ operation，schema 稳定、上下文可控。
3. **契约对齐、发布解耦**：错误 kind、flag 推导、body schema 语义与 oed-cli 一致，靠 fixtures/golden 测试守住，而非代码共享。
4. **零运行时依赖**：只用 Node 内建 `fetch`/`crypto`/`node:test`。

## 2. 运行时模型

```
DSH Host 进程
└─ Host 插件 (oed-dsh, apply(ctx, config))
   ├─ 适配层 index.js           —— 用 defineTool / schemastery 注册工具（唯一 DSH 触点）
   │    └─ oed_services / oed_operation_schema / oed_invoke
   └─ core (纯 JS)
        ├─ discovery.js   ← feed 拉取 + 缓存
        ├─ http.js        ← fetch 包装 + WAF 头 + base_url 解析/校验
        ├─ operations.js  ← OpenAPI → 操作表 + flag/body schema
        ├─ invoke.js      ← 拼 URL、发请求、封 JSON 信封、错误映射
        └─ errors.js      ← ErrorKind 定义 + toToolError()
                          → HTTPS → openEuler Infra API 网关
```

## 3. 仓库结构（计划）

```
oed-dsh/
├── package.json              # name/version/type=module; dsh.bundle.patch; engines.dsh;
│                             # exports: ./locale/*.json, ./icon; files; scripts; devDeps(lint/test)
├── cordis.patch.yml          # - insert: id: oed-dsh / name: <package>
├── index.js                  # 适配层（薄）：export Config + apply(ctx, config)
├── src/
│   ├── core/                 # 纯 JS，无 @deepseek-ai/* 依赖
│   │   ├── discovery.js
│   │   ├── http.js
│   │   ├── operations.js
│   │   ├── invoke.js
│   │   └── errors.js
│   ├── tools/                # 工具 handler + JSON Schema（纯对象，可离线单测）
│   │   ├── services.js
│   │   ├── operation-schema.js
│   │   └── invoke.js
│   └── config.js             # 配置 schema（纯对象）+ 默认值 + 校验
├── test/
│   ├── unit/                 # node:test，离线
│   ├── contract/golden/      # 由 fixtures 生成的期望输出（与 oed-cli 对齐）
│   └── fixtures/             # discovery.json + specs/{cve,forum,search}.json（脱敏）
├── market/index.json         # DSH 市场索引（P2）
├── locale/{en.json,zh.json}
├── icon.svg
├── scripts/                  # release / market / fixtures-sync / mirror
├── docs/                     # README、ARCHITECTURE、CONTRIBUTING、CHANGELOG、SECURITY
└── .github/                  # 镜像侧 CI（lint/test/contract），主仓 CI 方案待定
```

## 4. 模块接口（关键签名）

```js
// discovery.js
async function getServices({ refresh } = {})          // -> [{ service_name, community, title, description }]
async function getSpec(serviceName, { refresh })      // -> OpenAPI 文档对象（带缓存）

// operations.js
function collectOperations(spec, { serviceName, baseUrl })  // -> { operations:[], byId:Map }
function describeOperation(spec, serviceName, operation)     // -> { method, path, url, parameters[], bodySchema, bodyRequiredFields, usage }

// invoke.js
async function invoke({ service, operation, params, body, dryRun, allowMutations })
  // -> { ok, status, url, method, service, operation, response }
  // throws OedError(kind, message, hint)

// errors.js
class OedError extends Error { kind; message; hint }
function toToolError(err)     // -> 供适配层抛给 DSH 的结构化错误
```

## 5. 数据流（一次 `oed_invoke`）

1. 校验入参（service/operation 非空；`allowMutations=false` 时仅 GET）。
2. `discovery.getSpec(service)`：命中缓存则用缓存，否则拉 feed + spec。
3. `operations.describeOperation(...)`：解析 operation → 校验 method、推导 flag/body。
4. `http` 组装 WAF 头，`invoke` 校验 base_url 为 https，构造请求（dryRun 只返回预览）。
5. 发起 `fetch`，读响应体（限长），封装 `{ok,status,url,response}`。
6. 异常统一 `OedError(kind,...)` → 适配层转工具错误（含 hint）。

## 6. 错误模型

| kind（对齐 oed-cli） | 语义 | 工具表现 |
|---|---|---|
| `service_not_found` | 服务不存在 | 工具报错 + hint 指向 `oed_services` |
| `method_not_found` | 操作不存在 | hint 指向 `oed_operation_schema` |
| `spec_missing` | 上游未发布 spec | 说明等待网关侧 |
| `network_error` / `waf_block` | 网络/WAF | 重试建议 + 缓存刷新建议 |
| `upstream_error` | 上游非 2xx | 带 status + 上游消息 |
| `insecure_base_url` | 缓存 base_url 非 https | 建议 `oed_services` 刷新/清缓存 |
| `mutation_blocked` | P0 写操作被拒 | 明确"只读模式，未开启写操作" |

## 7. 安全模型

- **默认只读**：`allowMutations=false` 时按只读策略判定（safe-method GET/HEAD/OPTIONS 放行；operationId 命中只读关键词且非写关键词的 POST 放行；显式 `readOnlyAllowlist` 放行；其余 fail-closed 抛 `mutation_blocked`）。实测 365 操作 → 257 只读 / 108 写；16 个 ambiguous 经人工核对均为写，故默认白名单保持为空（仅作逃生舱）。
- **审批**：P1 开启写操作后，写路径走 DSH `tools/pre-execute` 返回 `ask`，由用户审批。
- **凭据**：token 不进入日志/工具结果/错误文本；认证 P1 单独设计存储。
- **网络**：host 仅取 feed `base_url`，强制 https；不信任 spec 的 backend address。
- **响应限长**：`maxResponseChars`（默认值待定，如 64K），超出截断并注明。

## 8. 兼容性与版本

- **`engines.dsh`**：目标桌面版 `0.2.1-rc.2`；建议起始声明 `>=0.2.0 <0.3.0`，**需在真实桌面版验证 prerelease 语义**后再定（DSH 的匹配实现可能不同于 node-semver）。
- **Node**：目标 Node ≥20（`fetch`、`node:test`、`structuredClone`）。
- **契约**：fixtures 记录"与网关对齐日期"，README 标注。

## 9. 架构决策记录（ADR 摘要）

| # | 决策 | 理由 |
|---|---|---|
| ADR-1 | 单仓单包（core 放 `src/core`），暂不 monorepo | MVP 简化发布；需要 MCP 时再抽 `@openeuler/oed-core` |
| ADR-2 | 纯 ESM JS、零运行时依赖；Node 内建 fetch | 安装零摩擦、无供应链、无 build |
| ADR-3 | core 不 import DSH 包，`index.js` 薄适配 | npm 版 DSH 包陈旧；core 可离线测试、可复用 |
| ADR-4 | 3 个元工具（services/schema/invoke） | 365+ operation 不能穷举 |
| ADR-5 | 只读 MVP，写操作 P1 + 审批 guard | 安全默认，快速可交付 |
| ADR-6 | 缓存：内存 TTL 600s（P0），磁盘 P1 | 匹配 oed-cli 语义，降低网关压力 |
| ADR-7 | 错误 kind 对齐 oed-cli 契约 | 跨形态一致，用户/agent 心智一致 |
| ADR-8 | 主仓 AtomGit，GitHub 镜像（官方化后） | openEuler 治理要求 + DSH 生态曝光 |
| ADR-9 | 市场索引 URL 用非个人稳定地址（官方化后定） | 避免迁移后 URL 失效 |
| ADR-10 | fixtures/golden 契约对齐（跨语言 golden JSON） | 以网关契约防漂移，不共享代码 |
| ADR-11 | 只读策略：safe-method + 只读关键词 + 显式白名单，fail-closed | 网关用 POST 做查询，不能按 HTTP method 一刀切 |
| ADR-12 | HTTP 瞬态失败重试（退避）+ 超时；区分可重试/不可重试错误 | 冷启动与瞬时网络抖动下提升可用性 |
