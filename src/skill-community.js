/**
 * Non-CVE community services skill (pure data): encapsulates the quirks and
 * common task table for forum / search / meeting / software, mirroring
 * oed-cli's quirks.md / scenarios.md.
 */
export const skill = {
  name: "oed-community",
  source: "oed-dsh",
  description:
    "Non-CVE openEuler community service details (SIG doc search, meetings, forums, packages, doc search): forum managed headers, search body shape, meeting/software operations and response paths. openEuler 非 CVE 社区服务细节（SIG 搜索、例会、论坛、软件包、文档搜索）：forum 托管头、search body 形状、meeting/software 操作与响应路径。",
  whenToUse:
    "Tasks touching SIG doc search, meetings, forums, package lookup, or doc search (non-CVE openEuler community services). 涉及 SIG 文档搜索、例会、论坛、软件包查询、文档搜索等非 CVE 服务的任务。",
  content: `# 非 CVE 社区服务（oed-community）

用 \`oed_services\` / \`oed_operation_schema\` / \`oed_invoke\` 调用非 CVE 社区服务。下面是关键 quirks 与常见任务对照。

## 硬规则（quirks）

- **forum 托管头**：\`Api-Key\` / \`Api-Username\` 由网关自动注入（占位 \`oed-placeholder\`），**不要手传**——手传报 \`gateway_managed_param\`。schema 里标 required 是 spec-only，忽略；dry-run 里看到 \`Api-Key: oed-placeholder\` 是自动填充，不是要你填。
- **search body 顶层**：search 的 POST body 字段是**顶层**，不要额外包一层容器。
- **服务名精确**：用 \`oed_services\` 返回的精确 service_name（如 pkgcontrib / eur / easysoftware），不要猜，猜错报 \`service_not_found\`。
- **只读为主**：写操作（发帖等）仍需 allowMutations + 登录 + 写前审批。

## 常见任务对照

| 需求 | 工具调用 | 响应路径 |
|---|---|---|
| 找 SIG 组 / 搜 SIG 文档 | \`search.searchSigByKeyword\`，body: {keyword, keywordType, pageNum, pageSize} | \`.response\` |
| 看某天例会 | \`meeting.listMeetings\`，params: {date} | \`.response.data[]\`（topic/group_name/start/end/join_url） |
| 论坛最新帖 | \`forum.listLatestTopics\`，params: {perPage} | \`.response.topic_list.topics[]\`（title/posts_count） |
| 文档 / 包关键词搜索 | \`search.multisearchDocByKeyword\`，body: {keyword, lang, page, pageSize} | \`.response.obj.records[]\`（title/path/type） |
| 查软件包 | \`easysoftware\` / \`pkgcontrib\` / \`eur\` 的查询类操作 | \`.response\` |

## 排错

- 报 \`gateway_managed_param\` → 你手传了 forum 的 Api-Key / Api-Username，删掉它们；
- 报 \`service_not_found\` / \`method_not_found\` → 先 \`oed_services\` 再 \`oed_operation_schema\` 拿精确名字；
- 拿不准 body / params → 先 \`oed_operation_schema\` 看 body_schema / 参数。`,
};
