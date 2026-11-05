# feedback 需求分析

> 状态：草案（待评审） · 关联 issue：[#8](https://atomgit.com/openeuler/oed-dsh/issues/8)

## 1. 背景与问题

发现问题 / bug 时，用户没有方便的反馈渠道：没有诊断工具，也没办法引导用户提 issue。

## 2. 目标 / 非目标

### 目标

- **G1** `oed_diagnose`：只读检查登录状态 / token 配置 / 网关连通性 / 版本，生成诊断报告。
- **G2** `oed_report_issue`：引导用户提 bug / feature issue 到 openeuler/oed-dsh，自动附诊断信息。
- **G3** 提 issue 是写操作，需 token + 用户确认。

### 非目标

- 不做埋点 / 统计。
- 不做自动修复。

## 3. 功能需求

| ID | 需求 |
|---|---|
| FR-1 | 诊断报告：登录状态、token 是否配置、网关连通性、插件版本、配置项汇总 |
| FR-2 | 诊断不泄露敏感信息（token 只报是否配置，不报值） |
| FR-3 | 提 issue：收集标题/描述 → `ask_user_question` 确认 → 创建 issue（附诊断） |
| FR-4 | 支持 bug / feature 两种类型 |

## 4. 验收标准

- `oed_diagnose` 生成诊断报告；
- `oed_report_issue` 确认后创建 issue（附诊断信息）；
- token 不泄露；提 issue 需确认。
