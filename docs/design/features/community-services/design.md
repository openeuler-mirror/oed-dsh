# community services 设计

> 状态：草案（待评审） · 关联 issue：[#6](https://atomgit.com/openeuler/oed-dsh/issues/6) · 依赖：oed-dsh 路由 skill

## 1. 交付形态

- **新 skill** `oed-community`：非 CVE 社区服务的 quirks + 常见任务对照。
- **路由 skill 改动**：`oed-dsh`（src/skill.js）加一句「非 CVE 社区服务细节见 oed-community skill」的指针。
- **复用**：`oed_services` / `oed_operation_schema` / `oed_invoke`（不新增工具）。

## 2. skill 内容结构

```
# 非 CVE 社区服务（oed-community）

## 硬规则（quirks）
- forum：Api-Key / Api-Username 由网关注入，不要手传（传了 gateway_managed_param）
- search：body 字段顶层，不嵌套
- 服务名用 oed_services 的精确值，不猜

## 常见任务对照
| 需求 | 调用 | 响应路径 |
| SIG 文档搜索 | search.searchSigByKeyword，body {keyword,keywordType,pageNum,pageSize} | .response |
| 看例会 | meeting.listMeetings，params {date} | .response.data[] |
| 论坛最新帖 | forum.listLatestTopics，params {perPage} | .response.topic_list.topics[] |
| 文档/包搜索 | search.multisearchDocByKeyword，body {keyword,lang,page,pageSize} | .response.obj.records[] |
| 软件包 | easysoftware / pkgcontrib / eur 查询类 | .response |
```

## 3. ADR

| # | 决策 |
|---|---|
| ADR-41 | 非 CVE 社区服务用一个 `oed-community` skill 封装 quirks + 常见任务对照，不逐个服务拆小 skill；quirk 以 oed-cli `quirks.md` 为权威来源 |

## 4. 风险

- quirk 可能随网关变化 → 以 oed-cli `quirks.md` / `scenarios.md` 为权威来源，真机调用时用 `oed_operation_schema` 复核 body/params。
- 路由 skill 与 community skill 内容可能重叠 → 路由 skill 只留粗粒度指针，细节都在 community skill。
