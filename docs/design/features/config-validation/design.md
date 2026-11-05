# 配置校验设计

> 状态：草案（待评审） · 关联 issue：[#9](https://atomgit.com/openeuler/oed-dsh/issues/9)

## 1. 交付形态

- **增强 `oed_diagnose`**：对已配置的 AtomGit 令牌做真实 `GET /user` 校验（复用 `src/core/atomgit.js` 的 `currentUser`）。
- **更新 `oed-help` skill**：提一句「用 `oed_diagnose` 测试令牌是否有效」。

## 2. 诊断报告增量

```
atomgitTokenConfigured: boolean   // 是否配置（原字段）
atomgitTokenValid: true/false/null  // 新增：true=有效，false=无效(401/403)，null=未配置/未校验/网络未知
atomgitTokenUser: string|null      // 新增：有效时的登录名
```

## 3. ADR

| # | 决策 |
|---|---|
| ADR-44 | AtomGit 令牌校验走 `oed_diagnose`（Node 侧，避开浏览器 CORS），不搞 client.js「测试连接」按钮 |

## 4. 风险

- 诊断变网络依赖 → 校验放 try/catch，401/403 判无效，网络错误判 null，不阻塞诊断结果。
