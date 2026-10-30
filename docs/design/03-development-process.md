# 开发流程与仓库规范

> 状态：草案（待评审） · 版本 0.1

## 1. 分支模型

- **主分支 `master`**（与 openEuler/oed-cli 一致），受保护，禁止直接 push。
- **短生命周期特性分支**：`feat/<desc>`、`fix/<desc>`、`docs/<desc>`、`chore/<desc>`；合并走 PR，rebase 或 squash 视 SIG 约定。
- PR 通过后由维护者合并；`master` 上的每个合并都应有对应版本/变更记录。

## 2. 提交规范

> 落地规范以 [CONTRIBUTING.md](../../CONTRIBUTING.md) 为准，并由 `commitlint`（`npm run commitlint` / `commitlint.config.js`）校验。

- **Conventional Commits**：`<type>(<scope>): <subject>`，type ∈ `feat|fix|docs|refactor|test|chore|build|ci|perf|revert`。
- subject 用祈使句、小写开头、≤72 字符；正文说明动机与影响面，每行 ≤100 字符。
- 关联 issue 用 `Closes #N` / `Fixes #N`。
- 按 openEuler 要求补签名（CLA / DCO，以 SIG 为准）。

## 3. 版本与变更日志

- **SemVer**：`MAJOR.MINOR.PATCH`；P0 从 `0.1.0` 起步。
- **Changelog**：Keep a Changelog 格式，`Added/Changed/Fixed/Removed/Security`。
- 发版 = 更新 Changelog → 打 tag `vX.Y.Z` → npm publish → 更新市场索引 →（镜像同步）。

## 4. 评审与模板

- PR 模板：改动摘要、关联 issue、测试/验证结果、影响面、changelog 条目、兼容性说明。
- Issue 模板：Bug（复现步骤/期望/实际/环境）与 Feature（动机/方案/验收标准）。
- 评审门槛：至少 1 名维护者 approve；CI 全绿；文档同步。

## 5. 质量门禁（本地 + CI 一致）

```bash
npm run lint        # ESLint（flat）+ Prettier check
npm test            # node --test：unit + contract（离线，不联网）
npm run test:unit
npm run test:contract
npm run ci          # lint + test（镜像侧 GitHub Actions / 主仓 CI 同跑）
```

- 目标：核心路径单测覆盖；契约 golden 与 oed-cli fixtures 对齐。
- 集成/冒烟（联网、真实网关）为**手动脚本** `npm run smoke`，不进常规 CI。

## 6. 文档规范

| 文件 | 职责 |
|---|---|
| `README.md` | 定位、特性、安装（DSH 两步）、快速示例、链接 |
| `docs/ARCHITECTURE.md` | 架构导览（指向 design/02） |
| `docs/design/*` | 需求/架构/流程/ADR |
| `CONTRIBUTING.md` | 贡献流程、本地开发、测试、提交规范 |
| `CHANGELOG.md` | 版本变更 |
| `SECURITY.md` | 安全边界（只读默认、凭据、上报渠道） |
| `CODE_OF_CONDUCT.md` | 社区行为准则 |
| `LICENSE` | Apache-2.0 |

## 7. 发布流程（checklist）

1. `npm run ci` 全绿；changelog 更新；版本号提升。
2. 打 tag → 触发发布（npm publish + provenance）。
3. 更新 `market/index.json`（版本、`engines.dsh`、发布时间）。
4. 同步 GitHub 镜像（tags 与市场索引）。
5. 在 openEuler 文档/社区渠道发布说明。

## 8. 治理

- 归属：openEuler oed-cli 所属 SIG（后续迁 `openEuler/oed-dsh`）。
- 主仓 AtomGit 为唯一事实源；GitHub 镜像只读（issue/PR 指向 AtomGit）。
- 维护者清单（CODEOWNERS）随 SIG 确认后落定。

## 9. 仓库文件清单（目标态）

```
.editorconfig  .gitignore  .gitattributes  LICENSE
package.json  pnpm-lock.yaml  cordis.patch.yml
index.js  src/core/*  src/tools/*  src/config.js
test/unit/*  test/contract/golden/*  test/fixtures/*
market/index.json  scripts/*  locale/{en,zh}.json  icon.svg
.github/workflows/ci.yml  .github/PULL_REQUEST_TEMPLATE.md
.github/ISSUE_TEMPLATE/{bug,feature}.yml
README.md  CONTRIBUTING.md  CHANGELOG.md  SECURITY.md  CODE_OF_CONDUCT.md
docs/ARCHITECTURE.md  docs/design/*
```

## 10. 阶段计划（以终为始）

| 阶段 | 交付物 | 门槛 |
|---|---|---|
| **P0** | 骨架 + core + 3 工具 + fixtures 单测 + 本地目录可装 | 验收标准（见 01 §7）全满足 |
| **P1** | 认证(device flow/OED_TOKEN 兼容) + 写操作审批 + 磁盘缓存 | 真实写操作可安全启用 |
| **P2** | MCP server + UI 面板（可选）+ 市场索引上架 | 跨 harness 复用 |
| **P3** | 迁 openEuler org + 官方镜像 + 生态收录 | SIG 治理落地 |
