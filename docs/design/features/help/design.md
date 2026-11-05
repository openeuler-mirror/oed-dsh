# help 设计

> 状态：草案（待评审） · 关联 issue：[#7](https://atomgit.com/openeuler/oed-dsh/issues/7)

## 1. 交付形态

- **新 skill** `oed-help`：纯数据 skill，内置安装 / 配置 / 常见问题排错。
- **复用**：不新增工具；内容与 README / INSTALL 保持一致。

## 2. skill 内容结构

```
# openEuler Infra 帮助（oed-help）

## 安装
npm / Git / 本地目录 三种方式

## 配置
4 个配置项 + 环境变量（ATOMGIT_TOKEN / OED_TOKEN / OED_APP_ID / OED_CACHE_DIR）

## 常见问题排错
- atomgit_token_missing → 配 AtomGit 令牌
- auth_required → 懒加载登录（点授权链接）
- mutation_blocked → 开 allowMutations
- web boot 失败 / import failed → 检查 client.js id 与包名一致
- network_error → 网关不可达，稍后重试

## 文档链接
README / INSTALL / 设计文档
```

## 3. ADR

| # | 决策 |
|---|---|
| ADR-42 | 插件自帮助用纯 skill（`oed-help`）承载，内嵌安装/配置/FAQ，不新增工具；内容与 README/INSTALL 对齐 |

## 4. 风险

- FAQ 与 README/INSTALL 内容可能漂移 → 以 README/INSTALL 为权威，skill 里只放精炼要点 + 链接。
