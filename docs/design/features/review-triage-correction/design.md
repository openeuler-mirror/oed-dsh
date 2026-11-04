# review triage 修正 设计

> 状态：草案（待评审） · 关联 issue：[#4](https://atomgit.com/openeuler/oed-dsh/issues/4) · 依赖：cve-review / cve-triage

## 1. 交付形态

- **主要**：改 `cve-review` skill 的工作流，加一条「triage 修正」步骤。
- **可选**：`cve_review_pr` 输出加一个 `triageDiscrepancy` 布尔，让「发现差异」变成显式信号（而非靠 agent 自行推断）。
- **复用**：`cve_triage_comment`（渲染 5 模块评论）+ `cve_post_comment`（发布）。

## 2. 数据流

```
cve_pr_get → 受影响性复核（第 0 项）
  → 发现 issue triage 结论有误（如 issue 判「受影响」但实际不受影响）
  → 输出 not-affected（拒绝 PR）
  → 用 cve_triage_comment 起草修正评论（5 模块）
  → 展示草稿 → 用户确认 → cve_post_comment 发布到对应 issue
```

## 3. 修正评论内容来源

- 分支状态 / 原因说明：以受影响性复核的结果为准（Debian tracker 的 Introduced by / Fixed by）；
- impact / score / vector：可沿用 issue 原值，或按复核结果更新；
- 复用 `validateBranches` 校验「状态 ↔ 原因词表」匹配。

## 4. ADR

| # | 决策 |
|---|---|
| ADR-39 | review 发现 triage 结论有误时，除输出 not-affected 外，联动起草修正评论（复用 cve_triage_comment 5 模块格式），人审后经 cve_post_comment 发布 |

## 5. 风险

- 修正评论与 issue 原文冲突时，需保留原始结论可追溯性 → 修正评论里注明「复核依据：Debian tracker Introduced by / Fixed by」。
- 误报差异（复核本身有误）→ 发布前的人审兜底。
