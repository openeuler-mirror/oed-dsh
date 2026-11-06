# 配置校验需求分析

> 状态：草案（待评审） · 关联 issue：[#9](https://atomgit.com/openeuler/oed-dsh/issues/9)

## 1. 背景与问题

用户在配置页填了 AtomGit 令牌后，没有「测试令牌是否有效」的能力，填错要等到写操作失败才知道。

## 2. 目标 / 非目标

### 目标

- **G1** 能验证 AtomGit 令牌是否有效（真实 API 校验）。
- **G2** 校验不泄露令牌（只报结果 + 登录名）。

### 非目标

- 不在 client.js 配置卡片加「测试连接」按钮（浏览器跨域 CORS 风险，先走 Node 侧工具）。

## 3. 功能需求

| ID | 需求 |
|---|---|
| FR-1 | `oed_diagnose` 对已配置的 AtomGit 令牌做一次真实 `GET /user` 校验 |
| FR-2 | 返回 `atomgitTokenValid`（true/false/null）+ `atomgitTokenUser`（有效时登录名） |
| FR-3 | 401/403 → 判无效并提示重新填；网络错误 → 判 unknown，不误报 |

## 4. 验收标准

- 有效令牌 → `atomgitTokenValid: true` + 登录名；
- 无效令牌 → `atomgitTokenValid: false`；
- 全程不泄露令牌值。
