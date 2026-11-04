# review triage 修正 需求分析

> 状态：草案（待评审） · 关联 issue：[#4](https://atomgit.com/openeuler/oed-dsh/issues/4) · 依赖：cve-review / cve-triage

## 1. 背景与问题

`cve-review` 第 0 项「受影响性复核」用 Debian security-tracker 交叉验证时，可能发现 cve-manager 机器人在 issue 里留下的 triage 结论有误（如误判受影响/不受影响、或原因说明与状态不匹配）。当前只输出 `not-affected` 拒绝 PR，**没有联动修正 issue 结论**，错误结论会一直留在 issue 里误导后续处理。

## 2. 目标 / 非目标

### 目标

- **G1** review 发现 triage 结论有误时，能产出一条符合 cve-manager 规范的修正评论草稿。
- **G2** 复用 `cve_triage_comment` 的 5 模块格式，保证可被 cve-manager 解析。
- **G3** 发布前经用户确认（`cve_post_comment` 写操作）。

### 非目标

- 不自动发布（写操作仍需人审）。
- 不改变 `cve_review_pr` 的 verdict 判定本身。

## 3. 功能需求

| ID | 需求 | 说明 |
|---|---|---|
| FR-1 | 差异检测 | review 第 0 项「受影响性复核」结果与 issue triage 结论不一致时，标记为「triage 需修正」。 |
| FR-2 | 修正评论草稿 | 用 `cve_triage_comment` 的 5 模块格式（impact/score/vector/branches/原因说明）起草修正评论。 |
| FR-3 | 人审发布 | 草稿展示给用户确认后，经 `cve_post_comment` 发布到对应 issue。 |

## 4. 验收标准

- review 判 `not-affected` 且发现 triage 结论有误时，能产出修正评论草稿；
- 草稿符合 cve-manager 5 模块格式、可被解析；
- 发布前需用户确认，未确认不发布。
