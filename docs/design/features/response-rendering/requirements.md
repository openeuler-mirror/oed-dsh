# 工具结果渲染需求分析

> 状态：草案（待评审） · 关联 issue：[#12](https://atomgit.com/openeuler/oed-dsh/issues/12)

## 1. 背景与问题

工具返回原始 JSON，人看费劲；大响应已有 `maxResponseChars` 截断，但只给 `{truncated, preview}`，缺总大小与「下一步」提示，agent 无法告诉用户「还有多少、怎么拿更多」。

## 2. 目标 / 非目标

### 目标

- **G1** 大响应截断时给出完整信号：`truncated` + `totalChars` + `hint`。
- **G2** agent 能据此告知用户「响应过大已截断 + 怎么拿更多」。

### 非目标

- 不做 UI 级卡片/折叠/高亮（那是 DSH 客户端 / agent 的职责）。
- 不做分页自动翻页。

## 3. 功能需求

| ID | 需求 |
|---|---|
| FR-1 | 截断响应返回 `truncated: true` + `totalChars`（完整序列化长度）+ `hint` |
| FR-2 | `hint` 指向「分页参数 / 调高 maxResponseChars」 |

## 4. 验收标准

- 大响应截断时，agent 能拿到 `totalChars` + `hint`，可告知用户全貌；
- 不截断时行为不变。
