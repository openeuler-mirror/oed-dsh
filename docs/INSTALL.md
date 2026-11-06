# 安装与启用

## 安装（推荐：Git 地址）

无需 clone 到本地、无需发布 npm：

DSH → **Plugins → 添加插件 → Git 地址**，粘贴：

```
https://atomgit.com/openeuler/oed-dsh.git
```

安装完成后点 **Enable now**，**重启 DSH** 即可（见下文「启用」）。

## 其它安装方式

### 本地目录（开发 / 调试）

```bash
git clone https://atomgit.com/openeuler/oed-dsh.git
```

DSH → **Plugins → 添加插件 → 本地目录**，选中 `oed-dsh` 目录。

### npm 包（发布后）

命令行（推荐）：

```bash
dsh plugin --profile web add oed-dsh
```

（默认装最新版；要锁版本可写 `oed-dsh@<版本>`。）

或 DSH → **Plugins → 添加插件 → 包名**，输入 `oed-dsh`。

## 启用

1. 安装完成后点 **Enable now**（或进 bundle 详情页打开开关）。
2. **重启 DSH 桌面应用**：本地目录 / 源码变更后必须重启进程，才会加载新的 JS 模块（刷新页面无效）。
3. 新会话即生效，工具和 skill 自动出现。

## 配置

在 Plugins 页 → **openEuler Infra** 的配置页，有四个字段：

- **AtomGit 令牌**：写操作（发评论 / fork 推送修复代码 / 提 PR / 发 review）需要；留空则只读功能照常可用，写操作报 `atomgit_token_missing`。PAT 创建：<https://atomgit.com/setting/token-classic/create>（勾选仓库写权限）。也可设环境变量 `ATOMGIT_TOKEN=<PAT>`。
- **风险自动处理**（`riskAutoApprove`）：`never`（默认，中高风险都停下询问）/ `medium` / `high`。
- **本地预检**（`localVerify`）：`lightweight`（默认）/ `none` / `docker`。
- **允许写操作**（`allowMutations`）：网关写操作（EulerMaker 提交、pkgcontrib 提交、forum 发帖等）的开关；开启后还需 oneid 登录 + 写前审批，关闭时写操作报 `mutation_blocked`。

### 环境变量（CI / 无界面场景）

与 oed-cli 兼容，已登录 oed-cli 的用户可直接复用凭据：

| 变量            | 作用                                                           |
| --------------- | -------------------------------------------------------------- |
| `ATOMGIT_TOKEN` | AtomGit 个人令牌，等价于配置页的「AtomGit 令牌」               |
| `OED_TOKEN`     | openEuler oneid access token，设了它就跳过 `oed_login`         |
| `OED_APP_ID`    | 自定义 oneid OAuth 应用标识；默认用内置的 openEuler Infra 应用 |
| `OED_CACHE_DIR` | oneid 凭据（`auth.json`）的存储目录                            |

## 快速验证

新会话直接问（不用 @）：

1. 「列出 openEuler 服务」→ 返回 13 个服务；
2. 「分析 https://atomgit.com/src-openeuler/ffmpeg/issues/267 并生成影响性分析评论」→ 走 `cve-triage`，读 issue + 读分支版本 → 出 cve-manager 格式草稿；
3. 「审查 https://atomgit.com/src-openeuler/postgresql-17/pulls/32」→ 走 `cve-review`，做范围门禁 + 清单判定。

## 验收清单

| #   | 检查项                | 通过标准                                                                                                                                                                                                                                                                                            |
| --- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 插件出现在 Plugins 页 | 卡片显示 **openEuler Infra**（中英文描述 + openEuler 纵向 logo）                                                                                                                                                                                                                                    |
| 2   | 工具已注册            | agent 可用 13 个工具（`oed_*` 3 个 + `cve_issue` / `cve_package_version` / `cve_triage_comment` / `cve_post_comment` / `cve_fix_prepare` / `cve_open_pr` / `cve_build` / `cve_pr_get` / `cve_review_pr` / `cve_post_review`）+ 4 个 skill（`oed-dsh` / `cve-triage` / `cve-repair` / `cve-review`） |
| 3   | 服务发现              | 「列出 openEuler 服务」→ 13 个服务                                                                                                                                                                                                                                                                  |
| 4   | 只读查询              | 「查 CVE-2019-10082 公告」→ `oed_invoke` 200，含 `openEuler-20.03-LTS` / `httpd`                                                                                                                                                                                                                    |
| 5   | CVE 分析              | 「分析 ffmpeg#267 并生成评论」→ 读 issue + 读各分支 spec 版本 → 出 cve-manager 格式草稿                                                                                                                                                                                                             |
| 6   | CVE 修复              | 「修复 <CVE issue>」→ `cve_fix_prepare` 出升级/backport 草稿 + 风险报告                                                                                                                                                                                                                             |
| 7   | CVE 审查              | 「审查 <PR 链接>」→ `cve_pr_get` 范围门禁 + `cve_review_pr` 出 verdict                                                                                                                                                                                                                              |
| 8   | 发评论                | 配好 token 后，确认草稿 → `cve_post_comment` 发布成功并返回评论 id                                                                                                                                                                                                                                  |
| 9   | 只读拦截              | 「用 forum 发帖」→ `mutation_blocked`                                                                                                                                                                                                                                                               |
| 10  | 零 CLI                | 全程不装 Python/oed-cli，不手写 curl                                                                                                                                                                                                                                                                |
| 11  | `engines.dsh`         | 安装无版本不兼容（桌面 `0.2.1-rc.2` 满足 `>=0.2.0 <0.3.0`）                                                                                                                                                                                                                                         |

## 失败排查

- **工具 / skill 没出现**：确认 bundle 已启用；本地目录变更后要**重启 DSH**。
- **版本不兼容**：Plugins 页查看 incompatibility，核对 `engines.dsh`。
- **工具报错 `[oed] <kind>`**：对照 `src/core` 的 kind（`service_not_found` / `mutation_blocked` / `network_error` / `atomgit_token_missing` …）。
- **配置页提示「该插件当前未加载」**：确认 Config 的可编辑字段已标 `.volatile()`（DSH ≥0.1.7 只把 Volatile 字段派生进配置表单），且枚举用 `z.union([z.const(...)])` 渲染成下拉框。
