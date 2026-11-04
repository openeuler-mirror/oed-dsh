# community services 需求分析

> 状态：草案（待评审） · 关联 issue：[#6](https://atomgit.com/openeuler/oed-dsh/issues/6) · 依赖：oed-dsh 路由 skill

## 1. 背景与问题

forum / search / meeting / software / easysearch / mailman 等非 CVE 社区服务，目前只能靠通用 `oed_invoke` 硬调，没有专门 skill 封装 quirks。agent 只能现场猜参数/body 形状，容易踩坑：

- forum 的 `Api-Key` / `Api-Username` 是网关自动注入的，手传会报 `gateway_managed_param`；
- search 的 body 字段是顶层、不是嵌套；
- 各服务响应路径（`.response.data[]` / `.response.topic_list.topics[]` / `.response.obj.records[]`）不一致。

这是相对 oed-cli 最大的功能缺口——oed-cli 有 `quirks.md` / `scenarios.md` 封装这些经验。

## 2. 目标 / 非目标

### 目标

- **G1** 用一个 `oed-community` skill 封装非 CVE 高频服务的 quirks 与常见任务对照。
- **G2** agent 能靠 skill 正确调用（不手传 forum 托管头、search body 形状正确、知道响应路径）。
- **G3** 只读为主；写操作仍走 `allowMutations` + 认证 + 审批。

### 非目标

- 不改 `oed_invoke` / `oed_operation_schema` 的通用调用机制。
- 不做 CVE 相关（已有 cve-triage / repair / review）。

## 3. 功能需求

| ID | 需求 | 说明 |
|---|---|---|
| FR-1 | forum 托管头 | 明确 `Api-Key` / `Api-Username` 由网关注入、**不要手传**；schema 标 required 是 spec-only，忽略。 |
| FR-2 | search body 形状 | `searchSigByKeyword` 的 body 字段是顶层（keyword/keywordType/pageNum/pageSize）；其它 body 操作读 schema。 |
| FR-3 | meeting / software 对照 | 常见操作（listMeetings / 软件包查询）+ 响应路径。 |
| FR-4 | 服务名精确 | 用 `oed_services` 拿的精确 service_name，不猜。 |

## 4. 验收标准

- 加载 `oed-community` 后，agent 能正确调用 forum / search / meeting / software 的常见操作；
- 不手传 forum 托管头；search body 字段形状正确；
- 只读为主，写操作仍走审批。
