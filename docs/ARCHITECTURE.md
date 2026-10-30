# Architecture

架构详情见 [docs/design/02-architecture.md](design/02-architecture.md)。

## 一句话

`oed-dsh` 是一个 DeepSeek Harness Host 插件：薄薄的 `index.js` 适配层把三个元工具注册给 DSH，所有网关访问逻辑在纯 JS 的 `src/core/**` 里，与 DSH 解耦、可离线单测、可复用于未来的 MCP server。

## 分层

| 层         | 目录            | 依赖                                                 | 可测性                   |
| ---------- | --------------- | ---------------------------------------------------- | ------------------------ |
| DSH 适配层 | `index.js`      | `@deepseek-ai/dsh-tools`、`@deepseek-ai/schemastery` | 安装后在 DSH 内验证      |
| 工具层     | `src/tools/**`  | 仅 `src/core`                                        | 逻辑薄，随 core 间接覆盖 |
| 核心层     | `src/core/**`   | 仅 Node 内建                                         | 完全离线单测             |
| 配置       | `src/config.js` | 仅 `src/core`                                        | 单测                     |

## 数据流

```
oed_services / oed_operation_schema / oed_invoke (工具)
        │
        ▼
src/core: discovery(缓存) → operations(schema 推导) → http(WAF 头/base_url 校验) → fetch
        │
        ▼
openEuler Infra API 网关 (apig.osinfra.cn)
```

## 传输路由（数据归属决定通道）

插件有两条数据通道，按**对象归属**选择（ADR-37）：

| 对象                                                                 | 通道                                               | 鉴权                                     |
| -------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------- |
| AtomGit 平台对象（repo/file/branch/fork/issue/PR/comment）           | 直连 `atomgit.com/api/v5`（`src/core/atomgit.js`） | AtomGit PAT（`?access_token=` 查询参数） |
| openEuler 社区后端（cve/软件包/SIG/会议/论坛/邮件/构建/CI/看板聚合） | Infra 网关（`src/core/invoke.js`）                 | oneid Bearer                             |

- `ag` 服务（网关里的 AtomGit 代理）与 `atomgit.js` 能力 100% 重叠且鉴权域冲突（网关带 oneid、AtomGit 要 PAT），在插件内 **deprecated**，AtomGit 操作统一走 `atomgit.js`。
- 口诀：「数据在 AtomGit 平台上 → 直连；数据在 openEuler 后端 → 网关。」
- 需要 oneid 统一登录/审计/限流的 openEuler 服务 → 走网关；AtomGit 只有 PAT 没有 oneid，故「统一 oneid」对 AtomGit 不成立 → 不经网关。
