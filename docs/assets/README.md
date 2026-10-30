# 截图资源（docs/assets）

README 里引用的截图都放在这个目录。当前是**占位图**，请按下面的清单替换成真实截图。

## 命名与规格

- 文件名保持**不变**，直接把同名文件覆盖成你的真实截图即可，README 无需改动。
- 建议宽高比 **16:9**（约 1280×720 或更大），保持清晰；聊天类截图可更“高”一些（如 1000×1200），但别太宽。
- 格式用 **PNG**（带文字/UI 的截图 PNG 更清晰，避免 JPG 压缩糊字）。

## 各槽位说明

| 文件             | 用途           | 建议截图内容                                                                          |
| ---------------- | -------------- | ------------------------------------------------------------------------------------- |
| `cve-triage.png` | CVE 影响性分析 | `cve_triage_comment` 输出的 5 模块评论（impact/score/vector/branches/结论）           |
| `cve-repair.png` | CVE 修复       | `cve_fix_prepare` 输出的 spec 改动草稿 + 风险报告（或提 PR 成功的结果）               |
| `cve-review.png` | CVE PR 审查    | `cve_review_pr` 输出的 review 结论（approve / request-changes / needs-human + 清单）  |
| `config.png`     | 配置页         | Plugins → openEuler Infra 配置页：AtomGit 令牌 / 风险自动处理 / 本地预检 / 允许写操作 |

## 替换步骤

1. 截好图（注意抹掉令牌等敏感信息）；
2. 保存为同名 PNG，覆盖本目录下对应文件；
3. `git add docs/assets/xxx.png` 提交即可。

> 提示：令牌是敏感信息，截图前务必把 AtomGit token / token 指纹打码或留空。
