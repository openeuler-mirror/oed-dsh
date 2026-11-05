# help 需求分析

> 状态：草案（待评审） · 关联 issue：[#7](https://atomgit.com/openeuler/oed-dsh/issues/7)

## 1. 背景与问题

用户常在 DSH 里直接问插件相关的问题（怎么装、怎么配、报错怎么办），但 README / INSTALL 是给人看的，agent 看不到、答不上来。

## 2. 目标 / 非目标

### 目标

- **G1** 一个 `oed-help` skill 内置安装 / 配置 / 常见问题排错，让 agent 直接回答插件相关问题。
- **G2** FAQ 覆盖常见问题（配置、登录、写操作、安装）。

### 非目标

- 不新增工具（纯 skill）。
- 不做动态诊断（那是 feedback 的能力）。

## 3. 功能需求

| ID | 需求 |
|---|---|
| FR-1 | 安装方式说明（npm / Git / 本地目录） |
| FR-2 | 配置项说明（4 项 + 环境变量） |
| FR-3 | 常见问题排错（token 缺失、登录失败、写操作被拦、web boot 失败） |
| FR-4 | 指向 README / INSTALL 的链接 |

## 4. 验收标准

- 用户问「怎么配 / 怎么装 / 报错怎么办」时，agent 能加载 oed-help 并回答；
- FAQ 覆盖常见问题。
