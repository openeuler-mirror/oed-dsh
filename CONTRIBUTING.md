# Contributing

感谢贡献。本文是 oed-dsh 的开发规范：提交信息、分支、PR、Issue，以及「需求 → 设计 → 实现 → 验收」的流程。

## 提交信息（Commit Message）

遵循 [Conventional Commits](https://www.conventionalcommits.org/)，格式：

```
<type>(<scope>): <subject>

<body：说明为什么 / 影响面>

<footer：如 Closes #12>
```

### type

| type       | 用途                     |
| ---------- | ------------------------ |
| `feat`     | 新功能                   |
| `fix`      | 缺陷修复                 |
| `docs`     | 文档                     |
| `refactor` | 重构（不改行为）         |
| `test`     | 测试                     |
| `chore`    | 杂项（构建、依赖、脚本） |
| `build`    | 构建系统 / 打包          |
| `ci`       | CI 配置                  |
| `perf`     | 性能                     |
| `revert`   | 回滚                     |

### scope（可选）

`core` · `tools` · `cve-triage` · `ui` · `docs` · `ci` · `release` · `deps`。无合适 scope 可省略。

### 规则

- `subject` 用祈使句、小写开头、**不超过 72 字符**、不以句号结尾；
- `body` 说明「为什么」而非「做了什么」，每行不超过 100 字符；
- 涉及用户可见行为或关闭 issue 时，用 `Closes #N` / `Fixes #N` 关联；
- 一个 commit 只做一件事；
- 提交前执行 `npm run commitlint` 校验最近一条提交。

### 示例

```
# 好
feat(cve-triage): post comments directly to AtomGit

The cve-manager comment must not route through the openEuler gateway; post
it to AtomGit's own API with an AtomGit PAT instead.
```

```
# 不好
feat: 增加了一个新功能用于发评论（update comment）—— 冗长、无 scope、非祈使句
```

## 分支命名

- `feat/<name>` · `fix/<name>` · `docs/<name>` · `refactor/<name>` · `chore/<name>`
- 分支短生命周期；合并后删除。

## Pull Request

- 标题使用与提交一致的格式：`type(scope): subject`；
- 使用 PR 模板，关联相关 issue；
- 说明改动动机、验证结果（`npm run ci`）、影响面；
- 至少一名维护者 approve 后 **squash 合并**到 `master`。

## Issue

- **Bug**：用 Bug 模板，给出复现步骤、期望/实际、环境。
- **需求（Feature request）**：用需求模板，写清动机、方案、验收标准，并关联后续的设计文档。

## 需求 → 设计 → 实现 → 验收

1. **需求**：提「需求」issue（feature 模板），明确目标 / 非目标 / 验收标准。
2. **设计**：在 `docs/design/features/<name>/` 下补齐：
   - `requirements.md` —— 需求分析（FR / NFR / 验收标准）；
   - `design.md` —— 架构与数据流、关键决策（ADR）。
3. **实现**：按分支/提交规范分步实现；每个 commit 保持 `npm run ci` 全绿。
4. **验收**：对照 `requirements.md` 的验收标准，用真实数据验证，并更新 `CHANGELOG.md`。

> 参考范例：`docs/design/features/cve-triage/`。

## 本地开发

```bash
npm install
npm run ci          # lint + format + 单测 + 契约测试
npm run commitlint  # 校验最近一条提交信息
npm run smoke       # 联网冒烟（真实网关）
npm run classify    # 重新生成只读策略分类报告
```

## 行为准则与许可

- 请遵守 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。
- 所有贡献按 [Apache-2.0](LICENSE) 许可；按 openEuler 社区要求签署 CLA/DCO。
