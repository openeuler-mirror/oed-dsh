# feedback 设计

> 状态：草案（待评审） · 关联 issue：[#8](https://atomgit.com/openeuler/oed-dsh/issues/8)

## 1. 交付形态

- **工具** `oed_diagnose`：只读诊断，返回诊断报告。
- **工具** `oed_report_issue`：创建 bug / feature issue（附诊断），写操作。
- **核心**：`src/core/atomgit.js` 补 `createIssue`（复用现有 `requestJson` + `requireAtomgitToken`）。

## 2. 诊断报告结构（oed_diagnose）

```
{
  pluginVersion,          // package.json version
  loggedIn,               // auth.json 是否有 access_token
  tokenFingerprint,       // 登录 token 指纹（脱敏）
  atomgitTokenConfigured, // 是否配了 AtomGit 令牌（只报布尔）
  gateway,                // 网关 URL
  config: { riskAutoApprove, localVerify, allowMutations }
}
```

## 3. 提 issue 流程（oed_report_issue）

```
用户说「发现 bug …」
  → oed_diagnose 收集诊断
  → oed_report_issue(type, title, body) 起草 issue（附诊断报告）
  → ask_user_question 弹确认
  → 确认后 createIssue(owner=openeuler, repo=oed-dsh, title, body)
```

## 4. ADR

| # | 决策 |
|---|---|
| ADR-43 | 反馈闭环由 `oed_diagnose`（只读诊断）+ `oed_report_issue`（写操作，附诊断）组成；诊断只报敏感信息的布尔/指纹，不泄露 token |

## 5. 风险

- 诊断信息可能过时（读的是当前运行时快照）→ 报告里标注「当前会话快照」。
- 提 issue 滥用（误报/刷）→ 写操作 + 确认兜底；issue 模板引导用户填有效信息。
